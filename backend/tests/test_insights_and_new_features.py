"""Tests for the 4 new features: insights endpoints, email_configured flag, og-cover, and non-blocking Resend."""
import os
import pytest
import requests

BASE_URL = None
with open('/app/frontend/.env') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL'):
            BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health / email_configured ---
def test_health_email_configured_false(client):
    r = client.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"
    assert "email_configured" in data
    assert data["email_configured"] is False


# --- Insights GET ---
def test_get_insights_seed(client):
    r = client.get(f"{API}/insights", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 6
    # verify shape
    for it in items:
        for k in ("id", "title", "excerpt", "category", "read_minutes", "published_at"):
            assert k in it, f"missing {k}"
        assert "_id" not in it
    # verify sorted desc by published_at
    dates = [it["published_at"] for it in items]
    assert dates == sorted(dates, reverse=True), "insights not sorted by published_at desc"


# --- Insights POST valid ---
def test_post_insight_valid(client):
    payload = {
        "title": "TEST_Insight from regression suite",
        "excerpt": "This is a sufficiently long excerpt for validation.",
        "category": "Power BI",
        "read_minutes": 4,
    }
    r = client.post(f"{API}/insights", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["title"] == payload["title"]
    assert data["category"] == payload["category"]
    assert "id" in data and "published_at" in data


# --- Insights POST invalid (min length checks) ---
@pytest.mark.parametrize("bad", [
    {"title": "short", "excerpt": "This is long enough excerpt yes.", "category": "Power BI"},  # title too short
    {"title": "Long enough title", "excerpt": "too short", "category": "Power BI"},  # excerpt too short
    {"title": "Long enough title", "excerpt": "This is long enough excerpt yes.", "category": "A"},  # category too short
])
def test_post_insight_invalid(client, bad):
    r = client.post(f"{API}/insights", json=bad, timeout=15)
    assert r.status_code == 422


# --- Regression: contact still 201 with no email configured ---
def test_contact_no_email_still_ok(client):
    payload = {
        "name": "TEST_Contact NoEmail",
        "email": "test_noemail@example.com",
        "phone": "+1 555 999 0000",
        "company": "TEST_Co",
        "message": "Verify contact endpoint still succeeds without Resend configured.",
    }
    r = client.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    assert r.json()["email"] == payload["email"]


# --- Regression: roi-estimate still 201 ---
def test_roi_still_ok(client):
    payload = {
        "name": "TEST_ROI NoEmail",
        "email": "test_roi_noemail@example.com",
        "company": "TEST_Corp",
        "industry": "automotive",
        "current_manpower": 12,
        "current_hours_per_week": 300,
        "current_tools": "Excel",
    }
    r = client.post(f"{API}/roi-estimate", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert "projected_manpower" in data


# --- OG cover image ---
def test_og_cover_png():
    url = f"{BASE_URL}/og-cover.png"
    r = requests.get(url, timeout=15)
    assert r.status_code == 200
    assert "image/png" in r.headers.get("content-type", "")
    assert len(r.content) > 30 * 1024, f"og-cover too small: {len(r.content)} bytes"

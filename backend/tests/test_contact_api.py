import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://enterprise-analytics-17.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_health(client):
    r = client.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"


def test_root(client):
    r = client.get(f"{API}/", timeout=15)
    assert r.status_code == 200


def test_post_contact_valid_and_get(client):
    payload = {
        "name": "TEST_Regression User",
        "email": "test_regression@example.com",
        "phone": "+1 555 234 5678",
        "company": "TEST_Co",
        "message": "This is a regression test message from backend suite."
    }
    r = client.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["email"] == payload["email"]
    assert data["name"] == payload["name"]
    assert "id" in data and "created_at" in data

    # verify via GET list
    r2 = client.get(f"{API}/contact", timeout=15)
    assert r2.status_code == 200
    items = r2.json()
    assert isinstance(items, list)
    assert any(it["id"] == data["id"] for it in items)


def test_post_contact_invalid(client):
    r = client.post(f"{API}/contact", json={
        "name": "a", "email": "not-an-email", "phone": "12",
        "company": "b", "message": "short"
    }, timeout=15)
    assert r.status_code == 422

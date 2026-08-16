import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')
# NOTE: REACT_APP_BACKEND_URL is not set in backend env; read from frontend .env
if 'REACT_APP_BACKEND_URL' not in os.environ:
    try:
        with open('/app/frontend/.env') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL'):
                    BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
    except FileNotFoundError:
        pass


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_health(api):
    r = api.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"


def test_roi_create_valid(api):
    payload = {
        "name": "TEST_John",
        "email": "test_john@example.com",
        "company": "TEST_Corp",
        "industry": "financial",
        "current_manpower": 10,
        "current_hours_per_week": 400,
        "current_tools": "Excel, Tableau",
    }
    r = api.post(f"{BASE_URL}/api/roi-estimate", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["money_savings_pct"] == 35
    assert data["manpower_reduction_pct"] == 55
    assert data["time_reduction_pct"] == 35
    assert data["projected_manpower"] == 4.5
    assert data["projected_hours_per_week"] == 260.0
    assert "id" in data and data["id"]
    assert "created_at" in data


@pytest.mark.parametrize("bad", [
    {},  # missing fields
    {"name": "TEST", "email": "not-an-email", "company": "TEST", "industry": "financial", "current_manpower": 10, "current_hours_per_week": 400, "current_tools": "x,y"},
    {"name": "TEST", "email": "a@b.com", "company": "TEST", "industry": "financial", "current_manpower": 0, "current_hours_per_week": 400, "current_tools": "x,y"},
])
def test_roi_create_invalid(api, bad):
    r = api.post(f"{BASE_URL}/api/roi-estimate", json=bad, timeout=15)
    assert r.status_code == 422


def test_roi_list(api):
    r = api.get(f"{BASE_URL}/api/roi-estimate", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "_id" not in data[0]


def test_contact_regression(api):
    payload = {
        "name": "TEST_Jane",
        "email": "test_jane@example.com",
        "phone": "+1 555 123 4567",
        "company": "TEST_Co",
        "message": "Hello from regression test.",
    }
    r = api.post(f"{BASE_URL}/api/contact", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    assert r.json()["email"] == "test_jane@example.com"

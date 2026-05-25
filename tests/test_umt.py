from fastapi.testclient import TestClient
from umt import app

client = TestClient(app, follow_redirects=False)


def test_me_unauthenticated():
    response = client.get("/api/me")
    assert response.status_code == 200
    assert response.json()["authenticated"] is False


def test_login_invalid_credentials():
    response = client.post("/api/login", json={"email": "wrong", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["ok"] is False


def test_login_valid_credentials():
    response = client.post("/api/login", json={"email": "admin", "password": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["email"] == "admin"


def test_campaigns_unauthenticated():
    fresh = TestClient(app, follow_redirects=False)
    response = fresh.get("/api/campaigns")
    assert response.status_code == 401


def test_campaigns_authenticated():
    auth_client = TestClient(app, follow_redirects=False)
    auth_client.post("/api/login", json={"email": "admin", "password": "admin"})
    response = auth_client.get("/api/campaigns")
    assert response.status_code == 200
    data = response.json()
    assert "campaigns" in data
    assert len(data["campaigns"]) == 6


def test_logout_clears_session():
    auth_client = TestClient(app, follow_redirects=False)
    auth_client.post("/api/login", json={"email": "admin", "password": "admin"})
    auth_client.post("/api/logout")
    response = auth_client.get("/api/campaigns")
    assert response.status_code == 401


def test_me_authenticated():
    auth_client = TestClient(app, follow_redirects=False)
    auth_client.post("/api/login", json={"email": "admin", "password": "admin"})
    response = auth_client.get("/api/me")
    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is True
    assert data["email"] == "admin"

import pytest
from fastapi.testclient import TestClient

from app.domains.blocklist import service
from app.domains.blocklist.sources import SOURCES
from app.main import app

FAKE_LISTS = {
    SOURCES["ads"][0]: "0.0.0.0 doubleclick.net\n0.0.0.0 ads.example.com\n",
    SOURCES["malware"][0]: "0.0.0.0 malware.bad\n",
    SOURCES["phishing"][0]: "0.0.0.0 phish.bad\n",
}


@pytest.fixture
def client(monkeypatch):
    service._cache.clear()
    monkeypatch.setattr(service, "_fetch", lambda url: FAKE_LISTS[url])
    return TestClient(app)


def test_health(client):
    assert client.get("/api/py/health").json() == {"status": "ok"}


def test_blocklist_all_merges_categories(client):
    body = client.get("/api/py/blocklist").json()
    assert body["category"] == "all"
    assert body["domains"] == ["ads.example.com", "doubleclick.net", "malware.bad", "phish.bad"]
    assert body["count"] == 4


def test_blocklist_single_category_as_text(client):
    response = client.get("/api/py/blocklist", params={"category": "malware", "format": "txt"})
    assert response.text == "malware.bad"
    assert "s-maxage" in response.headers["cache-control"]


def test_stats_counts_each_category(client):
    assert client.get("/api/py/stats").json() == {
        "categories": {"ads": 2, "malware": 1, "phishing": 1},
        "total": 4,
    }


def test_check_blocked_and_allowed(client):
    assert client.get("/api/py/check", params={"domain": "stats.doubleclick.net"}).json() == {
        "domain": "stats.doubleclick.net",
        "blocked": True,
        "category": "ads",
        "match": "doubleclick.net",
    }
    assert "s-maxage" in client.get("/api/py/check", params={"domain": "github.com"}).headers["cache-control"]
    assert client.get("/api/py/check", params={"domain": "github.com"}).json() == {
        "domain": "github.com",
        "blocked": False,
    }


def test_upstream_failure_returns_502(client, monkeypatch):
    def fail(url):
        raise OSError("down")

    monkeypatch.setattr(service, "_fetch", fail)
    response = client.get("/api/py/check", params={"domain": "example.com"})
    assert response.status_code == 502

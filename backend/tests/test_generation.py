def test_health(client):
    resp = client.get("/api/health/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

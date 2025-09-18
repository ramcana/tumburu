def test_upload_audio(client):
    resp = client.post("/api/audio/upload", files={"file": ("test.wav", b"fake-audio")})
    assert resp.status_code == 200
    assert "filename" in resp.json()

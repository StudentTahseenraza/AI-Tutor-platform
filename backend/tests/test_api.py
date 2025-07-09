import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_analyze_endpoint():
    response = client.post("/analyze", json={"problem": "Test problem"})
    assert response.status_code == 200
    assert "mathExplanation" in response.json()
    assert "pseudoCode" in response.json()

@pytest.mark.asyncio
async def test_execute_endpoint():
    response = client.post("/execute", json={
        "language": "python",
        "source": "print('Hello')",
        "stdin": ""
    })
    assert response.status_code == 200
    assert response.json()["output"] == "Hello\n"
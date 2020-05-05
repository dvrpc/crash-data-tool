import pytest

endpoint = "/api/crash-data/v1/crashes" 


def test_success(client):
    response = client.get(endpoint)
    assert response.status_code == 200

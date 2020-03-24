import pytest

endpoint = '/api/crash-data/v2/popupInfo'


def test_no_id1(client):
    response = client.get(endpoint)
    assert response.status_code == 400


def test_id_success(client):
    response = client.get(
        endpoint,
        query_string={'id': '2016000817'}
    )

    assert response.status_code == 200


import pytest

endpoint = '/api/crash-data/v2/popupInfo'


def test_400_when_no_params_provided(client):
    response = client.get(endpoint)
    assert response.status_code == 400


def test_400_when_id_param_not_provided(client):
    response = client.get(endpoint, query_string={'not_id': '2016000817'})
    assert response.status_code == 400


def test_id_success(client):
    response = client.get(
        endpoint,
        query_string={'id': '2016000817'}
    )
    assert response.status_code == 200



import pytest

endpoint = '/api/crash-data/v1/crashes/' # <id>


def test_404_when_id_param_not_provided(client):
    response = client.get(endpoint) 
    assert response.status_code == 404


def test_404_when_bad_id_param_provided(client):
    response = client.get(endpoint + '1')
    assert response.status_code == 404

def test_id_success(client):
    response = client.get(endpoint + '2016000817')
    assert response.status_code == 200



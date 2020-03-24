import pytest
from app import IdNotProvidedException

endpoint = '/api/crash-data/v2/popupInfo'


def test_no_id_ex(client):
    with pytest.raises(IdNotProvidedException):
        client.get(
            endpoint
        )


def test_id_success(client):
    response = client.get(
        endpoint,
        query_string={'id': '2016000817'}
    )

    assert response.status_code == 200


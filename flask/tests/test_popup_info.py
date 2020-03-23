import pytest
from app import IdNotProvidedException

endpoint = '/api/crash-data/v2/popupInfo'


def test_no_id_ex(client):
    with pytest.raises(IdNotProvidedException):
        client.get(
            endpoint
        )



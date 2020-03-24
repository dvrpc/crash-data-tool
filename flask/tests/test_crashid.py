import pytest

'''
Testing getting crashId
'''

endpoint = '/api/crash-data/v2/crashId'


def test_bad_geojson(client):
    response = client.get(
        endpoint,
        query_string={'geojson': 'adlfkja'}
    )
    assert (response.status_code == 400 and b'Database error' in response.data)

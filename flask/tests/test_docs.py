
# For now, just testing that testing works.

endpoint = '/api/crash-data/v1/documentation'


def test_get_documentation_passes(client):
    response = client.get(endpoint)

    assert b'this will be the docs page' in response.data


def test_get_documentation_fails(client):
    response = client.get(endpoint)

    assert b'nothing' not in response.data

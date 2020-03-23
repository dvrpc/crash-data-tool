
# For now, just testing that testing works.


def test_get_documentation_passes(client):
    response = client.get('/api/crash-data/v2/documentation')

    assert b'this will be the docs page' in response.data


def test_get_documentation_fails(client):
    response = client.get('/api/crash-data/v2/documentation')

    assert b'nothing' not in response.data

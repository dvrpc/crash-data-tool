import pytest

'''
Testing get_sidebar_info()
'''

endpoint = '/api/crash-data/v2/sidebarInfo'


def test_type_and_value_required_1(client):
    response = client.get(
        endpoint,
        query_string={'one': '1'},
    )
    assert response.status_code == 400


def test_type_and_value_required_2(client):
    response = client.get(
        endpoint,
        query_string={'type': '1'},
    )
    assert response.status_code == 400


def test_type_and_value_required_3(client):
    response = client.get(
        endpoint,
        query_string={'value': '1'},
    )
    assert response.status_code == 400


def test_type_arg_not_in_required_list(client):
    response = client.get(
        endpoint,
        query_string={'type': 'not_in_the_list', 'value': 'Montgomery'}
    )
    assert response.status_code == 400


def test_success1(client):
    response = client.get(
        endpoint,
        query_string={'type': 'county', 'value': 'Montgomery'}
    )

    # print(response.data)
    # assert False
    assert response.status_code == 200


@pytest.mark.parametrize('value', ['Camden City', 'Mount Laurel Township'])
def test_double_spacing(client, value):
    '''
    Test that double-spacing error is fixed (some municipalities and counties had two spaces
    between words rather than one).
    '''
    response = client.get(
        endpoint,
        query_string={'type': 'municipality', 'value': value}
    )

    assert response.status_code == 200


def test_KSI_only1(client):
    '''
    ?
    '''
    response = client.get(
        endpoint,
        query_string={
            'type': 'county', 
            'value': 'Bucks',
            'ksi_only': 'yes'
        }
    )
    
    assert False
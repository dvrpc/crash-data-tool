import pytest
from app import BadArgsException, BadTypeException, TooManyArgsException
'''
Testing get_sidebar_info()
'''

endpoint = '/api/crash-data/v2/sidebarInfo'


def test_type_and_value_required_ex1(client):
    with pytest.raises(BadArgsException):
        client.get(
            endpoint,
            query_string={'one': '1'},
        )


def test_type_and_value_required_ex2(client):
    with pytest.raises(BadArgsException):
        client.get(
            endpoint,
            query_string={'type': '1'},
        )


def test_type_and_value_required_ex3(client):
    with pytest.raises(BadArgsException):
        client.get(
            endpoint,
            query_string={'value': '1'},
        )


def test_number_of_args(client):
    with pytest.raises(TooManyArgsException):
        client.get(
            endpoint,
            query_string={'type': 'county', 'value': 'Montgomery', 'a_third_arg': 'no'}
        )

def test_type_arg_not_in_required_list(client):
    with pytest.raises(BadTypeException):
        client.get(
            endpoint,
            query_string={'type': 'not_in_the_list', 'value': 'Montgomery'}
        )


def test_success1(client):
    response = client.get(
        endpoint,
        query_string={'type': 'county', 'value': 'Montgomery'}
    )

    # print(response.data)
    # assert False
    assert response.status_code == 200

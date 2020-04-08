import pytest

endpoint = '/crashes/'  # <id>


def test_404_when_id_param_not_provided(client):
    response = client.get(endpoint) 
    assert response.status_code == 404


def test_404_when_bad_id_param_provided(client):
    response = client.get(endpoint + '1')
    assert response.status_code == 404


def test_id_success1(client):
    response = client.get(endpoint + '2016000784')
    assert response.status_code == 200


def test_id_data_correct1(client):
    response = client.get(endpoint + '201808052018-34718')
    data = response.json()
    print(data)
    assert len(data) == 9
    assert data['month'] == 'December'
    assert data['year'] == 2018
    assert data['vehicle_count'] == 1
    assert data['bicycle_count'] == 1
    assert data['bicycle_fatalities'] == 1
    assert data['ped_count'] == 0
    assert data['ped_fatalities'] == 0
    assert data['vehicle_occupants'] == 1
    assert data['collision_type'] == 'Hit pedestrian'



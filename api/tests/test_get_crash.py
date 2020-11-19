import pytest

endpoint = "/api/crash-data/v1/crashes/"  # <id>


def test_404_when_bad_id_param_provided(client):
    response = client.get(endpoint + "1")
    assert response.status_code == 404


def test_id_success1(client):
    response = client.get(endpoint + "PA2016000784")
    assert response.status_code == 200


def test_data_correct1(client):
    response = client.get(endpoint + "NJ201808052018-34718")
    data = response.json()
    assert len(data) == 10
    assert data["Month"] == "December"
    assert data["Year"] == 2018
    assert data["Vehicles"] == 1
    assert data["Bicyclists"] == 1
    assert data["Bicyclist fatalities"] == 1
    assert data["Pedestrians"] == 0
    assert data["Pedestrian fatalities"] == 0
    assert data["Vehicle occupants"] == 1
    assert data["Collision type"] == "Hit pedestrian"


def test_data_correct2(client):
    response = client.get(endpoint + "NJ201403042014-489")
    data = response.json()
    assert len(data) == 10
    assert data["Month"] == "January"
    assert data["Year"] == 2014
    assert data["Vehicles"] == 2
    assert data["Bicyclists"] == 0
    assert data["Bicyclist fatalities"] == 0
    assert data["Pedestrians"] == 0
    assert data["Pedestrian fatalities"] == 0
    assert data["Vehicle occupants"] == 2
    assert data["Collision type"] == "Angle"


@pytest.mark.parametrize(
    "id,expected_max_severity",
    [
        ("PA2014075953", "No Fatality or Injury"),
        ("PA2015077824", "Possible Injury"),
        ("PA2015107449", "Suspected Minor Injury"),
        ("PA2016004173", "Suspected Serious Injury"),
        ("PA2016004153", "Fatality"),
        ("PA2016004167", "Unknown Injury"),
    ],
)
def test_max_severity(client, id, expected_max_severity):
    response = client.get(endpoint + id)
    data = response.json()
    assert data["Maximum severity"] == expected_max_severity

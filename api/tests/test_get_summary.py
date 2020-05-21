import pytest

"""
Testing get_summary()
"""

endpoint = "/api/crash-data/v1/summary"


def test_unknown_geoid_return_404(client):
    response = client.get(endpoint + f"?geoid={5454554}")
    data = response.json()
    assert response.status_code == 404
    assert data["message"] == "Given geoid not found."


@pytest.mark.parametrize(
    "area,value", [("state", "CA"), ("county", "Allegheny"), ("municipality", "Erie City")],
)
def test_unknown_values_return_404(client, area, value):
    response = client.get(endpoint + f"?{area}={value}")
    data = response.json()
    assert response.status_code == 404
    assert data["message"] == "No information found for given parameters"


@pytest.mark.parametrize(
    "area,value,ksi_only",
    [
        ("state", "pa", "no"),
        ("state", "pa", "yes"),
        ("state", "nj", "no"),
        ("state", "nj", "yes"),
        ("county", "Bucks", "no"),
        ("county", "Bucks", "yes"),
        ("county", "Burlington", "no"),
        ("county", "Burlington", "yes"),
        ("county", "Camden", "no"),
        ("county", "Camden", "yes"),
        ("county", "Chester", "no"),
        ("county", "Chester", "yes"),
        ("county", "Delaware", "no"),
        ("county", "Delaware", "yes"),
        ("county", "Gloucester", "no"),
        ("county", "Gloucester", "yes"),
        ("county", "Mercer", "no"),
        ("county", "Mercer", "yes"),
        ("county", "Montgomery", "no"),
        ("county", "Montgomery", "yes"),
        ("county", "Philadelphia", "no"),
        ("county", "Philadelphia", "yes"),
        ("municipality", "West", "no"),
        ("municipality", "West", "yes"),
        ("municipality", "Mount Laurel Township", "no"),
        ("municipality", "Mount Laurel Township", "yes"),
        ("geoid", "42", "no"),
        ("geoid", "34", "yes"),
        ("geoid", "42017", "no"),
        ("geoid", "42017", "yes"),
        ("geoid", "42029", "yes"),
        ("geoid", "42029", "no"),
        ("geoid", "34015", "yes"),
        ("geoid", "34015", "no"),
        ("geoid", "34007", "yes"),
        ("geoid", "34007", "no"),
    ],
)
def test_minimal_success_by_type_and_ksi(client, area, value, ksi_only):
    response = client.get(endpoint + f"?{area}={value}&ksi_only={ksi_only}")
    assert response.status_code == 200


@pytest.mark.parametrize(
    "value",
    [
        ("Elk Township"),
        ("Franklin Township"),
        ("Middletown Township"),
        ("New Hanover Township"),
        ("Newtown Township"),
        ("Telford Borough"),
        ("Thornbury Township"),
        ("Tinicum Township"),
        ("Upper Providence Township"),
        ("Warwick Township"),
        ("Washington Township"),
    ],
)
def test_duplicate_named_munis_require_county_name(client, value):
    response = client.get(endpoint + f"?municipality={value}")
    data = response.json()
    assert response.status_code == 400
    assert "provide the county" in data["message"]


@pytest.mark.parametrize(
    "county, municipality",
    [
        ("Chester", "Elk Township"),
        ("Gloucester", "Elk Township"),
        ("Chester", "Franklin Township"),
        ("Gloucester", "Franklin Township"),
        ("Bucks", "Middletown Township"),
        ("Delaware", "Middletown Township"),
        ("Burlington", "New Hanover Township"),
        ("Montgomery", "New Hanover Township"),
        ("Bucks", "Newtown Township"),
        ("Delaware", "Newtown Township"),
        ("Bucks", "Telford Borough"),
        ("Montgomery", "Telford Borough"),
        ("Chester", "Thornbury Township"),
        ("Delaware", "Thornbury Township"),
        ("Bucks", "Tinicum Township"),
        ("Delaware", "Tinicum Township"),
        ("Delaware", "Upper Providence Township"),
        ("Montgomery", "Upper Providence Township"),
        ("Bucks", "Warwick Township"),
        ("Chester", "Warwick Township"),
        ("Burlington", "Washington Township"),
        ("Gloucester", "Washington Township"),
    ],
)
def test_duplicate_named_munis_return_data_if_county_provided(client, county, municipality):
    response = client.get(endpoint + f"?county={county}&municipality={municipality}")
    assert response.status_code == 200


@pytest.mark.parametrize("ksi_only", ["yes", "no"])
def test_region_ksi_and_not_ksi_success(client, ksi_only):
    response = client.get(endpoint + f"?ksi_only={ksi_only}")
    assert response.status_code == 200


@pytest.mark.parametrize("value", ["Camden City", "Mount Laurel Township"])
def test_double_spacing(client, value):
    """
    Test that double-spacing error is fixed (some municipalities and counties had two spaces
    between words rather than one).
    """
    response = client.get(endpoint + f"?municipality={value}")
    assert response.status_code == 200


@pytest.mark.parametrize(
    "area,value",
    [
        ("municipality", "Abington Township"),
        ("municipality", "Aldan Borough"),
        ("municipality", "Ambler Borough"),
        ("municipality", "Aston Township"),
        ("municipality", "Atglen Borough"),
        ("municipality", "Audubon Borough"),
        ("municipality", "Downingtown Borough"),
        ("municipality", "Hilltown Township"),
        ("municipality", "Lansdowne Borough"),
        ("municipality", "Upper North"),
        ("municipality", "West Goshen Township"),
    ],
)
def test_KSI_only1(client, area, value):
    """
    If requesting KSI crashes only, every year/severity should always have either a fatal or
    major value.
    """
    response = client.get(endpoint + f"?{area}={value}&ksi_only=yes")
    data = response.json()
    fatal_and_major_values = []
    for k, v in data.items():
        fatal_and_major_values.append([v["severity"]["Fatal"], v["severity"]["Major"]])

    print(fatal_and_major_values)  # only prints if tests fails
    # the inner any() creates a list of either True or False values (if either value is Truthy -
    # i.e. above zero - value will be True) and the outer all() then checks that they are all True.
    assert all([any(value_set) for value_set in fatal_and_major_values])


@pytest.mark.parametrize(
    "area,value,ksi_only",
    [
        ("state", "pa", "no"),
        ("state", "pa", "yes"),
        ("state", "nj", "no"),
        ("state", "nj", "yes"),
        ("county", "Bucks", "no"),
        ("county", "Bucks", "yes"),
        ("county", "Burlington", "no"),
        ("county", "Burlington", "yes"),
        ("county", "Camden", "no"),
        ("county", "Camden", "yes"),
        ("county", "Chester", "no"),
        ("county", "Chester", "yes"),
        ("county", "Delaware", "no"),
        ("county", "Delaware", "yes"),
        ("county", "Gloucester", "no"),
        ("county", "Gloucester", "yes"),
        ("county", "Mercer", "no"),
        ("county", "Mercer", "yes"),
        ("county", "Montgomery", "no"),
        ("county", "Montgomery", "yes"),
        ("county", "Philadelphia", "no"),
        ("county", "Philadelphia", "yes"),
        ("municipality", "West", "no"),
        ("municipality", "West", "yes"),
        ("geoid", "42045", "no"),
        ("geoid", "42045", "yes"),
        ("geoid", "42091", "no"),
        ("geoid", "42091", "yes"),
        ("geoid", "34005", "no"),
        ("geoid", "34005", "yes"),
        ("geoid", "34021", "no"),
        ("geoid", "34021", "yes"),
    ],
)
def test_summed_collision_types_equals_total_crashes(client, area, value, ksi_only):
    response = client.get(endpoint + f"?{area}={value}&ksi_only={ksi_only}")
    data = response.json()
    yr_17_sum_collisions = sum([value for value in data["2017"]["type"].values()])
    yr_18_sum_collisions = sum([value for value in data["2018"]["type"].values()])
    assert yr_17_sum_collisions == data["2017"]["Total crashes"]
    assert yr_18_sum_collisions == data["2018"]["Total crashes"]


############################
# COMPARING TO SOURCE DATA #
############################


def test_data_Chadds_Ford(client):
    """Make sure that the renaming worked properly."""
    response = client.get(endpoint + "?municipality=Chadds Ford Township")
    data = response.json()
    y_14 = data["2014"]
    y_18 = data["2018"]

    total_injured_14 = (
        y_14["severity"]["Major"]
        + y_14["severity"]["Moderate"]
        + y_14["severity"]["Minor"]
        + y_14["severity"]["Unknown severity"]
    )

    total_injured_18 = (
        y_18["severity"]["Major"]
        + y_18["severity"]["Moderate"]
        + y_18["severity"]["Minor"]
        + y_18["severity"]["Unknown severity"]
    )
    assert y_14["Total crashes"] == 86
    assert y_14["severity"]["Fatal"] == 1
    assert y_14["severity"]["Unknown if injured"] == 6
    assert y_14["mode"]["Bicyclists"] == 0
    assert y_14["mode"]["Pedestrians"] == 0
    assert total_injured_14 == 65
    assert y_18["Total crashes"] == 79
    assert y_18["severity"]["Fatal"] == 0
    assert y_18["severity"]["Unknown if injured"] == 4
    assert y_18["mode"]["Bicyclists"] == 0
    assert y_18["mode"]["Pedestrians"] == 1
    assert total_injured_18 == 50


def test_data_Burlington(client):
    response = client.get(endpoint + "?county=Burlington")
    data = response.json()
    y_17 = data["2017"]
    y_18 = data["2018"]

    total_injured_18 = (
        y_18["severity"]["Major"]
        + y_18["severity"]["Moderate"]
        + y_18["severity"]["Minor"]
        + y_18["severity"]["Unknown severity"]
    )

    total_injured_17 = (
        y_17["severity"]["Major"]
        + y_17["severity"]["Moderate"]
        + y_17["severity"]["Minor"]
        + y_17["severity"]["Unknown severity"]
    )
    assert y_17["Total crashes"] == 11825
    assert y_17["severity"]["Fatal"] == 51
    assert y_17["mode"]["Bicyclists"] == 57
    assert y_17["mode"]["Pedestrians"] == 100
    assert total_injured_17 == 4139
    assert y_18["Total crashes"] == 12237
    assert y_18["severity"]["Fatal"] == 43
    assert y_18["mode"]["Bicyclists"] == 59
    assert y_18["mode"]["Pedestrians"] == 107
    assert total_injured_18 == 3883


def test_data_Camden(client):
    response = client.get(endpoint + "?county=Camden")
    data = response.json()
    y_17 = data["2017"]
    y_18 = data["2018"]

    total_injured_18 = (
        y_18["severity"]["Major"]
        + y_18["severity"]["Moderate"]
        + y_18["severity"]["Minor"]
        + y_18["severity"]["Unknown severity"]
    )

    total_injured_17 = (
        y_17["severity"]["Major"]
        + y_17["severity"]["Moderate"]
        + y_17["severity"]["Minor"]
        + y_17["severity"]["Unknown severity"]
    )
    assert y_17["Total crashes"] == 15179
    assert y_17["severity"]["Fatal"] == 47
    assert y_17["mode"]["Bicyclists"] == 109
    assert y_17["mode"]["Pedestrians"] == 268
    assert total_injured_17 == 5623
    assert y_18["Total crashes"] == 15758
    assert y_18["severity"]["Fatal"] == 49
    assert y_18["mode"]["Bicyclists"] == 122
    assert y_18["mode"]["Pedestrians"] == 260
    assert total_injured_18 == 5763


def test_data_Gloucester(client):
    response = client.get(endpoint + "?county=Gloucester")
    data = response.json()
    y_17 = data["2017"]
    y_18 = data["2018"]

    total_injured_18 = (
        y_18["severity"]["Major"]
        + y_18["severity"]["Moderate"]
        + y_18["severity"]["Minor"]
        + y_18["severity"]["Unknown severity"]
    )

    total_injured_17 = (
        y_17["severity"]["Major"]
        + y_17["severity"]["Moderate"]
        + y_17["severity"]["Minor"]
        + y_17["severity"]["Unknown severity"]
    )
    assert y_17["Total crashes"] == 7517
    assert y_17["severity"]["Fatal"] == 46
    assert y_17["mode"]["Bicyclists"] == 34
    assert y_17["mode"]["Pedestrians"] == 61
    assert total_injured_17 == 2635
    assert y_18["Total crashes"] == 7715
    assert y_18["severity"]["Fatal"] == 40
    assert y_18["mode"]["Bicyclists"] == 39
    assert y_18["mode"]["Pedestrians"] == 65
    assert total_injured_18 == 2538


def test_data_PA(client):
    response = client.get(endpoint + "?state=pa")
    data = response.json()
    y_14 = data["2014"]
    y_15 = data["2015"]
    y_16 = data["2016"]
    y_17 = data["2017"]
    y_18 = data["2018"]

    total_injured_18 = (
        y_18["severity"]["Major"]
        + y_18["severity"]["Moderate"]
        + y_18["severity"]["Minor"]
        + y_18["severity"]["Unknown severity"]
    )
    total_injured_17 = (
        y_17["severity"]["Major"]
        + y_17["severity"]["Moderate"]
        + y_17["severity"]["Minor"]
        + y_17["severity"]["Unknown severity"]
    )
    total_injured_16 = (
        y_16["severity"]["Major"]
        + y_16["severity"]["Moderate"]
        + y_16["severity"]["Minor"]
        + y_16["severity"]["Unknown severity"]
    )
    total_injured_15 = (
        y_15["severity"]["Major"]
        + y_15["severity"]["Moderate"]
        + y_15["severity"]["Minor"]
        + y_15["severity"]["Unknown severity"]
    )
    total_injured_14 = (
        y_14["severity"]["Major"]
        + y_14["severity"]["Moderate"]
        + y_14["severity"]["Minor"]
        + y_14["severity"]["Unknown severity"]
    )
    assert y_14["Total crashes"] == 33740
    assert y_14["severity"]["Fatal"] == 239
    assert y_14["severity"]["Major"] == 637
    assert y_14["severity"]["Moderate"] == 3039
    assert y_14["severity"]["Minor"] == 12223
    assert y_14["severity"]["Unknown severity"] == 9764
    assert y_14["mode"]["Bicyclists"] == 720
    assert y_14["mode"]["Pedestrians"] == 2198
    assert y_14["mode"]["Vehicle occupants"] == 83251 - 720 - 2198
    assert total_injured_14 == 25663
    assert y_15["Total crashes"] == 35786
    assert y_15["severity"]["Fatal"] == 240
    assert y_15["severity"]["Major"] == 736
    assert y_15["severity"]["Moderate"] == 3194
    assert y_15["severity"]["Minor"] == 12534
    assert y_15["severity"]["Unknown severity"] == 10531
    assert y_15["mode"]["Bicyclists"] == 687
    assert y_15["mode"]["Pedestrians"] == 2181
    assert y_15["mode"]["Vehicle occupants"] == 88825 - 2181 - 687
    assert total_injured_15 == 26995
    assert y_16["Total crashes"] == 37048
    assert y_16["severity"]["Fatal"] == 238
    assert y_16["severity"]["Major"] == 995
    assert y_16["severity"]["Moderate"] == 6199
    assert y_16["severity"]["Minor"] == 9827
    assert y_16["severity"]["Unknown severity"] == 11073
    assert y_16["mode"]["Bicyclists"] == 680
    assert y_16["mode"]["Pedestrians"] == 2403
    assert y_16["mode"]["Vehicle occupants"] == 92423 - 2403 - 680
    assert total_injured_16 == 28094  # db has 28102, but sum of components is 28094
    assert y_17["Total crashes"] == 36192
    assert y_17["severity"]["Fatal"] == 245
    assert y_17["severity"]["Major"] == 969
    assert y_17["severity"]["Moderate"] == 6605
    assert y_17["severity"]["Minor"] == 9225
    assert y_17["severity"]["Unknown severity"] == 10075
    assert y_17["mode"]["Bicyclists"] == 618
    assert y_17["mode"]["Pedestrians"] == 2253
    assert y_17["mode"]["Vehicle occupants"] == 89206 - 618 - 2253
    assert total_injured_17 == 26874  # db has 26884, but sum of components is 26874
    assert y_18["Total crashes"] == 36306
    assert y_18["severity"]["Fatal"] == 272
    assert y_18["severity"]["Major"] == 1014
    assert y_18["severity"]["Moderate"] == 8380
    assert y_18["severity"]["Minor"] == 7437
    assert y_18["severity"]["Unknown severity"] == 9294
    assert y_18["mode"]["Bicyclists"] == 489
    assert y_18["mode"]["Pedestrians"] == 2272
    assert y_18["mode"]["Vehicle occupants"] == 88096 - 489 - 2272
    assert total_injured_18 == 26125  # db has 26129, but sum of components is 29125


@pytest.mark.parametrize(
    "county,crashes14,crashes15,crashes16",
    [
        ("Burlington", 13391, 12566, 12258),
        ("Camden", 14723, 12772, 12672),
        ("Gloucester", 6643, 7172, 7294),
        ("Mercer", 12907, 12406, 12214),
    ],
)
def test_total_crashes_by_NJ_county(client, county, crashes14, crashes15, crashes16):
    response = client.get(endpoint + f"?county={county}")
    data = response.json()

    assert data["2014"]["Total crashes"] == crashes14
    assert data["2015"]["Total crashes"] == crashes15
    assert data["2016"]["Total crashes"] == crashes16


@pytest.mark.parametrize(
    "county,injured14,injured15,injured16",
    [
        ("Burlington", 4099, 3936, 4055),
        ("Camden", 4930, 4819, 4735),  # db- 4816 (2015) and 4734 (2016); nums here sums
        ("Gloucester", 2257, 2527, 2546),
        ("Mercer", 3351, 3486, 3629),  # db has 3350 (2014), 3482 (2015); nums here sums
    ],
)
def test_total_injured_by_NJ_county(client, county, injured14, injured15, injured16):
    response = client.get(endpoint + f"?county={county}")
    data = response.json()

    total_injured_14 = (
        data["2014"]["severity"]["Major"]
        + data["2014"]["severity"]["Moderate"]
        + data["2014"]["severity"]["Minor"]
        + data["2014"]["severity"]["Unknown severity"]
    )
    total_injured_15 = (
        data["2015"]["severity"]["Major"]
        + data["2015"]["severity"]["Moderate"]
        + data["2015"]["severity"]["Minor"]
        + data["2015"]["severity"]["Unknown severity"]
    )
    total_injured_16 = (
        data["2016"]["severity"]["Major"]
        + data["2016"]["severity"]["Moderate"]
        + data["2016"]["severity"]["Minor"]
        + data["2016"]["severity"]["Unknown severity"]
    )
    assert total_injured_14 == injured14
    assert total_injured_15 == injured15
    assert total_injured_16 == injured16

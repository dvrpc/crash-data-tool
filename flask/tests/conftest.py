import pytest
from app import app


@pytest.fixture
def client():
    c = app.test_client()
    return c

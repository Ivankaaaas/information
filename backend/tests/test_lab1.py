import pytest
from app.services.lab1_services import Lab1Service
from app.repositories.lab1_repository import Lab1Repository
from app.schemas.lab1_schemas import LCGParams

@pytest.fixture
def service():
    repo = Lab1Repository()
    return Lab1Service(repo)

@pytest.mark.asyncio
async def test_generate_sequence(service):
    params = LCGParams(m=10, a=2, c=1, x0=1)
    seq = await service.generate_sequence(2, params)
    assert seq == [3, 7]

def test_check_period(service):
    params = LCGParams(m=10, a=2, c=1, x0=1)
    result = service.check_period(params)
    assert result["found"] is True
    assert result["period"] == 4

def test_cesaro_structure(service):
    params = LCGParams(m=67108863, a=2197, c=1597, x0=13)
    result = service.cesaro_test(params, pairs=100)
    assert "pi_estimate" in result
    assert "deviation" in result
    assert result["pairs_tested"] == 100

def test_variant_17_constants():
    params = LCGParams(m=67108863, a=2197, c=1597, x0=13)
    assert params.m == 67108863
    assert params.a == 2197
    assert params.c == 1597
    assert params.x0 == 13


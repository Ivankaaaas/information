import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.lab1_schemas import (
    GenerateRequest, GenerateResponse, PeriodResponse, CesaroResponse, LCGParams
)
from app.services.lab1_services import Lab1Service, get_lab1_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_numbers(
        request: GenerateRequest,
        service: Lab1Service = Depends(get_lab1_service)
):
    params = request.params

    logger.info(f"Generate sequence request: count={request.count}, params={params}")

    try:
        seq = await service.generate_sequence(request.count, params)
        logger.info(f"Sequence generated successfully: length={len(seq)}")

        return GenerateResponse(sequence=seq, total=len(seq))

    except Exception as e:
        logger.error(f"Error generating sequence: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

@router.post("/period", response_model=PeriodResponse)
async def check_period(
        request: GenerateRequest,
        service: Lab1Service = Depends(get_lab1_service)
):
    actual_params = request.params or LCGParams(m=67108863, a=2197, c=1597, x0=13)
    try:
        result = service.check_period(actual_params)

        return PeriodResponse(
            period=result["period"],
            is_found=result["found"],
            is_full_period=(result["period"] == actual_params.m)
        )
    except Exception as e:
        logger.error(f"Error checking period: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cesaro", response_model=CesaroResponse)
async def cesaro_test(
        request: GenerateRequest,
        service: Lab1Service = Depends(get_lab1_service)
):
    actual_params = request.params or LCGParams(m=67108863, a=2197, c=1597, x0=13)
    try:
        result = service.cesaro_test(actual_params, pairs=request.count)

        return CesaroResponse(
            pi_estimate=result["pi_estimate"],
            deviation=result["deviation"],
            pairs=result["pairs_tested"]
        )
    except Exception as e:
        logger.error(f"Error in Cesaro test: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

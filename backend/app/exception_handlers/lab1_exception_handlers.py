from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class ValidationException(Exception):
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class BusinessLogicException(Exception):
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

def setup_exception_handlers(app):
    @app.exception_handler(ValidationException)
    async def validation_exception_handler(request: Request, exc: ValidationException):
        logger.warning(f"Validation error: {exc.message} | Details: {exc.details}")
        return JSONResponse(
            status_code=400,
            content={
                "error": "Validation Error",
                "message": exc.message,
                "details": exc.details
            },
        )

    @app.exception_handler(BusinessLogicException)
    async def business_logic_exception_handler(request: Request, exc: BusinessLogicException):
        logger.error(f"Business logic error: {exc.message} | Details: {exc.details}")
        return JSONResponse(
            status_code=422,
            content={
                "error": "Business Logic Error",
                "message": exc.message,
                "details": exc.details
            },
        )
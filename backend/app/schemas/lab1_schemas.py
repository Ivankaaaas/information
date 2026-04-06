from pydantic import BaseModel, Field
from typing import Optional, List

class LCGParams(BaseModel):
    m: int = Field(..., description="Модуль(modulus)")
    a: int = Field(..., description="Множник(multiplier)")
    c: int = Field(..., description="Приріст(increment)")
    x0: int = Field(..., description="Початкове значення(seed)")

class GenerateRequest(BaseModel):
    count: int = Field(..., ge=1, description="Скільки чисел згенерувати?")
    params: Optional[LCGParams] = None

class GenerateResponse(BaseModel):
    sequence: List[int]
    total: int

class PeriodResponse(BaseModel):
    period: int
    is_full_period: bool
    is_found: bool

class CesaroResponse(BaseModel):
    pi_estimate: float
    deviation: float
    pairs: int

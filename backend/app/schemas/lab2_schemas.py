from pydantic import BaseModel
from typing import Optional

class HashTextRequest(BaseModel) :
    text: str

class HashResponse(BaseModel):
    hash_value: str
    algorithm: str = "MD5"
    length_bits: int = 128

class IntegrityCheckResponse(BaseModel):
    is_intact: bool
    calculated_hash: str
    expected_hash: str
    
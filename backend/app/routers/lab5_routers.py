from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.services.lab5_services import lab5_service

router = APIRouter(prefix="/api/v1/lab5", tags=["Lab 5: DSA Signature"])

@router.get("/keys/generate")
async def generate_keys():
    private_pem, public_pem = lab5_service.generate_dsa_keys()
    return {
        "private_key": private_pem.decode(),
        "public_key": public_pem.decode()
    }

@router.post("/sign")
async def sign_file(
    file: UploadFile = File(...),
    private_key: str = Form(...)
):
    content = await file.read()
    try:
        signature_hex, duration = await lab5_service.sign_data(
            content, 
            private_key.encode()
        )
        return {
            "filename": file.filename,
            "signature_hex": signature_hex,
            "time_sec": duration
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Помилка підпису: {str(e)}")

@router.post("/verify")
async def verify_file(
    file: UploadFile = File(...),
    signature_hex: str = Form(...),
    public_key: str = Form(...)
):
    content = await file.read()
    is_valid, duration = await lab5_service.verify_signature(
        content,
        signature_hex.encode(),
        public_key.encode()
    )
    return {
        "is_valid": is_valid,
        "time_sec": duration
    }

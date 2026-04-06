from fastapi import APIRouter, UploadFile, File, Form, Response
from app.services.lab4_services import lab4_service

router = APIRouter(prefix="/lab4", tags=["Lab 4 - RSA"])

@router.post("/generate-keys")
async def generate_keys():
    private_pem, public_pem = lab4_service.generate_key_pair()
    return {
        "private_key": private_pem.decode(),
        "public_key": public_pem.decode()
    }

@router.post("/encrypt-file")
async def encrypt_file(
    file: UploadFile = File(...),
    public_key: str = Form(...)
):
    content = await file.read()
    
    combined_data, rsa_time, rc5_time = await lab4_service.encrypt_hybrid(
        content, public_key.encode()
    )
    
    return {
        "filename": file.filename,
        "rsa_time_sec": f"{rsa_time:.6f}",
        "rc5_time_sec": f"{rc5_time:.6f}",
        "total_time": f"{rsa_time + rc5_time:.6f}",
        "encrypted_data_base64": combined_data.hex()
    }

@router.post("/decrypt-file")
async def decrypt_file(
    file: UploadFile = File(...),
    private_key: str = Form(...)
):
    encrypted_content = await file.read()
    
    original_content = await lab4_service.decrypt_hybrid(
        encrypted_content, private_key.encode()
    )
    
    return Response(content=original_content, media_type="application/octet-stream")

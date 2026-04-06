from fastapi import APIRouter, UploadFile, File, Form, Response
from app.services.lab3_services import lab3_service
import urllib.parse

router = APIRouter(prefix="/lab3", tags=["Lab 3"])

@router.post("/encrypt")
async def encrypt(file: UploadFile = File(...), password: str = Form(...)):
    content = await file.read()
    encrypted = await lab3_service.encrypt_file(content, password)
    
    filename = f"{file.filename}.enc"
    
    encoded_filename = urllib.parse.quote(filename)
    
    return Response(
        content=encrypted,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
    )

@router.post("/decrypt")
async def decrypt(file: UploadFile = File(...), password: str = Form(...)):
    content = await file.read()
    try:
        decrypted = await lab3_service.decrypt_file(content, password)
        
        orig_name = file.filename.replace(".enc", "")
        filename = f"decrypted_{orig_name}"
        
        encoded_filename = urllib.parse.quote(filename)
        
        return Response(
            content=decrypted,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
            }
        )
    except Exception as e:
        return Response(
            content=f"Error: {str(e)}".encode("utf-8"),
            status_code=400
        )
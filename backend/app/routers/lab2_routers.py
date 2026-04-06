from fastapi import APIRouter, UploadFile, File, Form
from app.services.lab2_services import lab2_service

router = APIRouter()

@router.post("/hash/string")
async def hash_string(text: str = Form(...)):
    result = lab2_service.compute_md5_string(text)
    return {"hash": result}

@router.post("/hash/file")
async def hash_file(file: UploadFile = File(...)):
    result = await lab2_service.compute_md5_file(file)
    return {"hash": result, "filename": file.filename}

@router.post("/verify")
async def verify_files(
    target_file: UploadFile = File(...),
    hash_file: UploadFile = File(...)
):
    result = await lab2_service.verify_integrity(target_file, hash_file)
    return result

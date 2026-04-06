import logging
from fastapi import FastAPI
from app.routers.lab1_routers import router
from app.exception_handlers.lab1_exception_handlers import setup_exception_handlers
from fastapi.middleware.cors import CORSMiddleware
from app.routers.lab2_routers import router as lab2_router
from app.routers.lab3_routers import router as lab3_router
from app.routers.lab4_routers import router as lab4_router
from app.routers.lab5_routers import router as lab5_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Laboratory Work #1 - LCG Generator")

setup_exception_handlers(app)

app.include_router(router, prefix="/api/v1/lab1", tags=["lab1"])
app.include_router(lab2_router, prefix="/api/v1/lab2", tags=["lab2"])
app.include_router(lab3_router, prefix="/api/v1", tags=["lab3"])
app.include_router(lab4_router, prefix="/api/v1", tags=["lab4"])
app.include_router(lab5_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Lab 1 API. Go to /docs for Swagger UI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
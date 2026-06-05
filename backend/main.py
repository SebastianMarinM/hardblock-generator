from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.database import create_request, init_db, list_requests
from backend.models import ApiMessage, HardblockCreate, HardblockGenerated, HardblockResponse
from backend.templates_service import generate_hardblock_texts

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="Hardblock Generator", version="1.0.0")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/health", response_model=ApiMessage)
def health() -> ApiMessage:
    return ApiMessage(message="Hardblock Generator API is running")


@app.post("/api/generate", response_model=HardblockGenerated)
def generate(data: HardblockCreate) -> HardblockGenerated:
    return generate_hardblock_texts(data)


@app.post("/api/requests", response_model=HardblockResponse, status_code=201)
def save_request(data: HardblockCreate) -> HardblockResponse:
    return create_request(data)


@app.get("/api/requests", response_model=list[HardblockResponse])
def history() -> list[HardblockResponse]:
    return list(list_requests())

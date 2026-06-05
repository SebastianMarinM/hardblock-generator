from pathlib import Path

import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.database import (
    create_hotel_priority,
    create_request,
    delete_hotel_priority,
    get_hotel_priority_by_name,
    init_db,
    list_hotel_priorities,
    list_requests,
    update_hotel_priority,
)
from backend.models import (
    ApiMessage,
    HardblockCreate,
    HardblockGenerated,
    HardblockResponse,
    HotelPriorityCreate,
    HotelPriorityResponse,
    HotelPriorityUpdate,
)
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



def validate_hotel_priority(data: HotelPriorityCreate | HotelPriorityUpdate) -> None:
    if not data.hotel_name.strip():
        raise HTTPException(status_code=400, detail="Hotel name is required.")
    if not data.priority.strip():
        raise HTTPException(status_code=400, detail="Priority is required.")


@app.get("/api/hotel-priorities", response_model=list[HotelPriorityResponse])
def hotel_priorities() -> list[HotelPriorityResponse]:
    return list(list_hotel_priorities())


@app.get("/api/hotel-priorities/search", response_model=HotelPriorityResponse | None)
def search_hotel_priority(hotel_name: str) -> HotelPriorityResponse | None:
    return get_hotel_priority_by_name(hotel_name)


@app.post("/api/hotel-priorities", response_model=HotelPriorityResponse, status_code=201)
def save_hotel_priority(data: HotelPriorityCreate) -> HotelPriorityResponse:
    validate_hotel_priority(data)
    try:
        return create_hotel_priority(data)
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=409, detail="A hotel priority with that name already exists."
        ) from exc


@app.put("/api/hotel-priorities/{hotel_priority_id}", response_model=HotelPriorityResponse)
def edit_hotel_priority(
    hotel_priority_id: int, data: HotelPriorityUpdate
) -> HotelPriorityResponse:
    validate_hotel_priority(data)
    try:
        updated = update_hotel_priority(hotel_priority_id, data)
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=409, detail="A hotel priority with that name already exists."
        ) from exc

    if updated is None:
        raise HTTPException(status_code=404, detail="Hotel priority not found.")
    return updated


@app.delete("/api/hotel-priorities/{hotel_priority_id}", response_model=ApiMessage)
def remove_hotel_priority(hotel_priority_id: int) -> ApiMessage:
    deleted = delete_hotel_priority(hotel_priority_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Hotel priority not found.")
    return ApiMessage(message="Hotel priority deleted.", id=hotel_priority_id)

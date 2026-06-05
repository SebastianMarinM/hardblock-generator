import sqlite3
from pathlib import Path
from typing import Iterable

from backend.models import (
    HardblockCreate,
    HardblockResponse,
    HotelPriorityCreate,
    HotelPriorityResponse,
    HotelPriorityUpdate,
)
from backend.templates_service import generate_hardblock_texts

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "hardblock.db"

FIELDS = [
    "airline",
    "ato",
    "rooms",
    "pax",
    "nights",
    "motivo",
    "hotel",
    "prioridad",
    "status",
    "booking_source",
    "meals",
    "payment",
]


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS hardblock_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                airline TEXT NOT NULL DEFAULT '',
                ato TEXT NOT NULL DEFAULT '',
                rooms TEXT NOT NULL DEFAULT '',
                pax TEXT NOT NULL DEFAULT '',
                nights TEXT NOT NULL DEFAULT '',
                motivo TEXT NOT NULL DEFAULT '',
                hotel TEXT NOT NULL DEFAULT '',
                prioridad TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT '',
                booking_source TEXT NOT NULL DEFAULT '',
                meals TEXT NOT NULL DEFAULT '',
                payment TEXT NOT NULL DEFAULT '',
                in_progress_text TEXT NOT NULL,
                completed_text TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS hotel_priorities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hotel_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                priority TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def create_request(data: HardblockCreate) -> HardblockResponse:
    generated = generate_hardblock_texts(data)
    values = data.model_dump()
    columns = [*FIELDS, "in_progress_text", "completed_text"]
    placeholders = ", ".join("?" for _ in columns)
    sql = f"INSERT INTO hardblock_requests ({', '.join(columns)}) VALUES ({placeholders})"
    params = [values[field] for field in FIELDS] + [generated.in_progress, generated.completed]

    with get_connection() as connection:
        cursor = connection.execute(sql, params)
        connection.commit()
        row = connection.execute(
            "SELECT * FROM hardblock_requests WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return row_to_response(row)


def list_requests() -> Iterable[HardblockResponse]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM hardblock_requests ORDER BY datetime(created_at) DESC, id DESC"
        ).fetchall()
    return [row_to_response(row) for row in rows]


def row_to_response(row: sqlite3.Row) -> HardblockResponse:
    return HardblockResponse(**dict(row))


def normalize_text(value: str) -> str:
    return value.strip()


def row_to_hotel_priority(row: sqlite3.Row) -> HotelPriorityResponse:
    return HotelPriorityResponse(**dict(row))


def list_hotel_priorities() -> Iterable[HotelPriorityResponse]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM hotel_priorities ORDER BY hotel_name COLLATE NOCASE"
        ).fetchall()
    return [row_to_hotel_priority(row) for row in rows]


def get_hotel_priority_by_name(hotel_name: str) -> HotelPriorityResponse | None:
    normalized_name = normalize_text(hotel_name)
    if not normalized_name:
        return None

    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM hotel_priorities WHERE hotel_name = ? COLLATE NOCASE",
            (normalized_name,),
        ).fetchone()

    return row_to_hotel_priority(row) if row else None


def create_hotel_priority(data: HotelPriorityCreate) -> HotelPriorityResponse:
    hotel_name = normalize_text(data.hotel_name)
    priority = normalize_text(data.priority)

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO hotel_priorities (hotel_name, priority, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(hotel_name) DO UPDATE SET
                priority = excluded.priority,
                updated_at = CURRENT_TIMESTAMP
            """,
            (hotel_name, priority),
        )
        connection.commit()
        row = connection.execute(
            "SELECT * FROM hotel_priorities WHERE hotel_name = ? COLLATE NOCASE",
            (hotel_name,),
        ).fetchone()

    return row_to_hotel_priority(row)


def update_hotel_priority(
    hotel_priority_id: int, data: HotelPriorityUpdate
) -> HotelPriorityResponse | None:
    hotel_name = normalize_text(data.hotel_name)
    priority = normalize_text(data.priority)

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM hotel_priorities WHERE id = ?", (hotel_priority_id,)
        ).fetchone()
        if not existing:
            return None

        connection.execute(
            """
            UPDATE hotel_priorities
            SET hotel_name = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (hotel_name, priority, hotel_priority_id),
        )
        connection.commit()
        row = connection.execute(
            "SELECT * FROM hotel_priorities WHERE id = ?", (hotel_priority_id,)
        ).fetchone()

    return row_to_hotel_priority(row)


def delete_hotel_priority(hotel_priority_id: int) -> bool:
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM hotel_priorities WHERE id = ?", (hotel_priority_id,)
        )
        connection.commit()
    return cursor.rowcount > 0

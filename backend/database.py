import sqlite3
from pathlib import Path
from typing import Iterable

from backend.models import HardblockCreate, HardblockResponse
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

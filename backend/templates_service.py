from backend.models import HardblockBase, HardblockGenerated

IN_PROGRESS_VALUE = "En curso"


def _value(value: str) -> str:
    cleaned = (value or "").strip()
    return cleaned if cleaned else "-"


def _render_block(data: HardblockBase, *, completed: bool) -> str:
    status = _value(data.status) if completed else IN_PROGRESS_VALUE
    booking_source = _value(data.booking_source) if completed else IN_PROGRESS_VALUE
    meals = _value(data.meals) if completed else IN_PROGRESS_VALUE
    payment = _value(data.payment) if completed else IN_PROGRESS_VALUE
    hotel = _value(data.hotel) if completed else IN_PROGRESS_VALUE
    prioridad = _value(data.prioridad) if completed else IN_PROGRESS_VALUE
    title = "Hardblock Completed" if completed else "Hardblock en curso"

    return "\n".join(
        [
            title,
            f"Airline: {_value(data.airline)}",
            f"ATO: {_value(data.ato)}",
            f"Rooms: {_value(data.rooms)}",
            f"PAX: {_value(data.pax)}",
            f"Nights: {_value(data.nights)}",
            f"Motivo: {_value(data.motivo)}",
            f"Hotel: {hotel}",
            f"Prioridad: {prioridad}",
            f"Status: {status}",
            f"Booking source: {booking_source}",
            f"Meals: {meals}",
            f"Payment: {payment}",
        ]
    )


def generate_hardblock_texts(data: HardblockBase) -> HardblockGenerated:
    return HardblockGenerated(
        in_progress=_render_block(data, completed=False),
        completed=_render_block(data, completed=True),
    )

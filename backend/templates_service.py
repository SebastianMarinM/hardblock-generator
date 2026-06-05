from backend.models import (
    GroundTransportationBase,
    GroundTransportationGenerated,
    HardblockBase,
    HardblockGenerated,
)

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


def _render_gt_block(data: GroundTransportationBase, *, completed: bool) -> str:
    if completed:
        return "\n".join(
            [
                "Hard Block GT completed",
                "",
                f"Airline: {_value(data.airline)}",
                f"ATO: {_value(data.ato)}",
                f"Pax: {_value(data.pax)}",
                f"Motivo: {_value(data.motivo)}",
                "Status: Booked",
                f"Origen: {_value(data.origen)}",
                f"Destino: {_value(data.destino)}",
                f"Route: {_value(data.route)}",
                f"GT: {_value(data.vehicle_type)}",
                f"Priority: {_value(data.priority)}",
                f"Rate: {_value(data.rate)}",
                f"Payment: {_value(data.payment)}",
                f"Vehicle Type: {_value(data.vehicle_type)}",
            ]
        )

    return "\n".join(
        [
            "Hard Block GT en curso",
            "",
            f"Airline: {_value(data.airline)}",
            f"ATO: {_value(data.ato)}",
            f"Pax: {_value(data.pax)}",
            f"Motivo: {_value(data.motivo)}",
            f"Status: {IN_PROGRESS_VALUE}",
            f"Origen: {_value(data.origen)}",
            "Destino: HOTEL",
            f"Route: {_value(data.route)}",
            f"GT: {IN_PROGRESS_VALUE}",
            f"Priority: {IN_PROGRESS_VALUE}",
            f"Rate: {IN_PROGRESS_VALUE}",
            f"Payment: {IN_PROGRESS_VALUE}",
        ]
    )


def generate_gt_texts(data: GroundTransportationBase) -> GroundTransportationGenerated:
    return GroundTransportationGenerated(
        in_progress=_render_gt_block(data, completed=False),
        completed=_render_gt_block(data, completed=True),
    )

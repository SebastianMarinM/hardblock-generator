from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, PositiveInt, field_validator


def validate_optional_priority(value: object) -> str:
    clean_value = str(value).strip()
    if clean_value and (not clean_value.isdigit() or int(clean_value) <= 0):
        raise ValueError("Priority must be a positive integer.")
    return clean_value


class HardblockBase(BaseModel):
    airline: str = Field(default="", max_length=120)
    ato: str = Field(default="", max_length=120)
    rooms: str = Field(default="", max_length=60)
    pax: str = Field(default="", max_length=60)
    nights: str = Field(default="", max_length=60)
    motivo: str = Field(default="", max_length=500)
    hotel: str = Field(default="", max_length=160)
    prioridad: str = Field(default="", max_length=80)
    status: str = Field(default="", max_length=80)
    booking_source: str = Field(default="", max_length=120)
    meals: str = Field(default="", max_length=120)
    payment: str = Field(default="", max_length=120)

    _validate_prioridad = field_validator("prioridad")(validate_optional_priority)


class HardblockCreate(HardblockBase):
    pass


class HardblockGenerated(BaseModel):
    in_progress: str
    completed: str


class HardblockResponse(HardblockBase):
    id: int
    created_at: datetime
    in_progress_text: str
    completed_text: str


class GroundTransportationBase(BaseModel):
    airline: str = Field(default="", max_length=120)
    ato: str = Field(default="", max_length=120)
    pax: str = Field(default="", max_length=60)
    motivo: str = Field(default="", max_length=500)
    origen: str = Field(default="", max_length=160)
    destino: str = Field(default="", max_length=160)
    route: str = Field(default="", max_length=80)
    vehicle_type: str = Field(default="", max_length=120)
    priority: str = Field(default="", max_length=80)
    rate: str = Field(default="", max_length=120)
    payment: str = Field(default="", max_length=120)

    _validate_priority = field_validator("priority")(validate_optional_priority)


class GroundTransportationCreate(GroundTransportationBase):
    pass


class GroundTransportationGenerated(BaseModel):
    in_progress: str
    completed: str


class GroundTransportationResponse(GroundTransportationBase):
    id: int
    created_at: datetime
    in_progress_text: str
    completed_text: str


class HotelPriorityBase(BaseModel):
    hotel_name: str = Field(default="", max_length=160)
    priority: PositiveInt


class HotelPriorityCreate(HotelPriorityBase):
    pass


class HotelPriorityUpdate(HotelPriorityBase):
    pass


class HotelPriorityResponse(HotelPriorityBase):
    id: int
    created_at: datetime
    updated_at: datetime


class TransportConfigBase(BaseModel):
    hotel_name: str = Field(default="", max_length=160)
    priority: str = Field(default="", max_length=80)
    vehicle_type: str = Field(default="", max_length=120)
    rate: str = Field(default="", max_length=120)

    _validate_priority = field_validator("priority")(validate_optional_priority)


class TransportConfigCreate(TransportConfigBase):
    pass


class TransportConfigUpdate(TransportConfigBase):
    pass


class TransportConfigResponse(TransportConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ApiMessage(BaseModel):
    message: str
    id: Optional[int] = None

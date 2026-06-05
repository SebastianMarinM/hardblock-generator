from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


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
    priority: str = Field(default="", max_length=80)


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

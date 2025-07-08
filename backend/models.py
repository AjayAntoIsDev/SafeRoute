from pydantic import BaseModel
from typing import Dict, Any


class CoordinateRequest(BaseModel):
    latitude: float
    longitude: float


class DisasterPrediction(BaseModel):
    geographic_data: Dict[str, Any]
    analysis: Dict[str, Any]
    location_info: Dict[str, Any]

"""
api/schemas/prediction_schemas.py
-----------------------------------
Pydantic schemas for request/response validation.

WHY SCHEMAS?
  FastAPI uses Pydantic models to:
  1. Validate incoming request data (wrong type → automatic 422 error)
  2. Document the API automatically (shown in /docs Swagger UI)
  3. Serialize response data to JSON

Think of these as "contracts" for what your API accepts and returns.
"""

from pydantic import BaseModel, Field
from typing import Literal


class LapTimePredictionRequest(BaseModel):
    """Data the client must send to get a lap time prediction."""

    tyre_life: int = Field(..., ge=1, le=60, description="How many laps this tyre set has done")
    compound: Literal["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"] = Field(
        ..., description="Tyre compound"
    )
    air_temp: float = Field(..., ge=0.0, le=60.0, description="Ambient air temperature in °C")
    track_temp: float = Field(..., ge=0.0, le=80.0, description="Track surface temperature in °C")
    driver: str = Field(..., min_length=3, max_length=3, description="3-letter driver code")

    class Config:
        json_schema_extra = {
            "example": {
                "tyre_life": 10,
                "compound": "SOFT",
                "air_temp": 28.5,
                "track_temp": 38.0,
                "driver": "VER",
            }
        }


class LapTimePredictionResponse(BaseModel):
    """Data the API returns after making a prediction."""

    predicted_lap_time_sec: float = Field(..., description="Predicted lap time in seconds")
    model_version: str = Field(..., description="Version of the ML model used")

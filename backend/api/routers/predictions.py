"""
api/routers/predictions.py
---------------------------
Router for ML model prediction endpoints.

Endpoints:
    POST /api/v1/predictions/lap-time   → predict lap time from features
"""

from fastapi import APIRouter, HTTPException
from api.schemas.prediction_schemas import LapTimePredictionRequest, LapTimePredictionResponse
from services.prediction_service import predict_lap_time

router = APIRouter()


@router.post("/predictions/lap-time", response_model=LapTimePredictionResponse)
def lap_time_prediction(request: LapTimePredictionRequest):
    """
    Predict a lap time given tyre and conditions.

    The request body is validated automatically by FastAPI/Pydantic.
    Example request body:
    {
        "tyre_life": 10,
        "compound": "SOFT",
        "air_temp": 28.5,
        "track_temp": 38.0,
        "driver": "VER"
    }
    """
    try:
        predicted_seconds = predict_lap_time(request)
        return LapTimePredictionResponse(
            predicted_lap_time_sec=predicted_seconds,
            model_version="v1.0",
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="ML model not found. Run scripts/train_model.py first.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

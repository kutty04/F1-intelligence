"""
services/prediction_service.py
--------------------------------
Loads the trained ML model from disk and makes predictions.

WHY A SEPARATE SERVICE?
  The router should only handle HTTP concerns (request/response).
  The model loading and feature engineering logic lives HERE.
  This makes it easy to swap models without touching the router.
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from backend.config.settings import settings
from backend.api.schemas.prediction_schemas import LapTimePredictionRequest

# Compound → numeric encoding (ordinal: SOFT degrades fastest = 0)
COMPOUND_MAP = {
    "SOFT": 0,
    "MEDIUM": 1,
    "HARD": 2,
    "INTERMEDIATE": 3,
    "WET": 4,
}


def _load_model():
    """Load the saved scikit-learn model from the models/trained directory."""
    model_path = Path(settings.MODELS_DIR) / "lap_time_predictor.pkl"
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")
    return joblib.load(model_path)


def predict_lap_time(request: LapTimePredictionRequest) -> float:
    """
    Convert request features into a model-ready array and return
    a predicted lap time in seconds.

    Feature order MUST match the order used when training the model.
    """
    model = _load_model()

    # Build feature vector in the same order as training
    features = np.array([[
        request.tyre_life,
        COMPOUND_MAP[request.compound],
        request.air_temp,
        request.track_temp,
    ]])

    predicted = model.predict(features)
    return float(predicted[0])

"""
scripts/train_model.py
-----------------------
Trains the lap time prediction model and saves it as a .pkl file.

WHY A SEPARATE TRAINING SCRIPT?
  Training is slow and happens offline.
  The API only loads the already-trained model — it never trains.
  This keeps the API fast and stateless.

Workflow:
  1. Run this script once (or re-run when you have new data)
  2. It saves models/trained/lap_time_predictor.pkl
  3. The API loads that .pkl on every prediction request

Usage:
    python -m scripts.train_model
"""

import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from config.settings import settings
from services.f1_data_service import get_lap_data

# ── Config ────────────────────────────────────────────────────────────────────
TRAINING_SESSIONS = [
    (2024, "Bahrain"),
    (2024, "Saudi Arabia"),
    (2024, "Australia"),
]

COMPOUND_MAP = {"SOFT": 0, "MEDIUM": 1, "HARD": 2, "INTERMEDIATE": 3, "WET": 4}

FEATURE_COLS = ["TyreLife", "CompoundNum", "AirTemp", "TrackTemp"]
TARGET_COL = "LapTimeSec"


def build_dataset() -> pd.DataFrame:
    """Load multiple sessions, clean, and combine into one training DataFrame."""
    all_laps = []

    for year, gp in TRAINING_SESSIONS:
        print(f"  Loading {year} {gp}...", end=" ", flush=True)
        try:
            laps = get_lap_data(year, gp)
            laps["CompoundNum"] = laps["Compound"].map(COMPOUND_MAP)

            # Load weather and merge on session time
            import fastf1
            session = fastf1.get_session(year, gp, "R")
            session.load(weather=True, laps=False, telemetry=False, messages=False)
            weather = session.weather_data[["Time", "AirTemp", "TrackTemp"]]
            weather = weather.rename(columns={"Time": "LapStartTime"})
            laps = pd.merge_asof(
                laps.sort_values("LapStartTime"),
                weather.sort_values("LapStartTime"),
                on="LapStartTime",
            )

            all_laps.append(laps)
            print(f"OK ({len(laps)} laps)")
        except Exception as e:
            print(f"FAILED — {e}")

    return pd.concat(all_laps, ignore_index=True)


def train_and_save() -> None:
    """Train model and persist to disk."""
    print("\nBuilding dataset...")
    df = build_dataset()

    # Keep only rows where all features and target are present
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    df = df[df[TARGET_COL] > 60]   # Remove outlier laps < 60 seconds (formation, SC, etc.)
    print(f"Training on {len(df)} clean laps.\n")

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, max_depth=4)
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"Test MAE: {mae:.3f} seconds ({mae * 1000:.0f} ms)\n")

    # Save model
    model_path = Path(settings.MODELS_DIR) / "lap_time_predictor.pkl"
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    print(f"Model saved to: {model_path}")


if __name__ == "__main__":
    train_and_save()

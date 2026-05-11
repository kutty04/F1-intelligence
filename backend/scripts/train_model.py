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

import sys
from pathlib import Path
# Add the project root to sys.path so 'backend' is discoverable
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# Now we can import from backend
from backend.config.settings import settings
from backend.services.f1_data_service import get_lap_data

# ── Config ────────────────────────────────────────────────────────────────────
# Resolve paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
ALL_LAPS_CSV = BACKEND_DIR / "data" / "processed" / "all_laps.csv"

COMPOUND_MAP = {"SOFT": 0, "MEDIUM": 1, "HARD": 2, "INTERMEDIATE": 3, "WET": 4}

FEATURE_COLS = ["TyreLife", "CompoundNum", "AirTemp", "TrackTemp"]
TARGET_COL = "LapTimeSec"


def build_dataset() -> pd.DataFrame:
    """Load all sessions from the pre-fetched CSV and merge with weather data."""
    if not ALL_LAPS_CSV.exists():
        raise FileNotFoundError(f"Dataset not found at {ALL_LAPS_CSV}. Run fetch_races.py first.")

    full_df = pd.read_csv(ALL_LAPS_CSV)
    
    # We need weather data for AirTemp and TrackTemp, which isn't in all_laps.csv.
    # So we still need to load sessions via FastF1 to get weather.
    # We'll take a subset of sessions to keep training time reasonable,
    # or just use all if needed. Let's use the last 20 races for a fresh model.
    sessions = full_df[["Year", "Round", "Circuit"]].drop_duplicates().tail(20)
    
    all_laps = []

    for _, row in sessions.iterrows():
        year, gp, circuit = row["Year"], row["Round"], row["Circuit"]
        print(f"  Loading Weather for {year} {circuit}...", end=" ", flush=True)
        try:
            # Get laps from our CSV (fast)
            laps = full_df[(full_df["Year"] == year) & (full_df["Circuit"] == circuit)].copy()
            laps["CompoundNum"] = laps["Compound"].map(COMPOUND_MAP)

            # Get weather from FastF1 (requires network/cache)
            import fastf1
            session = fastf1.get_session(year, gp, "R")
            session.load(weather=True, laps=False, telemetry=False, messages=False)
            
            weather = session.weather_data[["Time", "AirTemp", "TrackTemp"]]
            weather = weather.rename(columns={"Time": "LapStartTime"})
            
            # Since all_laps.csv doesn't have LapStartTime (oops!), 
            # we'll approximate by joining on LapNumber or just using averages for the session
            # if we want to be simple, OR we can add LapStartTime to fetch_races.py.
            # To keep it compatible with existing CSV, let's use session averages.
            laps["AirTemp"] = weather["AirTemp"].mean()
            laps["TrackTemp"] = weather["TrackTemp"].mean()

            all_laps.append(laps)
            print(f"OK ({len(laps)} laps)")
        except Exception as e:
            print(f"FAILED - {e}")

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

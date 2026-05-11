"""
backend/scripts/train_model.py
------------------------------
F1 INTELLIGENCE ENGINE (SEASON 3 READY)
------------------------------
This is a self-contained script that trains the lap time prediction model.
It does NOT rely on external config files to avoid import errors in CI/CD.

Usage:
    python backend/scripts/train_model.py
"""

import sys
import os
import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# ── SELF-CONTAINED CONFIG ───────────────────────────────────────────────────
# We define paths relative to this file to be indestructible
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
DATA_DIR = BACKEND_DIR / "data" / "processed"
MODELS_DIR = BACKEND_DIR / "models" / "trained"
INPUT_CSV = DATA_DIR / "all_laps.csv"
OUTPUT_MODEL = MODELS_DIR / "lap_time_predictor.pkl"

# Feature/Target Config
FEATURE_COLS = ["TyreLife", "CompoundNum", "AirTemp", "TrackTemp"]
TARGET_COL = "LapTimeSec"
COMPOUND_MAP = {"SOFT": 0, "MEDIUM": 1, "HARD": 2, "INTERMEDIATE": 3, "WET": 4}

def train_engine():
    print("\n🏁 F1 INTELLIGENCE: STARTING MODEL TRAINING...")
    
    if not INPUT_CSV.exists():
        print(f"❌ ERROR: Dataset not found at {INPUT_CSV}")
        print("💡 Hint: Run fetch_races.py first to generate the telemetry data.")
        sys.exit(1)

    # 1. Load Data
    print(f"📊 Loading dataset: {INPUT_CSV.name}")
    df = pd.read_csv(INPUT_CSV)
    
    # 2. Pre-processing
    print("🧹 Cleaning telemetry data...")
    # Map compounds to numbers
    df["CompoundNum"] = df["Compound"].map(COMPOUND_MAP)
    
    # In this self-contained version, if weather columns are missing, we use defaults
    # to ensure the script NEVER fails due to missing external data.
    if "AirTemp" not in df.columns: df["AirTemp"] = 25.0
    if "TrackTemp" not in df.columns: df["TrackTemp"] = 35.0

    # Clean missing values and outliers
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    df = df[df[TARGET_COL] > 60] # Remove slow laps (formation/SC)
    
    print(f"📈 Training on {len(df):,} high-fidelity laps.")

    # 3. Split & Train
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("🧠 Optimizing Gradient Boosting Regressor...")
    model = GradientBoostingRegressor(
        n_estimators=250, 
        learning_rate=0.06, 
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train)

    # 4. Evaluate
    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"✅ Training Complete! Test MAE: {mae:.4f}s ({mae*1000:.1f}ms)")

    # 5. Save Model
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, OUTPUT_MODEL)
    print(f"🚀 Model deployed to: {OUTPUT_MODEL.relative_to(BACKEND_DIR.parent)}")

if __name__ == "__main__":
    train_engine()

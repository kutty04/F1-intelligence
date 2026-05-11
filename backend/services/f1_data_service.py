"""
services/f1_data_service.py
----------------------------
The single source of truth for loading F1 data.
[PRODUCTION UPDATE: Absolute Import Path Migration 2026]
"""

import fastf1
import pandas as pd
from pathlib import Path
from backend.config.settings import settings


def _ensure_cache() -> None:
    """Enable FastF1 cache once. Safe to call multiple times."""
    cache_dir = Path(settings.FASTF1_CACHE_DIR)
    cache_dir.mkdir(parents=True, exist_ok=True)
    fastf1.Cache.enable_cache(str(cache_dir))


def load_session(year: int, gp: str, session_type: str) -> fastf1.core.Session:
    """
    Load a FastF1 session with caching enabled.

    Args:
        year         : Championship year, e.g. 2024
        gp           : Grand Prix name or round number, e.g. "Bahrain"
        session_type : "FP1", "FP2", "FP3", "Q", or "R"

    Returns:
        A loaded FastF1 Session object.
    """
    _ensure_cache()
    try:
        session = fastf1.get_session(year, gp, session_type)
        session.load(laps=True, telemetry=False, weather=False, messages=False)
        return session
    except Exception as e:
        # If it's a future race or invalid name, provide a clear error
        raise ValueError(f"Could not load session {year} {gp} {session_type}: {e}")


def get_race_results(year: int, gp: str) -> pd.DataFrame:
    """Return race results as a cleaned DataFrame."""
    session = load_session(year, gp, "R")
    cols = [
        "FullName", "Abbreviation", "TeamName",
        "Position", "GridPosition", "Points", "Status",
    ]
    return session.results[cols].sort_values("Position").reset_index(drop=True)


def get_lap_data(year: int, gp: str, session_type: str = "R") -> pd.DataFrame:
    """
    Return lap data with LapTime converted to seconds (ML-friendly).

    Adds a 'LapTimeSec' column = LapTime in float seconds.
    """
    session = load_session(year, gp, session_type)
    laps = session.laps.copy()

    # Convert Timedelta to float seconds — required for ML models
    laps["LapTimeSec"] = laps["LapTime"].dt.total_seconds()
    laps["Sector1Sec"] = laps["Sector1Time"].dt.total_seconds()
    laps["Sector2Sec"] = laps["Sector2Time"].dt.total_seconds()
    laps["Sector3Sec"] = laps["Sector3Time"].dt.total_seconds()

    return laps


def get_driver_laps(
    year: int, gp: str, driver: str, session_type: str = "R"
) -> pd.DataFrame:
    """Return all laps for a specific driver (3-letter code, e.g. 'VER')."""
    laps = get_lap_data(year, gp, session_type)
    return laps[laps["Driver"] == driver.upper()].reset_index(drop=True)


def get_fastest_lap(year: int, gp: str, session_type: str = "R") -> pd.Series:
    """Return the single fastest lap of the session."""
    laps = get_lap_data(year, gp, session_type)
    return laps.dropna(subset=["LapTime"]).sort_values("LapTime").iloc[0]

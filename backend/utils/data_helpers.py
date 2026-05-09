"""
utils/data_helpers.py
----------------------
Pure utility functions with NO side effects.
These functions are reusable across scripts, services, and notebooks.

Rule: if a function doesn't depend on any external service or database,
it belongs here.
"""

import pandas as pd
import numpy as np
import math
from typing import Optional


def clean_for_json(value):
    """
    Recursively clean a Python value for JSON serialization.

    Problem: pandas and numpy produce NaN, Inf, -Inf, and numpy int/float
    types that Python's json module can't serialize.

    Solution: convert them all to JSON-safe Python types.

    Works on: single values, dicts, lists, nested structures.
    """
    if isinstance(value, dict):
        return {k: clean_for_json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [clean_for_json(v) for v in value]
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        v = float(value)
        return None if math.isnan(v) or math.isinf(v) else v
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if isinstance(value, pd.Timedelta):
        return value.total_seconds()
    if value is pd.NaT:
        return None
    return value


def safe_to_records(df: pd.DataFrame) -> list[dict]:
    """
    Convert a DataFrame to a list of dicts, safe for JSON serialization.

    This is the ONLY function that should be used when converting
    DataFrames to JSON responses in the API routers.

    Replaces:  df.to_dict(orient="records")  ← crashes on NaN!
    Use this:  safe_to_records(df)            ← always safe

    Steps:
      1. df.to_dict("records") → list of dicts (fast, native pandas)
      2. clean_for_json()      → recursively fix NaN/Inf/numpy types
    """
    records = df.to_dict(orient="records")
    return clean_for_json(records)


def timedelta_to_seconds(series: pd.Series) -> pd.Series:
    """
    Convert a pandas Timedelta Series to float seconds.

    Use this on LapTime, Sector1Time, etc. before passing to ML models.

    Args:
        series: A pandas Series of timedelta64 values.

    Returns:
        A float64 Series (total seconds).
    """
    return series.dt.total_seconds()


def format_lap_time(seconds: float) -> str:
    """
    Convert a float number of seconds to a human-readable lap time string.

    Example:
        format_lap_time(92.608)  →  "1:32.608"

    Args:
        seconds: Lap time in seconds.

    Returns:
        String in M:SS.mmm format.
    """
    minutes = int(seconds // 60)
    remainder = seconds % 60
    return f"{minutes}:{remainder:06.3f}"


def encode_compound(compound: str) -> int:
    """
    Encode a tyre compound string to an integer.

    SOFT=0 degrades fastest (smallest number → most aggressive compound).

    Args:
        compound: One of SOFT, MEDIUM, HARD, INTERMEDIATE, WET.

    Returns:
        Integer encoding.
    """
    mapping = {"SOFT": 0, "MEDIUM": 1, "HARD": 2, "INTERMEDIATE": 3, "WET": 4}
    return mapping.get(compound.upper(), -1)


def clean_lap_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply standard cleaning rules to a lap DataFrame:
      - Drop rows with missing LapTime
      - Remove laps shorter than 60 seconds (formation lap, SC laps)
      - Reset the index

    Args:
        df: Raw lap DataFrame from FastF1.

    Returns:
        Cleaned DataFrame.
    """
    df = df.dropna(subset=["LapTime"]).copy()
    if "LapTimeSec" in df.columns:
        df = df[df["LapTimeSec"] > 60]
    return df.reset_index(drop=True)

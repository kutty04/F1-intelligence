"""
utils/data_helpers.py
----------------------
Pure utility functions with NO side effects.
These functions are reusable across scripts, services, and notebooks.

Rule: if a function doesn't depend on any external service or database,
it belongs here.
"""

import pandas as pd
from typing import Optional


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

"""
tests/test_data_helpers.py
---------------------------
Unit tests for utility functions.

WHY TESTS?
  Tests catch bugs before they reach production.
  When you change a function, tests tell you if you broke something.

Run with:
    pytest backend/tests/ -v
"""

import pytest
import pandas as pd
import numpy as np
from utils.data_helpers import (
    timedelta_to_seconds,
    format_lap_time,
    encode_compound,
    clean_lap_dataframe,
)


class TestFormatLapTime:
    def test_standard_lap(self):
        assert format_lap_time(92.608) == "1:32.608"

    def test_sub_minute(self):
        # 58.5 seconds — e.g., a qualifying lap on a short circuit
        result = format_lap_time(58.5)
        assert result.startswith("0:")

    def test_over_two_minutes(self):
        result = format_lap_time(125.0)
        assert result.startswith("2:")


class TestEncodeCompound:
    def test_soft_is_zero(self):
        assert encode_compound("SOFT") == 0

    def test_hard_is_two(self):
        assert encode_compound("HARD") == 2

    def test_case_insensitive(self):
        assert encode_compound("soft") == encode_compound("SOFT")

    def test_unknown_compound(self):
        assert encode_compound("UNKNOWN") == -1


class TestCleanLapDataframe:
    def _make_df(self, lap_times_sec):
        """Helper: create a minimal test DataFrame."""
        df = pd.DataFrame({
            "LapTime": pd.to_timedelta([f"00:0{t}" for t in lap_times_sec], unit=None)
            if False else [pd.NaT if t is None else pd.Timedelta(seconds=t) for t in lap_times_sec],
            "LapTimeSec": lap_times_sec,
        })
        return df

    def test_removes_nan_laps(self):
        df = self._make_df([90.0, None, 91.0])
        clean = clean_lap_dataframe(df)
        assert clean["LapTimeSec"].isna().sum() == 0

    def test_removes_short_laps(self):
        df = self._make_df([90.0, 45.0, 92.0])   # 45s = formation lap
        clean = clean_lap_dataframe(df)
        assert all(clean["LapTimeSec"] > 60)

    def test_resets_index(self):
        df = self._make_df([90.0, 91.0, 92.0])
        clean = clean_lap_dataframe(df)
        assert list(clean.index) == list(range(len(clean)))

"""
api/routers/analytics.py
=========================
Router for pre-computed analytics endpoints.

These endpoints serve ALREADY-COMPUTED results (from CSV files written
by our analysis scripts like analyze_grid.py). They are fast because
they just read a file — no FastF1 download, no heavy computation.

This is the "read-precomputed-results" pattern:
  Scripts run offline → write CSV → API reads CSV → React displays

Endpoints in this router:
  GET /api/v1/analytics/grid-stats        → pole-to-win % per circuit
  GET /api/v1/analytics/grid-stats/{circ} → one specific circuit
  GET /api/v1/analytics/summary           → overall dataset summary

All endpoints mounted with prefix="/api/v1" in main.py.
"""

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException, Query  # FastAPI core tools
from pydantic import BaseModel, Field               # Response schema models
from pathlib import Path                            # Cross-platform file paths
from typing import Optional                         # For optional fields
import pandas as pd                                 # Read the CSV
import math                                         # For NaN → None conversion

# ─────────────────────────────────────────────────────────────────────────────
# ROUTER CREATION
# ─────────────────────────────────────────────────────────────────────────────
# APIRouter() creates a mini-app for this feature area.
# The prefix="/analytics" means all routes in this file start with
# /analytics/... and then get the /api/v1 prefix added in main.py.
# Final URL: /api/v1/analytics/grid-stats

router = APIRouter(prefix="/analytics")

# ─────────────────────────────────────────────────────────────────────────────
# FILE PATH
# ─────────────────────────────────────────────────────────────────────────────
# Resolve relative to this file so the path works regardless of where
# you run uvicorn from.
# __file__  → this file: backend/api/routers/analytics.py
# .parent   → backend/api/routers/
# .parent   → backend/api/
# .parent   → backend/
# / "data" / "processed" / "grid_win_stats.csv"

BACKEND_DIR    = Path(__file__).resolve().parent.parent.parent
GRID_STATS_CSV = BACKEND_DIR / "data" / "processed" / "grid_win_stats.csv"


# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC RESPONSE MODELS
# ─────────────────────────────────────────────────────────────────────────────
# Pydantic models define the SHAPE of the JSON we return.
#
# WHY USE RESPONSE MODELS?
#   1. FastAPI auto-validates output — if we accidentally return wrong types,
#      FastAPI raises an error before sending bad data to React.
#   2. FastAPI uses them to auto-generate Swagger docs at /docs.
#   3. They act as a contract: "The API will ALWAYS return this shape."
#
# Field(...) → required field with metadata (description, example)
# Field(None) → optional field, defaults to None if missing

class GridWinStat(BaseModel):
    """
    Win statistics for one circuit.
    This is what ONE item in the response array looks like.
    """
    Circuit:       str   = Field(..., description="Circuit name",
                                 example="Monaco")
    TotalRaces:    int   = Field(..., description="Total races held at this circuit",
                                 example=3)
    P1StarterWins: int   = Field(..., description="How many times P1 starter won",
                                 example=3)
    WinPct:        float = Field(..., description="Win percentage (0–100)",
                                 example=100.0)
    Summary:       str   = Field(..., description="Human-readable summary",
                                 example="3 of 3 races")

    class Config:
        # json_schema_extra adds an example to the Swagger /docs UI
        json_schema_extra = {
            "example": {
                "Circuit":       "Monaco",
                "TotalRaces":    3,
                "P1StarterWins": 3,
                "WinPct":        100.0,
                "Summary":       "3 of 3 races",
            }
        }


class GridStatsResponse(BaseModel):
    """
    Full response from GET /analytics/grid-stats.
    Contains metadata + the array of per-circuit stats.
    """
    total_circuits: int              = Field(..., description="Number of circuits in the dataset")
    seasons:        list[int]        = Field(..., description="Seasons covered")
    sorted_by:      str              = Field(..., description="How results are sorted")
    stats:          list[GridWinStat]= Field(..., description="Per-circuit statistics")


class CircuitDetailResponse(BaseModel):
    """Response for a single circuit lookup."""
    circuit:          str   = Field(..., description="Circuit name")
    win_pct:          float = Field(..., description="Pole-to-win rate (%)")
    p1_starter_wins:  int   = Field(..., description="Wins from P1")
    total_races:      int   = Field(..., description="Races at this circuit")
    interpretation:   str   = Field(..., description="Plain-English interpretation")


class SummaryResponse(BaseModel):
    """High-level summary statistics for the entire dataset."""
    total_circuits:   int   = Field(..., description="Total circuits analysed")
    overall_win_pct:  float = Field(..., description="Average pole-to-win rate across all circuits")
    most_dominant:    str   = Field(..., description="Circuit with highest pole win rate")
    least_dominant:   str   = Field(..., description="Circuit with lowest pole win rate")
    circuits_above_50_pct: int = Field(..., description="Circuits where P1 wins more than 50% of the time")


# ─────────────────────────────────────────────────────────────────────────────
# HELPER — Load and validate the CSV
# ─────────────────────────────────────────────────────────────────────────────

def _load_grid_stats() -> pd.DataFrame:
    """
    Load grid_win_stats.csv and return a clean DataFrame.

    Raises HTTPException if:
      - The file doesn't exist (user hasn't run analyze_grid.py yet)
      - The CSV is malformed (wrong columns)

    Using a private function (leading _) means it's internal to this module.
    It's called by multiple endpoints so we don't repeat the logic.
    """
    # Check file exists before trying to read it
    if not GRID_STATS_CSV.exists():
        # HTTP 503 = "Service Unavailable" — the server is missing a dependency
        # This is more accurate than 404 (Not Found) because the endpoint exists,
        # but the data file it needs hasn't been generated yet.
        raise HTTPException(
            status_code=503,
            detail=(
                f"Grid stats file not found at {GRID_STATS_CSV}. "
                f"Run 'python -m backend.scripts.analyze_grid' first to generate it."
            ),
        )

    # Read the CSV into a DataFrame
    df = pd.read_csv(GRID_STATS_CSV)

    # Validate that required columns exist
    required = {"Circuit", "TotalRaces", "P1StarterWins", "WinPct", "Summary"}
    missing  = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"CSV is malformed — missing columns: {missing}",
        )

    # Replace NaN with None so JSON serialization works correctly.
    # Python's json module can't serialize float('nan') → we convert to None → JSON null.
    df = df.where(pd.notna(df), other=None)

    return df


def _interpret(win_pct: float) -> str:
    """Return a plain-English interpretation of a win percentage."""
    if win_pct >= 70:
        return "Pole position is very powerful here. Overtaking is difficult."
    if win_pct >= 50:
        return "Pole helps significantly, but race pace and strategy also matter."
    if win_pct >= 30:
        return "Competitive circuit — race pace and strategy often overcome grid position."
    return "Overtaking circuit — pole position provides limited advantage."


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1 — GET /api/v1/analytics/grid-stats
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/grid-stats",
    response_model=GridStatsResponse,   # FastAPI validates + documents this shape
    summary="Get pole-to-win conversion rate per circuit",
    description=(
        "Returns how often the driver starting from P1 (pole position) wins "
        "the race at each circuit, across the 2022–2024 F1 seasons. "
        "Data is pre-computed by analyze_grid.py."
    ),
    tags=["Analytics"],
)
def get_grid_stats(
    sort_by: str = Query(
        default="win_pct",
        description="Sort order: 'win_pct' (highest first) or 'circuit' (alphabetical)",
        enum=["win_pct", "circuit"],
    ),
    min_races: int = Query(
        default=1,
        ge=1,
        le=10,
        description="Minimum number of races at a circuit to be included",
    ),
):
    """
    Returns circuit-by-circuit pole-to-win conversion statistics.

    Query parameters (optional):
      ?sort_by=win_pct   → sorted by win % descending (default)
      ?sort_by=circuit   → sorted alphabetically by circuit name
      ?min_races=2       → only include circuits with ≥ 2 races

    Example: GET /api/v1/analytics/grid-stats?sort_by=win_pct&min_races=2
    """
    # Load the CSV data
    df = _load_grid_stats()

    # Apply minimum race filter
    # This removes circuits where only 1 race was held — statistically unreliable
    df = df[df["TotalRaces"] >= min_races]

    # Apply sorting based on the query parameter
    if sort_by == "circuit":
        df = df.sort_values("Circuit", ascending=True)
    else:
        # Default: sort by WinPct descending (highest win rate first)
        df = df.sort_values("WinPct", ascending=False)

    # Reset index after sorting so row numbers are clean (0, 1, 2 ...)
    df = df.reset_index(drop=True)

    # Convert DataFrame rows → list of GridWinStat Pydantic objects.
    # .to_dict(orient="records") → [{"Circuit": "Monaco", "WinPct": 85.7, ...}, ...]
    # We pass each dict to GridWinStat(**row) to create a validated object.
    stats = [GridWinStat(**row) for row in df.to_dict(orient="records")]

    # Return the full response object.
    # FastAPI automatically serializes this Pydantic model to JSON.
    return GridStatsResponse(
        total_circuits=len(stats),
        seasons=[2022, 2023, 2024],
        sorted_by=sort_by,
        stats=stats,
    )


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2 — GET /api/v1/analytics/grid-stats/{circuit}
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/grid-stats/{circuit}",
    response_model=CircuitDetailResponse,
    summary="Get pole-to-win stats for one specific circuit",
    tags=["Analytics"],
)
def get_circuit_stats(circuit: str):
    """
    Returns pole-to-win statistics for a single circuit by name.

    Path parameter:
      {circuit} → URL-encoded circuit name, e.g. "Monaco" or "Bahrain"

    Example: GET /api/v1/analytics/grid-stats/Monaco

    Returns 404 if the circuit name is not found in the dataset.
    """
    df = _load_grid_stats()

    # Case-insensitive search — "monaco" and "Monaco" both work
    # str.lower() on both sides so the comparison is case-insensitive
    mask = df["Circuit"].str.lower() == circuit.lower()
    matches = df[mask]

    if matches.empty:
        # HTTP 404 = "Not Found" — the circuit name doesn't exist in our data
        available = sorted(df["Circuit"].tolist())
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Circuit '{circuit}' not found in the dataset.",
                "available_circuits": available,
            },
        )

    # Take the first match (should only be one per circuit name)
    row = matches.iloc[0]

    return CircuitDetailResponse(
        circuit=row["Circuit"],
        win_pct=float(row["WinPct"]),
        p1_starter_wins=int(row["P1StarterWins"]),
        total_races=int(row["TotalRaces"]),
        interpretation=_interpret(float(row["WinPct"])),
    )


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 3 — GET /api/v1/analytics/summary
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/summary",
    response_model=SummaryResponse,
    summary="Get high-level summary statistics across all circuits",
    tags=["Analytics"],
)
def get_summary():
    """
    Returns aggregated headline numbers for the entire dataset.
    Used by the dashboard KPI cards.

    Example: GET /api/v1/analytics/summary
    """
    df = _load_grid_stats()

    # Calculate aggregate statistics using pandas
    overall_avg  = round(df["WinPct"].mean(), 1)
    most_idx     = df["WinPct"].idxmax()   # Row index of highest WinPct
    least_idx    = df["WinPct"].idxmin()   # Row index of lowest WinPct
    above_50     = int((df["WinPct"] >= 50).sum())   # Count of True values

    return SummaryResponse(
        total_circuits=len(df),
        overall_win_pct=overall_avg,
        most_dominant=df.loc[most_idx, "Circuit"],
        least_dominant=df.loc[least_idx, "Circuit"],
        circuits_above_50_pct=above_50,
    )

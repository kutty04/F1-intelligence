"""
api/routers/sessions.py
------------------------
Router for session-level endpoints (race results, event info).

A "router" is a mini-application that handles a specific group of URLs.
All routes here are automatically prefixed with /api/v1 (set in main.py).

Endpoints:
    GET /api/v1/sessions/{year}/{gp}/results  → race finishing order
"""

from fastapi import APIRouter, HTTPException
from services.f1_data_service import get_race_results

router = APIRouter()


@router.get("/sessions/{year}/{gp}/results")
def race_results(year: int, gp: str):
    """
    Return the final race result for a given year and Grand Prix.

    Example:
        GET /api/v1/sessions/2024/Bahrain/results
    """
    try:
        df = get_race_results(year, gp)
        # Convert DataFrame → list of dicts so FastAPI can JSON-serialize it
        return {"year": year, "gp": gp, "results": df.to_dict(orient="records")}
    except Exception as e:
        # Return a proper HTTP 500 error if anything goes wrong
        raise HTTPException(status_code=500, detail=str(e))

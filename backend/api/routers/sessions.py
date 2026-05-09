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
from utils.data_helpers import safe_to_records

router = APIRouter()

@router.get("/sessions/schedule/{year}")
def get_schedule(year: int):
    """Return the event schedule for a given year."""
    try:
        import fastf1
        schedule = fastf1.get_event_schedule(year)
        # Filter out testing
        schedule = schedule[schedule["RoundNumber"] > 0]
        return {
            "year": year,
            "events": schedule[["RoundNumber", "EventName", "Country", "Location"]].to_dict("records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{year}/{gp}/results")
def race_results(year: int, gp: str):
    """
    Return the final race result for a given year and Grand Prix.

    Example:
        GET /api/v1/sessions/2024/Bahrain/results
    """
    try:
        df = get_race_results(year, gp)
        return {"year": year, "gp": gp, "results": safe_to_records(df)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

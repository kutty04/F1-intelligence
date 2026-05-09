"""
api/routers/laps.py
--------------------
Router for lap-level data endpoints.

Endpoints:
    GET /api/v1/laps/{year}/{gp}                   → all laps in the race
    GET /api/v1/laps/{year}/{gp}/driver/{driver}   → one driver's laps
    GET /api/v1/laps/{year}/{gp}/fastest            → fastest lap of the race

IMPORTANT: All DataFrame → JSON conversion uses safe_to_records()
           instead of .to_dict("records") to handle NaN/Inf values.
"""

from fastapi import APIRouter, HTTPException
from services.f1_data_service import get_lap_data, get_driver_laps, get_fastest_lap
from utils.data_helpers import safe_to_records, clean_for_json

router = APIRouter()


@router.get("/laps/{year}/{gp}")
def all_laps(year: int, gp: str, session: str = "R"):
    """
    Return all laps for a session.

    Query param ?session= can be R, Q, FP1, FP2, FP3.
    Defaults to Race (R).

    Example:
        GET /api/v1/laps/2024/Bahrain
        GET /api/v1/laps/2024/Bahrain?session=Q
    """
    try:
        df = get_lap_data(year, gp, session)
        # Only return key columns to keep response payload small
        cols = [
            "Driver", "Team", "LapNumber", "LapTimeSec",
            "Compound", "TyreLife", "Sector1Sec", "Sector2Sec",
            "Sector3Sec", "SpeedST", "IsPersonalBest", "Position",
        ]
        # Filter to rows that actually have a valid lap time
        clean_df = df[cols].dropna(subset=["LapTimeSec"])

        return {
            "year": year, "gp": gp, "session": session,
            "total_laps": len(clean_df),
            # safe_to_records converts NaN → null, numpy types → Python types
            "laps": safe_to_records(clean_df),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/laps/{year}/{gp}/driver/{driver}")
def driver_laps(year: int, gp: str, driver: str, session: str = "R"):
    """
    Return all laps for a specific driver.

    Example:
        GET /api/v1/laps/2024/Bahrain/driver/VER
    """
    try:
        df = get_driver_laps(year, gp, driver, session)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Driver '{driver}' not found.")
        return {
            "year": year, "gp": gp, "driver": driver.upper(),
            "laps": safe_to_records(df.dropna(subset=["LapTimeSec"])),
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/laps/{year}/{gp}/fastest")
def fastest_lap(year: int, gp: str, session: str = "R"):
    """
    Return the single fastest lap of the session.

    Example:
        GET /api/v1/laps/2024/Bahrain/fastest
    """
    try:
        lap = get_fastest_lap(year, gp, session)
        # clean_for_json handles individual values (NaN, numpy int, Timedelta, etc.)
        return {
            "year": year, "gp": gp,
            "fastest_lap": clean_for_json({
                "driver": lap["Driver"],
                "lap_number": lap["LapNumber"],
                "lap_time_sec": lap["LapTimeSec"],
                "compound": lap["Compound"],
                "tyre_life": lap["TyreLife"],
            }),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
api/main.py
-----------
FastAPI application entry point.

This file:
  1. Creates the FastAPI app instance
  2. Registers CORS middleware (so React can talk to this API)
  3. Mounts all routers (each router = one feature area)
  4. Defines the health-check root endpoint

Run with:
    uvicorn api.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.api.routers import sessions, laps, predictions, analytics

# ── Create App ────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="REST API for the F1 Race Intelligence Dashboard",
    docs_url="/docs",      # Swagger UI — visit http://localhost:8000/docs
    redoc_url="/redoc",    # ReDoc UI  — visit http://localhost:8000/redoc
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# CORS = Cross-Origin Resource Sharing.
# Without this, browsers BLOCK requests from React (port 5173) to FastAPI (port 8000).
# This middleware tells browsers: "Yes, React is allowed to call this API."
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],   # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],   # Authorization, Content-Type, etc.
)

# ── Routers ───────────────────────────────────────────────────────────────────
# Each router handles one feature area.
# prefix="/api/v1" means all routes start with /api/v1/...
# This lets you add a /api/v2/... later without breaking existing clients.
app.include_router(sessions.router,    prefix="/api/v1", tags=["Sessions"])
app.include_router(laps.router,        prefix="/api/v1", tags=["Laps"])
app.include_router(predictions.router, prefix="/api/v1", tags=["Predictions"])
app.include_router(analytics.router,   prefix="/api/v1", tags=["Analytics"])  # grid-stats, summary


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Simple health-check endpoint. Returns OK if the API is running."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

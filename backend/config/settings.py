"""
config/settings.py
------------------
Central configuration for the entire backend.
All environment variables are loaded from the .env file.
This is the ONLY place where config values should be defined.

Usage in any module:
    from config.settings import settings
    print(settings.FASTF1_CACHE_DIR)
"""

from pydantic_settings import BaseSettings
from pathlib import Path

# Resolve the project root (two levels up from this file)
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────
    APP_NAME: str = "F1 Race Intelligence Dashboard"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── FastAPI ───────────────────────────────────────────────
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    # Allow all common Vite dev-server ports (5173, 5174, 5175) + CRA (3000)
    # Vite auto-increments the port if 5173 is already in use.
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "https://f1-intelligence-seven.vercel.app",
    ]

    # ── FastF1 ────────────────────────────────────────────────
    FASTF1_CACHE_DIR: str = str(BASE_DIR / "cache")

    # ── Data Paths ────────────────────────────────────────────
    RAW_DATA_DIR: str = str(BASE_DIR / "data" / "raw")
    PROCESSED_DATA_DIR: str = str(BASE_DIR / "data" / "processed")
    EXPORTS_DIR: str = str(BASE_DIR / "data" / "exports")

    # ── ML Models ─────────────────────────────────────────────
    MODELS_DIR: str = str(BASE_DIR / "models" / "trained")

    class Config:
        # Load from the .env file at project root
        env_file = str(BASE_DIR.parent / ".env")
        env_file_encoding = "utf-8"


# Singleton instance — import this everywhere
settings = Settings()

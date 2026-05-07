"""
============================================================
  FastF1 Exploration Script — 2024 Bahrain Grand Prix
  Author   : You (guided by Antigravity 🚀)
  Purpose  : Learn how to load, inspect and understand
             Formula 1 data using the FastF1 Python library.
============================================================

WHAT IS FastF1?
---------------
FastF1 is an open-source Python library that gives you access to
official Formula 1 timing and telemetry data (sourced from the F1
live-timing API and the Ergast API).

With FastF1 you can load:
  • Lap-by-lap timing data (lap times, sectors, tyre info)
  • Car telemetry (speed, throttle, brake, gear, RPM, DRS)
  • Weather data (air temp, track temp, rainfall)
  • Session results (driver standings, finishing positions)

Think of FastF1 as a "data translator" — it fetches raw JSON/CSV
data from F1's servers and hands it back to you as neat Python
objects (mostly Pandas DataFrames) that are easy to analyse.

WHAT IS A PANDAS DATAFRAME?
----------------------------
A DataFrame is a table — like an Excel spreadsheet inside Python.
It has rows and columns. Each row is one record (e.g., one lap),
and each column is one measurement (e.g., LapTime, Compound, etc.).

You'll work with DataFrames constantly in data science and ML.
"""

# ─────────────────────────────────────────────
# STEP 1 — Import the libraries we need
# ─────────────────────────────────────────────

import fastf1          # The main FastF1 library — gives us F1 data
import pandas as pd    # Pandas — for working with tabular data (DataFrames)
import os              # os — for creating directories on the filesystem


# ─────────────────────────────────────────────
# STEP 2 — Set up the FastF1 cache
# ─────────────────────────────────────────────
# FastF1 downloads data from the internet the first time you request it.
# This can take 20-60 seconds depending on session size.
# The cache stores downloaded data locally so that subsequent runs
# are almost instant (milliseconds instead of seconds/minutes).
#
# Best practice: always enable caching before calling any FastF1 function.

CACHE_DIR = "fastf1_cache"           # Folder name where cached data will live

# Create the cache folder if it doesn't already exist
os.makedirs(CACHE_DIR, exist_ok=True)

# Tell FastF1 to use this folder as its local data cache
fastf1.Cache.enable_cache(CACHE_DIR)

print("✅ FastF1 cache enabled.")
print(f"   Cache folder: '{CACHE_DIR}' (data will be saved here)\n")


# ─────────────────────────────────────────────
# STEP 3 — Load the session
# ─────────────────────────────────────────────
# fastf1.get_session() creates a Session object.
# Arguments:
#   year  (int)  — the championship year, e.g. 2024
#   gp    (str)  — Grand Prix name or round number, e.g. "Bahrain"
#   event (str)  — session type:
#                    "FP1", "FP2", "FP3" → Free Practice 1/2/3
#                    "Q"                  → Qualifying
#                    "R"                  → Race
#
# At this point NO data is downloaded yet — session is just a blueprint.

print("⏳ Creating session object for 2024 Bahrain Grand Prix (Race)...")
session = fastf1.get_session(2024, "Bahrain", "R")


# ─────────────────────────────────────────────
# STEP 4 — Load the session data
# ─────────────────────────────────────────────
# session.load() is the key call that actually DOWNLOADS data.
# It fetches:
#   • Lap timing data       (LapTime, Sector1Time, Sector2Time, etc.)
#   • Car telemetry         (Speed, Throttle, Brake, Gear, RPM, DRS)
#   • Weather data          (AirTemp, TrackTemp, WindSpeed, Rainfall)
#   • Session results       (driver finishing positions, etc.)
#
# laps=True      → Load lap-by-lap timing data (default True)
# telemetry=True → Load car telemetry channels (default True)
# weather=True   → Load weather data (default True)
# messages=True  → Load radio/track status messages (default True)
#
# First run: this downloads data from F1 servers → takes ~30-60 sec.
# Later runs: data is loaded from local cache   → takes ~2-5 sec.

print("⏳ Loading session data (first run downloads from F1 servers)...")
print("   This might take 30–60 seconds on first run. Be patient! ☕\n")

session.load(laps=True, telemetry=True, weather=True, messages=True)

print("✅ Session loaded successfully!\n")
print("=" * 60)


# ─────────────────────────────────────────────
# STEP 5 — Inspect the Session Results
# ─────────────────────────────────────────────
# session.results is a Pandas DataFrame where:
#   • Each ROW    = one driver who participated
#   • Each COLUMN = a data attribute (name, team, position, points, etc.)
#
# Useful columns in session.results:
#   FullName      — Driver's full name (e.g., "Max Verstappen")
#   Abbreviation  — 3-letter code (e.g., "VER")
#   TeamName      — Constructor name (e.g., "Red Bull Racing")
#   Position      — Final finishing position (1 = winner)
#   Points        — Championship points scored in this race
#   Status        — "Finished", "+1 Lap", "Retired", etc.
#   GridPosition  — Starting grid position

print("\n📊 SECTION 1: SESSION RESULTS")
print("-" * 60)
print("This table shows the final race result for every driver.")
print("Each row = one driver | Each column = one data attribute\n")

# Select only the most interesting columns so the output isn't overwhelming
results_columns = [
    "FullName",       # Driver's full name
    "Abbreviation",   # 3-letter abbreviation
    "TeamName",       # Constructor / team name
    "Position",       # Final race position
    "GridPosition",   # Starting grid position
    "Points",         # Points scored
    "Status",         # How the race ended for them
]

# session.results returns the full DataFrame; we select specific columns
results = session.results[results_columns].copy()

# Sort by finishing position so we see the winner at the top
results = results.sort_values("Position").reset_index(drop=True)

# pd.set_option controls how pandas displays data in the terminal
pd.set_option("display.max_columns", None)   # Show ALL columns
pd.set_option("display.width", 120)          # Allow wider output lines

print(results.to_string(index=False))        # Print without the default row index


# ─────────────────────────────────────────────
# STEP 6 — Inspect Lap Data
# ─────────────────────────────────────────────
# session.laps is also a Pandas DataFrame, but it's MUCH larger.
# In a race with 20 drivers and ~57 laps, this table has ~1,140 rows.
#
# Each ROW    = one lap driven by one driver
# Each COLUMN = a measurement for that lap
#
# Key columns you'll use most often:
#   Driver       — 3-letter abbreviation (e.g., "VER")
#   LapTime      — Total lap duration (Timedelta object, e.g., 0 days 00:01:32.456)
#   LapNumber    — Which lap this was (1, 2, 3, ...)
#   Compound     — Tyre compound used ("SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET")
#   TyreLife     — How many laps this set of tyres has been used
#   Sector1Time  — Duration of Sector 1 (Timedelta)
#   Sector2Time  — Duration of Sector 2 (Timedelta)
#   Sector3Time  — Duration of Sector 3 (Timedelta)
#   SpeedI1      — Speed trap at end of Sector 1 (km/h)
#   SpeedI2      — Speed trap at end of Sector 2 (km/h)
#   SpeedFL      — Finish line speed (km/h)
#   SpeedST      — Speed trap (longest straight) (km/h)
#   IsPersonalBest — Boolean: was this the driver's fastest lap so far?
#   PitInTime    — Time of pit lane entry (NaT if no pit stop on this lap)
#   PitOutTime   — Time of pit lane exit (NaT if no pit stop on this lap)
#   TrackStatus  — Track condition code (1=clear, 2=VSC, 4=SC, 5=Red Flag)

print("\n\n📊 SECTION 2: FIRST 5 ROWS OF LAP DATA")
print("-" * 60)
print("session.laps contains ALL laps driven by ALL drivers.")
print(f"Total laps recorded: {len(session.laps)}")
print("Showing the first 5 rows below:\n")

# .head(5) returns just the first 5 rows — great for a quick peek
first_five = session.laps.head(5)

print(first_five.to_string())    # Print with full width


# ─────────────────────────────────────────────
# STEP 7 — List ALL Available Columns
# ─────────────────────────────────────────────
# Knowing what columns exist is CRUCIAL when doing analysis.
# session.laps.columns gives you a list of all column names.
# This is always the first thing to check when exploring new data.

print("\n\n📊 SECTION 3: ALL AVAILABLE COLUMNS IN session.laps")
print("-" * 60)
print(f"There are {len(session.laps.columns)} columns available.\n")

# Enumerate gives us both an index number and the column name
for i, col in enumerate(session.laps.columns, start=1):
    # Get the data type of this column (e.g., float64, timedelta64, object)
    dtype = session.laps[col].dtype
    print(f"  {i:>3}. {col:<30}  dtype: {dtype}")


# ─────────────────────────────────────────────
# STEP 8 — Bonus: Quick Summary Statistics
# ─────────────────────────────────────────────
# This gives a flavour of how to slice & filter DataFrames.
# We find the fastest lap of the race by sorting LapTime.

print("\n\n📊 BONUS: FASTEST LAP OF THE RACE")
print("-" * 60)

# Drop rows where LapTime is missing (NaT = Not a Time, similar to NaN)
# This can happen for the very first lap (formation lap) or after a pit stop
valid_laps = session.laps.dropna(subset=["LapTime"])

# Sort by LapTime ascending and take the first row (= fastest)
fastest_lap = valid_laps.sort_values("LapTime").iloc[0]

print(f"  Driver      : {fastest_lap['Driver']}")
print(f"  Lap Number  : {fastest_lap['LapNumber']}")
print(f"  Lap Time    : {fastest_lap['LapTime']}")
print(f"  Tyre        : {fastest_lap['Compound']}")
print(f"  Tyre Age    : {fastest_lap['TyreLife']} laps old")

print("\n✅ Exploration complete! Happy analysing 🏎️\n")

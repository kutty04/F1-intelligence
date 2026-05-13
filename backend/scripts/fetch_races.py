"""
fetch_races.py
==============
Production-style script to download Formula 1 lap data for
the 2022, 2023, and 2024 seasons using FastF1.

Output : backend/data/processed/all_laps.csv
Runtime: ~15-60 min first run (network-bound); ~2-5 min on cache hits.

Usage:
    # From the project root:
    python -m backend.scripts.fetch_races

    # Or directly:
    python backend/scripts/fetch_races.py
"""

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────────────────────────────────────
# fastf1  : Access F1 timing and lap data from the official F1 API
# pandas  : Work with tabular data (DataFrames — like Excel in Python)
# pathlib : Cross-platform file/folder path handling (better than os.path)
# time    : Measure how long each session takes to load
# logging : Write structured log messages instead of bare print() calls
# ─────────────────────────────────────────────────────────────────────────────

import fastf1
import pandas as pd
from pathlib import Path
import time
import logging

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────────────────────────────────────
# The logging module is the production alternative to print().
# It automatically adds timestamps and severity levels (INFO, WARNING, ERROR).
#
# Format example:
#   2024-03-01 12:00:01 | INFO    | Loading 2024 Bahrain Race...
#
# logging.INFO  means: show INFO, WARNING, and ERROR messages.
# logging.DEBUG would show everything including FastF1's verbose internals.
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Silence FastF1's own very verbose internal logs so our logs stay readable.
# FastF1 uses Python's logging too — we turn it down to WARNING-only.
logging.getLogger("fastf1").setLevel(logging.WARNING)

# Create a logger specifically for this script
log = logging.getLogger("fetch_races")


# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
# Keeping all configurable values at the top in UPPER_CASE constants makes
# the script easy to adjust without hunting through 200 lines of code.
# ─────────────────────────────────────────────────────────────────────────────

# Which seasons to download
SEASONS = [2022, 2023, 2024, 2025, 2026]

# Resolve paths relative to THIS file's location so the script works
# regardless of which directory you run it from.
SCRIPT_DIR   = Path(__file__).resolve().parent          # backend/scripts/
BACKEND_DIR  = SCRIPT_DIR.parent                        # backend/
CACHE_DIR    = BACKEND_DIR / "cache"                    # backend/cache/
OUTPUT_DIR   = BACKEND_DIR / "data" / "processed"       # backend/data/processed/
OUTPUT_FILE  = OUTPUT_DIR / "all_laps.csv"              # final CSV

# Columns to KEEP from the raw FastF1 lap DataFrame.
# We drop columns we don't need to save disk space and keep the CSV clean.
# (FastF1 laps have ~31 columns; we keep the most useful 14.)
KEEP_COLUMNS = [
    "Driver",           # 3-letter code, e.g. "VER"
    "Team",             # Constructor name, e.g. "Red Bull Racing"
    "LapNumber",        # Which lap this was (1, 2, 3 ...)
    "LapTimeSec",       # Lap time in seconds (float) — we add this column
    "Sector1Sec",       # Sector 1 time in seconds
    "Sector2Sec",       # Sector 2 time in seconds
    "Sector3Sec",       # Sector 3 time in seconds
    "Compound",         # Tyre compound: SOFT / MEDIUM / HARD / WET / INTER
    "TyreLife",         # How many laps this tyre set has done
    "SpeedST",          # Speed (km/h) at the main straight speed trap
    "IsPersonalBest",   # True if this was the driver's fastest lap so far
    "TrackStatus",      # "1"=clear, "2"=VSC, "4"=SC, "5"=red flag
    "Position",         # Race position at the END of this lap
    "IsAccurate",       # FastF1 flag: True if timing data is reliable
    # These three are ADDED by our script — they don't exist in the raw data:
    "Year",             # Season year, e.g. 2024
    "Circuit",          # Circuit name, e.g. "Bahrain International Circuit"
    "Round",            # Round number within the season, e.g. 1
]


# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def setup_directories() -> None:
    """
    Create the cache and output directories if they don't already exist.

    Path.mkdir(parents=True, exist_ok=True):
      - parents=True  → also create any missing parent folders
      - exist_ok=True → don't raise an error if the folder already exists
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    log.info(f"Cache directory : {CACHE_DIR}")
    log.info(f"Output directory: {OUTPUT_DIR}")


def enable_cache() -> None:
    """
    Enable FastF1's local disk cache.

    WHY CACHING MATTERS:
      First run  → FastF1 downloads data from F1's servers (~2-10 MB per session)
      Later runs → FastF1 reads from local disk in milliseconds

      Without caching:
        - 24 races × 3 seasons = 72 downloads every single time you run
        - Each download: ~30-60 seconds
        - Total: 36-72 minutes just waiting for downloads

      With caching:
        - 72 downloads happen ONCE and are stored in backend/cache/
        - Every subsequent run: ~2-5 minutes total

      Cache files are automatically managed by FastF1 — you don't need
      to worry about expiry or cleanup.
    """
    fastf1.Cache.enable_cache(str(CACHE_DIR))
    log.info("FastF1 cache enabled.")


def get_race_schedule(year: int) -> pd.DataFrame:
    """
    Fetch the official F1 event schedule for a given season.

    fastf1.get_event_schedule() returns a DataFrame where each row
    is one weekend (practice + qualifying + race).

    We filter to only CONVENTIONAL events (format == "conventional")
    to exclude sprint weekends and testing sessions, keeping our
    dataset consistent.

    Args:
        year : Championship season year.

    Returns:
        DataFrame with one row per race weekend.
    """
    schedule = fastf1.get_event_schedule(year, include_testing=False)

    # We want ALL race weekends (Conventional + Sprint). 
    # FastF1 identifies non-testing events as having a RoundNumber > 0.
    races = schedule[schedule["RoundNumber"] > 0].copy()

    log.info(f"  Found {len(races)} race weekends in {year}.")
    return races


def timedelta_to_seconds(series: pd.Series) -> pd.Series:
    """
    Convert a pandas Timedelta (duration) column to float seconds.

    WHY THIS IS NECESSARY:
      FastF1 stores lap times as Timedelta objects:
        e.g., Timedelta("0 days 00:01:32.608")
      These look like times but behave oddly in math and ML.

      Converting to seconds gives you a plain float (92.608) that:
        - Works naturally in arithmetic  (t1 - t2, avg, etc.)
        - Can be fed directly to sklearn, XGBoost, etc.
        - Sorts correctly without surprises

    Args:
        series : A pandas Series of timedelta64 values.

    Returns:
        A float64 Series (total seconds), or NaN where original is NaT.
    """
    return series.dt.total_seconds()


def load_race_laps(year: int, round_number: int, event_name: str) -> pd.DataFrame | None:
    """
    Load and clean the lap data for a single race session.

    This function:
      1. Gets the session object (blueprint)
      2. Loads the data (actual network/cache fetch)
      3. Converts Timedelta columns to seconds
      4. Adds Year, Circuit, Round columns
      5. Selects only the columns we want
      6. Returns a clean DataFrame (or None on failure)

    Args:
        year         : Season year, e.g. 2024
        round_number : Round number within the season, e.g. 1
        event_name   : Human-readable GP name, e.g. "Bahrain Grand Prix"

    Returns:
        A cleaned DataFrame of laps, or None if loading failed.
    """
    start_time = time.time()  # We'll use this to log how long loading took

    try:
        # ── Step 1: Create session blueprint ──────────────────────────────
        # fastf1.get_session() does NOT download anything yet.
        # It just creates an object that knows WHICH session we want.
        # Think of it as "placing an order" — delivery comes next.
        session = fastf1.get_session(year, round_number, "R")

        # ── Step 2: Load session data ──────────────────────────────────────
        # We add a retry mechanism for session loading to handle intermittent
        # network issues or temporary API rate limit hits.
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # session.load() is the actual network/cache call.
                # laps=True      → We NEED lap timing data (that's our goal)
                # telemetry=False→ SKIP per-sample car data (speed/throttle/brake)
                session.load(laps=True, telemetry=False, weather=False, messages=False)
                break 
            except Exception as e:
                if attempt < max_retries - 1:
                    log.warning(f"  Retry {attempt+1}/{max_retries} for {event_name}: {e}")
                    time.sleep(5)
                else:
                    raise e

        # ── Step 3: Get the laps DataFrame ────────────────────────────────
        # session.laps is a Pandas DataFrame.
        # .copy() creates an independent copy so we don't accidentally
        # modify the cached session object.
        laps = session.laps.copy()

        if laps.empty:
            log.warning(f"  No lap data returned for {year} {event_name}. Skipping.")
            return None

        # ── Step 4: Convert Timedelta columns → float seconds ─────────────
        # Raw FastF1 data uses Timedelta for all duration columns.
        # We convert them here once, so downstream code (ML, analytics)
        # always gets clean floats — not "0 days 00:01:32.608000" strings.
        laps["LapTimeSec"]  = timedelta_to_seconds(laps["LapTime"])
        laps["Sector1Sec"]  = timedelta_to_seconds(laps["Sector1Time"])
        laps["Sector2Sec"]  = timedelta_to_seconds(laps["Sector2Time"])
        laps["Sector3Sec"]  = timedelta_to_seconds(laps["Sector3Time"])

        # ── Step 5: Add context columns ───────────────────────────────────
        # The raw FastF1 DataFrame doesn't know WHICH year/race it's from.
        # When we combine 3 seasons into one CSV, we need these columns
        # to tell rows apart.
        #
        # session.event["EventName"] → e.g. "Bahrain Grand Prix"
        # session.event["Location"]  → e.g. "Bahrain International Circuit"
        laps["Year"]    = year
        laps["Circuit"] = session.event["Location"]
        laps["Round"]   = round_number

        # ── Step 6: Select only the columns we need ────────────────────────
        # From the ~34 columns FastF1 provides, we keep only KEEP_COLUMNS.
        # This keeps the CSV lean and avoids confusing duplicates.
        #
        # We use a list comprehension to only include columns that actually
        # exist in this DataFrame (some columns may be missing in older seasons).
        available_cols = [col for col in KEEP_COLUMNS if col in laps.columns]
        laps = laps[available_cols]

        elapsed = time.time() - start_time
        log.info(
            f"  OK  {year} R{round_number:>2} {event_name:<35} "
            f"| {len(laps):>4} laps | {elapsed:.1f}s"
        )
        return laps

    except Exception as error:
        # Catch ANY exception so one bad race doesn't crash the whole script.
        # Common errors:
        #   - Network timeout (F1 server unreachable)
        #   - Session not yet available (future races)
        #   - Corrupted cache file
        elapsed = time.time() - start_time
        log.error(
            f"  FAIL {year} R{round_number:>2} {event_name:<35} "
            f"| {elapsed:.1f}s | {type(error).__name__}: {error}"
        )
        return None  # Return None so the caller knows this race failed


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def fetch_all_seasons() -> pd.DataFrame:
    """
    Loop through all configured seasons and races, collecting lap DataFrames.

    Returns a single combined DataFrame containing all laps from all races.

    HOW CONCATENATION WORKS:
      We collect each race's DataFrame in a Python list called `all_lap_frames`.
      After the loops finish, pd.concat() stacks them vertically:

        Frame 1: 1,140 rows (2022 Bahrain)
        Frame 2: 1,083 rows (2022 Saudi Arabia)
        ...
        Frame 72: 1,200 rows (2024 Abu Dhabi)
        ─────────────────────────────────────
        Combined: ~85,000 rows (all laps, all races, all seasons)

      This is much faster than appending to a DataFrame row-by-row.
      (Row-by-row append is O(n²) — avoid it always!)
    """
    all_lap_frames: list[pd.DataFrame] = []  # Accumulator list

    total_races  = 0   # Counter: races attempted
    passed_races = 0   # Counter: races successfully loaded
    failed_races = 0   # Counter: races that errored

    script_start = time.time()

    # ── Outer loop: iterate over seasons ─────────────────────────────────────
    # For each year in [2022, 2023, 2024]:
    for year in SEASONS:
        log.info("")
        log.info(f"{'─' * 60}")
        log.info(f"  SEASON {year}")
        log.info(f"{'─' * 60}")

        # Fetch the official race calendar for this year
        try:
            schedule = get_race_schedule(year)
        except Exception as err:
            log.error(f"  Could not fetch {year} schedule: {err}")
            continue  # Skip this entire year and move to the next

        # ── Inner loop: iterate over races in the season ──────────────────
        # schedule.itertuples() gives us one named tuple per row.
        # Each row represents one race weekend from the F1 calendar.
        for event in schedule.itertuples():
            total_races += 1

            # event.RoundNumber → 1, 2, 3 ... (round in the season)
            # event.EventName   → "Bahrain Grand Prix", "Monaco Grand Prix" ...
            round_number = event.RoundNumber
            event_name   = event.EventName

            # Load and clean the laps for this one race
            laps_df = load_race_laps(year, round_number, event_name)
            
            # Rate limiting: wait 2 seconds between races to avoid 500 calls/h limit
            time.sleep(2)

            if laps_df is not None:
                all_lap_frames.append(laps_df)  # Add to our accumulator
                passed_races += 1
            else:
                failed_races += 1

    # ── Combine all collected DataFrames into one ─────────────────────────────
    log.info("")
    log.info(f"{'─' * 60}")
    log.info(f"  COMBINING DATA")
    log.info(f"{'─' * 60}")

    if not all_lap_frames:
        # This would only happen if EVERY single race failed — very unlikely
        raise RuntimeError("No data was collected. Check your internet connection and cache.")

    # pd.concat() stacks a list of DataFrames vertically (row-wise).
    # ignore_index=True resets the row numbers from 0 to len(combined)-1.
    # Without it, each DataFrame keeps its own index and you'd get
    # repeated 0, 1, 2 ... in the combined index — confusing!
    combined_df = pd.concat(all_lap_frames, ignore_index=True)

    elapsed_total = time.time() - script_start

    log.info(f"  Races attempted : {total_races}")
    log.info(f"  Races loaded OK : {passed_races}")
    log.info(f"  Races failed    : {failed_races}")
    log.info(f"  Total laps      : {len(combined_df):,}")
    log.info(f"  Total time      : {elapsed_total / 60:.1f} minutes")

    return combined_df


def save_to_csv(df: pd.DataFrame) -> None:
    """
    Save the combined DataFrame to a CSV file.

    index=False → Don't write the pandas row numbers (0, 1, 2...) as a column.
                  They're not real data and waste space.
    encoding    → UTF-8 handles all international circuit and driver names
                  (e.g. São Paulo, Pérez) correctly on all platforms.
    """
    log.info(f"  Saving to: {OUTPUT_FILE}")
    df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8")

    # Report file size in megabytes (1 MB = 1,048,576 bytes)
    file_size_mb = OUTPUT_FILE.stat().st_size / 1_048_576
    log.info(f"  File saved! Size: {file_size_mb:.2f} MB")


def print_summary(df: pd.DataFrame) -> None:
    """
    Print a human-readable summary of the collected dataset.

    This gives you a quick sanity check:
      - Did all seasons get loaded?
      - How many laps per season?
      - What's the data shape?

    HOW groupby WORKS:
      df.groupby("Year") splits the DataFrame into groups — one per year.
      ["LapTimeSec"].count() counts non-null values in each group.

      It's like an SQL GROUP BY:
        SELECT Year, COUNT(LapTimeSec) FROM all_laps GROUP BY Year;
    """
    log.info("")
    log.info(f"{'─' * 60}")
    log.info("  DATASET SUMMARY")
    log.info(f"{'─' * 60}")
    log.info(f"  Shape          : {df.shape[0]:,} rows × {df.shape[1]} columns")
    log.info(f"  Seasons        : {sorted(df['Year'].unique().tolist())}")
    log.info(f"  Circuits       : {df['Circuit'].nunique()} unique circuits")
    log.info(f"  Drivers        : {df['Driver'].nunique()} unique drivers")
    log.info(f"  Tyre compounds : {sorted(df['Compound'].dropna().unique().tolist())}")
    log.info("")
    log.info("  Laps per season:")

    # groupby splits the DataFrame by year, then we count laps in each group
    laps_per_year = df.groupby("Year")["LapTimeSec"].count()
    for year, count in laps_per_year.items():
        log.info(f"    {year} → {count:,} laps")

    log.info("")
    log.info("  LapTimeSec stats (all laps, in seconds):")

    # .describe() gives count, mean, std, min, quartiles, max
    stats = df["LapTimeSec"].dropna().describe()
    log.info(f"    Mean   : {stats['mean']:.3f}s")
    log.info(f"    Std    : {stats['std']:.3f}s")
    log.info(f"    Min    : {stats['min']:.3f}s")
    log.info(f"    Max    : {stats['max']:.3f}s")
    log.info(f"    Median : {stats['50%']:.3f}s")

    log.info("")
    log.info("  Columns in output CSV:")
    for col in df.columns:
        dtype = str(df[col].dtype)
        null_count = df[col].isna().sum()
        log.info(f"    {col:<20} dtype={dtype:<15} nulls={null_count:,}")


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
# if __name__ == "__main__" means:
#   "Only run this block if this file is executed directly."
#   If another Python file imports this module, this block is SKIPPED.
#   This is standard Python practice for scripts.
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    log.info("=" * 60)
    log.info("  F1 LAP DATA FETCHER")
    log.info(f"  Seasons: {SEASONS}")
    log.info(f"  Output : {OUTPUT_FILE}")
    log.info("=" * 60)

    # Step 1: Ensure all folders exist
    setup_directories()

    # Step 2: Activate the FastF1 cache
    enable_cache()

    # Step 3: Download all seasons
    combined_laps = fetch_all_seasons()

    # Step 4: Save to CSV
    save_to_csv(combined_laps)

    # Step 5: Print summary statistics
    print_summary(combined_laps)

    log.info("")
    log.info("=" * 60)
    log.info("  DONE. Your dataset is ready for analysis and ML.")
    log.info(f"  File: {OUTPUT_FILE}")
    log.info("=" * 60)

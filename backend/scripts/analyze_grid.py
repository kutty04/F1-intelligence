"""
analyze_grid.py
===============
Analyze how often drivers starting from pole position (P1) win
the race at each circuit, across the 2022–2024 F1 seasons.

Input  : backend/data/processed/all_laps.csv
Output : backend/data/processed/grid_win_stats.csv

Key question answered:
  "At which circuits does starting P1 give you the best chance of winning?"

Usage:
    python -m backend.scripts.analyze_grid
    python backend/scripts/analyze_grid.py
"""

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────────────────────────────────────

import pandas as pd       # DataFrame operations — the core tool for this script
import logging            # Structured log messages (replaces bare print())
from pathlib import Path  # Cross-platform file path handling

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("analyze_grid")

# ─────────────────────────────────────────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────────────────────────────────────────
# Resolve paths relative to this file so the script works regardless of
# which directory you run it from.

SCRIPT_DIR  = Path(__file__).resolve().parent          # backend/scripts/
BACKEND_DIR = SCRIPT_DIR.parent                        # backend/
DATA_DIR    = BACKEND_DIR / "data" / "processed"       # backend/data/processed/

INPUT_FILE  = DATA_DIR / "all_laps.csv"                # written by fetch_races.py
OUTPUT_FILE = DATA_DIR / "grid_win_stats.csv"          # we write this


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — LOAD THE DATA
# ─────────────────────────────────────────────────────────────────────────────

def load_lap_data() -> pd.DataFrame:
    """
    Read the lap-level CSV produced by fetch_races.py.

    pd.read_csv() reads the file and returns a DataFrame where:
      - Each ROW  = one lap driven by one driver in one race
      - Each COLUMN = a measurement for that lap

    We check that the file exists first and give a clear error if not.
    """
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"\n\n  File not found: {INPUT_FILE}"
            f"\n  Run fetch_races.py first to generate this file.\n"
        )

    log.info(f"Loading data from: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)

    # Sanity check: make sure the columns we need actually exist
    required_cols = {"Driver", "LapNumber", "Position", "Year", "Circuit", "Round"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    log.info(f"Loaded {len(df):,} lap rows | {df['Circuit'].nunique()} circuits | "
             f"{df['Year'].nunique()} seasons")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — EXTRACT PER-RACE, PER-DRIVER SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

def build_race_summary(df: pd.DataFrame) -> pd.DataFrame:
    """
    Collapse the lap-level DataFrame (one row per lap) into a
    race-level summary (one row per driver per race).

    FROM (lap-level):
      Driver  Year  Circuit   Round  LapNumber  Position  ...
      VER     2024  Bahrain   1      1          2
      VER     2024  Bahrain   1      2          1
      VER     2024  Bahrain   1      3          1
      HAM     2024  Bahrain   1      1          3
      ...

    TO (race-level):
      Driver  Year  Circuit   Round  GridPosition  FinalPosition  TotalLaps
      VER     2024  Bahrain   1      2             1              57
      HAM     2024  Bahrain   1      3             5              57

    KEY INSIGHT — How we approximate GridPosition:
      The all_laps.csv contains "Position" (race position at end of each lap).
      It does NOT contain the starting grid position directly.

      Our best approximation:
        GridPosition ≈ Position on Lap 1

      This is accurate for ~90% of cases. It can differ if:
        - A driver gets a grid penalty (starts further back than qualifying)
        - A driver retires before completing Lap 1 (no Lap 1 data)
        - There was a standing re-start after a red flag

      For a more accurate grid position, you'd need session.results
      (which has a GridPosition column). We use the lap data here to
      keep everything in one self-contained CSV file.

    KEY INSIGHT — How we find FinalPosition:
      FinalPosition = Position on the driver's LAST lap
      The last lap is the one with the maximum LapNumber for that driver.
      This equals 1 if they won, 2 if they finished 2nd, etc.
    """
    log.info("Building per-race, per-driver summary...")

    # ── 2a. Drop rows with missing Position values ─────────────────────────
    # NaN in Position means timing was unavailable for that lap.
    # We can't determine grid or finishing position from those rows.
    df = df.dropna(subset=["Position"]).copy()

    # Position was saved as float (because of NaN rows). Convert to int.
    # e.g., 1.0 → 1, 3.0 → 3
    df["Position"] = df["Position"].astype(int)

    # ── 2b. Group by race identity columns ────────────────────────────────
    # A "race" is uniquely identified by: Year + Round + Circuit + Driver.
    # Within each group, we compute:
    #   - GridPosition  : Position at the row with the SMALLEST LapNumber
    #   - FinalPosition : Position at the row with the LARGEST LapNumber
    #   - TotalLaps     : How many laps this driver completed

    # A "GroupBy" object doesn't compute anything yet — it just marks
    # the groups. The .agg() call below does the actual computation.
    race_groups = df.groupby(["Year", "Circuit", "Round", "Driver", "Team"])

    # .agg() applies different aggregation functions to different columns.
    # "first" = value at the first (lowest-index) row in the group.
    # "last"  = value at the last  (highest-index) row in the group.
    # "count" = number of rows in the group.
    #
    # IMPORTANT: "first" and "last" here refer to the order of rows in df.
    # Since the CSV is sorted by LapNumber within each race naturally
    # (FastF1 returns laps in order), first = Lap 1, last = final lap.
    # We add an explicit sort below to be safe.
    df_sorted = df.sort_values(["Year", "Round", "Driver", "LapNumber"])

    race_summary = (
        df_sorted
        .groupby(["Year", "Circuit", "Round", "Driver", "Team"])
        .agg(
            GridPosition  = ("Position", "first"),   # Position on earliest lap
            FinalPosition = ("Position", "last"),    # Position on final lap
            TotalLaps     = ("LapNumber", "count"),  # Laps completed
        )
        .reset_index()  # Moves Year, Circuit, Round, Driver, Team from index → columns
    )

    log.info(f"  → {len(race_summary):,} driver-race records "
             f"across {race_summary['Circuit'].nunique()} circuits")
    return race_summary


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — CALCULATE P1-STARTER WIN STATISTICS PER CIRCUIT
# ─────────────────────────────────────────────────────────────────────────────

def calculate_grid_win_stats(race_summary: pd.DataFrame) -> pd.DataFrame:
    """
    For each circuit, calculate:

      1. TotalRaces       — how many races were held there (across all seasons)
      2. P1StarterWins    — how many times the P1 starter actually won (FinalPosition == 1)
      3. WinPct           — P1StarterWins / TotalRaces × 100  (percentage)

    Logic:
      - Filter to only rows where GridPosition == 1 (pole sitter)
      - For each circuit, count how many times that pole sitter won
      - Also count total races per circuit
      - Divide to get win percentage
    """
    log.info("Calculating pole-to-win conversion rates per circuit...")

    # ── 3a. Isolate pole position starters ────────────────────────────────
    # A pole sitter is a driver whose grid position was 1.
    # Filter the race_summary to only those rows.
    pole_sitters = race_summary[race_summary["GridPosition"] == 1].copy()

    log.info(f"  Found {len(pole_sitters)} pole-position starting rows")

    # ── 3b. Mark whether the pole sitter won the race ─────────────────────
    # A win = FinalPosition == 1
    # We create a boolean column: True if they won, False otherwise.
    # In pandas, True = 1 and False = 0 in numeric operations.
    # This makes it easy to sum up wins later.
    pole_sitters["DidWin"] = (pole_sitters["FinalPosition"] == 1)

    # ── 3c. Group by circuit and aggregate ────────────────────────────────
    # For each unique circuit, we want:
    #   - TotalRaces    = count of pole-sitter rows (one per race)
    #   - P1StarterWins = sum of DidWin column (True = 1, so sum = count of wins)
    circuit_stats = (
        pole_sitters
        .groupby("Circuit")
        .agg(
            TotalRaces    = ("DidWin", "count"),  # how many pole rows = races
            P1StarterWins = ("DidWin", "sum"),    # sum of True values = win count
        )
        .reset_index()
    )

    # ── 3d. Calculate win percentage ──────────────────────────────────────
    # WinPct = wins / races * 100
    # round(1) → keep one decimal place e.g. 72.7%
    circuit_stats["WinPct"] = (
        circuit_stats["P1StarterWins"] / circuit_stats["TotalRaces"] * 100
    ).round(1)

    # ── 3e. Add a human-readable label column ─────────────────────────────
    # e.g., "2 / 3" → "2 of 3 races"  (easier to read than raw numbers)
    circuit_stats["Summary"] = (
        circuit_stats["P1StarterWins"].astype(str)
        + " of "
        + circuit_stats["TotalRaces"].astype(str)
        + " races"
    )

    return circuit_stats


# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — SORT, PRINT, AND SAVE
# ─────────────────────────────────────────────────────────────────────────────

def sort_and_print(stats: pd.DataFrame) -> pd.DataFrame:
    """
    Sort results by WinPct descending, then print a formatted table.

    sort_values():
      - by="WinPct"        → sort on this column
      - ascending=False    → highest percentage first (descending order)
      - .reset_index()     → renumber rows 0, 1, 2... after sorting
    """
    # Sort: highest win percentage first
    sorted_stats = (
        stats
        .sort_values(by=["WinPct", "P1StarterWins"], ascending=[False, False])
        .reset_index(drop=True)
    )

    # ── Print header ──────────────────────────────────────────────────────
    header = (
        f"\n{'-' * 68}\n"
        f"  {'#':<4} {'Circuit':<35} {'WinPct':>7}  {'Summary'}\n"
        f"{'-' * 68}"
    )
    print(header)

    # ── Print one row per circuit ─────────────────────────────────────────
    # iterrows() gives us (index, row) pairs — useful for formatted printing
    for rank, row in sorted_stats.iterrows():
        # Build a simple bar chart out of ASCII characters
        # Each # = 10 percentage points
        bar_length = int(row["WinPct"] / 10)         # 0–10 blocks
        bar = "#" * bar_length + "." * (10 - bar_length)

        print(
            f"  {rank + 1:<4}"
            f" {row['Circuit']:<35}"
            f" {row['WinPct']:>5.1f}%"
            f"  {row['Summary']}"
            f"  {bar}"
        )

    print(f"{'-' * 68}\n")

    return sorted_stats


def save_results(stats: pd.DataFrame) -> None:
    """
    Save the final stats DataFrame to a CSV file.

    index=False → don't write the row numbers (0, 1, 2...) as a column.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    stats.to_csv(OUTPUT_FILE, index=False, encoding="utf-8")
    log.info(f"Results saved to: {OUTPUT_FILE}")


# ─────────────────────────────────────────────────────────────────────────────
# BONUS — ADDITIONAL CUTS OF THE DATA
# ─────────────────────────────────────────────────────────────────────────────

def print_bonus_stats(race_summary: pd.DataFrame) -> None:
    """
    Print a few extra insights from the race summary:
      1. Win conversion rate for each starting grid position (P1-P5)
      2. Overall P1-starter win rate across all circuits combined
    """
    log.info("Computing bonus insights...")

    # ── Bonus A: Win rate for top 5 grid positions (overall) ─────────────
    # Question: "Of all drivers who started from P1 across all races,
    #            what % won? Same for P2, P3, P4, P5?"
    print("\n  Win rate by starting grid position (all circuits combined):")
    print(f"  {'Position':<12} {'Starts':>7}  {'Wins':>6}  {'WinPct':>7}")
    print(f"  {'-' * 38}")

    for grid_pos in range(1, 6):   # Loop P1 through P5
        # Filter to drivers who started from this grid position
        starters = race_summary[race_summary["GridPosition"] == grid_pos]
        total    = len(starters)
        wins     = (starters["FinalPosition"] == 1).sum()
        pct      = (wins / total * 100) if total > 0 else 0.0
        print(f"  P{grid_pos:<11} {total:>7}  {wins:>6}  {pct:>6.1f}%")

    # ── Bonus B: Season-by-season P1 win rate ────────────────────────────
    print("\n  P1-starter win rate by season:")
    print(f"  {'Year':<8} {'Starts':>7}  {'Wins':>6}  {'WinPct':>7}")
    print(f"  {'-' * 32}")

    pole_sitters = race_summary[race_summary["GridPosition"] == 1]

    # groupby Year → for each year, count starts and wins
    for year, group in pole_sitters.groupby("Year"):
        total = len(group)
        wins  = (group["FinalPosition"] == 1).sum()
        pct   = wins / total * 100 if total > 0 else 0.0
        print(f"  {year:<8} {total:>7}  {wins:>6}  {pct:>6.1f}%")

    print()


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    log.info("=" * 60)
    log.info("  F1 GRID POSITION WIN ANALYSIS")
    log.info("  Question: Does starting P1 guarantee a win?")
    log.info("=" * 60)

    # Step 1 — Load the raw lap data CSV
    laps_df = load_lap_data()

    # Step 2 — Collapse lap-level data to one row per driver per race
    race_summary = build_race_summary(laps_df)

    # Step 3 — Calculate P1-starter win stats per circuit
    stats = calculate_grid_win_stats(race_summary)

    # Step 4 — Sort, display, and save
    log.info("\n  RESULTS — Pole-to-win conversion rate by circuit:\n")
    sorted_stats = sort_and_print(stats)
    save_results(sorted_stats)

    # Bonus — Extra analytical cuts
    print_bonus_stats(race_summary)

    log.info("Analysis complete.")
    log.info(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

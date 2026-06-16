"""
IPL Match-Level Data Aggregation
=================================
Aggregates ball-by-ball IPL data into match-level summaries
for ML model training.
"""

import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DATA = Path("E:/ANTI GRAVITY/archive/IPL.csv")
OUTPUT_PATH = BASE_DIR / "data" / "processed" / "matches.csv"


def load_raw_data():
    """Load ball-by-ball IPL dataset."""
    print(f"Loading {RAW_DATA} ...")
    df = pd.read_csv(RAW_DATA, low_memory=False)
    print(f"  Raw shape: {df.shape}")
    return df


def aggregate_match_results(df):
    """Aggregate ball-by-ball data into one row per match."""

    # Match metadata
    match_meta = df.groupby("match_id").agg({
        "date": "first",
        "event_name": "first",
        "batting_team": "first",
        "bowling_team": "first",
        "venue": "first",
        "city": "first",
        "day": "first",
        "month": "first",
        "year": "first",
        "season": "first",
        "gender": "first",
        "toss_winner": "first",
        "toss_decision": "first",
        "player_of_match": "first",
        "match_won_by": "first",
        "win_outcome": "first",
        "result_type": "first",
        "method": "first",
        "superover_winner": "first",
        "event_match_no": "first",
        "stage": "first",
    }).reset_index()

    # Innings 1
    inn1 = df[df["innings"] == 1].groupby("match_id").agg({
        "runs_total": "sum",
        "team_wicket": "first",
        "team_balls": "max",
        "valid_ball": "sum",
    }).reset_index()
    inn1.columns = ["match_id", "inn1_runs", "inn1_wickets", "inn1_balls", "inn1_balls_faced"]

    # Innings 2
    inn2 = df[df["innings"] == 2].groupby("match_id").agg({
        "runs_total": "sum",
        "team_wicket": "first",
        "team_balls": "max",
        "valid_ball": "sum",
    }).reset_index()
    inn2.columns = ["match_id", "inn2_runs", "inn2_wickets", "inn2_balls", "inn2_balls_faced"]

    # Powerplay runs (overs 0-5)
    pp1 = df[(df["innings"] == 1) & (df["over"] < 6)].groupby("match_id")["runs_total"].sum().reset_index()
    pp1.columns = ["match_id", "inn1_pp_runs"]
    pp2 = df[(df["innings"] == 2) & (df["over"] < 6)].groupby("match_id")["runs_total"].sum().reset_index()
    pp2.columns = ["match_id", "inn2_pp_runs"]

    # Death overs (overs 16+)
    death1 = df[(df["innings"] == 1) & (df["over"] >= 16)].groupby("match_id")["runs_total"].sum().reset_index()
    death1.columns = ["match_id", "inn1_death_runs"]
    death2 = df[(df["innings"] == 2) & (df["over"] >= 16)].groupby("match_id")["runs_total"].sum().reset_index()
    death2.columns = ["match_id", "inn2_death_runs"]

    # Powerplay wickets
    pp_wk1 = df[(df["innings"] == 1) & (df["over"] < 6) & (df["wicket_kind"].notna())].groupby("match_id").size().reset_index(name="inn1_pp_wickets")
    pp_wk2 = df[(df["innings"] == 2) & (df["over"] < 6) & (df["wicket_kind"].notna())].groupby("match_id").size().reset_index(name="inn2_pp_wickets")

    # Merge
    innings = inn1.merge(inn2, on="match_id", how="left")
    for df_merge in [pp1, pp2, death1, death2, pp_wk1, pp_wk2]:
        innings = innings.merge(df_merge, on="match_id", how="left")
    innings = innings.fillna(0)

    # Run rates
    innings["inn1_run_rate"] = innings["inn1_runs"] / (innings["inn1_balls_faced"] / 6)
    innings["inn2_run_rate"] = innings["inn2_runs"] / (innings["inn2_balls_faced"] / 6)
    innings["inn1_pp_run_rate"] = innings["inn1_pp_runs"] / 6
    innings["inn2_pp_run_rate"] = innings["inn2_pp_runs"] / 6

    matches = match_meta.merge(innings, on="match_id", how="left")

    # Target: did team batting first win?
    matches["team1_won"] = (matches["match_won_by"] == matches["batting_team"]).astype(int)

    # Toss features
    matches["toss_winner_bat_first"] = (matches["toss_winner"] == matches["batting_team"]).astype(int)
    matches["toss_winner_field"] = (matches["toss_decision"] == "field").astype(int)

    # Venue avg score
    venue_avg = df.groupby("venue")["runs_total"].mean()
    matches["venue_avg_score"] = matches["venue"].map(venue_avg)

    print(f"  Aggregated matches: {len(matches)}")
    print(f"  Features: {len(matches.columns)}")
    return matches


def add_team_strength(matches):
    """Rolling team strength: recent form and cumulative win rates."""
    matches = matches.sort_values("date").reset_index(drop=True)

    all_teams = sorted(set(matches["batting_team"].unique()) | set(matches["bowling_team"].unique()))
    team_wins = {t: 0 for t in all_teams}
    team_matches = {t: 0 for t in all_teams}

    records = []
    for idx, row in matches.iterrows():
        t1, t2 = row["batting_team"], row["bowling_team"]

        # Recent form: last 10 matches per team
        prev = matches[matches.index < idx]
        t1_wins = len(prev[
            ((prev["batting_team"] == t1) & (prev["team1_won"] == 1)) |
            ((prev["bowling_team"] == t1) & (prev["team1_won"] == 0))
        ].tail(10))
        t2_wins = len(prev[
            ((prev["batting_team"] == t2) & (prev["team1_won"] == 1)) |
            ((prev["bowling_team"] == t2) & (prev["team1_won"] == 0))
        ].tail(10))

        t1_recent = t1_wins / 10 if t1_wins > 0 else 0.5
        t2_recent = t2_wins / 10 if t2_wins > 0 else 0.5

        team_matches[t1] += 1
        team_matches[t2] += 1
        if row["team1_won"] == 1:
            team_wins[t1] += 1
        else:
            team_wins[t2] += 1

        records.append({
            "match_id": row["match_id"],
            "team1_recent_win_pct": t1_recent,
            "team2_recent_win_pct": t2_recent,
            "team1_cum_win_pct": team_wins[t1] / team_matches[t1],
            "team2_cum_win_pct": team_wins[t2] / team_matches[t2],
            "team1_matches": team_matches[t1],
            "team2_matches": team_matches[t2],
        })

    matches = matches.merge(pd.DataFrame(records), on="match_id", how="left")
    return matches


def main():
    print("=" * 60)
    print("IPL Data Aggregation Pipeline")
    print("=" * 60)

    print("\n[1/3] Loading raw data...")
    df = load_raw_data()

    print("\n[2/3] Aggregating to match level...")
    matches = aggregate_match_results(df)

    print("\n[3/3] Computing team strength...")
    matches = add_team_strength(matches)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    matches.to_csv(OUTPUT_PATH, index=False)

    print(f"\nSaved: {OUTPUT_PATH}")
    print(f"Shape: {matches.shape}")
    print(f"Seasons: {matches['season'].nunique()} ({matches['season'].min()} - {matches['season'].max()})")
    print(f"Teams: {sorted(set(matches['batting_team'].unique()) | set(matches['bowling_team'].unique()))}")
    print(f"Bat-first win rate: {matches['team1_won'].mean():.1%}")

    return matches


if __name__ == "__main__":
    main()

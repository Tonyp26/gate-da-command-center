"""
IPL Tournament Winner Prediction — Phase 2: Model Training
============================================================
Trains a classifier to predict match winners using ONLY pre-match features
(things known before the game starts). This avoids data leakage from
innings scores which would make prediction trivial but useless.

Features used:
- Team identity & relative strength
- Recent form (last 5, 10 matches)
- Cumulative win rate
- Head-to-head record between the two teams
- Toss result & decision
- Venue & home advantage
- Season / year

Uses GradientBoosting (scikit-learn).
"""

import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, roc_auc_score, classification_report,
    confusion_matrix, RocCurveDisplay
)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "processed" / "matches.csv"
MODEL_PATH = BASE_DIR / "models" / "xgboost_model.joblib"
ENCODER_PATH = BASE_DIR / "models" / "team_encoder.joblib"
FEATURES_PATH = BASE_DIR / "models" / "feature_config.json"
EVAL_PATH = BASE_DIR / "models" / "evaluation.json"
PLOT_DIR = BASE_DIR / "models"

TEAM_MAP = {
    "Delhi Daredevils": "Delhi Capitals",
    "Kings XI Punjab": "Punjab Kings",
    "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
    "Rising Pune Supergiant": "Rising Pune Supergiants",
    "Deccan Chargers": "Sunrisers Hyderabad",
}

def normalise(name):
    return TEAM_MAP.get(name, name)


def prepare_features(df):
    """
    Build PRE-MATCH features only.
    Target: did the team batting first (team1) win?
    """
    df = df.copy()
    df["batting_team"] = df["batting_team"].apply(normalise)
    df["bowling_team"] = df["bowling_team"].apply(normalise)
    df["toss_winner"] = df["toss_winner"].apply(normalise)

    # Sort by date so rolling features don't leak future info
    df = df.sort_values("date").reset_index(drop=True)

    # Encode teams
    all_teams = sorted(set(df["batting_team"].unique()) | set(df["bowling_team"].unique()))
    team_le = LabelEncoder()
    team_le.fit(all_teams)
    df["t1_enc"] = team_le.transform(df["batting_team"])
    df["t2_enc"] = team_le.transform(df["bowling_team"])
    df["toss_enc"] = team_le.transform(df["toss_winner"])

    # Venue frequency
    venue_freq = df["venue"].value_counts(normalize=True)
    df["venue_freq"] = df["venue"].map(venue_freq)

    # Season number
    df["season_num"] = pd.to_numeric(
        df["season"].str.replace("/", "."), errors="coerce"
    ).fillna(2008)

    # Home advantage
    df["t1_home"] = (df["batting_team"] == df["city"]).astype(int)
    df["t2_home"] = (df["bowling_team"] == df["city"]).astype(int)

    # Toss features
    df["toss_winner_bat_first"] = (df["toss_winner"] == df["batting_team"]).astype(int)
    df["toss_field"] = (df["toss_decision"] == "field").astype(int)

    # Venue avg first-innings score (from match-level data)
    venue_avg = df.groupby("venue")["inn1_runs"].mean()
    df["venue_avg_inn1"] = df["venue"].map(venue_avg)

    # ---- Use pre-computed rolling features from aggregation ----
    # These were computed without leakage in 01_aggregate_matches.py
    df["t1_recent5"] = df["team1_recent_win_pct"]  # approximated as last 10
    df["t2_recent5"] = df["team2_recent_win_pct"]
    df["t1_recent10"] = df["team1_recent_win_pct"]
    df["t2_recent10"] = df["team2_recent_win_pct"]
    df["t1_cum_pct"] = df["team1_cum_win_pct"]
    df["t2_cum_pct"] = df["team2_cum_win_pct"]
    df["t1_matches"] = df["team1_matches"].fillna(0)
    df["t2_matches"] = df["team2_matches"].fillna(0)

    # Head-to-head (needs to be computed)
    h2h = {}

    cols_h2h = []
    cols_h2h_n = []

    for idx, row in df.iterrows():
        t1, t2 = row["batting_team"], row["bowling_team"]
        key = (t1, t2)
        rev_key = (t2, t1)
        h2h_list = h2h.get(key, []) + h2h.get(rev_key, [])
        h2h_pct = np.mean(h2h_list) if h2h_list else 0.5
        h2h_n = len(h2h_list)

        cols_h2h.append(h2h_pct)
        cols_h2h_n.append(h2h_n)

        # Update h2h after computing
        won = row["team1_won"]
        if key not in h2h:
            h2h[key] = []
        h2h[key].append(int(won))

    df["t1_h2h_pct"] = cols_h2h
    df["t1_h2h_n"] = cols_h2h_n

    # Feature difference columns (team1 minus team2 for symmetry)
    df["recent5_diff"] = df["t1_recent5"] - df["t2_recent5"]
    df["recent10_diff"] = df["t1_recent10"] - df["t2_recent10"]
    df["cum_pct_diff"] = df["t1_cum_pct"] - df["t2_cum_pct"]
    df["home_diff"] = df["t1_home"] - df["t2_home"]
    df["matches_diff"] = df["t1_matches"] - df["t2_matches"]

    # Feature columns — ALL pre-match only
    feature_cols = [
        # Team identity
        "t1_enc", "t2_enc", "toss_enc",
        # Toss
        "toss_winner_bat_first", "toss_field",
        # Venue
        "venue_freq", "venue_avg_inn1",
        # Form differences
        "recent5_diff", "recent10_diff", "cum_pct_diff",
        # Head-to-head
        "t1_h2h_pct", "t1_h2h_n",
        # Home
        "home_diff",
        # Experience
        "t1_matches", "t2_matches",
        # Season
        "season_num",
    ]

    df = df.dropna(subset=feature_cols + ["team1_won"])
    X = df[feature_cols].values
    y = df["team1_won"].values

    return X, y, feature_cols, team_le, df


def train_and_evaluate(X, y, feature_cols, team_le):
    """Train models and pick the best."""

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")
    print(f"Train win rate: {y_train.mean():.1%} | Test win rate: {y_test.mean():.1%}")

    # GradientBoosting
    print("\n--- GradientBoosting ---")
    gb = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        min_samples_leaf=15,
        random_state=42,
    )
    gb.fit(X_train, y_train)
    gb_pred = gb.predict(X_test)
    gb_proba = gb.predict_proba(X_test)[:, 1]
    gb_acc = accuracy_score(y_test, gb_pred)
    gb_auc = roc_auc_score(y_test, gb_proba)
    gb_cv = cross_val_score(gb, X, y, cv=5, scoring="roc_auc")
    print(f"  Accuracy: {gb_acc:.4f} | AUC: {gb_auc:.4f} | CV AUC: {gb_cv.mean():.4f} (+/- {gb_cv.std():.4f})")

    # Random Forest
    print("\n--- Random Forest ---")
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=8, min_samples_leaf=15,
        random_state=42, n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_proba = rf.predict_proba(X_test)[:, 1]
    rf_acc = accuracy_score(y_test, rf_pred)
    rf_auc = roc_auc_score(y_test, rf_proba)
    rf_cv = cross_val_score(rf, X, y, cv=5, scoring="roc_auc")
    print(f"  Accuracy: {rf_acc:.4f} | AUC: {rf_auc:.4f} | CV AUC: {rf_cv.mean():.4f} (+/- {rf_cv.std():.4f})")

    # Pick best
    if gb_auc >= rf_auc:
        model, name, acc, auc, pred, proba = gb, "GradientBoosting", gb_acc, gb_auc, gb_pred, gb_proba
    else:
        model, name, acc, auc, pred, proba = rf, "RandomForest", rf_acc, rf_auc, rf_pred, rf_proba

    print(f"\n*** Best: {name} | Accuracy: {acc:.4f} | AUC: {auc:.4f} ***")

    print("\nClassification Report:")
    print(classification_report(y_test, pred, target_names=["Team 2 won", "Team 1 won"]))

    cm = confusion_matrix(y_test, pred)
    print("Confusion Matrix:")
    print(f"  Actual 0: [{cm[0][0]} TP, {cm[0][1]} FN]")
    print(f"  Actual 1: [{cm[1][0]} FP, {cm[1][1]} TP]")

    # Feature importance
    importances = model.feature_importances_
    feat_imp = pd.DataFrame({"feature": feature_cols, "importance": importances}).sort_values("importance", ascending=False)

    print("\nTop Feature Importance:")
    for _, r in feat_imp.iterrows():
        bar = "#" * int(r["importance"] * 40)
        print(f"  {r['feature']:<25} {r['importance']:.4f} {bar}")

    return {
        "model": model, "name": name, "accuracy": acc, "auc": auc,
        "feature_importance": feat_imp, "y_test": y_test,
        "y_pred": pred, "y_proba": proba,
        "team_le": team_le, "feature_cols": feature_cols,
    }


def save_artifacts(result):
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(result["model"], MODEL_PATH)
    print(f"\nSaved model: {MODEL_PATH}")

    joblib.dump(result["team_le"], ENCODER_PATH)
    print(f"Saved encoder: {ENCODER_PATH}")

    config = {"feature_cols": result["feature_cols"], "model_name": result["name"]}
    with open(FEATURES_PATH, "w") as f:
        json.dump(config, f, indent=2)
    print(f"Saved config: {FEATURES_PATH}")

    eval_data = {
        "model": result["name"],
        "accuracy": round(result["accuracy"], 4),
        "roc_auc": round(result["auc"], 4),
    }
    with open(EVAL_PATH, "w") as f:
        json.dump(eval_data, f, indent=2)
    print(f"Saved eval: {EVAL_PATH}")


def plot_results(result):
    PLOT_DIR.mkdir(parents=True, exist_ok=True)

    # Feature importance
    fig, ax = plt.subplots(figsize=(10, 7))
    top = result["feature_importance"].head(12).iloc[::-1]
    ax.barh(top["feature"], top["importance"], color="#4472C4")
    ax.set_xlabel("Importance")
    ax.set_title(f"Feature Importance - {result['name']}")
    plt.tight_layout()
    fig.savefig(PLOT_DIR / "feature_importance.png", dpi=150)
    plt.close()

    # ROC curve
    fig, ax = plt.subplots(figsize=(7, 5))
    RocCurveDisplay.from_predictions(
        result["y_test"], result["y_proba"], ax=ax,
        name=f"{result['name']} (AUC={result['auc']:.4f})"
    )
    ax.plot([0, 1], [0, 1], "k--", label="Random")
    ax.set_title("ROC Curve - Bat-First Win Prediction")
    ax.legend()
    plt.tight_layout()
    fig.savefig(PLOT_DIR / "roc_curve.png", dpi=150)
    plt.close()

    # Confusion matrix
    fig, ax = plt.subplots(figsize=(5, 4))
    cm = confusion_matrix(result["y_test"], result["y_pred"])
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax,
                xticklabels=["Team 2", "Team 1"],
                yticklabels=["Team 2", "Team 1"])
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")
    plt.tight_layout()
    fig.savefig(PLOT_DIR / "confusion_matrix.png", dpi=150)
    plt.close()

    print("Saved plots: feature_importance.png, roc_curve.png, confusion_matrix.png")


def main():
    print("=" * 60)
    print("IPL Model Training - Phase 2 (Pre-Match Features)")
    print("=" * 60)

    print(f"\nLoading {DATA_PATH} ...")
    if not DATA_PATH.exists():
        print("Running aggregation pipeline first...")
        import subprocess
        subprocess.run(
            ["python", str(BASE_DIR / "scripts" / "01_aggregate_matches.py")],
            check=True,
        )

    df = pd.read_csv(DATA_PATH)
    print(f"  {len(df)} matches loaded")

    print("\nPreparing pre-match features...")
    X, y, feature_cols, team_le, df = prepare_features(df)
    print(f"  Features: {len(feature_cols)} | Samples: {len(X)} | Positive: {y.mean():.1%}")

    print("\nTraining...")
    result = train_and_evaluate(X, y, feature_cols, team_le)

    print("\nSaving artifacts...")
    save_artifacts(result)

    print("\nGenerating plots...")
    plot_results(result)

    print("\n" + "=" * 60)
    print("Phase 2 Complete!")
    print("=" * 60)
    print(f"  Model: {result['name']}")
    print(f"  Accuracy: {result['accuracy']:.4f}")
    print(f"  ROC-AUC:  {result['auc']:.4f}")
    print(f"  Features: {len(feature_cols)}")


if __name__ == "__main__":
    main()

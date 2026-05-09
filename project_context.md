# F1 Race Intelligence Dashboard — Project Context

## Project Overview

This is a full-stack Formula 1 analytics and prediction dashboard built using:

### Backend

* Python
* FastAPI
* FastF1
* pandas
* scikit-learn

### Frontend

* React
* Vite
* Recharts
* Axios
* React Router

The goal of the project is to:

* analyze historical Formula 1 race data
* visualize race insights
* build prediction systems using machine learning
* provide an interactive analytics dashboard

---

# Current Project Status

## Completed Features

### Backend

* Frontend + Backend setup completed
* FastF1 integration & caching functional
* Multi-season data pipeline (2022-2026) active
* Grid Analysis functional
* Driver Analytics functional
* Lap Data Explorer functional
* ML Predictions functional
* GitHub Actions Automation active
* Admin Refresh feature active

### Analytics

Currently implemented:

* Grid position vs win-rate analysis

The analysis calculates:

* how often the driver starting in P1 wins at each circuit.

---

# Current Folder Structure

```text
f1-intelligence/
│
├── backend/
│   ├── api/
│   │   └── main.py
│   │
│   ├── cache/
│   │
│   ├── data/
│   │   ├── all_laps.csv
│   │   └── grid_win_stats.csv
│   │
│   ├── models/
│   │
│   ├── scripts/
│   │   ├── fetch_races.py
│   │   ├── analyze_grid.py
│   │   ├── train_model.py
│   │   └── data_helpers.py
│   │
│   ├── venv/
│   │
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── update_f1_data.yml
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── PROJECT_CONTEXT.md
```

---

# Existing Backend Features

## FastF1 Data Fetching

The backend currently:

* downloads F1 race data
* caches sessions locally
* stores processed lap data into CSV files

### Main Dataset

`backend/data/all_laps.csv`

Contains:

* Driver
* LapTime
* Sector times
* Tyre compound
* Tyre life
* Grid position
* Final position
* Circuit
* Year
* Round

---

# Existing API Endpoints

## Grid Statistics Endpoint

Purpose:
Return circuit-wise P1 win-rate statistics.

Status:
Working.

Expected frontend usage:

* Grid Analysis charts
* Dashboard insights

---

# Existing Frontend Pages

## Home/Dashboard Page

Purpose:
Main landing page for the analytics dashboard.

Status:
Working.

---

## Grid Analysis Page

Purpose:
Visualize:

* circuit-wise P1 starter win percentages.

Status:
Working.

Uses:

* Recharts
* backend API data

---

Purpose:
Analyze:
* driver performance
* podiums
* wins
* qualifying consistency
* average finish positions

Status:
Working.

---

## Race Prediction Page

Purpose:
Machine learning-based lap time prediction.

Features:
* tyre life & compound impact
* temperature impact
* driver-specific pace
* real-time predictions

Status:
Working.

---

# Machine Learning Plans

Planned ML features:

* RandomForest models
* Feature engineering
* Historical race trend analysis
* Tyre strategy prediction
* Race outcome prediction

Potential input features:

* grid position
* tyre compound
* tyre age
* qualifying performance
* circuit type
* weather (future feature)

---

# Development Rules

IMPORTANT:

* Do NOT rewrite the entire project.
* Preserve the current folder structure.
* Keep frontend and backend modular.
* Only modify files required for the requested feature.
* Do not duplicate logic unnecessarily.
* Keep code beginner-friendly and well-commented.
* Explain all major code changes clearly.
* Maintain scalability for future ML features.

---

# Frontend ↔ Backend Architecture

Frontend:

* React app calls FastAPI endpoints using Axios.

Backend:

* FastAPI reads processed CSVs or ML models.
* Returns JSON responses.

Visualization:

* Recharts renders analytics visually.

---

# Current Priorities

## Next Features To Build

### 1. Driver Analytics

Planned:

* podium count
* win count
* average finish
* qualifying consistency

---

### 2. Race Prediction System

Planned:

* ML preprocessing pipeline
* model training
* prediction endpoint
* prediction UI

---

### 3. Improved Dashboard

Planned:

* better charts
* filters
* circuit comparisons
* driver comparisons

---

# Instructions For AI Assistants

When continuing this project:

* Read this PROJECT_CONTEXT.md file first.
* Continue the existing architecture.
* Do not regenerate the whole application.
* Implement only the requested feature.
* Explain:

  * modified files
  * data flow
  * backend/frontend interaction
  * important concepts

Act like a senior engineer contributing to an existing production-style codebase.

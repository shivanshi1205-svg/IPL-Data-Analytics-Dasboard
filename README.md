# TATA IPL Data Analysis & Interactive Dashboard (2008–2026)

Welcome to the **TATA IPL Data Analysis Dashboard** project. This repository contains a premium, client-ready business intelligence solution analyzing 17 seasons of IPL data (2008–2026), designed for data analyst portfolios.

It includes both a **Microsoft Power BI Desktop (.pbix) report template** and an **interactive Web App clone** to preview dashboard interactions directly in the browser.

---

## 📂 Repository Structure

*   **`IPL_Dashboard.pbix`**: The primary Power BI dashboard file. Open this in **Power BI Desktop** to view and customize the report pages.
*   **`IPL Data/`**: Holds the cleaned CSV datasets (matches, deliveries, player metadata, and team mappings), pre-populated and simulated with the actual **2026 IPL Season** data:
    *   `ipl_matches_data.csv`
    *   `ball_by_ball_data.csv`
    *   `players-data-updated.csv`
    *   `teams_data.csv`
*   **`ipl_theme.json`**: The custom visual theme template matching the official TATA IPL brand identity.
*   **`ipl_dashboard_web/`**: A fully responsive web interface (HTML5/CSS3/JavaScript) replicating the visual layout and slicers of the dashboard for portfolio web previews.

---

## 🎨 Visual Identity & Theme
The dashboard utilizes official IPL brand design tokens:
*   **Background:** Deep Space Navy (`#061129`)
*   **Card Containers:** Glassmorphic dark-slate (`#112140` at 10% transparency)
*   **Primary Batting/Runs Metric:** Vibrant Gold (`#FFC107`)
*   **Primary Bowling/Wickets Metric:** Royal Blue (`#1B9CFC`)
*   **Visual Styling:** Custom rounding, modern typography (`Outfit` and `Inter` sans-serif), and absolute overlays for player cutout images.

---

## 📊 Key Features & Analysis Pages

1.  **Overview (Home Page):**
    *   High-level metrics for selected seasons (centuries, matches, sixes, fours, boundaries).
    *   **Toss Decisions Split:** A donut chart visual representing the ratio of choosing to bat first vs field first.
    *   **Match Outcome Split:** A donut chart visual splitting match results into chasing wins (wickets), defending wins (runs), or ties/no-results.
    *   Dynamically changing champion and runner-up cards.
    *   Top 4 Cap cards with real player photo cutouts.
    *   Season-wise Points Table.
2.  **Team Head-to-Head:**
    *   Interactive comparison matrix between any two teams.
    *   Donut chart split of total played, wins for Team A, wins for Team B, and draws.
3.  **Player Leaderboards:**
    *   Top 50 batters (Runs, SR, Average, Balls).
    *   Top 50 bowlers (Wickets, Econ, Balls, Runs Conceded).
    *   Top 10 performer horizontal bar charts.
4.  **Venue Analysis:**
    *   Matches hosted and average winning margins per venue.

---

## ⚡ Power BI Setup Instructions

### 1. Load Data & Configure Relationships
1. Open **Power BI Desktop**.
2. Click **Get Data** > **Text/CSV** and select the files inside the `IPL Data/` folder.
3. In the **Model View**, establish the following relationships:
    *   `ipl_matches_data[match_id]` ➔ `ball_by_ball_data[match_id]` (1-to-many)
    *   `players-data-updated[player_name]` ➔ `ball_by_ball_data[batter]` (1-to-many)
    *   `teams_data[team_name]` ➔ `ipl_matches_data[team1]` (1-to-many)

### 2. Import Custom Theme
1. Navigate to the **View** tab.
2. Expand the **Themes** gallery and select **Browse for Themes**.
3. Select `ipl_theme.json` in this repository's root folder to instantly format your dashboard.

### 3. DAX Measures Dictionary
Create a new table named `_Measures` and insert the following DAX calculations:

*   **Total Runs:**
    ```dax
    Total Runs = SUM(ball_by_ball_data[batter_runs])
    ```
*   **Total Wickets:**
    ```dax
    Total Wickets = 
    CALCULATE(
        COUNTROWS(ball_by_ball_data),
        ball_by_ball_data[is_wicket] = TRUE(),
        ball_by_ball_data[wicket_kind] IN { "bowled", "caught", "caught and bowled", "lbw", "stumped", "hit wicket" }
    )
    ```
*   **Total Sixes:**
    ```dax
    Total Sixes = CALCULATE(COUNTROWS(ball_by_ball_data), ball_by_ball_data[batter_runs] = 6)
    ```
*   **Total Fours:**
    ```dax
    Total Fours = CALCULATE(COUNTROWS(ball_by_ball_data), ball_by_ball_data[batter_runs] = 4)
    ```
*   **Centuries Scored:**
    ```dax
    Centuries = 
    COUNTROWS(
        FILTER(
            ADDCOLUMNS(
                VALUES(ball_by_ball_data[batter]),
                "InningsRuns", CALCULATE(SUM(ball_by_ball_data[batter_runs]))
            ),
            [InningsRuns] >= 100
        )
    )
    ```
*   **Chasing Wins (Wickets):**
    ```dax
    Chasing Wins = CALCULATE(COUNTROWS(ipl_matches_data), ipl_matches_data[win_by_wickets] > 0)
    ```
*   **Defending Wins (Runs):**
    ```dax
    Defending Wins = CALCULATE(COUNTROWS(ipl_matches_data), ipl_matches_data[win_by_runs] > 0)
    ```

---

## 🌐 Web App Preview
To view the interactive web clone dashboard locally:
1. Open terminal and run:
   ```bash
   python -m http.server 8080 --directory ipl_dashboard_web
   ```
2. Navigate to `http://localhost:8080` in your web browser.
3. Click tab links and select seasons to explore the dashboard.

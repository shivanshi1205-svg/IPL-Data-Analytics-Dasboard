// Interactive JavaScript Logic for IPL Dashboard (Official IPL Brand Colors: Navy & Gold)

let rawData = null;
let charts = {};

// Static brand assets fallback configurations
const teamLogos = {
    "Chennai Super Kings": "https://assets.ccbp.in/frontend/react-js/csk-logo-img.png",
    "Mumbai Indians": "https://assets.ccbp.in/frontend/react-js/mi-logo-img.png",
    "Royal Challengers Bangalore": "https://assets.ccbp.in/frontend/react-js/rcb-logo-img.png",
    "Kolkata Knight Riders": "https://assets.ccbp.in/frontend/react-js/kkr-logo-img.png",
    "Rajasthan Royals": "https://assets.ccbp.in/frontend/react-js/rr-logo-img.png",
    "Sunrisers Hyderabad": "https://assets.ccbp.in/frontend/react-js/srh-logo-img.png",
    "Delhi Capitals": "https://assets.ccbp.in/frontend/react-js/dc-logo-img.png",
    "Punjab Kings": "https://assets.ccbp.in/frontend/react-js/kxp-logo-img.png",
    "Gujarat Titans": "https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg",
    "Lucknow Super Giants": "https://upload.wikimedia.org/wikipedia/en/a/a9/Lucknow_Super_Giants_IPL_Logo.svg"
};

const playerPhotos = {
    "Virat Kohli": "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Virat%20Kohli.png",
    "V Kohli": "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Virat%20Kohli.png",
    "MS Dhoni": "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/MS%20Dhoni.png",
    "Rohit Sharma": "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Rohit%20Sharma.png",
    "RG Sharma": "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/Rohit%20Sharma.png",
    "V Sooryavanshi": "assets/vaibhav_sooryavanshi.png",
    "Vaibhav Sooryavanshi": "assets/vaibhav_sooryavanshi.png"
};

const defaultPlayerPhoto = "https://www.w3schools.com/howto/img_avatar.png";

const themeColors = {
    runs: "#FFC107",        // IPL Yellow/Gold
    wickets: "#1B9CFC",     // IPL Royal Blue
    neutralDark: "#1B3461", // Border Card Navy
    gold: "#FF9F00"
};

// Dynamic asset fetchers
function getTeamLogo(teamName) {
    if (rawData && rawData.team_logos && rawData.team_logos[teamName]) {
        return rawData.team_logos[teamName];
    }
    return teamLogos[teamName] || "";
}

function getPlayerPhoto(playerName) {
    if (rawData && rawData.player_photos && rawData.player_photos[playerName]) {
        return rawData.player_photos[playerName];
    }
    return playerPhotos[playerName] || defaultPlayerPhoto;
}

// Helper to destroy existing chart instances before redrawing
function registerChart(id, chartInstance) {
    if (charts[id]) {
        charts[id].destroy();
    }
    charts[id] = chartInstance;
}

// Format numbers with commas (e.g., 100000 -> 100,000)
function formatNumber(num) {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Tab Switching
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".tab-section");
    const pageTitle = document.getElementById("page-title");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            btn.classList.add("active");
            const targetTab = btn.getAttribute("data-tab");
            document.getElementById(`tab-${targetTab}`).classList.add("active");

            // Update title text
            if (targetTab === "overview") {
                pageTitle.textContent = "IPL ANALYSIS (2008 - 2026)";
            } else {
                pageTitle.textContent = btn.innerText.replace(/^\S+\s*/, "");
            }
        });
    });

    // 2. Load Dashboard Data
    fetch("dashboard_data.json")
        .then(res => res.json())
        .then(data => {
            rawData = data;
            initializeDashboard();
        })
        .catch(err => console.error("Error loading dashboard data:", err));
});

// Main Initialization
function initializeDashboard() {
    // 1. Populate Season Filters
    const seasonSelect = document.getElementById("season-select");
    seasonSelect.innerHTML = '<option value="All">All</option>'; // Clear default
    
    const uniqueSeasons = rawData.seasons_list;
    
    uniqueSeasons.forEach(season => {
        const option = document.createElement("option");
        option.value = season;
        option.textContent = season; // Renders year directly (e.g. 2008 or 2020/21)
        seasonSelect.appendChild(option);
    });

    // Select the last season by default
    seasonSelect.selectedIndex = uniqueSeasons.length; // Defaults to last item
    
    // Set change event
    seasonSelect.addEventListener("change", () => {
        updateOverviewTab(seasonSelect.value);
    });

    // 2. Populate Team Dropdowns for H2H
    const teamASelect = document.getElementById("team-a-select");
    const teamBSelect = document.getElementById("team-b-select");
    teamASelect.innerHTML = "";
    teamBSelect.innerHTML = "";

    rawData.teams.forEach(team => {
        const optionA = document.createElement("option");
        optionA.value = team;
        optionA.textContent = team;
        teamASelect.appendChild(optionA);

        const optionB = document.createElement("option");
        optionB.value = team;
        optionB.textContent = team;
        teamBSelect.appendChild(optionB);
    });

    // Set default selections
    teamASelect.selectedIndex = 0; // First team
    teamBSelect.selectedIndex = 1; // Second team

    const handleH2HChange = () => {
        updateH2HStats(teamASelect.value, teamBSelect.value);
    };

    teamASelect.addEventListener("change", handleH2HChange);
    teamBSelect.addEventListener("change", handleH2HChange);

    // 3. Player Stats sub-tabs toggling
    const playerToggles = document.querySelectorAll(".toggle-pill-buttons .toggle-btn");
    playerToggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            playerToggles.forEach(t => t.classList.remove("active"));
            toggle.classList.add("active");

            const mode = toggle.getAttribute("data-mode");
            if (mode === "batting") {
                document.getElementById("player-batting-view").classList.add("active");
                document.getElementById("player-bowling-view").classList.remove("active");
            } else {
                document.getElementById("player-batting-view").classList.remove("active");
                document.getElementById("player-bowling-view").classList.add("active");
            }
        });
    });

    // 4. Initial Render of Tab Data
    updateOverviewTab(seasonSelect.value);
    updateH2HStats(teamASelect.value, teamBSelect.value);
    renderPlayerLeaderboard();
    renderVenueTable();
}

// Overview Update
function updateOverviewTab(selectedSeason) {
    const sData = rawData.seasons_data[selectedSeason];
    if (!sData) return;

    // 1. Update Champions & Runner Up Cards
    const champNameLabel = document.getElementById("overview-champ-name");
    const champLogo = document.getElementById("overview-champ-logo");
    const runnerNameLabel = document.getElementById("overview-runner-name");
    const runnerLogo = document.getElementById("overview-runner-logo");

    champNameLabel.textContent = sData.champions;
    champLogo.src = getTeamLogo(sData.champions);
    champLogo.alt = sData.champions;

    runnerNameLabel.textContent = sData.runner_up;
    runnerLogo.src = getTeamLogo(sData.runner_up);
    runnerLogo.alt = sData.runner_up;

    // 2. Update the 7 KPI banner metrics
    document.getElementById("kpi-sixes").textContent = formatNumber(sData.total_sixes);
    document.getElementById("kpi-fours").textContent = formatNumber(sData.total_fours);
    document.getElementById("kpi-matches").textContent = formatNumber(sData.total_matches);
    document.getElementById("kpi-teams").textContent = sData.total_teams;
    document.getElementById("kpi-centuries").textContent = sData.centuries;
    document.getElementById("kpi-half-centuries").textContent = sData.half_centuries;
    document.getElementById("kpi-venues").textContent = sData.total_venues;

    // 3. Update Player Cap Cards
    updatePlayerCapCard("orange", sData.orange_cap);
    updatePlayerCapCard("purple", sData.purple_cap);
    updatePlayerCapCard("fours", sData.top_fours);
    updatePlayerCapCard("sixes", sData.top_sixes);

    // 4. Render Points Table Rows
    renderPointsTable(sData.points_table);
}

// Helper to update player cards (with cutout images)
function updatePlayerCapCard(capId, capData) {
    const nameLabel = document.getElementById(`${capId}-player-name`);
    const valLabel = document.getElementById(`${capId}-player-${capId === "orange" ? "runs" : capId === "purple" ? "wickets" : "count"}`);
    const teamLabel = document.getElementById(`${capId}-player-team`);
    const playerImg = document.getElementById(`${capId}-player-image`);

    nameLabel.textContent = capData.player;
    valLabel.textContent = formatNumber(capData.val);
    teamLabel.textContent = capData.team;

    // Headshot source mapping (dynamic cricinfo URL parser / S3 URL)
    playerImg.referrerPolicy = "no-referrer";
    playerImg.src = getPlayerPhoto(capData.player);
    playerImg.alt = capData.player;
}

// Render Overview Points Table Grid
function renderPointsTable(pointsData) {
    const tbody = document.querySelector("#overview-points-table tbody");
    tbody.innerHTML = "";

    pointsData.forEach(row => {
        const logoUrl = getTeamLogo(row.Team);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img class="points-logo-img" src="${logoUrl}" alt="${row.Team}"></td>
            <td><strong>${row.Team}</strong></td>
            <td>${row.Played}</td>
            <td>${row.Won}</td>
            <td>${row.Lost}</td>
            <td>${row.NR}</td>
            <td><strong style="color: var(--accent-red)">${row.Points}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// Tab 2: Update H2H Stats Panels & Pie Chart
function updateH2HStats(teamA, teamB) {
    const totalLabel = document.getElementById("h2h-total-played");
    const teamALabel = document.getElementById("h2h-team-a-label");
    const teamBLabel = document.getElementById("h2h-team-b-label");
    const teamAWins = document.getElementById("h2h-team-a-wins");
    const teamBWins = document.getElementById("h2h-team-b-wins");
    const teamAPct = document.getElementById("h2h-team-a-pct");
    const teamBPct = document.getElementById("h2h-team-b-pct");
    
    const logoA = document.getElementById("team-a-logo");
    const logoB = document.getElementById("team-b-logo");

    // Assign logos
    logoA.src = getTeamLogo(teamA);
    logoA.alt = `${teamA} Logo`;
    logoB.src = getTeamLogo(teamB);
    logoB.alt = `${teamB} Logo`;

    // Search H2H data
    let matchH2H = rawData.h2h.find(h => h.TeamA === teamA && h.TeamB === teamB);
    if (!matchH2H) {
        // Reverse query if needed
        matchH2H = rawData.h2h.find(h => h.TeamA === teamB && h.TeamB === teamA);
    }

    let played = 0, winsA = 0, winsB = 0;
    if (matchH2H) {
        played = matchH2H.Played;
        // Map correct wins based on select inputs
        winsA = (matchH2H.TeamA === teamA) ? matchH2H.WinsA : matchH2H.WinsB;
        winsB = (matchH2H.TeamA === teamA) ? matchH2H.WinsB : matchH2H.WinsA;
    }

    const pctA = played > 0 ? Math.round((winsA / played) * 100) : 0;
    const pctB = played > 0 ? Math.round((winsB / played) * 100) : 0;

    totalLabel.textContent = played;
    teamALabel.textContent = teamA;
    teamBLabel.textContent = teamB;
    teamAWins.textContent = winsA;
    teamBWins.textContent = winsB;
    teamAPct.textContent = `${pctA}% Wins`;
    teamBPct.textContent = `${pctB}% Wins`;

    // Render H2H Donut
    const ctx = document.getElementById("chart-h2h-split").getContext("2d");
    const instance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [teamA, teamB, 'Draw/No Result'],
            datasets: [{
                data: [winsA, winsB, Math.max(0, played - (winsA + winsB))],
                backgroundColor: [themeColors.runs, themeColors.wickets, themeColors.neutralDark],
                borderColor: '#112140',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#FFF', boxWidth: 12 }
                }
            },
            cutout: '70%'
        }
    });

    registerChart("h2hSplit", instance);
}

// Tab 3: Render Leaderboards
function renderPlayerLeaderboard() {
    // 1. Batting
    const battingTbody = document.querySelector("#batting-table tbody");
    battingTbody.innerHTML = "";
    
    // Sort and slice top 10 for chart
    const top10Batters = rawData.batting_leaderboard.slice(0, 10);
    top10Batters.forEach((b, index) => {
        const photoUrl = getPlayerPhoto(b.Batter);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td class="player-photo-td"><img class="player-photo-img" referrerpolicy="no-referrer" src="${photoUrl}" alt="${b.Batter}"></td>
            <td>${b.Batter}</td>
            <td>${formatNumber(b.Runs)}</td>
            <td>${formatNumber(b.Balls)}</td>
            <td>${b.SR.toFixed(1)}</td>
            <td>${b.Avg.toFixed(1)}</td>
        `;
        battingTbody.appendChild(tr);
    });

    // Batters Horizontal Bar Chart
    const ctxBat = document.getElementById("chart-top-batters").getContext("2d");
    const batInstance = new Chart(ctxBat, {
        type: 'bar',
        data: {
            labels: top10Batters.map(b => b.Batter),
            datasets: [{
                label: 'Runs Scored',
                data: top10Batters.map(b => b.Runs),
                backgroundColor: themeColors.runs,
                borderColor: themeColors.runs,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8DA0BC' } },
                y: { grid: { display: false }, ticks: { color: '#FFF' } }
            },
            plugins: { legend: { display: false } }
        }
    });
    registerChart("topBatters", batInstance);

    // 2. Bowling
    const bowlingTbody = document.querySelector("#bowling-table tbody");
    bowlingTbody.innerHTML = "";
    const top10Bowlers = rawData.bowling_leaderboard.slice(0, 10);
    top10Bowlers.forEach((bowler, index) => {
        const photoUrl = getPlayerPhoto(bowler.Bowler);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td class="player-photo-td"><img class="player-photo-img" referrerpolicy="no-referrer" src="${photoUrl}" alt="${bowler.Bowler}"></td>
            <td>${bowler.Bowler}</td>
            <td>${bowler.Wickets}</td>
            <td>${formatNumber(bowler.Balls)}</td>
            <td>${formatNumber(bowler.RunsConceded)}</td>
            <td>${bowler.Econ.toFixed(2)}</td>
        `;
        bowlingTbody.appendChild(tr);
    });

    // Bowlers Horizontal Bar Chart
    const ctxBowl = document.getElementById("chart-top-bowlers").getContext("2d");
    const bowlInstance = new Chart(ctxBowl, {
        type: 'bar',
        data: {
            labels: top10Bowlers.map(b => b.Bowler),
            datasets: [{
                label: 'Wickets Taken',
                data: top10Bowlers.map(b => b.Wickets),
                backgroundColor: themeColors.wickets,
                borderColor: themeColors.wickets,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8DA0BC' } },
                y: { grid: { display: false }, ticks: { color: '#FFF' } }
            },
            plugins: { legend: { display: false } }
        }
    });
    registerChart("topBowlers", bowlInstance);
}

// Tab 4: Venue Analysis Table
function renderVenueTable() {
    const venueTbody = document.querySelector("#venue-table tbody");
    venueTbody.innerHTML = "";

    rawData.venue_stats.forEach(venue => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${venue.Venue}</strong></td>
            <td>${venue.MatchesPlayed}</td>
            <td>${venue.AvgMargin.toFixed(1)} runs / wkts</td>
            <td><span style="color: var(--accent-cyan)">● Active</span></td>
        `;
        venueTbody.appendChild(tr);
    });
}

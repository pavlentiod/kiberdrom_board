const BASE_URL = "http://127.0.0.1:8013/";
const REGIONS_URL = "data/regions.json";
const SVG_URL = "graphics/map.svg";
// COLORS
const COLOR_ONE = "#ffffff";
const COLOR_TWO = "#65B233";


async function fetchData() {
    try {
        const data = await fetchJSON(BASE_URL);
        const regions = await fetchJSON(REGIONS_URL);

        if (!data || !regions) {
            console.error("Failed to fetch data or regions");
            return;
        }

        let {teams, currentPair: pairIndex, eventInfo} = data;
        teams = fillfullTeams(teams)
        const currentPair = pairIndex - 1;
        const teamPairs = mapTeamPairs(teams);
        const currentTeams = teamPairs[currentPair];
        const regionPair = currentTeams.map(team => regions[team.region]);

        console.log(eventInfo)

        generateRowBlocks(teamPairs, currentPair);
        loadSVG(regionPair);
        generateBoard(currentTeams);
        addInfo(eventInfo.title, eventInfo.description, eventInfo.date)
    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}


// Fetch JSON data from a given URL
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching JSON from ${url}:`, error);
        return null;
    }
}


function fillfullTeams(teams) {
    if (teams.length < 10) {
            const numToAdd = 10 - teams.length;
            const baseId = teams.length + 1;
            const pairs = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

            for (let i = 0; i < numToAdd; i++) {
                teams.push({
                    teamName: ``,
                    region: "",
                    score: 0,
                    id: baseId + i,
                    pair: `${pairs[baseId + i - 1]}`
                });
            }
        }
    return teams
}


// Map pairs of IDs to team objects
function mapTeamPairs(teams) {
    const pairsMap = new Map();

    teams.forEach(team => {
        const pairId = team.pair;
        if (!pairsMap.has(pairId)) {
            pairsMap.set(pairId, []);
        }
        pairsMap.get(pairId).push(team);
    });


    return Array.from(pairsMap.values());
}


// Load and update SVG map with selected regions
function loadSVG(regionPair) {
    fetch(SVG_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("SVG file not found");
            }
            return response.text();
        })
        .then(svgContent => {
            const mapDiv = document.getElementById("map");
            mapDiv.innerHTML = svgContent;

            // Dynamically add styles for `st1` and `st2`
            const styleElement = document.createElement("style");
            styleElement.textContent = `
                .st0 { fill: #68709C; stroke: #ffffff; } /* Default fill color for st1 */
                .st1 { fill: ${COLOR_ONE}; } /* Default fill color for st1 */
                .st2 { fill: ${COLOR_TWO}; } /* Default fill color for st2 */
            `;
            document.head.appendChild(styleElement);

            // Apply classes to regions
            regionPair.forEach((regionId, index) => {
                const element = document.getElementById(`path-${regionId}`);
                if (element) {
                    element.classList.add(index === 0 ? "st1" : "st2");
                }
            });
        })
        .catch(error => {
            console.error("Error loading SVG:", error);
        });
}


function generateHTML(title, stage, date) {
    // Helper function to format the date
    function formatDate(dateString) {
        const months = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];
        const dateObj = new Date(dateString);
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${day} ${month} ${year} года`;
    }

    // Format the input date
    const formattedDate = formatDate(date);

    // Generate the HTML string
    return `
        <div class="info">
            <h1>Рейтинг команд</h1>
            <h2>${title}</h2>
            <h2>${stage}</h2>
            <p>${formattedDate}</p>
        </div>
    `;
}

function addInfo(title, stage, date) {
    const infoElement = document.getElementById("info");
    if (!infoElement) {
        console.error("Element with id 'info' not found.");
        return;
    }

    // Generate the HTML and add it to the page
    infoElement.innerHTML = generateHTML(title, stage, date);
}


// Generate the match board for the current teams
function generateBoard(teams) {
    const board = document.getElementById("board");
    board.innerHTML = ""; // Clear existing content

    const [team1, team2] = teams;

    const teamRow1 = createTeamRow(team1, COLOR_ONE, COLOR_ONE);
    const vsBlock = createVSBlock();
    const teamRow2 = createTeamRow(team2, COLOR_TWO, COLOR_TWO);

    board.append(teamRow1, vsBlock, teamRow2);
}


// Create a row for a team
function createTeamRow(team, color, borderColor = "") {
    const row = document.createElement("div");
    row.classList.add("board-row");
    row.style.color = color;

    row.innerHTML = `
        <div class="team-block">
            <div class="top-text">Команда</div>
            <div class="bottom-text" id="name_${team.id}">${team.teamName}</div>
        </div>
        <div class="team-block2" style="border-color: ${borderColor}">
            <div class="top-text2" id="number_${team.id}">${team.teamName}</div>
            <div class="bottom-text2" id="region_${team.id}">${team.region}</div>
        </div>
    `;
    return row;
}


// Create the "vs" block
function createVSBlock() {
    const vsBlock = document.createElement("div");
    vsBlock.classList.add("vs");
    vsBlock.textContent = "vs";
    return vsBlock;
}


// Generate row blocks for all team pairs
function generateRowBlocks(dataArray, currentPair) {
    const tableContainer = document.getElementById("table-container");
    tableContainer.innerHTML = ""; // Clear existing content

    dataArray.forEach((rowData, rowIndex) => {
        const rowBlock = document.createElement("div");
        rowBlock.classList.add("row-block");

        if (rowIndex === currentPair) {
            rowBlock.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        }

        rowData.forEach(({teamName, region, score}) => {
            const scoreBlock = createScoreBlock(teamName, region, score);
            rowBlock.appendChild(scoreBlock);
        });

        tableContainer.appendChild(rowBlock);
    });
}


// Create a score block for a team
function createScoreBlock(teamName, region, score) {
    const scoreBlock = document.createElement("div");
    scoreBlock.classList.add("score-block");

    const teamInfo = document.createElement("div");
    teamInfo.classList.add("team-info");
    teamInfo.innerHTML = `
        <div class="team-name">${teamName}</div>
        <div class="region">${region}</div>
    `;

    const scoreElement = document.createElement("div");
    scoreElement.classList.add("score");
    scoreElement.innerHTML = `${String(score).replace(/\s/g, "&nbsp;")}`;

    scoreBlock.append(teamInfo, scoreElement);
    return scoreBlock;
}


fetchData();




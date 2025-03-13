console.log("clock.js is loaded in index.html");


document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
});

let sightingsData = []; // Store parsed data

// Load CSV file using D3.js
d3.csv("data/NUFORCdata.csv").then(data => {
    sightingsData = data;
    console.log("CSV Loaded:", sightingsData);
    updateSightingStats(); // Initialize sightings stats
}).catch(error => console.error("Error loading CSV:", error));


const width = 200, height = 200, radius = 80;

// Create the clock face
const svg = d3.select("#clock")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// Draw the outer circle (clock face)
svg.append("circle")
    .attr("r", radius)
    .attr("fill", "black")
    .attr("stroke", "white");

// Add hour labels
for (let i = 1; i <= 12; i++) {
    let angle = i * 30 * (Math.PI / 180);
    let x = Math.sin(angle) * (radius - 15);
    let y = -Math.cos(angle) * (radius - 15);
    svg.append("text")
        .attr("x", x)
        .attr("y", y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "16px")
        .text(i);
}

// Clock hand
const hand = svg.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", -radius + 20)
    .attr("stroke", "gold")
    .attr("stroke-width", 3)
    .attr("transform", "rotate(0)");

// Time & Season Variables
let isPlaying = false;
let currentHour = 0;
let timeoutId;
let selectedSeason = "all"; // Default season

function animateClock() {
    if (!isPlaying) return;

    let rotation = currentHour * 30;

    hand.transition()
        .duration(1000)
        .attr("transform", `rotate(${rotation})`)
        .on("end", () => {
            document.getElementById("time-display").textContent =
                `${(currentHour % 12 === 0 ? 12 : currentHour % 12)} ${currentHour < 12 ? "AM" : "PM"}`;

            updateUfoCount(currentHour, selectedSeason);
            updateBarChart(selectedSeason); // ✅ Now updates with clock

            currentHour = (currentHour + 1) % 24;
            timeoutId = setTimeout(animateClock, 1000);
        });
}


// FUNCTION TO UPDATE SEASON VIEW
function updateSeasonView() {
    updateUfoCount(currentHour, selectedSeason);
    updateBarChart(selectedSeason);
}

function highlightBar(hour) {
    const bars = document.querySelectorAll(".bar-chart-container .bar");

    // Remove glow effect from all bars
    bars.forEach(bar => bar.classList.remove("glow"));

    // Determine which bar to highlight
    let index = getTimeCategory(hour);
    if (bars[index]) {
        bars[index].classList.add("glow");
    }
}

function updateSightingStats() {
    let sightingsPerHour = new Array(24).fill(0); // Array for 24 hours

    // Parse event times and count sightings per hour
    sightingsData.forEach(d => {
        let hour = parseInt(d.EventTime.split(":")[0]); // Extract hour
        let isPM = d.EventTime.includes("PM");

        if (hour === 12) hour = isPM ? 12 : 0; // 12 AM & PM edge case
        else if (isPM) hour += 12; // Convert PM to 24-hour format

        sightingsPerHour[hour]++;
    });

    console.log("Sightings Per Hour:", sightingsPerHour);
    return sightingsPerHour;
}

function updateUfoCount(hour, season = "all") {
    const ufoSpace = document.getElementById("ufo-space");
    ufoSpace.innerHTML = ""; // Clear previous UFOs

    // ✅ Filter data by season
    let filteredSightings = sightingsData;

    if (season !== "all") {
        filteredSightings = sightingsData.filter(d => {
            let month = parseInt(d.EventDate.split("/")[0]); // Extract month from MM/DD/YYYY
            return (season === "winter" && [12, 1, 2].includes(month)) ||
                   (season === "spring" && [3, 4, 5].includes(month)) ||
                   (season === "summer" && [6, 7, 8].includes(month)) ||
                   (season === "autumn" && [9, 10, 11].includes(month));
        });
    }

    // ✅ Count sightings for the selected season & hour
    let sightingsPerHour = new Array(24).fill(0);

    filteredSightings.forEach(d => {
        let eventHour = parseInt(d.EventTime.split(":")[0]); // Extract hour
        let isPM = d.EventTime.includes("PM");

        if (eventHour === 12) eventHour = isPM ? 12 : 0; // Handle 12 AM/PM case
        else if (isPM) eventHour += 12; // Convert PM to 24-hour format

        sightingsPerHour[eventHour]++;
    });

    let sightingsCount = sightingsPerHour[hour] || 0;

    // ✅ Set label based on sightings count
    let sightingsLabel = "Low";
    if (sightingsCount >= 50) sightingsLabel = "Medium";
    if (sightingsCount >= 100) sightingsLabel = "High";

    // ✅ Update the sightings label in the UI
    document.getElementById("sightings-count").textContent = `Sightings: ${sightingsCount} (${sightingsLabel})`;

    // ✅ Adjust UFO animation count
    let ufoCount = sightingsLabel === "High" ? 5 : sightingsLabel === "Medium" ? 3 : 1;

    for (let i = 0; i < ufoCount; i++) {
        const ufo = document.createElement("img");
        ufo.src = "img/ufo1.png";
        ufo.classList.add("ufo");
        ufo.style.left = `${Math.random() * 150}px`;
        ufo.style.top = `${Math.random() * 40}px`;
        ufoSpace.appendChild(ufo);
    }
}



// Load initial sightings per hour data
let initialSightingsPerHour = updateSightingStats();

// Create a mapping for Tableau-style time ranges
let initialTimeCategories = {
    "Morning": 0, "Afternoon": 0, "Evening": 0, "Night": 0, "Late Night": 0
};

// Convert initial sightings per hour into categories
for (let hour = 0; hour < 24; hour++) {
    let category = getCurrentTimeCategory(hour);
    initialTimeCategories[category] += initialSightingsPerHour[hour] || 0;
}

// Initialize chart with real sightings data
let ctx = document.getElementById("barChart").getContext("2d");

let barChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Morning", "Afternoon", "Evening", "Night", "Late Night"],
        datasets: [{
            label: "UFO Sightings",
            backgroundColor: ["gold", "gold", "gold", "gold", "gold"], // Default colors
            borderColor: "black",
            borderWidth: 1,
            data: [
                initialTimeCategories["Morning"],
                initialTimeCategories["Afternoon"],
                initialTimeCategories["Evening"],
                initialTimeCategories["Night"],
                initialTimeCategories["Late Night"]
            ]
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});


function updateBarChart(season) {
    console.log(`Updating bar chart for ${season}`);

    let filteredSightings = sightingsData;

    // ✅ Filter Data by Season
    if (season !== "all") {
        filteredSightings = sightingsData.filter(d => {
            let month = parseInt(d.EventDate.split("/")[0]); // Extract month from "MM/DD/YYYY"
            return (season === "winter" && [12, 1, 2].includes(month)) ||
                   (season === "spring" && [3, 4, 5].includes(month)) ||
                   (season === "summer" && [6, 7, 8].includes(month)) ||
                   (season === "autumn" && [9, 10, 11].includes(month));
        });
    }

    // ✅ Recalculate sightings per hour
    let sightingsPerHour = new Array(24).fill(0);
    filteredSightings.forEach(d => {
        let hour = parseInt(d.EventTime.split(":")[0]); // Extract hour
        let isPM = d.EventTime.includes("PM");

        if (hour === 12) hour = isPM ? 12 : 0; // Handle 12 AM/PM correctly
        else if (isPM) hour += 12; // Convert PM to 24-hour format

        sightingsPerHour[hour]++;
    });

    // ✅ Convert sightings per hour into Tableau-style time categories
    let timeCategories = {
        "Morning": 0, "Afternoon": 0, "Evening": 0, "Night": 0, "Late Night": 0
    };

    for (let hour = 0; hour < 24; hour++) {
        let category = getCurrentTimeCategory(hour);
        timeCategories[category] += sightingsPerHour[hour] || 0;
    }

    let newData = [
        timeCategories["Morning"],
        timeCategories["Afternoon"],
        timeCategories["Evening"],
        timeCategories["Night"],
        timeCategories["Late Night"]
    ];

    if (barChart) {
        // ✅ Update the chart with filtered data
        barChart.data.datasets[0].data = newData;

        // ✅ Change colors dynamically based on time
        barChart.data.datasets[0].backgroundColor = barChart.data.labels.map(label => {
            return (label === getCurrentTimeCategory(currentHour)) ? "red" : "gold";
        });

        barChart.update();
    } else {
        console.error("Bar chart is not initialized!");
    }
}



function getCurrentTimeCategory(hour) {
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    if (hour >= 21 && hour  <= 23) return "Night";
    return "Late Night";
}


function setupEventListeners() {
    const playButton = document.getElementById("play");
    const resetButton = document.getElementById("reset");
    const seasonButtons = document.querySelectorAll(".season-btn");

    if (playButton && resetButton) {
        playButton.addEventListener("click", function () {
            if (!isPlaying) {
                isPlaying = true;
                this.textContent = "Pause";
                animateClock();
            } else {
                isPlaying = false;
                this.textContent = "Play";
                clearTimeout(timeoutId);
            }
        });

        resetButton.addEventListener("click", function () {
            isPlaying = false;
            clearTimeout(timeoutId);
            currentHour = 0;
            selectedSeason = "all"; // Reset to default season
            document.getElementById("play").textContent = "Play";
            document.getElementById("time-display").textContent = "12 AM";
            hand.transition().duration(500).attr("transform", "rotate(0)");
            updateSeasonView(); // ✅ Reset season data on reset
        });
    }

    // ✅ Ensure season buttons correctly update the UI
    seasonButtons.forEach(button => {
        button.addEventListener("click", function () {
            selectedSeason = this.dataset.season;

            // Remove 'selected' class from all buttons & highlight the clicked one
            seasonButtons.forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");

            updateSeasonView(); // ✅ Call update when season is clicked
        });
    });
}

function updateSeasonView() {
    updateUfoCount(currentHour, selectedSeason);
    updateBarChart(selectedSeason);
}

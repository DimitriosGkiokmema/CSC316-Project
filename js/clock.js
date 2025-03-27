document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    updateSightingsForHour(0, "all");
    initializeLineChart();
    updateClockNumbersBold(0);

    // ✅ Set default threshold values for "All Seasons"
    document.getElementById("zone-text").innerHTML = `
    <strong>Peak Time:</strong> Over 400 sightings<br><br>
    <strong>Dead Time:</strong> Fewer than 75 sightings
    `;

    // ✅ Set default zone insight message
    document.getElementById("zone-insight").innerHTML = `
        <em>Click on a green or red dot to learn more about Peak & Dead Times.</em>
    `;
});

let sightingsData = [];


d3.csv("data/NUFORCdata.csv").then(data => {
    sightingsData = data;
}).catch(error => console.error("Error loading CSV:", error));


const clockWidth = 350, clockHeight = 350, radius = 140;


const clockSvg = d3.select("#clock")
    .append("g")
    .attr("transform", `translate(${clockWidth / 2},${clockHeight / 2})`);


clockSvg.append("circle")
    .attr("r", radius)
    .attr("fill", "white")
    .attr("stroke", "black");


for (let i = 1; i <= 12; i++) {
    let angle = i * 30 * (Math.PI / 180);
    let x = Math.sin(angle) * (radius - 15);
    let y = -Math.cos(angle) * (radius - 15);
    clockSvg.append("text")
        .attr("x", x)
        .attr("y", y + 7)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "22px")
        .attr("font-family", "Turret Road")
        .attr("font-weight", "900")
        .attr("class", "clock-number") // ✅ Add class
        .attr("data-hour", i) // ✅ Add data attribute for reference
        .text(i);
}


const hand = clockSvg.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", -radius + 40)
    .attr("stroke", "gold")
    .attr("stroke-width", 5)
    .attr("transform", "rotate(0)");


let isPlaying = false;
let currentHour = 0;
let timeoutId;
let selectedSeason = "all";

function updateClock(hour) {
    let displayHour = hour % 12 === 0 ? 12 : hour % 12;
    let period = hour >= 12 ? "PM" : "AM";

    console.log(`Clock Display -> Showing ${displayHour} ${period} (Hour: ${hour})`);

    document.getElementById("time-display").textContent = `${displayHour} ${period}`;
}



// Animate the clock
function animateClock() {
    if (!isPlaying) return;

    let rotation = currentHour * 30;

    hand.transition()
        .attr("transform", `rotate(${rotation})`)
        .on("end", () => {
            updateClock(currentHour);
            updateClockNumbersBold(currentHour);
            updateSightingsForHour(currentHour, selectedSeason);
            currentHour = (currentHour + 1) % 24;
            timeoutId = setTimeout(animateClock, 700);
        });
}

let lastHour = 0; 
let isPM = false;
let lastAngle = NaN;

const drag = d3.drag()
    .on("start", function () {
        d3.select(this).raise(); // Keeps hand on top
    })
    .on("drag", function (event) {
        let boundingRect = document.getElementById("clock").getBoundingClientRect();
        let centerX = boundingRect.left + boundingRect.width / 2;
        let centerY = boundingRect.top + boundingRect.height / 2;
        let x = event.sourceEvent.clientX - centerX;
        let y = event.sourceEvent.clientY - centerY;

        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        let newHour = Math.round(angle / 30) % 12;
        if (newHour === 0) newHour = 12;

        let direction = "neutral";
        if (!isNaN(lastAngle)) {
            direction = angle > lastAngle ? "forward" : "backward";
        }

        if (lastHour === 11 && newHour === 12 && direction === "forward") {
            isPM = !isPM;
        }
        if (lastHour === 12 && newHour === 11 && direction === "backward") {
            isPM = !isPM;
        }

        let convertedHour;
        if (newHour === 12 && !isPM) {
            convertedHour = 0;  
        } else if (newHour === 12 && isPM) {
            convertedHour = 12; 
        } else if (isPM) {
            convertedHour = newHour + 12;
        } else {
            convertedHour = newHour;
        }

        currentHour = convertedHour; 
        lastHour = newHour;
        lastAngle = angle; 

        hand.attr("transform", `rotate(${newHour * 30})`);
        document.getElementById("time-display").textContent = `${newHour} ${isPM ? "PM" : "AM"}`;

        updateSightingsForHour(currentHour, selectedSeason);

        updateClockNumbersBold(currentHour);
    });

hand.call(drag);


function updateClockNumbersBold(hour) {
    d3.selectAll(".clock-number").attr("font-weight", "normal"); // Reset all numbers
    let hour12Format = hour % 12 === 0 ? 12 : hour % 12;
    d3.select(`.clock-number[data-hour='${hour12Format}']`).attr("font-weight", "bold"); // ✅ Bold the current hour

    highlightLineChartDot(hour); // ✅ Ensures the corresponding dot is highlighted
}



function highlightLineChartDot(hour) {
    let chart = window.myLineChart;
    if (!chart) {
        return;
    }

    console.log(`Highlighting dot for hour: ${hour}`); // ✅ Debugging log

    chart.options.animation = false; // ✅ Disable animation for instant update

    // Reset all dots to normal size
    chart.data.datasets[0].pointRadius = Array(24).fill(4);
    chart.data.datasets[0].pointHoverRadius = Array(24).fill(6);

    // Check if hour index is valid
    if (hour < 0 || hour > 23) {
        console.warn("Invalid hour value for highlight:", hour);
        return;
    }

    // Make the corresponding dot larger
    chart.data.datasets[0].pointRadius[hour] = 8;
    chart.data.datasets[0].pointHoverRadius[hour] = 10;

    chart.update(); // ✅ Force chart to refresh
}




function updateSightingsForHour(hour, season = "all") {
    let sightingsCount = 0;

    if (sightingsData.length === 0) {
        sightingsCount = 392; 
    } else {
        
        let filteredSightings = (season === "all") 
            ? sightingsData 
            : sightingsData.filter(d => {
                let month = parseInt(d.Date.split("/")[0]); 
                return (season === "winter" && [12, 1, 2].includes(month)) ||
                    (season === "spring" && [3, 4, 5].includes(month)) ||
                    (season === "summer" && [6, 7, 8].includes(month)) ||
                    (season === "autumn" && [9, 10, 11].includes(month));
            });

        let sightingsPerHour = new Array(24).fill(0);
        filteredSightings.forEach(d => {
            let rawTime = d.Time.trim(); 
            let isPM = rawTime.includes("PM");
            let eventHour = parseInt(rawTime.split(":")[0]); 

        
            if (eventHour === 12 && !isPM) {
                eventHour = 0;  
            } else if (eventHour === 12 && isPM) {
                eventHour = 12;
            } else if (isPM) {
                eventHour += 12;
            }
        
            sightingsPerHour[eventHour]++;
        });       

        sightingsCount = sightingsPerHour[hour] || 0
        
    }

    document.getElementById("sightings-count").textContent = 
        `Sightings for this hour: ${sightingsCount}`;
}

document.getElementById("lineChart").addEventListener("click", function (event) {
    let chart = window.myLineChart;
    let points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

    if (points.length) {
        let index = points[0].index;
        let count = chart.data.datasets[0].data[index];
        let color = chart.data.datasets[0].borderColor[index]; 

        let insights = {
            all: {
                peak: "Over half of all sightings occur between 8 PM and midnight.",
                dead: "Few UFOs are reported between 5 AM and 9 AM—when most people are indoors or asleep."
            },
            winter: {
                peak: "Long nights mean earlier peaks—most sightings happen before 10 PM.",
                dead: "Daytime sightings (8 AM - 3 PM) are especially rare in winter."
            },
            spring: {
                peak: "Sightings surge after 10 PM, staying high through late night.",
                dead: "Mornings see the fewest reports, with a slow build throughout the day."
            },
            summer: {
                peak: "Summer sees the most UFOs, peaking from 10 PM to 1 AM.",
                dead: "Early morning (5 AM - 9 AM) is the quietest time for sightings."
            },
            autumn: {
                peak: "UFOs are most common just after sunset, between 7 PM and 11 PM.",
                dead: "Mornings (8 AM - 9 AM) see the fewest sightings of the season."
            }
        };

        // ✅ Update the Zone Insight Box based on dot color
        if (color === "green") {
            document.getElementById("zone-insight").innerHTML = `
                <strong>Peak Time:</strong> ${insights[selectedSeason].peak}
            `;
        } else if (color === "red") {
            document.getElementById("zone-insight").innerHTML = `
                <strong>Dead Time:</strong> ${insights[selectedSeason].dead}
            `;
        } else {
            document.getElementById("zone-insight").innerHTML = `
                <em>Click on a green or red dot to learn more about Peak & Dead Times.</em>
            `;
        }
    }
});

// ✅ Reset to default insight message when season changes
function updateSeasonView() {
    // Reset Insight Box
    document.getElementById("zone-insight").innerHTML = `
        <em>Click on a green or red dot to learn more about Peak & Dead Times.</em>
    `;

    let { sightingsPerHour, pointBackgroundColors, borderColors } = getLineChartData(selectedSeason);

    if (window.myLineChart) {
        window.myLineChart.data.datasets[0].data = sightingsPerHour;
        window.myLineChart.data.datasets[0].pointBackgroundColor = pointBackgroundColors;
        window.myLineChart.data.datasets[0].borderColor = borderColors;
        window.myLineChart.data.datasets[0].segment = {
            borderColor: ctx => borderColors[ctx.p0DataIndex]
        };

        let peakThreshold = selectedSeason === "all" ? 400 : 75;
        let deadThreshold = selectedSeason === "all" ? 75 : 25;

        window.myLineChart.data.datasets[1].data = Array(24).fill(peakThreshold);
        window.myLineChart.data.datasets[2].data = Array(24).fill(deadThreshold);

        let maxY = selectedSeason === "all" ? 1000 : 500;
        window.myLineChart.options.scales.y.suggestedMax = maxY;

        window.myLineChart.update();
    }

    updateSightingsForHour(currentHour, selectedSeason);

    document.getElementById("zone-text").innerHTML = `
        <strong>Peak Time:</strong> ${selectedSeason === "all" ? "Over 400 sightings" : "Over 75 sightings"}  
        <br><br> 
        <strong>Dead Time:</strong> ${selectedSeason === "all" ? "Fewer than 75 sightings" : "Fewer than 25 sightings"}
    `;
}



const peakZonesBySeason = {
    all: [20, 21, 22, 23], // 8 PM - 12 AM
    winter: [19, 20, 21, 22], // 7 PM - 11 PM
    spring: [20, 21, 22, 23], // 8 PM - 12 AM
    summer: [21, 22, 23, 0], // 9 PM - 12 AM
    autumn: [19, 20, 21, 22] // 7 PM - 11 PM
};

const deadZonesBySeason = {
    all: [5, 6, 7, 8], // 5 AM - 9 AM
    winter: [6, 7, 8, 9], // 6 AM - 10 AM
    spring: [5, 6, 7, 8], // 5 AM - 9 AM
    summer: [4, 5, 6, 7], // 4 AM - 8 AM
    autumn: [5, 6, 7, 8] // 5 AM - 9 AM
};



function initializeLineChart() {
    if (!sightingsData || sightingsData.length === 0) {
        setTimeout(initializeLineChart, 500);
        return;
    }

    let ctx = document.getElementById("lineChart").getContext("2d");
    let { sightingsPerHour, pointBackgroundColors, borderColors } = getLineChartData("all");

    window.myLineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [
                "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM",
                "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM",
                "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
            ],
            datasets: [
                {
                    label: "UFO Sightings",
                    data: sightingsPerHour,
                    borderColor: borderColors,
                    backgroundColor: "rgba(255, 255, 0, 0.2)",
                    borderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: pointBackgroundColors,
                    segment: {
                        borderColor: ctx => borderColors[ctx.p0DataIndex]
                    }
                },
                {
                    label: "Peak Zone Threshold",
                    data: Array(24).fill(400), // ✅ Draws a horizontal line at y=500
                    borderColor: "green",
                    borderWidth: 2,
                    borderDash: [5, 5], // ✅ Dashed line
                    hidden: true,
                    pointRadius: 1
                },
                {
                    label: "Dead Zone Threshold",
                    data: Array(24).fill(75), // ✅ Draws a horizontal line at y=75
                    borderColor: "red",
                    borderWidth: 2,
                    borderDash: [5, 5], // ✅ Dashed line
                    hidden: true,
                    pointRadius: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (tooltipItems) {
                            let hour = tooltipItems[0].label;
                            let seasonLabel = selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1);
                            return `${seasonLabel}: ${hour}`;
                        },
                        label: function (context) {
                            let sightings = context.raw;
                            let color = context.dataset.borderColor;
                            let zoneText = (color === "green") ? " (Peak Threshold)" : (color === "red") ? " (Dead Threshold)" : "";
                            return `Sightings: ${sightings}${zoneText}`;
                        }
                    },
                    displayColors: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time of Day"
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 1000,
                    title: {
                        display: true,
                        text: "Number of Sightings"
                    }
                }
            }
        }
    });

    console.log("Line chart initialized with real data!");
}


document.getElementById("toggle-threshold-lines").addEventListener("click", function () {
    let peakLine = window.myLineChart.data.datasets[1];
    let deadLine = window.myLineChart.data.datasets[2];

    peakLine.hidden = !peakLine.hidden;
    deadLine.hidden = !deadLine.hidden;

    window.myLineChart.update();
});



function getLineChartData(season) {
    let sightingsPerHour = new Array(24).fill(0); // Initialize 24-hour format

    let filteredSightings = (season === "all") 
        ? sightingsData 
        : sightingsData.filter(d => {
            let month = parseInt(d.Date.split("/")[0]); 
            return (season === "winter" && [12, 1, 2].includes(month)) ||
                (season === "spring" && [3, 4, 5].includes(month)) ||
                (season === "summer" && [6, 7, 8].includes(month)) ||
                (season === "autumn" && [9, 10, 11].includes(month));
        });

    filteredSightings.forEach(d => {
        let rawTime = d.Time.trim();
        let isPM = rawTime.includes("PM");
        let eventHour = parseInt(rawTime.split(":")[0]);

        if (eventHour === 12 && !isPM) eventHour = 0; // 12 AM = 0
        else if (eventHour === 12 && isPM) eventHour = 12; // 12 PM = 12
        else if (isPM) eventHour += 12; // Convert PM hours to 24-hour format

        sightingsPerHour[eventHour]++;
    });

    // Set strict numerical cutoffs for Peak & Dead Zones
    let peakThreshold = season === "all" ? 400 : 75;
    let deadThreshold = season === "all" ? 75 : 25;

    let pointBackgroundColors = sightingsPerHour.map((count) => {
        if (count > peakThreshold) return "green"; // Peak Zone
        if (count < deadThreshold) return "red"; // Dead Zone
        return "white"; // Normal
    });

    let borderColors = sightingsPerHour.map((count) => {
        if (count > peakThreshold) return "green"; // Peak Zone
        if (count < deadThreshold) return "red"; // Dead Zone
        return "white"; // Normal
    });

    return { sightingsPerHour, pointBackgroundColors, borderColors };
}


document.getElementById("lineChart").addEventListener("click", function (event) {
    let chart = window.myLineChart;
    let points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

    if (points.length) {
        let index = points[0].index;
        let count = chart.data.datasets[0].data[index];
        let color = chart.data.datasets[0].borderColor[index];

        if (color === "green" || color === "red") {
        }
    }
});



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
            document.getElementById("play").textContent = "Play";
            document.getElementById("time-display").textContent = "12 AM";
            hand.transition().duration(200).attr("transform", "rotate(0)");
            updateSeasonView();
            updateClockNumbersBold(0);
        });
    }

    seasonButtons.forEach(button => {
        button.addEventListener("click", function () {
            selectedSeason = this.dataset.season;

            seasonButtons.forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");

            updateSeasonView();
        });
    });
}

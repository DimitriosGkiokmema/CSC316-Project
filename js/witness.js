let data = {
    "solo": { "single": 0, "smallGroup": 0, "fleet": 0 },
    "smallGroup": { "single": 0, "smallGroup": 0, "fleet": 0 },
    "crowd": { "single": 0, "smallGroup": 0, "fleet": 0 }
};

const small_group = 5; 
let selectedWitness = "none";
let selectedShip = "none";

// Function to update visualization
function updateVisualization() {
    let percentage = 0;

    if (selectedWitness !== "none" && selectedShip !== "none") {
        percentage = data[selectedWitness][selectedShip];
    } else if (selectedWitness !== "none") {
        let total = Object.values(data[selectedWitness]).reduce((sum, val) => sum + val, 0);
        percentage = total;
    } else if (selectedShip !== "none") {
        let total = Object.keys(data).reduce((sum, witness) => sum + data[witness][selectedShip], 0);
        percentage = total;
    }
    
    let numTotalReports = Object.keys(data).reduce((sum, witness) => 
        sum + data[witness].single + data[witness].smallGroup + data[witness].fleet, 0
    );

    if (selectedWitness === "none" && selectedShip === "none") {
        percentage = numTotalReports;
    }

    document.getElementById("percentage-output").textContent = `Sightings: ${percentage}`;
    const bar = document.getElementById("percentage-bar");
    bar.style.width = `${(percentage / numTotalReports * 100).toFixed(2)}%`;
    bar.textContent = `${(percentage / numTotalReports * 100).toFixed(2)}%`;
}

// Process CSV data
function processReports(reports) {
    reports.forEach(report => {
        if (report.TotalObservers === 1) {
            if (report.NumShips === 1) {
                data.solo.single += 1;
            } else if (report.NumShips <= small_group) {
                data.solo.smallGroup += 1;
            } else {
                data.solo.fleet += 1;
            }
        } else if (report.TotalObservers <= small_group) {
            if (report.NumShips === 1) {
                data.smallGroup.single += 1;
            } else if (report.NumShips <= small_group) {
                data.smallGroup.smallGroup += 1;
            } else {
                data.smallGroup.fleet += 1;
            }
        } else {
            if (report.NumShips === 1) {
                data.crowd.single += 1;
            } else if (report.NumShips <= small_group) {
                data.crowd.smallGroup += 1;
            } else {
                data.crowd.fleet += 1;
            }
        }
    });

    console.log("Data after processing:", data);
    initializePage(); // Ensures the page updates only after data is processed
}

// Load CSV and process data
d3.csv("data/NUFORCData.csv", row => {
    row.TotalObservers = +row.TotalObservers;
    row.NumShips = +row.NumShips;
    return row;
}).then(processReports).catch(error => {
    console.error("Error loading or processing CSV data:", error);
});

// Function to initialize event listeners
function initializePage() {
    console.log("Initializing page with processed data...");
    updateVisualization();
    
    document.querySelectorAll(".witness-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".witness-btn").forEach(b => b.classList.remove("selected"));
            this.classList.add("selected");
    
            selectedWitness = this.dataset.value; // Ensure selectedWitness updates
            updateVisualization();
            updateLandingPad(); // Make sure stickmen appear
        });
    });
    
    document.querySelectorAll(".ship-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".ship-btn").forEach(b => b.classList.remove("selected"));
            this.classList.add("selected");
    
            selectedShip = this.dataset.value; // Ensure selectedShip updates
            updateVisualization();
            updateUfoSpace(); // Make sure UFOs appear
        });
    });

    updateVisualization();
}

function updateLandingPad() {
    const landingPad = document.getElementById("landing-pad");
    landingPad.innerHTML = ""; // Clear previous stickmen

    let positions = [];

    if (selectedWitness === "solo") {
        positions = [{ left: "60px", bottom: "10px" }];
    } else if (selectedWitness === "smallGroup") {
        positions = [
            { left: "40px", bottom: "15px" },
            { left: "80px", bottom: "15px" },
            { left: "60px", bottom: "10px" }
        ];
    } else if (selectedWitness === "crowd") {
        positions = [
            { left: "110px", bottom: "15px" },
            { left: "10px", bottom: "15px" },
            { left: "30px", bottom: "20px" },
            { left: "50px", bottom: "20px" },
            { left: "70px", bottom: "20px" },
            { left: "100px", bottom: "15px" },
            { left: "20px", bottom: "10px" },
            { left: "40px", bottom: "15px" },
            { left: "80px", bottom: "15px" },
            { left: "60px", bottom: "10px" }
        ];
    }

    positions.forEach((pos, index) => {
        setTimeout(() => {
            const stickman = document.createElement("img");
            stickman.src = "img/stickman6.png";
            stickman.classList.add("stickman");

            stickman.style.left = pos.left;
            stickman.style.bottom = pos.bottom;

            landingPad.appendChild(stickman);
        }, index * 150); // Delay each stickman by 150ms for staggered landing
    });
}

function updateUfoSpace() {
    const ufoSpace2 = document.getElementById("ufo-space2");
    ufoSpace2.innerHTML = ""; // Clear previous UFOs

    let positions = [];

    if (selectedShip === "single") {
        positions = [{ left: "100px", top: "10px" }];
    } else if (selectedShip === "smallGroup") {
        positions = [
            { left: "50px", top: "20px" },
            { left: "120px", top: "10px" },
            { left: "190px", top: "20px" }
        ];
    } else if (selectedShip === "fleet") {
        positions = [
            { left: "20px", top: "-100px" },
            { left: "80px", top: "-90px" },
            { left: "140px", top: "-80px" },
            { left: "200px", top: "-70px" },
            { left: "30px", top: "-60px" },
            { left: "100px", top: "-50px" },
            { left: "170px", top: "-40px" },
            { left: "230px", top: "-30px" }
        ];
    }

    positions.forEach((pos, index) => {
        setTimeout(() => {
            const ufo2 = document.createElement("img");
            ufo2.src = "img/ufo1.png";
            ufo2.classList.add("ufo2");

            ufo2.style.left = pos.left;
            ufo2.style.top = pos.top;

            ufoSpace2.appendChild(ufo2);
        }, index * 150); // Delay each UFO by 150ms for staggered flying effect
    });
}

// Ensure the DOM is loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded.");
});

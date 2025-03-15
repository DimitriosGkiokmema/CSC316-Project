document.addEventListener("DOMContentLoaded", function () {
    const data = {
        "solo": { "single": 5, "smallGroup": 12, "fleet": 3 },
        "smallGroup": { "single": 10, "smallGroup": 20, "fleet": 8 },
        "crowd": { "single": 3, "smallGroup": 7, "fleet": 2 }
    };

    let selectedWitness = "none";
    let selectedShip = "none";

    function updateVisualization() {
        let percentage = 0;
    
        if (selectedWitness !== "none" && selectedShip !== "none") {
            percentage = data[selectedWitness][selectedShip] || 0;
        } else if (selectedWitness !== "none") {
            let total = 0;
            Object.values(data[selectedWitness]).forEach(value => total += value);
            percentage = total;
        } else if (selectedShip !== "none") {
            let total = 0;
            Object.keys(data).forEach(witness => total += data[witness][selectedShip] || 0);
            percentage = total;
        }
    
        document.getElementById("percentage-output").textContent = `Sightings: ${percentage}%`;
    
        // Update the percentage bar
        const bar = document.getElementById("percentage-bar");
        bar.style.width = `${percentage}%`;
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
});
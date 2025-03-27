document.addEventListener('DOMContentLoaded', function () {
    const shapes = document.querySelectorAll('.ufo-shape');
    shapes.forEach(shape => {
        const x = shape.getAttribute('data-x');
        const y = shape.getAttribute('data-y');
        if (x && y) {
            shape.style.position = "absolute"; // Ensure absolute positioning
            shape.style.left = x + 'px';
            shape.style.top = y + 'px';
        }
    });

    const title = document.getElementById('shape-title');
    const details = document.getElementById('shape-details');
    const decadeSelect = document.getElementById("decade-select");

    let ufoSightings = {}; 
    let proportionalSizing = false;
    let fullData = [];
    let selectedShapeId = null;
    
    function getDecade(year) {
        if (year <= 1969) return "1960s";
        if (year >= 1970 && year <= 1979) return "1970s";
        if (year >= 1980 && year <= 1989) return "1980s";
        if (year >= 1990 && year <= 1999) return "1990s";
        if (year >= 2000 && year <= 2009) return "2000s";
        if (year >= 2010 && year <= 2019) return "2010s";
        if (year >= 2020) return "2020s";
        return "unknown";
    }


    function updateShapeVisualization(selectedDecade) {
        ufoSightings = {}; // Reset

        fullData.forEach(row => {
            const dateStr = row["EventDate"]?.trim();
            const shape = row["Shape"]?.trim();
            if (!dateStr || !shape) return; // Skip missing data

            const yearMatch = dateStr.match(/\d{4}$/);
            if (!yearMatch) return;
            const year = parseInt(yearMatch[0], 10);
            const shapeDecade = getDecade(year);

            if (selectedDecade === "all" || shapeDecade === selectedDecade) {
                ufoSightings[shape] = (ufoSightings[shape] || 0) + 1;
            }
        });

        console.log("Filtered UFO Sightings:", ufoSightings);
        updateShapeSizes();

        
    }

    function updateShapeSizes() {
        const maxSightings = Math.max(...Object.values(ufoSightings));
        const minSightings = Math.min(...Object.values(ufoSightings));

        const defaultSize = 70;
        const minSize = 20;
        const maxSize = 150;

        function getSize(sightingCount) {
            if (sightingCount === 0) return 0;
            
            // Apply a step multiplier so sizes increase more aggressively
            const stepMultiplier = 1.5;
            const normalized = (sightingCount - minSightings) / (maxSightings - minSightings);
            
            return minSize + (normalized * (maxSize - minSize) * stepMultiplier);
        }

        shapes.forEach(shape => {
            const id = shape.id.replace("shape-", ""); 
            const formattedId = id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
            const sightingCount = ufoSightings[formattedId] || 0;
            
            if (sightingCount === 0) {
                shape.style.display = "none"; // Hide shape if it has 0 reports
            } else {
                shape.style.display = "block"; // Show shape if it has reports
    
                if (proportionalSizing) {
                    const newSize = getSize(sightingCount);
                    const scaleFactor = newSize / defaultSize;
                    shape.style.transform = `scale(${scaleFactor})`;
                } else {
                    shape.style.width = `${defaultSize}px`; // ✅ Ensures all shapes start at 70px
                    shape.style.height = `${defaultSize}px`;
                    shape.style.transform = `scale(1)`;
                }
            }
        });

        function updateSidebar(shapeId) {
            const formattedId = shapeId.charAt(0).toUpperCase() + shapeId.slice(1).toLowerCase();
            const sightingsCount = ufoSightings[formattedId] || 0;
        
            if (ufoData[formattedId]) {
                title.textContent = ufoData[formattedId].title;
                details.innerHTML = `
                    <p>${ufoData[formattedId].desc}</p>
                    <p><strong>Number of Reports:</strong> ${sightingsCount}</p>
                `;
            } else {
                title.textContent = "Unknown Shape";
                details.innerHTML = `
                    <p>No information available for this shape.</p>
                    <p><strong>Number of Reports:</strong> ${sightingsCount}</p>
                `;
            }
        
            console.log(`Updated sidebar for shape: ${formattedId}, Reports: ${sightingsCount}`);
        }
        

        shapes.forEach(shape => {
            shape.addEventListener("click", function () {
                selectedShapeId = shape.id.replace("shape-", ""); // ✅ Save clicked shape persistently
                updateSidebar(selectedShapeId);
            });
        });
        
        
    }

    const tooltip = document.getElementById("tooltip");

    shapes.forEach(shape => {
        shape.addEventListener("mouseenter", function (event) {
            const shapeId = shape.id.replace("shape-", ""); 
            const formattedId = shapeId.charAt(0).toUpperCase() + shapeId.slice(1).toLowerCase();

            tooltip.textContent = formattedId;
            tooltip.style.display = "block";
        });

        shape.addEventListener("mousemove", function (event) {
            tooltip.style.left = `${event.pageX + 10}px`; // Slight offset from cursor
            tooltip.style.top = `${event.pageY + 10}px`;
        });

        shape.addEventListener("mouseleave", function () {
            tooltip.style.display = "none";
        });
    });

    fetch("data/NUFORCdata.csv")
        .then(response => response.text())
        .then(csvData => {
            const parsedData = Papa.parse(csvData, { header: true }).data;
            fullData = parsedData; // Store full dataset
            updateShapeVisualization("all"); // Default to all decades
        })
        .catch(error => console.error("Error loading CSV:", error));

    decadeSelect.addEventListener("change", function () {
        updateShapeVisualization(decadeSelect.value);
    
        // Reset sidebar content to default
        selectedShapeId = null;
        title.textContent = "Select a shape";
        details.innerHTML = `<p>Click on a shape to see details.</p>`;
    });

    const toggleButton = document.getElementById('toggle-proportional');
    toggleButton.addEventListener('click', function () {
        proportionalSizing = !proportionalSizing;
        updateShapeSizes();
        this.classList.toggle("active"); // Toggle active class on button
    });

    // UFO Shape Descriptions (Updated to Match Data)
    const ufoData = {
        "Disk": { title: "Disk UFO", desc: "A classic flying saucer, smooth and disk-shaped, often with a domed top." },
        "Triangle": { title: "Triangle UFO", desc: "A mysterious black triangular craft, often seen silently hovering or moving slowly." },
        "Circle": { title: "Circle UFO", desc: "A perfectly round craft, often glowing or appearing as a floating orb." },
        "Oval": { title: "Oval UFO", desc: "A smooth, elongated craft, often described as glowing or metallic." },
        "Cylinder": { title: "Cylinder UFO", desc: "A tall, cylindrical craft often seen floating or rotating." },
        "Cigar": { title: "Cigar UFO", desc: "A long, cylindrical craft, often metallic and glowing." },
        "Rectangle": { title: "Rectangle UFO", desc: "A large, rectangular craft, sometimes with a glowing underside." },
        "Cube": { title: "Cube UFO", desc: "A geometric cube-shaped craft, sometimes rotating or glowing in mid-air." },
        "Sphere": { title: "Sphere UFO", desc: "A perfectly spherical craft, sometimes glowing or moving erratically." },
        "Teardrop": { title: "Teardrop UFO", desc: "A smooth, teardrop-shaped craft, often seen glowing or trailing light." },
        "Diamond": { title: "Diamond UFO", desc: "A symmetrical, diamond-shaped craft, often seen rotating or glowing." },
        "Light": { title: "Light UFO", desc: "A pure energy UFO, radiating intense white light against the night sky." },
        "Flash": { title: "Flash UFO", desc: "A jagged, lightning-shaped UFO, often appearing as a quick flash in the sky." },
        "Cross": { title: "Cross UFO", desc: "A UFO with extended arms, sometimes appearing as a glowing cross in the sky." },
        "Formation": { title: "Formation UFO", desc: "A group of UFOs flying in a coordinated formation, often seen moving in unison." },
        "Egg": { title: "Egg UFO", desc: "A smooth, egg-shaped craft, often metallic or glowing." },
        "Star": { title: "Star UFO", desc: "A radiant, star-shaped UFO, often seen as a pulsing light in the night sky." },
        "Other": { title: "Other UFO", desc: "A strange, unidentifiable flying object." },
        "Unknown": { title: "Unknown UFO", desc: "A mysterious, unidentified flying object with an unknown shape." },
        "Chevron": { title: "Chevron UFO", desc: "A V-shaped craft often reported in triangular formations." },
        "Cone": { title: "Cone UFO", desc: "A sharply pointed, cone-shaped craft, sometimes appearing with a glowing base." },
        "Orb": { title: "Orb UFO", desc: "A pulsating, glowing orb often reported as a plasma-like energy sphere." },
        "Fireball": { title: "Fireball UFO", desc: "A flaming, fast-moving object that burns brightly in the sky." },
        "Changing": { title: "Changing UFO", desc: "A morphing UFO that changes between different shapes and colors." }
    };
});

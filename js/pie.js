// 1️⃣ Define Fixed Shape Order
const shapeOrder = ["light", "triangle", "circle", "disk", "fireball", "sphere", "cigar", "oval", 
    "changing", "chevron", "cone", "cross", "cube", "cylinder", "diamond", "egg", "flash", "formation", 
    "orb", "other", "rectangle", "star", "triangle", "unknown"];

// 2️⃣ Load UFO Sighting Data from CSV
d3.csv("data/NUFORCdata.csv").then(data => {
    console.log("Loaded Data:", data); // Debugging - Check if data is loaded properly

    // 3️⃣ Convert Data into Decade-wise Shape Counts
    const shapeCountsByDecade = {};

    data.forEach(d => {
        // Ensure EventDate is properly parsed
        const dateParts = d.EventDate.split("/");
        if (dateParts.length !== 3) return; // Skip invalid dates

        const year = parseInt(dateParts[2], 10); // Extract year correctly

        // Categorize into decades
        let decade;
        if (year < 1970) decade = "1960s and Prior";
        else if (year < 1980) decade = "1970s";
        else if (year < 1990) decade = "1980s";
        else if (year < 2000) decade = "1990s";
        else if (year < 2010) decade = "2000s";
        else if (year < 2020) decade = "2010s";
        else decade = "2020s";

        // Initialize decade entry if not exists
        if (!shapeCountsByDecade[decade]) shapeCountsByDecade[decade] = {};

        // Clean and standardize shape names
        const shape = d.Shape.trim().toLowerCase(); // Lowercase & trim spaces
        if (shape) {
            if (!shapeCountsByDecade[decade][shape]) {
                shapeCountsByDecade[decade][shape] = 0;
            }
            shapeCountsByDecade[decade][shape]++;
        }
    });

    console.log("Processed Data:", shapeCountsByDecade); // Debugging

    // 4️⃣ Populate Dropdown with Decades
    const dropdown = d3.select("#decade-select");
    dropdown.selectAll("option")
        .data(Object.keys(shapeCountsByDecade))
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // 5️⃣ Set Up Pie Chart
    const width = 400, height = 400, radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const svg = d3.select("#pie-chart")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().sort(null).value(d => d.value); // 🔹 Fix: Disable automatic sorting
    const arc = d3.arc().innerRadius(0).outerRadius(radius - 20);

    // 6️⃣ Create Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-size", "14px");

    // 7️⃣ Function to Update Pie Chart
    function updatePieChart(decade) {
        if (!shapeCountsByDecade[decade]) return; // Prevent errors if data is missing

        // Ensure all shapes appear, even if missing
        const data = shapeOrder.map(shape => ({
            name: shape,
            value: shapeCountsByDecade[decade][shape] || 0 // If shape is missing, default to 0
        }));

        console.log(`Updating pie chart for: ${decade}`, data); // Debugging

        const slices = svg.selectAll("path").data(pie(data));

        // Update existing slices with smooth transition
        slices.transition().duration(500)
            .attrTween("d", function(d) {
                const i = d3.interpolate(this._current, d);
                this._current = i(1);
                return t => arc(i(t));
            });

        // Add new slices (fixed positions)
        slices.enter()
            .append("path")
            .attr("class", "pie-slice")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
            .each(function(d) { this._current = d; })
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .text(`${d.data.name}: ${d.data.value} sightings`);
                d3.select(this).attr("opacity", 0.7);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this).attr("opacity", 1);
            });

        slices.exit().remove();
    }

    // 8️⃣ Update Chart when Dropdown Changes
    dropdown.on("change", function() {
        updatePieChart(this.value);
    });

    // 9️⃣ Initialize with the first decade
    updatePieChart(Object.keys(shapeCountsByDecade)[0]);
});

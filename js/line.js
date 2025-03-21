const margin = { top: 70, right: 50, bottom: 70, left: 80 }, // Increased top & bottom margins
    parentElement = "chart";
    width = document.getElementById(parentElement).getBoundingClientRect().width - margin.left - margin.right,
    height = document.getElementById(parentElement).getBoundingClientRect().height - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Variables for controlling animation
let animationPaused = true;
let animationStarted = false;
let startTime, elapsedPausedTime = 0;
let progress = 0;
let timer;

// Add Main Title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40) // Move up
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("UFO Sightings Over Time");

// Add Subtitle
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20) // Positioned below title
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "16px")
    .text("Analyzing the rise and fall of reported UFO sightings per year");

// Load data from CSV
d3.csv("data/NUFORCdata.csv").then(data => {
    data.forEach(d => {
        let parsedDate = new Date(d.Date);
        if (!isNaN(parsedDate)) {
            d.year = parsedDate.getFullYear();
            d.sightings = 1;
        }
    });

    const aggregatedData = d3.rollups(
        data,
        v => v.length,
        d => d.year
    ).map(d => ({ year: d[0], sightings: d[1] }));

    aggregatedData.sort((a, b) => a.year - b.year);

    const x = d3.scaleLinear()
        .domain(d3.extent(aggregatedData, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(aggregatedData, d => d.sightings)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.sightings))
        .curve(d3.curveMonotoneX);

    const path = svg.append("path")
        .datum(aggregatedData)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("d", line);

    const totalLength = path.node().getTotalLength();

    const dots = svg.selectAll(".dot")
        .data(aggregatedData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.sightings))
        .attr("r", 3.5)
        .attr("fill", "white")
        .attr("opacity", 0);
    console.log("drew dots")

    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)

    // Key UFO event periods (middle of steep inclines/declines)
    const ufoEvents = [
        { year: 1955, sightings: 40, text: "The rise of UFO culture in the 1950s begins. The Roswell incident fuels public curiosity." },
        { year: 1975, sightings: 100, text: "Increased UFO sightings linked to government investigations (e.g., Project Blue Book)." },
        { year: 1995, sightings: 126, text: "Major incline in sightings! Public interest surges after 'The X-Files' and pop culture influence." },
        { year: 2005, sightings: 234, text: "Decline begins as media skepticism increases." },
        { year: 2010, sightings: 292, text: "Another rise! Social media fuels UFO reporting, conspiracy theories gain traction." },
        { year: 2016, sightings: 201, text: "Sightings drop again. Skepticism rises with scientific explanations for past reports." },
        { year: 2019, sightings: 293, text: "Massive spike! Declassified UFO footage by the Pentagon renews interest." },
        { year: 2021, sightings: 91, text: "Post-pandemic decline. Fewer reports after the 2020 surge." },
        { year: 2023, sightings: 106, text: "Decline as focus shifts away from UFOs in the media." }
    ];
    

    // Add UFO emojis
    const ufoIcons = svg.selectAll(".ufo")
        .data(ufoEvents)
        .enter()
        .append("text")
        .attr("class", "ufo")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.sightings) - 20) // Slightly above the line
        .attr("font-size", "34px")
        .attr("opacity", 0) // Hidden at start
        .text("🛸") // UFO emoji
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            if (d3.select(this).attr("opacity") == 1) { // Only show tooltip if UFO is visible
                d3.select(this).attr("font-size", "28px");
                tooltip.style("display", "block")
                    .html(`<em>Click to learn more...</em>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            }
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr("font-size", "34px");
            tooltip.style("display", "none");
        })
        .on("click", function (event, d) {
            showPopup(d.year, d.text);
        });

    // Function to show pop-up (only one at a time)
    function showPopup(year, text) {
        // Remove any existing pop-up
        d3.select(".popup").remove();

        // Create new pop-up
        const popup = d3.select("body").append("div")
            .attr("class", "popup")
            .html(`
                <div style="display: flex; justify-content: space-between;">
                    <strong>${year} UFO Event</strong>
                    <span class="close-popup" style="cursor: pointer; font-size: 18px;">✖</span>
                </div>
                <p style="margin-top: 10px;">${text}</p>
            `)
            .style("position", "fixed")
            .style("top", "50%")
            .style("left", "50%")
            .style("transform", "translate(-50%, -50%)")
            .style("background", "black")
            .style("color", "white")
            .style("padding", "20px")
            .style("border", "1px solid white")
            .style("border-radius", "10px")
            .style("box-shadow", "0 0 10px rgba(255,255,255,0.5)")
            .style("z-index", "1000");

        // Close pop-up when clicking 'X'
        popup.select(".close-popup").on("click", function () {
            popup.remove();
        });
    }


    function updateUFOs(currentX) {
        ufoIcons.each(function (d) {
            let ufo = d3.select(this);
            if (x(d.year) <= currentX && ufo.attr("opacity") == 0) { 
                ufo.attr("opacity", 1);
            }
        });
    }
    

    // Function to start or resume animation
    function startAnimation() {
        if (animationStarted) return; // Prevent multiple starts
        animationStarted = true;
        animationPaused = false;
        startTime = Date.now() - (progress * 8000); // Resume from progress point

        timer = d3.timer(function () {
            let elapsed = Date.now() - startTime;
            progress = elapsed / 8000; // 8 sec total animation

            if (progress > 1) {
                progress = 1;
                timer.stop();
            }

            let currentLength = totalLength * progress;
            let currentPoint = path.node().getPointAtLength(currentLength);
            let currentX = currentPoint.x;

            // ** Fix: Keep the line continuing smoothly instead of restarting **
            path.attr("stroke-dashoffset", totalLength * (1 - progress));

            // Ensure dots continue appearing at the right time
            dots.each(function (d) {
                if (x(d.year) <= currentX) {
                    d3.select(this).attr("opacity", 1);
                }
            });

            updateUFOs(currentX);

        });
    }


    // Function to pause animation
    function pauseAnimation() {
        animationPaused = true;
        animationStarted = false;
        timer.stop();
    }

    // Function to reset animation
    function resetAnimation() {
        animationStarted = false;
        animationPaused = true;
        progress = 0;
        path.attr("stroke-dashoffset", totalLength);
        dots.attr("opacity", 0);
        timer.stop();

        ufoIcons.attr("opacity", 0)
    }
    

    // Add button event listeners
    document.getElementById("play-pause").addEventListener("click", function () {
        if (visualViewport.animationPaused) {
            visualViewport.startAnimation();
            vis.textContent = "Pause";
        } else {
            pauseAnimation();
            vis.textContent = "Play";
        }
    });

    document.getElementById("reset").addEventListener("click", function () {
        resetAnimation();
        document.getElementById("play-pause").textContent = "Play";
    });

    // Add X-Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(10))
        .attr("color", "white");

    // Add X-Axis Label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40) // Positioned below x-axis
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("Year");

    // Add Y-Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("color", "white");

    // Add Y-Axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50) // Move left
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("Number of UFO Sightings");

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "black")
        .style("color", "white")
        .style("padding", "5px")
        .style("border", "1px solid white")
        .style("border-radius", "5px")
        .style("display", "none");

    svg.selectAll(".dot")
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`<strong>${d.year}</strong>: ${d.sightings} sightings`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });
});

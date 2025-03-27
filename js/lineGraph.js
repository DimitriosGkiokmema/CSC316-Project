class ReportsLineChartVis {

    constructor(parentElement, data, movieData) {
        this.parentElement = parentElement;
        this.data = data;
        this.movieData = movieData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 50, bottom: 50, left: 70 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Add title
        vis.svg.append('g')
            .attr('class', 'lineChartTitle')
            .attr('id', 'map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle')
            .text("Reports Over Time")
            .style("font-size", 20)
            .style("fill", "white");

        // Scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "circleTooltip");
        
        // Variables for controlling animation
        vis.animationPaused = true;
        vis.animationStarted = false;
        vis.startTime = 0;
        vis.elapsedPausedTime = 0;
        vis.progress = 0;
        vis.timer;

        // Key UFO event periods (middle of steep inclines/declines)
        vis.ufoEvents = [
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

        // Create line object
        vis.line = d3.line()
            .x(d => vis.xScale(d.year))
            .y(d => vis.yScale(d.value));

        vis.wrangleData();
        vis.createAxis();
    }

    wrangleData() {
        let vis = this;

        // Count occurrences of each year
        let rawData = {};

        vis.data.forEach(d => {
            const year = +d.Date.getFullYear(); // Convert to number
            rawData[year] = (rawData[year] || 0) + 1;
        });

        // Convert to an array of { year, value } objects
        vis.lineData = Object.entries(rawData).map(([year, value]) => ({
            year: +year,
            value: +value
        }));

        let edges = { minYear: vis.lineData[0].year, maxYear: 0, minCount: 0, maxCount: 0 };

        vis.lineData.forEach(d => {
            // Finds min/max year
            if (d.year > edges.maxYear) {
                edges.maxYear = d.year;
            } else if (d.year < edges.minYear) {
                edges.minYear = d.year;
            }

            // Finds min/max count
            if (d.value > edges.maxCount) {
                edges.maxCount = d.value;
            } else if (d.value < edges.minCount) {
                edges.minCount = d.value;
            }
        });

        // Set domain for scales
        vis.xScale.domain([edges.minYear, edges.maxYear]);
        vis.yScale.domain([edges.minCount, edges.maxCount]);

        vis.path = vis.svg.append("path")
            .datum(vis.lineData)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("d", vis.line);

        vis.totalLength = vis.path.node().getTotalLength();

        vis.path.attr("stroke-dasharray", vis.totalLength + " " + vis.totalLength)
            .attr("stroke-dashoffset", vis.totalLength);

        vis.dashedLines = [];

        vis.updateVis();
    }

    createAxis() {
        let vis = this;

        var xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d => d);
        var yAxis = d3.axisLeft(vis.yScale);

        // Create x-axis
        vis.svg.selectAll(".x-axis").remove(); // Remove existing x-axis
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(xAxis);

        // Create y-axis
        vis.svg.selectAll(".y-axis").remove(); // Remove existing y-axis
        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // X-axis label
        vis.svg.selectAll(".lineChartAxisLabel").remove(); // Remove existing labels
        vis.svg.append('g')
            .attr('class', 'lineChartAxisLabel')
            .append('text')
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .text("Years")
            .style("fill", "white");

        // Y-axis label
        vis.svg.append('g')
            .attr('class', 'lineChartAxisLabel')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left * 2 / 3)
            .text("Number of Reports")
            .style("fill", "white");
    }

    updateVis() {
        let vis = this;

        // Bind data to circles
        const circleUpdates = vis.svg.selectAll(".data-point")
            .data(vis.lineData, d => d.year); // Use year as key for data binding
        console.log(vis.lineData)

        // ENTER: Create new circles
        circleUpdates.enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("r", 3) // Default radius
            .attr("opacity", 0) // Hidden at start
            .attr("fill", d => {
                if (vis.checkMovies(d.year)) {
                    return "rgb(7, 212, 51)";
                }

                return "#6DD0EB";
            })
            .on("mouseover", (event, d) => {
                // Highlight on hover
                d3.select(event.currentTarget)
                    .attr("r", 5) // Increase radius
                    .attr("fill", "orange");

                // Show tooltip
                vis.tooltip.style("display", "block")
                    .html(`Year: ${d.year}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", (event) => {
                vis.tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", (event, d) => {
                // Reset on mouseout
                d3.select(event.currentTarget)
                    .attr("r", 3) // Reset radius
                    .attr("fill", d => {
                        if (vis.checkMovies(d.year)) {
                            return "rgb(7, 212, 51)";
                        }
        
                        return "#6DD0EB";
                    })

                // Hide tooltip
                vis.tooltip.style("display", "none");
            })
            .on("click", (event, d) => vis.showSidebar(d))
            .merge(circleUpdates)
            .attr("cx", d => vis.xScale(d.year))
            .attr("cy", d => vis.yScale(d.value));

        // EXIT: Remove unused circles
        circleUpdates.exit().remove();

        // Stores the complete selection for later use
        vis.circles = vis.svg.selectAll(".data-point")

        vis.displayLine();
        vis.displayUFOs();
        vis.createDashedLine();
    }

    displayLine() {
        let vis = this;

        // Bind data to lin
        vis.lines = vis.svg.selectAll(".line")
            .data(vis.lineData, d => d.year); // Use year as key for data binding

        // ENTER: Create new line parts
        vis.lines.enter()
            .append("line")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0) // Hidden at start
            .merge(vis.lines)
            .attr("d", vis.line);

        // EXIT: Remove unused line parts
        vis.lines.exit().remove();
    }

    displayUFOs() {
        let vis = this;

        // Add UFO emojis
        vis.ufoIcons = vis.svg.selectAll(".ufo")
            .data(vis.ufoEvents)
            .enter()
            .append("text")
            .attr("class", "ufo")
            .attr("x", d => vis.xScale(d.year) - 17)
            .attr("y", d => vis.yScale(vis.lineData.find(item => item.year === parseInt(d.year)).value) - 20) // Slightly above the line
            .attr("font-size", "25px")
            .attr("opacity", 0) // Hidden at start
            .text("📝") // Note emoji
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                if (d3.select(this).attr("opacity") == 1) { // Only show tooltip if UFO is visible
                    d3.select(this).attr("font-size", "28px");
                    vis.tooltip.style("display", "block")
                        .html(`<em>Click to learn more...</em>`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                }
            })
            .on("mousemove", (event) => {
                vis.tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("font-size", "25px");
                vis.tooltip.style("display", "none");
            })
            .on("click", function (event, d) {
                vis.showPopup(d.year, d.text);
            });
    }

    // Function to create a dashed line dynamically
    createDashedLine() {
        let vis = this;
        let eventYears = vis.ufoEvents.map(function(d) {
            return d.year;
        })
        
        // Clear previous dashed lines if needed
        vis.svg.selectAll(".dashedLine").remove();
        
        // Create and store the selection
        vis.dashedLines = vis.svg.selectAll(".dashedLine")
            .data(vis.lineData)
            .enter()
            .append("line")
            .attr("class", "dashedLine")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0)
            .attr("x1", d => {
                if (eventYears.includes(d.year)) {
                    return vis.xScale(d.year);
                }
            })
            .attr("y1", d => {
                if (eventYears.includes(d.year)) {
                    return vis.yScale(d.value);
                }
            })
            .attr("x2", d => {
                if (eventYears.includes(d.year)) {
                    return vis.xScale(d.year);
                }
            })
            .attr("y2", d => {
                if (eventYears.includes(d.year)) {
                    return vis.yScale(d.value) - 15;
                }
            })
    }

    updateUFOs(currentX) {
        let vis = this;

        vis.ufoIcons.each(function (d) {
            let ufo = d3.select(this);
            if (vis.xScale(d.year) <= currentX && ufo.attr("opacity") == 0) { 
                ufo.attr("opacity", 1);
            }
        });
    }

    checkMovies(year) {
        let vis = this;
        let yearExists = false;

        vis.movieData.forEach(function(movie) {
            if (movie.releaseDate.getFullYear() == year) {
                yearExists = true;
            }
        });

        return yearExists;
    }

    showSidebar(d) {
        let vis = this;
        let yearData = `<h2>${d.year}</h2> 
        <span style="display: block;"># Reports: ${d.value}</span>
        <span style="display: block;">Change from previous year: ${vis.getReportIncrease(d)}%</span>`;

        let movies = `<h2>Alien Movies Released in ${d.year}</h2><table><tr><th>Title</th><th>Profit</th><th>Rating</th>`;

        // name,releaseDate,profit,rating
        vis.movieData.forEach(function(movie) {
            if (movie.releaseDate.getFullYear() == d.year) {
                movies = movies + `<tr><td>${movie.name}</td><td>${movie.profit}</td><td>${movie.rating}%</td></tr>`;
            }
        });

        movies = movies + "</table>"

        d3.select("#yearData").html(yearData);
        d3.select("#movieData").html(movies);
    }

    getReportIncrease(entry) {
        let vis = this;
        let change = 100;

        vis.lineData.forEach(d => {
            if (d.year + 1 == entry.year) {
                change = (100 * ((entry.value - d.value) / d.value));
            }
        });

        change = Math.round(change * 100) / 100;

        return change;
    }

    // Function to start or resume animation
    startAnimation() {
        let vis = this;

        if (vis.animationStarted) return; // Prevent multiple starts
        vis.animationStarted = true;
        vis.animationPaused = false;
        vis.startTime = Date.now() - (vis.progress * 4000); // Resume from progress point

        vis.timer = d3.timer(function () {
            let elapsed = Date.now() - vis.startTime;
            vis.progress = elapsed / 4000; // 8 sec total animation

            if (vis.progress > 1) {
                vis.progress = 1;
                vis.timer.stop();
            }

            let currentLength = vis.totalLength * vis.progress;
            let currentPoint = vis.path.node().getPointAtLength(currentLength);
            let currentX = currentPoint.x;

            // ** Keeps the line continuing smoothly instead of restarting **
            vis.path.attr("stroke-dashoffset", vis.totalLength * (1 - vis.progress));

            // Ensure dots continue appearing at the right time
            vis.circles.each(function(d) {
                if (vis.xScale(d.year) <= currentX) {
                    d3.select(this).attr("opacity", 1);
                }
            });

            // Update dashed lines
            vis.dashedLines
                .filter(d => vis.xScale(d.year) <= currentX)
                .transition()
                .duration(200)
                .attr("opacity", 1);

            vis.updateUFOs(currentX);
        });
    }

    // Function to pause animation
    pauseAnimation() {
        let vis = this;

        vis.animationPaused = true;
        vis.animationStarted = false;
        vis.timer.stop();
    }

    // Function to reset animation
    resetAnimation() {
        let vis = this;

        vis.animationStarted = false;
        vis.animationPaused = true;
        vis.progress = 0;
        vis.path.attr("stroke-dashoffset", vis.totalLength);
        vis.circles.attr("opacity", 0);
        vis.timer.stop();

        vis.ufoIcons.attr("opacity", 0)
        vis.dashedLines.attr("opacity", 0);

    }

    // Function to show pop-up (only one at a time)
    showPopup(year, text) {
        // Remove any existing pop-up
        d3.select(".UFOpopup").remove();

        // Create new pop-up
        const popup = d3.select("body").append("div")
            .attr("class", "UFOpopup")
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
}
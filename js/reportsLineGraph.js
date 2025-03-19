class ReportsLineChartVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 30, left: 55 };
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
            .style("font-size", 20);

        // Scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style('opacity', 0);

        vis.wrangleData();
        vis.createAxis();
        vis.createLine();
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
            value: value
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
            .attr("y", vis.height + 30)
            .text("Time");

        // Y-axis label
        vis.svg.append('g')
            .attr('class', 'lineChartAxisLabel')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left / 2)
            .text("Number of Reports");
    }

    createLine() {
        let vis = this;

        const line = d3.line()
            .x(d => vis.xScale(d.year))
            .y(d => vis.yScale(d.value));

        // Update or create the line
        vis.svg.selectAll(".line").remove(); // Remove existing line
        vis.svg.append("path")
            .datum(vis.lineData)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("d", line);
    }

    updateVis() {
        let vis = this;

        // Bind data to circles
        const circles = vis.svg.selectAll("circle")
            .data(vis.lineData, d => d.year); // Use year as key for data binding

        // ENTER: Create new circles
        circles.enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("r", 3) // Default radius
            .attr("fill", "#6DD0EB")
            .on("mouseover", (event, d) => {
                // Highlight on hover
                d3.select(event.currentTarget)
                    .attr("r", 5) // Increase radius
                    .attr("fill", "orange");

                // Show tooltip
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                vis.tooltip.html(`Year: ${d.year}<br>Reports: ${d.value}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event, d) => {
                // Reset on mouseout
                d3.select(event.currentTarget)
                    .attr("r", 3) // Reset radius
                    .attr("fill", "#6DD0EB");

                // Hide tooltip
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", (event, d) => vis.showSidebar(d))
            .merge(circles)
            .attr("cx", d => vis.xScale(d.year))
            .attr("cy", d => vis.yScale(d.value));

        // EXIT: Remove unused circles
        circles.exit().remove();
    }

    showSidebar(d) {
        let vis = this;
        let str = `<h3>${d.year}</h3> 
        <span style="display: block;"># Reports: ${d.value}</span>
        <span style="display: block;">Change from previous year: ${vis.getReportIncrease(d)}%</span>
        <span style="display: block; height: 100%; width: 100%;" id="reportsOverTimePieGraph"><span>`;

        d3.select("#reportsOverTimeTooltip").html(str);

        // new ProportionalPieVis("reportsOverTimePieGraph", vis.data);
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
}
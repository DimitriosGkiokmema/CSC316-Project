/*
A line chart to display reports over time
Points on the graph can be clicked to display a sidebar to show:
    - Num Reports
    - % increase from previous year
    - Pie chart of shapes reported (use the proportionalPieChart class)
    - Map of location breakdown (where those reports where made)
    with circles representing the location. The bigger the circle,
    the more sightings

Ideas/Features:
    - Draw the points that users should click on the graph, or let the 
    entire line be able to trigger the sidebar
*/

class ReportsLineChartVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis()
    }

    initVis() {
        console.log("line created")
        let vis = this;
        console.log(vis.data)

        vis.margin = {top: 20, right: 20, bottom: 30, left: 55};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2 - 20}, 0)`)
            .attr('text-anchor', 'middle')
            .text("Reports Over Time")
            .style("font-size", 20);

        // Scales
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        
        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style('opacity', 0)
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // Count the occurrences of each year
        const yearCounts = vis.data.forEach((acc, curr) => {
            const year = curr.Date.getFullYear();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {});
        console.log(data);

        // Prepare data for line chart
        vis.lineData = Object.entries(yearCounts).map(([year, count]) => ({
            year: year,
            count: count
        }));
        console.log(yearCounts)
        console.log(vis.lineData)

        // Set domain for scales
        vis.xScale.domain([d3.min(vis.lineData, d => d.year), d3.max(vis.lineData, d => d.year)]);
        vis.yScale.domain([0, d3.max(vis.lineData, d => d.count)]);

        vis.updateVis();
    }

    updateVis() {
        this.createLine();
        this.createAxis();
        this.updateEmphasize();
    }
    
    createLine() {
        let vis = this;

        const line = d3.line()
		    .x(d => vis.xScale(d.year))
		    .y(d => vis.yScale(d.count));

        vis.svg.selectAll(".line")
            .data([1, 2, 3])
    		.join("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("d", line);
    }

    createAxis() {
        let vis = this;
        var xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.format("d"));
        var yAxis = d3.axisLeft(vis.yScale);

        // Create or update x-axis
        vis.svg.selectAll(".x-axis")
            .data(vis.lineData)
            .join("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height - vis.margin.bottom + 5})`)
            .call(xAxis);

        // Create or update y-axis
        vis.svg.selectAll(".y-axis")
            .data([null])
            .join("g")
            .attr("class", "y-axis")
            .call(yAxis);
        
        // X-axis label
        vis.svg.selectAll(".x-axis-label")
            .data([null])
            .join("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 5)
            .text("Year");

        // Y-axis label
        vis.svg.selectAll(".y-axis-label")
            .data([null])
            .join("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 15)
            .text("Number of Reports");

        vis.svg.selectAll(".x-axis path")
            .style("stroke", "black")  // Ensure the axis line is visible
            .style("stroke-width", "1px")
            .style("shape-rendering", "crispEdges");  // Prevent blurriness
    }

    // Append an SVG circle on each x/y intersection 
    updateEmphasize() {
        let vis = this;

        // Append circles at data points
        vis.svg.selectAll("circle")
            .data(vis.lineData)
            .join("circle")
            .attr("cx", d => vis.xScale(d.year))
            .attr("cy", d => vis.yScale(d.count))
            .attr("r", 3)
            .attr("fill", "green")
            .on("mouseover", (event, d) => {
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html(d.year)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event, d) => {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", (event, d) => vis.showSidebar(d))
    }

    // Show details for a specific year in our datasets
    showSidebar(d) {
        let vis = this;
        let str = `<h3>${d.year}</h3> 
        <span style="display: block;"># Reports: ${d.count}</span>
        <span style="display: block;">% Increase from previous year: ${vis.getAverageReports(d.year)}</span>
        <span style="display: block; height: 100%; width: 100%;" id="reportsOverTimePieGraph"><span>`;

        d3.select("#reportsOverTimeTooltip").html(str);

        new ProportionalPieVis("reportsOverTimePieGraph", vis.data);
    }

    getAverageReports(year) {
        let vis = this;
        let lastYear = d3.min(vis.lineData, d => d.year);

        vis.lineData.forEach((entry) => {
            if (lastYear < entry.year && entry.year < year) {
                lastYear = entry.year;
            }
        });        

        return lastYear;
    }
}
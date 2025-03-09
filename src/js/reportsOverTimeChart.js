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
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 30, left: 55};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle')
            .text("Reports Over Time");

        // Scales & Axis
        // I had to subtract some values form the ranges, otherwise
        // parts of the graphs were getting cut off. I don't know why
        // this is happening, but by subtracting these values the graph
        // seems to work.
        vis.xScale = d3.scaleTime()
            .range([0, vis.width - 60]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height - 25, 0]);
        
        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'reportsOverTimeChartTooltip')
            .style('opacity', 0);
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // Count the occurrences of each year
        const yearCounts = vis.data.reduce((acc, curr) => {
            const year = curr.Date.getFullYear();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {});

        // Prepare data for line chart
        vis.lineData = Object.entries(yearCounts).map(([year, count]) => ({
            year: year,
            count: count
        }));
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
            .data([vis.lineData])
    		.join("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("d", line);
    }

    createAxis() {
        let vis = this;
        var xAxis = d3.axisBottom(vis.xScale);
        var yAxis = d3.axisLeft(vis.yScale);

        // Create or update x-axis
        vis.svg.selectAll(".x-axis")
            .data([null])
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
            .attr("r", 2)
            .attr("fill", "green")
            .on("mouseover", (event, d) => console.log(d.year));
    }

    // Show details for a specific FIFA World Cup
    showEdition(d) {
        d3.select("#edition").text(d.EDITION);
        d3.select("#title").text("Year: " + formatDate(d.YEAR));
        d3.select("#winner").text("Winner: " + d.WINNER);
        d3.select("#goals").text("Goals: " + d.GOALS);
        d3.select("#average-goals").text("Average Goals: " + d.AVERAGE_GOALS);
        d3.select("#matches").text("Matches: " + d.MATCHES);
        d3.select("#teams").text("Teams: " + d.TEAMS);
        d3.select("#average-attendance").text("Average Attendance: " + d.AVERAGE_ATTENDANCE);
    }
}

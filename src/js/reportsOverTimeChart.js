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

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // Scales & Axis
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        
        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'reportsOverTimeChartTooltip')
            .style('opacity', 0);
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // Find max num of reports in a year for y scale
        // Count the occurrences of each year
        const yearCounts = vis.data.map(function(row) {
            return row.Date.getFullYear();
        });

        // Create an empty object to store the counts
        vis.counts = {};

        // Loop through the array and count the occurrences of each number
        yearCounts.forEach((year) => {
            vis.counts[year] = (vis.counts[year] || 0) + 1;
        });

        // Find the number with the highest count
        let maxCount = 0;
        let mostFrequentNumber;

        for (let num in vis.counts) {
            if (vis.counts[num] > maxCount) {
            maxCount = vis.counts[num];
            mostFrequentNumber = num;
            }
        }

        // Years from 1930 to 2025
        vis.xScale.domain([d3.min(yearCounts), d3.max(yearCounts)]);

        // Should be 2003 - I checked with Tableau
        // console.log(mostFrequentNumber);
        vis.yScale.domain([0, mostFrequentNumber]);

        vis.updateVis()
    }

    updateVis() {
        this.createLine();
        this.createAxis();
        this.updateEmphasize();
    }
    
    createLine() {
        let vis = this;

        const path = vis.svg.selectAll(".line")
		    .data([vis.data]);

        const line = d3.line()
		    .x(d => vis.xScale(d.Date.getFullYear()))
		    .y(d => vis.yScale(vis.counts[d.Date.getFullYear()]));

        path.enter()
    		.append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 1)
            .merge(path)
            .transition().duration(800)
            .attr("d", line);

        path.exit().remove();
    }

    createAxis() {
        let vis = this;
        var xAxis = d3.axisBottom(vis.xScale);
        //     .tickValues([new Date(1930, 0, 1), new Date(1975, 0, 1), new Date(2014, 0, 1)]);
        var yAxis = d3.axisLeft(vis.yScale);

        // Select or create the x-axis
        let xAxisGroup = vis.svg.select(".x-axis");
        if (xAxisGroup.empty()) {
            xAxisGroup = vis.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${vis.height})`);
        }
        xAxisGroup.transition().duration(1000)
            .call(xAxis);

        // Select or create the y-axis
        let yAxisGroup = vis.svg.select(".y-axis");
        if (yAxisGroup.empty()) {
            yAxisGroup = vis.svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(0,0)`);
        }
        yAxisGroup.transition().duration(1000)
            .call(yAxis);
    }

    // Append an SVG circle on each x/y intersection 
    updateEmphasize() {
        let vis = this;

        const circles = vis.svg.selectAll("circle")
            .data(vis.data);

        // Enter: Create new circles
        circles.enter()
            .append("circle")
            .attr("cx", d => vis.xScale(d.Date.getFullYear()))
            .attr("cy", d => vis.yScale(vis.counts[d.Date.getFullYear()]))
            .attr("r", 4)
            .attr("fill", "green")
            .merge(circles)
            .on("click", (event, d) => showEdition(d))
            .transition().duration(800)
            .attr("cx", d => vis.xScale(d.Date.getFullYear()))
            .attr("cy", d => vis.yScale(vis.counts[d.Date.getFullYear()]));

        // Exit: Remove any circles that no longer have corresponding data
        circles.exit().remove();
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

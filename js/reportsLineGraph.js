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
        console.log("line chart composing");

        this.initVis()
    }

    initVis() {
        let vis = this;

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
        
        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .style('opacity', 0)
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        let minYear = d3.min(vis.data, d => d.Date.getFullYear());
        let maxYear = d3.max(vis.data, d => d.Date.getFullYear());

        // Empty map of year: count
        vis.yearCounts = d3.range(minYear, maxYear + 1).reduce((acc, year) => {
            acc[year] = 0;
            return acc;
        }, {});

        // Count occurrences of each year
        vis.data.forEach(d => {
            const year = +d.Date.getFullYear(); // Convert to number
            dataObj[year] = (dataObj[year] || 0) + 1;
        });

        // Convert to an array of { year, value } objects
        const data = Object.entries(dataObj).map(([year, value]) => ({
            year: +year,
            value: value
        }));

        // Filled map of year: count
        vis.data.forEach(function(d) {
            vis.yearCounts[d.Date.getFullYear()]++;
        });

        minYear = Math.min(...Object.keys(vis.yearCounts).map(Number));
        maxYear = Math.max(...Object.keys(vis.yearCounts).map(Number));

        // Set domain for scales
        vis.xScale.domain([minYear, maxYear]);
        vis.yScale.domain([vis.yearCounts[minYear], vis.yearCounts[maxYear]]);

        // Create array of counts to plot later
        vis.lineData = Object.entries(vis.data).map(([year, value]) => ({
            year: +year,
            value: value
        }));

        console.log(vis.lineData)

        vis.updateVis();
    }

    updateVis() {
        this.createAxis();
        this.createLine();
        this.updateEmphasize();
    }

    createAxis() {
        let vis = this;
        
        var xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.format("d"));
        var yAxis = d3.axisLeft(vis.yScale);

        // Create x-axis
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(xAxis);

        // Create y-axis
        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);
        
        // X-axis label
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
            .x((_, i) => vis.xScale(i + 1914)) // Map year to x position
            .y(d => vis.yScale(d)); // Map count to y position
        console.log(vis.yearCounts)
        console.log(vis.linePlot)

        vis.svg.append("path")
            .datum(vis.linePlot)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("d", line);
    }

    // Append an SVG circle on each x/y intersection 
    updateEmphasize() {
        let vis = this;

        // Append circles at data points
        vis.svg.selectAll("circle")
            .data(vis.yearCounts)
            .join("circle")
            .attr("cx", d => vis.xScale(d))
            .attr("cy", d => vis.yScale(vis.yearCounts[d]))
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
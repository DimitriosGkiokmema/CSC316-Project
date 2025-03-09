/*
A bar chart that displays the amounts of witnesses in reports
The rows are num of people, cols are % of reports (could also be num reports)

Ideas/Features:
    - Draw the num of people each bar represents in the row axis
*/

class WitnessesBarChartVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 20, bottom: 60, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Add title
        vis.chartGroup.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text("Witnesses Bar Chart");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "#333")
            .style("color", "#fff")
            .style("padding", "5px")
            .style("border-radius", "5px");

        // Define scales
        vis.xScale = d3.scaleBand().padding(0.2);
        vis.yScale = d3.scaleLinear();

        // Add axes groups
        vis.xAxisGroup = vis.chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.yAxisGroup = vis.chartGroup.append("g")
            .attr("class", "y-axis");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Sorting data (optional)
        vis.data.sort((a, b) => a.witnesses - b.witnesses);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales
        vis.xScale.domain(vis.data.map(d => d.witnesses)).range([0, vis.width]);
        vis.yScale.domain([0, d3.max(vis.data, d => d.percentage)]).range([vis.height, 0]);

        // Update axes
        vis.xAxisGroup.transition().duration(1000).call(d3.axisBottom(vis.xScale).tickFormat(d => `${d} witnesses`));
        vis.yAxisGroup.transition().duration(1000).call(d3.axisLeft(vis.yScale).ticks(5).tickFormat(d => `${d}%`));

        // Bind data and create bars
        let bars = vis.chartGroup.selectAll(".bar")
            .data(vis.data, d => d.witnesses);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.witnesses))
            .attr("y", vis.height)  // Start from bottom
            .attr("width", vis.xScale.bandwidth())
            .attr("height", 0) // Start with zero height
            .attr("fill", "red")
            .on("mouseover", (event, d) => {
                vis.tooltip.style("opacity", 1)
                    .text(`${d.percentage}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => vis.tooltip.style("opacity", 0))
            .transition().duration(1000)
            .attr("y", d => vis.yScale(d.percentage))
            .attr("height", d => vis.height - vis.yScale(d.percentage));

        // Exit selection
        bars.exit().remove();
    }
}

/*
------------      NOT DECIDED ON, WE MAY NOT NEED THIS VIS SO DO NOT CODE IT YET       --------------------

This creates a pie chart to display sightings over months
The more sightings in a month, the longer the slice is (i.e. further away from the center)

Ideas/Features:
    - Months of the same season are the same colour, and there is a picture symbolizing that season
    in the center of the slice cluster. Flower for spring, sun for summer, maple leaf for fall, and
    snowflake for winter.
*/

class ProportionalPieVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis()
        // this.runExample();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.radius = vis.width / 4;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr('transform', `translate (${vis.width / 4 + vis.margin.left}, ${vis.height / 4 + vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .attr('transform', `translate(0, ${vis.width/3 - 10})`)
            .attr('text-anchor', 'middle')
            .text("Reported Shapes");
        
        vis.color = d3.scaleOrdinal(d3.schemeCategory10);

        vis.pie = d3.pie()
            .value(d => d.value);

        vis.arc = d3.arc()
            .outerRadius(vis.radius)
            .innerRadius(0);

        vis.labelArc = d3.arc()
            .outerRadius(vis.radius - 40)
            .innerRadius(vis.radius - 40);
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // TODO

        vis.updateVis()
    }
    
    updateVis() {
        let vis = this;
        vis.shapes = [
            { label: "A", value: 30 },
            { label: "B", value: 20 },
            { label: "C", value: 50 }
        ];

        vis.g = vis.svg.selectAll(".arc")
            .data(vis.pie(vis.shapes))
            .enter().append("g")
            .attr("class", "arc");

        vis.g.append("path")
            .attr("d", vis.arc)
            .style("fill", d => vis.color(d.data.label));

        vis.g.append("text")
            .attr("transform", d => `translate(${vis.labelArc.centroid(d)})`)
            .attr("dy", ".35em")
            .text(d => d.data.label);
    }

    // Creates dummy pie graph for testing
    runExample() {
        const data = [
            { label: "A", value: 30 },
            { label: "B", value: 20 },
            { label: "C", value: 50 }
        ];

        const width = 80, height = 80, radius = Math.min(width, height) / 2;

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie()
            .value(d => d.value);

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const labelArc = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(10);

        const svg = d3.select("#" + this.parentElement).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", d => color(d.data.label));

        g.append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("dy", ".35em")
            .text(d => d.data.label);
    }
}

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
        
        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')
            .style('opacity', 0);
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // TODO

        vis.updateVis()
    }
    
    updateVis() {
        let vis = this;

        // TODO
    }
}

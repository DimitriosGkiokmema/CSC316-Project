/*
Displays a map with airports and airforce/military bases in Canada,
and the location of reports to see if they correlate. Clicking on 
an airport/base will create a tooltip with:
    - Num sightings within some range of the airport/base

Ideas/Features:
    - 

Questions:
    - The sketch Haya drew shows just one province. Can we make this an 
    entire map instead? 
*/

class ReportMapVis {

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
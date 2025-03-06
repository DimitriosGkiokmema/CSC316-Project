/*
This vis creates a clock to show the reports at the time shown on the clock.
A spaceship moves around the clock. The further it goes from the clock, the 
more reports at that time. The whole thing is animated. Pressing a button at
the bottom starts the animation. Pressing it again will pause the simulation.
There is a sidebar displaying the current info at the time shown on the clock:
    - Time
    - Num reports
    - Shapes reported
    - Top province/territory
    - Average duration
    - Average num of witnesses

Ideas/Features:
    - Obviously, this is hard to code. But it will look cool! If it is proving
    too hard/time consuming, switch to a line chart or some other type of vis.
*/

class DailyReportsClockVis {

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

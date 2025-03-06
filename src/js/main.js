// SVG Size
let width = 0,
	height = 0;

let svg = d3.select("#chart-area")
	.append("svg")
    .attr("width", width)
    .attr("height", height);

// Load CSV file
d3.csv("data/wealth_health_data.csv", row => {
    // Ensure cols are correct data types
    // Ex: str -> int

	return row;
}).then( data => {
	// Sort / filter if needed
	// data.sort((a, b) => b.Population - a.Population);
	drawChart(data);
});
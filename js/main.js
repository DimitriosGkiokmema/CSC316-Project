// Creating vis and data variables
let reportsOverTimeChart;
let data;

loadData();

// For Scrolling
// Maybe this is not needed as Haya created the side buttons
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".fullscreen");
    sections.forEach(section => {
        section.style.scrollSnapAlign = "start";
    });
});

// Add button event listeners
document.getElementById("play-pause").addEventListener("click", function () {
	if (visualViewport.animationPaused) {
		visualViewport.startAnimation();
		this.textContent = "Pause";
	} else {
		reportsOverTimeChart.pauseAnimation();
		this.textContent = "Play";
	}
});

document.getElementById("reset").addEventListener("click", function () {
	console.log("reset plz")
	vis.resetAnimation();
	document.getElementById("play-pause").textContent = "Play";
});

// Dataset column titles:
// Date,Time,Duration,City,State,Country,Lat,Lon,TotalObservers,Summary,NumShips,Shape,NUFORC_Note,Explanation,Certainty
function loadData() {
	// Load CSV file
	d3.csv("data/NUFORCData.csv", row => {
		// Mine - ID,Date,Time,Duration,City,State,Country,Lat,Lon,TotalObservers,Summary,NumShips,Shape,NUFORC_Note,Explanation,Certainty,Highlight
		// Theirs - Sighting ID,EventDate,EventTime,Duration,City,State,Country,Lat,Lon,TotalObservers,Summary,NumShips,Shape,NUFORC Note,Explanation,Certainty,Highlight
		row.ID = +row['Sighting ID'];
		row.Date = new Date(row.EventDate + " " + row.EventTime);
		row.NUFORC = row['NUFORC Note'];

		/* ------    load duration     ---------
		The difficulty is that people gave MANY different formats,
		so it is hard to change them all to one uniform format
		row.Duration = getDuration(row.Duration);
		Ex: second, seconds, sec, secs, s, Second, etc.

		I created a getDuration function below that is supposed
		to interpret the duration entered by the user, but
		it is not implemented yet (since its hard). Until then,
		just use the string of the duration as is
		*/
		// row.Duration = getDuration(row.Duration);

		// load lat and lon
		row.Lat = parseFloat(row.Lat);
		row.Lon = parseFloat(row.Lon);

		row.TotalObservers = +row.TotalObservers;
		row.NumShips = +row.NumShips;

		// Delete unnecessary columns
		delete row['Sighting ID'];
		delete row.EventDate;
        delete row.EventTime;
		delete row['NUFORC Note'];

		return row;
	}).then( data => {
		initVars(data);
		displayVis();
	});
}

function getDuration(time) {
	// Use above code to create a Date object and return it
	// TODO
}

function initVars(data) {
	reportsOverTimeChart = new ReportsLineChartVis("reportsOverTimeChart", data);
}

function displayVis() {
	// TODO
}
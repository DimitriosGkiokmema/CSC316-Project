// Creating vis and data variables
let baseMap,
	cultureChart,
	reportsOverTimeChart,
	witnessesChart,
	reportMap,
	dailyReports;
let data;

loadData();

// Dataset column titles:
// Date,Time,Duration,City,State,Country,Lat,Lon,TotalObservers,Summary,NumShips,Shape,NUFORC_Note,Explanation,Certainty
function loadData() {
	// Load CSV file
	d3.csv("data/NUFORCData.csv", row => {
		// load date
		row.Date = new Date(row.Date + " " + row.Time);

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
        delete row.Time;

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
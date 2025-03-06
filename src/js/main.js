// Creating vis and data variables
let baseMap,
	cultureChart,
	proportionalPieChart,
	reportsOverTimeChart,
	witnessesChart,
	reportMap,
	dailyReports;
let data;

// Dataset column titles:
// Date,Time,Duration,City,State,Country,Lat,Lon,TotalObservers,Summary,NumShips,Shape,NUFORC_Note,Explanation,Certainty
function loadData() {
	// Load CSV file
	d3.csv("data/NUFORCData.csv", row => {
		// load date
		let parseDate = d3.timeParse("%m%d%Y");
		row.Date = parseDate(row.Date);

		// load time
		let timeParts = row.Time.split(':');
		row.Date = new Date();
		row.Date.setHours(timeParts[0], timeParts[1], timeParts[2]);

		// load duration
		row.Duration = getDuration(row.Duration);

		// load lat and lon
		row.Lat = parseFloat(row.Lat);
		row.Lon = parseFloat(row.Lon);

		row.TotalObservers = +row.TotalObservers;
		row.NumShips = +row.NumShips;

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
	baseMap = new ReportMapVis("baseMap", data);
	cultureChart = new PopularCultureVis("cultureChart", data);
	proportionalPieChart = new ProportionalPieVis("proportionalPieChart", data);
	reportsOverTimeChart = new ReportsLineChartVis("reportsOverTimeChart", data);
	witnessesChart = new WitnessesBarChartVis("witnessesChart", data);
	reportMap = new ReportMapVis("reportMap", data);
	dailyReports = new DailyReportsClockVis("dailyReports", data);
}

function displayVis() {
	// TODO
}
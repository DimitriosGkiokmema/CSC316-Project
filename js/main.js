// Creating vis and data variables
let reportsOverTimeChart;
let data;
let movies;

loadData();

//////////////////////////////////////////////////////////
/////////////       Listeners            /////////////////
//////////////////////////////////////////////////////////
// Play/pause line graph
document.getElementById("play-pause").addEventListener("click", function () {
	if (reportsOverTimeChart.animationPaused) {
		reportsOverTimeChart.startAnimation();
		this.textContent = "Pause";
	} else {
		reportsOverTimeChart.pauseAnimation();
		this.textContent = "Play";
	}
});

// Resets line graph
document.getElementById("resetLine").addEventListener("click", function () {
	reportsOverTimeChart.resetAnimation();
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
	});
}

function getDuration(time) {
	// Use above code to create a Date object and return it
	// TODO
}

async function initVars(data) {
	let promises = [
        d3.csv("data/movieData.csv")
    ];
    try {
        movies = await Promise.all(promises);
		movies = movies[0];
    } catch (err) {
        console.error(err);
    }

	// name,releaseDate,profit,rating
	movies = movies.map(function(d) {
		// Handle cases where releaseDate is just a year number
		if (typeof d.releaseDate === 'number' || /^\d+$/.test(d.releaseDate)) {
			// Explicitly create UTC date at mid-year to avoid timezone issues
			d.releaseDate = new Date(Date.UTC(parseInt(d.releaseDate), 6, 1));
		} else {
			// For full date strings, parse normally
			d.releaseDate = new Date(d.releaseDate);
		}
		
		// Force UTC year if needed
		if (isNaN(d.releaseDate.getTime())) {
			console.warn(`Invalid date: ${d.releaseDate}, defaulting to year only`);
			d.releaseDate = new Date(Date.UTC(parseInt(d.releaseDate.toString().match(/\d{4}/)[0]), 6, 1));
		}
		
		// Convert other fields
		d.profit = +d.profit;
		d.rating = +d.rating;
		
		return d;
	});

	reportsOverTimeChart = new ReportsLineChartVis("reportsOverTimeChart", data, movies);
}

// The bellow is an Easter Egg by Dimitrios
// He loves the Alien franchise, so this code makes it 
// so that whenever alien (case insensitive) is written on
// the website, the font from the Alien movies is used on the word
// Easter Egg:
// document.body.innerHTML = document.body.innerHTML.replace(/\balien\b/gi, '<span class="alien-word">alien</span>');
function applyAlienFont(node) {
	// Check if the node is a text node
	if (node.nodeType === Node.TEXT_NODE) {
	  const regex = /\balien\b/gi;
	  if (regex.test(node.textContent)) {
		// Replace the word 'alien' and wrap it in a span
		const newHTML = node.textContent.replace(regex, '<span class="alien-word">alien</span>');
		const wrapper = document.createElement('span');
		wrapper.innerHTML = newHTML;
  
		// Replace the original text node with the new HTML
		node.parentNode.replaceChild(wrapper, node);
	  }
	} else {
	  // Recursively call on child nodes
	  node.childNodes.forEach(applyAlienFont);
	}
  }
  
  // Start from the document body
  applyAlienFont(document.body);
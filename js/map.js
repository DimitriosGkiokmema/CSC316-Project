// Initialize the Leaflet map
var map = L.map('map', {
    center: [56.1304, -106.3468],  // Center the map on Canada
    zoom: 3,                       // Set zoom level for a country-wide view                   // Limit zooming in too much
    zoomControl: false,            // Disable zoom controls
    attributionControl: false,      // Disable the attribution control
    scrollWheelZoom: false,       // Disable scroll wheel zoom
    doubleClickZoom: false,       // Disable double-click zoom
    boxZoom: false,               // Disable box zoom
    touchZoom: false              // Disable touch zoom
});

let sightingsData2 = []; // Store parsed data

// Load and display Canada's GeoJSON data
fetch('js/canada.geojson')  // Path to your GeoJSON file
    .then(response => response.json())
    .then(data => {
        // Add GeoJSON data to the map (Canada outline)
        L.geoJSON(data, {
            style: {
                color: "#000000",  // Border color (black)
                weight: 2,         // Border thickness
                fillOpacity: 0     // Make the interior transparent
            }
        }).addTo(map);
    })
    .catch(error => console.error("Error loading GeoJSON:", error));

var markersLayer = L.layerGroup().addTo(map);

// Load and parse the CSV data
Papa.parse('data/NUFORCdata.csv', {
    download: true,
    header: true,    // Treat the first row as header
    dynamicTyping: true,  // Automatically typecast values (e.g., numbers)
    complete: function(results) {
        // Log the headers to verify column names
        console.log(results.meta.fields);  

        // Process the CSV rows
        results.data.forEach(function(row) {
            console.log(row.EventDate);  // Log the EventDate to see its value

            if (row.Lat && row.Lon) {  // Ensure Lat and Lon are available
                // Parse EventDate to Date object
                const parsedDate = new Date(row.EventDate);

                // Check if the date is valid
                if (!isNaN(parsedDate.getTime())) {
                    sightingsData2.push({
                        lat: row.Lat,
                        lon: row.Lon,
                        observers: row.TotalObservers,  // Number of observers
                        ships: row.NumShips,  // Number of ships
                        shape: row.Shape,  // UFO shape
                        summary: row.Summary,  // Summary of the sighting
                        city: row.City,  // City name
                        state: row.State,  // State/Province abbreviation
                        date: parsedDate,  // Event Date as a Date object
                    });
                } else {
                    console.error("Invalid date for EventDate: ", row.EventDate);
                }
            }
        });

        // After loading the data, call the function to add markers to the map (default view)
        addSightingsToMap(sightingsData2, "all");
    }
});


// Initialize the current view (default is "all")
var currentView = "all";

// Initialize the current view (default is "all")
var currentView = "all";

// Function to filter sightings by both the selected decade and number of observers (Solo, Small Group, Crowd) and ships
function filterSightings() {
    var selectedWitnessesFilter = document.getElementById("witnesses-dropdown").value;
    var selectedShipsFilter = document.getElementById("ships-dropdown").value;
    var selectedDecade = document.getElementById("decade-dropdown-map").value;

    var filteredData;

    // Apply the decade filter first
    if (selectedDecade === "all") {
        filteredData = sightingsData2;  // Show all reports if no decade is selected
    } else if (selectedDecade === "1960") {
        filteredData = sightingsData2.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear <= 1960;  // Filter sightings from 1960 and before
        });
    } else {
        filteredData = sightingsData2.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear >= selectedDecade && eventYear < parseInt(selectedDecade) + 10;
        });
    }

    // Apply the filter based on selected witnesses option (Solo, Small Group, Crowd)
    if (selectedWitnessesFilter === "solo") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.observers === 1;  // Solo: 1 observer
        });
    } else if (selectedWitnessesFilter === "small-group") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.observers >= 2 && sighting.observers <= 5;  // Small Group: 2-5 observers
        });
    } else if (selectedWitnessesFilter === "crowd") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.observers >= 6;  // Crowd: 6 or more observers
        });
    }

    // Apply the filter based on selected ships option (Solo, Small Group, Crowd)
    if (selectedShipsFilter === "solo") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.ships === 1;  // Solo: 1 ship
        });
    } else if (selectedShipsFilter === "small-group") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.ships >= 2 && sighting.ships <= 5;  // Small Group: 2-5 ships
        });
    } else if (selectedShipsFilter === "crowd") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.ships >= 6;  // Crowd: 6 or more ships
        });
    }

    // Clear existing markers and add the filtered sightings to the map
    markersLayer.clearLayers();
    addSightingsToMap(filteredData, currentView);  // Use the correct view (observers or ships)
}


// Function to change the view based on the selected option (observers, ships, or all)
function changeView(viewType) {
    currentView = viewType;  // Set the current view based on the selected option
    markersLayer.clearLayers();  // Clear existing markers

    // Get the selected decade to apply it with the current view
    var selectedDecade = document.getElementById("decade-dropdown-map").value;

    var filteredData;

    // Apply the decade filter based on the selected value in the dropdown
    if (selectedDecade === "all") {
        filteredData = sightingsData2;
    } else if (selectedDecade === "1960") {
        filteredData = sightingsData2.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear <= 1960;  // Filter sightings from 1960 and before
        });
    } else {
        filteredData = sightingsData2.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear >= selectedDecade && eventYear < parseInt(selectedDecade) + 10;
        });
    }

    // Apply the witnesses filter again
    var selectedWitnessesFilter = document.getElementById("witnesses-dropdown").value;
    if (selectedWitnessesFilter === "solo") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.observers === 1;
        });
    } else if (selectedWitnessesFilter === "small-group") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.observers >= 2 && sighting.observers <= 5;
        });
    } else if (selectedWitnessesFilter === "crowd") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.observers >= 6;
        });
    }

    // Apply the ships filter again
    var selectedShipsFilter = document.getElementById("ships-dropdown").value;
    if (selectedShipsFilter === "solo") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.ships === 1;
        });
    } else if (selectedShipsFilter === "small-group") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.ships >= 2 && sighting.ships <= 5;
        });
    } else if (selectedShipsFilter === "crowd") {
        filteredData = filteredData.filter(function(sighting) {
            return sighting.ships >= 6;
        });
    }

    // Add new markers based on the selected view (observers, ships, or all reports)
    addSightingsToMap(filteredData, currentView);

    // Highlight the active view button and reset others
    var buttons = document.querySelectorAll('.view-btn');  // Select all view buttons
    buttons.forEach(function(button) {
        button.classList.remove('active');  // Remove the active class from all buttons
    });

    // Add the 'active' class to the clicked button
    if (viewType === 'all') {
        document.getElementById('all-reports-btn').classList.add('active');
    } else if (viewType === 'observers') {
        document.getElementById('observers-btn').classList.add('active');
    } else if (viewType === 'ships') {
        document.getElementById('ships-btn').classList.add('active');
    }
}


// Ensure you have initialized this at the top of your map.js
var markersLayer = L.layerGroup().addTo(map);

// Function to add sightings to the map with tooltips
function addSightingsToMap(sightingsData2, viewType) {
    sightingsData2.forEach(function(sighting) {
        const dotSize = viewType === "observers"
            ? Math.min(Math.max(sighting.observers * 0.5, 1), 20)
            : viewType === "ships"
                ? Math.min(Math.max(sighting.ships * 0.5, 1), 20)
                : 1;  // Default size if "all"

        const marker = L.circleMarker([sighting.lat, sighting.lon], {
            radius: dotSize,
            color: '#FF5733',
            fillColor: '#FF5733',
            fillOpacity: 1,
            opacity: 1
        });

        markersLayer.addLayer(marker);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    addSightingsToMap(sightingsData2, "all");  // Ensure "all" loads fully visible
});






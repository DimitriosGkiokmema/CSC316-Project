// Leaflet map
var map2 = L.map('map2', {
    center: [56.1304, -106.3468],  
    zoom: 3,                       
    zoomControl: false,            
    attributionControl: false,      
    scrollWheelZoom: false,       
    doubleClickZoom: false,       
    boxZoom: false,               
    touchZoom: false              
});

// GeoJSON data
fetch('js/canada.geojson')
    .then(response => response.json())
    .then(data => {
        
        L.geoJSON(data, {
            style: {
                color: "#000000",  
                weight: 2,         
                fillOpacity: 0     
            }
        }).addTo(map2);
    })
    .catch(error => console.error("Error loading GeoJSON:", error));

var sightingsData = [];
var markersLayer = L.layerGroup().addTo(map2);

// CSV data
Papa.parse('data/ourNUFORCdata.csv', {
    download: true,
    header: true,    
    dynamicTyping: true,  
    complete: function(results) {
        
        console.log(results.meta.fields);  

        results.data.forEach(function(row) {
            console.log(row.EventDate);  

            if (row.Lat && row.Lon) {
                const parsedDate = new Date(row.EventDate);

                if (!isNaN(parsedDate.getTime())) {
                    sightingsData.push({
                        lat: row.Lat,
                        lon: row.Lon,
                        observers: row.TotalObservers,  
                        ships: row.NumShips,  
                        shape: row.Shape,  
                        summary: row.Summary,  
                        city: row.City,  
                        state: row.State,  
                        date: parsedDate,
                    });
                } else {
                    console.error("Invalid date for EventDate: ", row.EventDate);
                }
            }
        });

        addSightingsToMap(sightingsData, "all");
    }
});

var currentView = "all";

var currentView = "all";

function filterSightings() {
    var selectedWitnessesFilter = document.getElementById("witnesses-dropdown").value;
    var selectedShipsFilter = document.getElementById("ships-dropdown").value;
    var selectedDecade = document.getElementById("decade-dropdown-map").value;

    var filteredData;

    // decade filter 
    if (selectedDecade === "all") {
        filteredData = sightingsData;  // all reports if no decade is selected
    } else if (selectedDecade === "1960") {
        filteredData = sightingsData.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear <= 1960;  // reports from 1960 and before
        });
    } else {
        filteredData = sightingsData.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear >= selectedDecade && eventYear < parseInt(selectedDecade) + 10;
        });
    }

    // filter based on selected witnesses
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

    // filter based on selected ships option
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

    markersLayer.clearLayers();
    addSightingsToMap(filteredData, currentView);
}


function changeView(viewType) {
    currentView = viewType;  
    markersLayer.clearLayers();  

    var selectedDecade = document.getElementById("decade-dropdown-map").value;

    var filteredData;

    // decade filter 
    if (selectedDecade === "all") {
        filteredData = sightingsData;
    } else if (selectedDecade === "1960") {
        filteredData = sightingsData.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear <= 1960;  // reports from 1960 and before
        });
    } else {
        filteredData = sightingsData.filter(function(sighting) {
            var eventYear = sighting.date.getFullYear();
            return eventYear >= selectedDecade && eventYear < parseInt(selectedDecade) + 10;
        });
    }

    // witnesses filter
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

    // ships filter 
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

    addSightingsToMap(filteredData, currentView);

    var buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(function(button) {
        button.classList.remove('active');
    });

    if (viewType === 'all') {
        document.getElementById('all-reports-btn').classList.add('active');
    } else if (viewType === 'observers') {
        document.getElementById('observers-btn').classList.add('active');
    } else if (viewType === 'ships') {
        document.getElementById('ships-btn').classList.add('active');
    }
}


var markersLayer = L.layerGroup().addTo(map2);

function addSightingsToMap(sightingsData, viewType) {
    sightingsData.forEach(function(sighting) {
        const dotSize = viewType === "observers"
            ? Math.min(Math.max(sighting.observers * 0.5, 1), 20)
            : viewType === "ships"
                ? Math.min(Math.max(sighting.ships * 0.5, 1), 20)
                : 1;  

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
    addSightingsToMap(sightingsData, "all");
});






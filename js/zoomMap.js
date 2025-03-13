/*
 Displays map of key reports and airports/airforce bases map
 
 Key Reports:
 Displays a map with some (not all!) reports
 Clicking on one triggers a sidebar do show:
     - Location
     - Time
     - Duration
     - Num of crafts
     - Shape
     - Reportee Summary
     - NUFORC Notes
 
 Ideas/Features:
     - In the sidebar, draw a clock and shade the according 
     time that the event took place
     - For num crafts and shape, draw a visual to represent that shape
 
 Airports:
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
 
 // Initialize Leaflet map
 const map = L.map('map').setView([56.1304, -106.3468], 4);
 
 // Load tiles
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '&copy; OpenStreetMap contributors'
 }).addTo(map);
 
 let sightingsMapLayer = L.layerGroup();
 let airportsMapLayer = L.layerGroup();
 
 // UFO marker for sightings
 const ufoIcon = L.icon({
     iconUrl: 'img/ufo.png',
     iconSize: [32, 32],
     iconAnchor: [16, 16],
     popupAnchor: [0, -16]
 });
 
 // Airplane marker for airports/bases
 const airportIcon = L.icon({
     iconUrl: 'img/airport.png',
     iconSize: [22, 22],
     iconAnchor: [16, 16],
     popupAnchor: [0, -16]
 });
 
 loadSightingsMap();
 loadAirportsMap();
 sightingsMapLayer.addTo(map);
 
 // Sightings map
 function loadSightingsMap() {
     sightingsMapLayer.clearLayers();
     d3.csv("data/NUFORCData.csv").then(data => {
         data.forEach(d => {
             const lat = parseFloat(d.Lat);
             const lon = parseFloat(d.Lon);
             const certainty = d.Certainty;
 
             if (!isNaN(lat) && !isNaN(lon) && certainty === 'Probable' || certainty === 'Possible' || certainty === 'Certain') {
                 const marker = L.marker([lat, lon], { icon: ufoIcon }).addTo(sightingsMapLayer);
                 marker.on('click', () => showDetails(d));
             }
         });
     });
 }
 
 function loadAirportsMap() {
     airportsMapLayer.clearLayers();
 
     // Load airports/bases
     d3.csv("data/main_airports_bases.csv").then(dataAirports => {
         dataAirports.forEach(dA => {
             const lat = parseFloat(dA.Lat);
             const lon = parseFloat(dA.Lon);
             if (!isNaN(lat) && !isNaN(lon)) {
                 L.marker([lat, lon], { icon: airportIcon }).addTo(airportsMapLayer);
             }
         });
     });
 
     // Load NUFORC data
     d3.csv("data/NUFORCData.csv").then(data => {
         data.forEach(d => {
             const lat = parseFloat(d.Lat);
             const lon = parseFloat(d.Lon);
             if (!isNaN(lat) && !isNaN(lon)) {
                 L.circleMarker([lat, lon], {
                     radius: 2,
                     color: 'red',
                     fillColor: 'red',
                     fillOpacity: 0.5
                 }).addTo(airportsMapLayer);
             }
         });
     });
 }
 
 function showSightingsMap() {
     map.setView([56.1304, -106.3468], 4);
     map.eachLayer(layer => map.removeLayer(layer));
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
     sightingsMapLayer.addTo(map);
 
     // Reset panel content
     document.getElementById("info-panel").innerHTML = `
         <h2>Key Sightings</h2>
         <p>Click on a UFO to see report details.</p>
     `;
 }
 
 function showAirportsMap() {
     map.setView([56.1304, -106.3468], 4);
     map.eachLayer(layer => map.removeLayer(layer));
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
     airportsMapLayer.addTo(map);
 
     const provinces = {
         "Alberta": [53.9333, -116.5765, 6],
         "British Columbia": [53.7267, -127.6476, 6],
         "Manitoba": [55.0000, -97.0000, 6],
         "New Brunswick": [46.5653, -66.4619, 7],
         "Newfoundland and Labrador": [53.1355, -57.6604, 6],
         "Northwest Territories": [64.8255, -124.8457, 4],
         "Nova Scotia": [44.6810, -63.7443, 7],
         "Nunavut": [70.2998, -83.1076, 3],
         "Ontario": [51.2538, -85.3232, 6],
         "Prince Edward Island": [46.5107, -63.4168, 8],
         "Quebec": [52.9399, -73.5491, 6],
         "Saskatchewan": [52.9399, -106.4509, 6],
         "Yukon": [64.2823, -135.0000, 5]
     };
 
     let provinceListHTML = `<h5>Click on a Canadian province or territory below to get a closer look!</h5><ul>`;
     for (const province in provinces) {
         provinceListHTML += `<li class="province-link" data-lat="${provinces[province][0]}" 
                               data-lon="${provinces[province][1]}" 
                               data-zoom="${provinces[province][2]}">${province}</li>`;
     }
     provinceListHTML += `</ul>`;
 
     // Update panel content
     document.getElementById("info-panel").innerHTML = `
         <h2>Sightings vs. Canadian Airports and Airbases</h2>
         <p>This map shows airports and airbases in Canada, and UFO sightings as red markers.</p>
     ` + provinceListHTML;
 
     document.querySelectorAll(".province-link").forEach(item => {
         item.addEventListener("click", function () {
             const lat = parseFloat(this.getAttribute("data-lat"));
             const lon = parseFloat(this.getAttribute("data-lon"));
             const zoom = parseInt(this.getAttribute("data-zoom"));
             map.setView([lat, lon], zoom);
         });
     });
 
 }
 
 
 // Function to update the info panel
 function showDetails(data) {
     document.getElementById('info-panel').innerHTML = `
     <h2>Key Sightings</h2>
     <p><strong>Date:</strong> ${data.Date || "N/A"}</p>
     <p><strong>Location:</strong> ${data.City + ", " + data.State + ", " + data.Country || "Unknown"}</p>
     <p><strong>Time:</strong> ${data.Time || "N/A"}</p>
     <p><strong>Duration:</strong> ${data.Duration || "N/A"}</p>
     <p><strong>Number of Ships:</strong> ${data.NumShips || "N/A"}</p>
     <p><strong>Shape:</strong> ${data.Shape || "N/A"}</p>
     <p><strong>Summary:</strong> ${data.Summary || "No summary available."}</p>
     <p><strong>NUFORC Notes:</strong> ${data.NUFORC_Note || "No notes available."}</p>
     <div id="chart-container"></div>
 `;
 
     renderChart(data);
 }
 
 // Placeholder function for sighting visualizations/images
 function renderChart(data) {
     const container = document.getElementById('zoom-map-container');
     //container.innerHTML = `<p>The sighting:</p>`;
     // Visualization/image of sighting to go here
 }
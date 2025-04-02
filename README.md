# CSC316-Project
📌 Project Overview
This project is an interactive data visualization exploring UFO sightings in Canada. The visualization is presented as a scroll-based webpage with multiple interactive sections that explore patterns in time, geography, shapes, and witness accounts.

Project Components
Custom Code (Our Work):

index.html, all .css in css/ folder, and all .js files in the js/ folder: These files contain the HTML structure, CSS styling, and JavaScript logic for the visualizations.

There are custom D3.js visualizations across multiple sections (e.g., line charts, clocks, shapes).

External Libraries:

D3.js – Used for all visualizations and data binding.

Google Fonts – Fonts "Rubik Glitch", "Special Elite", and "Turret Road" for styling.

All pictures are from the public domain.

Data
UFO Sightings (Cleaned Dataset):
This dataset contains cleaned and structured UFO sighting reports sourced from the National UFO Reporting Center (NUFORC).

Airports & Military Bases Dataset (Custom):
We created our own dataset listing major airports and military bases across Canada, along with their coordinates, to enable proximity analysis in the map visualization.

Sci-Fi Movie Dataset (Custom):
A list of popular science fiction films released 'til today, used to highlight cultural moments in the timeline visualization and explore their correlation with sighting spikes. This dataset came from ChatGPT.

Project Links
Live Website: https://csc316project.netlify.app/

Screencast Video: https://www.youtube.com/watch?v=QWxtO7A2lgc


All Features

Temporal Trends Visualization: A dynamic line chart that reveals the rise and fall of UFO sightings by year, uncovering patterns linked to pop culture and historical events.

- Animated Line Chart: Pressing the play button gradually draws the chart from the 1920s to the present, visualizing the trend over time.
Users can pause or reset the animation at any point.

- Yearly Sightings Dots: Each year is represented by a blue dot; clicking a dot shows the number of sightings and the percentage change from the previous year.

- Pop Culture Highlights (Green Dots): Years with major sci-fi film releases are marked with green dots. Clicking them reveals a list of influential movies on the bottom right panel.

- Notable Event Markers: Notepad icons appear at key spikes or dips to highlight important events, such as government disclosures or cultural phenomena.


Clock Visualization: Users explore UFO sightings by time of day across different seasons, uncovering patterns in when sightings are most and least likely to occur.

- Interactive Clock Interface: Dragging the clock hand updates the sightings count and highlights the corresponding point on the line chart.

- Line Chart Sync: Clicking a point on the line chart smoothly moves the clock hand to that hour, syncing both visuals.

- Peak & Dead Zones: Clicking green (Peak Zone) or red (Dead Zone) dots reveals an insight box on the right with explanations. Users can toggle a threshold line to see how these zones are determined.

- Seasonal Filtering: Clicking season buttons (Winter, Spring, Summer, Fall) updates both the clock and line chart with seasonal data.

- Thresholds & Insights: Peak and Dead Zone thresholds adjust automatically based on the selected season, showing custom insights for each.


Interactive Map: This map visualization explores UFO sightings across Canada, allowing users to explore detailed key reports and a view of all sightings alongside nearby airports and military bases.

Two Toggleable Views...

Key Sightings View:
- Shows only major highlighted sightings.
- Clicking a sighting shows details in side panel with description, date, number of witnesses, shape, and more.

All Sightings + Airport/Military View:
- Displays all sightings as data points.
- Also shows airport and military base icons for proximity analysis.

Interactive Airport/Military Base Tooltips:
- Clicking an airplane icon reveals: Facility Name, Number of sightings within 75 km, Closest sighting's distance

Side Panel Behavior:
- In Key Sightings View, the side panel displays detailed reports.
- In All Sightings View, it transforms into a region selector for fast zoom navigation.


Witness & Ship Count Visualization: This visualization explores how the number of witnesses and UFO ships affect sightings, using an interactive landing zone and visual filters.

- Landing Zone Display (Left Panel): A central landing zone where selections from right panel are shown visually through stickman and ufo icons:

- Dynamic Percentage Bar (Bottom Left): A percentage bar at the bottom updates in real-time based on the selected witness and ship count, reflecting the share of total sightings.

- Interactive Filters (Right Panel):
  - Users can select different combinations of: Number of Witnesses and Number of Ships to explore how these factors correlate with sighting frequency.
  - UFO Ship Display Options:
    - Users can switch between different Witness groupings: Solo, Small Group, Crowd, and All.
    - Users can switch between different UFO groupings: Single, Small Group, Fleet, and All.


Shape Visualization: This visualization displays an array of UFO shapes scattered across a starry night sky, revealing how reported shapes shift over time and how frequently each one appears.

- Interactive Shape Array: UFO shapes float in a night sky layout, each representing a different reported design.

- Clickable Shapes: Clicking on a shape reveals its name, description, and number of reports in the right-hand panel.

- Frequency Reshaping Toggle: Users can toggle a setting to resize shapes based on how commonly they appear, with sizes proportional to each other rather than absolute values.

- Decade Dropdown Filter: Users can filter reported shapes by decade to see how preferences and reports have evolved over time.

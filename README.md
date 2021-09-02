# Crash Data Tool
In transportation planning, crash data is a vital resource for identifying crash trends and needed safety improvements. DVRPC is consistent with state and local partners by employing a Vision Zero approach to crash data analysis: no loss of life in our region's roadways is acceptable. Roadway owners and policymakers should focus on preventing crashes that result in fatalities or serious injuries - the most severe crashes on the road.

To this end and in collaboration with The Office of Safe Streets, DVRPC is working on an interactive web map for crash data in the DVRPC region. Users will be able to identify and filter crashes to various degrees. Toggles for geographic (county, municipality or custom polygons), severity (killed and severely injured or all) and temporal (2014 - 2019) levels can be combined to identify crash trends in a variety of ways. The app is meant to be an informative overview of past crash trends. A link to the app will be provided once it goes live for public viewing. 

## Disclaimer
The forthcoming Crash Data Tool is a public resource of general information. The Delaware Valley Regional Planning Commission (DVRPC) makes no warranty, representation, or guarantee as to the content, sequence, accuracy, timeliness, or completeness of any of the spatial data or database information provided herein. DVRPC and partner state, local, and other agencies shall assume no liability for errors, omissions, or inaccuracies in the information provided regardless of how caused; or any decision made or action taken or not taken by any person relying on any information or data furnished within.

## Development
* The front end of this app is built with <a href="https://reactjs.org/">React</a>. <a href="https://docs.mapbox.com/mapbox-gl-js/api/">Mapboxgl JS</a> is used for the mapping component and <a href="">Chart JS</a> is used for the data visualizations. State is managed with <a href="https://redux.js.org/">Redux</a>.

* A Python API was built for this app using <a href="https://fastapi.tiangolo.com/">FastAPI</a>, you can view the <a href="https://cloud.dvrpc.org/api/crash-data/v1/docs">documentation here</a>. Data is stored in a <a href="https://www.postgresql.org/">PostgreSQL</a> database. Vector tiles and other mapping information were created in house and are hosted on a <a href="https://www.digitalocean.com/">Digital Ocean Droplet</a>.

## Installment steps
* cd to the parent directory for the project and then `git clone https://github.com/dvrpc/crash-data-tool.git`
* `npm install` 
* `cd react npm install`
* `npm start`

## Build Process
* `cd react`
* `npm run build`
* copy the files from the build folder into the staging folder
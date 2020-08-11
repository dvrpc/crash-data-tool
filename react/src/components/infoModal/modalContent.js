export const modalContent = {
    about: `
      <p>In transportation planning, crash data is a vital resource for identifying crash trends and needed safety improvements. DVRPC is consistent with state and local partners by employing a Vision Zero approach to crash data analysis: no loss of life in our region's roadways is acceptable. Roadway owners and policymakers should focus on preventing crashes that result in fatalities or serious injuries - the most severe crashes on the road.</p>
      <span>Injury severity from crashes is divided into seven possible categories:</span>
      <ol>
        <li><strong>Fatality</strong>: Fatalities stemming from crashes may occur up to 30 days following the crash for the injury to be coded as fatal.</li>
        <li><strong>Suspected Serious Injury</strong>: The responding police officer suspects that the person sustained a serious, often incapacitating, injury.</li>
        <li><strong>Suspected Minor Injury</strong>: The responding police officer suspects that the person sustained an injury less sever than a serious injury, and the injury is "evident".</li>
        <li><strong>Possible Injury</strong>: The responding police officer suspects that the person sustained an injury of low severity, sometimes a "complaint of pain," and the injury is not readily evident.</li>
        <li><strong>Not Injured</strong>: The responding police officer does not suspect that the person was injuried.
          <ul>
            <li>In <strong>Pennsylvania</strong>, if no one was injured than at least one vehicle must require a tow from the scene of the crash for that crash to be considered "reportable."</li>
            <li> In <strong>New Jersey</strong> a crash is "reportable" if any one person involved is injured, or if there is damage to property of $500 or more.</li>
          </ul>
        </li>
        <li><strong>Unknown Injury</strong>: An injury is suspected but the severity of the injury is unknown.</li>
        <li><strong>Unknown if Injured</strong>: Data is unavailable regarding whether the person was injured.</li>
      </ol>
      <hr id="crash-map-modal-hr"/>
      <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
    `,
    how: `
      <ul>
        <li>
          <h4>Interact with the Crash Data</h4>
          <span>Change the form fields on the navbar and press "search" to update crash data geography. Choose between county and municipal level or enter an address to view regional statistics at that location.</span>/<br />
          <span>Change the form fields on the sidebar to update years (2014 - 2018) or severity (KSI or All) of crash data and press "update" to update.
        </li>
        <li>
          <h4>Interact with the Map</h4>
          <span>Change the zoom level to view crashes as a heat map (zoomed out) or as clusters (zoomed in)</span>/<br />
          <span>Hover over counties or municipalities to see their name and click on them to get crash statistics for that county or municipality.</span></br >
          <span>Click on the polygon map overlay to draw a polygon over a selected area and get crash statistics for the selected area. Click on the map to add a vertex to the polygon, double click to finish the polygon and get crash statistics for the area it covers. A drawn polygon with yellow borders can be moved and the statistics will be updated for the new location. Clicking on the map outside of a drawn polygon will turn it blue and set it in place. These polygons cannot be moved, but you can click "remove boundary" to delete it and draw another one.</span><br />
          <span>Click on the DVRPC logo map overlay to recenter the map on the entire region.</span>
        </li>
      </ul>
    `,
    disclaimer: `
      <p>This web page is a public resource of general information. The Delaware Valley Regional Planning Commission (DVRPC) makes no warranty, representation, or guarantee as to the content, sequence, accuracy, timeliness, or completeness of any of the spatial data or database information provided herein. DVRPC and partner state, local, and other agencies shall assume no liability for errors, omissions, or inaccuracies in the information provided regardless of how caused; or any decision made or action taken or not taken by any person relying on any information or data furnished within.</p>
    `
  }
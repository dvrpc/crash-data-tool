import polygon from './polygon.png'

export const modalContent = {
    about: `
      <p>In transportation planning, crash data is a vital resource for identifying crash trends and needed safety improvements. DVRPC is consistent with state and local partners by employing a Vision Zero approach to crash data analysis: no loss of life in our region's roadways is acceptable. Roadway owners and policymakers should focus on preventing crashes that result in fatalities or serious injuries - the most severe crashes on the road.</p>
      <span>Injury severity from crashes is divided into seven possible categories:</span>
      <ol class="crash-map-modal-category-list">
        <li><details><summary><strong>Fatality</strong></summary> Fatalities stemming from crashes may occur up to 30 days following the crash for the injury to be coded as fatal.</details></li>
        <li><details><summary><strong>Suspected Serious Injury</strong></summary> The responding police officer suspects that the person sustained a serious, often incapacitating, injury.</details></li>
        <li><details><summary><strong>Suspected Minor Injury</strong></summary> The responding police officer suspects that the person sustained an injury less sever than a serious injury, and the injury is "evident".</details></li>
        <li><details><summary><strong>Possible Injury</strong></summary> The responding police officer suspects that the person sustained an injury of low severity, sometimes a "complaint of pain," and the injury is not readily evident.</details></li>
        <li>
            <details>
                <summary><strong>Not Injured</strong></summary> The responding police officer does not suspect that the person was injuried.
                <ul>
                    <li>In <strong>Pennsylvania</strong>, if no one was injured than at least one vehicle must require a tow from the scene of the crash for that crash to be considered "reportable."</li>
                    <li> In <strong>New Jersey</strong> a crash is "reportable" if any one person involved is injured, or if there is damage to property of $500 or more.</li>
                </ul>
            </details>
        </li>
        <li><details><summary><strong>Unknown Injury</strong></summary> An injury is suspected but the severity of the injury is unknown.</details></li>
        <li><details><summary><strong>Unknown if Injured</strong></summary> Data is unavailable regarding whether the person was injured.</details></li>
    </ol>
    <p>Following FHWA guidance, in 2016 most counties in Pennsylvania (except Philadelphia) adopted the term "Suspected Serious Injury" in place of "Major Injury," "Suspected Minor Injury" in place of "Moderate Injury," and "Possible Injury" in place of "Minor Injury”. Philadelphia and DVRPC’s New Jersey counties adopted these changes in 2019. Although these new terms did not result in a significant change in the definition of these injury types, it did redistribute the crashes within injury categories resulting in an increase in crashes labeled "Suspected Serious Injury" and corresponding decreases in injuries labeled as lesser severity. More information on FHWA’s guidance can be found <a href="https://safety.fhwa.dot.gov/hsip/spm/sir_planning_tool.cfm" target="_blank" rel="noopener noreferrer">here</a> and <a href="https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/811631" target="_blank" rel="noopener noreferrer">here</a> (see P.5 Injury Status on page 34).</p>
    <p>Raw crash data tables for this tool were downloaded from the <a href="https://pennshare.maps.arcgis.com/apps/webappviewer/index.html?id=8fdbf046e36e41649bbfd9d7dd7c7e7e" target="_blank" rel="noopener noreferrer">PennDOT Crash Download Map</a> and the <a href="https://www.state.nj.us/transportation/refdata/accident/rawdata01-current.shtm" target="_blank" rel="noopener noreferrer">NJDOT Crash Tables</a> webpage, for Pennsylvania and New Jersey data, respectively.</p>
    <hr id="crash-map-modal-hr"/>
    <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
    `,
    how: `
      <ul>
        <li>
          <h4>Change Geography</h4>
          <ul>
            <li><em>From the map:</em> Click on counties (zoomed out) or municipalities (zoomed in) within the DVRPC region to get crash statistics for that county or municipality. You can also view custom geographies by clicking the <img src=${polygon} alt="polygon tool icon" /> icon on the map, which opens the polygon editor. Click to drop vertices and double click to finish drawing a polygon. The polygon can be moved and crash statistics will be re-calculated.</li>
            <li><em>From the navbar:</em> View county or municipal data by changing the form fields on the navbar and pressing "go" to update crash statistics to that area. You can also view Philadelphia Planning Areas by selecting the "Philadelphia Planning Areas" from the dropdown. This option is only available from the navbar dropdown. Searching by address will zoom to a location but will not update crash statistics.</li>
          </ul>
        </li>
        <li>
          <h4>Filter Crashes</h4>
          <ul>
            <li><em>By crash type:</em> Choose between KSI (killed and severe injury) or All crash types on the sidebar form labeled "Select Severity Type" and press update to apply the filter.</li>
            <li><em>By date:</em> Select a range between 2014 and 2019 on the sidebar form labeled "Select Date Range" and press update to apply the filter. View a single year of data by setting it to both From and To.</li>
          </ul>
        </li>
        <li>  
          <h4>View Crash Details</h4>
          <ul>
            <li>Zoom in to the crash circles view and click on any crash circle to create a popup with details for that specific crash. At higher zoom levels, crashes in similar locations may aggregate to the same point resulting in popups with multiple pages of crash details.</li>
          </ul>
        </li>
      </ul>
    `,
    disclaimer: `
      <p>This web page is a public resource of general information. The Delaware Valley Regional Planning Commission (DVRPC) makes no warranty, representation, or guarantee as to the content, sequence, accuracy, timeliness, or completeness of any of the spatial data or database information provided herein. DVRPC and partner state, local, and other agencies shall assume no liability for errors, omissions, or inaccuracies in the information provided regardless of how caused; or any decision made or action taken or not taken by any person relying on any information or data furnished within.</p>
    `
  }
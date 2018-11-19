const queryModalHTML = () => {
    return `
        <form id="new-crash-query">
            <p>Crash Severity</p>
            <div className="query-modal-group" id="query-severity">
                <input type="checkbox" value="killed" />Killed<br />
                <input type="checkbox" value="major injury" />Major Injury<br />
                <input type="checkbox" value="moderate injury" />Moderate Injury<br />
                <input type="checkbox" value="minor injury" />Minor Injury<br />
                <input type="checkbox" value="unknown injury" />Injury (unknown severity)<br />
                <input type="checkbox" value="no injury" />Not Injured<br />
                <input type="checkbox" value="unknown" />Unknown<br />
            </div>
            
            <hr />

            <p>Year</p>
            <div className="query-modal-group" id="query-year">
                <select>
                    <option value="2016">2016</option>
                    <option value="2015">2015</option>
                    <option value="2014">2014</option>
                    <option value="2013">2013</option>
                    <option value="2012">2012</option>
                </select>
            </div>

            <hr />

            <p>Collision Type</p>
            <div className="query-modal-group" id="query-type">
                <input type="checkbox" value="non coliision" />Non-collision<br />
                <input type="checkbox" value="rear-end" />Rear-end<br />
                <input type="checkbox" value="head-on" />Head-on<br />
                <input type="checkbox" value="rear-to-rear (backing)" />Rear-to-rear (Backing)<br />
            </div>

            
        </form>
    `
}

export default queryModalHTML
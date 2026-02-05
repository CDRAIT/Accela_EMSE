/**
 * Gets an object to observe
 * Print Methods and Attributes of the Object
 * @param {Object} obj 
 */
function exploreObject(obj) {
    aa.print("Methods:");
    for (var x in obj) {
        try {
            if (typeof (obj[x]) === "function") {
                aa.print("<font color=blue><u><b>" + x + "</b></u></font> ");
                aa.print("   " + obj[x] + "<br>");
            }
        } catch (err) {
            aa.print("exploreObject(): **ERROR** in Functions: " + err.Message);
        }
        var counter = obj.length;
    }

    aa.print("");
    aa.print("Properties:");
    for (var y in obj) {
        try {
            if (typeof (obj[y]) !== "function") {
                aa.print("  <b> " + y + ": </b> " + obj[y]);
            }
        } catch (err) {
            logDebaa.print("exploreObject(): **ERROR** in Properties: " + err.Message);
        }
    }
}
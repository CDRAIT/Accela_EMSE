//@ts-check
/******************************************************
*
* Batch Job Script 
* Name: BATCHJOB_RFEEITEM_DML.js
* 
* Author: Created by "Claude Sonnet 5" and modified by Abe: 11/20/2026
* 
* Description: 
* Reads JSON config file from scripts,
* validates each record, and inserts it into [RFEEITEM] using a
* parameterized prepared statement (prevents SQL injection / quote issues).
*
* [R1_DISPLAY_ORDER] is converted from a JSON string to a numeric value
* before being bound to the statement (RFEEITEM.R1_DISPLAY_ORDER is numeric).
*
* Expected JSON shape (array of objects), one object per RFEEITEM row:
*   [
*        {
*        "SERV_PROV_CODE": "PLACERCO",
*        "R1_FEE_CODE":  "ESD",		
*        "FEE_SCHEDULE_VERSION":  "2027",
*        "R1_GF_COD":  "ESMARA-ACTIVE",
*        "R1_GF_DES":  "Active Mine",
*        "R1_GF_CAL_PROC":  "CONSTANT",
*        "R1_GF_FORMULA":  "3112",
*        "R1_GF_UDES":  "Each",
*        "COMMENTS":  "",
*        "R1_DISPLAY_ORDER":  "10",
*        "R1_DISPLAY":  "10",
*        "R1_SUB_GROUP":  "TECH_FEE",
*        "REC_DATE":  "2026-11-19 00:00:00.000",
*        "REC_FUL_NAM":  "SVC_AGENT",
*        "R1_GF_FEE_PERIOD": "FINAL",
*        "REC_STATUS": "A",
*        "R1_GF_DEFAULT_FLAG": "Y",
*        "R1_GF_CR_DR": "D",
*        "R1_GF_AUTO_ASSESS_FLAG": "N",
*        "R1_GF_NET_FEE_FLAG": "N",
*        "R1_GF_NEGATIVE_FEE_FLAG": "N",
*        "ROUND_FEE_FLAG": "N", 
*        "R1_GF_ACA_REQUIRED_FLAG": "N",
*        "R1_FEE_ALLOCATION_TYPE": "NONE"
*        },
*     ...
*   ]
*
*******************************************************/

var SCRIPT_VERSION = "3";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null, true));
eval(getScriptText("INCLUDES_CUSTOM",null, true));

var debug = "";
var showDebug = 1;
var StartDate;


var JSON_FEE_INSERT_FILENAME = "INCLUDES_FEE_DML_CONFIG";

// Fields that must be present and non-blank on every JSON record for it to be inserted.
// COMMENTS field is optional and can be blank or null
var REQUIRED_FIELDS = ["SERV_PROV_CODE",
    "R1_FEE_CODE",
    "R1_GF_FEE_PERIOD",
    "FEE_SCHEDULE_VERSION",
    "R1_GF_COD",
    "R1_GF_DES",
    "R1_GF_CAL_PROC",
    "R1_GF_FORMULA",
    "R1_GF_UDES",    
    "R1_DISPLAY_ORDER",
    "R1_DISPLAY",
    "R1_SUB_GROUP",
    "REC_DATE",
    "REC_FUL_NAM",
    "R1_GF_FEE_PERIOD",
    "REC_STATUS"
];

//#region =================================================
//        MAIN PROCESS
//#region =================================================

var envsArr = loadEnvVars(true);
var runJob = startJob();
if (runJob) {
    //Put your code here...
    insertRFeeItemsFromJson(JSON_FEE_INSERT_FILENAME);
}

endJob();

//#endregion MAIN PROCESS


//#region =================================================
//        CUSTOM BATCH JOB FUNCTIONS
//#region =================================================

/**
 * Parses a number from a string
 * @param {string} input - Input string
 * @returns {number|null} Parsed number or null
 */

function parseNumberFromString(input) {
    if (input === null || input === undefined || input === '') {
        return null;
    }

    var number = Number(input);

    if (isNaN(number)) {
        return null;
    }

    return number;
}

/**
 * Validates if a value is a valid number
 * @param {*} field - Value to validate
 * @returns {boolean} True if valid number
 */

function validNumber(field) {
    if (field === 0 || field === "0") return true;
    var n = typeof field !== "number" ? parseNumberFromString(String(field)) : field;
    return n !== null && n !== undefined && !isNaN(n);
}

/**
 * Loads and parses a JSON configuration file from script includes
 * @param {string} configScriptName - Name of the script include containing JSON config
 * @returns {Object|null} Parsed JSON configuration object or null if error
 */

function loadJSONConfig(configScriptName) {
    var title = "loadJSONConfig: ";
    try {
        aa.print(title + "Loading configuration from script: " + configScriptName);
        logDebug(title + "Loading configuration from script: " + configScriptName);
        var configText = getScriptText(configScriptName, null, false);

        if (isEmpty(configText)) {
            aa.print(title + "ERROR: Configuration script '" + configScriptName + "' is empty or does not exist");
            logDebug(title + "ERROR: Configuration script '" + configScriptName + "' is empty or does not exist");
            return null;
        }

        var configObj = JSON.parse(configText);
        aa.print(title + "Successfully loaded and parsed configuration from: " + configScriptName);
        logDebug(title + "Successfully loaded and parsed configuration from: " + configScriptName);
        aa.print("");
        logDebug("");
        return configObj;

    } catch (err) {
        aa.print(title + "ERROR parsing JSON configuration from '" + configScriptName + "': " + err.message);
        logDebug(title + "ERROR parsing JSON configuration from '" + configScriptName + "': " + err.message);
        return null;
    }
}

/**
 * Validates a single JSON record before insert.
 *  - All REQUIRED_FIELDS must be present and non-blank.
 *  - R1_DISPLAY_ORDER must convert to a finite number.
 *
 * @param {Object} rec
 * @returns {Object} { isValid: Boolean, reason: String, displayOrder: Number }
 */
function validateRecord(rec) {
    if (!rec) {
        return { isValid: false, reason: "record is null/undefined" };
    }

    var missingFields = [];
    for (var f = 0; f < REQUIRED_FIELDS.length; f++) {
        var fieldName = REQUIRED_FIELDS[f];
        var value = rec[fieldName];
        if (value === undefined || value === null || String(value).trim() === "") {
            missingFields.push(fieldName);
        }
    }

    if (missingFields.length > 0) {
        return { isValid: false, reason: "missing/blank required field(s): " + missingFields.join(", ") };
    }

    var displayOrderNum = Number(rec.R1_DISPLAY_ORDER);
    if (isNaN(displayOrderNum)) {
        return { isValid: false, reason: "R1_DISPLAY_ORDER is not numeric: '" + rec.R1_DISPLAY_ORDER + "'" };
    }

    return { isValid: true, reason: "", displayOrder: displayOrderNum };
}

/**
 * Returns String(value), or "" if value is null/undefined (used for
 * optional columns that may be blank in the source JSON).
 */
function toStringOrEmpty(value) {
    return (value === undefined || value === null) ? "" : String(value);
}

/**
 * Reads the config JSON file, validates each record, and inserts
 * valid records into [RFEEITEM]. Invalid records are skipped (not inserted)
 * and logged with the reason. Insert errors (e.g. duplicate key) are caught
 * per-record so one bad row does not abort the remaining rows.
 *
 * @param {String} jsonFileName Name of the script include containing the RFEEITEM
 */
function insertRFeeItemsFromJson(jsonFileName) { 

    var records;
    try {
        records = loadJSONConfig(jsonFileName);
    } catch (parseEx) {
        aa.print("ERROR: Failed to parse JSON file " + jsonFileName + " - " + parseEx);
        return;
    }

    if (!records || !records.length) {
        aa.print("No records found in JSON file: " + jsonFileName);
        return;
    }

    var insertSQL =
        "INSERT INTO [RFEEITEM] " +
        "([SERV_PROV_CODE]" +
        ",[R1_FEE_CODE]" +
        ",[FEE_SCHEDULE_VERSION]" +
        ",[R1_GF_COD]" +
        ",[R1_GF_DES]" +
        ",[R1_GF_CAL_PROC]" +
        ",[R1_GF_FORMULA]" +
        ",[R1_GF_UDES]" +
        ",[COMMENTS]" +
        ",[R1_DISPLAY_ORDER]" +
        ",[R1_DISPLAY]" +
        ",[R1_SUB_GROUP]" +
        ",[REC_DATE]" +
        ",[REC_FUL_NAM]" +
        ",[R1_GF_FEE_PERIOD]" +
        ",[REC_STATUS]" +
        ",[R1_GF_DEFAULT_FLAG]" +
        ",[R1_GF_CR_DR]" +
        ",[R1_GF_AUTO_ASSESS_FLAG]" +
        ",[R1_GF_NET_FEE_FLAG]" +
        ",[R1_GF_NEGATIVE_FEE_FLAG]" +
        ",[ROUND_FEE_FLAG]" +
        ",[R1_GF_ACA_REQUIRED_FLAG]" +
        ",[R1_FEE_ALLOCATION_TYPE]" +
        ") VALUES (?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?)";

    var conn = aa.db.getConnection();
    var stmt = conn.prepareStatement(insertSQL);

    var insertedCount = 0;
    var skippedCount = 0;
    var failedCount = 0;

    try {
        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            var rowLabel = "Row " + (i + 1) + " (R1_GF_COD=" + (rec ? rec.R1_GF_COD : "n/a") + ")";

            var validation = validateRecord(rec);
            if (!validation.isValid) {
                aa.print("SKIPPED - " + rowLabel + " - " + validation.reason);
                logDebug("SKIPPED - " + rowLabel + " - " + validation.reason);
                skippedCount++;
                continue;
            }

            try {

                stmt.setString(1, String(rec.SERV_PROV_CODE));
                stmt.setString(2, String(rec.R1_FEE_CODE));
                stmt.setString(3, String(rec.FEE_SCHEDULE_VERSION));
                stmt.setString(4, String(rec.R1_GF_COD));
                stmt.setString(5, String(rec.R1_GF_DES));
                stmt.setString(6, String(rec.R1_GF_CAL_PROC));
                stmt.setString(7, String(rec.R1_GF_FORMULA));
                stmt.setString(8, String(rec.R1_GF_UDES));
                stmt.setString(9, toStringOrEmpty(rec.COMMENTS));
                stmt.setString(10, parseNumberFromString(rec.R1_DISPLAY_ORDER));
                stmt.setString(11, String(rec.R1_DISPLAY));
                stmt.setString(12, toStringOrEmpty(rec.R1_SUB_GROUP));
                stmt.setString(13, String(rec.REC_DATE));
                stmt.setString(14, String(rec.REC_FUL_NAM));
                stmt.setString(15, String(rec.R1_GF_FEE_PERIOD));
                stmt.setString(16, String(rec.REC_STATUS));
                stmt.setString(17, String(rec.R1_GF_DEFAULT_FLAG));
                stmt.setString(18, String(rec.R1_GF_CR_DR));
                stmt.setString(19, String(rec.R1_GF_AUTO_ASSESS_FLAG));
                stmt.setString(20, String(rec.R1_GF_NET_FEE_FLAG));
                stmt.setString(21, String(rec.R1_GF_NEGATIVE_FEE_FLAG));
                stmt.setString(22, String(rec.ROUND_FEE_FLAG));
                stmt.setString(23, String(rec.R1_GF_ACA_REQUIRED_FLAG));
                stmt.setString(24, String(rec.R1_FEE_ALLOCATION_TYPE));

                stmt.executeUpdate();
                insertedCount++;
                aa.print("INSERTED - " + rowLabel);
                logDebug("INSERTED - " + rowLabel);
            } catch (insertEx) {
                failedCount++;
                aa.print("ERROR - " + rowLabel + " - insert failed: " + insertEx);
                logDebug("ERROR - " + rowLabel + " - insert failed: " + insertEx);
            }
        }
    } finally {
        stmt.close();
        conn.close();
    }

    aa.print("-----------------------------------------");
    logDebug("-----------------------------------------");
    aa.print("RFEEITEM import complete for: " + jsonFileName);
    logDebug("RFEEITEM import complete for: " + jsonFileName);
    aa.print("  Total records in file: " + records.length);
    logDebug("  Total records in file: " + records.length);
    aa.print("  Inserted successfully: " + insertedCount);
    logDebug("  Inserted successfully: " + insertedCount);
    aa.print("  Skipped (validation):  " + skippedCount);
    logDebug("  Skipped (validation):  " + skippedCount);
    aa.print("  Failed (insert error): " + failedCount);
    logDebug("  Failed (insert error): " + failedCount);
}


//#endregion CUSTOM BATCH JOB FUNCTIONS



//#region =================================================
//        STANDARD BATCH JOB FUNCTIONS
//#region =================================================

/**
 * function to close out the batch job with logging.
 *
 * @return {void} 
 */
function endJob() {
    var endDate = new Date();

    var elapsed = Number(endDate) - Number(StartDate);
    var elapsed = elapsed/1000;

    logDebug(" ");
    logDebug("==========");
    logDebug("Batch job ended on " + endDate);
    logDebug("Batch job elapsed time: " + elapsed);

    aa.env.setValue("ScriptReturnCode", "0"); 
    aa.env.setValue("ScriptReturnMessage", debug);

    return;
}

/**
 * function to start the batch job with debug output for logging.
 *
 * @return {boolean} flag indicating whether the batch job was started 
 * successfully or not.
 */
function startJob() {
    // update global variable with start of batch job
    StartDate = new Date();

    var batchJobName = "" + aa.env.getValue("BatchJobName");
    var batchJobId = 0;
    var batchJobIdResult = aa.batchJob.getJobID();
    var runJob = false;
    if (batchJobIdResult.getSuccess()) {
        batchJobId = batchJobIdResult.getOutput();
        runJob = true;
        logDebug("Batch job " + batchJobName + " (" + batchJobId +")");
        logDebug("Batch job begun on " + StartDate);
        logDebug("==========");
        logDebug(" ");
    } else {
        logDebug("Batch job not found. Message = " + batchJobIdResult.getErrorMessage());
    }

    return runJob;
}

/**
 * Function to retrieve a script's text. If the useProductScripts is set to 
 * true function retrieves the master script otherwise function retrieves the 
 * text of the business script.
 *
 * @param {string} vScriptName - script name
 * @param {string} servProvCode - service provider code. If null, function 
 * defaults to the current service provider code
 * @param {boolean} useProductScripts - flag to indicate whether to retrieve 
 * from master scripts or business scripts
 * @return {string} text of the script 
 */
function getScriptText(vScriptName, servProvCode, useProductScripts) 
{
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) 
		{
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} 
		else 
		{
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} 
	catch (err) 
	{
		return "";
	}
}

/**
 * Loads all of the environment variables and returns the variables in an 
 * array where the key is the environment variable name and value is the value
 * of the environment variable.
 * 
 * @param {boolean} logFlag - flag to indicate whether to log the parameters as they are
 * loaded
 *
 * @return {Array} array of environment variables with the variable name as the
 * key. 
 */
 function loadEnvVars(logFlag) {
    var newArr = [];
    var params = aa.env.getParamValues();
    var keys = params.keys();
    var key = null;
    while (keys.hasMoreElements()) {
        key = keys.nextElement();
        var keyValue = aa.env.getValue(key);
        newArr[key] = keyValue;
        if (logFlag) {
            logDebug("Loaded parameter " + key + " = " + keyValue);
        }
    }
    return newArr;
}

function exploreObject(objExplore) {
    logDebug("Methods:");
    for (var x in objExplore) {
        try {
            if (typeof (objExplore[x]) === "function") {
                logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
                logDebug("   " + objExplore[x] + "<br>");
            }
        } catch (err) {
            logDebug("exploreObject(): **ERROR** in Functions: " + err.Message);
        }
        var counter = objExplore.length;
    }

    logDebug("");
    logDebug("Properties:");
    for (var y in objExplore) {
        try {
            if (typeof (objExplore[y]) !== "function") {
                logDebug("  <b> " + y + ": </b> " + objExplore[y]);
            }
        } catch (err) {
            logDebug("exploreObject(): **ERROR** in Properties: " + err.Message);
        }
    }
}


//#endregion STANDARD BATCH JOB FUNCTIONS

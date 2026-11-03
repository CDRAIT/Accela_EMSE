// Deletes Critera and Toxic pollutant Tables
// copies from previous year, if missing go back 1 more year
// IE TP25, should get TP24 if TP24 doesnt exist try TP23
var showDebug = true; 
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var senderEmailAddr = "placercounty_noreply@accela.com";                              
var emailAddress = "rmoore@placer.ca.gov";                                      	
var emailAddress2 = "";                                            
var emailText = "";     
var currentUserID = "ADMIN";
var useAppSpecificGroupName = false;    // Use Group name when populating App Specific Info Values
var blank = " ";

var destinations = [
"TP25-EUSD-42-01-01",
"TP25-RKGS-41-01-01",
"TP25-WCCC-42-01-01",
"TP25-SANJ-01-02-01"

];

var asiFieldsByRecordType = [
    {
        recordTypeContains: "AirQuality/Stationary Source/Throughput/GDF",
        fields: [
            "GDF Storage Type",
            "GDF Process Type",
            "Transfer Losses Vapor Recovery Control",
            "Pressure Losses Vapor Recovery Control",
            "Dispensing/Permeation Vapor Recovery controllers",
            "Spillage Vapor Recovery Control",
            "Other Vapor Releases",
            "Transfer Losses Emission Factor",
            "Pressure Losses Emission Factor",
            "Dispensing/Permeation Emission Factor",
            "Spillage Emission Factor",
            "Other Vapor Releases Emission Factor",
            "Combined Emission Factor"
        ]
    },
     // {
         // recordTypeContains: "AirQuality/Stationary Source/Throughput/Bulk Storage Tank",
        // fields: [
        // //    "Annual Max Heat Input (MMBtu)"
			// "Max Heat Input Rating (MMBtu/hr)"
        // ]
    // },
     {
         recordTypeContains: "AirQuality/Stationary Source/Throughput/Engine",
        fields: [
        //    "Annual Max Heat Input (MMBtu)"
			"Max Heat Input Rating (MMBtu/hr)"
        ]
    },
     {
         recordTypeContains: "AirQuality/Stationary Source/Throughput/Boiler",
        fields: [
            "Annual Max Heat Input (MMBtu)",
			"Annual Max Fuel",
			"Max Heat Input Rating (MMBtu/hr)"
        ]
    },
     {
         recordTypeContains: "AirQuality/Stationary Source/Throughput/Coffee Roasting",
        fields: [
            "Annual Max Heat Input (MMBtu)",
			"Annual Max Fuel",
			"Process Rate",
			"Max Heat Input Rating (MMBtu/hr)"
        ]
    }
	// ,
     // {
         // recordTypeContains: "AirQuality/Stationary Source/Throughput/Miscellaneous VOCs",
        // fields: [
            // "Annual Max Heat Input (MMBtu)",
			// "Annual Max Fuel",
			// "Process Rate",
			// "Max Heat Input Rating (MMBtu/hr)"
        // ]
    // }
//
];
var resultCount = 0;
for (var i = 0; i < destinations.length; i++) {
    var destTP = destinations[i];
    // Try previous year first
    var sourceTP = getPreviousTP(destTP, 1);
    if (!recordExists(sourceTP)) {
        logDebug(sourceTP + " not found. Trying one more year back...");
        sourceTP = getPreviousTP(destTP, 2);
    }
    if (!recordExists(sourceTP)) {
        logDebug(sourceTP + " not found. Trying two years back...");
        sourceTP = getPreviousTP(destTP, 3);
    }
    if (!recordExists(sourceTP)) {
        logDebug("No previous TP record found for " + destTP);
        continue;
    }
    logDebug("Source: " + sourceTP + " -> Destination: " + destTP);
    resultCount += copytables(sourceTP, destTP);
}
logDebug("Total records processed: " + resultCount);
function copytables(pFromAltId, pToAltId) {
    var capCount = 0;
    // Lookup CapIDs by AltID
    var fromCapResult = aa.cap.getCapID(pFromAltId);
    var toCapResult = aa.cap.getCapID(pToAltId);
    if (!fromCapResult.getSuccess()) {
        logDebug("Source record not found: " + pFromAltId);
        return 0;
    }
    if (!toCapResult.getSuccess()) {
        logDebug("Target record not found: " + pToAltId);
        return 0;
    }
    var fromCapId = fromCapResult.getOutput();
    var toCapId = toCapResult.getOutput();
	var process = aa.cap.getProjectByChildCapID(toCapId, null, null).getOutput();
	var processId = process[0].getProjectID();      // Process
	var permitId  = getParentPlacer(processId);     // Permit
	logDebug("processId: " + processId);
	logDebug("permitId: " + permitId);
	logDebug("Working on Throughput " + toCapId);
	removeASITable("TOXIC POLLUTANT EMISSION",toCapId);
	removeASITable("CRITERIA POLLUTANT EMISSION",toCapId);
	logDebug("Copying ASI Tables from " + pFromAltId + " to " + pToAltId);
    copySpecificASITable( "TOXIC POLLUTANT EMISSION", fromCapId, toCapId );
    copySpecificASITable( "CRITERIA POLLUTANT EMISSION", fromCapId, toCapId );
    logDebug("Copying ASI from " + pFromAltId + " to " + pToAltId);
var fieldsToCopy = getASIFieldsForRecordType(fromCapId);
for (var i = 0; i < fieldsToCopy.length; i++) {
    copySpecificASIField( fieldsToCopy[i], fromCapId, toCapId );	
	}
var recordType = getRecordType(toCapId);
logDebug("Destination Record Type: " + recordType);
if (recordType.indexOf("AirQuality/Stationary Source/Throughput/GDF") > -1) {
    logDebug("loading updateGDFCriteriaPollutant");
    updateGDFCriteriaPollutant(toCapId);
}
else if (recordType.indexOf("AirQuality/Stationary Source/Throughput/Miscellaneous Combustion") > -1 ||
         recordType.indexOf("AirQuality/Stationary Source/Throughput/Boiler") > -1) {
    updateMiscCombustionCriteriaPollutant(toCapId);
}
else if (recordType.indexOf("AirQuality/Stationary Source/Throughput/Engine") > -1 ||
         recordType.indexOf("AirQuality/Stationary Source/Throughput/Prime Engine") > -1) {
    updateEngineCriteriaPollutant(toCapId);
}
else if (recordType.indexOf("AirQuality/Stationary Source/Throughput/Bulk Storage Tank") > -1) {
    logDebug("Starting BST");
    updateBSTCriteriaPollutant(toCapId);
}	
else if (recordType.indexOf("AirQuality/Stationary Source/Throughput/Coffee Roasting") > -1) {
    logDebug("Starting Coffee");
    updateCoffeeCriteriaPollutant(toCapId);
}	
    capCount++;
    return capCount;
}

function getRecordType(capId) {
    var capResult = aa.cap.getCap(capId);
    if (capResult.getSuccess()) {
        return capResult.getOutput().getCapType().toString();
    }
    return "";
}

function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
        aa.print("DEBUG : " + edesc);
        emailText += "DEBUG : " + edesc + " <br />";
    }
}

function copySpecificASITable(tableName, srcCapId, targetCapId) {
    var allTables = getAllASITables(srcCapId);
    if (allTables && allTables[tableName]) {
        logDebug("Copying table: " + tableName);
        addASITable(tableName, allTables[tableName], targetCapId);
    } else {
        logDebug("Table " + tableName + " not found on source record.");
    }
}

function addASITable(tableName, tableValueArray, itemCap) {// optional capId
	ASITcapID = aa.cap.getCap(itemCap).getOutput();
		ASITcapIDString = ASITcapID.getCapModel().getAltID();
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
		var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)
		if (!tssmResult.getSuccess()) {
			logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
			return false
		}
	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var fld_readonly = tsm.getReadonlyField(); // get Readonly field
	for (thisrow in tableValueArray) {
		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();
			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}
			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
			} else // we are passed a string
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
				fld_readonly.add(null);
			}
		}
		tsm.setTableField(fld);
		tsm.setReadonlyField(fld_readonly);
}
	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
	//logDebug("ADDING COLUMN: " + colname.getColumnName() + " VALUE=[" + tableValueArray[thisrow][colname.getColumnName()] + "]");
	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName);
		logDebug("ERROR OBJECT: " + addResult);
		logDebug("ERROR MESSAGE: " + addResult.getErrorMessage());
		return false;
	} else
		logDebug("Successfully added record to ASI Table: " + tableName + " for Record " + ASITcapIDString);
}

function getAllASITables(itemCap) {
    var result = {};
    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray();
    if (!ta || ta.size() == 0) return null;
    var tai = ta.iterator();
    while (tai.hasNext()) {
        var tsm = tai.next();
        var tn = tsm.getTableName();
        if (tsm.rowIndex.isEmpty()) continue;
        logDebug("Loading ASI Table: " + tn);
        var tempObject = {};
        var tempArray = [];
        var tsmfldi = tsm.getTableField().iterator();
        var tsmcoli = tsm.getColumns().iterator();
        var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator();
        var numrows = 1;
        while (tsmfldi.hasNext()) {
            if (!tsmcoli.hasNext()) {
                tsmcoli = tsm.getColumns().iterator();
                tempArray.push(tempObject);
                tempObject = {};
                numrows++;
            }
            var tcol = tsmcoli.next();
            var tval = tsmfldi.next();
            var readOnly = readOnlyi.hasNext() ? readOnlyi.next() : 'N';
            var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
            tempObject[tcol.getColumnName()] = fieldInfo;
        }
        tempArray.push(tempObject);
        result[tn] = tempArray;
    }
    return result;
}

function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;
	this.hasValue = Boolean(fieldValue != null & fieldValue != "");
	asiTableValObj.prototype.toString=function(){ return this.hasValue ? String(this.fieldValue) : String(""); }
}; 	

function copySpecificASIField(fieldName, srcCapId, targetCapId) {
    // Get source value
    var fieldValue = getAppSpecific(fieldName, srcCapId);
    if (fieldValue != null && fieldValue != "") {
        logDebug("Copying ASI field: " + fieldName + " = " + fieldValue);
        // Update target
        editAppSpecific(fieldName, fieldValue, targetCapId);
    } else {
        logDebug("Field " + fieldName + " is empty on source record.");
    }
}

function getASIFieldsForRecordType(capId) {
    var capResult = aa.cap.getCap(capId);
    if (!capResult.getSuccess()) {
        logDebug("Unable to get record information.");
        return [];
    }
    var cap = capResult.getOutput();
    var recordType = cap.getCapType().toString();
    logDebug("Record Type: " + recordType);
    for (var i = 0; i < asiFieldsByRecordType.length; i++) {
        if (recordType.indexOf(asiFieldsByRecordType[i].recordTypeContains) > -1) {
            logDebug("Matched record type: " + asiFieldsByRecordType[i].recordTypeContains);
            return asiFieldsByRecordType[i].fields;
        }
    }
    logDebug("No ASI field mapping found for: " + recordType);
    return [];
}

function getAppSpecific(itemName,itemCap)  {
	var updated = false;
	var i=0;
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

function editAppSpecific(itemName,itemValue,capId) {
	var itemCap = capId;
	var itemGroup = null;
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);
	if (appSpecInfoResult.getSuccess())
	 {
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue; 
	} 	
	else
		{ logDebug( "WARNING: " + itemName + " was not updated."); }
}

function removeASITable(tableName,itemCap)   	{
		RASITcapID = aa.cap.getCap(itemCap).getOutput();
		RASITcapIDString = RASITcapID.getCapModel().getAltID();
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements MUST be strings.
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,itemCap,currentUserID)
	if (!tssmResult.getSuccess())
		{ aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
        else
	aa.print("Successfully removed all rows from ASI Table: " + tableName + " for record " + RASITcapIDString);
}

function CombinedEmissionFactor(itemCap) {
var total = 0;
var DPEF = getAppSpecific("Dispensing/Permeation Emission Factor",itemCap);
var OVREF = getAppSpecific("Other Vapor Releases Emission Factor",itemCap);
var PLEF = getAppSpecific("Pressure Losses Emission Factor",itemCap);
var SPEF = getAppSpecific("Spillage Emission Factor",itemCap);
var TLEF = getAppSpecific("Transfer Losses Emission Factor",itemCap);
 total = String(Number(DPEF) + Number(OVREF) + Number(PLEF) + Number(SPEF) + Number(TLEF));
 editAppSpecific("Combined Emission Factor",total,itemCap);
return total
}

function BSTCombinedEmissionFactor(itemCap) {
var total = 0;
var tp1 = getAppSpecific("Total Product #1 Annual Storage Amount",itemCap);
var tp2 = getAppSpecific("Total Product #2 Annual Storage Amount",itemCap);
var tp3 = getAppSpecific("Total Product #3 Annual Storage Amount",itemCap);
 total = String(Number(tp1) + Number(tp2) + Number(tp3));
  editAppSpecific("Process Rate Units",String("1000 gallons"),itemCap);
  editAppSpecific("Process Rate Unit Code",String("27"),itemCap);
  editAppSpecific("Process Rate",Number(total / 1000).toFixed(7),itemCap);
//logDebug("checkhere: "+ Number(total / 1000).toFixed(7));
return total
}

function updateGDFCriteriaPollutant(destCapId) {
    var calc_total = String( getAppSpecific( "Total amount of gasoline dispensed in calendar year (gallons)", destCapId )    );
    calc_total = calc_total.replace(/,/g, "");
    var CEF = CombinedEmissionFactor(destCapId);
    var CPEGDF = loadASITable( "CRITERIA POLLUTANT EMISSION", destCapId );
    if (!CPEGDF || CPEGDF.length == 0) {
        logDebug("No Criteria Pollutant table found.");
        return;
    }
    var arrEmissionGDF = [];
    // remove existing table before rebuilding
    removeASITable( "CRITERIA POLLUTANT EMISSION", destCapId    );
    for (var x in CPEGDF) {
        var emisrowGDF = CPEGDF[x];
        var row = {};
        var PollutantGDF = String(emisrowGDF["Pollutant"]);
        var EF1GGDF = String(emisrowGDF["EF1 (lb/1,000 gallons)"]);
        var EF1HGDF = String(emisrowGDF["EF1 Hourly Rate (lbs/hr)"]);
        var EFORGGDF = String(emisrowGDF["EF Origin Code"]);
        var HARPGDF = String(emisrowGDF["HARP EF"]);
        var CEGDF = String(emisrowGDF["Control Efficiency"]);
        var EFNOTEGDF = String(emisrowGDF["EF Note/Memo"]);
        var AELBSGDF = String(emisrowGDF["Annual Emissions (lbs)"]);
        var AEOLBGDF = String(emisrowGDF["Annual Emissions Override (lbs)"]);
        var AETONSGDF = String(emisrowGDF["Annual Emissions (tons)"]);
        var CALCGDF = String(emisrowGDF["Calculation Method"]);
        // Recalculate VOC
        if (PollutantGDF == "Volatile Organic Compounds (VOC)") {
            EF1GGDF = Number(CEF).toFixed(7);
            HARPGDF = Number(CEF).toFixed(7);
            EF1HGDF = Number( (CEF * Number(calc_total)) / 8760000 ).toFixed(7);
            AELBSGDF = Number( (CEF * Number(calc_total)) / 1000 ).toFixed(7);
            AETONSGDF = Number( ((CEF * Number(calc_total)) / 1000) / 2000 ).toFixed(10);
        }
        // Override tons if override lbs exists
        if (AEOLBGDF != null && AEOLBGDF != "" && AEOLBGDF != " ") {
            AETONSGDF = Number( Number(AEOLBGDF) / 2000 ).toFixed(10);
        }
        row["Pollutant"] = PollutantGDF;
        row["EF1 (lb/1,000 gallons)"] = EF1GGDF;
        row["EF1 Hourly Rate (lbs/hr)"] = EF1HGDF;
        row["EF Origin Code"] = EFORGGDF;
        row["HARP EF"] = HARPGDF;
        row["Control Efficiency"] = CEGDF || " ";
        row["EF Note/Memo"] = EFNOTEGDF || " ";
        row["Annual Emissions (lbs)"] = AELBSGDF;
        row["Annual Emissions Override (lbs)"] = AEOLBGDF || " ";
        row["Annual Emissions (tons)"] = Number(AETONSGDF).toFixed(10);
        row["Calculation Method"] = CALCGDF;
        arrEmissionGDF.push(row);
    }
    addASITable( "CRITERIA POLLUTANT EMISSION", arrEmissionGDF, destCapId );
    logDebug("Updated GDF Criteria Pollutant Emissions.");
}   
     
function updateBSTCriteriaPollutant(destCapId) {
	var recordType = getRecordType(destCapId);
	logDebug("recordType: " + recordType);
	var CEF = BSTCombinedEmissionFactor(destCapId);
	var calc_total = "";
	var part1 = Number((
    Number(getAppSpecific("Deck Fitting Loss", destCapId)) + Number(getAppSpecific("Deck Seam Loss", destCapId)) + Number(getAppSpecific("Rim Seal Loss", destCapId)) + Number(getAppSpecific("Withdrawl Loss", destCapId)) + Number(getAppSpecific("Gasoline (RVP10) Deck Fitting Loss", destCapId)) + Number(getAppSpecific("Gasoline (RVP10) Deck Seam Loss", destCapId)) + Number(getAppSpecific("Gasoline (RVP10) Rim Seal Loss", destCapId)) + Number(getAppSpecific("Gasoline (RVP10) Withdrawl Loss", destCapId))).toFixed(2));
var part2 = Number(Number(getAppSpecific("Total Product #1 Annual Storage Amount", destCapId)) + Number(getAppSpecific("Total Product #2 Annual Storage Amount", destCapId)) + Number(getAppSpecific("Total Product #3 Annual Storage Amount", destCapId)).toFixed(3));
calc_total =  Number(CEF * Number(part1 / part2).toFixed(5));
//logDebug("part1: " + part1);
var bstharpef = Number(part1 / part2).toFixed(5);
// logDebug("bstharpef: " + bstharpef);
// logDebug("calc: " + calc_total);
// logDebug("Process: " + part2 / 1000);
//logDebug("yes: " + Number((part2 / 1000) * (part1 / part2)).toFixed(6));
    var CPEGDF = loadASITable( "CRITERIA POLLUTANT EMISSION", destCapId );
    if (!CPEGDF || CPEGDF.length == 0) {
        logDebug("No Criteria Pollutant table found.");
        return;
    }
    var arrEmissionGDF = [];
    // remove existing table before rebuilding
    removeASITable( "CRITERIA POLLUTANT EMISSION", destCapId    );
    for (var x in CPEGDF) {
        var emisrowGDF = CPEGDF[x];
        var row = {};
        var PollutantGDF = String(emisrowGDF["Pollutant"]);
        var EF1GGDF = bstharpef;
        var EF1HGDF = Number(bstharpef).toFixed(7);
        var EFORGGDF = emisrowGDF["EF Origin Code"];
        var HARPGDF = emisrowGDF["HARP EF"];
        var CEGDF = emisrowGDF["Control Efficiency"];
        var EFNOTEGDF = emisrowGDF["EF Note/Memo"];
        var AELBSGDF = Number((part2 / 1000) * (part1 / part2)).toFixed(6);
        var AEOLBGDF = emisrowGDF["Annual Emissions Override (lbs)"];
        var AETONSGDF = Number((part2 / 1000) * (part1 / part2)).toFixed(6) / 2000;
        var CALCGDF = emisrowGDF["Calculation Method"];
        // Override tons if override lbs exists
        if (AEOLBGDF != null && AEOLBGDF != "" && AEOLBGDF != " ") {
            AETONSGDF = Number( Number(AEOLBGDF) / 2000 ).toFixed(10);
        }
// logDebug("part1: " + part1);
// logDebug("part2: " + part2);
// logDebug("test value: " + Number(part1 / part2).toFixed(5));
// logDebug("calc_total: " + calc_total);
var ef1test = Number(part1 / part2).toFixed(5);
var ef1hrtest = Number(ef1test * part2 / 1000 / 8760).toFixed(5);
// logDebug("ef1hrtest: "+ ef1hrtest);
// logDebug("PRocessrate: "+ Number(Number(part2 / 1000)/10) + " * ef1hrtest " + ef1hrtest +" should be: " +  Number(Number(part2 / 1000)/10) * ef1hrtest)
var AE= Number(Number(Number(part2 / 1000)/10) * Number(ef1hrtest).toFixed(4));
logDebug("AE should be: "+ AE);
        row["Pollutant"] = PollutantGDF;
        row["EF1 (lbs/1,000 gallons)"] =  ef1test;
		row["EF1 Hourly Rate (lbs/hr.)"] = ef1hrtest;
        row["Emissions Limit"] = blank;
        row["EF Origin Code"] = "4"; //EFORGGDF;
        row["HARP EF"] = HARPGDF;
        row["Control Efficiency"] = CEGDF || " ";
        row["EF Note/Memo"] = EFNOTEGDF || " ";
		row["Annual Emissions (lbs)"] = String(Number(AE).toFixed(6));
		row["Annual Emissions (tons)"] = String(Number(AE / 2000).toFixed(10));
        row["Annual Emissions Override (lbs)"] = AEOLBGDF || " ";
        row["Calculation Method"] = CALCGDF;		
        arrEmissionGDF.push(row);
// logDebug("PollutantGDF: " + PollutantGDF);
// logDebug("ef1lbsgallons: " + ef1test);
// logDebug("ef1hrly: " + ef1hrtest);
// logDebug("emissionlimit: " + blank);
// logDebug("eforigin: " + blank);
// logDebug("harp: " + HARPGDF);
// logDebug("controleffect: " + CEGDF);
// logDebug("EFmemo: " + EFNOTEGDF);
// logDebug("lbs: " + Number((part2 / 1000) * (part1 / part2)).toFixed(6));
// logDebug("override: " + AEOLBGDF);
// logDebug("tons: " + Number((part2 / 1000) * (part1 / part2) /2000).toFixed(10));
// logDebug("calc: " + CALCGDF);
}
// for (var k in row) {
    // logDebug(k + " = [" + row[k] + "]");
// }
    addASITable( "CRITERIA POLLUTANT EMISSION", arrEmissionGDF, destCapId );
    logDebug("Updated GDF/BST Criteria Pollutant Emissions.");
}        
function updateMiscCombustionCriteriaPollutant(thrucapId) {
    var MHIR = getAppSpecific("Max Heat Input Rating (MMBtu/hr)", thrucapId);
    var HRSORFUEL = getAppSpecific("Hours or Fuel", thrucapId);
    var TAHEU = getAppSpecific("Total Annual Hours Equipment Used", thrucapId);
    var fuelType = getAppSpecific("Fuel Type", thrucapId);
    editAppSpecific( "Max Fuel", calcMaxFuelUsage(calcAMHI(thrucapId), fuelType), thrucapId);
    var CPE = loadASITable( "CRITERIA POLLUTANT EMISSION", thrucapId);
    if (!CPE || CPE.length == 0) {
        logDebug("No Criteria Pollutant table found for Misc Combustion");
        return;
    }
    var arrEmission = [];
    removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId );
    for (var x in CPE) {
        var emisrow = CPE[x];
        var row = {};
        var pollutant = String(emisrow["Pollutant"]);
        var EF1G = String(emisrow["EF1 (lb/MMBtu)"]);
        var EFORG = String(emisrow["EF Origin Code"]);
        var CE = String(emisrow["Control Efficiency"]);
        var EFNOTE = String(emisrow["EF Note/Memo"]);
        var overrideLbs = String(emisrow["Annual Emissions Override (lbs)"]);
        var EF1H = Number(EF1G * MHIR).toFixed(5);
        var annualLbs;
        if (HRSORFUEL == "Hours") {
            annualLbs = Number(EF1H * TAHEU).toFixed(5);
        }
        else {
            annualLbs = Number(EF1G * MHIR).toFixed(5);
        }
        var annualTons;
        if (overrideLbs != "" && overrideLbs != " ") { annualTons = Number(Number(overrideLbs) / 2000).toFixed(10);
        }
        else {
            annualTons = Number(Number(annualLbs) / 2000).toFixed(10);
        }
        row["Pollutant"] = pollutant;
        row["EF1 (lb/MMBtu)"] = EF1G;
        row["EF1 Hourly Rate (lbs/hr)"] = EF1H;
        row["EF Origin Code"] = EFORG;
        row["HARP EF"] = EF1G;
        row["Control Efficiency"] = CE || " ";
        row["EF Note/Memo"] = EFNOTE || " ";
        row["Emissions Limit"] =  blank;
        row["Annual Emissions (lbs)"] = annualLbs;
        row["Annual Emissions Override (lbs)"] = overrideLbs || " ";
        row["Annual Emissions (tons)"] = annualTons;
        row["Calculation Method"] = String(emisrow["Calculation Method"]);
        arrEmission.push(row);
    }
    addASITable("CRITERIA POLLUTANT EMISSION", arrEmission, thrucapId);
    logDebug("Updated Misc Combustion Criteria Pollutants.");
}

function updateEngineCriteriaPollutant(thrucapId) {
    var MHIR = getAppSpecific("Max Heat Input Rating (MMBtu/hr)", thrucapId );
    var MRHP = getAppSpecific("Max Rated Horsepower (bhp)", thrucapId );
    var cal_tot = calccalendartotal(thrucapId);
    var CPE = loadASITable( "CRITERIA POLLUTANT EMISSION", thrucapId );
    if (!CPE || CPE.length == 0) {
        logDebug("No Criteria Pollutant table found for Engine");
        return;
    }
    var arrEmission = [];
    removeASITable( "CRITERIA POLLUTANT EMISSION", thrucapId );
    for (var x in CPE) {
        var emisrow = CPE[x];
        var row = {};
        var pollutant = String(emisrow["Pollutant"]);
        var EF1 = String(emisrow["EF1 (g/bhp-hr)"]);
        var EF2 = String(emisrow["EF2 (lb/MMBtu)"]);
        var EF1Hourly = 0;
        var EF2Hourly = 0;
        if (EF1 != "") {EF1Hourly = Number((MRHP * EF1) / 453.59);}
        if (EF2 != "") {EF2Hourly = Number(MHIR * EF2);}
        var hourlyRate = Math.max(EF1Hourly,EF2Hourly);
        var annualLbs = Number(hourlyRate * cal_tot).toFixed(5);
        var annualTons = Number(annualLbs / 2000).toFixed(10);
        row["Pollutant"] = pollutant;
        row["EF1 (g/bhp-hr)"] = EF1;
        row["EF2 (lb/MMBtu)"] = EF2;
        row["EF1 Hourly Rate (lbs/hr)"] = EF1Hourly.toFixed(5);
        row["EF2 Hourly Rate (lbs/hr)"] = EF2Hourly.toFixed(5);
        row["Annual Emissions (lbs)"] = annualLbs;
        row["Annual Emissions (tons)"] = annualTons;
        row["HARP EF"] = Number(hourlyRate).toFixed(5);
		row["Control Efficiency"] = String(blank);
		row["EF Note/Memo"] = String(blank);
		row["Annual Emissions Override (lbs)"] = String(blank);
		row["Emissions Limit"] = String(blank);
        row["EF Origin Code"] = String(emisrow["EF Origin Code"]);
        row["Calculation Method"] = String(emisrow["Calculation Method"]);
		// logDebug("EF1Hourly: " + EF1Hourly);
		// logDebug("EF2Hourly: " + EF2Hourly);
		// logDebug("cal_tot: " + cal_tot);
		// logDebug("annualLbs: " + annualLbs);
        arrEmission.push(row);
    }
    addASITable("CRITERIA POLLUTANT EMISSION",arrEmission,thrucapId);
    logDebug("Updated Engine Criteria Pollutants.");
}

function updateCoffeeCriteriaPollutant(destCapId) {
    logDebug("Updating Coffee Criteria Pollutant Emissions");
    var LBCOFF = getAppSpecific("The total pounds of coffee", destCapId);
	LBCOFF = Number(String(LBCOFF || "0").replace(/,/g, ""));
	editAppSpecific("The total pounds of coffee", LBCOFF, destCapId);
	logDebug("LBCOFF: " + LBCOFF);
    var calc_total = CalcTotalHours(destCapId);
	    calc_total = calc_total.replace(/,/g, "");
		logDebug("calc_total: " + calc_total);
	var procrate = Number(LBCOFF / 2000).toFixed(2);
	logDebug("procrate: " + procrate);
// var annualmaxheat = [ASI::DISTRICT DATA::Max Heat Input Rating (MMBtu/hr)]*[ASI::COFFEE ROASTING THROUGHPUT::Total Combustion Hours]
// var annualmaxfuel = [ASI::COFFEE ROASTING THROUGHPUT::Total Combustion Hours]*[ASI::DISTRICT DATA::Max Hourly Fuel Usage]
    var CPECOFF = loadASITable("CRITERIA POLLUTANT EMISSION", destCapId);
    if (!CPECOFF || CPECOFF.length == 0) {
        logDebug("No Criteria Pollutant table found.");
        return;
    }
    var arrEmissionCOFF = [];
    removeASITable("CRITERIA POLLUTANT EMISSION", destCapId);
    for (var x in CPECOFF) {
        var emisrowCOFF = CPECOFF[x];
        var row = {};
        var PollutantCOFF = emisrowCOFF["Pollutant"];
        var EF1GCOFF = Number(emisrowCOFF["EF (lbs/ton)"]);
        var EF1HCOFF = 0;
        var EFORGCOFF = emisrowCOFF["EF Origin Code"];
        var HARPCOFF = emisrowCOFF["HARP EF"];
        var CECOFF = emisrowCOFF["Control Efficiency"];
        var EFNOTECOFF = emisrowCOFF["EF Note/Memo"];
        var AEOLBCOFF = emisrowCOFF["Annual Emissions Override (lbs)"];
        var CALCCOFF = emisrowCOFF["Calculation Method"];
        var EMISLIMCOFF = emisrowCOFF["Emissions Limit"];
        // Hourly EF
			if (CECOFF != null && CECOFF != "" && CECOFF != " ") {
				logDebug("Using Control Efficiency: " + CECOFF);
				EF1HCOFF = Number((EF1GCOFF * LBCOFF / 2000) * ((100 - Number(CECOFF)) / 100) / calc_total ).toFixed(5);
				logDebug("EF1HCOFF (with CE): " + EF1HCOFF);
			}
			else {
				EF1HCOFF = Number( (EF1GCOFF * LBCOFF / 2000) / calc_total ).toFixed(5);
				logDebug("EF1HCOFF (no CE): " + EF1HCOFF);
			}
		logDebug("CECOFF: " + CECOFF);
        // Annual lbs
        var AELBSCOFF = "0.00000";
        if (Number(calc_total) != 0) {
            AELBSCOFF = Number(Number(EF1HCOFF) * Number(calc_total)).toFixed(5);
			logDebug("should be here");
			logDebug("AELBSCOFF: " + AELBSCOFF);		
        }
        // Annual tons
        var AETONSCOFF = Number(Number(AELBSCOFF) / 2000).toFixed(10);
        // Override
        if (AEOLBCOFF != null && AEOLBCOFF != "" && AEOLBCOFF != " ") {
            AETONSCOFF = Number(Number(AEOLBCOFF) / 2000).toFixed(10);
        }
		logDebug("AETONSCOFF: " + AETONSCOFF);		
		logDebug("AEOLBCOFF: " + AEOLBCOFF);		
        row["Pollutant"] = PollutantCOFF;
        row["EF (lbs/ton)"] = Number(EF1GCOFF).toFixed(5);
        row["EF Hourly Rate (lbs/hr)"] = EF1HCOFF;
        row["Emissions Limit"] = EMISLIMCOFF || " ";
        row["EF Origin Code"] = EFORGCOFF;
        row["HARP EF"] = HARPCOFF;
        row["Control Efficiency"] = CECOFF || " ";
        row["EF Note/Memo"] = EFNOTECOFF || " ";
        row["Annual Emissions (lbs)"] = AELBSCOFF;
        row["Annual Emissions Override (lbs)"] = AEOLBCOFF || " ";
        row["Annual Emissions (tons)"] = AETONSCOFF;
        row["Calculation Method"] = CALCCOFF;
        arrEmissionCOFF.push(row);
    }
    addASITable("CRITERIA POLLUTANT EMISSION", arrEmissionCOFF, destCapId);
    logDebug("Updated Coffee Criteria Pollutant Emissions.");
}

function loadASITable(tname,itemCap) {
		LASITcapID = aa.cap.getCap(itemCap).getOutput();
		LASITcapIDString = LASITcapID.getCapModel().getAltID();
 	//
 	// Returns a single ASI Table array of arrays
	// Optional parameter, cap ID to load from
	//
	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();
	while (tai.hasNext())
	  {
	  var tsm = tai.next();
	  var tn = tsm.getTableName();
      if (!tn.equals(tname)) continue;
	  if (tsm.rowIndex.isEmpty())
	  	{
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}
   	  var tempObject = new Array();
	  var tempArray = new Array();
  	  logDebug("Loading ASI Table " + tname + " for record " + LASITcapIDString);
  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
      var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
	  var numrows = 1;
	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		if (readOnlyi.hasNext()) {
			readOnly = readOnlyi.next();
		}
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;
		}
		tempArray.push(tempObject);  // end of record
	  }
	  return tempArray;
}	
	
function calccalendartotal(itemCap){
var total = 0;
var begin = getAppSpecific("Hour meter reading at the beginning of the calendar year",itemCap);
var end = getAppSpecific("Hour meter reading at the end of the calendar year",itemCap);
		if(begin != null && begin != "" && end != null && end != "")
		{
		total = String(Number(end - begin).toFixed(2));
		editAppSpecific("Total hours of operation during this calendar year",total,itemCap)
		editAppSpecific("Process Rate",total,itemCap);
		}
	return total		
}

function recordExists(altId) {
    var capResult = aa.cap.getCapID(altId);
    return capResult.getSuccess() && capResult.getOutput() != null;
}

function getPreviousTP(altId, yearsBack) {
    yearsBack = yearsBack || 1;
    return altId.replace(/^TP(\d{2})-/i, function(match, year) {
        var prevYear = parseInt(year, 10) - yearsBack;
        return "TP" + (prevYear < 10 ? "0" + prevYear : prevYear) + "-";
    });
}

function calcAMHI(itemCap){
var value = 0;
var fuel_hhv_other = getAppSpecific('If "Biogas/Digester Gas" or "Other" is selected as the fuel type, please include energy content of',itemCap);
var fuel_tot = getAppSpecific("Total amount of fuel used by the permitted equipment during the reporting calendar year", itemCap);
fuel_tot = Number(String(fuel_tot).replace(/,/g, ""));
editAppSpecific("Total amount of fuel used by the permitted equipment during the reporting calendar year",String(fuel_tot),itemCap);
var fuel_units = getAppSpecific("Select units of reported fuel usage",itemCap);
var fuel_type = getAppSpecific("What type of fuel does the permitted equipment use",itemCap);
	if(fuel_units == "MMBtu")
	{
				value = String(fuel_tot);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot).toFixed(2)),itemCap);
	}	
	if(fuel_units == "MMscf" && fuel_type == "Natural Gas")
	{
				value = String(fuel_tot * 1020);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * 1020),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * 1020).toFixed(2)),itemCap);
	}	
	if(fuel_units == "Therms" && fuel_type == "Natural Gas")
	{
				value = String(fuel_tot * 0.1);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * 0.1),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * 0.1).toFixed(2)),itemCap);
	}
	if(fuel_units == "Gallons" && fuel_type == "LPG (Propane)")
	{
				value = String(fuel_tot * .0905);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * .0905),itemCap);
				editAppSpecific("Process Rate",String(Number(fuel_tot * .0905).toFixed(2)),itemCap);
	}
	if(fuel_units == "Gallons" && fuel_type == "Diesel")
	{
				value = String(fuel_tot * .137);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * .137),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * .137).toFixed(2)),itemCap);
	}
	if(fuel_units != "MMBtu" && fuel_units != "" && fuel_units != null && (fuel_type == "Biogas/Digester Gas" || fuel_type == "Other"))
	{
		value = String(fuel_tot * .000001);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * .000001),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * .000001).toFixed(2)),itemCap);

	}
	return value;
}

function calcMaxFuelUsage(heatInput, fuelType) {
    var btuPerUnit = 0;
    if (fuelType == "Natural Gas") {
        btuPerUnit = 1020;       // Btu/scf
    }
    else if (fuelType == "Diesel") {
        btuPerUnit = 137000;     // Btu/gallon
    }
    else if (fuelType == "Propane") {
        btuPerUnit = 91500;      // Btu/gallon
    }
    else {
        return null;
    }
    return Number((heatInput * 1000000 / btuPerUnit).toFixed(3));
}

function calcMaxHourlyFuelUsage(heatInput, fuelType) {
    var btuPerUnit = 0;
    if (fuelType == "Natural Gas") {
        btuPerUnit = 1020;        // Btu/scf
    }
    else if (fuelType == "Diesel") {
        btuPerUnit = 137000;      // Btu/gallon
    }
    else if (fuelType == "Propane") {
        btuPerUnit = 91500;       // Btu/gallon
    }
    else if (fuelType == "Fuel Oil") {
        btuPerUnit = 140000;      // Btu/gallon
    }
    else {
        logDebug("Unknown fuel type: " + fuelType);
        return null;
    }
    if (heatInput == null || heatInput == "" || isNaN(heatInput)) {
        logDebug("Invalid Heat Input: " + heatInput);
        return null;
    }
    return Number(
        ((Number(heatInput) * 1000000) / btuPerUnit)
        .toFixed(3)
    );
}

function getParentPlacer(childcapid) 	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(childcapid,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			aa.print( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		aa.print( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
}
	
function CalcTotalHours(itemCap) {
                var total = 0;
                var APR = getAppSpecific("Apr",itemCap);
                var AUG = getAppSpecific("Aug",itemCap);
                var DEC = getAppSpecific("Dec",itemCap);
                var FEB = getAppSpecific("Feb",itemCap);
                var JAN = getAppSpecific("Jan",itemCap);
                var JUL = getAppSpecific("July",itemCap);
                var JUN = getAppSpecific("Jun",itemCap);
                var MAR = getAppSpecific("Mar",itemCap);
                var MAY = getAppSpecific("May",itemCap);
                var NOV = getAppSpecific("Nov",itemCap);
                var OCT = getAppSpecific("Oct",itemCap);
                var SEPT = getAppSpecific("Sept",itemCap);
                total = String(Number(Number(APR)+Number(AUG)+Number(DEC)+Number(FEB)+Number(JAN)+Number(JUL)+Number(JUN)+Number(MAR)+Number(MAY)+Number(NOV)+Number(OCT)+Number(SEPT)).toFixed(2));
                editAppSpecific("Total",total,itemCap);
                return total;
}

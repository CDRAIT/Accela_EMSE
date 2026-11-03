var showDebug = true; 
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var senderEmailAddr = "placercounty_noreply@accela.com";                              
var emailAddress = "rmoore@placer.ca.gov";                                      	
var emailAddress2 = "";                                            
var emailText = "";     
var currentUserID = "ADMIN";
var sourceTP = "TP25-GLAD-12-01-01";
var destTP = [

"TP25-GLAD-12-04-01",
"TP25-GLAD-12-05-01",
"TP25-GLAD-12-06-01"
];


var result = copytoxics(sourceTP, destTP);


function copytoxics(pFromAltId, pToAltId) {
    var capCount = 0;
    // Lookup source CapID
    var fromCapResult = aa.cap.getCapID(pFromAltId);
    if (!fromCapResult.getSuccess()) {
        logDebug("Source record not found: " + pFromAltId);
        return 0;
    }
    var fromCapId = fromCapResult.getOutput();
    // Make sure destination is an array
    if (!(pToAltId instanceof Array)) {
        pToAltId = [pToAltId];
    }
    // Loop through each destination record
    for (var i = 0; i < pToAltId.length; i++) {
        var destAltId = pToAltId[i];
        logDebug("Processing destination " + (i + 1) + " of " + pToAltId.length + ": " + destAltId);
        var toCapResult = aa.cap.getCapID(destAltId);
        if (!toCapResult.getSuccess()) {
            logDebug("Target record not found: " + destAltId);
            continue;
        }
        var toCapId = toCapResult.getOutput();
        logDebug("Copying ASI Table from " + pFromAltId + " to " + destAltId);
        copySpecificASITable( "TOXIC POLLUTANT EMISSION", fromCapId, toCapId );
        capCount++;
    }
    return capCount;
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
				//fld_readonly.add(null);
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

	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
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

logDebug("Result of copytoxics: " + result);

/*------------------------------------------------------------------------------------------------------/
| Program : ASIUA:HazVeg/Hazardous Vegetation/NA/NA 
| Event   : ApplicationSpecificInfoUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Application specific update after for this record type
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 11/11/2020 Created script
|         : Abe   06/01/2023 Added "Complaint Received" auto-complete regarding ASI value
|           
|		
|        
|
/------------------------------------------------------------------------------------------------------*/


// Check for Time Tracking entries and update table
if(typeof(TIMETRACKING == "object")) {
	logDebug("Processing Time Tracking table");
	var myTable = new Array();
	var numEnt = "";
	var thisAmt = 0;
	var costTotal = 0;
	myTable = (loadASITable,TIMETRACKING);
	var numRows = myTable.length;
	logDebug("table length = " + numRows);
	numEnt = TIMETRACKING.length;
	logDebug("Number of rows = " + numEnt);
	
	for (thisRow in myTable) {
		logDebug("this amount = " + myTable[thisRow]["Cost"]);
		thisAmt = myTable[thisRow]["Cost"] *1;
		
		costTotal = (thisAmt * 1) + costTotal * 1;
		realNum = parseFloat(costTotal);
		costTotal = realNum.toFixed(2);
		logDebug("real num is : " + realNum);
		logDebug("Cost total = " + costTotal);
		myTable[thisRow]["Running Total"] = costTotal.toString();
		logDebug("Running Total = " + myTable[thisRow]["Running Total"]);
	}
	removeASITable("TIMETRACKING");
    addASITable("TIMETRACKING",myTable);
	editAppSpecific("Charges to Date",costTotal);
}


//Abe>> 06/01/2023: Auto-complete per ASI field

if(AInfo["Received via"] == "Officer")
    if(isTaskActive("Complaint Received")){
        branchTask("Complaint Received", "Reviewed - Accepted", "Closed by script - Case initiated by officer", "Officer Initiated");
        assignTask("Inspection", "EMAXWELL");
    }
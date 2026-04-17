/*=============================================================================================
| Program : ASA:ESD/~/~/~
|
| Event   : ApplicationSpecificUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/19/2021 created production version 
|         : TDunn 01/11/2022 updated to logic for adding fees on NOT publicUser
|         : TDunn 04/16/2026 Excluded Improvement Plan from Tech fee         
|
/=============================================================================================*/
showDebug = false; showMessage = false;

if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:ESD");

var varAutoInvoiceFees = "N"
var slFlags = "";
var slFlagCodes = new Array();
var slFeeSched = "SP_PLACER_VINEYARDS";
var slFeeList ="";
var slFeeArray = new Array();
var feeName = "";
var thisQty = 1;
var thisScope = getAppSpecific("Scope of Work");
var thisADU = ""; 
var addFeeFlag = true;
var slLookupTable = "sdl:Land Use Codes";
if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
	slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
	
	slFlagCodes = slFlags.split(";");
	// MARIPOSA SEWER REIMBURSEMENT FLAG; PVLDRAAC	
	for(thisFlag in slFlagCodes) {
		luCode = slFlagCodes[thisFlag];
		newCode = luCode.trim();
		logDebug("This flag is " + newCode);
		if(newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
			logDebug("Trying to add condition");
			addStdCondition("Env. Engineering - Notification","Reimbursement Agreements for Sewer");
		}
	}
}
if(!publicUser) {
	if(matches(appTypeArray[1],"Grading Permit")) {
		addFee("DPEXEMPVER","ESD","FINAL",1,"N"); 
		addFee("DPGP","ESD","FINAL",1,"N");
	}
	if(matches(appTypeArray[1],"Record of Survey")) {
		addFee("DPROS","ESD","FINAL",1,"N");
	}
	// Adding new TECH fee
	if(matches(appTypeArray[1],"Final Subdivision Map","Grading Permit","Improvement Plan Revision","Parcel Map","Record of Survey")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
}


	
/*

*/
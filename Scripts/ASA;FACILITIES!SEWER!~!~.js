/*=============================================================================================
| Program : ASA:Facilities/Sewer/~/~
|
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : ASA script for all Facilities Sewer records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/21/2021 created production version 
|         
|
/=============================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:Facilities/Sewer");
var varAutoInvoiceFees = "N"

// Adding new TECH fee
if(matches(appTypeArray[2],"Permit")){
	updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
}
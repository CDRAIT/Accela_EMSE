/*=============================================================================================
| Program : ASA:PublicWorks/~/~/~
|
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : ASA script for designate PublicWorks Records record types.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/21/2021 created dev version.
|         : TDunn 01/11/2022 update autoInvoice variable for encroachment
|         
|
/=============================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:PublicWorks");
var varAutoInvoiceFees = "N"

// Adding new TECH fee
if(!publicUser && matches(appTypeArray[1],"Abandonment","Ag Sign","Encroachment","Transportation Permit")){
	addFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
}
/*======================================================================================/
| Program : ASA;HazVeg!Hazardous Vegetation!~!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all HazVeg records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 10/15/2020 created script
|
/==========================================================================================*/

if(currentUserID == "TDUNN") {
	showDebug = true;
}
// Set received date in custom Fields
logDebug("Should be updating Complaint date");
editAppSpecific("Complaint / Request Received",dateAdd(null,0));
/*===========================================================================================/
| Program : ASA;HazVeg!Defensible Space!~!~
|
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : 
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 01/30/2025 Created IT Req# 2060 
|         
|
/=============================================================================================*/
showDebug = false; showMessage = false;

if (matches(currentUserID, "EAFTAHI")) {
	showDebug = 1;
}

if (AInfo["ParcelAttribute.BLDRESPONSE"] == "Auburn")
	editAppSpecific("Project Office", "Auburn");
else if (AInfo["ParcelAttribute.BLDRESPONSE"] == "Tahoe")
	editAppSpecific("Project Office", "Tahoe");

if (publicUser) {
	editAppSpecific("Received via", "Online");

}
else
	sendAcknowledgementLtr2Applicant();


/*=========================================================================================================
| Program : ASIUA;TRPA!Building!~!~
| Event   : ApplicationSpecificInfoUpdateAfter
|
| Client  : Placer County, CA
| Usage   : ApplicationSpecificInfoUpdateAfter for all TRPA Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   04/29/2024 created script
|         : Abe   04/29/2024 IT Request# 1998 & 1865 Adding Ad-Hoc tasks ADU Review and Addressing to the ADU/JADUs
|         : Abe   01/16/2025 IT Request# 2221 - SB937 - Fee Deferral
|
/==========================================================================================================*/
if(matches(currentUserID,"TDUNN","EAFTAHI")) {
	showDebug = 1;
}


//IT Request# 1998 & 1865 
var thisADU = "";
var thisJADU = "";
var hasAddressing = false;
var hasAduReview = false;

if (matches(appTypeArray[3], "Project", "TRPA Review at TRPA")) {
	thisADU = getAppSpecific("ADU Required");
	thisJADU = getAppSpecific("JADU Required");
}


//checks if Ad-hocs already exists
var wfTaskResults = aa.workflow.getTasks(capId);
if (wfTaskResults.getSuccess())
	var wfTask = wfTaskResults.getOutput();
else
	logDebug("**ERROR: Failed to get workflow object: " + wfTaskResults.getErrorMessage());
for (i in wfTask) {
	var tempTask = wfTask[i];
	if (tempTask.getTaskDescription().toUpperCase().equals("addressing".toUpperCase()))
		hasAddressing = true;
	if (tempTask.getTaskDescription().toUpperCase().equals("ADU Review".toUpperCase()))
		hasAduReview = true;
}
if (thisADU == "Yes" || thisJADU == "Yes") {
	if (!hasAddressing)
		addAdHocTask("ADHOC", "Addressing", "", "LDEROBER");
	if (!hasAduReview)
		addAdHocTask("ADHOC", "ADU Review", "", "TLYKINS");
}
//End Of IT Request# 1998 & 1865



//IT Req# 2221 Fee deferral - SB937 
var isQualified = false;

if (appTypeArray[2] == "Multi-Family" && matches(appTypeArray[3], "Project", "TRPA Review at TRPA"))
    if ((getAppSpecific("Type of Work") == "Manufactured Home" && (matches(getAppSpecific("Scope of Work"), "Manufactured Home on Foundation", "Manufactured Home on Piers", "Manufactured Home Secondary"))) ||
        (getAppSpecific("Type of Work") == "New" && (matches(getAppSpecific("Scope of Work"), "Accessory Dwelling Unit", "Junior Accessory Dwelling Unit", "Single Family > 3000"))))
        isQualified = true;

if (appTypeArray[2] == "Non-Residential" && matches(appTypeArray[3], "TRPA Review at TRPA"))
    if ((matches(getAppSpecific("Type of Work"), "Addition", "New", "Rebuild") && (matches(getAppSpecific("Scope of Work"), "Apartment", "Hotel Motel", "Townhome", "Convalescent or Home for the Elderly", "Dormatory or Employee Housing"))))
        isQualified = true;

if (appTypeArray[2] == "Residential" && appTypeArray[3] == "Project")
    if ((getAppSpecific("Type of Work") == "Addition" && getAppSpecific("Scope of Work") == "Residential Addition > 3000") ||
        (getAppSpecific("Type of Work") == "Manufactured Home" && matches(getAppSpecific("Scope of Work"), "Manufactured Home on Foundation", "Manufactured Home on Piers", "Manufactured Home Secondary")) ||
        (getAppSpecific("Type of Work") == "New" && matches(getAppSpecific("Scope of Work"), "Accessory Dwelling Unit", "Junior Accessory Dwelling Unit", "Single Family > 3000")) ||
        (getAppSpecific("Type of Work") == "Rebuild" && getAppSpecific("Scope of Work") == "Residential Rebuild"))
        isQualified = true;

if (isQualified && getAppSpecific("YesToFeeDeferral") == "CHECKED")
    if (!(appHasCondition("Building - Prevent Final / Completion", "Applied", "SB-937 Mitigation Fee Act", "Notice") || appHasCondition("Building - Prevent Final / Completion", "Cleared", "SB-937 Mitigation Fee Act", "Notice")))
        addStdCondition("Building - Prevent Final / Completion", "SB-937 Mitigation Fee Act");

//End of IT Req# 2221 Fee deferral - SB937 

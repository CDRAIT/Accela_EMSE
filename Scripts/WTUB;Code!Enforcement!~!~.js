/*------------------------------------------------------------------------------------------------------/
| Program : WTUB;Code!Enforcement!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update Before for all Code Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 10/22/2025 created script 
|           EAFTAHI 10/21/2025 Added IT Request# 1675 - New Code Compliance WF
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("In the WTUB:Code/Enforcement/*/* ...");
showMessage = false;

if (wfTask == "Citation") {
    if (wfStatus == "Citation") {
        var vCitationRecc = getAppSpecific("Number_of_Citations");
        if (vCitationRecc + 1 < 4)
            editAppSpecific("Number_of_Citations", vCitationRecc + 1);
        else {
            showMessage = true;
            customComment("Error - Three citations already applied to this complaint!");
            cancle = true;
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
| Program : ASA;Code!Enforcement!~!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : ASA for all Code Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 06/24/2026 Created the branch
|         : Abe 06/24/2026 IT Request# 1675 - Code Enforcement New Workflow
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("Running ASA:Code/Enforcement/*/* ...");

//For test purposes only, to be removed after testing
if (matches(currentUserID,"EAFTAHI", "KFULKERS")) {
    if (!publicUser) {
        //Modify function for the CODE Enforcement
        sendAcknowledgementLtr2Applicant();
    }
}
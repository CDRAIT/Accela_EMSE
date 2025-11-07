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
| Notes   : EAFTAHI 10/01/2025 Created the branch
|            EAFTAHI 10/01/2025 Added IT Request# 1675 - New Code Compliance WF
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("In the ASA:Code/Enforcement/*/* ...");

if(!publicUser){
    //Modify function for the CODE Enforcement
    sendAcknowledgementLtr2Applicant();
}
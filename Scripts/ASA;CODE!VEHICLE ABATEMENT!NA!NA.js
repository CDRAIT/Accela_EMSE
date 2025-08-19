/*------------------------------------------------------------------------------------------------------/
| Program : ASA;Code!Vehicle Abatement!~!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : application Submit after for all Vehicle Abatement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 05/13/2024 created script
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("Executing EMSE ASA:Code/Vehicle Abatement/*/* ...");


if(!publicUser){
	sendAcknowledgementLtr2Applicant();
}
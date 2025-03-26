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

var reportName = 'Vehicle Acknowledgement Letter';
var reportModule = 'Code';
var reportParams = aa.util.newHashMap();
addParameter(reportParams, "RecordID", capIDString);

var templateEmail = 'VA_GENERAL_TEMPLATE';
var emailParams = aa.util.newHashtable();
addParameter(emailParams, "$$altID$$", capIDString);
addParameter(emailParams, "$$emailSubject$$", "ACKNOWLEDGMENT OF VEHICLE ABATEMENT REQUEST");

var sendAckEmail = false;
var compEmail = getAppSpecific("Complainant Email");
if (compEmail != 'Undefined' && compEmail != "" && compEmail != " " && compEmail != null)
	if (compEmail.indexOf('@') != -1)
		sendAckEmail = true;

if (!publicUser) {
	var reportFile = null;
	reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Acknowledgement_Letter.pdf");
	if (sendAckEmail)
		sendNotification("", compEmail, "", templateEmail, emailParams, new Array(reportFile));
}



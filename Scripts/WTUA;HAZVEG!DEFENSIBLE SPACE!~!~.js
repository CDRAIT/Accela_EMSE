/*===========================================================================================/
| Program : WTUA;HazVeg!Defensible Space!~!~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : 
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 12/12/2024 Created
|         
|
/=============================================================================================*/
showDebug = false;
showMessage = false;

if (matches(currentUserID, "EAFTAHI")) {
    showDebug = 1;
}

var reportName = "";
var reportParams = aa.util.newHashMap();
addParameter(reportParams, "altID", capIDString);
var reportModule = "HazVeg";
var reportFile = null;
var reportFileName = "";
var createReportSendEmail = false;

var emailFrom = "noreply@placer.ca.gov";
var emailTo = getAppSpecific("Complainant Email");
var emailCC = "";

var emailTemp = "H_DEF_GENERAL_EMAIL_TEMPLATE";
var emailParams = aa.util.newHashtable();
addParameter(emailParams, "$$altID$$", capIDString);


if (wfTask == "Eligibility Inspection") {
    if (wfStatus == "Ineligible") {
        //send Ineligibility to the applicant
        reportFileName = "Ineligibility_Letter_Case# " + capIDString + ".pdf";
        reportName = "DEF Ineligibility Ltr";
        addParameter(emailParams, "$$emailSubject$$", "Ineligibility Letter");
        createReportSendEmail = true;
    }

    if (wfStatus == "Eligible")
        editAppSpecific("send OES Date", wfDateMMDDYYYY);
}

if (wfTask == "OES Approval") {
    if (wfStatus == "Denied") {
        reportName = "DEF Denial Ltr";
        reportFileName = "Denial_Letter_Case# " + capIDString + ".pdf"
        addParameter(emailParams, "$$emailSubject$$", "Denial Letter");
        createReportSendEmail = true;
    }
    if (wfStatus == "Approved") {
        reportName = "DEF Approval Ltr";
        reportFileName = "Approval_Letter_Case# " + capIDString + ".pdf";
        addParameter(emailParams, "$$emailSubject$$", "Approval Letter");
        createReportSendEmail = true;
    }
}

if (createReportSendEmail) {
    reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, reportFileName);
    if (!(isEmptyOrNull(emailTo)) && emailTo.indexOf('@') != -1)
        sendResults = sendNotification(emailFrom, emailTo, emailCC, emailTemp, emailParams, new Array(reportFile));

}
/*------------------------------------------------------------------------------------------------------/
| Program : DUA:ESD/NA/NA/NA
| Event   : DocumentUploadAfter
|
| Client  : Placer County, CA
| Usage   : Document Upload After for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|  
|   Notes : Abe 04/10/2024 Initialized EMSE 3.0 version.
|         : Abe 04/10/2024 IT Request# 2030 - ESD Grading Permit: send file upload notification 
/------------------------------------------------------------------------------------------------------*/

if (matches(currentUserID, "EAFTAHI")) { showDebug = 1; }

logDebug("Inside DUA:ESD/*/*/* script...");

//IT Request# 2030
var isAppSubmittalComplete = false;
var workflowResult = aa.workflow.getTasks(capId);
if (workflowResult.getSuccess())
	wfObj = workflowResult.getOutput();
else
	logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());

for (i in wfObj) {
	fTask = wfObj[i];
	if (fTask.getTaskDescription().toUpperCase().equals("Application Submittal".toUpperCase()) && fTask.getCompleteFlag().equals("Y")) {
		isAppSubmittalComplete = true;
		break;
	}
}

//Email contents 
toEmail = "jpeacock@placer.ca.gov";
ccEmail = "eaftahi@placer.ca.gov";
var emailSubject = "Document is uploaded to the application - " + capIDString + " (" + capName + ")";
var emailContent = "Following file(s) attached to the application:<br><br>";

var newDocModelArray = documentModelArray.toArray();
for (dl in newDocModelArray) {
	// logDebug("Document type = " + newDocModelArray[dl]["docCategory"]);
	// logDebug("File Name = " + newDocModelArray[dl]["fileName"]);
	// logDebug("Doc Name = " + newDocModelArray[dl]["docName"]);
	// logDebug("Uploaded By = " + newDocModelArray[dl]["fileUpLoadBy"]);
	// logDebug("Doc Desc = " + newDocModelArray[dl]["docDescription"]);

	//building email content 
	emailContent += "File Name: " + newDocModelArray[dl]["fileName"] + "<br>";
	emailContent += "File Description: " + newDocModelArray[dl]["docDescription"] + "<br>";
	emailContent += "************************************************************<br>"
}

if (publicUser && appTypeArray[1] == 'Grading Permit' && isAppSubmittalComplete) {
	// if (appTypeArray[1] == 'Grading Permit' && isAppSubmittalComplete) {
	var mailResults = aa.sendMail("noreply@placer.ca.gov", toEmail, ccEmail, emailSubject, emailContent);
	//var emaiResults = aa.sendEmail("noreply@placer.ca.gov", "eaftahi@placer.ca.gov", "", emailSubject, emailContent, debug);
	if (!mailResults.getSuccess())
		logDebug("***Email failed = " + mailResults.getErrorMessage());
}

//End of IT request# 2030
/*=============================================================================================
| Program : ASA:Planning/Inquiry/Achievable Housing/NA
|
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : ASA script for all Planning Inquiry records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   
|         : Abe   06/22/2026  Added IT Request # 2887    Added the branch
|         
|
/=============================================================================================*/
showDebug = false; showMessage = false;

if(currentUserID == "EAFTAHI") {
	showDebug = 1;
}
logDebug("Running ASA:Planning/Inquiry/Achievable Housing ...");


//IT Request # 2887 - PLN Housing - 
if (!publicUser) {
	if (AInfo['ParcelAttribute.BLDRESPONSE'] == "Tahoe") {
		editAppSpecific("Project Office", "Tahoe");
	} else {
		editAppSpecific("Project Office", "Auburn");
	}

	
    var emailTemplate = "MESSAGE_RECEIPT_PLANNING";
    var emailParams = aa.util.newHashtable();
    var emailTo = getAppSpecific("Project Office") == "Tahoe" ? "onlinePlnPermitsTahoe@placer.ca.gov" : "onlinePlnPermits@placer.ca.gov";
    var emailCc = "";    
    
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$capName$$", capName);
    addParameter(emailParams, "$$fileDate$$", fileDate);

    var result = sendNotification(defaultFrom, emailTo, emailCc, emailTemplate, emailParams, null);

}

//End of IT Request # 2887




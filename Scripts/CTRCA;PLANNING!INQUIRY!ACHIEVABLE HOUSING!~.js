/*===========================================================================================/
| Program : CTRCA:Planning/Inquiry/Achievable Housing/~.js
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : CTRCA script for all Planning Inquiry records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   06/22/2026 Created the branch 
|         : Abe   06/22/2026 Added the IT Request # 2887 - Achievable Housing Interest Form and uploaded to gitHub
|
|         
|
/=============================================================================================*/
if (matches(currentUserID, "EAFTAHI")) { showDebug = 1; }
logDebug(" Running CTRCA:Planning/Inquiry/Achievable Housing/~ ...");
    

if (publicUser) {
    var emailTemplate = "PLN_HOUSING_INQUIRY_RECEIPT_NOTIFICATION";
    var emailParams = aa.util.newHashtable();

    var emailTo = getAppSpecific("Project Office") == "Tahoe" ? "onlinePlnPermitsTahoe@placer.ca.gov" : "onlinePlnPermits@placer.ca.gov";
    var emailCc = "";

    addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$capName$$", capName);
    addParameter(emailParams, "$$fileDate$$", fileDate);

    var result = sendNotification(defaultFrom, emailTo, emailCc, emailTemplate, emailParams, null);

}



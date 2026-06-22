/*===========================================================================================/
| Program : CTRCA:Planning/Inquiry/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : CTRCA script for all Planning Inquiry records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   03/04/2026 Created the branch 
|         : Abe   03/04/2026 Added the IT Request # 2887 - Achievable Housing Interest Form
|
|         
|
/=============================================================================================*/
if (matches(currentUserID, "JMCKENZI", "TDUNN", "EAFTAHI")) { showDebug = 1; }
logDebug("CTRCA:Planning/Inquiry/~/~: started...");


if (publicUser) {
    var emailTemplate = "MESSAGE_RECEIPT_PLANNING";
    var emailParams = aa.util.newHashtable();

    var emailTo = getAppSpecific("Project Office") == "Tahoe" ? "onlinePlnPermitsTahoe@placer.ca.gov" : "onlinePlnPermits@placer.ca.gov";
    var emailCc = "";

    addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$capName$$", capName);
    addParameter(emailParams, "$$fileDate$$", fileDate);

    var result = sendNotification(defaultFrom, emailTo, emailCc, emailTemplate, emailParams, null);

}



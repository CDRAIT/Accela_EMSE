/*======================================================================================================
| Program : CTRCA:~/~/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   01/26/2026 created 3.0 version
|         : Abe   01/26/2026 Added IT Request# 2584 - Notification sent for parecels with "PCCP Application Required" condition when converting from temp to real
|
/======================================================================================================*/
logDebug("Running CTRCA:*/*/*/* ...");

if (publicUser) {
    //IT Request# 2584

    if (getParcelConditions("PCCP - Prevent Issuance / Approval", "Applied", "PCCP Application Required", "Notice").length > 0) {

        var emailTemplate = "PCCP_APPLICATION_REQUIRED_NOTICE";
        var emailTo = "";
        var emailCC = "";
        var emailFrom = defaultFrom;
        var vComment = "";
        var emailParams = aa.util.newHashtable();
        addParameter(emailParams, "$$altID$$", capId.getCustomID());  //"$$altID$$" 
        getAPOParams4Notification(emailParams);                       //"$$parcelNumber$$"
        addParameter(emailParams, "$$appGroupName$$", appTypeArray[0]);
        addParameter(emailParams, "$$appTypeName$$", appTypeArray[1]);

        vComment = "Prior to any new building permit issuance or improvement plan approval - a PCCP application is required on " + emailParams.get("$$parcelNumber$$") + ". For questions, contact CDRAECS@placer.ca.gov";
        addParameter(emailParams, "$$comments$$", vComment);           //"$$comments$$"

        var sendResult = sendNotification(emailFrom, emailTo, emailCC, emailTemplate, emailParams, null);
    }
    //End of IT Request# 2584
}




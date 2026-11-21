/*=============================================================================================
| Program : CTRCA:ESD/~/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn   01/11/2022 created production version 
| Update  : EAFTAHI 08/31/2023 create staff notification for online Submission (GP and others)
|         : TDunn   04/16/2026 removed Improvement Plan from addition of Tech fee
|         : TDunn   05/19/2026 added Improvement Plan Type as part of exclution rule Imp Plan records
|         : Abe     10/22/2026 Synced script to PROD (Copied from PROD)   
|         : Abe     10/22/2026 Created sendSubmittalNotification2Staff_ESD() to carry submittal notification logic
|         : Abe     10/22/2026 Added IT Req# 3932 : Fee study - ESD
|         : Abe     10/23/2026 Converted CTRCA:ESD/~/~/~ stdChoice - Notification to Applicant
|         : Abe     11/20/2026 added last FEE STUDY updates and sent to NP1 and database(EMSE TOOL)
|
/=============================================================================================*/

//#region =================================================
//        FEE CALCULATIONS ----
//#region =================================================

var varAutoInvoiceFees = "N"
if (publicUser) {
    if (matches(appTypeArray[1], "Grading Permit")) {
        //No default fee assign to GP

        //NOTE: Exemption Verification Fee added to all Grading Permits from PLANNING Fee Schedule
        //FIXME: Confirm the PLANNING fee schedule name
        addFee("PL-EXV", "PLANNING", "FINAL", 1, varAutoInvoiceFees);
    }

    if (matches(appTypeArray[1], "Record of Survey")) {
        addFee("EROS", "ESD", "FINAL", 1, varAutoInvoiceFees);
    }

    // Adding New TECH Fee (only two Rec Types on  ACA)
    //NOTE: ESD TECH-FEE Exemptions, as of 11/20/2026: ESECURITY, EWINTERIZ
    if (matches(appTypeArray[1], "Grading Permit", "Record of Survey")) {
        addFee("TECH-FEE", "ACCOUNTING", "FINAL", 1, varAutoInvoiceFees);
    }
}  
//#endregion FEE CALCULATIONS
    


//#region =================================================
//        NOTIFICATIONS ----
//#region =================================================
if (publicUser) {
    /**
     * 
     * Abe 10/22/2026: Separated Notification Codes
     *               : Notification to Staff (GP & ROS only)
     * Abe 10/23/2026: Added a function for sending Notification to Applicant - Converted from CTRCA:ESD stdChoice
     * 
     */
    sendSubmittalNotification2StaffAndApplicant_ESD();
}
//#endregion NOTIFICATIONS

//Testing purpose
aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", "", "CTRCA;ESD!NA NONPROD", debug);


//#region =================================================
//        LOCAL FUNCTIONS USED HERE ONLY ----
//#region =================================================

function sendSubmittalNotification2StaffAndApplicant_ESD() {
    var notificationTemplate = "STAFF_NEW_ONLINE_PERMIT_SUBMITTED_ESD";
    var emailTemplate = "NEW_ONLINE_PERMIT_SUBMITTED_ESD";

    //send Notification to Applicant for all types
    createNotificationTPS2(emailTemplate,
						"Y",
						"Applicant",
						"N",
						null,
						"N",
						"N",
						"N",
						"Y",
						"N",
						"N",
						"");

    var emailParams = aa.util.newHashtable();

    // "$$altID$$", "$$capName$$", "$$recordTypeAlias$$", "$$capStatus$$", "$$fileDate$$", "$$balanceDue$$", "$$workDesc$$
    getRecordParams4Notification(emailParams);
    //"$$addressLine$$", "$$parcelNumber$$", "$$ownerFullName$$" ,"$$ownerPhone$$" 
    getAPOParams4Notification(emailParams);

    //Notification vars
    var emailSendFrom = defaultFrom;
    var toEmailStaff = "";
    var emailStaffCC = "";
    var sendEmail = false;
    var reportFile = null;
    var projectOffice = getAppSpecific("Project Office");

    if (appTypeArray[1] == "Grading Permit") {
        if (projectOffice == "Auburn") {
            toEmailStaff = "jpeacock@placer.ca.gov";
            emailStaffCC = "mwilson@placer.ca.gov";
        }
        else {
            toEmailStaff = "eng_surv@placer.ca.gov";
            emailStaffCC = "EStanifo@placer.ca.gov; FStamm@placer.ca.gov; mgrammenos@placer.ca.gov";
        }
        sendEmail = true;
    }

    if (appTypeArray[1] == "Record of Survey") {
        toEmailStaff = "eng_surv@placer.ca.gov";
        emailStaffCC = "wday@placer.ca.gov; cgutierrez@placer.ca.gov";
        sendEmail = true;
    }
    if (sendEmail)
        var sendResults = sendNotification(emailSendFrom, toEmailStaff, emailStaffCC, notificationTemplate, emailParams, reportFile);

    logDebug("Sending Notification Results: " + sendResults, "INFO");
}
//#endregion LOCAL FUNCTIONS


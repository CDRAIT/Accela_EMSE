/*------------------------------------------------------------------------------------------------------/
| Program : PRA;~!~!~!~  (actually *s not tilde)
|
| Event   : PaymentReceiveAfter
|
| Client  : Placer County
| Usage   : PaymentReceiveAfter for all online payments..
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 11/11/2020 Created script
| update  : TDunn 10/01/2021 Added documentation for using the createNotificationTPS2 function
| update  : TDunn 10/04/2021 Added additional criteria for sending notice by module and record type. 
| update  : TDunn 12/22/2021 added new option to createNotificationTPS3 to send email to both default and assigned staff
| update  : TDunn 10/28/2022 added rules for Planning records at 'Fees Paid'
| update  : EAFTAHI 06/27/2023 added auto-advancement for AA initiated permits 
|
\-------------------------------------------------------------------------------------------------------*/

if (publicUser) {
    logDebug("Running Staff notification for payment received");
    var praNoticeTemplate = "PRA_STAFF_NOTIFICATION_ONLINE_PAYMENT_RECEIVED";
    var sendItFlag = false;
    var staffCode = "Y";
    // sending notice for other record types can be activated by adding update to sendItFlag within 'if' statements
    // update/activate default email by updating email by module/record type and/or remark out override to tdunn@truepointsolutions
    if (appTypeArray[1] == "Hazardous Vegetation") {
        var defaultEmail = "cdrcount@placer.ca.gov";
        defaultEmail = "tdunn@truepointsolutions.com";
    }
    if (appTypeArray[1] == "STR Compliance") {
        var defaultEmail = "str@placer.ca.gov";
        defaultEmail = "tdunn@truepointsolutions.com";
    }
    if (appTypeArray[1] == "Short Term Rental") {
        var defaultEmail = "str@placer.ca.gov";
        defaultEmail = "tdunn@truepointsolutions.com";
    }
    if (matches(appTypeArray[0], "Building", "TRPA")) {
        var defaultEmail = "cdrcount@placer.ca.gov";
        staffCode = "B";
        // defaultEmail = "tdunn@truepointsolutions.com";
        sendItFlag = true;
    }
    logDebug("App type = " + appTypeArray[0] + " send it flag is " + sendItFlag);
    if (((cHolderName != null && cHolderName != "") || currentUserID == "TDUNN") && sendItFlag) {
        createNotificationTPS3(praNoticeTemplate, "N", "Applicant", "N", "Contractor", "N", "N", "N", "Y", staffCode, "N", defaultEmail);
    }
}

/**
 * 
 * Abe >> IT Req# 1566: added AA/ACA initiated auto-advance
 * 
 **/
if (matches(appTypeArray[1], "Administrative", "MBLA", "Pre Development", "Project", "SB 9")) {

    logDebug("Running actions for Online Planning records on PRA event ...");

    if (!publicUser) {
        if (isTaskActive("Permit Initiation") && balanceDue == 0) {
            closeTask("Permit Initiation", "Fees Paid", "Fees paid, updated by script", "");
            if (AInfo["Project Office"] == "Auburn") assignCap("PLNSUP_ABN");
            if (AInfo["Project Office"] == "Tahoe") assignCap("PLNSUP_TAH");
        }
    }
    else {
        if (isTaskStatus("Permit Initiation", "Payment Requested") && isTaskActive("Permit Initiation")) {
            closeTask("Permit Initiation", "Fees Paid", "Fees paid, updated by script", "");
            if (AInfo["Project Office"] == "Auburn") assignCap("PLNSUP_ABN");
            if (AInfo["Project Office"] == "Tahoe") assignCap("PLNSUP_TAH");
        }
    }
}


// var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing PRA script ", debug);	

function createNotificationTPS3(emailTemplate, doContacts, vContactTypes, doLp, vLicType, lpToEmail, doOtherContacts, getOwner, getPrimeAddr, doStaffEmail, addParentID, staffDefault) {
    /*========================================================================================================================================================================== 
    | This is a standarized function for generating one or multiple email notifications using the scripting engine and the Notification templates.  
    | The following parameters must be passed to this function:
    | Email Template = name of the notification template to be used for this email.
    | doContacts = set to "Y" if contact emails are included in the 'to email' distribution list. Set to "N" otherwise
    | vContactTypes = list of contact types to include in the 'to email' list. Enter list as types separated by commas with only one set of "" e.g. "Applicant,Arborist,Designer"
    | doLp = set to "Y" or "N" to control if licensed professionals are included in the distribution list. If set to "N", vLicType and lpToEmail can be set to "N"
    | vLicType = array of license types to include in the licensed professional email list (e.g. vLicType = "Contractor,Electrical")
    | lpToEmail = set to "Y" or "N" to control if licensed professionals are in the 'to email' list or the 'copy to' list, if "Y" then 'to email' if "N" 'copy email';
    | doOtherContacts = set to "Y" or "N" to control if 'other' contact types should be included in the vCcEmail list (copy to list). 
    | getOwner = set to "Y" or "N" to control if Owner information is included in the parameter list.
    | getPrimeAddr = set to "Y" or "N" to control if primary address for record is required for the notification parameter list. returns $$addressLine$$
    | doStaffEmail = set to "Y" or "N" to control if assigned staff is included in the 'to email' list, set to 'T' if staffDefault is to be used as the assignedStaff.
    |                set to "B" if email should go to default AND assignedToStaff
    | addParentID = set to "Y" or "N" to control if parent altId of current record is included in the notification. 
    | staffDefault = the email address of the staff member to include in the vToEmail if no staff is assigned to the record. Use userID if toStaffEmail set to 'T'. 
    | Staff params = $$assignedStaffParam$$
    |		         $$staffEmailParam$$
    |		         $$staffNameParam$$
    | Parameters returned by the getContactParams4Notification() function: $$contactFullName$$; $$contactEmail$$; $$contactFirstName$$; $$contactLastName$$; $$contactAddressLine1$$; $$contactPhoneNumber1$$
    | Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
    /------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    /* Initialize standard parameters for notification */
    var vEmailSent = false;
    var vFromEmail = "";
    var vToEmail = "";
    var vCcEmail = "";
    var pcapIdString = "";
    var emailParameters = aa.util.newHashtable();
    var reportParams = aa.util.newHashtable();
    vFromEmail = "";
    logDebug(" Do staff=" + doStaffEmail + ", Add parent= " + addParentID + ", Staff default = " + staffDefault);

    // start loading parameters for notification
    logDebug("loading deeplink parameters");
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    getACARecordParam4Notification(emailParameters, acaSite); // returns $$acaRecordUrl$$; $$acaDeepLinkAppTypeAlias$$
    // Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
    getRecordParams4Notification(emailParameters);
    addParameter(reportParams, "RecordID", capIDString);

    if (vEventName == "WorkflowTaskUpdateAfter") {
        addParameter(emailParameters, "$$wfStatusParam$$", wfStatus);
        addParameter(emailParameters, "$$wfDateParam$$", wfDateMMDDYYYY);
        addParameter(emailParameters, "$$taskNameParam$$", wfTask);
        addParameter(emailParameters, "$$wfCommentParam$$", wfComment);
        wfDueDate = getTaskDueDate("wfTask");
        if (wfDueDate != null) {
            addParameter(emailParameters, "$$wfDueDateParam$$", wfDueDate);
        }
    }

    if (vEventName == "InspectionScheduleAfter") {
        addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
        addParameter(emailParameters, "$$inspType$$", inspType);
    }

    if (getOwner == "Y") {
        getPrimaryOwnerParams4Notification(emailParameters);
    }

    if (addParentID == "Y") {
        pcapId = getParent();
        if (pcapId != null) {
            pcapIDString = pcapId.getCustomID();
            addParameter(emailParameters, "$$parentAltId$$", pcapIDString);
        }
    }

    /* Get To email contact types */
    /* Some of the parameters returned by the getContactParams4Notification() function: $$contactFullName$$; $$contactEmail$$; $$contactFirstName$$; $$contactLastName$$; $$contactAddressLine1$$; $$contactPhoneNumber1$$ */
    if (doContacts == "Y" || doOtherContacts == "Y") {
        var cTypeArray = new Array();
        cTypeArray = vContactTypes.split(",");
    }
    /* Get To emails for contacts */
    if (doContacts == "Y") {
        var conArray = new Array();
        conArray = getContactArrayWithPrimary(capId);
        for (thisCon in conArray) {
            if (exists(conArray[thisCon]["contactType"], cTypeArray)) {
                logDebug(conArray[thisCon]["contactType"]);
                getContactParams4Notification(emailParameters, conArray[thisCon]);
                if (emailParameters.get("$$contactEmail$$") != null) {
                    vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
                }
            }
        }

    }
    /* Get cc emails for other contacts */
    if (doOtherContacts == "Y") {
        conArray = getContactArrayWithPrimary(capId);
        for (thisCon in conArray) {
            if (!exists(conArray[thisCon]["contactType"], cTypeArray) && conArray[thisCon]["email"] != null && conArray[thisCon]["email"] != "") {
                vCcEmail = vCcEmail + conArray[thisCon]["email"] + "; ";
            }
        }
    }

    if (doLp == "Y") {
        var licProfsArray = new Array();
        var vLicTypeArray = new Array();
        licProfsArray = getLicenseProfessional(capId);
        vLicTypeArray = vLicType.split(",");
        for (thisProf in licProfsArray) {
            currentProf = licProfsArray[thisProf];
            lpType = currentProf.getLicenseType();
            if ((currentProf.getEmail() != null && currentProf.getEmail() != "") && exists(lpType, vLicTypeArray)) {
                profEmail = currentProf.getEmail();
                if ((profEmail != null && profEmail != "") && lpToEmail == "Y") {
                    vToEmail = vToEmail + profEmail + "; ";
                }
                if ((profEmail != null && profEmail != "") && lpToEmail != "Y") {
                    vCcEmail = vCcEmail + profEmail + "; ";
                }
            }
        }
    }

    /* Get primary permit address */
    if (getPrimeAddr == "Y") {
        getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */
    }

    /* Get assigned staff email address */
    if (doStaffEmail == "Y") {
        var vStaffEmail = staffDefault;
        logDebug("Staff default is: " + staffDefault);
        var assignedToEmail = "";
        var assignedTo = getAssignedToStaff();
        if (assignedTo != null) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
            logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail);
            if (!matches(assignedToEmail, undefined, "", null)) {
                vStaffEmail = assignedToEmail;
            }
        }
        vToEmail = vToEmail + vStaffEmail + "; ";
    }

    if (doStaffEmail == "B") {
        var vStaffEmail = staffDefault;
        logDebug("Staff default is: " + staffDefault);
        vToEmail = vToEmail + staffDefault + "; ";
        var assignedToEmail = "";
        var assignedTo = getAssignedToStaff();
        if (assignedTo != null) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
            logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail);
            if (!matches(assignedToEmail, undefined, "", null)) {
                vToEmail = vToEmail + assignedToEmail + "; ";
            }
        }
    }

    /* If record is assigned to staff add assigned staff parameters */
    var assignedStaff = getAssignedToStaff();
    if (doStaffEmail == "T" && staffDefault != "") {
        assignedStaff = staffDefault;
    }
    if (assignedStaff != null) {
        staffResult = aa.person.getUser(assignedStaff);
        if (!staffResult.getSuccess()) { logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
        if (staffResult.getSuccess()) {
            staffObject = staffResult.getOutput();
            var staffEmail = staffObject.getEmail();
            var staffFirst = staffObject.getFirstName();
            var staffLast = staffObject.getLastName();
            logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
        }
        var staffName = staffFirst + " " + staffLast;
        if (!matches(staffEmail, undefined, "", null)) {
            addParameter(emailParameters, "$$assignedStaffParam$$", assignedStaff);
            addParameter(emailParameters, "$$staffEmailParam$$", staffEmail);
            addParameter(emailParameters, "$$staffNameParam$$", staffName);
        }
    }



    logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
    // aa.print("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

    // vToEmail = "tdunn@truepointsolutions.com"; vCcEmail = "tdunn@truepointsolutions.com";
    vEmailSent = sendNotification(vFromEmail, vToEmail, vCcEmail, emailTemplate, emailParameters, null);
    logDebug("Email Sent = " + vEmailSent);

}
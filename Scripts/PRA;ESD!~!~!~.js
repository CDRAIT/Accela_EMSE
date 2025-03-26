/*------------------------------------------------------------------------------------------------------/
| Program : PRA;ESD!~!~!~  (actually *s not tilde)
| Title   : PRA:ESD!*!*!*
|
| Event   : PaymentReceiveAfter
|
| Client  : Placer County
| Usage   : PaymentReceiveAfter for all ESD full payments..
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : EAFTAHI 08/16/2023 Created script
| update  : EAFTAHI 08/16/2023 added payment notice for ESD applications 
|
\-------------------------------------------------------------------------------------------------------*/

logDebug("Running actions for ESD records on PRA event ...");

var ESD_NoticeTemplate = "ESD_FEES_PAID_IN_FULL";
var defaultEmail = "";
var sendItFlag = false;
var staffCode = "";
var projectOffice = getAppSpecific("Project Office");

if (balanceDue == 0) {
    if (matches(appTypeArray[1], "Record of Survey")) {
        staffCode = "B";
        defaultEmail = "WDay@placer.ca.gov; lderober@placer.ca.gov; cgutierrez@placer.ca.gov";
        sendItFlag = true;
    }
    else if (matches(appTypeArray[1], "Final Subdivision Map", "Parcel Map")) {
        staffCode = "B";
        defaultEmail = "WDay@placer.ca.gov; lderober@placer.ca.gov; ACabe@placer.ca.gov";
        sendItFlag = true;
    }
    else if (matches(appTypeArray[1], "Grading Permit") && matches(projectOffice,"Auburn")){
        staffCode = "B";
        defaultEmail = "mwilson@placer.ca.gov; jpeacock@placer.ca.gov"; 
        sendItFlag = true;
    }
    else if (matches(appTypeArray[1], "Grading Permit") && matches(projectOffice,"Tahoe")){
        staffCode = "B";
        defaultEmail = "EStanifo@placer.ca.gov; FStamm@placer.ca.gov; mgrammenos@placer.ca.gov"; 
        sendItFlag = true;
    }

    logDebug("ESD type = " + appTypeArray[1] + " send it flag is " + sendItFlag);
    logDebug("cHolderName = " + cHolderName);

    if (cHolderName != null && cHolderName != "" && sendItFlag) {
        createNotificationTPS3(ESD_NoticeTemplate, "N", "Applicant", "N", "Contractor", "N", "N", "N", "Y", staffCode, "N", defaultEmail);
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
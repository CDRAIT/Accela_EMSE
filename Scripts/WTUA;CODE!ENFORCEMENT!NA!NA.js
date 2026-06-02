/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Code!Enforcement!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Code Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 11/22/2024 created script - Converted from StdChoice, WTUA:Code/~/~/~ branch
|           EAFTAHI 10/01/2025 Added IT Request# 1675 - New Code Compliance WF
|           EAFTAHI 02/05/2026 Added Fisrt Revision outputs to the script
|           Abe     04/23/2026 added 2nd to 4th revision 
|           Abe     05/21/2026 added revision dated May 12, 2026 - removed all the codes regarding to appStatus manipulation
|                              so that only record status (after Enforcement Action) will be "Enforcement" and "Fine Processing"
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("In the WTUA:Code/Enforcement/*/* ...");

//Old WF
if (matches(wfStatus, "Resolved", "Notes", "Appeal Hearing CBO", "Referred", "Unfounded", "No Violation")) {
    removeParcelCondition(null, "Code", "Unlawful Landuse");
    removeParcelCondition(null, "Code Compliance - Notification", "Unlawful Land Use");
}

var varAInfo = new Array();

//To append wf process code.wftask. to TSI field label
useTaskSpecificGroupName = true;
loadTaskSpecific(varAInfo);
if (wfProcess == "CODE_ENF") { //New Workflow
    var reportParams = aa.util.newHashMap();
    var emailParams = aa.util.newHashtable();
    var emailFrom = defaultFrom;
    var emailTo = "";
    var emailCc = "";
    var generalEmailTemplate = "CE_GENERAL_EMAIL_TEMPLATE";
    var emailTemplate = "";
    var reportName = "";
    var emailSubject = "";    //$$emailSubject$$
    var reportModule = "Code";
    var reportFile = null;
    var refAgenciesStdChoice = "SDL: CE_Ref_Agencies";
    //To control appStatus
    //commented - Revision 5/12/2026
    var isCitationActive = false;
    var isNuisanceActive = false;
    
    var isEnfActive = false;
    var isFineProcActive = false;


    //commented - Revision 5/12/2026
    if ((isTaskActive("Notice of Nuisance") || isTaskActive("Nuisance Outcome") ||
        isTaskActive("Abatement Hearing") || isTaskActive("Reinspection Outcome") ||
        isTaskActive("Abatement Processing"))) {
        isNuisanceActive = true;
    }
    if ((isTaskActive("Citation") || isTaskActive("Appeal") || isTaskActive("Administrative Hearing"))) {
        isCitationActive = true;
    }

    if (isTaskActive("Enforcement Action") || isCitationActive || isNuisanceActive) { isEnfActive = true; }


    //if (isTaskActive("Fine Processing") && !(isCitationActive || isEnfActive || isNuisanceActive)) { isFineProcActive = true; }    
    if (isTaskActive("Fine Processing") && !(isEnfActive)) { isFineProcActive = true; }

    addParameter(reportParams, "altID", capIDString);

    //preparing Email Parameters
    getRecordParams4Notification(emailParams);   //$$altID$$, $$capName$$, $$recordTypeAlias$$, $$capStatus$$, $$fileDate$$, $$balanceDue$$, $$workDesc$$
    getAPOParams4Notification(emailParams); //$$addressLine$$, $$parcelNumber$$, $$ownerFullName$$","$$ownerPhone$$","$$ownerEmail$$", "$$ownerAddr$$","$$ownerCity$$","$$ownerState$$","$$ownerZip$$"    
    addParameter(emailParams, "$$compName$$", getAppSpecific("Complaintant"));
    addParameter(emailParams, "$$compPhone$$", getAppSpecific("Complaintant Phone"));
    addParameter(emailParams, "$$compEmail$$", getAppSpecific("Complaintant Email"));

    // Assigns record to the current user
    if (matches(wfTask, "Complaint Received", "Investigation"))
        if (matches(wfStatus, "Unfounded", "Referred & Closed", "Duplicate", "Withdrawn", "No Violation"))
        {
            assignCap(currentUserID);             
             closeCap(currentUserID);
        }
            

    if (wfTask == "Complaint Received") {
        if (wfStatus == "Unfounded") {
            //Send Unfounded Letter to Applicant (2)
            emailTo = emailParams.get("$$compEmail$$");
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT OUTCOME");
            logDebug("Complainant Email is : " + emailParams.get("$$compEmail$$"));
            reportName = "Complaint Unfounded Letter";
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complaint_Outcome_Case# " + capIDString + ".pdf");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1)
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
        }

        if (wfStatus == "Referred & Closed" || wfStatus == "Referred & Investigation") {
            //(1) Send Referral Email to Agencies (4)
            emailTemplate = "CE_REFERRAL_AGENCIES_NOTIFICTION";
            emailTo += getRefAgncyContact();

            if (varAInfo[wfProcess + "." + wfTask + "." + "Other"] == "CHECKED") {
                logDebug("Other Agency Email: " + varAInfo[wfProcess + "." + wfTask + "." + "Other Email"]);
                emailTo += varAInfo[wfProcess + "." + wfTask + "." + "Other Email"] + ";";
            }
            var sendResult = sendNotification(emailFrom, emailTo, emailCc, emailTemplate, emailParams, null);

            //(2) Send Referral Letter to Applicant Only (3)
            emailTo = emailParams.get("$$compEmail$$");
            reportName = "Complaint Referral Letter";
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT REFERRAL");
            addParameter(reportParams, "wfTask", wfTask);
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complaint_Referral_Case# " + capIDString + ".pdf");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1)
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
        }
        if (wfStatus == "Referred & Investigation" || wfStatus == "Courtesy Notice") {
            //Send Courtesy Notice to Parties
            reportName = "Complaint Courtesy Notice";
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT COURTESY NOTICE");
            sendNotice2Recipients("Complaint_Courtesy_Notice");
        }
    }

    if (wfTask == "Investigation") {
        if (wfStatus == "Referred & Closed" || wfStatus == "Referred & Violation") {
            //var agencies = getCodeReferralAgencyArray();
            //send Referral Email to Agencies (4)
            emailTo += getRefAgncyContact();
            emailTemplate = "CE_REFERRAL_AGENCIES_NOTIFICTION";
            // agencies.forEach(function (item) {
            //     emailTo += lookup(refAgenciesStdChoice, item) + ';';
            // });
            if (varAInfo[wfProcess + "." + wfTask + "." + "Other"] == "CHECKED")
                emailTo += varAInfo[wfProcess + "." + wfTask + "." + "Other Email"] + ";";
            var sendResult = sendNotification(emailFrom, emailTo, emailCc, emailTemplate, emailParams, null);
        }
        if (wfStatus == "Referred & Closed") {
            // Send Referral Letter to Applicant Only (3) - added after 1st Revision
            emailTo = emailParams.get("$$compEmail$$");
            reportName = "Complaint Referral Letter";
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT REFERRAL");
            addParameter(reportParams, "wfTask", wfTask);
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complaint_Referral_Case# " + capIDString + ".pdf");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1)
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
        }
    }

    if (wfTask == "Enforcement Action") {
        if (wfStatus == "NOV Mailed") {
            //Create and send NOV Letter (6)
            reportName = "Complaint Notice of Violation";
            addParameter(emailParams, "$$emailSubject$$", "NOTICE OF VIOLATION");
            sendNotice2Recipients("Notice_of_Violation");
        }

        if (wfStatus == "Citation & Notice of Nuisance") {
            //Create the fork manually
            activateTask("Citation");
            activateTask("Notice of Nuisance");
            closeTask("Enforcement Action", "Citation & Notice of Nuisance", "Closed by Script", "Forked by Script");
        }
        
        if (wfStatus == "Complied Voluntarily") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");
            else if (isFineProcActive) updateAppStatus("Fine Processing", "Updated by WTUA Script");
            else {
                updateAppStatus("Voluntarily Complied", "Updated by WTUA script");
                closeCap(currentUserID);
            }
        }
    }

    if (wfTask == "Notice of Nuisance") {
        if (wfStatus == "Notice of Nuisance") {
            editAppSpecific("Nuisance Letter Issuance Date", wfDateMMDDYYYY);
            //Create Nuisance Letter (11)
            reportName = "Notice of Nuisance";
            addParameter(emailParams, "$$emailSubject$$", "NOTICE OF NUISANCE");
            sendNotice2Recipients("Nuisance_Notice");
        }

        if (wfStatus == "Complied") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA script");
            else if (isFineProcActive) updateAppStatus("Fine Processing", "Updated by WTUA script");
            else {
                updateAppStatus("Complied", "Updated by WTUA script");
                closeCap(currentUserID);
            }
        }
    }

    if (wfTask == "Nuisance Outcome") {
        if (wfStatus == "Complied") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");

            else if (isFineProcActive) updateAppStatus("Fine Processing", "Updated by WTUA Script");
            else {
                updateAppStatus("Complied", "Updated by WTUA script");
                closeCap(currentUserID);
            }
        }
    }

    if (wfTask == "Abatement Hearing") {
        if (matches(wfStatus, "Pending Hearing", "Continued")) {
            //Nuicance Abatement Letter (13)
            reportName = "Abatement Hearing Letter";
            addParameter(emailParams, "$$emailSubject$$", "NOTICE OF NUISANCE ABATEMENT");
            emailTo = emailParams.get("$$ownerEmail$$");
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Notice_of_Nuisance_Abatement_Case# " + capIDString + ".pdf");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1) {
                    //send email with report attached
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
                }
        }

        if (wfStatus == "Abatement Upheld") {
            //Reinspection Email to staff (14) - or Create an inspection 
            //BatchJob - save the WFdate in the ASI field
            editAppSpecific("Nuisance Abatement Upheld Date", wfDateMMDDYYYY);
        }

        if (wfStatus == "Complied" || wfStatus == "Dismissed") {
            if (isEnfActive)
                updateAppStatus("Enforcement Action", "Updated by WTUA Script");
            else if (isFineProcActive)
                updateAppStatus("Fine Processing", "Updated by WTUA Script");
            else {
                if (wfStatus == "Dismissed") updateAppStatus("Dismissed", "Updated by WTUA script");
                if (wfStatus == "Complied") updateAppStatus("Complied", "Updated by WTUA script");
                closeCap(currentUserID);
            }
        }
    }

    if (wfTask == "Reinspection Outcome") {
        if (wfStatus == "In Violation - Enf. & Abatement") {
            // Create the fork manually            
            activateTask("Enforcement Action");
        }

        if (wfStatus == "Complied") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");
            else if (isFineProcActive) updateAppStatus("Fine Processing", "Updated by WTUA Script");
            else {
                updateAppStatus("Complied", "updated by WTUA script");
                closeCap(currentUserID);
            }
        }
    }

    if (wfTask == "Abatement Processing") {
        if (wfStatus == "Abatement Complete")
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");

        if (wfStatus == "Complied") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");
            else if (isFineProcActive) updateAppStatus("Fine Processing", "Updated by WTUA Script");
            else {
                updateAppStatus("Complied", "Updated by WTUA script");
                closeCap(currentUserID);
            }
        }
    }

    if (wfTask == "Citation") {
        if (wfStatus == "Citation") {
            // Create and send Citation Letter (7)
            reportName = "Complaint Citation Letter";
            addParameter(emailParams, "$$emailSubject$$", "CITATION LETTER");
            sendNotice2Recipients("Citation_Letter");

            editAppSpecific("Citation Issuance Date", wfDateMMDDYYYY);
        }        

        if (wfStatus == "Complied") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");            
        }
    }

    if (wfTask == "Appeal") {
        if (wfStatus == "No Appeal") {
            //Create the fork manually
            activateTask("Citation");            
        }
    }

    if (wfTask == "Administrative Hearing") {
        if (wfStatus == "Pending Hearing" || wfStatus == "Continued") {
            //Send Hearing Letter (9)
            reportName = "Citation Hearing Letter";
            addParameter(emailParams, "$$emailSubject$$", "CITATION APPEAL HEARING");
            sendNotice2Recipients("Citation_Appeal_Hearing");

            //Send Complainant Hearing Notice (19)
            reportName = "Complainant Citation Hearing Letter";
            addParameter(emailParams, "$$emailSubject$$", "CITATION APPEAL HEARING");
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complainant_Citation_Appeal_Hearing_Case# " + capIDString + ".pdf");
            emailTo = emailParams.get("$$compEmail$$");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1) {
                    //send email with report attached
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
                }
        }

        if (wfStatus == "Citation Upheld") {
            //save the wfdate in an ASI for Batchjob
            editAppSpecific("Citation Upheld Date", wfDateMMDDYYYY);
            //Create fork Manually            
            activateTask("Fine Processing");
        }

        if (wfStatus == "Complied") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");
        }

        if (wfStatus == "Dismissed") {
            if (isEnfActive) updateAppStatus("Enforcement Action", "Updated by WTUA Script");
            else if (isFineProcActive) updateAppStatus("Fine Processing", "Updated by WTUA Script");
            else {
                updateAppStatus("Dismissed", "Updated by WTUA Script");
                closeCap(currentUserID)
            }
        }
    }
    
    if (wfTask == "Fine Processing") {
        if (wfStatus == "Request for Payment") {
            //Create Invoice Cover Letter (16)
            reportName = "Invoice Cover Letter";
            addParameter(emailParams, "$$emailSubject$$", "INVOICE LETTER");
            sendNotice2Recipients("Invoice_Cover_Letter");

            //Eamil Fines Due to Staff (17) - Batchjob
            editAppSpecific("First Payment Request Date", wfDateMMDDYYYY);
        }

        if (wfStatus == "Subsequent Payment Request") {
            //Invoice Cover Letter, 2nd (18)
            reportName = "Second Invoice Cover Letter";
            addParameter(emailParams, "$$emailSubject$$", "SECOND INVOICE INVOICE LETTER");
            sendNotice2Recipients("Second_Invoice_Cover_Letter");

            //Eamil Fines Due to Staff (17) - batchjob
            editAppSpecific("Subsequent Payment Request Date", wfDateMMDDYYYY);
        }

        if (matches(wfStatus, "No Fines Assessed", "Fines Paid", "Secured Lien Filed", "Simple Lien Resolved")) closeCap(currentUserID);

        if (!(isEnfActive)) {
            if (wfStatus == "Fines Paid") {
                updateAppStatus("Fines Paid", "Updated by WTUA Script");
                closeCap(currentUserID);
            }
            if (wfStatus == "Secured Lien Filed") {
                updateAppStatus("Lien Filed", "Updated by WTUA Script");
                closeCap(currentUserID);
            }
            if (wfStatus == "Simple Lien Resolved") {
                updateAppStatus("Lien Resolved", "Updated by WTUA Script");
                closeCap(currentUserID);

            }
        }

    }

    //Final Revision - added on May 21, 2026 - Process Invoice email to staff when the case is ready for fee processing     
    if ((wfTask == "Citation" && wfStatus == "Complied") ||
        (wfTask == "Appeal" && wfStatus == "No Appeal") ||
        (wfTask == "Administrative Hearing" && matches(wfStatus, "Citation Upheld", "Complied")) ||
        (wfTask == "Abatement Processing" && wfStatus == "Abatement Complete")) {
        //Send Process Fine email to Staff (15)    
        emailTemplate = "CE_STAFF_NOTIFICATION";
        emailTo = (getAppSpecific("Project Office") == "Auburn") ? "CodeEnforce@placer.ca.gov" : "CodeEnforceTahoe@placer.ca.gov";
        if (getAssignedToStaff())
            emailCc = getUserEmail(getAssignedToStaff());
        var emailContentStr = "The above referenced case is ready for fee processing. Please generate and send the invoice to request payment.";
        addParameter(emailParams, "$$emailSubject$$", "PROCESS INVOICE");
        addParameter(emailParams, "$$contentString$$", emailContentStr);

        if (!isBlank(emailTo))
            if (emailTo.indexOf('@') != -1)
                var sendResult = sendNotification(emailFrom, emailTo, emailCc, emailTemplate, emailParams, null);
    }    
}

/********************************* 
 Local Functions used here only
*********************************/
function getRefAgncyContact() {
    var emailAddr = '';
    var varAgncies = getStandardChoiceArray(refAgenciesStdChoice);
    for (each in varAgncies)
        if (varAgncies[each]["active"] == "A")
            if (varAInfo[wfProcess + "." + wfTask + "." + varAgncies[each]["value"]] == "CHECKED")
                emailAddr += varAgncies[each]["valueDesc"] + ";";

    return emailAddr;
}

/**
 * Gets the checked recepients and send email with attached report
 * @param {string} fileName:   file name for the attached report
 * 
 */
function sendNotice2Recipients(fileName) {
    //Get checked Contacts from TSI
    var recipients = new Array("Agent", "Business", "Owner", "PMC", "Responsible Party", "Tenant"); //Property Management Company
    var checkedRecipients = new Array();
    for (each in recipients) {
        if (varAInfo[wfProcess + "." + wfTask + "." + recipients[each]] == "CHECKED")
            checkedRecipients.push(recipients[each]);
    }
    logDebug("Checked Recipients Array : " + checkedRecipients);
    //Get email for checked TSI and 
    if (checkedRecipients.length > 0)
        for (each in checkedRecipients) {
            addParameter(reportParams, "conatctType", checkedRecipients[each]);
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, fileName + "_Case# " + capIDString + "_" + checkedRecipients[each] + ".pdf");
            //logDebug("reportFile: " + reportFile);
            if (checkedRecipients[each] == "Owner") {
                emailTo = emailParams.get("$$ownerEmail$$");
                //logDebug("OwnerEmail: " + emailTo);
            }
            else if (checkedRecipients[each] == "PMC") {
                emailTo = getContactEmailByContactType("Property Management Company", capId);
            }
            else {
                emailTo = getContactEmailByContactType(checkedRecipients[each], capId);
                //logDebug("Within the Else ...");
            }
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1) {

                    //Revision Apr 7th, 2026
                    if (!matches(wfStatus, "Request for Payment", "Subsequent Payment Request"))
                        var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
                }
        }
}

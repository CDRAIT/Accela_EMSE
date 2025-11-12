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
    

    addParameter(reportParams,"altID",capIDString);

    //preparing Email Parameters
    getRecordParams4Notification(emailParams);   //$$altID$$, $$capName$$, $$recordTypeAlias$$, $$capStatus$$, $$fileDate$$, $$balanceDue$$, $$workDesc$$
    getAPOParams4Notification(emailParams); //$$addressLine$$, $$parcelNumber$$, $$ownerFullName$$","$$ownerPhone$$","$$ownerEmail$$", "$$ownerAddr$$","$$ownerCity$$","$$ownerState$$","$$ownerZip$$"    
    addParameter(emailParams, "$$compName$$", getAppSpecific("Complaintant"));
    addParameter(emailParams, "$$compPhone$$", getAppSpecific("Complaintant Phone"));
    addParameter(emailParams, "$$compEmail$$", getAppSpecific("Complaintant Email"));


    //assigns the record to the current user regardless of the tasks
    if (matches(wfStatus, "Unfounded", "Referred & Closed", "Duplicate", "Withdrawn")) {
        assignCap(currentUserID);
    }

    if (wfTask == "Complaint Received") {
        if (wfStatus == "Unfounded") {
            //Send Unfounded Letter to Applicant (2)
            emailTo = emailParams.get("$$compEmail$$");
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT OUTCOME");
            logDebug("*** Complainant Email is : " + emailParams.get("$$compEmail$$"));
            reportName = "Complaint Unfounded Letter";
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complaint_Outcome_Case# " + capIDString + ".pdf");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1)
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
        }

        if (wfStatus == "Referred & Closed" || wfStatus == "Referred & Investigation") {
            var agencies = getCodeReferralAgencyArray();

            //(1) Send Referral Email to Agencies (4)
            emailTemplate = "CE_REFERRAL_AGENCIES_NOTIFICTION";
            agencies.forEach(function (item) {
                emailTo += lookup(refAgenciesStdChoice, item) + ';';
            });
            if (varAInfo[wfProcess + "." + wfTask + "." + "Other"] == "CHECKED")
                emailTo += varAInfo[wfProcess + "." + wfTask + "." + "Other Email"] + ";";
            var sendResult = sendNotification(emailFrom, emailTo, emailCc, emailTemplate, emailParams, null);

            //(2) Send Referral Letter to Applicant Only (3)
            emailTo = emailParams.get("$$compEmail$$");
            reportName = "Complaint Referral Letter";
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT REFERRAL");
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complaint_Referral_Case# " + capIDString + ".pdf");
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1)
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
        }
        if (wfStatus == "Referred & Investigation" || wfStatus == "Courtesy Notice Sent") {
            //Send Courtesy Notice to Parties
            reportName = "Complaint Courtesy Notice";
            addParameter(emailParams, "$$emailSubject$$", "COMPLAINT COURTESY NOTICE");
            sendNotice2Recipients("Complaint_Courtesy_Notice");
        }
    }

    if (wfTask == "Investigation") { 
        if (wfStatus == "Referred & Closed" || wfStatus == "Referred & Violation") {
            //send Referral Email to Agencies (4)
                        emailTemplate = "CE_REFERRAL_AGENCIES_NOTIFICTION";
            agencies.forEach(function (item) {
                emailTo += lookup(refAgenciesStdChoice, item) + ';';
            });
            if (varAInfo[wfProcess + "." + wfTask + "." + "Other"] == "CHECKED")
                emailTo += varAInfo[wfProcess + "." + wfTask + "." + "Other Email"] + ";";
            var sendResult = sendNotification(emailFrom, emailTo, emailCc, emailTemplate, emailParams, null);
            
        }
        if (wfStatus == "Referred & Violation") {
            //TBD....

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
            activateTask("Nuisance Outcome");
            closeTask("Enforcement Action", "Citation & Notice of Nuisance", "Closed by Script", "Forked by Script");
        }
        if (wfStatus == "Notice of Nuisance" || wfStatus == "Citation & Notice of Nuisance") {
            //Create Nuisance Letter (11)
            reportName = "Notice of Nuisance";
            addParameter(emailParams, "$$emailSubject$$", "NOTICE OF NUISANCE");
            sendNotice2Recipients("Nuisance_Notice");
        }
    }

    if (wfTask == "Citation") {
        if (wfStatus == "Citation") {
            // Create and send Citation Letter (7)
            var citationSeq = getAppSpecific("Number_of_Citations");
            var seqString = "";
            if(citationSeq == 1)
                seqString = "First ";
            else if(citationSeq == 2)
                seqString = "Second ";
            else if(citationSeq == 3)
                seqString = "Third ";    

            reportName = "Complaint Citation Letter";
            addParameter(emailParams, "$$emailSubject$$", seqString + "CITATION LETTER");
            sendNotice2Recipients(seqString + "Citation_Letter");
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
        if (wfStatus == "Continued") {
            //TBD...
        }
        if (wfStatus == "Citation Upheld") {
            //save the wfdate in an ASI for - Batchjob

            //Create fork Manually
            activateTask("Enforcement Action");
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
        }
    }

    if (wfTask == "Reinspection Outcome") {
        if (wfStatus == "In Violation - Enforcement") {
            // Create the fork manually            
            activateTask("Enforcement Action");
        }
    }

    if ((wfTask == "Citation" && wfStatus == "Complied") ||
        (wfTask == "Abatement Processing" && wfStatus == "Abatement Complete") ||
        (wfTask == "Administrative Hearing" && matches(wfStatus, "Complied", "Citation Upheld")) ||
        (wfTask == "Appeal" && wfStatus == "No Appeal")) {
        //Send Process Fine email to Staff (15)
        emailTemplate = "CE_STAFF_PROCESS_FINE_NOTIFICATION";
        emailTo = (getAppSpecific("Project Office")= "Auburn")? "CodeEnforce@placer.ca.gov": "CodeEnforceTahoe@placer.ca.gov" +";";        
        emailTo += getUserEmail(getAssignedToStaff()); 
         if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1)
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, emailTemplate, emailParams, null);
    }

    if (wfTask == "Fine Processing") {
        if (wfStatus == "Request for Payment") {
            //Create Invoice Cover Letter (16)
            reportName = "Invoice Cover Letter";
            addParameter(emailParams, "$$emailSubject$$", "INVOICE INVOICE LETTER");
            sendNotice2Recipients("Invoice_Cover_Letter");
            //Eamil Fines Due to Staff (17) - Batchjob
        }
        if (wfStatus == "Subsequent Request") {
            //Invoice Cover Letter, 2nd (18)
            reportName = "Second Invoice Cover Letter";
            addParameter(emailParams, "$$emailSubject$$", "SECOND INVOICE INVOICE LETTER");
            sendNotice2Recipients("Second_Invoice_Cover_Letter");

            //Eamil Fines Due to Staff (17) - batchjob
        }
    }
}

function getCodeReferralAgencyArray() {
    var agencies = new Array("Anim Ctrl",
        "APCD",
        "Aub Code",
        "BLD",
        "CalFire",
        "CHP",
        "Colfax Code",
        "DFW",
        "DFW",
        "DPW",
        "EH",
        "ESD",
        "FFPD",
        "Loomis Code",
        "Mosquito Vector",
        "NID",
        "NTFPD",
        "OVFD",
        "PCWA",
        "PLN",
        "PNPF",
        "Roads",
        "Rocklin Code",
        "Roseville Code",
        "RPD",
        "PYR",
        "Sheriff",
        "SPF",
        "Stormwater",
        "TFPD");

    var checkedAgencies = new Array();
    for (each in agencies) {
        if (varAInfo[wfProcess + "." + wfTask + "." + agencies[each]] == "CHECKED")
            checkedAgencies.push(agencies[each]);
    }
    return checkedAgencies;
}

function sendNotice2Recipients(fileName) {
    //Get checked Contacts from TSI
    var recipients = new Array("Agent", "Business", "Owner", "PMC", "Responsible Party", "Tenant"); //Property Management Company
    var checkedRecipients = new Array();
    for (each in recipients) {
        if (varAInfo[wfProcess + "." + wfTask + "." + recipients[each]] == "CHECKED")
            checkedRecipients.push(recipients[each]);
    }
    //Get email for checked TSI
    if (checkedRecipients.length > 0)
        for (each in checkedRecipients) {
            addParameter(reportParams, "conatctType", checkedRecipients[each]);
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, fileName + "_Case# " + capIDString + "_" + checkedRecipients[each] + ".pdf");
            if (checkedRecipients[each] == "Owner") {
                emailTo = emailParams.get("$$ownerEmail$$");
            }
            if (checkedRecipients[each] == "PMC") {
                emailTo = getContactEmailByContactType("Property Management Company", capId);
            }
            else {
                emailTo = getContactEmailByContactType(checkedRecipients[each], capId);
            }
            if (!isBlank(emailTo))
                if (emailTo.indexOf('@') != -1) {
                    //send email with report attached
                    var sendResult = sendNotification(emailFrom, emailTo, emailCc, generalEmailTemplate, emailParams, new Array(reportFile));
                }   
        }
}

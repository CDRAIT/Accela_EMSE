/*------------------------------------------------------------------------------------------------------/  
| Program : WTUA;HazVeg!Hazardous Vegetation!~!~  
| Event   : WorkflowTaskUpdateAfter  
|  
| Client  : Placer County, CA  
| Usage   : Workflow Task Update After for all HazVeg records.  
|  
|  
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.  
|  
| Notes   : TDunn 10/19/2020 created script  
|         : TDunn 11/09/2020 Updates to logic and formatting  
|         : TDunn 11/11/2020 Added additional status rules and actions  
|         : Abe   07/09/2024 Commented the old logic associated to the old Version (regarding #1986) 
|         : Abe   03/31/2025 IT Request # 1986 - HazVeg Workflow Revise   
/------------------------------------------------------------------------------------------------------*/
if (currentUserID == 'EAFTAHI') { showDebug = 3; }
logDebug("In WTUA:HazVeg/Hazardous Vegetation/*/* ...");

/** 
 *     
 * Abe - 07/07/2024: IT Request # 1986 - HazVeg Workflow Revise  
 * 
 * Dependecies: 
 *              Email Temps:  HV_REFERRAL_AGENCIES_NOTIFICATION
 *                            HV_GENERAL_EMAIL_TEMPLATE
 * 
 *         StdChoices(SDLs):  SDL: HV_Ref_Agencies
 *            Contact Types:  Agent, Business, Propery Management Company, Resposible Party, Tenant
 * 
 *                  Reports:  Referral Lettter 
 *                            Unfounded Outcome Letter
 *                            NOHVI Ltr
 *                            NOVOTA Letter
 *                            and others under hazardous Vegetation Cat.
**/
//Emails and reports info  
var reportName = "";
var reportModule = "HazVeg";
var reportFile = null;
var reportParams = aa.util.newHashMap();
addParameter(reportParams, "altID", capIDString);

var generalEmailTemp = "HV_GENERAL_EMAIL_TEMPLATE";
//var emailFrom = defaultFrom;
var emailFrom = defaultFrom;
var emailTo = "";
var emailCC = "";

var emailParams = aa.util.newHashtable();
getRecordParams4Notification(emailParams);
//"$$altID$$" "$$capName$$" "$$recordTypeAlias$$" "$$capStatus$$" 
//"$$fileDate$$"  "$$balanceDue$$" "$$workDesc$$"

getAPOParams4Notification(emailParams);
//"$$addressLine$$" "$$parcelNumber$$" "$$ownerFullName$$" "$$ownerPhone$$" 
//"$$ownerEmail$$" "$$ownerAddr$$" "$$ownerCity$$" "$$ownerState$$" "$$ownerZip$$"

//Gets Complainant Info
addParameter(emailParams, "$$compName$$", getAppSpecific("Complainant"));
addParameter(emailParams, "$$compAddr$$", getAppSpecific("Complainant Address"));
addParameter(emailParams, "$$compCity$$", getAppSpecific("Complainant City"));
addParameter(emailParams, "$$compState$$", getAppSpecific("Complainant State"));
addParameter(emailParams, "$$compZip$$", getAppSpecific("Complainant ZIP"));
addParameter(emailParams, "$$compEmail$$", getAppSpecific("Complainant Email"));
addParameter(emailParams, "$$compPhone$$", getAppSpecific("Complainant Phone"));

//Get contacts' emails
var contactsEmail = aa.util.newHashMap();
if (getContactByType("Agent", capId))
    addParameter(contactsEmail, 'Agent', getContactEmailByContactType("Agent", capId));

if (getContactByType("Business", capId))
    addParameter(contactsEmail, 'Business', getContactEmailByContactType("Business", capId));

if (getContactByType("Property Management Company", capId))
    addParameter(contactsEmail, 'Property Management Company', getContactEmailByContactType("Property Management Company", capId));

if (getContactByType("Responsible Party", capId))
    addParameter(contactsEmail, 'Responsible Party', getContactEmailByContactType("Responsible Party", capId));

if (getContactByType("Tenant", capId))
    addParameter(contactsEmail, 'Tenant', getContactEmailByContactType("Tenant", capId));

addParameter(contactsEmail, 'Owner', emailParams.get("$$ownerEmail$$"));

if (wfTask == "Complaint Received") {
    if (wfStatus == "Referred") {
        if (AInfo["Foresthill Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "Foresthill Fire") + ";";
        if (AInfo["North Tahoe Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "North Tahoe Fire") + ";";
        if (AInfo["NorthStar Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "NorthStar Fire") + ";";
        if (AInfo["Olympic Valley Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "Olympic Valley Fire") + ";";
        if (AInfo["Penryn Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "Penryn Fire") + ";";
        if (AInfo["Placer Hills Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "Placer Hills Fire") + ";";
        if (AInfo["South Placer Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "South Placer Fire") + ";";
        if (AInfo["Truckee Fire"] == "CHECKED")
            emailTo += lookup("SDL: HV_Ref_Agencies", "Truckee Fire") + ";";
        if (AInfo["Other"] == "CHECKED")
            emailTo += AInfo["Referral Agency Email"] + ";";

        //Sending Referral Email to agencies
        emailReult = sendNotification(emailFrom, emailTo, emailCC, "HV_REFERRAL_AGENCIES_NOTIFICATION", emailParams, null);

        //Sending Referral info to complainant
        emailTo = emailParams.get("$$compEmail$$");
        reportName = "Referral Letter";
        reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Referral_Letter_" + capIDString + ".pdf");
        if (!matches(emailTo, "", " ", null) && emailTo.indexOf('@') != -1) {
            addParameter(emailParams, "$$emailSubject$$", "REFERRAL LETTER - CASE# " + capIDString);
            emailReult = sendNotification(emailFrom, emailTo, emailCC, generalEmailTemp, emailParams, new Array(reportFile));
        }
    }
}

if (wfTask == "Inspection") {
    if (wfStatus == "Unfounded") {
        reportName = "Unfounded Outcome Letter";
        addParameter(emailParams, "$$emailSubject$$", "COMPLAINT OUTCOME LETTER");
        emailTo = emailParams.get("$$compEmail$$");
        if (aa.reportManager.getReportInfoModelByName(reportName) && !(isEmptyOrNull(emailTo)) && emailTo.indexOf('@') != -1){
            reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Complaint_Outcome_Letter_" + capIDString + ".pdf");        
            emailResult = sendNotification(emailFrom, emailTo, emailCC, generalEmailTemp, emailParams, new Array(reportFile));
        }
    }

    if (wfStatus == "Complied Voluntarily")
        editAppSpecific("Compliance Date", wfDateMMDDYYYY);

    if(wfStatus == "Educational Outreach"){
        //TBD ...
        //send template email with no attachment for now
        emailTo = getAppSpecific("Complainant Email");
        if(!(isEmptyOrNull(emailTo)) && emailTo.indexOf('@') != -1)
            emailResult = sendNotification(emailFrom, emailTo, emailCC, generalEmailTemp, emailParams, null);
    }


    if (wfStatus == "Violation") {
        editAppSpecific("Date Non-compliance Determined", wfDateMMDDYYYY);

        //resetting ACTION Task's TSI fields (next task)
        editTaskSpecific("Action", "ACT_Agent", null);
        editTaskSpecific("Action", "ACT_Business", null);
        editTaskSpecific("Action", "ACT_Owner", null);
        editTaskSpecific("Action", "ACT_Property Management Company", null);
        editTaskSpecific("Action", "ACT_Responsible Party", null);
        editTaskSpecific("Action", "ACT_Tenant", null);

        editTaskSpecific("Action", "InspectionNumber", "");
        editTaskSpecific("Action", "Inspection Date", "");
        editTaskSpecific("Action", "Reinspection Date", "");
    }
}

if (wfTask == "Action") {
    if (wfStatus == "NOHVI") {
        reportName = "NOHVI Letter";
        emailSubject = "NOHVI LETTER - CASE# " + capIDString;
        newFileName = "NOHVI_Letter.pdf";
        runReportAttachEmail4HVContacts(newFileName, emailSubject);
        editAppSpecific("Date of First NOVOTA", wfDateMMDDYYYY);
        //Inspection setup on ASI 'Reinspection Date'
        var dateToSchdl = AInfo["Reinspection Date"];
        var iType = "Site Inspection";
        var inspectorID = getAssignedToStaff();
        scheduleInspectDate(iType, dateToSchdl, inspectorID);
    }

    if (wfStatus == "NOVOTA") {  //NOVOTA
        reportName = "NOVOTA Letter";
        emailSubject = "NOVOTA LETTER - CASE# " + capIDString;
        newFileName = "NOVOTA_Letter.pdf";

        //Abe 09/24/2024: Commented this since NOVOTA ONLY sent to OWNER!!!!!!!!
        //runReportAttachEmail4HVContacts(newFileName, emailSubject);

        //addParameter(reportParams, "wfTask", "ACTION");
        //addParameter(reportParams, "contactType", "Owner");
        reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, newFileName);
        addParameter(emailParams, "$$emailSubject$$", emailSubject);
        var vOwnerEmail = contactsEmail.get('Owner');
        if (reportFile && !(isEmptyOrNull(vOwnerEmail)) && vOwnerEmail.indexOf('@') != -1)
            emailResult = sendNotification(emailFrom, vOwnerEmail, emailCC, generalEmailTemp, emailParams, new Array(reportFile));

        editTaskSpecific("Appeal", "NOVOTA Issued Date", wfDateMMDDYYYY);
        editTaskSpecific("Appeal", "NOVOTA Appeal Received Date", ""); //reset TSI
        editAppSpecific("Date of Final NOVOTA", wfDateMMDDYYYY);    //ASI
        editAppSpecific("Appeal Deadline", dateAdd(wfDateMMDDYYYY, 15)); //NOVOTA Appeal Deadline

        closeTask("Action", "NOVOTA", "Closed by WTUA Script", "");
        deactivateTask("Abatement Processing");
        activateTask("Appeal");

        // updateAppStatus("Awaiting Appeal - NOVOTA", "Updated by WTUA script");

        // var cExpireDateObj = aa.date.parseDate(aa.date.addDate(wfDateMMDDYYYY, 15)); //creating date obj
        // addAppCondition_Abe("HazVeg - 15 Days Hold", "Applied",
        //     "NOVOTA - 1st 15-Day Hold", "Applied by Script: \n Case is on hold for 15 days from issuing NOVOTA",
        //     "Hold", cExpireDateObj, wfActionByObj, null);
    }

    if (wfStatus == "Administrative Citation") {
        //resetting CITATION Task's TSI fields
        editTaskSpecific("Citation", "CIT_Agent", null);
        editTaskSpecific("Citation", "CIT_Business", null);
        editTaskSpecific("Citation", "CIT_Owner", null);
        editTaskSpecific("Citation", "CIT_Property Management Company", null);
        editTaskSpecific("Citation", "CIT_Responsible Party", null);
        editTaskSpecific("Citation", "CIT_Tenant", null);

        editTaskSpecific("Citation", "Certified Mail", null);
        editTaskSpecific("Citation", "Certified Mail Number", "");
        editTaskSpecific("Citation", "Personally Served", null);
        editTaskSpecific("Citation", "Property Posted", null);
    }

    if(wfStatus == "Abatement")
        editAppSpecific("Abatement Warrant", wfDateMMDDYYYY);
}

if (wfTask == "Appeal") {
    // if (wfStatus == "Citation Appeal Received")
    //     editTaskSpecific("Appeal", "Citation Appeal Received Date", wfDateMMDDYYYY);

    // if (wfStatus == "NOVOTA Appeal Received")
    //     editTaskSpecific("Appeal", "NOVOTA Appeal Received Date", wfDateMMDDYYYY);

    if (matches(wfStatus, "Citation Appeal Received", "NOVOTA Appeal Received")) {
        //resetting Hearing Task TSIs
        editTaskSpecific("Administrative Hearing", "ADM_Agent", "");
        editTaskSpecific("Administrative Hearing", "ADM_Business", "");
        editTaskSpecific("Administrative Hearing", "ADM_Owner", "");
        editTaskSpecific("Administrative Hearing", "ADM_Property Management Company", "");
        editTaskSpecific("Administrative Hearing", "ADM_Responsible Party", "");
        editTaskSpecific("Administrative Hearing", "ADM_Tenant", "");
    }

    if (wfStatus == "No Citation Appeal Received") {
        activateTask("Fine Processing");
        //updateAppStatus("Fine Processing", "Updated by WTUA Script - Citation Appeal");
    }


    if (wfStatus == "No NOVOTA Appeal Received") {      
        
        var dateToSchdl = AInfo["Appeal Reinspection Date"];
        var iType = "Site Inspection";
        var inspectorID = getAssignedToStaff();
        scheduleInspectDate(iType, dateToSchdl, inspectorID);        
    }
}

if (wfTask == "Citation" && matches(wfStatus, "1st Citation", "2nd Citation", "3rd Citation")) {
    //generate report (no Email)
    reportName = "Citation Letter";
    newFileName = "Citation_Letter.pdf";
    runReportAttachEmail4HVContacts(newFileName);

    //case on hold for 10 days
    // var cExpireDateObj = aa.date.parseDate(aa.date.addDate(wfDateMMDDYYYY, 10)); //creating date obj
    // addAppCondition_Abe("HazVeg - 10 Days Hold", "Applied",
    //     "CITATION - 10-Day Hold", "Applied by Script: \n Case is on hold for 10 days from issuing Citation",
    //     "Hold", cExpireDateObj, wfActionByObj, null);

    //write citation date TSI and ASI fields 
    editTaskSpecific("Appeal", "Citation Issued Date", wfDateMMDDYYYY);
    editTaskSpecific("Appeal", "Citation Appeal Received Date", ""); //reset TSI

    editAppSpecific("Date of Administrative Citation", wfDateMMDDYYYY);
    editAppSpecific("Citation Appeal Deadline", dateAdd(wfDateMMDDYYYY, 10));

    if (AInfo["Certified Mail"] == 'CHECKED')
        editAppSpecific("NOVOTA Issued via", "Certified Mail; Mail#: " + AInfo["Certified Mail Number"]);
    else if (AInfo["Personally Served"] == 'CHECKED')
        editAppSpecific("NOVOTA Issued via", "Personally Served");
    else if (AInfo["Property Posted"] == 'CHECKED')
        editAppSpecific("NOVOTA Issued via", "Property Posted");

    activateTask("Appeal");
}

if (wfTask == "Administrative Hearing" && matches(wfStatus, "Pending Hearing", "Continued")) {
    reportName = "Hearing Letter";

    logDebug(getTaskStatusForEmail("Appeal", "HV_NEW_PROCESS").indexOf('Citation'));

    if (getTaskStatusForEmail("Appeal", "HV_NEW_PROCESS").indexOf('NOVOTA') != -1)
        addParameter(reportParams, "appealType", "NOVOTA");
    else if (getTaskStatusForEmail("Appeal", "HV_NEW_PROCESS").indexOf('Citation') != -1)
        addParameter(reportParams, "appealType", "CITATION");
    else
        addParameter(reportParams, "appealType", "N/A");


    emailSubject = "APPEAL HEARING";
    newFileName = "Hearing_Letter.pdf";
    runReportAttachEmail4HVContacts(newFileName, emailSubject);

    editAppSpecific("Hearing Date", AInfo["WF Hearing Date"]);
}

//Following Statuses shouldn't update the AppStatus if Final Processing is active
if ((wfTask == "Administrative Hearing" && wfStatus == "Dismissed") ||
    (wfTask == "Abatement Processing" && wfStatus == "Complied") ||
    (wfTask == "Inspection" && wfStatus == "Complied Voluntarily"))
    if (isTaskActive("Fine Processing")) {
        logDebug("KOUROSH*******>>>>>> " + taskStatus("Fine Processing"));
        if (matches(taskStatus("Fine Processing"), undefined, "", null)) updateAppStatus("Fine Processing");
        if (matches(taskStatus("Fine Processing"), "Request for Payment", "2nd Request")) updateAppStatus("Payment Requested");
        if (taskStatus("Fine Processing") == "Collections") updateAppStatus("Collections");
        if (taskStatus("Fine Processing") == "Lien") updateAppStatus("Lien");
        if (taskStatus("Fine Processing") == "Payment Plan") updateAppStatus("Payment Plan");
    }
    else
        updateAppStatus("Resolved");

//sending Fine Processing to staff
if ((wfTask == "Abatement Processing" && wfStatus == "Abatement Complete") ||
    (wfTask == "Citation" && wfStatus == "Complied") ||
    (wfTask == "Appeal" && wfStatus == "No Citation Appeal Received")) {

        //sending Notification to Staff #12
        if(getAssignedToStaff())
            emailTo = getUserEmail(getAssignedToStaff());
        emailResult = sendNotification(emailFrom, emailTo, "", "HV_FINE_PROCESSING_STAFF_NOTIFICATION", emailParams, null);
}

if(wfTask == "Abatement Processing" && matches(wfStatus, "Abatement Complete", "Complied"))
    editAppSpecific("Nuisance Abated Date", wfDateMMDDYYYY);


if (wfTask == "Fine Processing") {
    if (wfStatus == "Request for Payment") {
        reportName = "First Invoice Cover Ltr";
        //create Report (No Email)
        runReportAttachEmail4HVContacts("Invoice_Cover_Letter_1.pdf", "");

        //create hold flag with Expiration date
        // var cExpireDateObj = aa.date.parseDate(aa.date.addDate(wfDateMMDDYYYY, 30)); //creating date obj
        // addAppCondition_Abe("HazVeg - 30 Days Hold", "Applied",
        //     "1st Invoice - 30-Day Hold", "Applied by Script: \n Case is on hold for 30 days from issuing 1st invoice",
        //     "Hold", cExpireDateObj, wfActionByObj, null);
        //ASI field
        editAppSpecific("Payment Request Date", wfDateMMDDYYYY); //'1st Payment Request Date' ASI Field 
        editAppSpecific("1st Payment Request Deadline", dateAdd(wfDateMMDDYYYY, 30));
    }
    if (wfStatus == "2nd Request") {
        reportName = "Second Invoice Cover Ltr";
        runReportAttachEmail4HVContacts("Invoice_Cover_Letter_2.pdf", "");

        // var cExpireDateObj = aa.date.parseDate(aa.date.addDate(wfDateMMDDYYYY, 15)); //creating date obj
        // addAppCondition_Abe("HazVeg - 15 Days Hold", "Applied",
        //     "2nd Invoice - 15-Day Hold", "Applied by Script: \n Case is on hold for 15 days from issuing 2nd invoice",
        //     "Hold", cExpireDateObj, wfActionByObj, null);
        //update ASI fields
        editAppSpecific("2nd Payment Request Date", wfDateMMDDYYYY);
        editAppSpecific("2nd Payment Request Deadline", dateAdd(wfDateMMDDYYYY, 15));
    }

    if(wfStatus == "Fines Paid")
        editAppSpecific("Payment Received Date", wfDateMMDDYYYY);

    if(wfStatus == "Lien Resolved")
        editAppSpecific("Lien Applied Date", wfDateMMDDYYYY);

    if (isTaskActive("Inspection"))
        updateAppStatus("Inspection", "updated by Script WTUA - Fine Processing");


}
//End of IT Request # 1986 - HazVeg Workflow Revise  



//supporting old wf critical step
if (wfProcess == "H_MAIN") {
	if (wfTask == "Close out" && wfStatus == "Close Out") {
		cType = "Hazardous Vegetation";
		cDesc = "Case Active Hazardous Vegetation Case";
		parcelNum = emailParams.get("$$parcelNumber$$");
		removeParcelCondition(parcelNum,cType,cDesc);
	}
}



/* *
 * * ============================================   
 * *  Internal Functions Required for the WTUA Script
 * * =============================================  
 * */

function runReportAttachEmail4HVContacts() {

    var newFileName = "Defualt_Name";
    var emailSubject = "N/A";
    if (arguments.length > 0) {
        newFileName = arguments[0];
        emailSubject = arguments[1];
    }

    var prefix = "";
    if (wfTask == 'Action') {
        prefix = "ACT_";
        addParameter(reportParams, "wfTask", "ACTION");
    }
    else if (wfTask == 'Citation') {
        prefix = "CIT_";
        addParameter(reportParams, "wfTask", "CITATION");
    }
    else if (wfTask == 'Fine Processing') {
        prefix = "FIN_";
        addParameter(reportParams, "wfTask", "FINE");
    }
    else if (wfTask == 'Administrative Hearing') {
        prefix = "ADM_";
        addParameter(reportParams, "wfTask", "HEARING");
    }

    // var vContacts = aa.util.newHashMap();
    var vContacts = {};
    // Filling in the hashTable
    if (AInfo[prefix + "Agent"] == "CHECKED")
        vContacts['Agent'] = contactsEmail.get('Agent');
    if (AInfo[prefix + "Business"] == "CHECKED")
        vContacts['Business'] = contactsEmail.get('Business');
    if (AInfo[prefix + "Owner"] == "CHECKED")
        vContacts['Owner'] = contactsEmail.get('Owner');
    if (AInfo[prefix + "Property Management Company"] == "CHECKED")
        vContacts['Property Management Company'] = contactsEmail.get('Property Management Company');
    if (AInfo[prefix + "Responsible Party"] == "CHECKED")
        vContacts['Responsible Party'] = contactsEmail.get('Responsible Party');
    if (AInfo[prefix + "Tenant"] == "CHECKED")
        vContacts['Tenant'] = contactsEmail.get('Tenant');

    for (var iContact in vContacts) {
        // logDebug(iContact + "= " + vContacts[iContact]);
        addParameter(reportParams, 'contactType', iContact);
        // logDebug("contactType= " + reportParams.get('contactType'));
        //logDebug(reportParams);
        reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, newFileName);
        //change doc name*****************
        if (reportFile) {
            var docList = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
            docList[docList.length - 1].setDocName(iContact + "_" + newFileName); //last Document just uploaded
            docList[docList.length - 1].setFileName(iContact + "_" + newFileName); //last Document just uploaded
            aa.document.updateDocument(docList[docList.length - 1]);
        }

        if (!matches(prefix, "CIT_", "FIN_")) //No email for Citation and Invoice Cover
            if (!matches(vContacts[iContact], "", " ", null) && vContacts[iContact].indexOf('@') != -1) {
                addParameter(emailParams, "$$emailSubject$$", emailSubject);
                // logDebug(emailParams);                
                emailResult = sendNotification(emailFrom, vContacts[iContact], emailCC, generalEmailTemp, emailParams, new Array(reportFile));
                // logDebug("emailResult = " + emailResult);
            }
    }
}

function getTaskStatusForEmail(taskDesc, processCode) {
    // returns a string of task statuses for a workflow group
    var returnStr = ""
    var taskResult = aa.workflow.getTaskItems(capId, taskDesc, processCode, "Y", null, null);
    if (taskResult.getSuccess()) {
        var taskArr = taskResult.getOutput();
    } else {
        logDebug("**ERROR: getting tasks : " + taskResult.getErrorMessage());
        return false
    }

    for (xx in taskArr)
        if (taskArr[xx].getProcessCode().equals(processCode) && taskArr[xx].getCompleteFlag().equals("Y")) {
            // returnStr += "Task Name: " + taskArr[xx].getTaskDescription() + "\n";
            // returnStr += "Task Status: " + taskArr[xx].getDisposition() + "\n";
            returnStr = taskArr[xx].getDisposition();
            // if (taskArr[xx].getDispositionComment() != null)
            // 	returnStr += "Task Comments: " + taskArr[xx].getDispositionComment() + "\n";
            // returnStr += "\n";
        }
    logDebug(returnStr);
    return returnStr;
}  //- UPDATE FROM SCRIPT TEST
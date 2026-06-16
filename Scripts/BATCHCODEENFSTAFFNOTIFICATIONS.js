/*------------------------------------------------------------------------------------------------------/
| Program: BATCHCodeEnfStaffNotifications.js    Trigger: Batch        Client : Placer County
| Batch Job Name: CodeEnfStaffReminders
|
| Version 1.0 - Base Version. 04/22/2026, Abe Aftahi
| 
| Designed for EMSE 3.0
|
| Description of Intended Functionality: TBD

|         ASI fields to check:
|                         Citation Issuance Date
|                         First Payment Request Date
|                         Subsequent Payment Request Date
|                         Nuisance Abatement Upheld Date 
|                         Nuisance Letter Issuance Date
|                         Citation Upheld Date
|                         NOV Expiration Date
|
| Criteria: 
|                         AppStatus = 
|                         AppStatus = 
|   
| Modified By: 
|               
|                                
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var documentOnly = false;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", "PLACERCO", useCustomScriptFile));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "PLACERCO", useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM", "PLACERCO", useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM_GLOBALS", "PLACERCO", useCustomScriptFile));


if (documentOnly) {
    doStandardChoiceActions(controlString, false, 0);
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
    aa.abortScript();
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

var showMessage = true; 		    // Set to true to see debug messages in event log and email confirmation
var maxSeconds = 5 * 60; 			// number of seconds allowed for batch processing, usually < 5*60
var documentOnly = false; 			// Document Only -- displays hierarchy of std choice steps
/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Batch Specific Variables
/------------------------------------------------------------------------------------------------------*/
// Global variables
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var timeExpired = false;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var sysDate = aa.date.getCurrentDate();
var paramsCurrentCompareDt = dateAdd(null, 0);
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var capId;                        // Variable used to hold the Cap Id value.

var senderEmailAddr = defaultFrom;
var vFromEmail = defaultFrom;
var emailAddrAdmin = "eaftahi@placer.ca.gov";          
var ccEmailAddrAdmin = "";  
var emailTemplate = "CE_STAFF_NOTIFICATION"; 
var emailContentStr = "";
var emailSubject = "";

var emailText = "";

// Parameter variables for records to process
var paramsAppGroup = "Code";
var paramsAppPerType = "Enforcement";
var paramsAppStatusArray = new Array("Unfounded", "Void", "Referred & Closed", "Withdrawn", "Duplicate","No Violation"); //Exception cases
var paramsAppSubGroupName = "CASE DATES";                     	
var paramsAppSpecInfoLabelArray = new Array("Citation Issuance Date","First Payment Request Date", "Subsequent Payment Request Date","Nuisance Abatement Upheld Date","Nuisance Letter Issuance Date","Citation Upheld Date", "NOV Expiration Date"); 	
var paramsStartDt = null;                    // Start Date for the batch script to select records on Expiration Date.
var paramsEndDt = null;                     // End Date for the batch script to select records on Expiration Date.

var paramsOK = true;
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

/** Template items
 *  CASE #: $$altID$$
    LOCATION: $$addressLine$$
    APN: $$parcelNumber$$
    $$contentString$$
 * 
*/        
if (paramsOK) {
    var totalCount = 0;
    var vCount = 0;
    logMessage("START: of Batch Job: " + batchJobName + ".");
    var vGetCapResult = null;

    for (var i in paramsAppSpecInfoLabelArray) {
        if (paramsAppSpecInfoLabelArray[i] == "Citation Issuance Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, -12));      //12-day hold after citation issuance date
            paramsEndDt = aa.date.parseDate(dateAdd(null, -12));
            emailContentStr = "The 12-day hold following issuance of a citation on the above referenced case has expired and no appeal has been received.\nPlease move forward with the appropriate action.";
            emailSubject = "APPEAL HOLD EXPIRED ";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult,vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -12));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " +vAsiLable + " at " + dateAdd(null, -12) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
        if (paramsAppSpecInfoLabelArray[i] == "Citation Upheld Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, -30));      //12-day hold after citation issuance date
            paramsEndDt = aa.date.parseDate(dateAdd(null, -30));
            emailContentStr = "The 30-day hold following an upheld citation on the above referenced case has expired. Please move forward with Enforcement action.";
            emailSubject = "30 DAY HOLD EXPIRED";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult, vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
        if (paramsAppSpecInfoLabelArray[i] == "Nuisance Letter Issuance Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, -30));      //12-day hold after citation issuance date
            paramsEndDt = aa.date.parseDate(dateAdd(null, -30));
            emailContentStr = "The 30-day hold following of a nuisance letter on the above referenced case has expired. Please reinspect to determine if the case remains in violation. <br>";
            emailContentStr += "If still in violation, an abatement hearing should be scheduled."
            emailSubject = "NUISANCE HOLD EXPIRED";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult, vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
            if (paramsAppSpecInfoLabelArray[i] == "Nuisance Abatement Upheld Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, -30));      //12-day hold after citation issuance date
            paramsEndDt = aa.date.parseDate(dateAdd(null, -30));
            emailContentStr = "The 30-day hold following an upheld abatement hearing on the above referenced case has expired. Please reinspect to determine if the case remains in violation. <br>";
            emailContentStr += "If still in violation, begin abatement processing."
            emailSubject = "ABATEMENT HOLD EXPIRED";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult, vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
        if (paramsAppSpecInfoLabelArray[i] == "First Payment Request Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, -30));      //12-day hold after citation issuance date
            paramsEndDt = aa.date.parseDate(dateAdd(null, -30));
            emailContentStr = "The above referenced case has passed its 30-day invoce payment window and ready for the next action.<br>";
            emailContentStr += "Please take the appropriate next steps."
            emailSubject = "FIRST INVOICE PAYMENT EXPIRATION";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult, vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -30) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
        if (paramsAppSpecInfoLabelArray[i] == "Subsequent Payment Request Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, -15));      //12-day hold after citation issuance date
            paramsEndDt = aa.date.parseDate(dateAdd(null, -15));
            emailContentStr = "The above referenced case has passed its 15-day invoce payment window and ready for the next action.<br>";
            emailContentStr += "Please take the appropriate next steps."
            emailSubject = "SUBSEQUENT INVOICE PAYMENT EXPIRATION";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult, vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -15));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, -15) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
        if (paramsAppSpecInfoLabelArray[i] == "NOV Expiration Date") {
            var vAsiLable = paramsAppSpecInfoLabelArray[i];
            paramsStartDt = aa.date.parseDate(dateAdd(null, 0));      //NOV Expired Today
            paramsEndDt = aa.date.parseDate(dateAdd(null, 0));             

            emailContentStr = "The waiting period following issuance of the NOV for the above referenced case has expired.<br>";
            emailContentStr += "Please reinspect to determine if the case remains in violation. If still in violation, move forward with the appropriate enforcement action."
            emailSubject = "NOV Waiting Period Expired";
            vGetCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, vAsiLable, paramsStartDt, paramsEndDt);
            vCount = sendStaffNotifications(vGetCapResult, vAsiLable, paramsStartDt, emailSubject, emailContentStr);

            aa.print("Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, 0));
            aa.print("*****************");

            emailText += "Number of records processed = " + vCount + " with " + vAsiLable + " at " + dateAdd(null, 0) + "<br>";
            emailText += "*****************" + "<br>";            
            totalCount += vCount;
        }
    }
    
    aa.print("Total Number of Code Enforcment Notifications sent to staff today is: " + totalCount);
    emailText += "Total Number of Code Enforcement Notifications sent to staff today is: " + totalCount;
    aa.sendEmail(senderEmailAddr, emailAddrAdmin, ccEmailAddrAdmin, "CE Notifications 2 Staff - " + batchJobName, emailText, null);    
}


aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function sendStaffNotifications(getCapResult, paramsAppSpecInfoLabel, vDate, vEmaileSubject, emailContent) {
    var capCount = 0;
    var processFlag = false;
    //emailText = "";

    if (!getCapResult.getSuccess()) {
        logDebug("ERROR: getting caps by app type: " + getCapResult.getErrorMessage() + ".");
        aa.print("ERROR: getting caps by app type: " + getCapResult.getErrorMessage() + ".")
        return 0;
    }

    var csmArray = getCapResult.getOutput(); //array of CapScriptModel objects

    if (csmArray.length == 0) {
        return 0;
    }

    for (var i in csmArray) {

        if (elapsed() > maxSeconds) {

            logDebug("WARNING", "A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
            timeExpired = true;
            break;
        }

        // define cap variables //
        capId = csmArray[i].getCapID(); // CapIDModel Object
        var cap = aa.cap.getCap(capId).getOutput();
        var capGroup = cap.getCapType().getGroup(); // Cap Type Group
        var capPerType = cap.getCapType().getType(); // Cap Per Type Group
        var capSubType = cap.getCapType().getSubType(); //
        var capPerCategory = cap.getCapType().getCategory();
        var alias = cap.capModel.getAppTypeAlias();
        var capStatus = cap.getCapStatus(); //Moved: Terry Dunn
        var capId1 = capId.getID1();
        var capId2 = capId.getID2();
        var capId3 = capId.getID3();
        var capIdObject = getCapIdBatch(capId1, capId2, capId3); // call internal function
        var capIDString = capIdObject.getCustomID(); // Alternate Cap ID string
        var capModule = cap.capModel.getModuleName();

        var emailTo = "";
        var staffUsername = getAssignedToStaff(capId); // option CapId            
        if (staffUsername != null && staffUsername != "")
            if (getUserEmail(staffUsername).indexOf("@") > 0) {
                logMessage("Info", "Successfully retrieved email address for " + staffUsername);
                emailTo = getUserEmail(staffUsername);
            }
            else {
                logMessage("Warning", "Couldn't retrieve email address for " + staffUsername + ", no valid email address");
                emailText += "Error: Couldn't retrieve email address for " + staffUsername + ", for record# " + capIDString + "<br>";
            }

        var defaultEmail = (getAppSpecific("Project Office", capId) == "Auburn") ? "CodeEnforce@placer.ca.gov" : "CodeEnforceTahoe@placer.ca.gov";
        var recordsAsiDate = getAppSpecific(paramsAppSpecInfoLabel,capId);
		
		
        /* Process records if condition is met */
        if (!(exists(capStatus, paramsAppStatusArray))) {
            if (paramsAppSpecInfoLabel == "Citation Issuance Date" && isTaskActive("Appeal"))
                processFlag = true;

            if (paramsAppSpecInfoLabel == "Citation Upheld Date" && (isTaskActive("Enforcement Action")||isTaskActive("Fine Processing")) && isTaskStatus("Administrative Hearing", "Citation Upheld") )
                processFlag = true;

            if (paramsAppSpecInfoLabel == "Nuisance Letter Issuance Date" && isTaskActive("Nuisance Outcome"))
                processFlag = true;

            if (paramsAppSpecInfoLabel == "Nuisance Abatement Upheld Date" && isTaskActive("Reinspection Outcome") && isTaskStatus("Abatement Hearing", "Abatement upheld") )
                processFlag = true;

            if (paramsAppSpecInfoLabel == "First Payment Request Date" && isTaskActive("Fine Processing") && isTaskStatus("Fine Processing", "Request for Payment") )
                processFlag = true;

            if (paramsAppSpecInfoLabel == "Subsequent Payment Request Date" && isTaskActive("Fine Processing") && isTaskStatus("Fine Processing", "Subsequent Payment Request") )
                processFlag = true;

            if (paramsAppSpecInfoLabel == "NOV Expiration Date" && isTaskActive("Enforcement Action"))
                processFlag = true;
        }  
        

        if (processFlag && capGroup == paramsAppGroup && capPerType == paramsAppPerType) {
			aa.print("Record number = " + capIDString + ". " + paramsAppSpecInfoLabel+ " = "+ recordsAsiDate + ". Cap status: " + capStatus);
            emailText += "Record number = " + capIDString + ". " + paramsAppSpecInfoLabel+ " = "+recordsAsiDate + ". Cap status: " + capStatus + "<br>";
			
			// Set Email Parameters //
            var emailParameters = aa.util.newHashtable();						
			getRecordParams4Notification(emailParameters); // Parameters returned: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
            getAPOParams4Notification(emailParameters);  //$$addressLine$$, $$parcelNumber$$, $$ownerFullName$$","$$ownerPhone$$","$$ownerEmail$$", "$$ownerAddr$$","$$ownerCity$$","$$ownerState$$","$$ownerZip$$"
            addParameter(emailParameters,"$$contentString$$", emailContent); //email text
            addParameter(emailParameters,"$$emailSubject$$", vEmaileSubject);

			// Send notification template email //
			emailResult = sendNotification(vFromEmail, emailTo, "", emailTemplate, emailParameters, null);
	        capCount++;

            if(emailResult){
                aa.print("Notification Successfully sent to " + emailTo +".");
                emailText += "Notification Successfully sent to " + emailTo +".<br>";
            }
        }
    }	
    return capCount;
}
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}

function getCapIdBatch(pid1, pid2, pid3) {

    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if (s_capResult.getSuccess())
        return s_capResult.getOutput();
    else {
        logDebug("ERROR: CAP # " + capId.getCustomID() + ", Failed to get capId: " + s_capResult.getErrorMessage());
        return null;
    }
}

/*
function getParam(pParamName) //gets parameter value and logs message showing param value
{
    var ret = "" + aa.env.getValue(pParamName);
    logMessage("PARAMETER: " + pParamName + " = " + ret);
    return ret;
}


function getContactEmailByContactType(pContactType, capid) {
    //Invoice Contact
    //Responsible Official
    // Returns the email address for the first Contact found on a Record with Contact Type = pContactType parameter
    // optional capid parameter
    // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
    // on ASA it should still be pulled normal way even though still partial cap
    var thisCap = capid;
    if (arguments.length == 2) thisCap = arguments[1];

    var cArray = new Array();

    if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
    {
        capContactArray = cap.getContactsGroup().toArray();
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(thisCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
        }
    }

    var contactEmailToReturn = "";
    var contactTypeForCompare = "";

    if (capContactArray) {
        for (yy in capContactArray) {
            contactTypeForCompare = capContactArray[yy].getPeople().contactType;

            if (contactTypeForCompare == pContactType) {
                contactEmailToReturn = capContactArray[yy].getPeople().email;
                logDebug("DEBUG: Found Contact with Type = " + pContactType + ".  Email address for Contact = " + contactEmailToReturn);
                break;
            }
        }
    }

    if (contactEmailToReturn == null) {
        contactEmailToReturn = "";
    }

    logDebug("Returning contact email address: " + contactEmailToReturn);
    return contactEmailToReturn;
}

function getACARecordParam4NotificationBatch(params, acaUrl) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaRecordUrl$$", getACARecordURLBatch(acaUrl));

    return params;
}

function getACARecordURLBatch(acaUrl) {

    var acaRecordUrl = "";
    var id1 = capId.ID1;
    var id2 = capId.ID2;
    var id3 = capId.ID3;

    acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";
    acaRecordUrl += "&Module=" + capModule;
    acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
    acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

    return acaRecordUrl;
}
  */  
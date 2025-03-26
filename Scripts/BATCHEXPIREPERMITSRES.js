/*------------------------------------------------------------------------------------------------------/
| Program: batchExpirePermitsRes  Trigger: Batch    Client : Placer County
|
| Version 1.0 - Base Version. Modified from 'batchEmailExpire' scripts. 01/31/2015, Terry Dunn TPS.
|
|
| Designed for EMSE 2.0
|
| Description of Intended Functionality: Script is executed daily. Tests for Expiration dates older than
| 'today'. Expires permit when criteria is met
|
| Criteria:
|   Permit is not closed
|   ASI Expiration date is < 'today'.
|   appGroup = "Building"
|
|
|               TDunn, TPS,      10/26/2023  - Modified to include PV Solar/SolarApp record type
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true; 				// Set to true to see debug messages in event log and email confirmation
var maxSeconds = 10 * 60; 			// number of seconds allowed for batch processing, usually < 5*60
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
var paramsCurrentCompareDt = dateAdd(null, -1);
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var capId;                                                                          // Variable used to hold the Cap Id value.

// email parameters for batch results, must be added to batch job.  if a second one is needed, change the second value from "" to a parameter.
var senderEmailAddr = "noreply@placer.ca.gov";                                      // Email address of the sender
var emailAddrAdmin = getParam("emailAddrAdmin");                                    // This must be added to batch job parameters. 
var ccEmailAddrAdmin = getParam("ccEmailAddrAdmin");                                // This must be added to batch job parameters. 
// email parameters for the Notification Email
var ccEmailAddr = getParam("ccEmailAddr");                                          // This is the cc email address. This must be added to batch job parameters.
// Result admin email text
var emailText = "";
var emailText1 = "";
var emailText2 = "";


// Parameter variables to process records
var paramsAppGroup = "Building";
var paramsAppPerType = "Residential";
var paramsAppSubTypeArray = new Array("Full Review", "Limited","PV Solar");
var paramsAppStatusArray = new Array("Expired", "Construction Complete", "Void", "Withdrawn", "DONE", "CANC");

var paramsAppSubGroupName = "EXTENSIONS AND EXPIRATION";                           // Application Spec Info Subgroup Name that the ASI field is associated to.
var paramsAppSpecInfoLabel = "Expiration Date";                                    // ASI field name that the batch script is to search.
var paramsStartDt = aa.date.parseDate(dateAdd(null,-1));                          // Start Date for the batch script to select records on Expiration Date.
var paramsEndDt = aa.date.parseDate(dateAdd(null,-1));                            // End Date for the batch script to select records on Expiration Date.
/*Note: Start Date and End Date are defaulted to use the current System Date.
|       To set the Start Date and End Date to specific values for a manual run
|       replace the following syntax dateAdd(null,-1) to a string date value
|       in the following format "MM/DD/YYYY".*/
var CapAddress = "";
var workDesc = "";
var permitName = "";

// Variables to be used to set record information or to define a function parameter
var newCapStatus = "Expired"; 					           // New Cap Status that will be applied.
var NotificationType = "Permit Expired Notice";            // Email notification template name

var paramsOK = true;
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    var totalCount = 0;
    logMessage("START", "Start of Batch Job: batchExpirePermitsRes.");

    var emailsentCount = ExpireNotice();

    logDebug("Sent " + emailsentCount + " Emails. System Date : " + new Date(paramsCurrentCompareDt).valueOf());
    logMessage("END", "End of Job: batchExpirePermitsRes, Elapsed Time : " + elapsed() + " Seconds.");
    emailText = "Residential Building Permits Expired: " + emailsentCount;
}

if (emailAddrAdmin.length)
    aa.sendMail(senderEmailAddr, emailAddrAdmin, ccEmailAddrAdmin, batchJobName + " Results", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function ExpireNotice() {
    var capCount = 0;
    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, paramsAppSpecInfoLabel, paramsStartDt, paramsEndDt);

    if (!getCapResult.getSuccess()) {
        logDebug("ERROR: getting caps by app type: " + getCapResult.getErrorMessage() + ".");
        return false;
    }

    var csmArray = getCapResult.getOutput(); //array of CapScriptModel objects

    for (i in csmArray) {

        if (elapsed() > maxSeconds) // only continue if time hasn't expired
        {
            logMessage("WARNING", "A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
            timeExpired = true;
            break;
        }

        // define cap variables
        capId = csmArray[i].getCapID(); // CapIDModel Object
        var cap = aa.cap.getCap(capId).getOutput(); //Moved: Terry Dunn
        var capGroup = cap.getCapType().getGroup(); // Cap Type Group
        var capPerType = cap.getCapType().getType(); // Cap Type Group
        var capSubType = cap.getCapType().getSubType(); //Moved: Terry Dunn
        var alias = cap.capModel.getAppTypeAlias();
        var capStatus = cap.getCapStatus(); //Moved: Terry Dunn
        var capId1 = capId.getID1();
        var capId2 = capId.getID2();
        var capId3 = capId.getID3();
        var capIdObject = getCapId(capId1, capId2, capId3); // call internal function
        var capIDString = capIdObject.getCustomID(); // Alternate Cap ID string

        // new address variables
        var thisAddress = "None";
        getCapAddress(capId);
        if (CapAddress != "") thisAddress = CapAddress;
        var parcelString = "None";
		
		// new Permit Description Variable
		var thisWorkDesc = "N/A";
		workDescGet(capId);
		if (workDesc != "") thisWorkDesc = workDesc;
		
		
		// new Permit Name Variable
		var thisPermitName = "N/A";
		getAppName(capId);
		if (permitName != "") thisPermitName = permitName;
		
        // get associated cap information
        var permitExpireDate = getAppSpecific("Expiration Date", capId);

        // Process records if condition is met //
        if (capGroup == paramsAppGroup && capPerType == paramsAppPerType && exists(capSubType, paramsAppSubTypeArray) && !exists(capStatus, paramsAppStatusArray)) {

            // Set Variables //
            var scopeCode = getAppSpecific("Scope of Work", capId);
            var planCheckOrPermit = "on"; // Email text for when expiration date is for Permit

            // Get Applicant Email //
            var contactType = "Applicant";
            var emailAddress = "";

            var capContactResult = aa.people.getCapContactByCapID(capId);
            if (capContactResult.getSuccess()) {
                var Contacts = capContactResult.getOutput();
                for (yy in Contacts)
                    if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
                    if (Contacts[yy].getEmail() != null)
                    emailAddress = "" + Contacts[yy].getEmail();
            }

            if (emailAddress.indexOf("@") > 0) {
                logMessage("Info", "Successfully retrieved email address for " + contactType);
            }
            else
                logMessage("Warning", "Couldn't retrieve email address for " + contactType + ", no valid email address");

            // Set Email Variables //
            var params = aa.util.newHashtable();
            params.put("$$PERMITEXPIREDATE$$", permitExpireDate);
            params.put("$$SCOPECODE$$", scopeCode);
            params.put("$$PLANCHECKORPERMIT$$", planCheckOrPermit);
            params.put("$$CUSTOMRECID$$", capIDString);
            params.put("$$RECORDALIAS$$", alias);
            params.put("$$CONTACTEMAIL$$", emailAddress);
            params.put("$$PERMITADDRESS$$", thisAddress);
			params.put("$$WORKDESC$$", thisWorkDesc);
			params.put("$$PERMITNAME$$", thisPermitName);
			params.put("$$CAPSTATUS$$", capStatus);

			
            // Update App Status //
            updateAppStatus(newCapStatus, "Updated by Script", capId);

            // Send email notice //
            sendNotification(senderEmailAddr, emailAddress, ccEmailAddr, NotificationType, params, null);
            // sendNotification(senderEmailAddr, "tdunn@truepointsolutions", ccEmailAddr, NotificationType, params, null); // Remark out line above and unremark this line for testing
            capCount++;
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

function getParam(pParamName) //gets parameter value and logs message showing param value
{
    var ret = "" + aa.env.getValue(pParamName);
    logMessage("PARAMETER", pParamName + " = " + ret);
    return ret;
}

function logMessage(etype,edesc) {
	//aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);  // No longer used due to creating signal log entries for records processed.
	aa.debug("Batch Process " + batchJobName, etype + " : " + edesc);
        aa.print(etype + " : " + edesc);
	emailText+=etype + " : " + edesc + "<br />";
	}

function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
        aa.print("DEBUG : " + edesc);
        emailText += "DEBUG : " + edesc + " <br />";
    }
}

function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
        if (arguments[i] == eVal)
        return true;

}

// exists:  return true if Value is in Array
//
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}

function convertDate(thisDate)
// convert ScriptDateTime to Javascript Date Object
{
    return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
}

function dateAdd(td, amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

    useWorking = false;
    if (arguments.length == 3)
        useWorking = true;

    if (!td)
        dDate = new Date();
    else
        dDate = new Date(td);
    i = 0;
    if (useWorking)
        while (i < Math.abs(amt)) {
        dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
        if (dDate.getDay() > 0 && dDate.getDay() < 6)
            i++
    }
    else
        dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}



function getCapId(pid1, pid2, pid3) {

    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if (s_capResult.getSuccess())
        return s_capResult.getOutput();
    else {
        logDebug("ERROR: CAP # " + capId.getCustomID() + ", Failed to get capId: " + s_capResult.getErrorMessage());
        return null;
    }
}

function AppSpecific() {
    //
    // Returns an associative array of App Specific Info
    //
    appArray = new Array();
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);
    if (appSpecInfoResult.getSuccess()) {
        var fAppSpecInfoObj = appSpecInfoResult.getOutput();

        for (loopk in fAppSpecInfoObj)
            appArray[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
    }
    return appArray;
}

function getAppSpecific(itemName)  // optional: itemCap
{
    var updated = false;
    var i = 0;
    itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();

        if (itemName != "") {
            for (i in appspecObj)
                if (appspecObj[i].getCheckboxDesc() == itemName) {
                return appspecObj[i].getChecklistComment();
            }
        }
    }
    else
    { logMessage("ERROR","CAP # " + capId.getCustomID() + ", getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
    return false;
}

function updateAppStatus(stat, cmt) // optional cap id
{

    var itemCap = capId;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
    if (updateStatusResult.getSuccess())
        logMessage("EDIT CAP", "Updated application status to " + stat + " successfully for CAP # " + capId.getCustomID() + ".");
    else
        logMessage("ERROR: CAP # " + capId.getCustomID() + " Application status update to " + stat + " was unsuccessful.  Permit status will need to be updated manually.  The reason is " +

updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}

function emailContact(mSubj, mText)   // optional: Contact Type, default Applicant
{
    var replyTo = "jmckenzi@placer.ca.gov";   //
    var contactType = "Applicant"
    var emailAddrAdmin = "";

    if (arguments.length == 3) contactType = arguments[2]; // use contact type specified

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts)
            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
            if (Contacts[yy].getEmail() != null)
            emailAddrAdmin = "" + Contacts[yy].getEmail();
    }

    if (emailAddrAdmin.indexOf("@") > 0) {
        aa.sendMail(replyTo, emailAddrAdmin, "", mSubj, mText);
        return true;
    }
    else
        return false;
}

function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var id1 = capId.ID1;
    var id2 = capId.ID2;
    var id3 = capId.ID3;

    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);

    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess()) {
        logDebug("Sent email successfully!");
        return true;
    }
    else {
        logDebug("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}


function getCapAddress(capId) {
    capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess()) {
        Address = capAddressResult1.getOutput();
        for (yy in Address) {
            if (Address[yy].getPrimaryFlag() == "Y") {
                CapAddress = Address[yy].getHouseNumberStart();
                if (Address[yy].getStreetDirection())
                    CapAddress += " " + Address[yy].getStreetDirection();
                CapAddress += " " + Address[yy].getStreetName();
                if (Address[yy].getStreetSuffix())
                    CapAddress += " " + Address[yy].getStreetSuffix();
                if (Address[yy].getUnitStart())
                    CapAddress += " " + Address[yy].getUnitStart();
                CapAddress += ", " + Address[yy].getCity();
                CapAddress += " " + Address[yy].getZip();
            }
        }
        return CapAddress;
    }
}

function workDescGet(capId)
	{
	var workDescResult = aa.cap.getCapWorkDesByPK(capId);
	
	if (!workDescResult.getSuccess())
		{
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
		}
		
	var workDescObj = workDescResult.getOutput();
	workDesc = workDescObj.getDescription();
	
	return workDesc;
	}

function getAppName(capId)
	{
	if (arguments.length > 0) capId = arguments[0]; // use cap ID specified in args
	capResult = aa.cap.getCap(capId)

	if (!capResult.getSuccess()) 
		{
		logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()) ; 
		return false 
		}

	capModel = capResult.getOutput().getCapModel()

	permitName = capModel.getSpecialText();

	return permitName;
	}

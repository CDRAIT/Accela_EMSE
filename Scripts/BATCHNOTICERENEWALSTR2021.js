/*------------------------------------------------------------------------------------------------------/
| Program: batchNoticeRenewalSTR2021  Trigger: Batch    Client : Placerco
|
| Version 1.0 - Base Version. 12/01/2020 Terry Dunn
|
| Designed for EMSE 3.0
|
| Description of Intended Functionality: Script is executed annually on 12/01/xxxx. 
|
| Criteria:
|   Application is in an active status and has been Issued.
|   ASI Permit 'Expiration Date' is 12/31/current year
|   appGroup = "ShortTermRental"
|   appPerType = "Short Term Rental"
| 
| Updates: TDunn 01/22/2021 updated criteria, reformatted notification
|          TDunn 01/23/2021 added record link for aca; modified creating $$acaRecordUrl$$ for batch mode
|          TDunn 12/15/2021 updated for new renewal notice and removed capStatus update
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var documentOnly = false;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", "PLCERCO", useCustomScriptFile));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", "PLACERCO", useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM", "PLACERCO", useCustomScriptFile));

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
var paramsCurrentCompareDt = dateAdd(null, -1);
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
// var batchJobName = "batchNotice30DayExpireSTR";
var capId;
// Variable used to hold the Cap Id value.

// email parameters for batch results, must be added to batch job.  if a second one is needed, change the second value from "" to a parameter.
var senderEmailAddr = "noreply@placer.ca.gov";                                      // Email address of the sender
//var emailAddrAdmin = getParam("emailAddrAdmin");                              // This must be added to batch job parameters. 
//var ccEmailAddrAdmin = getParam("ccEmailAddrAdmin");                          // This must be added to batch job parameters. 
var emailAddrAdmin = "tdunn@truepointsolutions.com";     
var ccEmailAddrAdmin = "cdrait@placer.ca.gov";  
// Result admin email text
var emailText = "";
var emailText1 = "";
var emailText2 = "";


// Parameter variables to process records
var paramsAppGroup = "ShortTermRental";
var paramsAppPerTypeArray = new Array("Short Term Rental");
// var paramsAppSubTypeArray = new Array("NA", "NA");
var paramsAppStatusArray = new Array("Issued");

var paramsAppSubGroupName = "GENERAL";                                            // Application Spec Info Subgroup Name that the ASI field is associated to.
var paramsAppSpecInfoLabel = "Expiration Date";               // ASI field name that the batch script is to search.
var paramsStartDt = aa.date.parseDate(dateAdd(null,0));                         // Start Date for the batch script to select records on Expiration Date.
var paramsEndDt = aa.date.parseDate(dateAdd(null, +31));                           // End Date for the batch script to select records on Expiration Date.
/*Note: Start Date and End Date are defaulted to use the current System Date.
|       To set the Start Date and End Date to specific values for a manual run
|       replace the following syntax dateAdd(null,0) to a string date value
|       in the following format "MM/DD/YYYY".*/


// Variables to be used to set record information or to define a function parameter
var newCapStatus = "Pending Renewal"; 					                                // New Cap Status that will be applied.

var paramsOK = true;
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    var totalCount = 0;
    logMessage("START: of Batch Job: " + batchJobName + ".");

    var expiredCount = ExpiringPermit();
    

    logMessage("Expired " + expiredCount + " projects. System Date : " + new Date(paramsCurrentCompareDt).valueOf());
    logMessage("End of Job: batchNotice30DayExpireSTR, Elapsed Time : " + elapsed() + " Seconds.");
    emailText = "Number of Short Term Rental permits expiring in 30 Days " + expiredCount;
}

if (emailAddrAdmin.length)
    aa.sendMail(senderEmailAddr, emailAddrAdmin, ccEmailAddrAdmin, batchJobName + " Results", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function ExpiringPermit() {
    var capCount = 0;
    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(paramsAppSubGroupName, paramsAppSpecInfoLabel, paramsStartDt, paramsEndDt);

    if (!getCapResult.getSuccess()) {
        logDebug("ERROR: getting caps by app type: " + getCapResult.getErrorMessage() + ".");
		aa.print("ERROR: getting caps by app type: " + getCapResult.getErrorMessage() + ".")
        return false;
    }

    var csmArray = getCapResult.getOutput(); //array of CapScriptModel objects

    for (i in csmArray) {

        if (elapsed() > maxSeconds) // only continue if time hasn't expired
        {
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
        var alias = cap.capModel.getAppTypeAlias();
        var capStatus = cap.getCapStatus(); //Moved: Terry Dunn
        var capId1 = capId.getID1();
        var capId2 = capId.getID2();
        var capId3 = capId.getID3();
        var capIdObject = getCapIdBatch(capId1, capId2, capId3); // call internal function
        var capIDString = capIdObject.getCustomID(); // Alternate Cap ID string
		var capModule = cap.capModel.getModuleName();
		
		var emailCC = "";
		var emailTo = getContactEmailByContactType("Applicant",capId);
        var permitExpireDate = getAppSpecific(paramsAppSpecInfoLabel,capId);
		var shortDesc = getShortNotes(capId);
		var thisTOT = cap.getSpecialText();
		aa.print("record number = " + capIDString + ". Expiration date: " + permitExpireDate + ". ");
        /* Process records if condition is met //  */
        if (capGroup == paramsAppGroup && exists(capPerType, paramsAppPerTypeArray) && exists(capStatus, paramsAppStatusArray)) {
			var emailTemplate = "NOTICE_STR_PERMIT_RENEWAL_NOTICE1";
			var vFromEmail = "noreply@placer.ca.gov";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant,Local Contact";
			cTypeArray = vContactTypes.split(",");
			var permitExpireDate = getAppSpecific("Expiration Date",capId);
			var shortDesc = getShortNotes(capId);
			logDebug("record number = " + capIDString + ". Expiration date: " + permitExpireDate);
			var emailParameters = aa.util.newHashtable();	
			// Manually build record url
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			// aa.print("Module: " + capModule);
			acaRecordUrl = acaSite + "/urlrouting.ashx?type=1000";
			acaRecordUrl += "&Module=" + capModule;
			acaRecordUrl += "&capID1=" + capId1 + "&capID2=" + capId2 + "&capID3=" + capId3;
			acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
					
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
			for (thisCon in conArray) {
				if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
					logDebug(conArray[thisCon]["contactType"]) ;
					getContactParams4Notification(emailParameters, conArray[thisCon]);
					if(!matches(emailParameters.get("$$contactEmail$$"),null,"",undefined)) {
					vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
					}
				}
			}

			// Set Parameters //

			getPrimaryAddressLineParam4Notification(emailParameters); // sets $$addressLine$$ as primary address line
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters);
			if(matches(shortDesc,null,"")) {
				shortDesc = "Not available";
			}
			addParameter(emailParameters,"$$propertyName$$", shortDesc); 
			addParameter(emailParameters,"$$expDate$$",permitExpireDate);
			addParameter(emailParameters,"$$totNumber$$",thisTOT);
			addParameter(emailParameters,"$$acaRecordUrl$$", acaRecordUrl);
			// Send notification template email //
			emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
			aa.print("From: " + vFromEmail + " To: " + vToEmail + " Params: " + emailParameters);
			aa.print("Email result: " + emailResult);
			if(emailResult) {
				// updateAppStatus(newCapStatus,"Status updated by script",capId);
				// aa.print("New status = " + newCapStatus);
			}
	        capCount++;
			
        }
		
    }
	aa.print("Number of records processed = " + capCount);
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
    logMessage("PARAMETER: " + pParamName + " = " + ret);
    return ret;
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

function getContactEmailByContactType(pContactType,capid)
{
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
                              capContactArray = cap.getContactsGroup().toArray() ;
                              }
               else
                              {
                              var capContactResult = aa.people.getCapContactByCapID(thisCap);
                              if (capContactResult.getSuccess())
                                             {
                                             var capContactArray = capContactResult.getOutput();
                                             }
                              }
               
               var contactEmailToReturn = "";
               var contactTypeForCompare = "";
               
               if (capContactArray)
               {
                              for (yy in capContactArray)
                              {
                                             contactTypeForCompare = capContactArray[yy].getPeople().contactType;
                              
                                             if(contactTypeForCompare == pContactType)
                                             {
                                                            contactEmailToReturn = capContactArray[yy].getPeople().email;
                                                            logDebug("DEBUG: Found Contact with Type = " + pContactType + ".  Email address for Contact = " + contactEmailToReturn);
                                                            break;
                                             }
                              }
               }

               if(contactEmailToReturn == null)
               {
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
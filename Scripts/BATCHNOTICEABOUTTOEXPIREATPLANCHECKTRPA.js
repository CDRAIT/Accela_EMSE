/*------------------------------------------------------------------------------------------------------/
| Program: batchNoticeAboutToExpireAtPlanCheckTRPA  Trigger: Batch    Client : Placerco  BatchJob Name: AboutToExpireNoticePlnChk_TRPA
|
| Version 1.0 - Created  12/26/2023 Terry Dunn
|
| Designed for EMSE 3.0
|
| Description of Intended Functionality: Tests for Plan Check Expiration dates occuring at
| 14 and at 60 days. Generates notice 
|
| Frequency: executes daily
|
| Criteria:
|   Permit is not issued, closed, expired, about to expire or other 'inactive' status
|   ASI Expiration date is in 14 or 60 days
|   appGroup = "TRPA"
|   appType  = "Building"
|   appSubType = "Residential","Non-Residential","Multi-Family"
| 
| Updates: TDunn 12/27/2023 
|          TDunn 01/23/2024 updated call for Prime LP
|          TDunn 02/01/2024 updated LP email rules, added numDays loop to run batch twice against multiple expiration dates
|          TDunn 05/26/2026 added new exclude statuses for Pending Revision and Awaiting Signature
|                           added 'INCLUDES_CUSTOM_GLOBALS'
|          Abe   07/01/2026 Replaced all noreply@placer.ca.gov emails to defaultFrom (INCLUDES_CUSTOM_GLOBALS)
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
var paramsCurrentCompareDt = dateAdd(null, -1);
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var capId;
// Variable used to hold the Cap Id value.

// email parameters for batch results, must be added to batch job.  
var senderEmailAddr = defaultFrom;                                              // Email address of the sender
//var emailAddrAdmin = getParam("emailAddrAdmin");                              // This must be added to batch job parameters. 
//var ccEmailAddrAdmin = getParam("ccEmailAddrAdmin");                          // This must be added to batch job parameters. 
//var emailAddrAdmin = "tdunn@truepointsolutions.com";
//var emailAddrAdmin = "eaftahi@placer.ca.gov";     
var emailAddrAdmin = ""; 
var ccEmailAddrAdmin = "";  
// Result admin email text
var emailText = "";
var emailText1 = "";
var emailText2 = "";
var listRecordsUpdated = "";													// used for list of records updated in admin email

// Parameter variables for records to process
var paramsAppGroup = "TRPA";
var paramsAppPerTypeArray = new Array("Building");
var paramsAppSubTypeArray = new Array("Residential", "Non-Residential");
var paramsAppPerCategory = new Array("Project","Qualified Exempt","TRPA Review at TRPA")
var paramsAppStatusArray = new Array("Expired", "Construction Complete", "Void", "Withdrawn", "DONE", "CANC", "Issued", "Issued - Awaiting Signature", "Issued - Revision Pending", "Approved");
// Parameter variables data
var startDate = 60;
var endDate = 60;
var paramsAppSubGroupName = "EXTENSIONS AND EXPIRATION";                     	// Application Spec Info Subgroup Name that the ASI field is associated to.
var paramsAppSpecInfoLabel = "Plan Check Expiration";                           // ASI field name that the batch script is to search.
var paramsStartDt = aa.date.parseDate(dateAdd(null,startDate));                 // Start Date for the batch script to select records on Expiration Date.
var paramsEndDt = aa.date.parseDate(dateAdd(null,endDate));                     // End Date for the batch script to select records on Expiration Date.
var numDaysArray = new Array(14,60);											// expiring in days array for running batch script twice for each expiration date

// Variables to be used to set record information or to define a function parameter
var newCapStatus = "About to Expire"; 					                        // New Cap Status that will be applied. Not used for this script
var emailTemplate = "PLAN CHECK NEARING EXPIRATION NOTICE";         			// Email notification template name

var paramsOK = true;
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
for(dd in numDaysArray)
{
	startDate = numDaysArray[dd];
	endDate = numDaysArray[dd];
	paramsStartDt = aa.date.parseDate(dateAdd(null,startDate));
	paramsEndDt = aa.date.parseDate(dateAdd(null,endDate));	
	if (paramsOK) {
		var totalCount = 0;
		logMessage("START: of Batch Job: " + batchJobName + ".");

		var expiredCount = aboutToExpirePermit();
		

		logMessage("Expired " + expiredCount + " projects. System Date : " + new Date(paramsCurrentCompareDt).valueOf());
		logMessage("End of Job: batchNoticeAboutToExpireAtPlanCheckTRPA, Elapsed Time : " + elapsed() + " Seconds.");
		emailText = "<u>Number of TRPA permits nearing Plan Check expiration date /<u>" + expiredCount + "<br><br>" +
					"<u>List of Records Updated: </u><br>"							+ listRecordsUpdated + "<br><br>";
	}

	if (emailAddrAdmin.length)
		aa.sendMail(senderEmailAddr, emailAddrAdmin, ccEmailAddrAdmin, batchJobName + " Results", emailText);
		aa.print(emailText);
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutToExpirePermit() {
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
		var capPerCategory = cap.getCapType().getCategory();
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
		
        /* Process records if condition is met //  */
        if (capGroup == paramsAppGroup && exists(capPerType, paramsAppPerTypeArray) && exists(capPerCategory, paramsAppPerCategory) && !exists(capStatus, paramsAppStatusArray))
		{
			aa.print("Category type: " + capPerCategory + ", record number = " + capIDString + ". Expiration date: " + permitExpireDate + ". Cap status: " + capStatus);
			var vFromEmail = defaultFrom;
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant";
			cTypeArray = vContactTypes.split(",");
			
			if(matches(shortDesc,null,"")) {shortDesc = "Not available";}
			
			var scopeCode = getAppSpecific("Scope of Work", capId);
            var planCheckOrPermit = "on"; // Email text for when expiration date is for Permit
			var finalNote = "";
			if(startDate == 14) {finalNote = "- FINAL NOTICE";}
			aa.print("record number = " + capIDString + ". Expiration date: " + permitExpireDate + "; final note is " + finalNote);
			logDebug("record number = " + capIDString + ". Expiration date: " + permitExpireDate);
			var emailParameters = aa.util.newHashtable();	
			// Manually build record url
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			aa.print("Module: " + capModule);
			acaRecordUrl = acaSite + "/urlrouting.ashx?type=1000";
			acaRecordUrl += "&Module=" + capModule;
			acaRecordUrl += "&capID1=" + capId1 + "&capID2=" + capId2 + "&capID3=" + capId3;
			acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
			
			var applEmail = "";
			var primeEmail = "";
			var conArray = new Array();
			var primeArray = new Array();
			var pOwnerEmail = "";
			conArray = getContactArrayWithPrimary(capId); 
			for (thisCon in conArray) 
			{
				if (exists(conArray[thisCon]["contactType"],cTypeArray)) 
				{
					aa.print(conArray[thisCon]["contactType"]) ;
					getContactParams4Notification(emailParameters, conArray[thisCon]);
					if(!matches(emailParameters.get("$$contactEmail$$"),null,"",undefined)) 
					{
						applEmail =  emailParameters.get("$$contactEmail$$");
						vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
					}
				}
			}
			primeArray = getContactArrayWithPrimary(capId); 
			for (thisCon in primeArray) 
			{
				primeFlag = primeArray[thisCon]["primaryFlag"];
				aa.print("Prime is : " + primeFlag);
				if(matches(primeFlag,"Y","Yes","YES"))
				{
					aa.print("Primary flag = " + primeFlag)
					getContactParams4Notification(emailParameters, primeArray[thisCon]);
					if(!matches(emailParameters.get("$$contactEmail$$"),null,"",undefined)) 
					{
						primeEmail =  emailParameters.get("$$contactEmail$$");
						if(primeEmail != applEmail) {vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";}
					}
				}
				
			}				
			getPrimaryOwnerParams4NotificationWithEmail(emailParameters); // returns $$ownerFullName$$, $$ownerPhone$$, $$ownerEmail$$;
			if(!matches(emailParameters.get("$$ownerEmail$$"),null,"",undefined))
			{
				pOwnerEmail = emailParameters.get("$$ownerEmail$$");
				vToEmail = vToEmail + emailParameters.get("$$ownerEmail$$") + "; ";
			}
			// Get primary LP email if found, else no LP emails
			var licProfsArray = new Array();
			var vLicTypeArray = new Array("Architect","Contractor","Designer","Engineer","Surveyor");
			var profEmail = "";
			var noPrime = true;
			licProfsArray = getLicenseProfessional(capId);
			
			for(thisProf in licProfsArray) 
			{
				currentProf = licProfsArray[thisProf]; 
				lpType = currentProf.getLicenseType();
				pCode = currentProf.getPrintFlag();
				if(!matches(currentProf.getEmail(),null,"",undefined) && exists(lpType, vLicTypeArray)) 
				{
					profEmail = currentProf.getEmail();
					aa.print("lp email: " + profEmail + "; pCode = " + pCode);
					if(matches(pCode,"Y","Yes","YES")) 
					{
						vToEmail = vToEmail + profEmail + "; ";
						noPrime = false;
					}
				}
			}
			// Remarked out per clarification of specifications
/*			if(noPrime)
			{
				for(thisProf in licProfsArray) 
				{
					currentProf = licProfsArray[thisProf]; 
					lpType = currentProf.getLicenseType();
					if(!matches(currentProf.getEmail(),null,"",undefined) && exists(lpType, vLicTypeArray)) 
					{
						profEmail = currentProf.getEmail();
						aa.print("lp email: " + profEmail);
						vToEmail = vToEmail + profEmail + "; ";
						noPrime = false;
					}
				}
			}				
*/			
			
			// Set Email Parameters //
			getPrimaryAddressLineParam4Notification(emailParameters); // sets $$addressLine$$ as primary address line
			getRecordParams4Notification(emailParameters); // Parameters returned: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$


            // Set Email Variables //
            emailParameters.put("$$PERMITEXPIREDATE$$", permitExpireDate);
            emailParameters.put("$$SCOPECODE$$", scopeCode);
            emailParameters.put("$$PLANCHECKORPERMIT$$", planCheckOrPermit);
            emailParameters.put("$$CUSTOMRECID$$", capIDString);
            emailParameters.put("$$RECORDALIAS$$", alias);
			emailParameters.put("$$CAPSTATUS$$", capStatus);
			addParameter(emailParameters,"$$acaRecordUrl$$", acaRecordUrl);
			addParameter(emailParameters,"$$finalNotice$$", finalNote);
			/*------------------------------------------------------------------------------------------------------
			| Notes: replaced the following parameters in the associated notification template
			| 
			| $$CONTACTEMAIL$$"  replaced with generated vToEmail list
            | $$PERMITADDRESS$$" replaced in notification with $$addressLine$$ from standard primary address function
			| $$WORKDESC$$"      replaced in notification with $$workDesc$$ from standard email parameters function
			| $$PERMITNAME$$"    replaced in notification with $$capName$$ from standard email parameters function
			\-------------------------------------------------------------------------------------------------------*/

			// Send notification template email //
			emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
			aa.print("applEmail = " + applEmail + "; primeEmail = " + primeEmail + "; owner = " + pOwnerEmail + "; To emails = " + vToEmail);
			listRecordsUpdated += alias + ", record number " + capIDString + ", Plan Check Expiration date: " + permitExpireDate + ", current status: " + capStatus + ", emails sent to: " + vToEmail + br;
			//aa.print("Params: " + emailParameters);
			aa.print("Email result: " + emailResult);

	        capCount++;
        }
    }
	aa.print("Number of records processed = " + capCount + " expiring in " + startDate + " days");
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
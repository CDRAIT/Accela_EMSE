/*------------------------------------------------------------------------------------------------------/
| Program: AQ Reference Contacts  Trigger: Batch
| Client : Placer County
|
| Version 1.0 - Base Version. 09/03/2017 - TruePoint Solutions
|
| Script is run to AQ Reference Contacts 
|
| Batch Requirements:
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
| START: Batch specific variables
/------------------------------------------------------------------------------------------------------*/
var appdate1 = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
//Global variables
var batchStartDate = new Date();                                                        // System Date
var batchStartTime = batchStartDate.getTime();                                          // Start timer
var timeExpired = false;                                                                // Variable to identify if batch script has timed out. Defaulted to "false".
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;                                                    // Use Group name when populating App Specific Info Values
var senderEmailAddr = "placercounty_noreply@accela.com";                                          // Email address of the sender
var emailAddress = "rmoore@placer.ca.gov";                                  // Email address of the person who will receive the batch script log information
var emailAddress2 = "";                                                                 // CC email address of the person who will receive the batch script log information
var emailText = ""; 																	// Email body
                                                       
//Parameter variables
var paramsOK = true;
var servProvCode = "PLACERCO";
var expDate =  "03/31/" + appdate1.getYear();
var facilitiesUpdated = 0;   // FAC count
var processesUpdated  = 0;   // PROCESS count
var BATCH_SIZE = 25;          // facilities per run
var SCRIPT_NAME = "AQ_ABOUT_TO_EXPIRE";
var DEBUG_LEVEL = 1;          // 0=quiet 1=normal 2=verbose
var TEST_MODE = false;


if (paramsOK) {
    logMessage("START", "Start of AQ Reference Contacts .");
    var licAboutToExpCnt = aboutExpLics();
    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of AQ Reference Contacts  Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for AQ Reference Contacts ", emailText);


var allPermitsCache = [];
var allProcessesCache = [];
var facilityHierarchyCache = null;

function aboutExpLics() {
    logDebug("START aboutExpLics batch");
    var facilities = [];
    if (TEST_MODE) {
        var testCapId =            aa.cap.getCapID("19AQR","00000","00062").getOutput();  	//FAC-TEST
//        var testCapId =            aa.cap.getCapID("18HST","00000","000EQ").getOutput();		//FAC-VWAA
//       var testCapId =            aa.cap.getCapID("19AQR","00000","00062").getOutput();



        if (!testCapId) {
            logDebug("Test facility not found.");
            return 0;
        }
        facilities.push({ getCapID: function () { return testCapId; }        });
        logDebug("TEST MODE — Facility: " + testCapId.getCustomID()); }
    else {
        var result = aa.cap.getByAppType( "AirQuality", "Stationary Source", "Facility", "NA" );
        facilities = result.getOutput();
        logDebug("Total facilities loaded: " + facilities.length);
    }

    // =====================================================
    // COUNTERS
    // =====================================================
    var facilityCount = 0;   // facilities updated
    var processCount  = 0;   // processes updated

    // =====================================================
    // PROCESS FACILITIES
    // =====================================================
    for (var f = 0; f < facilities.length; f++) {
        var facCapId = facilities[f].getCapID();
        var facAlt   = facCapId.getCustomID();
        logDebug("------------------------------------------------");
        logDebug("Processing Facility: " + facAlt);
        var cap = aa.cap.getCap(facCapId).getOutput();
        var capStatus = cap.getCapStatus();
		var	capName = cap.getSpecialText();
        if (capStatus == "Closed") {
            logDebug("Skipping closed facility");
            continue;
        }

        // --------------------------------------------
        // Throughput check
        // --------------------------------------------
        var thrucheck = getAppSpecific("Throughput Sent", facCapId);
        if (thrucheck != "CHECKED") {
            logDebug("Creating reference contacts...");
            createRefContactsFromCapContactsAndLink( facCapId,null,null,null,true,null );
        // BUILD OPTIMIZED CHILD CACHE (ONE CALL ONLY)
        buildChildCache(facCapId);
        var permits = getChildPermits(facCapId);
        logDebug("Active permits found: " + permits.length);
        var facilityUpdated = false;
        // LOOP PERMITS
        for (var p = 0; p < permits.length; p++) {
            var permitCapId = permits[p];
            var permitAlt   = permitCapId.getCustomID();
           // logDebug("Processing Permit: " + permitAlt);
            // GET PERMIT EXPIRATION
            // var expResult = aa.expiration.getLicensesByCapID(permitCapId);
            // if (!expResult.getSuccess()) {
                // logDebug("No expiration object");
                // continue;
            // }
            // GET CHILD PROCESSES (NOT CLOSED)
            var processes = getChildProcesses(permitCapId);
          //  logDebug("Processes found: " + processes.length);
            // LOOP PROCESSES
            for (var c = 0; c < processes.length; c++) {
                var procCapId = processes[c];
                var procAlt   = procCapId.getCustomID();
         //       logDebug("Updating Process: " + procAlt);
				var expDate =  "03/31/" + appdate1.getYear();
                var updated = updateProcessExpiration(expDate, procCapId, "About to Expire");
                if (updated) {
                    processCount++;
                    facilityUpdated = true;
                    logDebug("Updated: " + procAlt);
                }
                else {
                    logDebug("Failed updating: " + procAlt);
                }
            }
        }
        // MARK FACILITY COMPLETE (ONCE)
        if (facilityUpdated) {
            editAppSpecific( "Throughput Sent", "CHECKED", facCapId );
            facilityCount++;
        }
        logDebug("Finished Facility: " + facAlt);
    }
        }
    // FINAL COUNTS
    logDebug("Total Facilities Updated: " + facilityCount);
    logDebug("Total Process Records Updated: " + processCount);
    return processCount;
}
function runAboutToExpireContacts(facCapId) {
    logDebug("Running AboutToExpire contact sync for facility");
    var throughputTypes = [
        "Throughput"
		];
    for (var i = 0; i < throughputTypes.length; i++) {
        var contactType = throughputTypes[i];
        var contacts = getContactsByType(facCapId, contactType);
        for (var c = 0; c < contacts.length; c++) {
            var contact = contacts[c];
            var publicUser = getOrCreatePublicUser(contact);
            if (publicUser)
                createOrUpdateReferenceContact(contact, publicUser);
        }
    }
}
function processFacility(facCapId) {
    logDebug("Processing Facility: " + facCapId.getCustomID());
    var facilityHadUpdates = false;
    var permits = getActivePermits(facCapId);
    logDebug("Found " + permits.length + " Active Permit(s)");
    for (var i = 0; i < permits.length; i++) {
        var permitCapId = permits[i];
        logDebug("Processing Permit: " + permitCapId.getCustomID());
        var processes = getProcessesForPermit(permitCapId);
        logDebug("Found " + processes.length + " process(es) under " + permitCapId.getCustomID());
        for (var p = 0; p < processes.length; p++) {
            var procCapId = processes[p];
            logDebug("Updating Process: " + procCapId.getCustomID());
            if (updateProcessExpiration(procCapId, getPermitExpiration(permitCapId))) {
                processesUpdated++;      // PROCESS COUNT
                facilityHadUpdates = true;
            } else {
                logDebug("Failed updating " + procCapId.getCustomID());
            }
        }
    }
    // FACILITY COUNT (only once)
    if (facilityHadUpdates) {
        facilitiesUpdated++;
        runAboutToExpireContacts(facCapId);
    }
    logDebug("Finished Facility: " + facCapId.getCustomID());
}
function getChildPermits(facCapId) {
    var facAlt = facCapId.getCustomID();
    if (!permitIndex[facAlt])
        return [];
    return permitIndex[facAlt];
}
function getChildProcesses(permitCapId) {
    var results = [];
    var childResult = aa.cap.getChildByMasterID(permitCapId);
    if (!childResult.getSuccess()) {
        logDebug("ERROR getting processes for permit: " + permitCapId.getCustomID());
        return results;
    }
    var children = childResult.getOutput();
    if (!children || children.length === 0)
        return results;
    for (var i = 0; i < children.length; i++) {
        var childCapId = children[i].getCapID();
        var capType = children[i].getCapType().toString();
        var status = children[i].getCapStatus();
        if (capType.indexOf("Process") > -1) {
            // EVERYTHING EXCEPT CLOSED
            if (!status || status != "Closed") {
                results.push(childCapId);
            }
        }
    }
    return results;
}
function getPermitExpiration(capId) {
    var result = aa.expiration.getB1Expiration(capId);
    if (!result.getSuccess())
        return null;
    var exp = result.getOutput();
    if (exp && exp.getExpDate())
        return exp.getExpDate();
    return null;
}
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}
function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
        if (arguments[i] == eVal)
        return true;
}
function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}
function logMessage(etype, edesc) {
    aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, appdate1, appdate1, "", edesc, batchJobID);
    aa.print(etype + " : " + edesc);
    emailText += etype + " : " + edesc + "<br />";
}
function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, appdate1, appdate1, "", edesc, batchJobID);
        aa.print("DEBUG : " + edesc);
        emailText += "DEBUG : " + edesc + " <br />";
    }
}
function logDebug1(msg, level) {
    if (!level) level = 1;
    if (DEBUG_LEVEL >= level)
        aa.print("DEBUG : " + msg);
}
function dateAdd(td,amt)	{
	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;
	if (!td)
		dDate = new Date();
	else
		dDate = new Date(td);
	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay)
			{
			logDebug("**ERROR","getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt))
				{
				dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
				}
			}
		else
			{
			while (i < Math.abs(amt))
				{
				dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
				i++;
				}
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
	}
function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile,capid){
	sca = String(capid).split("-"); 
	var id1 = sca[0];
 	var id2 = sca[1];
 	var id3 = sca[2];
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully to " + emailTo + "!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}	
function addParameter(parameters, key, value){
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
	}
}
function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)	{
	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";
	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];
	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");
	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets
	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];
	   var p = con.getPeople();
	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());
	   if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   	{
	   	if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
		}
	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}

	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}
	   if (ruleForRefContactType.equals("D"))
	   	continue;
	   var refContactType = "";
   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}
		
		//Invoice Contact
		//Facility
		//Responsible Official
		//Throughput
		//Inspection Contact
		//Company
		//Preparer

	   var refContactNum = con.getCapContactModel().getRefContactNumber();
	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);

	   						var a = p.getAttributes();

							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}

	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());
			if (!r.getSuccess())
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			    fileNames = [];
			        var cap = aa.cap.getCap(pCapId).getOutput();
				var	capName = cap.getSpecialText();
				//	capName = cap.getSpecialText();
				
				
				emailParameters = aa.util.newHashtable();
				addParameter(emailParameters,"$$FACILITY_NAME$$",capName);
				addParameter(emailParameters,"$$USERNAME$$",con.getEmail());
				addParameter(emailParameters,"$$TP_YEAR$$",String(appdate1.getYear()-1));
				addParameter(emailParameters,"$$CUR_YEAR$$",String(appdate1.getYear()));
				sendtest = sendNotification(senderEmailAddr,con.getEmail(),"","AQ_PUBLIC_USER",emailParameters,fileNames,pCapId);
			}

	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}
	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();
			var existingContact = false; //refContactExists(p);  // Call the custom function to see if the REF contact exists
			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search
			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{
				var a = p.getAttributes();
				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}
				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p,a);
				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }
				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();
				logDebug("Successfully created reference contact #" + refPeopleId);
				// Need to link to an existing public user.
			    var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
			    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			        var userModel = getUserResult.getOutput();
			        logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());
					if (refPeopleId)	{
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
						}
					}
					else
					{
					createPublicUserFromContact(pCapId,"Throughput", refPeopleId);
					}
				}

			//
			// now that we have the reference Id, we can link back to reference
			//
		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();
		    ccm.setRefContactNumber(refPeopleId);
		    r = aa.people.editCapContact(ccm);
		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}
	    }  // end if user hand entered contact
	}  // end for each CAP contact
} 
function lookup(stdChoice,stdValue) {
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
	}
function createPublicUserFromContact(capId,contactType,refContactNum)   {
    var contact;
    var userModel;
    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				contact = Contacts[yy];
        }
    }
   if (!contact)
    { logDebug("Couldn't create public user for " + contactType + ", no such contact"); return false; }
    if (!contact.getEmail())
    { logDebug("Couldn't create public user for " + contactType + ", no email address"); return false; }
    // check to see if public user exists already based on email address
    var getUserResult = aa.publicUser.getPublicUserByEmail(contact.getEmail())
    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
        userModel = getUserResult.getOutput();
        logDebug("CreatePublicUserFromContact: Found an existing public user: " + userModel.getUserID());
	}
    if (!userModel) // create one
    	{
	    logDebug("CreatePublicUserFromContact: creating new user based on email address: " + contact.getEmail()); 
	    var publicUser = aa.publicUser.getPublicUserModel();
	    publicUser.setFirstName(contact.getFirstName());
	    publicUser.setLastName(contact.getLastName());
	    publicUser.setEmail(contact.getEmail());
	    publicUser.setUserID(contact.getEmail());
	    publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
	    publicUser.setAuditID("PublicUser");
	    publicUser.setAuditStatus("A");
	    publicUser.setCellPhone(contact.getCapContactModel().getPeople().getPhone2());
		publicUser.setNeedChangePassword("Y");
	    var result = aa.publicUser.createPublicUser(publicUser);
	    if (result.getSuccess()) {
		logDebug("Created public user " + contact.getEmail() + "  sucessfully.");
		var userSeqNum = result.getOutput();
		var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()
		// create for agency
		aa.publicUser.createPublicUserForAgency(userModel);
		// activate for agency
		var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
			userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(servProvCode,userSeqNum,"ADMIN");
			// reset password
			var resetPasswordResult = aa.publicUser.resetPassword(contact.getEmail());
			if (resetPasswordResult.getSuccess()) {
				var resetPassword = resetPasswordResult.getOutput();
				userModel.setPassword(resetPassword);
				logDebug("Reset password for " + contact.getEmail() + "  sucessfully.");
			} else {
				logDebug("**ERROR: Reset password for  " + contact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
			}
				fileNames = [];
				emailParameters = aa.util.newHashtable();

					var cap = aa.cap.getCap(capId).getOutput();
					var	capName = cap.getSpecialText();
				
				
				addParameter(emailParameters,"$$FACILITY_NAME$$",capName);
				addParameter(emailParameters,"$$USERNAME$$",contact.getEmail());
				addParameter(emailParameters,"$$TP_YEAR$$",String(appdate1.getYear()-1));
				addParameter(emailParameters,"$$CUR_YEAR$$",String(appdate1.getYear()));
				sendtest = sendNotification(senderEmailAddr,userModel.getEmail(),"","AQ_PUBLIC_USER",emailParameters,fileNames,capId);

	    }
    	else {
    	    logDebug("**Warning creating public user " + contact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
    	}
    }
if (refContactNum)
	{
	logDebug("CreatePublicUserFromContact: Linking this public user with reference contact : " + refContactNum);
	aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);
	}
return userModel; // send back the new or existing public user
}
function updateAppStatus(stat,cmt,itemCap)	{
	var updateStatusResult = aa.cap.updateAppStatus(itemCap,"APPLICATION",stat, appdate1, cmt ,systemUserObj);
	if (updateStatusResult.getSuccess())
		logMessage("INFO","CAP # "+ itemCap +" Updated Application Status to " + stat + " successfully.");
	else
		logMessage("**ERROR","CAP # "+ itemCap +" Application Status update to " + stat + " was unsuccessful. Application Status will need to be updated manually.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}
function licenseObject(licnumber) {
	// available statuses (from various R1_SERVER_CONSTANT values
	var licenseStatus = new Array("","Active","About To Expire","Delinquent","Expired","Invalid","Pending");
		this.refProf = null;		// licenseScriptModel (reference licensed professional)
	this.b1Exp = null;		// b1Expiration record (renewal status on application)
	this.licNum = licnumber;	// License Number
	// Load the reference License Professional if we're linking the two
	if (licnumber) // we're linking
		{
		refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(servProvCode,this.licNum)
		if (refLicenseResult.getSuccess())
			{
			refArray = refLicenseResult.getOutput()
			if (refArray)
				for (xxx in refArray)
					{
					this.refProf = refArray[xxx];
					//logDebug("Loaded reference license professional");
					}
			}
		else
			{ logMessage("**ERROR","CAP # " + customId +", Error retriving Licensed Professional Record.  Reason is: " + refLicenseResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }
		}
   	// Load the renewal info (B1 Expiration)
   	// The only way to pull up a renewal is to supply a status.  I don't understand since it has a 1 to 1 relationship with b1permit, but oh well.
   	// the silly thing returns a blank record, so have to check the B1expirationModel to see if it's valid
   	for (myStatus in licenseStatus)
   		{
   		b1ExpResult = aa.expiration.getLicensesByCapID(capId,licenseStatus[myStatus]);
   		if (b1ExpResult.getSuccess())
   			{
   			this.b1Exp = b1ExpResult.getOutput();
   			exptest = this.b1Exp.getB1Expiration();
   			if (exptest) {/*logDebug("Found renewal record of status : " + licenseStatus[myStatus]) ;*/ break}
			}
		else
			{ logMessage("**ERROR","CAP # " + customId +", Error retriving Getting B1Expiration Object for Cap.  Reason is: " + b1ExpResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }
		}
   	this.setExpiration = function(expDate)
   		// Update expiration date
   		{
   		var expAADate = aa.date.parseDate(expDate);
   		if (this.refProf) {
   			this.refProf.setLicenseExpirationDate(expAADate);
   			aa.licenseScript.editRefLicenseProf(this.refProf);
   			//logDebug("Updated reference license expiration to " + expDate);
                        }
   		if (this.b1Exp)  {
 				this.b1Exp.setExpDate(expAADate);
				aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration());
				//logDebug("Updated renewal to " + expDate);
                                }
   		}
	this.setIssued = function(expDate)
		// Update Issued date
		{
		var expAADate = aa.date.parseDate(expDate);
		
		if (this.refProf) {
			this.refProf.setLicenseIssueDate(expAADate);
			aa.licenseScript.editRefLicenseProf(this.refProf);
			//logDebug("Updated reference license issued to " + expDate);
                        }
			
		}	
	this.setLastRenewal = function(expDate)
		// Update expiration date
		{
		var expAADate = aa.date.parseDate(expDate)

		if (this.refProf) {
			this.refProf.setLicenseLastRenewalDate(expAADate);
			aa.licenseScript.editRefLicenseProf(this.refProf);
			//logDebug("Updated reference license issued to " + expDate);
                        }
		}
			this.setStatus = function(licStat)
		// Update expiration status
		{
		if (this.b1Exp)  {
			this.b1Exp.setExpStatus(licStat);
			aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration()); 
			//logDebug("Updated renewal to status " + licStat);
                        }
		}
			this.getStatus = function()
		// Get Expiration Status
		{
		if (this.b1Exp) {
			return this.b1Exp.getExpStatus();
			}
		}
		
	this.getRenewFeeCode = function()
		// Get Renewal Fee Code (B1_EXPIRATION.RENEWAL_FEE_CODE)
		{
		if (this.b1Exp)
			{
			return this.b1Exp.getRenewalCode();
			}	
		}
				
	this.getRenewFeeFn = function()
		// Get Renewal Fee Function (B1_EXPIRATION.RENEWAL_FEE_FUNCTION)
		{
		if (this.b1Exp)
			{
			return this.b1Exp.getRenewalFunction();
			}	
		}
		
	this.getPenaltyFeeCode = function()
		// Get Penalty Fee Code (B1_EXPIRATION.PENALTY_FEE_CODE)
		{
		if (this.b1Exp)
			{
			return this.b1Exp.getPenaltyCode();
			}	
		}	
		
	this.getPenaltyFeeFn = function()
		// Get Penalty Fee Function (B1_EXPIRATION.PENALTY_FEE_FUNCTION)
		{
		if (this.b1Exp)
			{
			return this.b1Exp.getPenaltyFunction();
			}	
		}		
	this.getPayPeriod = function()
	    {
	    if (this.b1Exp)
	        {
	        return this.b1Exp.getPayPeriodGroup();
		    }
		}
	}	
function getAddress(capId){
	capAddresses = null;
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses == null || capAddresses.length == 0)
		{
			logDebug("WARNING: no addresses on this CAP:" + capId);
			capAddresses = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to address: " + s_result.getErrorMessage());
		capAddresses = null;	
	}
	return capAddresses;
}
function updateProcessExpiration(expDate, procCapId, statusText) {

    try {
        var scriptDate = toScriptDate(expDate);
        if (!scriptDate) {
            logDebug("Invalid expiration date for " + procCapId.getCustomID());
            return false;
        }
        // GET EXPIRATION OBJECT
        var expResult = aa.expiration.getLicensesByCapID(procCapId);
        if (!expResult.getSuccess()) {
            logDebug("Expiration lookup failed: " + procCapId.getCustomID());
            return false;
        }
        var expObj = expResult.getOutput();
        if (!expObj) {
            logDebug("No expiration object on process: " + procCapId.getCustomID());
            return false;
        }
        // SET DATE + STATUS
        expObj.setExpDate(scriptDate);
        expObj.setExpStatus(statusText);  
        // SAVE
        var editResult = aa.expiration.editB1Expiration( expObj.getB1Expiration() );
        if (!editResult.getSuccess()) {
            logDebug("Expiration edit failed: " + editResult.getErrorMessage());
            return false;
        }


	  updateAppStatus("Active","Updated by batch",procCapId,procCapId.getCustomID());
				
        return true;
    } catch (err) {
        logDebug("updateProcessExpiration ERROR: " + err);
        return false;
    }
}
function editAppSpecific(itemName,itemValue,capId)  {
	var itemCap = capId;
	var itemGroup = null;
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);
	if (appSpecInfoResult.getSuccess())
	 {
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue; 
	} 	
	else
		{ logDebug( "WARNING: " + itemName + " was not updated."); }
}
function getAppSpecific(itemName,itemCap)  {
	var updated = false;
	var i=0;
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}				
function buildChildCache(facCapId) {
    permitIndex = {};
    processIndex = {};
    var facAlt = facCapId.getCustomID();
    logDebug("Building optimized child cache...");
    var childResult = aa.cap.getChildByMasterID(facCapId);
    if (!childResult.getSuccess()) {
        logDebug("ERROR getting children: " + childResult.getErrorMessage());
        return;
    }
    var children = childResult.getOutput();
    logDebug("Total child records under facility: " + children.length);
    permitIndex[facAlt] = [];
    // ---------- PASS 1 : CACHE ACTIVE PERMITS ----------
    for (var i = 0; i < children.length; i++) {
        var capModel = children[i];
        var capId = capModel.getCapID();
        var altId = capId.getCustomID();
        var type = capModel.getCapType().toString();
        var status = capModel.getCapStatus();
    //    logDebug("Child found: " + altId + " | " + type + " | " + status);
        // ACTIVE PTO PERMITS ONLY
        if (type.indexOf("Permit to Operate") > -1 &&
            status == "Active") {
            permitIndex[facAlt].push(capId);
            processIndex[altId] = []; // prepare process bucket
        }
    }
    // ---------- PASS 2 : CACHE PROCESSES ----------
    for (var j = 0; j < children.length; j++) {
        var procModel = children[j];
        var procCapId = procModel.getCapID();
        var procAlt = procCapId.getCustomID();
        var procType = procModel.getCapType().toString();
        var procStatus = procModel.getCapStatus();
        // PROCESS RECORD
        if (procType.indexOf("/Process/") > -1 &&
            procStatus != "Closed") {
            var parentId = procModel.getParentCapID();
            if (!parentId) continue;
            var parentAlt = parentId.getCustomID();
            if (processIndex[parentAlt]) {
                processIndex[parentAlt].push(procCapId);
            }
        }
    }
    logDebug("Active permits cached: " + permitIndex[facAlt].length);
    var procCount = 0;
    for (var k in processIndex)
        procCount += processIndex[k].length;
    logDebug("Processes cached (non-closed): " + procCount);
}
function buildFacilityHierarchy(facCapId) {
    var cache = {};
    var res = aa.cap.getChildByMasterID(facCapId);
    if (!res.getSuccess()) return cache;
    var children = res.getOutput();
    for (var i in children) {
        var model = children[i];
        var capId = model.getCapID();
        var type = model.getCapType().toString();
        var status = model.getCapStatus();
        var alt = capId.getCustomID();
        if (status == "Closed") continue;
        if (type.indexOf("Permit to Operate") >= 0) {
            cache[alt] = {
                permitCapId: capId,
                expiration: getPermitExpiration(capId),
                processes: []
            };
        }
    }
    // attach processes
    for (var j in children) {
        var model2 = children[j];
        var capId2 = model2.getCapID();
        var type2 = model2.getCapType().toString();
        if (type2.indexOf("/Process/") >= 0) {
            var procAlt = capId2.getCustomID();
            var permitAlt =
                procAlt.substring(0, procAlt.lastIndexOf("-"));
            if (cache[permitAlt])
                cache[permitAlt].processes.push(capId2);
        }
    }
    return cache;
}
function getBatchPosition() {
    var val = aa.env.getValue("BatchPosition");
    if (!val) return 0;
    return parseInt(val);
}
function setBatchPosition(pos) {
    aa.env.setValue("BatchPosition", pos);
}
function toScriptDate(dateValue) {
    if (!dateValue)
        return null;
    // Already ScriptDateTime
    if (dateValue.getClass &&
        String(dateValue.getClass())
            .indexOf("ScriptDateTime") > -1) {
        return dateValue;
    }
    try {
        // parseDate RETURNS ScriptDateTime directly
        return aa.date.parseDate(dateValue);
    }
    catch (err) {
        logDebug("Date conversion failed: " + dateValue);
        return null;
    }
}

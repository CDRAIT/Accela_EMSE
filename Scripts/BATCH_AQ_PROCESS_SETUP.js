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
var senderEmailAddr = "NoReply@accela.com";                                          // Email address of the sender
var emailAddress = "ngraf@truepointsolutions.com;rmoore@placer.ca.gov";                                  // Email address of the person who will receive the batch script log information
var emailAddress2 = "";                                                                 // CC email address of the person who will receive the batch script log information
var emailText = ""; 																	// Email body
                                                        
//Parameter variables
var paramsOK = true;
var servProvCode = "PLACERCO";
var expDate =  "05/01/" + appdate1.getYear();


/*------------------------------------------------------------------------------------------------------/
| END: Batch Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/

if (paramsOK) {
    logMessage("START", "Start of AQ Reference Contacts .");

    var licAboutToExpCnt = aboutExpLics();

    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of AQ Reference Contacts  Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for AQ Reference Contacts ", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() 
{
		var CAPIDS = []
	var CAPIDSAB = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Abrasive Materials").getOutput();
	var CAPIDSAP = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Aggregate Processing").getOutput();
	var CAPIDSA = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Asphalt").getOutput();
	var CAPIDSGBP = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Biomass Processing").getOutput();
	var CAPIDSB = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Boiler").getOutput();
	var CAPIDSBST = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Bulk Storage Tank").getOutput();
	var CAPIDSCLAY = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Clay").getOutput();
	var CAPIDSC = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Coatings").getOutput();
	var CAPIDSCR = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Coffee Roasting").getOutput();
	var CAPIDSCT = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Combustion Turbine").getOutput();
	var CAPIDSCO = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Composting").getOutput();
	var CAPIDSCON = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Concrete").getOutput();
	var CAPIDSCTOWER = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Cooling Towers").getOutput();
	var CAPIDSCREM = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Crematory").getOutput();
	var CAPIDSDC = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Dry Cleaning").getOutput();
	var CAPIDSE = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Engine").getOutput();
	var CAPIDSFEE = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Flex Emergency Engine").getOutput();
	var CAPIDSFPE = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Flex Prime Engine").getOutput();
	var CAPIDSG = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","GDF").getOutput();
	var CAPIDSLDK = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Lumber Drying Kilns").getOutput();
	var CAPIDMH = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Material Handing").getOutput();
	var CAPIDMHW = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Material Handing (non-wood)").getOutput();
	var CAPIDSMC = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Miscellaneous Combustion").getOutput();
	var CAPIDMPM = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Miscallenous PM").getOutput();
	var CAPIDSMV = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Miscellaneous VOCs").getOutput();
	var CAPIDSPC = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Powder Coatings").getOutput();
	var CAPIDSP = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Prime Engine").getOutput();
	var CAPIDSL = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Sand Loading").getOutput();
	var CAPIDSSOLV = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Solvents").getOutput();
	var CAPIDSVE = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Vapor Extraction").getOutput();
	var CAPIDSWTP = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Wastewater Treatment Plant").getOutput();
	var CAPIDSWFPP = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Wood Fired Power Plant").getOutput();
	var CAPIDWPC = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Woodcoater Particule Control").getOutput();










	for (x in CAPIDSCT) 
	{
		CAPIDS.push(CAPIDSCT[x])
	}



	for (x in CAPIDSAB) 
	{
		CAPIDS.push(CAPIDSAB[x])
	}
	for (x in CAPIDSBST) 
	{
		CAPIDS.push(CAPIDSBST[x])
	}
	for (x in CAPIDSCLAY) 
	{
		CAPIDS.push(CAPIDSCLAY[x])
	}
	for (x in CAPIDSCO) 
	{
		CAPIDS.push(CAPIDSCO[x])
	}
	for (x in CAPIDSCTOWER) 
	{
		CAPIDS.push(CAPIDSCTOWER[x])
	}
	for (x in CAPIDSLDK) 
	{
		CAPIDS.push(CAPIDSLDK[x])
	}
	for (x in CAPIDMH) 
	{
		CAPIDS.push(CAPIDMH[x])
	}
	for (x in CAPIDMHW) 
	{
		CAPIDS.push(CAPIDMHW[x])
	}
	for (x in CAPIDMPM) 
	{
		CAPIDS.push(CAPIDMPM[x])
	}
	for (x in CAPIDSPC) 
	{
		CAPIDS.push(CAPIDSPC[x])
	}
	for (x in CAPIDSL) 
	{
		CAPIDS.push(CAPIDSL[x])
	}
	for (x in CAPIDSVE) 
	{
		CAPIDS.push(CAPIDSVE[x])
	}
	for (x in CAPIDSWFPP) 
	{
		CAPIDS.push(CAPIDSWFPP[x])
	}
	for (x in CAPIDWPC) 
	{
		CAPIDS.push(CAPIDWPC[x])
	}

































//Already Ran below

	for (x in CAPIDSG) 
	{
		CAPIDS.push(CAPIDSG[x])
	}
	for (x in CAPIDSP) 
	{
		CAPIDS.push(CAPIDSP[x])
	}
	for (x in CAPIDSE) 
	{
		CAPIDS.push(CAPIDSE[x])
	}
	for (x in CAPIDSAP) 
	{
		CAPIDS.push(CAPIDSAP[x])
	}
	for (x in CAPIDSA) 
	{
		CAPIDS.push(CAPIDSA[x])
	}
	for (x in CAPIDSGBP) 
	{
		CAPIDS.push(CAPIDSGBP[x])
	}
	for (x in CAPIDSB) 
	{
		CAPIDS.push(CAPIDSB[x])
	}
	for (x in CAPIDSC) 
	{
		CAPIDS.push(CAPIDSC[x])
	}
	for (x in CAPIDSCR) 
	{
		CAPIDS.push(CAPIDSCR[x])
	}
	for (x in CAPIDSCON) 
	{
		CAPIDS.push(CAPIDSCON[x])
	}
	for (x in CAPIDSCREM) 
	{
		CAPIDS.push(CAPIDSCREM[x])
	}
	for (x in CAPIDSDC) 
	{
		CAPIDS.push(CAPIDSDC[x])
	}
	for (x in CAPIDSFEE) 
	{
		CAPIDS.push(CAPIDSFEE[x])
	}
	for (x in CAPIDSFPE) 
	{
		CAPIDS.push(CAPIDSFPE[x])
	}
	for (x in CAPIDSMC) 
	{
		CAPIDS.push(CAPIDSMC[x])
	}
	for (x in CAPIDSMV) 
	{
		CAPIDS.push(CAPIDSMV[x])
	}
	for (x in CAPIDSSOLV) 
	{
		CAPIDS.push(CAPIDSSOLV[x])
	}
	for (x in CAPIDSWTP) 
	{
		CAPIDS.push(CAPIDSWTP[x])
	}
	

    for (x in CAPIDS) 
    {

		        //var capId = aa.cap.getCapID(CAPIDS[x]).getOutput(); needed if you want to specify the altIds in CAPIDS array
				var capId = CAPIDS[x].getCapID();
                var cap = aa.cap.getCap(capId).getOutput(); // Cap Object
				capName = cap.getSpecialText();
                                capStatus = cap.getCapStatus();
				address = getAddress(capId);
				capIDString = cap.getCapModel().getAltID();
				if(capStatus != "Closed")
				{	
				updateAppStatus("Active","Updated by Script",capId);
				updateExpirationDateandstatus(expDate,capId,"About to Expire");
				}
                //createRefContactsFromCapContactsAndLink(capId,null,null,null,true,null);
                capCount++;
		   
		}
	return capCount;
	
}
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}

// exists:  return true if Value is in Array
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

function dateAdd(td,amt)
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	// if optional parameter #3 is present, use working days only
	{

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

function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile,capid)
{
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
function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
	}
}

function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES".
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization),
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

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
				emailParameters = aa.util.newHashtable();
				addParameter(emailParameters,"$$FACILITY_NAME$$",capName);
				addParameter(emailParameters,"$$USERNAME$$",con.getEmail());
				addParameter(emailParameters,"$$FACILITY-ADDRESS$$",address[0]);
				addParameter(emailParameters,"$$TP_YEAR$$",String(appdate1.getYear()-1));




				sendtest = sendNotification("pcapcd@placer.ca.gov",con.getEmail(),"","AQ_PUBLIC_USER",emailParameters,fileNames,pCapId);
			
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

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

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
function lookup(stdChoice,stdValue) 
	{
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

function createPublicUserFromContact(capId,contactType,refContactNum)   
{
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
				addParameter(emailParameters,"$$FACILITY_NAME$$",capName);
				addParameter(emailParameters,"$$USERNAME$$",userModel.getUserID());
				addParameter(emailParameters,"$$FACILITY-ADDRESS$$",address[0]);
				addParameter(emailParameters,"$$TP_YEAR$$",String(appdate1.getYear()-1));




				sendtest = sendNotification("pcapcd@placer.ca.gov",userModel.getEmail(),"","AQ_PUBLIC_USER",emailParameters,fileNames,capId);

		// send Activate email
		//aa.publicUser.sendActivateEmail(userModel, true, true);

		// send another email
		//aa.publicUser.sendPasswordEmail(userModel);
	    }
    	else {
    	    logDebug("**Warning creating public user " + contact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
    	}
    }

//  Now that we have a public user let's connect to the reference contact		
	
if (refContactNum)
	{
	logDebug("CreatePublicUserFromContact: Linking this public user with reference contact : " + refContactNum);
	aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);
	}
	

return userModel; // send back the new or existing public user
}

function updateAppStatus(stat,cmt,itemCap)
	{

	var updateStatusResult = aa.cap.updateAppStatus(itemCap,"APPLICATION",stat, appdate1, cmt ,systemUserObj);
	if (updateStatusResult.getSuccess())
		logMessage("INFO","CAP # "+ capIDString +" Updated Application Status to " + stat + " successfully.");
	else
		logMessage("**ERROR","CAP # "+ capIDString +" Application Status update to " + stat + " was unsuccessful. Application Status will need to be updated manually.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}
function licenseObject(licnumber)
	{
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
function getAddress(capId)
{
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
function updateExpirationDateandstatus(expDate,capid,expStatus)
{
var b1ExpResult = aa.expiration.getLicensesByCapID(capid)
   		if (b1ExpResult.getSuccess())
   			{
   			this.b1Exp = b1ExpResult.getOutput();
			var expAADate = aa.date.parseDate(expDate);
			this.b1Exp.setExpDate(expAADate);
			this.b1Exp.setExpStatus(expStatus);
			aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration())
			}
			
}
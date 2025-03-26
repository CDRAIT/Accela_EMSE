/*=============================================================================================
| Program : CTRCA_BuildingResidentialPVSolar12
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Script for generating Solar Permit Asynchronously, called from CTRCA:Building/Residential/PV Solar/NA
| 
|         : TDunn 10/02/2023 updated report generations code to a stand alone script to be called from the CTRCA:Building/Residential script
|		  : TDunn 10/10/2023 updates to included functions
|         : TDunn 10/11/2023 added additional custom functions
|         : TDunn 10/13/2023 updates to contact email calls
|
/========================================================================================================================================*/
logDebug("Starting the try clause to run the report");

try
{
	// Generatng report and notification
	logDebug("Inside the try clause");
	capId = aa.env.getValue("capId");
	var cap = aa.env.getValue("cap");
	var capIDString = aa.env.getValue("capIDString");
	var report = null;
	var reportName = "Building Permit - SOLARAPP";
	//var reportName = "SolarPermit";
	var reportModule = "Building";
	var emailTemplate = "SOLARAPP_PERMIT_ISSUED_NOTICE_TO_APPLICANT";
	var vFromEmail = "";
	var vToEmail = "tdunn1025@gmail.com";
	var vCcEmail = "";
	var cTypeArray = new Array();
	var vContactTypes = "Applicant";
	var debug = "";
	cTypeArray = vContactTypes.split(",");
	var reportParams = aa.util.newHashtable();
	addParameter(reportParams,"RecordID",capIDString);

	emailParameters = aa.util.newHashtable();
	var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
	acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaDeepLinkAppTypeAlias$$
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
	getRecordParams4Notification(emailParameters);
	getPrimaryAddressLineParam4Notification(emailParameters);
	getContactParams4Notification(emailParameters,"Applicant");
	vToEmail = emailParameters.get("$$applicantEmail$$");
	addParameter(emailParameters,"$$recID$$", capIDString);
	debug = debug + " " + vToEmail;

	if (aa.reportManager.getReportModelByName(reportName)){
		report = generateReport(reportName,reportParams,reportModule);
	}
	else logDebug("Unable to find report: " + reportName);
	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, new Array(report));
	debug = debug + " " + emailResult;
	// tpsGetEmailParams();
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing CTRCA SolarApp try message ", debug);	
}
catch(e)
{
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing CTRCA SolarApp Error message ", e.message);	
}

// Internal functions required by script
//==========================================
function getRecordParams4Notification(params) {

	itemCapId = (arguments.length == 2) ? arguments[1] : capId;
	// pass in a hashtable and it will add the additional parameters to the table

	var itemCapIDString = itemCapId.getCustomID();
	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	var itemCapName = itemCap.getSpecialText();
	var itemCapStatus = itemCap.getCapStatus();
	var itemFileDate = itemCap.getFileDate();
	var itemCapTypeAlias = itemCap.getCapType().getAlias();
	var itemHouseCount;
	var itemFeesInvoicedTotal;
	var itemBalanceDue;
	
	var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);		
	if (itemCapDetailObjResult.getSuccess())
	{
		itemCapDetail = itemCapDetailObjResult.getOutput();
		itemHouseCount = itemCapDetail.getHouseCount();
		itemFeesInvoicedTotal = itemCapDetail.getTotalFee();
		itemBalanceDue = itemCapDetail.getBalance();
	}
	
	var workDesc = workDescGet(itemCapId);
	addParameter(params, "$$altID$$", itemCapIDString);
	addParameter(params, "$$capName$$", itemCapName);
	addParameter(params, "$$recordTypeAlias$$", itemCapTypeAlias);
	addParameter(params, "$$capStatus$$", itemCapStatus);
	addParameter(params, "$$fileDate$$", itemFileDate);
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(itemBalanceDue).toFixed(2));
	addParameter(params, "$$workDesc$$", (workDesc) ? workDesc : "");
	return params;
}


function getPrimaryAddressLineParam4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
	}

	return params;
}


function getContactParams4Notification(params,conType) {
	// pass in a hashtable and it will add the additional parameters to the table
	// pass in contact type to retrieve
	contactArray = getContactArray();
	for(ca in contactArray) {
		thisContact = contactArray[ca];
		if (thisContact["contactType"] == conType) {
			conType = conType.toLowerCase();
			addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
			addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
			addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
			addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);
			addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);
			addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);
			addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);
			addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);
			addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);
			addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);
			addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);
			addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);
			addParameter(params, "$$" + conType + "City$$", thisContact["city"]);
			addParameter(params, "$$" + conType + "State$$", thisContact["state"]);
			addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);
			addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);
			addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);
			addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);
			addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

		}
	}
	return params;	
}

function getContactArray()
	{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];

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

	if (capContactArray)
		{
		for (yy in capContactArray)
			{
			var aArray = new Array();
			aArray["lastName"] = capContactArray[yy].getPeople().lastName;
			aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
			aArray["firstName"] = capContactArray[yy].getPeople().firstName;
			aArray["middleName"] = capContactArray[yy].getPeople().middleName;
			aArray["businessName"] = capContactArray[yy].getPeople().businessName;
			aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
			aArray["contactType"] =capContactArray[yy].getPeople().contactType;
			aArray["relation"] = capContactArray[yy].getPeople().relation;
			aArray["phone1"] = capContactArray[yy].getPeople().phone1;
			aArray["phone2"] = capContactArray[yy].getPeople().phone2;
			aArray["email"] = capContactArray[yy].getPeople().email;
			aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
			aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
			aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
			aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
			aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
			aArray["fax"] = capContactArray[yy].getPeople().fax;
			aArray["notes"] = capContactArray[yy].getPeople().notes;
			aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
			aArray["fullName"] = capContactArray[yy].getPeople().fullName;
			aArray["peopleModel"] = capContactArray[yy].getPeople();

			var pa = new Array();

			if (arguments.length == 0 && !cap.isCompleteCap()) {
				var paR = capContactArray[yy].getPeople().getAttributes();
				if (paR) pa = paR.toArray();
				}
			else
				var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
	                for (xx1 in pa)
                   		aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

        	cArray.push(aArray);
			}
		}
	return cArray;
	}

function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}


function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function emailContact(mSubj,mText)   // optional: Contact Type, default Applicant
	{
	var replyTo = "noreply@accela.com";
	var contactType = "Applicant"
	var emailAddress = "";

	if (arguments.length == 3) contactType = arguments[2]; // use contact type specified

	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				if (Contacts[yy].getEmail() != null)
					emailAddress = "" + Contacts[yy].getEmail();
		}

	if (emailAddress.indexOf("@") > 0)
		{
		aa.sendMail(replyTo, emailAddress, "", mSubj, mText);
		logDebug("Successfully sent email to " + contactType);
		}
	else
		logDebug("Couldn't send email to " + contactType + ", no valid email address");
	} 


function email(pToEmail, pFromEmail, pSubject, pText) 
	{
	//Sends email to specified address
	//06SSP-00221
	//
	aa.sendMail(pFromEmail, pToEmail, "", pSubject, pText);
	logDebug("Email sent to "+pToEmail);
	return true;
	}

function logDebug(str){aa.print(str);}
function logMessage(str){aa.print(str);}
 
function getCapId() {

	var s_id1 = aa.env.getValue("PermitId1");
	var s_id2 = aa.env.getValue("PermitId2");
	var s_id3 = aa.env.getValue("PermitId3");

	if (s_id1 == null || s_id1 == ""
		 || s_id2 == null || s_id2 == ""
		 || s_id3 == null || s_id3 == "") {
		return null;
	}
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
	if (s_capResult.getSuccess())
		return s_capResult.getOutput();
	else {
		logDebug("function getCapID: failed to get capId from script environment: " + s_capResult.getErrorMessage());
		return null;
	}
}


function generateReportTPS_CustomFileName(aaReportName, parameters, rModule, newRptName) {
/*this variation of generateReportTPS was created to alter both the name of the file that is both stored against the record and sent to customer via email*/

    var reportName = aaReportName;

    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();

    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);
	
    //var permit = aa.reportManager.hasPermission(reportName, currentUserID);
    var permit = aa.reportManager.hasPermission(reportName,"ADMIN");
	
    if (permit.getOutput().booleanValue()) {
        var reportResult = aa.reportManager.getReportResult(report);
		
        if (reportResult) {
            reportResult = reportResult.getOutput();
	    //aa.print("Original File Name:" + reportResult.getName());
			originalFileName = reportResult.getName(); //stores the original file name for future reference
			
			/*Change Report File Name of email attachment*/
			reportResultTest = reportResult;
			reportResultTestModel = reportResultTest.getReportResultModel();
			reportResultTestModel.setName(newRptName);
			/*end: Change Report File Name of email attachment*/
			
            var reportFile = aa.reportManager.storeReportToDisk(reportResult);
            //logDebug("Report Result: " + reportResult);
            reportFile = reportFile.getOutput();

            return reportFile
        } else {
            logDebug("Unable to run report: " + reportName + " for Admin" + systemUserObj);
            return false;
        }
    } else {
        logDebug("No permission to report: " + reportName + " for Admin" + systemUserObj);
        return false;
    }
}

function getACARecordURL(acaUrl) {
	itemCap = (arguments.length == 2) ? arguments[1] : capId;
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
 	var itemCapModel = aa.cap.getCap(itemCap).getOutput().getCapModel();

   	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + itemCapModel.getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")) acaRecordUrl += "&FromACA=Y";

   	return acaRecordUrl;

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
	
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
}

function workDescGet(pCapId)
	{
	//Gets work description
	//07SSP-00037/SP5017
	//
	var workDescResult = aa.cap.getCapWorkDesByPK(pCapId);
	
	if (!workDescResult.getSuccess())
		{
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
		}
		
	var workDescObj = workDescResult.getOutput();
	var workDesc = workDescObj.getDescription();
	
	return workDesc;
	}
	
// 10/28/21 MNiccore added to use to get primary contact
function getContactArrayWithPrimary() {
    // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
    // optional capid
    // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
    // on ASA it should still be pulled normal way even though still partial cap
    var thisCap = capId;
    if (arguments.length == 1) thisCap = arguments[0];

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

    if (capContactArray) {

        for (yy in capContactArray) {
            var aArray = new Array();
            aArray["lastName"] = capContactArray[yy].getPeople().lastName;
            aArray["firstName"] = capContactArray[yy].getPeople().firstName;
            aArray["middleName"] = capContactArray[yy].getPeople().middleName;
            aArray["businessName"] = capContactArray[yy].getPeople().businessName;
            aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
            aArray["contactType"] = capContactArray[yy].getPeople().contactType;
            aArray["relation"] = capContactArray[yy].getPeople().relation;
            aArray["phone1"] = capContactArray[yy].getPeople().phone1;
            aArray["phone2"] = capContactArray[yy].getPeople().phone2;
            aArray["email"] = capContactArray[yy].getPeople().email;
            aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
            aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
            aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
            aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
            aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
            aArray["fax"] = capContactArray[yy].getPeople().fax;
            aArray["notes"] = capContactArray[yy].getPeople().notes;
            aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
            aArray["fullName"] = capContactArray[yy].getPeople().fullName;
            //aArray["contactTypeFlag"] = capContactArray[yy].getPeople().getContactTypeFlag();
            aArray["primaryFlag"] = capContactArray[yy].getPeople().getFlag();

            if (arguments.length == 0 && !cap.isCompleteCap()) // using capModel to get contacts
                var pa = capContactArray[yy].getPeople().getAttributes().toArray();
            else
                var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
            for (xx1 in pa)
                aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;
            cArray.push(aArray);
        }
    }
    return cArray;
}

function getACARecordParam4Notification(params,acaUrl) {

	itemCap = (arguments.length == 3) ? arguments[2] : capId;

	addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl,itemCap));

	return params;	

}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);
    logDebug(parameters);
    //var permit = aa.reportManager.hasPermission(reportName,currentUserID);
	var permit = aa.reportManager.hasPermission(reportName,"ADMIN");

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
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

function appMatch(ats) // optional capId or CapID string
	{
	var matchArray = appTypeArray //default to current app
	if (arguments.length == 2) 
		{
		matchCapParm = arguments[1]
		if (typeof(matchCapParm) == "string")
			matchCapId = aa.cap.getCapID(matchCapParm).getOutput();   // Cap ID to check
		else
			matchCapId = matchCapParm;
		if (!matchCapId)
			{
			logDebug("**WARNING: CapId passed to appMatch was not valid: " + arguments[1]);
			return false
			}
		matchCap = aa.cap.getCap(matchCapId).getOutput();
		matchArray = matchCap.getCapType().toString().split("/");
		}
		
	var isMatch = true;
	var ata = ats.split("/");
	if (ata.length != 4)
		logDebug("**ERROR in appMatch.  The following Application Type String is incorrectly formatted: " + ats);
	else
		for (xx in ata)
			if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
				isMatch = false;
	return isMatch;
	}
	
function dateAdd(td, amt)
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td) dDate = new Date(aa.util.now());
	else
		dDate = convertDate(td);

	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay) {
			logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt)) {
				dDate.setDate(dDate.getDate() + parseInt((amt > 0 ? 1 : -1), 10));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
			}
		} else {
			while (i < Math.abs(amt)) {
				if (amt > 0) {
					dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;
				} else {
					dDate = new Date(aa.calendar.getPreviousWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
					i++;

				}
			}
		}
	else
		dDate.setDate(dDate.getDate() + parseInt(amt, 10));

	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

function tpsGetEmailParams() 
{

	//var params = aa.env.paramValues;
	var params = emailParameters;
	var keys = params.keys(); // class java.util.Hashtable$Enumerator ;

	var key = null;

	while (keys.hasMoreElements()) 
	{

		key = keys.nextElement();

		//        logDebug("var " + key + " = aa.env.getValue( \"" + key + "\" );");

		//        logDebug("Loaded Env Variable: " + key + " = " + aa.env.getValue(key));

		debug += key + ' = ' + params.get(key) + ' ;';

		//for (x in keys) aa.print(x + "    " + keys[x]);

	}
}
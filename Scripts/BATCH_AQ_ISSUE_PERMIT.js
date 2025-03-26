/*------------------------------------------------------------------------------------------------------/
| Program: LicenseSetAboutToExpire  Trigger: Batch
| Client : Placer Air Quaility
|
| Version 1.0 - Base Version. 09/03/2017 - TruePoint Solutions
| Version 1.1 - Modified criteria and correct syntax errors.  09/10/2017 TJD
| Removed CC to rmoore on sending permit to permit holder.
| Script is run to email permit to facilities.
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
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
//Global variables
var batchStartDate = new Date();                                                        // System Date
var batchStartTime = batchStartDate.getTime();                                          // Start timer
var timeExpired = false;                                                                // Variable to identify if batch script has timed out. Defaulted to "false".
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;                                                    // Use Group name when populating App Specific Info Values
var senderEmailAddr = "pcapcd@placer.ca.gov";                                          // Email address of the sender
var emailAddress = "rmoore@placer.ca.gov";                                      // Email address of the person who will receive the batch script log information
var emailAddress2 = "";                                                                 // CC email address of the person who will receive the batch script log information
var emailText = "";                                                                     // Email body
//Parameter variables
var paramsOK = true;

/*------------------------------------------------------------------------------------------------------/
| END: Batch Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/

if (paramsOK) {
    logMessage("START", "Start of Sending of Permit Batch Job.");

    var licAboutToExpCnt = aboutExpLics();

    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of Sending of Permit Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for Sending of Permit", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() 
{
    var capCount = 0;
	var myExp = [];
    var expResult1 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","1st qtr").getOutput();
	var expResult2 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","2nd qtr").getOutput();
	var expResult3 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","3rd qtr").getOutput();
	var expResult4 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","4th qtr").getOutput();
	//var myExp = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","test qtr").getOutput();

	for ( i in expResult1)
	{
		myExp.push(expResult1[i])
	}
	for ( i in expResult2)
	{
		myExp.push(expResult2[i])
	}
	for ( i in expResult3)
	{
		myExp.push(expResult3[i])
	}
	for ( i in expResult4)
	{
		myExp.push(expResult4[i])
	}



    for (i in myExp) // for each b1expiration (effectively, each license app) 
    {
        if (elapsed() > maxSeconds) // Only continue if time hasn't expired
        {
            logMessage("**WARNING", "A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
            timeExpired = true;
            break;
        }

        var oldcapId = myExp[i].getCapID(); // CapIDModel Object
        var capchildren = getChildren("AirQuality/Stationary Source/Permit to Operate/*",oldcapId);
		var childcount = getChildrencount("AirQuality/Stationary Source/Permit to Operate/*",oldcapId);
		var print = getAppSpecific("Issue Permit",oldcapId);
		var ThruReceived = getAppSpecific("Throughput Received",oldcapId);
		var ThruSent = getAppSpecific("Throughput Sent",oldcapId);
		
		
		
		
		if (print == "CHECKED")
		{
		
		if ( ThruSent == "CHECKED" && ThruReceived == "CHECKED" && print == "CHECKED") 	{
		 for(eachchild in capchildren)
		 {
			 var eachChildCapId = capchildren[eachchild];
			 var childcap = aa.cap.getCap(eachChildCapId).getOutput();
			 var pcapId = getParentPlacer(childcap.getCapID());
			 var ROContact = getContactEmailByContactType("Responsible Official",pcapId);
			 var customID = eachChildCapId.getCustomID();
			 var startdate = getAppSpecific("Start Date",eachChildCapId);
			 var enddate = getAppSpecific("Expiration Date",eachChildCapId);
			 var sysDate = aa.date.getCurrentDate();
			 var condcount = appAnyCondition(eachChildCapId);
			 var currentdate = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"YYYY-MM-DD")
			 if (sysDate.getMonth() > 9)
			 {
			 month = sysDate.getMonth().toString(); 
			 }
			 else
			 {
			 month = "0" + sysDate.getMonth().toString();
			 }
			 
			 var status = childcap.getCapStatus();
						 
			 if((startdate == null || startdate == "") && (status == "ACTIVE" || status == "Active"))
			 {
				 email("RMoore@placer.ca.gov;EOrozco@placer.ca.gov;pmontoya@placer.ca.gov","pcapcd@placer.ca.gov","Permit was not issued No Start Date","Permit " + customID + " does not have a start date");
			 }
			 if((condcount == "0") && (status == "ACTIVE" || status == "Active"))
				 {
				 email("RMoore@placer.ca.gov;EOrozco@placer.ca.gov;pmontoya@placer.ca.gov","pcapcd@placer.ca.gov","Permit was not issued No Conditions","Permit " + customID + " does not have any conditions");
			 } 
			 var filedate = sysDate.getYear().toString()+ month + sysDate.getDayOfMonth().toString();
			 
			 if ((status == "ACTIVE" || status == "Active") && ROContact != "" && startdate != "" && startdate != null && condcount != "0")
			 {
				 editAppSpecific("Issue Date",dateAdd(null,0),eachChildCapId);
				 editAppSpecific("Start Date",dateAddMonths(startdate,12),eachChildCapId);
				 editAppSpecific("Expiration Date",dateAddMonths(enddate,12),eachChildCapId);
				 paramMap = aa.util.newHashMap();
				 paramMap.put("PermitNumber",customID);
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$RECORDALTID$$",customID);
				 report = generateReport("AQ_Permit_Report_To_Disk",paramMap,"AirQuality",eachChildCapId);
				 sendtest = sendNotification("pcapcd@placer.ca.gov",ROContact,"RMoore@placer.ca.gov","AQ PERMIT",emailParameters,new Array(report),eachChildCapId);
			 }
			  if ((status == "ACTIVE" || status == "Active") && ROContact == "" && startdate != "" && startdate != null && condcount != "0")
			 {
				 editAppSpecific("Issue Date",dateAdd(null,0),eachChildCapId);
				 editAppSpecific("Start Date",dateAddMonths(startdate,12),eachChildCapId);
				 editAppSpecific("Expiration Date",dateAddMonths(enddate,12),eachChildCapId);
				 paramMap = aa.util.newHashMap();
				 paramMap.put("PermitNumber",customID);
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$RECORDALTID$$",customID);
				 report = generateReport("AQ_Permit_Report_To_Disk",paramMap,"AirQuality",eachChildCapId);
				 sendtest = sendNotification("pcapcd@placer.ca.gov","sfrancis@placer.ca.gov","RMoore@placer.ca.gov","AQ PERMIT",emailParameters,new Array(report),eachChildCapId);
			 }
			 docArray = aa.document.getCapDocumentList(eachChildCapId,"NGRAF").getOutput(); 
			 for (x in docArray) 
			 {
				 
				 if(docArray[x].getDocName().substring(0,3) == "AQ_" && docArray[x].getFileUpLoadDate().toString().substring(0,10) == currentdate)
				 {
					 docArray[x].setFileName(filedate + "_" +  customID + ".pdf");docArray[x].setDocName(customID + "_" + filedate);aa.document.updateDocument(docArray[x]);
				 }
			 }
			 
			 }
		
			editAppSpecific("Issue Permit","UNCHECKED",oldcapId); 
			 
			 
		}// end of children
	
          
		  
		if ( ThruSent != "CHECKED" && print == "CHECKED") 	{
		 for(eachchild in capchildren)
		 {
			 var eachChildCapId = capchildren[eachchild];
			 var childcap = aa.cap.getCap(eachChildCapId).getOutput();
			 var pcapId = getParentPlacer(childcap.getCapID());
			 var ROContact = getContactEmailByContactType("Responsible Official",pcapId);
			 var customID = eachChildCapId.getCustomID();
			 var startdate = getAppSpecific("Start Date",eachChildCapId);
			 var enddate = getAppSpecific("Expiration Date",eachChildCapId);
			 var sysDate = aa.date.getCurrentDate();
			 var condcount = appAnyCondition(eachChildCapId);
			 var currentdate = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"YYYY-MM-DD")
			 if (sysDate.getMonth() > 9)
			 {
			 month = sysDate.getMonth().toString(); 
			 }
			 else
			 {
			 month = "0" + sysDate.getMonth().toString();
			 }
			 
			 var status = childcap.getCapStatus();
						 
			 if((startdate == null || startdate == "") && (status == "ACTIVE" || status == "Active"))
			 {
				 email("RMoore@placer.ca.gov;EOrozco@placer.ca.gov;pmontoya@placer.ca.gov","pcapcd@placer.ca.gov","Permit was not issued No Start Date","Permit " + customID + " does not have a start date");
			 }
			 if((condcount == "0") && (status == "ACTIVE" || status == "Active"))
				 {
				 email("RMoore@placer.ca.gov;EOrozco@placer.ca.gov;pmontoya@placer.ca.gov","pcapcd@placer.ca.gov","Permit was not issued No Conditions","Permit " + customID + " does not have any conditions");
			 } 
			 var filedate = sysDate.getYear().toString()+ month + sysDate.getDayOfMonth().toString();
			 
			 if ((status == "ACTIVE" || status == "Active") && ROContact != "" && startdate != "" && startdate != null && condcount != "0")
			 {
				 editAppSpecific("Issue Date",dateAdd(null,0),eachChildCapId);
				 editAppSpecific("Start Date",dateAddMonths(startdate,12),eachChildCapId);
				 editAppSpecific("Expiration Date",dateAddMonths(enddate,12),eachChildCapId);
				 paramMap = aa.util.newHashMap();
				 paramMap.put("PermitNumber",customID);
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$RECORDALTID$$",customID);
				 report = generateReport("AQ_Permit_Report_To_Disk",paramMap,"AirQuality",eachChildCapId);
				 sendtest = sendNotification("pcapcd@placer.ca.gov",ROContact,"","AQ PERMIT",emailParameters,new Array(report),eachChildCapId);
			 }
			  if ((status == "ACTIVE" || status == "Active") && ROContact == "" && startdate != "" && startdate != null && condcount != "0")
			 {
				 editAppSpecific("Issue Date",dateAdd(null,0),eachChildCapId);
				 editAppSpecific("Start Date",dateAddMonths(startdate,12),eachChildCapId);
				 editAppSpecific("Expiration Date",dateAddMonths(enddate,12),eachChildCapId);
				 paramMap = aa.util.newHashMap();
				 paramMap.put("PermitNumber",customID);
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$RECORDALTID$$",customID);
				 report = generateReport("AQ_Permit_Report_To_Disk",paramMap,"AirQuality",eachChildCapId);
				 sendtest = sendNotification("pcapcd@placer.ca.gov","sfrancis@placer.ca.gov","RMoore@placer.ca.gov","AQ PERMIT",emailParameters,new Array(report),eachChildCapId);
			 }
			 docArray = aa.document.getCapDocumentList(eachChildCapId,"NGRAF").getOutput(); 
			 for (x in docArray) 
			 {
				 
				 if(docArray[x].getDocName().substring(0,3) == "AQ_" && docArray[x].getFileUpLoadDate().toString().substring(0,10) == currentdate)
				 {
					 docArray[x].setFileName(filedate + "_" +  customID + ".pdf");docArray[x].setDocName(customID + "_" + filedate);aa.document.updateDocument(docArray[x]);
				 }
			 }
			 
			 }
		
			editAppSpecific("Issue Permit","UNCHECKED",oldcapId); 
			 
			 
		}// end of children
	
          
		  	  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		  
		}
		  
		  
		  
		  

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
    aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
    aa.print(etype + " : " + edesc);
    emailText += etype + " : " + edesc + "<br />";
}

function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
        aa.print("DEBUG : " + edesc);
        emailText += "DEBUG : " + edesc + " <br />";
    }
}

function getCapId(pid1, pid2, pid3) {

    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if (s_capResult.getSuccess())
        return s_capResult.getOutput();
    else {
        logDebug("**ERROR", "Failed to get capId: " + s_capResult.getErrorMessage());
        return null;
    }
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

    if (!td)
        dDate = new Date();
    else
        dDate = new Date(td);
    var i = 0;
    if (useWorking)
        if (!aa.calendar.getNextWorkDay) {
        logDebug("**ERROR", "getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
        while (i < Math.abs(amt)) {
            dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
            if (dDate.getDay() > 0 && dDate.getDay() < 6)
                i++
        }
    }
    else {
        while (i < Math.abs(amt)) {
            dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
            i++;
        }
    }
    else
        dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}
function getParentPlacer(childcapid) 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(childcapid,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
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
function getinvoicebalance(InvNbr)
{
	var feeAmount = 0;
	var amtPaid = 0;
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getInvoiceNbr() == InvNbr)
			    {	
				  feeAmount += new Number(String(fList[fNum].getFee()));
			  var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if ((fList[fNum].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()) && (pfObj[ij].getInvoiceNbr() == InvNbr))
						amtPaid+=pfObj[ij].getFeeAllocation()
				}
				}
				
				return feeAmount - amtPaid;
}


function getinvoicenumberbydate(capid,date)
{
	// date format needs to be MM/DD/YYYY
	var invoicenumber = "";
	
	iListResult = aa.finance.getInvoiceByCapID(capid,null);
	iList = iListResult.getOutput();
	for (iNum in iList)
		if(dateFormatted(iList[iNum].getInvDate().getMonth(),iList[iNum].getInvDate().getDayOfMonth(),iList[iNum].getInvDate().getYear(),"").equals(date))
			invoicenumber = iList[iNum].getInvNbr();
	return 	invoicenumber
}

function generateReport(aaReportName,parameters,rModule,capid) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capid);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,"Admin");

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
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}
function getChildren(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch)
			retArray.push(childCapId);
		}
		
	//logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

	}
function getChildrencount(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		childStatus = childArray[xx].getCapStatus();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch && childStatus.equals("ACTIVE"))
			retArray.push(childCapId);
		}
		
//	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray.length;

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
function getAppSpecific(itemName,itemCap)  // optional: itemCap
{
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

function editAppSpecific(itemName,itemValue,capId)  // optional: itemCap
{
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

function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0" + pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
		day = "0" + pDay.toString();

	if (pFormat == "YYYY-MM-DD")
		ret = pYear.toString() + "-" + mth + "-" + day;
	else
		ret = "" + mth + "/" + day + "/" + pYear.toString();

	return ret;
}
function dateAddMonths(pDate, pMonths)
	{
	// Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
	// If pDate is null, uses current date
	// pMonths can be positive (to add) or negative (to subtract) integer
	// If pDate is on the last day of the month, the new date will also be end of month.
	// If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, in which case the new date will be on the last day of the month
	//
	if (!pDate)
		baseDate = new Date();
	else
		baseDate = convertDate(pDate);

	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	if (baseDate.getDate() < day)
		{
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
		}
	return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
	}
function convertDate(thisDate)
	{

	if (typeof(thisDate) == "string")
		{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
		}

	if (typeof(thisDate)== "object")
		{

		if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
			{
			return thisDate;
			}

		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}
			
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
			}			

		if (thisDate.getClass().toString().equals("class java.util.Date"))
			{
			return new Date(thisDate.getTime());
			}

		if (thisDate.getClass().toString().equals("class java.lang.String"))
			{
			return new Date(String(thisDate));
			}
		}

	if (typeof(thisDate) == "number")
		{
		return new Date(thisDate);  // assume milliseconds
		}

	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}
function appAnyCondition(capid)
	{
        count = 0;
		var condResult = aa.capCondition.getCapConditions(capid);
		
	if (condResult.getSuccess())
		var capConds = condResult.getOutput();
	else
		{ 
		logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
		return count;
		}
	

	
	for (cc in capConds)
		{
			count++;
		}
	return count; //no matching condition found
	}	
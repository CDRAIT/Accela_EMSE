/*------------------------------------------------------------------------------------------------------/
| Program: LicenseSetAboutToExpire  Trigger: Batch
| Client : Placer Air Quaility
|
| Version 1.0 - Base Version. 09/03/2017 - TruePoint Solutions
| Version 1.1 - Modified criteria and correct syntax errors.  09/10/2017 TJD
|
| Script is run to email permit to facilities.
|
| Batch Requirements:
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true; 				// Set to true to see debug messages in event log and email confirmation
var maxSeconds = 25 * 60; 			// number of seconds allowed for batch processing, usually < 5*60
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
var senderEmailAddr = "pcapcd@placer.ca.gov";                                           // Email address of the sender
var emailAddress = "rmoore@placer.ca.gov";    			                                // Email address of the person who will receive the batch script log information
var emailAddress2 = "";                                             					// CC email address of the person who will receive the batch script log information
var emailText = "";              														// Email body
var acamessage = false;
//Parameter variables
dDate = new Date();
var paramsOK = true;
/*------------------------------------------------------------------------------------------------------/
| END: Batch Specific Variables
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    logMessage("START", "Start of Sending of Throughput Batch Job.");

    var licAboutToExpCnt = aboutExpLics();

    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of Sending of Throughput Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for Sending of Throughput", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() {
    var capCount = 0; 
	var CAPIDS = [];
	
//	    var expResult1 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","test qtr").getOutput();
		
//    var expResult1 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","1st qtr").getOutput();
	var expResult1 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","2nd qtr").getOutput();
//	var expResult1 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","3rd qtr").getOutput();
//var expResult1 = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","4th qtr").getOutput();

for ( i in expResult1)
{
CAPIDS.push(expResult1[i])
}
//for ( i in expResult2)
//{
//CAPIDS.push(expResult2[i])
//}
//for ( i in expResult3)
//{
//CAPIDS.push(expResult3[i])
//}
//for ( i in expResult4)
//{
//CAPIDS.push(expResult4[i])
//}
  for (x in CAPIDS) // for each b1expiration (effectively, each license app) 
    {
       var capId = CAPIDS[x].getCapID();
	   var ICContact = getContactEmailByContactType("Throughput",capId);
       var ROContact = getContactEmailByContactType("Responsible Official",capId);
	   var Thru = getAppSpecific("Throughput Sent",capId);
	   var cap = aa.cap.getCap(capId).getOutput();
	   var capstatus = cap.getCapStatus();
	   var FACcapId = getCapId(CAPIDS[x].getID1(), CAPIDS[x].getID2(), CAPIDS[x].getID3());
	   var tempcapid =  aa.cap.getCap(FACcapId).getOutput();
	   var customID = FACcapId.getCustomID();
 	   var FacAppName = String(tempcapid.getSpecialText());
	   var temail = "rmoore@placer.ca.gov";
	   var childcount = getAppSpecific("ChildCount",capId)   ; //getChildrencount("AirQuality/*/Permit to Operate/*",FACcapId);
	   var acavar = checkprocess(customID);
	   
//     logDebug("DEBUG: Found Facility Children = " + childcount );
//	   logDebug("DEBUG: Found Throughput = " + Thru );
//	   logDebug("DEBUG: Found CapStatus = " + capstatus );


aa.print(acavar)
dDate = new Date();
throughputyear = String(dDate.getFullYear()-1);

   logDebug("DEBUG:  Throughput Year = " + throughputyear );
	   if((ICContact != "" && ROContact != "") && capstatus  !="Inactive" && capstatus != "Closed" && (Thru == "CHECKED" || Thru == null ) && childcount != null && childcount > 0)
	   {
				 temail = ICContact + ";" + ROContact;
	   	   		 paramMap = aa.util.newHashMap();
				 paramMap.put("FacNumber",String(customID)); 
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$FACILITYNAME$$",FacAppName); //Email Notification 
 				 addParameter(emailParameters,"$$year$$",String(dDate.getFullYear()-1)); //Email Notification 
  			     logDebug("DEBUG: Generate Report 1 " + customID );
				 report = generateReport("Throughput",paramMap,"AirQuality",capId);
//				aa.print(temail);
		         logDebug("DEBUG: send email Report 1" + report);
// 				 if (acavar = "True")
//				 {
// 				 addParameter(emailParameters,"$$throughput$$",acamessage); //Email Notification 	
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ ThroughputACA",emailParameters,new Array(report),capId);
//				 } else {
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ Throughput",emailParameters,new Array(report),capId);
//				 }	


				 logDebug("DEBUG: Found Facility CustomID = " + customID + ".  Email address for Contact = " + temail);
//				 if (sendtest == "true")
//				 {
//					editAppSpecific("Throughput Sent","CHECKED",capId);
//				 }
	   }
	   if((ICContact != "" && ROContact == "") && capstatus  !="Inactive" && capstatus != "Closed"  && (Thru == "CHECKED" || Thru == null ) && childcount != null && childcount > 0)
	   {
				 temail = ICContact;
	   	   	   	 paramMap = aa.util.newHashMap();
				 paramMap.put("FacNumber",String(customID)); //        ?????????????????
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$FACILITYNAME$$",FacAppName); //Email Notification 
 				 addParameter(emailParameters,"$$year$$",String(dDate.getFullYear()-1)); //Email Notification 


				 logDebug("DEBUG: Generate Report 2");
				 logDebug("DEBUG: send email Report 2");
				 logDebug("DEBUG: Found Facility CustomID = " + customID + ".  Email address for Contact = " + temail);
				 report = generateReport("Throughput",paramMap,"AirQuality",capId);
//				aa.print(temail);
// 				 if (acavar = "True")
//				 {
 //				 addParameter(emailParameters,"$$throughput$$",acamessage); //Email Notification 	
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ ThroughputACA",emailParameters,new Array(report),capId);
//				 } else {
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ Throughput",emailParameters,new Array(report),capId);
//				 }	
//				 if (sendtest == "true")
//				 {
//					editAppSpecific("Throughput Sent","CHECKED",capId);
//				 }
	   }
	   if((ICContact == "" && ROContact != "") && capstatus  !="Inactive" && capstatus != "Closed"  && (Thru == "CHECKED" || Thru == null ) && childcount != null && childcount > 0)
	   {
	   temail = ROContact;
	   	   	   	 paramMap = aa.util.newHashMap();
				 paramMap.put("FacNumber",String(customID)); //        ?????????????????
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$FACILITYNAME$$",FacAppName); //Email Notification 
   				 addParameter(emailParameters,"$$year$$",String(dDate.getFullYear()-1)); //Email Notification 
 				 logDebug("DEBUG: Generate Report 3");
				 logDebug("DEBUG: send email Report 3");
				 logDebug("DEBUG: Found Facility CustomID = " + customID + ".  Email address for Contact = " + temail);
				 report = generateReport("Throughput",paramMap,"AirQuality",capId);
//				aa.print(temail);
// 				 if (acavar = "True")
//				 {
// 				 addParameter(emailParameters,"$$throughput$$",acamessage); //Email Notification 	
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ ThroughputACA",emailParameters,new Array(report),capId);
//				 } else {
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ Throughput",emailParameters,new Array(report),capId);
//				 }			
//				if (sendtest == "true")
//				 {
//					editAppSpecific("Throughput Sent","CHECKED",capId);
//				 }
	   }
	   if((ICContact == "" && ROContact == "") && capstatus  !="Inactive" && capstatus != "Closed"  && (Thru == "CHECKED" || Thru == null ) && childcount != null && childcount > 0)
	   {
				 temail = "rmoore@placer.ca.gov";
	   	   	   	 paramMap = aa.util.newHashMap();
				 paramMap.put("FacNumber",String(customID)); //        ?????????????????
				 emailParameters = aa.util.newHashtable();
				 addParameter(emailParameters,"$$FACILITYNAME$$",FacAppName); //Email Notification 
 				 addParameter(emailParameters,"$$year$$",String(dDate.getFullYear()-1)); //Email Notification 

 				 logDebug("DEBUG: Generate Report 4");
				 logDebug("DEBUG: Found Facility CustomID = " + customID + ".  Email address for Contact = " + temail);
				 report = generateReport("Throughput",paramMap,"AirQuality",capId);
//				aa.print(temail);
// 				 if (acavar = "True")
//				 {
// 				 addParameter(emailParameters,"$$throughput$$",acamessage); //Email Notification 	
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ ThroughputACA",emailParameters,new Array(report),capId);
//				 } else {
//	  			 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"","AQ Throughput",emailParameters,new Array(report),capId);
//				 }					

//				if (sendtest == "true")
//				 {
//					editAppSpecific("Throughput Sent","CHECKED",capId);
//				 }
	   }
	       capCount++;
     }
	 
	 
	 
    return capCount;
}
function checkprocess(altID)
{
var process = "False";
var capId = aa.cap.getCapID(altID).getOutput();
var child = getChildren("AirQuality/Stationary Source/Permit to Operate/*",capId)
for (x in child)
{

               var childprocess = getChildrencount("AirQuality/Stationary Source/Process/*",child[x])
               if(childprocess > 0)
               {
                              process = "True"
                              return process
			   } else {
                              process = "False"
                              return process
               }
}
return process
}

function getChildrencount(pCapType, pParentCapId) 
               {
               // Returns an array of children capId objects whose cap type matches pCapType parameter
               // Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
               // Optional 3rd parameter pChildCapIdSkip: capId of child to skip

               var retArray = new Array();
               var vCapId = pParentCapId;

                              
               if (arguments.length>2)
                              var childCapIdSkip = arguments[2];
               else
                              var childCapIdSkip = null;
                              
               var typeArray = pCapType.split("/");
               if (typeArray.length != 4)
                              aa.print("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
                              
               var getCapResult = aa.cap.getChildByMasterID(vCapId);
               var childArray = getCapResult.getOutput();

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

                              capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();               // Convert cap type to string ("Building/A/B/C")
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
                              if (isMatch && (childStatus.equals("ACTIVE") || childStatus.equals("Active")))
                                             retArray.push(childCapId);
                              }
                              
               
               return retArray.length;

               }
function getChildren(pCapType, pParentCapId) 
               {
               // Returns an array of children capId objects whose cap type matches pCapType parameter
               // Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
               // Optional 3rd parameter pChildCapIdSkip: capId of child to skip

               var retArray = new Array();
               var vCapId = pParentCapId;

                              
               if (arguments.length>2)
                              var childCapIdSkip = arguments[2];
               else
                              var childCapIdSkip = null;
                              
               var typeArray = pCapType.split("/");
               if (typeArray.length != 4)
                              aa.print("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
                              
               var getCapResult = aa.cap.getChildByMasterID(vCapId);
               var childArray = getCapResult.getOutput();

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

                              capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();               // Convert cap type to string ("Building/A/B/C")
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
                              if (isMatch && (childStatus.equals("ACTIVE") || childStatus.equals("Active")))
                                             retArray.push(childCapId);
                              }
                              
               return retArray;

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
//				logDebug("DEBUG: Found Contact with Type = " + pContactType + ".  Email address for Contact = " + contactEmailToReturn);
				break;
			}
		}
	}

	if(contactEmailToReturn == null)
	{
		contactEmailToReturn = "";
	}
	
//	logDebug("Returning contact email address: " + contactEmailToReturn);
	return contactEmailToReturn;
}	
function getinvoicebalance(InvNbr,capId)
{
	var feeAmount = 0;
	var amtPaid = 0;
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getInvoiceNbr() == InvNbr && fList[fNum].getFeeitemStatus() != "VOIDED" && fList[fNum].getFeeitemStatus() != "CREDITED")
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

function dateFormatted(pMonth,pDay,pYear,pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
	{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0"+pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
		day = "0"+pDay.toString();

	if (pFormat=="YYYY-MM-DD")
		ret = pYear.toString()+"-"+mth+"-"+day;
	else
		ret = ""+mth+"/"+day+"/"+pYear.toString();

	return ret;
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
		logDebug("Sent email successfully to " + emailTo + "!");
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
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

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
	
	
function addFee(fcode,fsched,fperiod,fqty,finvoice,feeCap) // Adds a single fee, optional argument: fCap
	{
	// Updated Script will return feeSeq number or null if error encountered (SR5112) 
	var feeCapMessage = "";
	var feeSeq_L = new Array();				// invoicing fee for CAP in args
	var paymentPeriod_L = new Array();			// invoicing pay periods for CAP in args
	var feeSeq = null;
	if (arguments.length > 5) 
		{
		feeCap = arguments[5]; // use cap ID specified in args
		feeCapMessage = " to specified CAP";
		}

	assessFeeResult = aa.finance.createFeeItem(feeCap,fsched,fcode,fperiod,fqty);
	if (assessFeeResult.getSuccess())
		{
		feeSeq = assessFeeResult.getOutput();
		logDebug("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage + " " + feeCap);

		if (finvoice == "Y" && arguments.length == 5) // use current CAP
			{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
			}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
			{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
				logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
			}
			//updateFeeItemInvoiceFlag(feeSeq,finvoice);
		}
	else
		{
		logDebug( "**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		feeSeq = null;
		}
	
	return feeSeq;
	   
	}

function updateFeeItemInvoiceFlag(feeSeq,finvoice)
{
	if(feeSeq == null)
		return;
	if(publicUser && !cap.isCompleteCap())
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
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

function Nozrating (Noz)
{
if(Number(Noz) > 0 && Number(Noz) < 7)
{
	var rating = "06";
}
else if(Number(Noz) >= 7 && Number(Noz) < 13)
{
	var rating = "12";
}
else if(Number(Noz) >= 13 && Number(Noz) < 19)
{
	var rating = "18";
}
else if(Number(Noz) >= 19 && Number(Noz) < 25)
{
	var rating = "24";
}
else if(Number(Noz) >= 25 && Number(Noz) < 31)
{
	var rating = "30";
} 
else if(Number(Noz) >= 31)
{
	var rating = "31";
}
else
{
	var rating = "no rating";
}
return rating;
}

function getChildrencount(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	var vCapId = pParentCapId;

		
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
		if (isMatch && (childStatus.equals("ACTIVE") || childStatus.equals("Active")))
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray.length;

	}

function updatefeenotes(feeCap,fcode,altid,feeComment)
{
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(feeCap,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		fsm1 = feeObjArr[ff].getF4FeeItem();
	        fsm1.setFeeNotes(feeComment);
                aa.finance.editFeeItem(fsm1);
}
	
function invoiceAllFeesPlacer(capid) {
	var itemCap = capid;
	var targetFees = loadFeesplacer(itemCap);
	var feeSeqArray = new Array();
	var paymentPeriodArray = new Array();
	for (tFeeNum in targetFees)
		{
		targetFee = targetFees[tFeeNum];
			if (targetFee.status == "NEW" && targetFee.notes.substring(0,3) != "AC-" && Number(targetFee.notes.length) < 11)
				{
				feeSeqArray.push(targetFee.sequence);
				paymentPeriodArray.push(targetFee.period);

				}
		}
		var invoicingResult = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
		if (!invoicingResult.getSuccess())
			{
			logDebug("**ERROR: Invoicing fee items not successful.  Reason: " +  invoicingResult.getErrorMessage());
			return false;
			}
}

function loadFeesplacer(capid)
	{
	//  load the fees into an array of objects.  Does not
	var itemCap = capid;
	if (arguments.length > 0)
		{
		ltcapidstr = arguments[0]; // use cap ID specified in args
		if (typeof(ltcapidstr) == "string")
                {
				var ltresult = aa.cap.getCapID(ltcapidstr);
	 			if (ltresult.getSuccess())
  				 	itemCap = ltresult.getOutput();
	  			else
  				  	{ logMessage("**ERROR: Failed to get cap ID: " + ltcapidstr + " error: " +  ltresult.getErrorMessage()); return false; }
                }
		else
			itemCap = ltcapidstr;
		}

  	var feeArr = new Array();

	var feeResult=aa.fee.getFeeItems(itemCap);
		if (feeResult.getSuccess())
			{ var feeObjArr = feeResult.getOutput(); }
		else
			{ logDebug( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); return false }

		for (ff in feeObjArr)
			{
			fFee = feeObjArr[ff];
			var myFee = new Fee();
			var amtPaid = 0;
			var invoicenotes = "Blank"

			var pfResult = aa.finance.getPaymentFeeItems(itemCap, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (fFee.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid+=pfObj[ij].getFeeAllocation()
				}
                    if (fFee.getF4FeeItemModel().getFeeNotes() != null)
					{
						invoicenotes = fFee.getF4FeeItemModel().getFeeNotes();
					}

			myFee.notes = invoicenotes;
			myFee.sequence = fFee.getFeeSeqNbr();
			myFee.code =  fFee.getFeeCod();
			myFee.description = fFee.getFeeDescription();
			myFee.unit = fFee.getFeeUnit();
			myFee.amount = fFee.getFee();
			myFee.amountPaid = amtPaid;
			if (fFee.getApplyDate()) myFee.applyDate = convertDate(fFee.getApplyDate());
			if (fFee.getEffectDate()) myFee.effectDate = convertDate(fFee.getEffectDate());
			if (fFee.getExpireDate()) myFee.expireDate = convertDate(fFee.getExpireDate());
			myFee.status = fFee.getFeeitemStatus();
			myFee.period = fFee.getPaymentPeriod();
			myFee.display = fFee.getDisplay();
			myFee.accCodeL1 = fFee.getAccCodeL1();
			myFee.accCodeL2 = fFee.getAccCodeL2();
			myFee.accCodeL3 = fFee.getAccCodeL3();
			myFee.formula = fFee.getFormula();
			myFee.udes = fFee.getUdes();
			myFee.UDF1 = fFee.getUdf1();
			myFee.UDF2 = fFee.getUdf2();
			myFee.UDF3 = fFee.getUdf3();
			myFee.UDF4 = fFee.getUdf4();
			myFee.subGroup = fFee.getSubGroup();
			myFee.calcFlag = fFee.getCalcFlag();;
			myFee.calcProc = fFee.getFeeCalcProc();

			feeArr.push(myFee)
			}

		return feeArr;
		}

function feeExistsbynotes(feestr,altid) // optional statuses to check for
	{
	var checkStatus = false;
	var statusArray = new Array(); 
	var maltid = altid + ".";

	//get optional arguments 
	if (arguments.length > 2)
		{
		checkStatus = true;
		for (var i=2; i<arguments.length; i++)
			statusArray.push(arguments[i]);
		}

	var feeResult=aa.finance.getFeeItemByFeeCode(capId,feestr,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if ( feestr.equals(feeObjArr[ff].getF4FeeItem().getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getF4FeeItem().getFeeitemStatus(),statusArray) ) && (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes())))
			return true;
			
	return false;
	}

function feeAmountbynotes(capid,fcode,altid) 
	{
	var feeTotal = 0;
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(capid,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		feeTotal+= feeObjArr[ff].getF4FeeItem().getFee();
	
			
	return feeTotal;
	}
	
function Fee() // Fee Object
	{
	this.sequence = null;
	this.code =  null;
	this.description = null;  // getFeeDescription()
	this.unit = null; //  getFeeUnit()
	this.amount = null; //  getFee()
	this.amountPaid = null;
	this.applyDate = null; // getApplyDate()
	this.effectDate = null; // getEffectDate();
	this.expireDate = null; // getExpireDate();
	this.status = null; // getFeeitemStatus()
	this.recDate = null;
	this.period = null; // getPaymentPeriod()
	this.display = null; // getDisplay()
	this.accCodeL1 = null; // getAccCodeL1()
	this.accCodeL2 = null; // getAccCodeL2()
	this.accCodeL3 = null; // getAccCodeL3()
	this.formula = null; // getFormula()
	this.udes = null; // String getUdes()
	this.UDF1 = null; // getUdf1()
	this.UDF2 = null; // getUdf2()
	this.UDF3 = null; // getUdf3()
	this.UDF4 = null; // getUdf4()
	this.subGroup = null; // getSubGroup()
	this.calcFlag = null; // getCalcFlag();
	this.calcProc = null; // getFeeCalcProc()
	this.auditDate = null; // getAuditDate()
	this.auditID = null; // getAuditID()
	this.auditStatus = null; // getAuditStatus()
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
function addToASITable(tableName,tableValues,capId)
  	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
  	itemCap = capId
	
	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)

	if (!tssmResult.getSuccess())
		{ logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var col = tsm.getColumns();
	var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
	var coli = col.iterator();

	while (coli.hasNext())
		{
		colname = coli.next();

		if (typeof(tableValues[colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
			{
			fld.add(tableValues[colname.getColumnName()].fieldValue);
			fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
			}
		else // we are passed a string
			{
			fld.add(tableValues[colname.getColumnName()]);
			fld_readonly.add(null);
			}
		}

	tsm.setTableFields(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field

	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, "Admin");
	if (!addResult .getSuccess())
		{ logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
	else
		logDebug("Successfully added record to ASI Table: " + tableName);
	}
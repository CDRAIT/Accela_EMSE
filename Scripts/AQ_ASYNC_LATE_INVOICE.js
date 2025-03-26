//AQ_ASYNC_LATE_INVOICE
/*
  *  Program : AQ_ASYNC_LATE_INVOICE
  *  Usage   : This script is invoked in Other Event Script

*/
// ********************************************************************************************************************************
//	Env Parameters Below
// ********************************************************************************************************************************
var showDebug = true; 				// Set to true to see debug messages in event log and email confirmation
var sysDate = aa.date.getCurrentDate();
var useAppSpecificGroupName = false;
var systemMailFrom = "pcapcd@placer.ca.gov"; 
var errorEmailTo = "ngraf@truepointsolutions.com";
var debugEmailTo = "ngraf@truepointsolutions.com";
var servProvCode = aa.env.getValue("ServProvCode");			// Service Provider Code
var capIDString = aa.env.getValue("CustomCapId");			// Custom CAP ID
var capId = aa.env.getValue("ThisCap");			// CapId
var temail = aa.env.getValue("Email");			// CapId
var today = sysDate.getMonth() + "/" + sysDate.getDayOfMonth() + "/" +sysDate.getYear();
var debug = "";
var error = "";
var br = "<BR/>";

var currentUserID = "ADMIN";

// ***********************************************************************

aa.print("servProvCode: " +  servProvCode);

aa.print("capIDString = " +  capIDString);
aa.print("thisCap = "+capId);

//handleEnvParamters();
//aa.sendMail(systemMailFrom, debugEmailTo, "", "BEFORE", debug);
try{


					paramMap = aa.util.newHashMap();
				 paramMap.put("FacNum",capIDString);
				 report = generateReport("Past Due Invoices - 2nd Letter",paramMap,"AirQuality",capId);
				 emailParameters = aa.util.newHashtable();
				 var maxinvoice = getLatestInvoiceNumber(capId);
				 //addParameter(emailParameters,"$$INVOICE$$",String(maxinvoice));
				 sendtest = sendNotification("pcapcd@placer.ca.gov",temail,"RMoore@placer.ca.gov;SFrancis@placer.ca.gov","AQ 2nd LETTER",emailParameters,new Array(report),capId);

		  	     var arrEmission = new Array(); 
				 arrEmission["InvoiceNumber"] = String(maxinvoice);arrEmission["Notes"] = "Late Fees Applied";arrEmission["Date Created"] = String(today);arrEmission["Created By"] = "ADMIN";
				 aa.print("test2");
					addToASITable("INVOICE COMMENTS",arrEmission,capId);
 		            editAppSpecific("Second Letter Sent","CHECKED",capId);
		            editAppSpecific("Send Late Fees","UNCHECKED",capId);
				 
}
catch(err){
	aa.print("ERROR "+err);
	if(errorEmailTo != null && errorEmailTo != "") {
		aa.sendMail(systemMailFrom, errorEmailTo, "", "Errors occurs in Sending Report Script", err);
	}
}
//aa.sendMail(systemMailFrom, debugEmailTo, "", "After", debug);


if(debugEmailTo != null && debugEmailTo != "") {
	aa.sendMail(systemMailFrom, debugEmailTo, "", "PROD ASYNC Debug Information in Sending Report Script", debug);
}

// ======================================================================
//
//					Internal Function
//
// ======================================================================

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
        aa.print("**ERROR", "getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
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

function logDebug(dstr) {
	debug += dstr + br;
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
				//logDebug("DEBUG: Found Contact with Type = " + pContactType + ".  Email address for Contact = " + contactEmailToReturn);
				break;
			}
		}
	}

	if(contactEmailToReturn == null)
	{
		contactEmailToReturn = "";
	}
	
	//logDebug("Returning contact email address: " + contactEmailToReturn);
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
			aa.print("Report Result: "+ reportResult.getName() );
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		aa.print("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         aa.print("No permission to report: "+ reportName + " for Admin" + systemUserObj);
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

aa.print(capIDScriptModel)
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		aa.print("Sent email successfully to " + emailTo + "!");
		return true;
	}
	else
	{
		aa.print("Failed to send mail. - " + result);
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
		aa.print("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ aa.print("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ aa.print( "**WARNING: getChildren function found no children"); return null ; }

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
		
	aa.print("getChildren returned " + retArray.length + " capIds");
	return retArray;

	}

function email(pToEmail, pFromEmail, pSubject, pText) 
	{
	//Sends email to specified address
	//06SSP-00221
	//
	aa.sendMail(pFromEmail, pToEmail, "", pSubject, pText);
	aa.print("Email sent to "+pToEmail);
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
		aa.print("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		aa.print("lookup(" + stdChoice + "," + stdValue + ") does not exist");
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
		aa.print("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage + " " + feeCap);

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
				aa.print("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				aa.print("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
			}
			//updateFeeItemInvoiceFlag(feeSeq,finvoice);
		}
	else
		{
		aa.print( "**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
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
			{ aa.print("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
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
		{ aa.print( "WARNING: " + itemName + " was not updated."); }
}	
	
function getAppSpecific(itemName,itemCap)  // optional: itemCap
{
	var updated = false;
	var i=0;
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ aa.print("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
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
		{ aa.print( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
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
		aa.print("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ aa.print("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ aa.print( "**WARNING: getChildren function found no children"); return null ; }

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
		
	aa.print("getChildren returned " + retArray.length + " capIds");
	return retArray.length;

	}

function updatefeenotes(feeCap,fcode,altid,feeComment)
{
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(feeCap,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ aa.print( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
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
			aa.print("**ERROR: Invoicing fee items not successful.  Reason: " +  invoicingResult.getErrorMessage());
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
  				  	{ aa.print("**ERROR: Failed to get cap ID: " + ltcapidstr + " error: " +  ltresult.getErrorMessage()); return false; }
                }
		else
			itemCap = ltcapidstr;
		}

  	var feeArr = new Array();

	var feeResult=aa.fee.getFeeItems(itemCap);
		if (feeResult.getSuccess())
			{ var feeObjArr = feeResult.getOutput(); }
		else
			{ aa.print( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); return false }

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
		{ aa.print( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
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
		{ aa.print( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
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

	aa.print("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;

	}
function addToASITable(tableName,tableValues,capId)
  	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
  	itemCap = capId
	
	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)

	if (!tssmResult.getSuccess())
		{ aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }

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
		{ aa.print("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
	else
		aa.print("Successfully added record to ASI Table: " + tableName);
	}
function getlatefeebalance(capid)
{
var balance = 0;
var feeResult = aa.fee.getFeeItems(capid,"AQ_LATEFEES","INVOICED").getOutput();
	for (x in feeResult)
	{
	balance += feeResult[x].getFee()
	}
return balance;	
}	
function getLatestInvoiceNumber(capid)
{
	var invoices = aa.finance.getInvoiceByCapID(capid,null).getOutput();
	var invoice = [];
	for(x in invoices)
	{
	invoice.push(invoices[x].getInvNbr())
	}
	return Math.max.apply(null, invoice)
}
function getlatefeebalance(capid)
{
var balance = 0;
var feeResult = aa.fee.getFeeItems(capid,"AQ_LATEFEES","INVOICED").getOutput();
	for (x in feeResult)
	{
	balance += feeResult[x].getFee()
	}
return balance;	
}


function handleEnvParamters() {

	if(servProvCode == null) servProvCode = "";
	if(capId == null) capId = "";
	if(capIDString == null) capIDString = "";
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

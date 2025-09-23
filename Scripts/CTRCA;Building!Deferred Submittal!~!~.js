/*------------------------------------------------------------------------------------------------------/
| Program : CTRCA:Building/Deferred Submittal/
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap after for all Deferred records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 12/07/2023 Created script
|         : TDunn 08/05/2024 updated to match new record type definition
|         : TDunn 03/07/2025 added notification to applicant for online submittal received.
|         : TDunn 03/26/2025 added Submittal Review set due date and assign staff
|         : TDunn 03/26/2025 updated adding condition to block Building Final.
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/30/2025 deployed to Github
|         
|           
/---------------------------------------------------------------------------------------------------------------------*/

logDebug("Inside CTRCA:Building/Deferred Submittal/NA");


// Auto assign and set due date for Submittal Review
assignTask("Submittal Review","CDRA_UNASSIGNED");
editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"));


// Generate submitted notice
var vEmailTemplate = "ONLINE_PERMIT_AMENDMENT_SUBMITTED";
var pCapId = "";
var cCapId = capId;
var defNumber = 0;
var parentCapString = aa.env.getValue("ParentCapID");
var newAltID ="Not updated";
var vEmailSent = false;
var vFromEmail = "";
var vToEmail = "";
var vCcEmail = "";
var emailParameters = aa.util.newHashtable();
logDebug("parentCapString= " + parentCapString);

var saveCap = cap; 
cap = aa.cap.getCap(parentCapString).getOutput();
if (parentCapString) 
{
	pCapIdSplit = String(parentCapString).split("-"); 
	pCapId = aa.cap.getCapID(pCapIdSplit[0],pCapIdSplit[1],pCapIdSplit[2]).getOutput(); 
	pCapIDString = pCapId.getCustomID(); 
	logDebug("Parent CAPID String= " + pCapIDString);
	defNumber = 1 * getAppSpecific("Deferred Submittal Number",pCapId);

	var recName = "Building Permit Deferred Submittal for " + pCapIDString;
	var childExt = "-DEF";
	var newWorkDesc = AInfo["Scope of Work for Deferred Submittal"];
	defNumber = defNumber + 1;
	newAltID = pCapIDString + childExt + formatRevNumber(defNumber);
	aa.cap.updateCapAltID(cCapId, newAltID);
	logDebug("Deferred Submittal # " + newAltID);
	editAppSpecific("Deferred Submittal Number",defNumber,pCapId);
	editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
	editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
	editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);
	editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
 	updateWorkDesc(newWorkDesc,cCapId);
	copyAddresses(pCapId,cCapId);
	copyParcels(pCapId,cCapId);
	copyContacts(pCapId,cCapId);
	editAppName(recName,cCapId);
	// Load parameters for notification
	addParameter(emailParameters,"$$parentAltId$$",pCapIDString);
	addParameter(emailParameters,"$$childaltID$$",newAltID);
	addParameter(emailParameters,"$$recNameParam$$",recName);
	addParameter(emailParameters,"$$amendType$$","Deferred Submittal");
	addParameter(emailParameters,"$$projectoffice$$",getAppSpecific("Project Office", pCapId));
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Type of Work",pCapId) + ": " + getAppSpecific("Scope of Work",pCapId));
	
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */	
	
	/* Get To email contact types */
	var cTypeArray = ["Applicant"];

	/* Get To emails for contacts */
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId); 
	for (thisCon in conArray) {
		if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
			logDebug(conArray[thisCon]["contactType"]) ;
			getContactParams4Notification(emailParameters, conArray[thisCon]);
			if(emailParameters.get("$$contactEmail$$") != null) {
			vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
			}
		}
	}
	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + vEmailTemplate + "; emailParameters= " + emailParameters);
	vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,vEmailTemplate,emailParameters, null);
	// add condition to parent 
	cCapId = capId;
	capId = pCapId;
	logDebug("Has condition: " + appHasCondition("Building - Prevent Final / Completion",null,"Building Final Not Allowed until Deferred Submittals are Approved",null))
	if(!appHasCondition("Building - Prevent Final / Completion","Applied","Building Final Not Allowed until Deferred Submittals are Approved",null))
	{
		addStdCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Deferred Submittals are Approved",pCapId);
	}
	capId = cCapId
}
	
//loadCustomScript("CTRCA:DIGEPLAN");

logDebug("<font color='green'>INSIDE CTRCA DIGEPLAN</font>");

try {
	// Get the TMPRecordID custom field value
	var tmpRecordID = getAppSpecific("TMPRecordID");
	logDebug("TMPRecordID custom field: " + tmpRecordID);
	logDebug("newAltID: " + newAltID);
	
	if (tmpRecordID != undefined)  {
		// Call the DigEplan TMP record conversion API
		digEplanTmpRecordConversion(newAltID,tmpRecordID);
	} else {
		if (tmpRecordID == undefined) logDebug("<font color='red'>UNABLE TO CALL DIGEPLAN TMP RECORD CONVERSION API, AS TMPRecordID IS UNDEFINED</font>");
	}
}
catch (err) {
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}
try 
{
	if(publicUser) {
		//enter as many of these as there are customizations for doc groups by record type
		if(appMatch("Building/*/*/*")) docGroupForDPC = String("BLD_PLANREVIEW_DPC");
		if(appMatch("Building/Deferred Submittal/*/*")) docGroupForDPC = String("DEFERRED");

		if(AInfo["DocumentGroupforDPC"] == null) editAppSpecific("DocumentGroupforDPC",docGroupForDPC);
		editAppSpecific("AdditionalDocumentTypes",selectDocConfigByGroupPermissions(docGroupForDPC,[]));
		editAppSpecific("RequiredDocumentTypes","");
	}
}
catch (err2) {
	logDebug("A JavaScript Error occured: " + err2.message + " at line " + err2.lineNumber + " stack: " + err2.stack);
}
sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com","","Test: PLACERCO CTRCA Deferred created " + newAltID, debug);

// sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing Deferred submittal ", debug);
//aa.sendMail("noreply@placer.ca.gov","mckenzie@truepointsolutions.com", "", "PLACERCO CTRCA Deferred ", debug);	



/*  Notes ----------------------------------
digeplaniframe.ascx

-------------------------------------------*/
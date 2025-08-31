/*------------------------------------------------------------------------------------------------------/
| Program : CTRCA:Building/Residential/Master/Revision
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap after for all REV records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 10/27/2023 Created script
|         : TDunn 11/08/2023 Modified call to digEplan
|         : TDunn 11/16/2023 added updating parent record status to prevent additional amendment submittal
|         : TDunn 08/05/2024 modified to work with new Revision record type.
|         : TDunn 01/19/2025 cloned from main revision and modified to work from Master PCO Revision
|         : TDunn 04/01/2025 updated fields copied from parent and notification parameters to match new template
|         : TDunn 04/24/2025 updated status update to parent to 'Approved - Revision Pending'
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/31/2025 deployed to Github
|           
/---------------------------------------------------------------------------------------------------------------------*/

logDebug("Inside CTRCA:Building/Residential/Master/Revision");

// Auto assign and set due date for Submittal Review
assignTask("Submittal Review","CDRA_UNASSIGNED");
editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"));

var vEmailTemplate = "ONLINE_PERMIT_AMENDMENT_SUBMITTED";
var pCapId = "";
var cCapId = capId;
var revNumber = 0;
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
if (parentCapString) {
	pCapIdSplit = String(parentCapString).split("-"); 
	pCapId = aa.cap.getCapID(pCapIdSplit[0],pCapIdSplit[1],pCapIdSplit[2]).getOutput(); 
	pCapIDString = pCapId.getCustomID(); 
	logDebug("Parent CAPID String= " + pCapIDString);
	revNumber = 1 * getAppSpecific("Last Revision Number",pCapId);

	var recName = "Master Permit Revision for " + pCapIDString;
	var childExt = "-REV";
	var newWorkDesc = AInfo["Scope of Work for Revisions"];
	revNumber = revNumber + 1;
	// newAltID = pCapIDString + childExt + String(revNumber);
	newAltID = pCapIDString + childExt + formatRevNumber(revNumber);
	aa.cap.updateCapAltID(cCapId, newAltID);
	logDebug("Revision # " + newAltID);
	editAppSpecific("Last Revision Number",revNumber,pCapId);
	editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
	editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
	editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);
	editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
	updateAppStatus("Approved - Revision Pending","Revision " + newAltID + " submitted via Citizen Portal. Status updated by script",pCapId);
 	updateWorkDesc(newWorkDesc,cCapId);
	//copyAddresses(pCapId,cCapId);
	//copyParcels(pCapId,cCapId);
	copyContacts(pCapId,cCapId);
	editAppName(recName,cCapId);
	// Load parameters for notification
	addParameter(emailParameters,"$$parentAltId$$",pCapIDString);
	addParameter(emailParameters,"$$childaltID$$",newAltID);
	addParameter(emailParameters,"$$recNameParam$$",recName);
	addParameter(emailParameters,"$$amendType$$","Revision");
	addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", pCapId));
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));	
	
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	addParameter(emailParameters,"$$addressLine$$","plan Check Only, no associated address");
	
	/* Get To email contact types */
	var cTypeArray = ["Applicant","Owner"];

	/* Get To emails for contacts */
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId); 
	for (thisCon in conArray) {
		if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
			logDebug(conArray[thisCon]["contactType"]) ;
			getContactParams4Notification(emailParameters, conArray[thisCon]);
			if(!matches(emailParameters.get("$$contactEmail$$"),"",null,undefined,false))
			{
				vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
			}
		}
	}
	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + vEmailTemplate + "; emailParameters= " + emailParameters);
	vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,vEmailTemplate,emailParameters, null);
	logDebug("Email was sent: " + vEmailSent);
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

if(publicUser) {
	//enter as many of these as there are customizations for doc groups by record type
	if(appMatch("Building/*/*/*")) docGroupForDPC = String("BLD_PLANREVIEW_DPC");

	if(AInfo["DocumentGroupforDPC"] == null) editAppSpecific("DocumentGroupforDPC",docGroupForDPC);
	editAppSpecific("AdditionalDocumentTypes",selectDocConfigByGroupPermissions(docGroupForDPC));
	editAppSpecific("RequiredDocumentTypes","");
}


sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com","","CTRCA Test: master revision created " + newAltID, debug);

//aa.sendMail("noreply@placer.ca.gov","mckenzie@truepointsolutions.com", "", "PLACERCO CTRCA Revisions ", debug);	

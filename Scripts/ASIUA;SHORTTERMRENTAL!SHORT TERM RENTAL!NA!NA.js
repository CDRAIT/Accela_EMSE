/*======================================================================================/
| Program : ASIUA;ShortTermRental!Short Term Rental!~!~
|         //ASIUA:ShortTermRental/Short Term Rental/NA/NA
| Event   : ApplicationSpecificInfoUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Application Specific Info Update After for all Short Term Rental records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 04/22/2021 created script
|         : TDunn 08/15/2021 added functionality to create compliance case
|         : TDunn 08/27/2021 minor updates/fixes to compliance creation section
|         : TDunn 02/20/2023 added new fields for call times and day called. 
|         : TDunn 04/13/2023 updated configuration to support scripting updates
|
| 
/=======================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}

if(typeof(FIREINSPECTIONS) == "object") {
	var tLength = FIREINSPECTIONS.length;
	var rowCount = 1;
	var bodyText = "";
	var eStatus = "";
	var eDate = "";
	logDebug("Table length is " + FIREINSPECTIONS.length);
	for (thisRow in FIREINSPECTIONS) {
		tableRow = FIREINSPECTIONS[thisRow]; 
		vinspStatus = tableRow["Inspection Status"]; 
		vinspDate = tableRow["Inspection Date"]; 
		vinspPrior = tableRow["Re-inspection for prior failed"]; 
		vinspNote = tableRow["Notes"]; 
		logDebug("Inspection status is " + vinspStatus + " on " + vinspDate + " prior is " + vinspPrior + " for row " + thisRow);
		if(tLength == rowCount) {
			logDebug("This is the last row");
			if(vinspStatus == "Fail") {
				bodyText = " failed."
				eStatus = "Failed";
				
			}else{
				bodyText =" passed following a prior failed inspection.";
				eStatus = "Passed";
				}
			
			if((vinspStatus == "Fail" || (matches(vinspPrior,"Y","Yes") && vinspStatus == "Pass")) && vinspNote != "Notice Sent") {
				logDebug("Sending Notice");
				var emailTemplate = "STR_FAILED_FIRE_TO_STAFF";
				var vFromEmail = "";
				var vToEmail = "strcompliance@placer.ca.gov";
				var vCcEmail = "";
				var cTypeArray = new Array();
				var vContactTypes = "Applicant,Local Contact";
				var shortDesc = getShortNotes(capId);
				eDate = String(vinspDate);
				emailParameters = aa.util.newHashtable();

				// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
				getRecordParams4Notification(emailParameters);
				getPrimaryAddressLineParam4Notification(emailParameters); // sets $$addressLine$$ as primary address line
				addParameter(emailParameters,"propertyName$$", shortDesc); 
				addParameter(emailParameters,"$$vinspStatus$$",eStatus);
				addParameter(emailParameters,"$$vinspDate$$",eDate);
				addParameter(emailParameters,"$$bodyText$$",bodyText);

				logDebug("Email Parameters = " + emailParameters);

				emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
				tableRow["Notes"] = "Notice Sent";
			}
		}
		rowCount++;
	}
	removeASITable("FIRE INSPECTIONS");
	addASITable("FIRE INSPECTIONS",FIREINSPECTIONS);

}

// Create Child Compliance case
if(AInfo["Create Case"] == "Create Case") {

	var recName = "Compliance case for " + capIDString;
	var cCapId = createChild("ShortTermRental","Enforcement","NA","NA",recName); 
	var pCapId = capId;
	var cCapIDString = cCapId.getCustomID();
	var newSn = "Compliance Case for STR Permit " + capIDString;
	var pShortNotes = getShortNotes(pCapId);
 	var pWorkDesc = workDescGet(pCapId);

	copyOwnerTPS(pCapId,cCapId);
	var assignedTo = getAssignedToStaff(pCapId); 
	if(assignedTo != null && assignedTo != "") {
		assignCap(assignedTo,cCapId);
	}
	copyAddresses(pCapId,cCapId);
	copyParcels(pCapId,cCapId);
	updateShortNotes(newSn,cCapId);
	
	// Copy Case data from parent to child
	editAppSpecific("Complaint Received Via",getAppSpecific("Complaint Received Via",pCapId),cCapId);	
	editAppSpecific("Complainant Name",getAppSpecific("Complainant Name",pCapId),cCapId);
	editAppSpecific("Complainant Phone",getAppSpecific("Complainant Phone",pCapId),cCapId);
	editAppSpecific("Complainant Email",getAppSpecific("Complainant Email",pCapId),cCapId);
	editAppSpecific("Additional Complainant",getAppSpecific("Complainant2",pCapId),cCapId);
	editAppSpecific("Additional Complainant Phone No.",getAppSpecific("Complainant Phone2",pCapId),cCapId);
	editAppSpecific("Additional Conmplainant Email",getAppSpecific("Conmplainant Email2",pCapId),cCapId);
	editAppSpecific("Reported Date",getAppSpecific("Reported Date",pCapId),cCapId);
	editAppSpecific("Reported Time",getAppSpecific("Reported Time",pCapId),cCapId);
	editAppSpecific("Officer Returned Call",getAppSpecific("Officer Returned Call",pCapId),cCapId);
	editAppSpecific("Officer Call Day",getAppSpecific("Officer Call Day",pCapId),cCapId);
	editAppSpecific("Violation Date",getAppSpecific("Violation Date",pCapId),cCapId);
	editAppSpecific("Violation Time",getAppSpecific("Violation Time",pCapId),cCapId);
	editAppSpecific("Violation Type",getAppSpecific("Violation Type",pCapId),cCapId);
	editAppSpecific("Other Violation Type",getAppSpecific("Other Violation Type",pCapId),cCapId);	
	editAppSpecific("Officer Called Contact",getAppSpecific("Officer Called Contact",pCapId),cCapId);
	editAppSpecific("Officer Contact Call Day",getAppSpecific("Officer Contact Call Day",pCapId),cCapId);	
	editAppSpecific("Contact Returned Call",getAppSpecific("Contact Returned Call",pCapId),cCapId);	
	editAppSpecific("Contact Call Day",getAppSpecific("Contact Call Day",pCapId),cCapId);
	editAppSpecific("Arrived on Scene",getAppSpecific("Arrived on Scene",pCapId),cCapId);	
	editAppSpecific("Officer Arrived Day",getAppSpecific("Officer Arrived Day",pCapId),cCapId);	
	editAppSpecific("Contact Arrived at Property",getAppSpecific("Contact Arrived at Property",pCapId),cCapId);
	editAppSpecific("Contact Arrived Day",getAppSpecific("Contact Arrived Day",pCapId),cCapId);		
	editAppSpecific("STR Permit Number",capIDString,cCapId);
	editAppSpecific("Case Status","Open",cCapId);
	editAppSpecific("Local Contact Responded",getAppSpecific("Local Contact Responded",pCapId),cCapId);		
	editAppSpecific("Property Owner Responded",getAppSpecific("Property Owner Responded",pCapId),cCapId);		
	editAppSpecific("Property Manager Responded",getAppSpecific("Property Manager Responded",pCapId),cCapId);		
	editAppSpecific("Occupant Responded",getAppSpecific("Occupant Responded",pCapId),cCapId);		
	editAppSpecific("Site Finding",getAppSpecific("Site Finding",pCapId),cCapId);		
	editAppSpecific("Other Site Finding",getAppSpecific("Other Site Finding",pCapId),cCapId);		
	editAppSpecific("Citation Number",getAppSpecific("Citation Number",pCapId),cCapId);		
	editAppSpecific("Violation",getAppSpecific("Violation",pCapId),cCapId);		
	editAppSpecific("Violation Code",getAppSpecific("Violation Code",pCapId),cCapId);		
	editAppSpecific("Action",getAppSpecific("Action",pCapId),cCapId);		
	editAppSpecific("Other Action",getAppSpecific("Other Action",pCapId),cCapId);		
	editAppSpecific("Create Case","Case Created");
	var parentID = capIDString;
	logDebug("Current Record Number is " + parentID);


	var newTblArray = new Array(); 
	var newRowArray = new Array();
	newRowArray["Case #"] = String(cCapIDString);
	newRowArray["Date"] = AInfo["Reported Date"]; 
	newRowArray["Description"] = AInfo["Violation Type"];
	newRowArray["Status"] = "Open";
	newRowArray["Comments"] = "";
	newRowArray["Violation Date"] = AInfo["Violation Date"]; 
	newRowArray["Violation"] = null;
	newRowArray["Violation Code"] = null;
//	typeof(VIOLATIONS) != "object" ^ newTblArray.push(newRowArray); addASITable("VIOLATIONS",newTblArray); 
	typeof(VIOLATIONS) == "object" ^ addToASITable("VIOLATIONS",newRowArray);

	editAppSpecific("Reported Date","");	
	editAppSpecific("Reported Time","");
	editAppSpecific("Complainant Name","");
	editAppSpecific("Complainant Phone","");
	editAppSpecific("Complainant Email","");
	editAppSpecific("Complainant2","");
	editAppSpecific("Complainant Phone2","");
	editAppSpecific("Complainant Email2","");
	editAppSpecific("Officer Returned Call","");	
	editAppSpecific("Officer Call Day","");
	editAppSpecific("Violation Date","");
	editAppSpecific("Violation Time","");
	editAppSpecific("Violation Type",null);
	editAppSpecific("Local Contact Responded",null);		
	editAppSpecific("Property Owner Responded",null);		
	editAppSpecific("Property Manager Responded",null);		
	editAppSpecific("Occupant Responded",null);		
	editAppSpecific("Site Finding",null);		
	editAppSpecific("Other Site Finding","");		
	editAppSpecific("Citation Number","");		
	editAppSpecific("Violation",null);		
	editAppSpecific("Violation Code",null);
	editAppSpecific("Action",null);		
	editAppSpecific("Other Action","");		

}
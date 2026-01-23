/*-------------------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Commercial!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Commercial 
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/18/2020 created script
|         : TDunn 04/08/2021 updated logic to add Employee Accommodation Fee
|         : TDunn 04/14/2021 added update to school district if ASI is not populated
|         : TDunn 05/25/2021 updated logic to use 'Yes' when to add fee and updated field name 
|         : TDunn 07/30/2021 updated fee codes for AH and EA fees
|         : TDunn 11/29/2023 integrated EMSE 2.0 scripting
|         : TDunn 01/18/2024 updated PCCP section to include new notification to applicant.
|         : TDunn 01/24/2024 deployed updates to production and disabled standard choice WTUA:Building/Commercial
|         : TDunn 03/05/2024 added BLD_20181201_MAIN criteria to rules for issuance
|         : Abe   06/27/2024 added IT Request # 1924 - ESD Building Permit Sign Off - "ESD Checklist"
|         : TDunn 12/30/2025 updated criteria for setting Plan Check Expiration date
|         : TDunn 01/10/2026 Moved Revisions and Deferred Submittal from Parent by staff from WTUA:Building to here
|         : TDunn 01/23/2026 added updating revisions and deferred with parent record type (Res or Com)
|
/-----------------------------------------------------------------------------------------------------------------------*/
if (matches(currentUserID, "TDUNN", "EAFTAHI", "MHELVIC")) {
	showDebug = 1;
}

// Workflow for Planning Review for Commercial
if (wfProcess == "BLD_20181201_DISTRIBUTION" || wfProcess == "BLD_20230501_MAIN") 
{
	if (appTypeArray[2] == "Full Review") 
	{
		logDebug("School is: " + AInfo["ParcelAttribute.SCHOOL"]);
		if (matches(AInfo["Elementary School District"], null, "", "NA") && AInfo["ParcelAttribute.SCHOOL"] != null) {
			editAppSpecific("Elementary School District", AInfo["ParcelAttribute.SCHOOL"]);
		}

		if (wfTask == "Planning Review" && matches(wfStatus, "Complete", "Approved")) {
			/* Employee accommodation fee applies when: Mixed Use with residential, all new and some alteration for non residential when Elementary school district is Tahoe-Truckee unified school district. 
			  TSI 'Employee Accommodation Fee Applies' value is 'Y' or 'Yes'
			*/
			logDebug("School = " + AInfo["Elementary School District"] + ". And work = " + AInfo["Type of Work"] + "; and Scope = " + AInfo["Scope of Work"]);
			if (AInfo["Elementary School District"] == "TAHOE TRUCKEE UNIFIED SCHOOL DISTRICT" && AInfo["Type of Work"] == "New" && !matches(AInfo["Scope of Work"], "Church", "Cell Tower", "Convalescent or Home for the Elderly", "Public Building")) {
				var eaApply = AInfo["Employee Accommodation Fee Applies"];
				logDebug("Inside first if, Exempt = " + AInfo["Employee Accommodation Fee Applies"]);

				if (matches(eaApply, "Y", "Yes")) {
					updateFee("TF-HSG EAF", "AFFORDABLE HOUSING", "FINAL", 1, "N");
				}
			}
		}
	}
	//Abe- 06/27/2024: IT Request # 1924 - ESD Building Permit Sign Off - "ESD Checklist"
	if (wfTask == "Engineering and Surveying Review") 
	{
		var hasFloodZoneRev = false;
		var vWfstr = "Flood Zone Review";
		var hasEsdGradingCondition = false;
		var hasEsdImprovementCondition = false;
		var hasDpwEncroachmentCondition = false;
		var hasBmpCondition = false;
		var hasRetainingWallCondition = false;

		var gradingCondComment = "***Grading Permit Final***\n" + "Prior to issuance of Final Occupancy, construction of the associated grading permit, " +
			"ESDXX-XXXXX, must be finaled by the Placer County Engineering & Surveying Division."
		var improvementCondComment = "***Construction Acceptance of Improvement Plans***\n" + "Prior to issuance of Final Occupancy, construction of the associated site improvement plans, " +
			"ESDXX-XXXXX, must be accepted as complete by the Placer County Engineering & Surveying Division."
		var encroachmentCondComment = "***Encroachment Permit Final***\n" + "Prior to issuance of Final Occupancy, construction of the associated encroachment permit, " +
			"ENCRXX-XXXXX, must be finaled by the Placer County Department of Public Works.";
		var bmpCondComment = "***BMP CERTIFICATION***\n" + "Prior to issuance of Final Occupancy, certification by a licensed Civil Engineer, QSD, " +
			"or Qualified Stormwater Practitioner (QSP) shall be provided stating that all permanent stormwater quality control measures, " +
			"site stabilization and any applicable site design and LID measures have been completed per the approved plan."
		var retainingCondComment = "***Retaining Wall Certification***\n" + "Site work includes grading for a private land lot and the construction of a retaining wall. " +
			"A special inspection is required at the completion of construction and a report generated by the design engineer that the retaining wall was constructed per the submitted calculations. " +
			"This written and stamped report shall be submitted to the Placer County Engineering & Surveying Division prior to the Final of this permit or the completion of the construction."
		//Checks if the ad-hoc exists
		var workflowResult = aa.workflow.getTaskItems(capId, vWfstr, "", null, null, null);
		if (workflowResult.getSuccess())
			wfObj = workflowResult.getOutput();
		else
			logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());

		for (i in wfObj) {
			fTask = wfObj[i];
			if (fTask.getTaskDescription().toUpperCase().equals(vWfstr.toUpperCase()))
				hasFloodZoneRev = true;
		}
		//checks for the conditions
		hasEsdGradingCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Grading Permit Final Required", null);
		hasEsdImprovementCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Improvement Plan Construction Acceptance Required", null);
		hasDpwEncroachmentCondition = appHasCondition("DPW - Prevent Final / Completion", null, "Encroachment Permit Final Required", null);
		hasBmpCondition = appHasCondition("ESD - Prevent Final / Completion", null, "BMP Certification", null);
		hasRetainingWallCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Retaining Wall Certification", null);

		if (wfStatus == "Complete" || wfStatus == "Pending" || wfStatus == "Pending (Tahoe back office review finished)") {
			//conditions/flags
			if (matches(AInfo["Grading Review"], "checked", "Checked", "CHECKED") && !(hasEsdGradingCondition)) {
				addAppCondition("ESD - Prevent Final / Completion", "Applied", "Grading Permit Final Required", gradingCondComment, "Notice", "");
			}

			if (matches(AInfo["Improvement Plan"], "checked", "Checked", "CHECKED") && !(hasEsdImprovementCondition)) {
				addAppCondition("ESD - Prevent Final / Completion", "Applied", "Improvement Plan Construction Acceptance Required", improvementCondComment, "Notice", "");
			}

			if (matches(AInfo["DPW Final Review"], "checked", "Checked", "CHECKED") && !(hasDpwEncroachmentCondition)) {
				addAppCondition("DPW - Prevent Final / Completion", "Applied", "Encroachment Permit Final Required", encroachmentCondComment, "Notice", "");
			}

			if (matches(AInfo["BMP Certification"], "checked", "Checked", "CHECKED") && !(hasBmpCondition)) {
				addAppCondition("ESD - Prevent Final / Completion", "Applied", "BMP Certification", bmpCondComment, "Notice", "");
			}

			if (matches(AInfo["Retaining Wall Certification"], "checked", "Checked", "CHECKED") && !(hasRetainingWallCondition)) {
				addAppCondition("ESD - Prevent Final / Completion", "Applied", "Retaining Wall Certification", retainingCondComment, "Notice", "");
			}
			//ad-hod
			if (AInfo["Flood Zone Review"] == "Yes" && !(hasFloodZoneRev)) {
				addAdHocTask("ADHOC", "Flood Zone Review", "Engineering and Surveying");
				assignTask("Flood Zone Review", "MKELLER");
			}
		}
	}
	//End of IT Request # 1924
}

// Replaces EMSE 2.0 WTUA:Building/Commercial
if (wfProcess == "BLD_20181201_DISTRIBUTION" || wfProcess == "BLD_20181201_MAIN")	
{
	if (matches(wfTask, "Ready to Issue", "Plan Check", "Issue Status", "Process for Issuance") && wfStatus == "Issued" && AInfo['Code Enforcement Action'] != "Yes") {
		editAppSpecific("Expiration Date", dateAdd(null, 730));
	}

	if (matches(wfTask, "Ready to Issue", "Plan Check", "Issue Status", "Process for Issuance") && wfStatus == "Issued" && AInfo['Code Enforcement Action'] == "Yes") {
		editAppSpecific("Expiration Date", dateAdd(null, 182));
	}

	if (wfTask == "Fire Review" && matches(wfStatus, "Complete", "Revisions") && AInfo['Fire Conditions'] == "Yes") {
		addStdCondition("Fire - Prevent Final / Completion", "Fire Department Final Inspection Required");
	}

	if (wfTask == "Engineering and Surveying Review" && matches(wfStatus, "Complete", "Revisions") && AInfo['ESD Conditions'] == "Yes") {
		addStdCondition("ESD - Prevent Final / Completion", "Engineering and Surveying Final Inspection Required");
	}

	if (wfTask == "Planning Review" && matches(wfStatus, "Complete", "Revisions") && AInfo['Planning Conditions'] == "Yes") {
		addStdCondition("Planning - Prevent Final / Completion", "Planning Department Final Inspection Required");
	}

	if (wfTask == "Environmental Engineering Review" && matches(wfStatus, "Complete", "Revisions") && AInfo['FAC Conditions'] == "Yes") {
		addStdCondition("Env. Engineering - Prevent Final / Completion", "Environmental Engineering Final Inspection Required");
	}

	if (wfTask == "Air Pollution Control District" && matches(wfStatus, "Complete", "Revisions") && AInfo['APCD Final'] == "Yes") {
		addStdCondition("Other - Prevent Final / Completion", "APCD Final Inspection Required");
	}

	if(isTaskStatus("Application Submittal","Complete","BLD_20181201_MAIN") && AInfo["Application Received"] == "Online" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	if(isTaskStatus("Application Submittal","Complete","BLD_20181201_MAIN") && AInfo["Application Received"] == "Online" && AInfo["Code Enforcement Action"] == "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,182));

	if (wfTask == "Planning Review") {
		if (wfStatus == "Complete" && AInfo["Open Space Fee"] == "Yes") {
			addFee("OSFH-COM", "PCCP", "FINAL", 1, "N");
		}
		if (AInfo['PCCP Required'] == "Yes") {
			childCap = childGetByCapType("PCCP/*/*/*");
			if (matches(childCap, null, false, undefined)) {
				childCap = createChild("PCCP", "Land Conversion Authorization", "NA", "NA", capName);
				showMessage = true;
				comment("<font size = 3 color=ff000><b>This project is within the PCCP Plan Area. A PCCP record has been created and must be authorized prior to permit completion</b></font>");
			}
		}
		cCapId = childGetByCapType("PCCP/Land Conversion Authorization/NA/NA");
		if (!matches(cCapId, null, false, undefined)) {
			editTaskSpecific("Planning Review", "PCCP Record Number", cCapId.getCustomID());
		}
		if (matches(cCapId, null, false, undefined) && AInfo['PCCP Required'] == "Yes") {
			cCapId = createChild("PCCP", "Land Conversion Authorization", "NA", "NA", capName);
			cCapIDString = cCapId.getCustomID();
			createPCCPNotification("PCCP_NOTIFICATION", cCapIDString);
			showMessage = true;
			comment("<font size = 3 color=ff000><b>This project is within the PCCP Plan Area. A PCCP record has been created and must be authorized prior to permit completion</b></font>");
			editTaskSpecific("Planning Review", "PCCP Record Number", cCapId.getCustomID());
		}
	}
}

//IT Request# 1911 - EV Charging Station
if (appTypeArray[2] == "Limited")
{
  if (getAppSpecific("Type of Work") == "Alteration" && getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)")
  {
    // supporting both new and old WfProcess
    if ((wfProcess == "BLD_20230501_MAIN" && wfTask == "Submittal Review" && wfStatus == "Submittal Accepted") || (wfProcess == "BLD_20181201_MAIN  " && wfTask == "Application Submittal" && wfStatus == "Complete"))
	{
      if (getAppSpecific("EVCS Units Qty") == "1-25 units")
	  {
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 20, " "));
	  }
      else if (getAppSpecific("EVCS Units Qty") == "26+ units")
	  {
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 40, " "));
	  }
      else {
        logDebug('***Error***: "EVCS Units Qty" is undefined!');
	  }
	}
  }
}
//End of IT Request# 1911 - EV Charging Station 

if(matches(wfProcess,"BLD_20181201_DISTRIBUTION","BLD_20181201_MAIN","BLD_20230501_MAIN"))
{
	if(matches(wfTask,"Inspections","Inspection"))
	{
		if(wfStatus == "Revisions")
		{
			logDebug("Inside creating revision child record");
			var recName = "Building Permit Revision for " + capIDString;
			var cCapId = createChild("Building","Revision","NA","NA",recName); 
			var pCapId = capId;
			var newAltID = "";
			var childExt = "-REV";
			var NewSn = getShortNotes(pCapId);
			var pWorkDesc = workDescGet(pCapId);
			// Initialize Last Rev number if null
			if(matches(AInfo["Last Revision Number"],null,"")) 
			{
				editAppSpecific("Last Revision Number",0);
				AInfo["Last Revision Number"] = 0;
			}
			var revNumber = 1 * AInfo["Last Revision Number"];

			logDebug("Child Type is :"+ childExt);
			revNumber = revNumber + 1;
			logDebug("Rev Number is " + revNumber);
			editAppSpecific("Last Revision Number",revNumber);
			var parentID = capIDString;
			logDebug("Current Record Number is " + parentID);
			// newAltID = capIDString + childExt + String(revNumber);
			newAltID = capIDString + childExt + formatRevNumber(revNumber);
			
			aa.cap.updateCapAltID(cCapId, newAltID);	
			logDebug("Child AltID = " + newAltID);
			
			copyOwnerTPS(pCapId,cCapId);
			var assignedTo = getAssignedToStaff(pCapId); 
			if(assignedTo != null && assignedTo != "") {
				assignCap(assignedTo,cCapId);
			}
			copyAddresses(pCapId,cCapId);
			copyParcels(pCapId,cCapId);
			updateAppStatus("Issued - Revision Pending", "Revision " + formatRevNumber(revNumber) + " created by staff. Updated by Script", capId)

			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			editAppSpecific("Parent Record Type",appTypeArray[1],cCapId);
			copyContacts(pCapId,cCapId);

			// Create notification to applicant for new Revision record created
			var vEmailTemplate = "ONLINE_PERMIT_AMENDMENT_SUBMITTED";
			var vEmailSent = false;
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var pCapIDString = capIDString;
			var emailParameters = aa.util.newHashtable();

			// Load parameters for notification
			addParameter(emailParameters,"$$parentAltId$$",pCapIDString);
			addParameter(emailParameters,"$$childaltID$$",newAltID);
			addParameter(emailParameters,"$$recNameParam$$",recName);
			addParameter(emailParameters,"$$amendType$$","Revision");
			addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", pCapId));
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));

			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters); 
			getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */

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
			
			showMessage = true;
			comment("<font size = 4 color=ff000><b>Revision record created. Record number " + newAltID + ".</b></font><br><br>You can navigate to the new record using the Related Records tab.<br>");

			// Existing rules for adding conditions on Revisions at Inspection task, modified to use new revision condition
			//--------------------------------------------------------------------
			if(!appHasCondition("Building - Prevent Final / Completion", "Applied","Building Final Not Allowed until Revisions are Approved", null))
			{
				addStdCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Revisions are Approved");
			}
		}
		// Inspections/Deferred Submittal: Create Deferred from parent record by Staff
		if(wfStatus == "Deferred Submittal")
		{
			logDebug("Inside creating deferred submittal child record");
			var recName = "Building Permit Deferred Submittal for " + capIDString;
			var cCapId = createChild("Building","Deferred Submittal","NA","NA",recName); 
			var pCapId = capId;
			var newAltID = "";
			var childExt = "-DEF";
			var NewSn = getShortNotes(pCapId);
			var pWorkDesc = workDescGet(pCapId);
			// Initialize Last DEF number if null
			if(matches(AInfo["Deferred Submittal Number"],null,"")) 
			{
				editAppSpecific("Deferred Submittal Number",0);
				AInfo["Deferred Submittal Number"] = 0;
			}
			var defNumber = 1 * AInfo["Deferred Submittal Number"];

			logDebug("Child Type is :"+ childExt);
			defNumber = defNumber + 1;
			logDebug("DEF Number is " + defNumber);
			editAppSpecific("Deferred Submittal Number",defNumber);
			var parentID = capIDString;
			logDebug("Current Record Number is " + parentID);
			newAltID = capIDString + childExt + formatRevNumber(defNumber);
			
			aa.cap.updateCapAltID(cCapId, newAltID);	
			logDebug("Child AltID = " + newAltID);
			
			copyOwnerTPS(pCapId,cCapId);
			var assignedTo = getAssignedToStaff(pCapId); 
			if(assignedTo != null && assignedTo != "") {
				assignCap(assignedTo,cCapId);
			}
			copyAddresses(pCapId,cCapId);
			copyParcels(pCapId,cCapId);	
			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			editAppSpecific("Parent Record Type",appTypeArray[1],cCapId);			
			
			// Generate email notice to parent applicant for new Deferred Submittal application createDocumentFragment
			var vEmailTemplate = "ONLINE_PERMIT_AMENDMENT_SUBMITTED";
			var pCapIDString = capIDString;
			var vEmailSent = false;
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var emailParameters = aa.util.newHashtable();

			addParameter(emailParameters,"$$parentAltId$$",pCapIDString);
			addParameter(emailParameters,"$$childaltID$$",newAltID);
			addParameter(emailParameters,"$$recNameParam$$",recName);
			addParameter(emailParameters,"$$amendType$$","Deferred Submittal");
			addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", pCapId));
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));
			
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters); 
			getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */	
			
			/* Get To email contact types */
			var cTypeArray = ["Applicant"];

			/* Get To emails for contacts */
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
			for (thisCon in conArray) 
			{
				if (exists(conArray[thisCon]["contactType"],cTypeArray)) 
				{
					logDebug(conArray[thisCon]["contactType"]) ;
					getContactParams4Notification(emailParameters, conArray[thisCon]);
					if(emailParameters.get("$$contactEmail$$") != null) 
					{
						vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
					}
				}
			}
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + vEmailTemplate + "; emailParameters= " + emailParameters);
			vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,vEmailTemplate,emailParameters, null);			
			
			showMessage = true;
			comment("<font size = 4 color=ff000><b>Deferred Submittal record created. Record number " + newAltID + ".</b></font><br><br>You can navigate to the new record using the Related Records tab.<br>");
			
			// New rules for adding conditions on deferred submittal
			if(!appHasCondition("Building - Prevent Final / Completion","Applied","Building Final Not Allowed until Deferred Submittals are Approved",null))
			{
				addStdCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Deferred Submittals are Approved");
			}
		}		
	}
}
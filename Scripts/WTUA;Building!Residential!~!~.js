/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Residential!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Building Residential records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn TPS 12/24/2025 Converted from EMSE 2.0 script
|         : TDunn 12/30/2025 updated criteria for setting Plan Check Expiration
|         : TDunn 01/07/2026 added additional 20181201 processes to criteria for running code
|         : TDunn 01/10/2026 moved Revision and Deferred submittal creation from parent from WTUA:Building here
|
/---------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"TDUNN","EAFTAHI","MHELVIC"))
{
 	showDebug = 1;
}

logDebug("Running WTUA:Building/Residential ");
if(matches(wfProcess,"BLD_20181201_DISTRIBUTION","BLD_20181201_MAIN","BLD_20181201_REVISIONS"))
{
	if(matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Expiration Date",dateAdd(null,730));
	if(matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued" && AInfo["Code Enforcement Action"] == "Yes")
		editAppSpecific("Expiration Date",dateAdd(null,182));
	if(matches(wfTask,"Application Submittal") && wfStatus == "Complete" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	if(isTaskStatus("Application Submittal","Complete","BLD_20181201_MAIN") && AInfo["Application Received"] == "Online" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	if(isTaskStatus("Application Submittal","Complete","BLD_20181201_MAIN") && AInfo["Application Received"] == "Online" && AInfo["Code Enforcement Action"] == "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,182));
	if(wfTask == "Fire Review" && matches(wfStatus,"Complete","Revisions") && AInfo["Fire Conditions"] == "Yes")
		addStdCondition("Fire - Prevent Final / Completion", "Fire Department Final Inspection Required");
	if(wfTask == "Environmental Engineering Review" && matches(wfStatus,"Complete","Revisions") && AInfo["FAC Conditions"] == "Yes")
		addStdCondition("Env. Engineering - Prevent Final / Completion", "Environmental Engineering Final Inspection Required");
	if(wfTask == "Air Pollution Control District" && matches(wfStatus,"Complete","Revisions") && AInfo["APCD Final"] == "Yes") addStdCondition("Other - Prevent Final / Completion", "APCD Final Inspection Required");
	if(wfTask == "Planning Review" && matches(wfStatus,"Complete","Revisions") && AInfo["Planning Conditions"] == "Yes") addStdCondition("Planning - Prevent Final / Completion", "Planning Department Final Inspection Required");
	if(wfTask == "Environmental Health Review" && matches(wfStatus,"Complete","Revisions") && AInfo["Env Health Final"] == "Yes") addStdCondition("Env. Health - Prevent Final / Completion", "Environmental Health Final Inspection Required");
	if(wfTask == "Engineering and Surveying Review" && matches(wfStatus,"Complete","Revisions") && AInfo["ESD Conditions"] == "Yes") addStdCondition("ESD - Prevent Final / Completion", "Engineering and Surveying Final Inspection Required");
	if(wfTask == "Planning Review" && wfStatus == "Complete" && AInfo["Open Space Fee"] == "Yes") addFee("OSFH-RES","PCCP","FINAL",1,"N");
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
		if(wfStatus == "Revisions" && capStatus == "Issued")
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

			// Auto assign and set due date for Submittal Review
			capId = cCapId;			
			assignTask("Submittal Review","CDRA_UNASSIGNED","BLD_20231116_REV");
			editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"),"BLD_20231116_REV");
			capId = pCapId;
			copyAddresses(pCapId,cCapId);
			copyParcels(pCapId,cCapId);
			updateAppStatus("Issued - Revision Pending", "Revision " + formatRevNumber(revNumber) + " created by staff. Updated by Script", capId)

			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
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
		if(wfStatus == "Deferred Submittal" && matches(capStatus,"Issued","Issued - Revision Pending"))
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

			// Auto assign and set due date for Submittal Review
			capId = cCapId;			
			assignTask("Submittal Review","CDRA_UNASSIGNED","BLD_DEFERRED_20240710");
			editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"),"BLD_DEFERRED_20240710");
			capId = pCapId;
			copyAddresses(pCapId,cCapId);
			copyParcels(pCapId,cCapId);	
			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			
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


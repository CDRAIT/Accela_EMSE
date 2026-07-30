/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;TRPA!Building!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all TRPA Building Records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 03/04/2026 created script to manage Revisions and Deferred Submittals
|         : TDunn 07/30/2026 Fixed issue with TRPA revision Parent Type
|
|
/------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"TDUNN")) showDebug = 1;

logDebug("Inside WTUA:TRPA/Building, running Revision and Deferred Submittal scripts");

if(matches(wfProcess,"BLD_20181201_DISTRIBUTION","BLD_20181201_MAIN"))
{
	if(matches(wfTask,"Inspections","Inspection"))
	{
		logDebug("Permit status is " + capStatus);
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
			if(appTypeArray[0] == "Building")
			{
				editAppSpecific("Parent Record Type",appTypeArray[1],cCapId);
			}
			if(appTypeArray[0] == "TRPA")
			{
				editAppSpecific("Parent Record Type",appTypeArray[2],cCapId);
				editAppSpecific("Revision Parent Type",appTypeArray[2],cCapId);
			}			
			//copyContacts(pCapId,cCapId);

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
			editAppSpecific("Parent Record Type",appTypeArray[2],cCapId);
			editAppSpecific("Revision Parent Type",appTypeArray[2],cCapId);
			
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

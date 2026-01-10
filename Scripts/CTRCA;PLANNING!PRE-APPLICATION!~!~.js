/*===========================================================================================/
| Program : CTRCA:Planning/Pre-Application/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : CTRCA script for all Planning Pre-Application records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 06/19/2024 converted from EMSE 2.0 to EMSE 3.0 
|         : TDuun 06/20/2024 updates to submittal received notification
|         : TDunn 07/??/2024 eaftahi added request 2057 to a copy of the CTRCA script add added it as an ASA script
|         : TDunn 8/05/2024 moved eaftahi 2057 code section to the CTRCA script and deleted the ASA script as not needed.
|         : Abe   01/06/2025 IT Request # 2095 - Update PLN PREAPP's FileDate on CTRCA to Current Date
|         
|
/=============================================================================================*/
showDebug = false; showMessage = false;

if(matches(currentUserID,"JMCKENZI","TDUNN", "EAFTAHI")) {showDebug = 1;}

updateTask("Submittal Review","Submitted","Online pre-application submitted. Resulted by Script","");

var techEmail = "OnlinePLNPermits@placer.ca.gov";
if(AInfo["Project Office"] == "Tahoe" || AInfo["ParcelAttribute.BLDRESPONSE"] == "Tahoe")
{
	assignCap("PLNTECH_TAH");
	techEmail = "OnlinePLNPermitsTahoe@placer.ca.gov";
}else{
	assignCap("PLNTECH_ABN");
}

//IT Request # 2057- ECS Notifications for PLN
var emailTemp = "";
var emailParams = aa.util.newHashtable();
addParameter(emailParams, "$$altID$$", capIDString);
addParameter(emailParams, "$$fileDate$$", fileDate);
addParameter(emailParams, "$$capName$$", capName);

if (AInfo["Predevelopment Meeting"] == "Yes") {
    emailTemp = "ECS_NOTICE_PREDEV_MEETING_PREAPP";
    sendNotification("", "", "", emailTemp, emailParams, null);
    assignCap('ECS_TECH');
}
if (AInfo["Is this a Major Project"] == "Yes" && AInfo["Predevelopment Meeting"] == "No" && AInfo["Extension of Time"] == "No") {
    emailTemp = "ECS_NOTICE_MAJOR_PROJECT_PREAPP";
    sendNotification("", "", "", emailTemp, emailParams, null);
    assignCap('ECS_TECH');
}


//End of IT Request # 2057

//IT Request # 2095 - Update PLN PREAPP's FileDate on CTRCA to Current Date

updateAppFileDate(sysDateMMDDYYYY);

//End of IT Request # 2095

if(publicUser)
{
	try
	{
		// converted from branch: 'EMSE:PreAppSubmittedNotice'
		/* Initialize parameters for notification */
		var vEmailTemplate = "NOTICE_PREAPP_SUBMITTED"; 
		var vFromEmail = ""; 
		var vToEmail = ""; 
		var vCcEmail = ""; 
		var vContactType = "";
		var emailParameters = aa.util.newHashtable(); 
		var vEmailSent = false;
		var wfComment = "";
		
		getRecordParams4Notification(emailParameters);
		getACARecordParam4Notification(emailParameters,"https://permits.placer.ca.gov/CitizenAccess"); // Uses $$acaRecordUrl$$ as parameter name
		/* Get email addresses */
		var conArray = new Array(); 
		vContactType = "Applicant"; 
		vFromEmail = defaultFrom;
		conArray = getContactArrayWithPrimary(capId); 
		for (thisCon in conArray)
		{		
			if (conArray[thisCon]["contactType"] == vContactType)
			{
				getContactParams4Notification(emailParameters, conArray[thisCon]); /* Some of the parameters returned by this function: $$contactFullName$$; $$contactEmail$$; $$contactFirstName$$; $$acontactLastName$$; $$contactAddressLine1$$; $$contactPhoneNumber1$$ */
			}
		}
		if(emailParameters.get("$$contactEmail$$") != null)
		{
			vToEmail = emailParameters.get("$$contactEmail$$") + "; ";
			logDebug("to email: " + vToEmail);
		}
		getPrimaryOwnerParams4NotificationWithEmail(emailParameters);
		if(emailParameters.get("$$ownerEmail$$") != null)
		{
			vCcEmail = emailParameters.get("$$ownerEmail$$") + "; "; 
			if(vToEmail == vCcEmail) {vCcEmail = "";}
		}
		// get staff information
		var vStaffEmail = ""; 
		var assignedToEmail = ""; 
		assignedTo = getAssignedToStaff(); 
		if(assignedTo != null)
		{
			assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
			logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
			if(!matches(assignedToEmail,undefined,"",null)) 
			{
				vStaffEmail = assignedToEmail;
			}
		}
		vCcEmail = vCcEmail + vStaffEmail + "; ";
		if(vStaffEmail != techEmail)
		{
			vCcEmail = vCcEmail + techEmail + "; ";
		}
		logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + vEmailTemplate + "; emailParameters= " + emailParameters);
		vEmailSent = sendNotification(vFromEmail, vToEmail,vCcEmail, vEmailTemplate, emailParameters, null);
		logDebug("Email Sent = " + vEmailSent);
	}
	catch(err)
	{
		aa.sendMail(defaultFrom, "tdunn@truepointsolutions.com", "", "Try catch: " + "PreApp Submitted Notice", err.message);
	}
	
	//aa.sendMail(defaultFrom, "tdunn@truepointsolutions.com", "", "DEBUG: "+ "PreApp Submitted Notice", debug);
}

//aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", "", "CTRCA PREAPP Debug - IT Req# 2095", debug);

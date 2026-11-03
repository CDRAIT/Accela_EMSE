//if(currentUserID == "MHELVICK"){
if(wfTask == "Application Acceptance" && wfStatus == "Application Incomplete") {
	//send email here
	logDebug("<font color='green'>Send Incomplete Email</font>");
	if(checkForContactEmail("Applicant"))
	{
		showMessage = true;
		comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
	}
	var emailTemplate = "NOTICE_BLD_ADDITIONAL_INFORMATION_REQUIRED";
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var cTypeArray = new Array();
	var vContactTypes = "Applicant,Owner";
	cTypeArray = vContactTypes.split(",");
	emailParameters = aa.util.newHashtable();
	var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
	acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; 
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters);
	getPrimaryAddressLineParam4Notification(emailParameters);
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
	addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
	var cdrEmail = "OnlineBLDPermits@placer.ca.gov";
	addParameter(emailParameters,"$$cdrEmail$$",cdrEmail);
	
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId); 
	for (thisCon in conArray) 
	{
		if (exists(conArray[thisCon]["contactType"],cTypeArray)) 
		{
			logDebug(conArray[thisCon]["contactType"]) ;
			getContactParams4Notification(emailParameters, conArray[thisCon]);
			if(!matches(emailParameters.get("$$contactEmail$$"),null,undefined,""))
			{
				vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
			}
		}
	}
	if(vToEmail != "")
	{
	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
	var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
	} else
	{
		showMessage = true;
		comment("<font size = 4 color=ff000><b>No applicant email address found. Applicant Request for Information was NOT sent.</b></font><br><br>Please review applicant contact record for a valid email address");
	}																	 
	updateTask("Application Acceptance","Pending Resubmittal","Application incomplete. Updated by script","Pending Resubmittal");
	editTaskDueDate("Application Acceptance",dateAdd(null,1,"Y"),wfProcess);
}

if(wfTask == "Fire Review" && wfStatus == "Corrections Required") {
//send email here
logDebug("<font color='green'>Send Corrections Email</font>");
createNotificationTPS2("NOTICE_BLD_CORRECTIONS REQUIRED","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
}

if(wfTask == "Fire Review" && wfStatus == "Approved & Payment Requested") {
//send email here
logDebug("<font color='green'>Send Approval/Fees Email</font>");
createNotificationTPS2("NNOTICE_BUILDING_FEES_DUE","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
}

//}

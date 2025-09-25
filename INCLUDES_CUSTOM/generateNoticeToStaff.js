// Requires a dateAdd() date or proper string date mm/dd/yyyy be passed in as the vWfDueDate parameter
function generateNoticeToStaff(vTemplate,vEmailTo,vWfDueDate,vWfTask)
{
	var emailParameters = aa.util.newHashtable();
	var wfTaskParam = "workflow";
	if (arguments.length >= 4 && typeof(arguments[3]) != "undefined" && arguments[3] != null && arguments[3] != "") 
	{
		wfTaskParam = arguments[3];
	}	
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters);
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
	addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", capId));	
	addParameter(emailParameters,"$$typeOfWork$$",getAppSpecific("Type of Work",capId));
	addParameter(emailParameters,"$$wfDueDateParam$$",vWfDueDate);
	addParameter(emailParameters,"$$wfTaskNameParam$$",wfTaskParam);
	getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */	
	var	emailResult = sendNotification("noreply@placer.ca.gov",vEmailTo,"",vTemplate,emailParameters,null);
	logDebug(vTemplate + " notification result is " + emailResult);
	return emailResult;
}

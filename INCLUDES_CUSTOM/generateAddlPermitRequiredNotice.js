function generateAddlPermitRequiredNotice(vTemplate,rpList)
{
	var emailParameters = aa.util.newHashtable();
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
	addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", capId));	
	addParameter(emailParameters,"$$typeOfWork$$",getAppSpecific("Type of Work",capId));
	addParameter(emailParameters,"$$permitList$$",rpList)
	
	/* Get To email contact types */
	var cTypeArray = ["Applicant","Owner"];

	/* Get To emails for contacts */
	var vToEmail = "";
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

	var	emailResult = sendNotification("noreply@placer.ca.gov",vToEmail,"",vTemplate,emailParameters,null);
	logDebug(vTemplate + " notification result is " + emailResult);
	return emailResult;
}
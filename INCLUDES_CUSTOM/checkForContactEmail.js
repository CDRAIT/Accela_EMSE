function checkForContactEmail(fContactType)
{
	// fContactType can be a list of contact type separated by commas but with only one set to quotes (" ") around the list
	// This function can only be used with the WTUB and WTUA events
	if(matches(wfTask,"Submittal Review","Distribution Reconcilliation","Process for Issuance") && matches(wfStatus,"Submittal Incomplete","Corrections Required","Payment Requested"))
	{
		var vToEmail = "";
		var cTypeArray = new Array();
		var vContactTypes = fContactType;
		cTypeArray = vContactTypes.split(",");
		var conArray = new Array();
		conArray = getContactArrayWithPrimary(capId); 
		emailParameters = aa.util.newHashtable();
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
		if(vToEmail == "") 
		{
			return true
		} else
		{
			return false
		}

	}		
}

function getPCOasi4BuildingNotification(params,deptCrit) 
{
	/*-----------------------------------------------------------------------/
	| The function will return a list of custom field notification parameters 
	| based on the list stored in the 'SDL:ASIList' standard choice shared
	| ddl. The 'params' parameter should be the name of the parameters 
	| newHashtable created for current notification.  The 'deptCrit'
	| function parameter should be the string in 'Value' column of the
	| of the shared ddl, which will return the corresponding value desc. The
	| deptCrit could be based on module, record type or other criteria that
	| correctly identifies the list of asi fields to be returned.
	| This will be a comma delimited list composed of the asi field name
	| and the corresponding parameter name of the asi separated by the
	| '|' (bar) symbol. The parameter name should NOT have the '$'
	| (dollar) signs, the function will add those when creating the
	| parameter list. (e.g. Scope of Work|scopeOfWork). The function
	| will take an optional third capId parameter or if ommitted will
	| use the current capId.  A fourth optional parameter can be input
	| for a parent capId. If the parent capId parameter is used, the
	| optional third capId parameter must be entered. The parent parameters
	| returned will be based on the same asi field list but will have 
	| 'Parent' prepended to the template parameter name.
	\-------------------------------------------------------------------*/
	itemCapId = (arguments.length >= 3) ? arguments[2] : capId;
	pCapId = (arguments.length >= 4) ? arguments[3] : null;
	// pass in a hashtable and it will add the additional parameters to the table
	var thisItem = "";
	var pString = "";
	var asiList = lookup("SDL:ASIList",deptCrit);
	if(!matches(asiList,"",null,undefined,false))
	{	
		var asiArray = asiList.split(",");
		for(cfItem in asiArray)
		{
			thisItem = asiArray[cfItem];
			barIndex = thisItem.indexOf("|");
			bI2 = barIndex + 1;
			fieldName = thisItem.substring(0,barIndex);
			paramName = thisItem.substring(bI2);
			addParameter(params,"$$"+ paramName + "$$",getAppSpecific(fieldName,itemCapId));		
		}
		if(typeof(pCapId == "object") && pCapId != null)
		{
			var pCapIDString = pCapId.getCustomID();
			var pCap = aa.cap.getCap(pCapId).getOutput();
			var pCapName = pCap.getSpecialText();
			var pCapStatus = pCap.getCapStatus();		
			var thisItem = "";
			var pString = "";
			var asiList = lookup("SDL:ASIList",deptCrit);
			var asiArray = asiList.split(",");
			for(cfItem in asiArray)
			{
				thisItem = asiArray[cfItem];
				barIndex = thisItem.indexOf("|");
				bI2 = barIndex + 1;
				aa.print(barIndex);
				fieldName = thisItem.substring(0,barIndex);
				paramName = "Parent" + thisItem.substring(bI2);
				addParameter(params,"$$"+ paramName + "$$",getAppSpecific(fieldName,itemCapId));		
			}
			addParameter(params, "$$pAltID$$", pCapIDString);
			addParameter(params, "$$pCapName$$", pCapName);
			addParameter(params, "$$pCapStatus$$", pCapStatus);		
		}
		logDebug(params);
		return true;
	}
	return false;
}

function cloneConditions(fromCapId, toCapId) 
	{

	var sourceCapID = aa.cap.getCapID(fromCapId);
	var targetCapID = aa.cap.getCapID(toCapId);
	var scapId = sourceCapID.getOutput();
	var tcapId = targetCapID.getOutput();
	
	var getFromCondResult = aa.capCondition.getCapConditions(scapId);
	if (getFromCondResult.getSuccess())
		var condA = getFromCondResult.getOutput();
	else
		{ logDebug( "**ERROR: getting cap conditions: " + getFromCondResult.getErrorMessage()) ; return false}
		
	for (cc in condA)
		{
		var addCapCondResult = aa.capCondition.cloneCapCondition(scapId,tcapId);
		if (addCapCondResult.getSuccess())
			logDebug("Successfully added condition");
		else
			logDebug( "**ERROR: adding condition" + addCapCondResult.getErrorMessage());
		}
	}

function getPreIssuanceListForNotification(sdlLkup)
{
	itemCapId = (arguments.length >= 2) ? arguments[1] : capId;
	var piListParam = "No active preissuance requirements";
	var ctAlias = "";
	var found = 0;
	var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
	preTasksArraySD = preIssueListSD.split(",");
	for(thisPI in preTasksArraySD)
	{
		cTask = preTasksArraySD[thisPI];
		logDebug("Tesing if preissuance task " + cTask + " is active");
		if(isTaskActive(cTask))
		{	
			found++;
			logDebug("Task found is " + cTask);
			ctAlias = lookup(sdlLkup,cTask);
			if(found<=1)
			{
				piList = ctAlias + "\n";
			}
			else if(found > 1)
			{
				piList = piList + "; " + ctAlias + "\n" ;
			}
		}
		if(found > 0)
		{
			piListParam = piList;
		}
	}
	return piListParam	
}

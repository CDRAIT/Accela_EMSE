function presetTSIpco(lkupCriteria,taskName,apStatus,apStatus2,apStatus3) {
	// lkupCriteria is the 'row' select criteria for the list of reviews, based on the module or specific record type workflow.
    logDebug("Inside presetTSI().  Params: " + lkupCriteria);

    allTasksArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    allTasksArray = reviewList.split(",");
	
    logDebug("Task List Param: " + allTasksArray);

    for (ata in allTasksArray) {
		var tsiValue = "Y";
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var thisStatus = getTaskStatus(thisTask);
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));
        //If the last TSI value is 'apStatus' default TSI to 'N';
		if(matches(thisStatus,apStatus,apStatus2,apStatus3) || matches(AInfo[thisTask],"N","No",null,"",undefined)) 
		{
			tsiValue = "N";
		}
		editTaskSpecific(taskName,thisTask,tsiValue);
	}

}

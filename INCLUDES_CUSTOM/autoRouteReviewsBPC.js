function autoRouteReviewsBPC(lkupCriteria) 
{
    logDebug("Inside autoRouteReviews TD().  Params: " + lkupCriteria);

    reviewListArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    reviewListArray = reviewList.split(",")

    for (ata in reviewListArray) {
        var taskRequired = false;
		var thisTSI = reviewListArray[ata]
        var thisTask = reviewListArray[ata] + " Review";  //For each Review in list (all Review names are in List)
		logDebug("This task is " + thisTask);
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTSI]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));
        //If the Review TSI is set to Yes, set Required to True
        if (matches(AInfo[thisTask],"Yes","Y") && !isTaskActive(thisTask)) 
		{
            //logDebug("task is required so set Task Due Date");
            activateTask(thisTask);
            //editTaskDueDate(thisTask,AInfo[thisTSI] + " Due Date"]);	//Set the Task Due Date per rule
        }
    }
	updateAppStatus("In Review","");
}

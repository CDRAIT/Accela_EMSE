function setConcurrentStatusAndPossDate(lkupCriteria,tprocess)
{
	
	/* Retrieve concurrent list */
	taskListArray = new Array();
	taskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
	taskListArray = taskList.split(",");
	resubNum = AInfo["Resubmittal Number"];
	newStatus = "Submittal Received";	
	if(resubNum <= 1)
	{
		newStatus = "Submittal Received";
	}
	if(resubNum > 1)
	{
		newStatus = "Resubmittal Received";
	}	
	/* Find tasks to activate */
	for(tla in taskListArray)
	{
		thisTask = taskListArray[tla];
		if (matches(AInfo[thisTask],"Yes","Y","YES"))
		{
			editTaskSpecific(thisTask,"Possession Start Date",dateAdd(null,0,"Y"));
			updateTask(thisTask,newStatus,"Possession Start Date logged by system","",wfProcess);
		}
	}
}
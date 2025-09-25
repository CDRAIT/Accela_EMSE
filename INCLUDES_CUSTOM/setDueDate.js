function setDueDate(lkupCriteria,numDays,tprocess)
{
	taskListArray = new Array();
	taskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
	taskListArray = taskList.split(",");
	for(tla in taskListArray)
	{
		thisTask = taskListArray[tla];
        if (matches(AInfo[thisTask],"Yes","Y","YES")) 
		{		
			editTaskDueDate(thisTask,dateAdd(null,numDays,"Y"),tprocess);
		}
	}
}

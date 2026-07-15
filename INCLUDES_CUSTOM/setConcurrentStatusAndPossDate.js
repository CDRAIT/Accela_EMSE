function setConcurrentStatusAndPossDate(lkupCriteria,tprocess)
{
	
	/* Retrieve concurrent list */
	taskListArray = new Array();
	taskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
	taskListArray = taskList.split(",");
	/* Load cycle TSI values */
	useTaskSpecificGroupName = true;
	TsiInfo = new Array();
	loadTaskSpecific(TsiInfo,capId);
	/* Find tasks to activate */
	for(tla in taskListArray)
	{
		newStatus = "Submittal Received";
		thisTask = taskListArray[tla];
		if (matches(AInfo[thisTask],"Yes","Y","YES"))
		{
			if(matches(TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"],null,"",undefined))
			{
				newCycle = 0;
			} else{		
			newCycle = 1 * TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
			}
			newCycle = newCycle + 1;
			if(newCycle > 1) { newStatus = "Resubmittal Received"; }
			editTaskSpecific(thisTask,"Possession Start Date",dateAdd(null,0,"Y"));
			updateTask(thisTask,newStatus,"Possession Start Date logged by system","",wfProcess);
		}
	}
	useTaskSpecificGroupName = false;
}
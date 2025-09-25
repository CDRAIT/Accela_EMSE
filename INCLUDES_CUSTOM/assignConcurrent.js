function assignConcurrent(lkupCriteria,tprocess,vCycle)
{
	taskListArray = new Array();
	taskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
	taskListArray = taskList.split(",");
	for(tla in taskListArray)
	{
		thisTask = taskListArray[tla];
		if (matches(AInfo[thisTask],"Yes","Y","YES"))
		{
			// tCycle = getCycleNum(thisTask,tprocess);
			// if(tCycle < vCycle) { vCycle = tCycle; }
			thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
			if(vCycle <=1)
			{
				assignTask(thisTask,thisStaff,tprocess);
			}
			if(vCycle > 1)
			{
				cAssigned = getTaskAssignUser(thisTask,tprocess);
				if(!matches(cAssigned,false,"",null,undefined))
				{
					assignTask(thisTask,cAssigned,tprocess);
				} else{
					assignTask(thisTask,thisStaff,tprocess);
				}
			}				
		}
	}
}

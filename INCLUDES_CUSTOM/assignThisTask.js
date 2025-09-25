function assignThisTask(thisTask,tprocess)
{
	useTaskSpecificGroupName = true;
	TsiInfo = new Array();
	loadTaskSpecific(TsiInfo,capId);
	if(matches(TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"],null,"",undefined))
	{
		newCycle = 0;
	} else{		
	newCycle = 1 * TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
	}
	logDebug("Cycle number for task " + thisTask + " = " + newCycle);
	thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
	if(newCycle <=1)
	{
		assignTask(thisTask,thisStaff,tprocess);
	}
	if(newCycle > 1)
	{
		cAssigned = getTaskAssignUser(thisTask,tprocess);
		if(!matches(cAssigned,false,"",null,undefined))
		{
			assignTask(thisTask,cAssigned,tprocess);
		} else{
			assignTask(thisTask,thisStaff,tprocess);
		}
	}
	useTaskSpecificGroupName = false;
}

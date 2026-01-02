function getCycleNum(thisTask,tprocess)
{
	useTaskSpecificGroupName = true;
	TsiInfo = new Array();
	loadTaskSpecific(TsiInfo,capId);
	var newCycle = TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
	if(matches(TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"],null,"",undefined)) { newCycle = 0;}
	newCycle = 1 * TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
	thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
	useTaskSpecificGroupName = false;
	logDebug("New cycle number from getCycleNum for task " + thisTask + " = " + newCycle);
	return newCycle;
}

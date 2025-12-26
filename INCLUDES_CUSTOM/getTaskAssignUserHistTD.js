function getTaskAssignUserHistTD(wfstr,wfStat)
{
	itemCapId = (arguments.length >= 3) ? arguments[2] : capId;
	var tasks = null; 
	var taskUser = null;
	var lastResult = -1;
	/* Retrieve workflow history */
	tasks = aa.workflow.getHistory(itemCapId).getOutput();
	if(tasks != null && tasks.length > 0) 
	{
		/* If history found loop through history and retrieve most recent assigned user for task */
		for(var i in tasks) 
		{

			if(tasks[i].getTaskDescription().equals(wfstr) && ((lastResult == -1 || tasks[lastResult].getStatusDate() < tasks[i].getStatusDate()) && (tasks[i].getAssignedStaff() != null && aa.person.getUser(tasks[i].getAssignedStaff().getFirstName(), tasks[i].getAssignedStaff().getMiddleName(), tasks[i].getAssignedStaff().getLastName()).getSuccess())))
			{
				lastResult = i;
			}
		}
		logDebug("lastResult = " + lastResult);
	}
	/* If found prior user return for matching task if user is still active, else return false */
	if(lastResult > -1) 
	{
		taskUser = aa.person.getUser(tasks[lastResult].getAssignedStaff().getFirstName(), tasks[lastResult].getAssignedStaff().getMiddleName(), tasks[lastResult].getAssignedStaff().getLastName()); 
		if(taskUser != null && taskUser.getSuccess() && taskUser.getOutput().getAuditStatus().equals("A")) 
		{
			return taskUser.getOutput().getUserID();
		} else {
			return false;
		}
	}
}
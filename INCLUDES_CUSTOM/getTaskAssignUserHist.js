function getTaskAssignUserHist(wfstr,wfStat)
{
	var tasks = null; 
	var taskUser = null;
	var lastResult = -1;
	/* Retrieve workflow history */
	tasks = aa.workflow.getHistory(capId).getOutput();
	if(tasks != null && tasks.length > 0) {
		/* If history found loop through history and retrieve most recent assigned user for task */
		for(var i in tasks) {
			if(tasks[i].getCompleteFlag().equals("Y") && tasks[i].getTaskDescription().equals("Planning Review") && ((lastPlan == -1 || tasks[lastPlan].getStatusDate() < tasks[i].getStatusDate()) && (tasks[i].getAssignedStaff() != null && aa.person.getUser(tasks[i].getAssignedStaff().getFirstName(), tasks[i].getAssignedStaff().getMiddleName(), tasks[i].getAssignedStaff().getLastName()).getSuccess()))) lastPlan = i;

			if(tasks[i].getTaskDescription().equals(wfstr) && tasks[i].getDisposition().equals(wfStat) && ((lastResult == -1 || tasks[lastResult].getStatusDate() < tasks[i].getStatusDate()) && (tasks[i].getAssignedStaff() != null && aa.person.getUser(tasks[i].getAssignedStaff().getFirstName(), tasks[i].getAssignedStaff().getMiddleName(), tasks[i].getAssignedStaff().getLastName()).getSuccess()))){
				lastResult = i;
			}
		}
		logDebug("lastResult = " + lastResult);
	}
	/* If found prior user return for matching task if user is still active, else return false */
	if(lastResult > -1) {
		taskUser = aa.person.getUser(tasks[lastResult].getAssignedStaff().getFirstName(), tasks[lastResult].getAssignedStaff().getMiddleName(), tasks[lastResult].getAssignedStaff().getLastName()); 
		if(taskUser != null && taskUser.getSuccess() && taskUser.getOutput().getAuditStatus().equals("A")) {
			return taskUser.getOutput().getUserID();
		} else {
			return false;
		}
	}
}

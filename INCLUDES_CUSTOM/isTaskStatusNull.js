function isTaskStatusNull(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 1) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			if (matches(fTask.getDisposition(),null,"",undefined)) {
				logDebug("Task status is null");
				return true;
			}
			else {
				logDebug("Task status is NOT null");
				return false;
			}
		}	
	}
	return false;
}

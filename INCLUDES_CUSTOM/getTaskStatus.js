function getTaskStatus(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	var itemCap = capId;
	if (arguments.length >= 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}
	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args	

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) 
	{
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) 
		{
			if (!matches(fTask.getDisposition(),null,"",undefined)) 
			{
				thisStatus = fTask.getDisposition();
				logDebug("status is " + thisStatus);
				return thisStatus;
			}
			else {
				return false;
			}
		}	
	}
	return false;
}

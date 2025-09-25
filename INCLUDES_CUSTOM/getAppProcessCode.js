function getAppProcessCode(capIdItem) 
{
    var workflowResult = aa.workflow.getMasterProcess(capIdItem);
    if (workflowResult.getSuccess()) 
	{
        var wfObj = workflowResult.getOutput();
        var fTask = wfObj[0];
		taskName = fTask.getTaskDescription();
		logDebug("fTask[0] for this process is " + taskName);
        return fTask.getProcessCode();
    }
    else {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
}

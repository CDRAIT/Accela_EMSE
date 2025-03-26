/*------------------------------------------------------------------------------------------------------/
| Program : ASUA:Building/~/~/~

| Event   : ApplicationStatusUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Application Status Update After for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : EAFTAHI 09/01/2022 created script
|         
|         
|
/------------------------------------------------------------------------------------------------------*/


logDebug("Entring ASUA:Building/~/~/~ ... ");

if(currentUserID == 'EAFTAHI') {ShowDebug = 3;}

var workflowResult = aa.workflow.getTasks(capId);

if(matches(appStatus, 'Withdrawn', 'Void', 'Expired') ){
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
	}
	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getActiveFlag().equals("Y"))
			deactivateTask(fTask.getTaskDescription());
	}
}

/* 
** After app status update on building records to 
** Withdrawn, Void, and Expired deactivates all workflow tasks 
*/
function closeAllActiveTasksTPS() 
{
	/* requires custom function isTaskStatusNull(), Plan Review - Required Reviews lookup, uses standard function setTask() */
    allTasksArray = new Array();
	/* get workflow task list from required reviews lookup plus non review tasks */
    if (appTypeArray[0] == "Building") reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BLDPERMIT") + ",Submittal Review,Distribution,Distribution Reconcilliation,Process for Issuance,Inspection,Closure";
    if (appTypeArray[0] == "Planning") reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "ALL PLN") + ",tbd"; 
    allTasksArray = reviewList.split(",")

    logDebug("About to process task list");


    for (ata in allTasksArray) {
        var taskRequired = false;
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));

        if (statusIsNull) {
            logDebug("task has no history so setTask N and N");
			setTask(thisTask,"N","N",wfProcess);
        }
        if (!statusIsNull) {
            logDebug("task has history, setTask N and Y");
            setTask(thisTask,"N","Y",wfProcess);
		}
    }
}

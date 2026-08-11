function setReviewWorkflowTasksByTsiFieldsTPS(allTasksArray) {
    // Activate any review tasks where TSI Review field is "Yes", and set the Task Due Date from TSI Review Date field.
    // This assumes all review tasks are parallel, and that the Workflow Task name is synonymous with the TSI field names.  i.e. Task Name = Building Review, 
    // TSI Review = Building Review, TSI Review Date = Building Review Date
    // Assumes TSI "Review Date" field has been set (by expression)

    logDebug("Inside function setReviewWorkflowTasksByTsiFields.  Params: " + allTasksArray);

    for (ata in allTasksArray) 
	{
        var taskRequired = false;
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));
        //If the Review TSI is set to Yes, set Required to True
        if (AInfo[thisTask] == "Yes") {
            taskRequired = true;
            logDebug("taskRequired was set to true");
        }

        if (taskRequired) {
            logDebug("task is required so set Task Due Date");
            activateTask(thisTask);
            if(isTaskStatus(thisTask,"Corrections Required") || isTaskStatus(thisTask,"Approved Pending Resubmittal") || isTaskStatus(thisTask,"Approved")) 
			{
				//updateTask(thisTask,"Resubmittal Received","",""); 
			}
            //editTaskDueDate(thisTask,AInfo[thisTask + " Due Date"]);	//Set the Task Due Date from the TSI Review Date field
        }

        if (!taskRequired && statusIsNull) 
		{
            logDebug("task not required and no history so setTask N and N");
           	setTask(thisTask,"N","N",wfProcess);
        }
        if (!taskRequired && !statusIsNull) 
		{
            logDebug("task not required but has history, setTask N and Y");
            setTask(thisTask,"N","Y",wfProcess);
		}
    }
}

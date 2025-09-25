// Task status or state related functions
function anyTaskActiveTPS(lkupCriteria) 
{
    logDebug("Inside anyTasksActive().  Params: " + lkupCriteria);

    allTasksArray = new Array();
    reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    allTasksArray = reviewList.split(",");

    logDebug("Array of tasks to test for isTaskActive.  Params: " + allTasksArray);
    var anyActive = false;
    for (ata in allTasksArray) {
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)

        logDebug("thisTask = " + thisTask);

        //Check if task is active
        if (isTaskActive(thisTask)) {
            anyActive = true;
            logDebug(thisTask + " is active");
        }

    }
	return anyActive;
}

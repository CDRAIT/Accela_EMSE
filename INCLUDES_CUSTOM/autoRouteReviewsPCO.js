function autoRouteReviewsPCO(reviewType, initial, lkupCriteria, lkupTriage) 
{
    //reviewType is no longer used. Kept in function in to accommodate existing references
    // E - Electronic
    // P - Physical
    //initial is not longer used. Kept in function to accommodate existing references
	// lkupCriteria is the 'row' select criteria for the list of reviews, based one the module or specific record type workflow.
	// Note: to only manage which tasks to activate, set reviewType to 'P' and initial to 'N' *** no longer used or referenced ***

    logDebug("Inside autoRouteReviewsPCO().  Params: " + reviewType + ", " + initial);

    reviewListArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    reviewListArray = reviewList.split(",");
	
	triageListArray = new Array();
	triageList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupTriage); // get Triage tasks
	triageListArray = triageList.split(",");
    //logDebug("About to call function setReviewWorkflowTasksByTsiFields(reviewListArray)");

	setReviewWorkflowTasksByTsiFieldsPCO(reviewListArray,triageListArray); //Activate Review Task and set Due Date from TSI.
	updateAppStatus("Initial Project Review","");
}

/*------------------------------------------------------------------------------------------------------/
| Program : WTUB;ShortTermRental!Short Term Rental!NA!NA
|         : WTUB:ShortTermRental/Short Term Rental/NA/NA
| Event   : WorkflowTaskUpdateBefore
|
| Client  : Placer County, CA: placerco
| Usage   : Workflow Task Update Before for all Short Term Rental permits
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/08/2021
|         : TDunn 04/05/2021 added test for if fees paid on 'Issued' status
|
/------------------------------------------------------------------------------------------------------*/
logDebug("Task = " + wfTask + " Status = " + wfStatus);
if(wfTask == "Status" && matches(wfStatus,"Issued","Ready to Issue")) {
	if(getParent() == null || getParent() == false) {
		
		logDebug("No parent found");
		showMessage = true;
		comment("<font size = 4 color=ff000><b>No TOT Registration parent found.</b></font><br><br>The Short Term Rental Permit can not be Ready to Issue or Issued without a valid TOT Registration record as a parent");
		cancel = true;		
	}
}

if(wfTask == "Status" && matches(wfStatus,"Issued")) {
	if(balanceDue > 0) {		
		logDebug("balance due is " + balanceDue);
		showMessage = true;
		comment("<font size = 4 color=ff000><b>You cannot issue the permit when fees are due.</b></font><br><br>This Short Term Rental Permit has a balance due of " + balanceDue);
		cancel = true;		
	}
}

/*=============================================================================================
| Program : WTUB:Planning!~!~!~
|
| Event   : WorkflowTaskUpdateBefore
|
| Client  : Placer County, CA
| Usage   : Development script for all Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 04/20/2023 Converted from the related StdChoice 
|         : eaftahi 06/22/2023 added IT request# 1617: Track Approved Lots and Commercial Sq Ft 
|         : TDunn 01/09/2024 created rules for invalid staff assignment to cancel on Submittal Review/Planner Assigned. 
|         : TDunn 06/19/2024 redeployed the staff assignment validation section.             
|
/=============================================================================================*/
showDebug = false;
showMessage = false;

//if (currentUserID = 'EAFTAHI') showDebug = 3;
logDebug("Running WTUB/Planning EMSE ...");


if (matches(wfTask, "Submittal Review") && AInfo["ParcelAttribute.OVERFLIGHT"] != null && wfStatus == "Distribution Complete" && isTaskActive("ALUC Notification")) {
    showMessage = true;
    customComment("This parcel is in an Airport Overflight Zone. PCTPA Notification may be required!");
    cancel = true;
}

if (((matches(wfTask, "Project Closure", "Returned from Clerk/Recorder") && matches(wfStatus, "Closed", "Received")) ||
    matches(wfStatus, "Withdrawn", "Expired")) && balanceDue > 0) {
        showMessage = true;
        customComment("There is a balance due of $" + balanceDue + " for this Project.  It cannot be closed until all fees are paid!");
        cancel = true;
}

if (((matches(wfTask, "Project Closure", "Returned from Clerk/Recorder") && matches(wfStatus, "Closed", "Received")) ||
    matches(wfStatus, "Withdrawn", "Expired")) && feeGetTotByDateRange(dateAdd(null, -365), dateAdd(null, 0), "NEW") > 0) {
        showMessage = true;
        customComment("There are uninvoiced assessed fees in the amount of $" + feeGetTotByDateRange(dateAdd(null, -730), dateAdd(null, 0), "NEW") + " for this Project. It cannot be closed until the fees are assessed and paid!");
        cancel = true;
}

/*
** Abe | 06/22/2023 >> 
** check values of 
** 'Approved Lots' and 'Approved SQFT' (number) before project closure.
** 
** Abe | 01/09/2024 Turned off by the IT Req# 1816
**

if(matches(appTypeArray[1], "Project", "Administrative", "SB 9") && matches(wfTask, "Closure", "Project Closure") &&
    matches(wfStatus, "Closed") && (matches(AInfo["Approved Lots"], null, '', ' ') || matches(AInfo["Approved SQFT"], null, '', ' '))){
        showMessage = true;
        customComment("The 'Approved Residential Lots' and 'Approved Commercial SQFT' fields must be entered before project closure!");
        cancel = true;
}

**/

// Submittal Review/Planner Assigned cancel actions
// specify affected record types
// Section re-added to production 6/19/2024
if(matches(appTypeArray[1],"Administrative","Internal County Project","MBLA","Pre Development","Project"))
{
	if(matches(wfTask,"Submittal Review") && wfStatus == "Planner Assigned")
	{
		//Cancel submit if no valid planner assigned to project
		var mText = "";
		var cancelFlag = false;
		var nsArray = new Array();
		var nsString = "";
		nsString = lookup("lkupStaffLists","non-staff"); // PLNTECH_ABN,PLNTECH_TAH,PLNSUP_ABN,PLNSUP_TAH,DIGEPLAN
		nsArray = nsString.split(",");
		// get and validate assigned to staff
		var assignedStaff = getAssignedToStaff(); 
		logDebug("assignedStaff: " + assignedStaff);
		if(assignedStaff != null) 
		{
			//Compare to non staff list.
			for(ns in nsArray)
			{
				thisNs = nsArray[ns];
				if(assignedStaff == thisNs)
				{
					mText = "The currently assigned staff, " + thisNs + " is not a valid planner assignment for this project. Please navigate to the Description tab and make a valid staff assignment. After making the assignment, return here and complete the status update.";
					cancelFlag = true;
				}
			}
		}
		else if(matches(assignedStaff,null,false,"",undefined))
		{
			mText = "There is no assigned staff on this project. Please navigate to the Description tab and make a valid planner assignment. After making the assignment, return here and complete the status update.";
			cancelFlag = true;
		}
		if(cancelFlag)
		{
			showMessage = true;
			customComment(mText);
			cancel = true;
		}
	}
}
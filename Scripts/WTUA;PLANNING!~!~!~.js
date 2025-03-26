/*=============================================================================================
| Program : WTUA:Planning/~/~/~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : WTUA script for all Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 10/28/2022 created script 
|         : TDunn 10/28/2022 developed code to manage Fees Due requirements
|         : TDunn 12/19/2023 added rules for staff notification on project assignments
|         : TDunn 01/11/2024 added notification of staff assignment to contacts. Created custom function to generate the notice.
|         : TDunn 01/17/2024 added default planning staff number to function and added error trapping to the formatPhone function     
|
/============================================================================================================================*/
if(currentUserID == "TDUNN" || currentUserID == "EAFTAHI") {
	showDebug = 1;
}
logDebug("Running WTUA:Planning");

// Actions on Permit Initiation
if(matches(appTypeArray[1],"Administrative","MBLA","Pre Development","Project","SB 9"))
{
	// Actions for Payment Requested
	if(wfTask == "Permit Initiation" && wfStatus == "Payment Requested") 
	{
		editAppSpecific("Last Payment Requested Date",dateAdd(null,0));
	}
	// Actions for manual advancement from Payment Requested to Fees Paid
	if(wfTask == "Permit Initiation" && wfStatus == "Fees Paid")
	{
		if(AInfo["Project Office"] == "Auburn") assignCap("PLNSUP_ABN");
		if(AInfo["Project Office"] == "Tahoe") assignCap("PLNSUP_TAH");		
	}
}

if(matches(appTypeArray[1],"Administrative","MBLA","Pre Development","Project","Internal County Project"))
{
	if(wfTask == "Submittal Review" && wfStatus == "Planner Assigned")
	{
		createNotificationTPS2("NOTICE_PROJECT_ASSIGNMENT_TO_STAFF","N","","N","","N","N","N","Y","Y","N","tdunn@truepointsolutions.com");
		createStaffAssignedNotification("NOTICE_PROJECT_ASSIGNMENT_TO_APPLICANT","Applicant","5307453000");
	}
}


// createNotificationTPS2(emailTemplate,doContacts,vContactTypes,doLp,vLicType,lpToEmail,doOtherContacts,getOwner,getPrimeAddr,doStaffEmail,addParentID,staffDefault)

/*=============================================================================================
| Program : WTUB:Building!~!~!~
|
| Event   : WorkflowTaskUpdateBefore
|
| Client  : Placer County, CA
| Usage   : Development script for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : EAftahi 04/20/2023 Converted from the related StdChoice
|         : TDunn   05/12/2023 added applicant email validation for new Building workflow process
|         : TDunn   07/05/2023 added cancel for no 'Yes' reviews on Distribute
|         : TDunn   01/26/2024 added cancel rules for wf process BLD_20230501_MAIN at Distribution.
|         : TDunn   03/29/2024 added cancel and message rules for preissuance tasks
|         : TDunn   04/01/2024 updated criteria for cancel on preissuance tasks active.
|         : TDunn   08/30/2024 added revision wfProcess to criteria to pre-issue rules
|         : TDunn   10/11/2024 added cancel rules for allowing only one active revision at a time.
|         : TDunn   02/24/2025 added new status for completed Revision: 'Approved' for active Preissue task rule
|         : TDunn   03/19/2026 updated Permit issuance rules for fees due to Signature Requested
|         : TDunn   03/20/2026 deployed to nonprod1 for testing
|         : TDunn   03/20/2026 removed CreateCollectionOfParcels function from script and moved to Includes_Custom
|         : TDunn   03/20/2026 remarked out Revisions at Inspection task, replaced by expression
|
/=================================================================================================*/
if(matches(currentUserID,"TDUNN","JMCKENZI","EAFTAHI")) { showDebug = 1;}

logDebug("Running WTUB:Building for cancel on workflow rules");

if(matches(wfProcess,"BLD_20181201_MAIN","BLD_20181201_DISTRIBUTION"))
{
	if(matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && matches(wfStatus,"Issued","Re-Issue"))
	{
		if(balanceDue > 0)
		{
			showMessage = true; 
			comment("<font size = 4 color=ff000><b>Balance Due:</b></font><br><br>There is a balance due of $" + balanceDue + " for this Building Permit.  It cannot be issued until all fees due are paid.<br>");
			cancel = true;
		}
		if(feeGetTotByDateRange(dateAdd(null,-365),dateAdd(null,0),"NEW") > 0)
		{
			showMessage = true; 
			comment("<font size = 4 color=ff000><b>Assessed Fees:</b></font><br><br>There are uninvoiced assessed fees in the amount of $" + feeGetTotByDateRange(dateAdd(null,-730),dateAdd(null,0),"NEW") + " for this Building Permit.  The permit cannot be issued until the fees are assessed and paid.<br>");
			cancel = true;
		}
	}
}

if(matches(wfTask,"Planning Review") && AInfo["ParcelAttribute.OVERFLIGHT"] != null){
    showMessage = true;
    customComment("This parcel is in an Airport Overflight Zone. ALUC restrictions may apply!");
}

if ((wfProcess == "BLD_20181201_DISTRIBUTION" && wfTask == "Department Distribution" &&
    wfStatus == "Not Required - Plan Check Only" && !(isTaskActive("Plan Check", "BLD_20181201_MAIN"))) &&
    (estValue == 0 && calcValue == 0)) {

    showMessage = true;
    customComment("Please enter a valuation on this permit before moving forward!");
    cancel = true;
}  

if((wfTask == "Department Distribution" && wfStatus == "Not Required - Process for Issuance") && (estValue == 0 && calcValue == 0)){
    showMessage = true;
    customComment("Please enter a valuation on this permit before moving forward!");
    cancel = true;
}

if (getAppSpecific("Project Office") == null && appTypeArray[3] != "Solar App") {
    showMessage = true;
    customComment("Please specify a Project Office on the ASI screen!");
    cancel = true;
}

if(matches(wfTask,"Ready to Issue","Process for Issuance","Issue Status") && matches(wfStatus,"Complete","Issued","Re-Issue","Ready to Issue")){
    varValidateOn = "Issue"; 
    // branch("CreateCollectionOfParcels");  replaced with function called below
	createCollectionOfParcels();
}
 
if (appHasCondition("Building - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("Planning - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("ESD - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("Env. Engineering - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("Code Compliance - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("Env. Health - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("DPW - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("Fire - Prevent Issuance / Approval", "Applied", null, null) ||
    appHasCondition("PUD - Prevent Issuance / Approval", "Applied", null, null) || appHasCondition("Other - Prevent Issuance / Approval", "Applied", null, null)) {

    ConditionStopsIssuance = true;
}
else {
    ConditionStopsIssuance = false;
}


if (((appMatch("Building/Residential/Limited/*") && matches(wfTask, "Plan Check")) || matches(wfTask, "Ready to Issue") ||
    matches(wfTask, "Process for Issuance") || matches(wfTask, "Issue Status")) &&
    matches(wfStatus, "Issued", "Re-Issue") && ConditionStopsIssuance == true) {

    showMessage = true;
    customComment("There are applied Conditions that must be cleared before proceeding!");
}
 
if (matches(wfTask, "Application Submittal", "Department Distribution") &&
    matches(wfStatus, "Complete", "Not Required - Plan Check Only", "Not Required - Process for Issuance") &&
    getAppSpecific("Plan Check Type") == null) {

    showMessage = true;
    customComment("Plan Check Type must be specified on the ASI Tab!");
    cancel = true;
}
  
if(wfProcess == 'BLD_20181201_MAIN' || wfProcess == 'BLD_20181201_DISTRIBUTION' || wfProcess == 'BLD_20181201_REVISIONS')
{
    //branch("WTUB_wfProcess-BLD_20181201_MAIN");  This part only applies to the new WFProcesses
    if(matches(wfTask,"Plan Check") && matches(wfStatus,"Corrections Required","Complete") && capStatus == "Corrections Required"){
        showMessage = true;
        customComment("Must Be Reviewed First!");
        cancel = true;
    }
     
    if(matches(wfTask,"Application Submittal") && matches(wfStatus,"Complete") && (isTaskStatus("Planning Review", "Corrections Required", "BLD_20181201_DISTRIBUTION"))){
        showMessage = true;
        customComment("Planning has required corrections. Cannot proceed!");
        cancel = true;
    }
     
    if(matches(wfTask,"Application Submittal") && matches(wfStatus,"Complete") &&  isTaskActive("Plan Completeness Review","BLD_20181201_DISTRIBUTION")){
        showMessage = true;
        customComment("Plan Completeness Review is not yet complete. Cannot proceed!");
        cancel = true;
    }
     
    if(matches(wfTask,"Process for Issuance") && matches(wfStatus,"Ready to Issue","Issued") && (countActiveTasks("BLD_20181201_MAIN") > 1 || countActiveTasks("BLD_20181201_DISTRIBUTION") > 0 || countActiveTasks("ADHOC") > 0)){
        showMessage = true;
        customComment("Cannot proceed until all Department Reviews are complete!");
        cancel = true;
    }
     
    if(matches(wfTask,"Plan Check") && matches(wfStatus,"Complete") && feeExists("0132") && feeAmount("0132") < 1){
        showMessage = true;
        customComment("The Facility fee is < $1.00. Please update the Facility Fee with the project Square Footage.");
        cancel = true;
    }
	if(matches(wfTask,"Inspections","Inspection"))
	{
		if(wfStatus == "Revisions")
		{
			if(capStatus == "Issued - Revision Pending")
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>Permit status is " + capStatus + "!.</b></font><br><br>Only one revision can be in process at a time. An additional revision cannot be created until the current one has been completed");
				cancel = true;
			}				
		}
	}
}

//============================================================
// Begin rules for Building workflow process BLD_20230501_MAIN
//============================================================
if(wfProcess == "BLD_20230501_MAIN" || wfProcess == "BLD_20231116_REV") 
{
	if(matches(wfTask,"Submittal Review","Distribution Reconciliation","Process for Issuance") && matches(wfStatus,"Submittal Incomplete","Corrections Required","Payment Requested"))
	{
		var vToEmail = "";
		var cTypeArray = new Array();
		var vContactTypes = "Applicant";
		cTypeArray = vContactTypes.split(",");
		var conArray = new Array();
		conArray = getContactArrayWithPrimary(capId); 
		emailParameters = aa.util.newHashtable();
		for (thisCon in conArray) 
		{
			if (exists(conArray[thisCon]["contactType"],cTypeArray)) 
			{
				logDebug(conArray[thisCon]["contactType"]) ;
				getContactParams4Notification(emailParameters, conArray[thisCon]);
				if(!matches(emailParameters.get("$$contactEmail$$"),null,undefined,""))
				{
					vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
				}
			}
		}
		if(vToEmail == "")
		{
			showMessage = true;
			comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			cancel = true;
		}
	}
	
	// Rules for Distribution
	//----------------------------------------
	if(wfTask == "Distribution")
	{
		if(matches(wfStatus,"Distribute","Not Required - Plan Check Only"))
		{
			if(balanceDue > 0)
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>Unpaid Balance Due.</b></font><br><br>There is a balance due of $" + balanceDue + " for this Permit. Distribution for Plan Check cannot not occur until all invoiced fees are paid");
				cancel = true;				
			}
		}
	}

	// Rules for Distribution Reconciliation
	//---------------------------------------
	if(wfTask == "Distribution Reconciliation" && matches(wfStatus,"Complete"))
	{
		var allTasksArray = new Array();
		var cancelFlag = false;
		var cMessage = "";
		var reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS","BLDPERMIT"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
		allTasksArray = reviewList.split(",");
		
		logDebug("Task List Param: " + allTasksArray);

		for (ata in allTasksArray) 
		{
			var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
			logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
			//If the last task status value is 'apStatus' set cancel flag to true;
			if(isTaskStatus(thisTask,"Corrections Required"))
			{
				cancelFlag = true;
				cMessage = cMessage + ", " + thisTask;
				logDebug(cMessage);
			}
		}
		if(cancelFlag)
		{
			showMessage = true;
			comment("<font size = 4 color=ff000><b>The following task(s) have a current status of Corrections Required" + cMessage + ".</b></font><br>Distribution Reconciliation cannot be statused as " + wfStatus + "<br> when one or more tasks are Corrections Required.");
			cancel = true;
		}
	}
	
	// Rules for Process for Issuance
	if(wfTask == "Process for Issuance")
	{
		var allTasksArray = new Array();
		var cancelFlag = false;
		var cMessage = "";
		var payFlag = false;
		var issueFlag = false;
		var reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of tasks to check for active status prior to allowing action statuses
		allTasksArray = reviewList.split(",");
		
		if(matches(wfStatus,"Payment Requested"))
		{
			for (ata in allTasksArray) 
				{
					var thisTask = allTasksArray[ata];  //For each task in list (all preissue names are in List)
					logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
					//If the last task status value is 'apStatus' set cancel flag to true;
					if(isTaskActive(thisTask) && matches(thisTask,"Traffic Fee Review","Placer County Fire Fee Review"))
					{
						cancelFlag = true;
						cMessage = cMessage + ", " + thisTask;
						logDebug(cMessage);
					}
				}

			if(cancelFlag)
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>The following task(s) related to potential additional fees are active:<br> " + cMessage + ".</b></font><br>Process for Issuance cannot be statused as " + wfStatus + "<br> when one or more preissuance tasks related to potential fees are active.");
				cancel = true;
			}
		}
		if(matches(wfStatus,"Issued","Approved"))
		{
			for (ata in allTasksArray) 
				{
					var thisTask = allTasksArray[ata];  //For each task in list (all preissue names are in List)
					logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
					//If the last task status value is 'apStatus' set cancel flag to true;
					if(isTaskActive(thisTask))
					{
						cancelFlag = true;
						cMessage = cMessage + ", " + thisTask;
						logDebug(cMessage);
					}
				}

			if(cancelFlag)
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>The following preissuance task(s) are active" + cMessage + ".</b></font><br>Process for Issuance cannot be statused as " + wfStatus + "<br> when one or more of these tasks are active.");
				cancel = true;
			}			
		}
		if(matches(wfStatus,"Signature Requested"))
		{
			if(balanceDue > 0)
			{
				showMessage = true; 
				comment("<font size = 4 color=ff000><b>Balance Due:</b></font><br><br>There is a balance due of $" + balanceDue + " for this Building Permit.  It cannot be 'Issued - Signature Requested' until all fees due are paid.<br>");
				cancel = true;
			}
			if(feeGetTotByDateRange(dateAdd(null,-365),dateAdd(null,0),"NEW") > 0)
			{
				showMessage = true; 
				comment("<font size = 4 color=ff000><b>Assessed Fees:</b></font><br><br>There are uninvoiced assessed fees in the amount of $" + feeGetTotByDateRange(dateAdd(null,-730),dateAdd(null,0),"NEW") + " for this Building Permit.  The permit cannot be 'Issued - Signature Requested' until the fees are assessed and paid.<br>");
				cancel = true;
			}
		}		
	}
	// Process Rules for Inspections task
	// if(matches(wfTask,"Inspections","Inspection"))
	// {
		// if(wfStatus == "Revisions")
		// {
			// if(capStatus == "Issued - Revision Pending")
			// {
				// showMessage = true;
				// comment("<font size = 4 color=ff000><b>Permit status is " + capStatus + "!.</b></font><br><br>Only one revision can be in process at a time. An additional revision cannot be created until the current one has been completed");
				// cancel = true;
			// }				
		// }
	// }
}


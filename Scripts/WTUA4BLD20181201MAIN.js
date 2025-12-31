/*---------------------------------------------------------------------------------------------------
| Program : WTUA4BLD20181201MAIN
| Event   : Called from WTUA:Building/star/star/star
| Client  : Placer County 'Placerco'
| Useage  : replaces EMSE 2.0 rules for prior workflow processes
|
| Notes   : TDunn  10/29/2024 Converted from branch WTUA_wfProcess-BLD_20181201_MAIN
|                             Replaces EMSE 2.0 code for BLD_20181201_MAIN'; 'BLD_20181201_DISTRIBUTION'; 'BLD_20181201_REVISIONS
|           TDunn  12/12/2025 Redeployed to nonprod1.
|
/----------------------------------------------------------------------------------------------------*/

if (wfProcess == 'BLD_20181201_MAIN' || wfProcess == 'BLD_20181201_DISTRIBUTION' || wfProcess == 'BLD_20181201_REVISIONS') 
{
	//else {branch("WTUA_wfProcess-Legacy_BLD");}
	
	// Converted from branch WTUA_wfProcess-BLD_20181201_MAIN
	if (matches(wfProcess, "BLD_20181201_DISTRIBUTION") && matches(wfTask, "Department Distribution") && matches(wfStatus,"Not Required - Plan Check Only") && !(isTaskActive("Plan Check", "BLD_20181201_MAIN"))) {
		activateTask("Plan Check", "BLD_20181201_MAIN");
		updateTask("Application Submittal","Complete","","","BLD_20181201_MAIN",capId);
		deactivateTask("Application Submittal","BLD_20181201_MAIN");
		updateTask("Plan Check", "In Review", "Set to IN REVIEW by the System", null, "BLD_20181201_MAIN", capId);
		}

	if (matches(wfProcess, "BLD_20181201_REVISIONS") && matches(wfTask, "Department Distribution") && matches(wfStatus,"Not Required - Plan Check Only") && !(isTaskActive("Plan Check", "BLD_20181201_REVISIONS"))) {
		activateTask("Plan Check", "BLD_20181201_REVISIONS");
		deactivateTask("Department Distribution", "BLD_20181201_REVISIONS");
		updateTask("Plan Check", "In Review", "Set to IN REVIEW by the System", null, "BLD_20181201_REVISIONS", capId);
		}

	if (matches(wfProcess, "BLD_20181201_REVISIONS") && matches(wfTask, "Department Distribution") && matches(wfStatus,"Distribute") && isTaskActive("Plan Check", "BLD_20181201_REVISIONS")) {
		updateTask("Plan Check", "In Review", "Set to IN REVIEW by the System", null, "BLD_20181201_REVISIONS", capId);
		}

	if (matches(wfTask, "Department Distribution") && matches(wfStatus,"Not Required - Process for Issuance")) {
		activateTask("Process for Issuance", "BLD_20181201_MAIN");
		updateTask("Application Submittal","Complete","","","BLD_20181201_MAIN",capId);
		deactivateTask("Application Submittal","BLD_20181201_MAIN");
		updateTask("Plan Check", "Not Applicable", "Set to NOT APPLICABLE by the System", null, "BLD_20181201_MAIN", capId);
		}

	if (matches(wfTask, "Application Submittal") && matches(wfStatus,"Complete") && !(isTaskStatus("Plan Check","In Review","BLD_20181201_MAIN")) && !(isTaskStatus("Plan Check","Corrections Required","BLD_20181201_MAIN"))) {
		updateTask("Plan Check", "In Review", "Set to IN REVIEW by the System", null, "BLD_20181201_MAIN", capId);
		}

	if (matches(wfTask, "Inspections") && matches(wfStatus,"Revisions")) {
		activateTask("Inspections", "BLD_20181201_MAIN");
		}

	if (matches(wfTask, "Department Distribution") && matches(wfStatus,"Not Required - Approve Revisions")) {
		closeTask("Revisions","Revisions Approved","","","BLD_20181201_MAIN");
		}

	if (matches(wfTask, "Plan Check") && matches(wfStatus,"Revision Prior to Issuance")) {
		activateTask("Department Distribution", "BLD_20181201_DISTRIBUTION");
		}

	if (matches(wfTask, "Plan Check") && matches(wfStatus,"Complete", "Corrections Required", "Revision Prior to Issuance")) {
		editTaskSpecific("Plan Check", "Plan Reviews", Number(AInfo['Plan Reviews']) + 1);
		}
}
if (matches(wfTask,"Fire Review") && matches(wfStatus,"Complete","Revisions","Corrections Required") && AInfo['LPG Article 15.12'] == "CHECKED") 
{
	addStdCondition("Fire - Prevent Final / Completion", "Fire LPG Article 15.12 Inspection Required");
}

if (matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued" && (getAppSpecific("Issue Date") == null || getAppSpecific("Issue Date") == "")) 
{
	editAppSpecific("Issue Date",dateAdd(null,0));
}

if (matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued"){
	editFirstIssuedDate(dateAdd(null,0));
}

if (matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued" && cap.isCreatedByACA()) 
{
	addStdCondition("Building - Prevent Building Inspections","Applicant Signature & Final Department Processing Required");
}

// if (matches(wfTask,"Inspections") && matches(wfStatus,"Revisions")) 
// {
	// addStdCondition("Building - Prevent Final / Completion","Building Final Inspection Required");
// }
if(isTaskStatus("Department Distribution","Distribute","BLD_20181201_REVISIONS") || isTaskStatus("Department Distribution","Not Required - Approve Revisions","BLD_20181201_REVISIONS") || isTaskStatus("Department Distribution","Not Required - Plan Check Only","BLD_20181201_REVISIONS"))
{	
	if (matches(wfTask,"Revisions") && matches(wfStatus,"Revisions Approved")) 
	{
		removeCapCondition("Building - Prevent Final / Completion","Building Final Inspection Required");
	}
}

if (matches(wfTask,"Department Distribution") && matches(wfStatus,"Not Required - Approve Revisions")) 
{
	removeCapCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Revisions are Approved");
}

if (matches(wfProcess, "BLD_20181201_REVISIONS") && matches(wfTask, "Department Distribution") && matches(wfStatus,"Not Required - Plan Check Only") && !(isTaskActive("Plan Check", "BLD_20181201_REVISIONS"))) {
	activateTask("Plan Check", "BLD_20181201_REVISIONS");
	deactivateTask("Department Distribution","BLD_20181201_REVISIONS");
	}

if (matches(wfTask,"Environmental Health Review") && matches(wfStatus,"Complete with PUD Conditions"))
{
	addStdCondition("PUD - Prevent Final / Completion","Water");
	addStdCondition("PUD - Prevent Final / Completion","Sewer");
}

if (matches(wfTask,"Plan Check") && wfStatus == "Complete" && wfProcess == "BLD_20181201_MAIN") {
	var AInfoTSItemp = [];
	useTaskSpecificGroupName = true;
	loadTaskSpecific(AInfoTSItemp);
	editAppSpecific("Plan Check Type", AInfoTSItemp["BLD_20181201_MAIN.Plan Check.Plan Check Type Override"]);
	useTaskSpecificGroupName = false;
	}

if (matches(wfTask,"Plan Check") && wfStatus == "Complete" && wfProcess == "BLD_20181201_REVISIONS")
{
	var AInfoTSItemp = [];
	useTaskSpecificGroupName = true;
	loadTaskSpecific(AInfoTSItemp);
	editAppSpecific("Plan Check Type", AInfoTSItemp["BLD_20181201_REVISIONS.Plan Check.Plan Check Type Override"]);
	useTaskSpecificGroupName = false;
}

if (wfProcess == "BLD_20181201_DISTRIBUTION" && wfTask == "TRPA ESD Review" && wfStatus == "Complete" && isTaskComplete("TRPA Planning Review","BLD_20181201_DISTRIBUTION")) 
{
	assignTask("TRPA Review", "TAHOE_COUNTER", "BLD_20181201_DISTRIBUTION");
}

if (wfProcess == "BLD_20181201_REVISIONS" && wfTask == "TRPA ESD Review" && wfStatus == "Complete" && isTaskComplete("TRPA Planning Review","BLD_20181201_REVISIONS")) 
{
	assignTask("TRPA Review", "TAHOE_COUNTER", "BLD_20181201_REVISIONS");
}

if (wfProcess == "BLD_20181201_DISTRIBUTION" && wfTask == "TRPA Planning Review" && wfStatus == "Complete" && isTaskComplete("TRPA ESD Review","BLD_20181201_DISTRIBUTION")) 
{
	assignTask("TRPA Review", "TAHOE_COUNTER", "BLD_20181201_DISTRIBUTION");
}

if (wfProcess == "BLD_20181201_REVISIONS" && wfTask == "TRPA Planning Review" && wfStatus == "Complete" && isTaskComplete("TRPA ESD Review","BLD_20181201_REVISIONS"))
{
	assignTask("TRPA Review", "TAHOE_COUNTER", "BLD_20181201_REVISIONS");
}

if (wfProcess == "BLD_20181201_DISTRIBUTION" && wfTask == "Planning Review" && (wfStatus == "Complete" || wfStatus == "Corrections Required" ) && AInfo["PCCP Required"] == "Yes") 
{
	addAdHocTask("ADHOC", "Planning Review", "PCCP");
	addAppCondition("Planning - Prevent Issuance / Approval", "Applied", "PCCP Review Required", "Added by automation for PCCP Required Review", "Notice");
}


!matches(wfProcess,'BLD_20181201_MAIN','BLD_20181201_DISTRIBUTION','BLD_20181201_REVISIONS',"BLD_MAIN_20230501_MAIN","BLD_20231116_REV","BLD_DEFERRED_20240710","BLD_20241008_PC0") ^ branch("WTUA_wfProcess-Legacy_BLD");

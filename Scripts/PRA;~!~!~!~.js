/*------------------------------------------------------------------------------------------------------/
| Program : PRA;~!~!~!~  (actually *s not tilde)
|
| Event   : PaymentReceiveAfter
|
| Client  : Placer County
| Usage   : PaymentReceiveAfter for all online payments..
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 11/11/2020 Created script
| update  : TDunn 10/01/2021 Added documentation for using the createNotificationTPS2 function
| update  : TDunn 10/04/2021 Added additional criteria for sending notice by module and record type. 
| update  : TDunn 12/22/2021 added new option to createNotificationTPS3 to send email to both default and assigned staff
| update  : TDunn 10/28/2022 added rules for Planning records at 'Fees Paid'
|         : TDunn 06/19/2023 added new workflow update rules for payments via ACA
| update  : EAFTAHI 06/27/2023 added auto-advancement for AA initiated permits 
|         : TDunn 09/04/2024 added rules for updating Deferred status and task status
|         : TDunn 10/22/2024 added rules for auto distribution when payment requested at Distribution
|         : TDunn 10/24/2024 updates rules for auto distribution to just updating the task status.
|         : TDunn 12/10/2024 updated record statuses and criteria for updating task and rec status on payment received.
|         : TDunn 02/12/2025 removed conditional criteria for only publicUser
|         : TDunn 03/22/2025 added test for if fees on parent are from child Rev or Deferred
|         : TDunn 04/17/2025 added test for if the revision is for the Master plan check only
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/31/2025 deployed to Github
|         : TDunn 03/20/2026 added updating due dates for originating tasks on payment
|         : TDunn 03/25/2026 added updating child task due dates
|         : TDunn 03/26/2026 added including old 'Plan Check Only' type in criteria for Master/Rev updates
|         : TDunn 07/14/2026 added tracking in possession date
|
\-------------------------------------------------------------------------------------------------------*/



logDebug("Running Staff notification for payment received");
var praNoticeTemplate = "PRA_STAFF_NOTIFICATION_ONLINE_PAYMENT_RECEIVED";
var sendItFlag = false;
var staffCode = "Y";
// sending notice for other record types can be activated by adding update to sendItFlag within 'if' statements
// update/activate default email by updating email by module/record type and/or remark out override to tdunn@truepointsolutions
if(appTypeArray[1] == "Hazardous Vegetation") {
	var defaultEmail = "cdrcount@placer.ca.gov";
	defaultEmail = "tdunn@truepointsolutions.com";
}
if(appTypeArray[1] == "STR Compliance") {
	var defaultEmail = "str@placer.ca.gov";
	defaultEmail = "tdunn@truepointsolutions.com";
}
if(appTypeArray[1] == "Short Term Rental") {
	var defaultEmail = "str@placer.ca.gov";
	defaultEmail = "tdunn@truepointsolutions.com";
}
if(matches(appTypeArray[0],"Building","TRPA")) {
	var defaultEmail = "cdrcount@placer.ca.gov";
	staffCode = "B";
	// defaultEmail = "tdunn@truepointsolutions.com";
	sendItFlag = true;
}
logDebug("App type = " + appTypeArray[0] + " send it flag is " + sendItFlag);
if(((cHolderName != null && cHolderName != "") || currentUserID == "TDUNN") && sendItFlag) {
	createNotificationTPS3(praNoticeTemplate,"N","Applicant","N","Contractor","N","N","N","Y",staffCode,"N",defaultEmail);
}

// Rules for Planning records
logDebug("Running actions for Planning records on PRA event");
if(matches(appTypeArray[1],"Administrative","MBLA","Pre Development","Project","SB 9"))
{
	// Actions for auto advancement from Payment Requested to Fees Paid
	if(isTaskStatus("Permit Initiation","Payment Requested") && isTaskActive("Permit Initiation"))
	{
		closeTask("Permit Initiation","Fees Paid","Fees paid online, updated by script","");
		if(AInfo["Project Office"] == "Auburn") assignCap("PLNSUP_ABN");
		if(AInfo["Project Office"] == "Tahoe") assignCap("PLNSUP_TAH");
	}
}

// Begin rules for BLD_20230501_MAIN and Plan Check Master processes
//====================================================================
if(matches(appTypeArray[1],"Residential","Commercial"))
{
	logDebug("Running actions for Building Records and Revisions at PRA");
	if(isTaskStatus("Process for Issuance","Payment Requested"))
	{
		updateTask("Process for Issuance","Payment Received","Payment Received via Citizen Portal. Updated by script","");
		updateAppStatus("Payment Received","Updated by script on Payment Received via Citizen Portal");
		editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"));
		editTaskSpecific("Process for Issuance","Possession Start Date",dateAdd(null,0,"Y"));
	}
	if(isTaskActive("Distribution") && isTaskStatus("Distribution","Payment Requested"))
	{
		logDebug("running actions for active Distribution at Payment Requested");
		if(balanceDue < 1)
		{
			updateTask("Distribution","Payment Received","Updated on Payment of fees due","");
			updateAppStatus("Payment Received","Updated by script on Payment Received via Citizen Portal");
			editTaskDueDate("Distribution",dateAdd(null,1,"Y"));
			editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));
		}
	}
}

try
{
	if (matches(appTypeArray[0],"Building","TRPA") && matches(appTypeArray[1],"Commercial","Residential","Building") && !matches(appTypeArray[2],"PV Solar")) 
	{
		myChildArray = getChildren("Building/*/*/*",capId);
		if(myChildArray != null && myChildArray.length > 0) 
		{
			logDebug("Number of Children: " + myChildArray.length);
			var cProcess = "BLD_20231116_REV";
			if(matches(appTypeArray[2],"Master","Plan Check Only")) {cProcess = "BLD_PLNCHK_20241222";}
			var cTask = "Process for Issuance";
			var cNumDay = 2;
			var saveCapId = capId;
			for (thisChild in myChildArray) 
			{
				cCapId = myChildArray[thisChild];
				if(cCapId != null) 
				{
					c_cap = aa.cap.getCap(cCapId).getOutput();
					c_AltId = cCapId.getCustomID();
					c_appTypeResult = c_cap.getCapType();
					c_appTypeString = c_appTypeResult.toString();
					c_appTypeArray = c_appTypeString.split("/");
					c_alias = c_cap.capModel.getAppTypeAlias();
					c_capStatus = c_cap.getCapStatus(); 
					logDebug("child altId: " + c_AltId + ", app type: " + c_appTypeArray[1] + ", child status is " + c_capStatus);
					if((matches(c_appTypeArray[1],"Revision","Deferred Submittal") || c_appTypeArray[3] == "Revision") && (matches(c_capStatus,"Payment Requested") || matches(c_capStatus,"Awaiting Payment"))) 
					{
						if(c_appTypeArray[1] == "Deferred Submittal")
						{
							cProcess = "BLD_DEFERRED_20240710";
						}
						else if(taskStatus("Distribution",cProcess,cCapId) == "Payment Requested")
						{
							cTask = "Distribution";
							cNumDay = 1;
						}	
						logDebug("Found child " + c_appTypeArray[1] + "/*/" + c_appTypeArray[3] + " with status of " + c_capStatus + " at " + cTask);
						
						updateTask(cTask,"Payment Received","Payment Received on parent via Citizen Portal. Updated by script","",cProcess,cCapId);
						updateAppStatus("Payment Received","Updated by script on Payment Received on parent via Citizen Portal",cCapId);
						saveCapId = capId;
						capId = cCapId;
						editTaskDueDate(cTask,dateAdd(null,cNumDay,"Y",cProcess));
						capId = saveCapId;
					}
				}
			}
		}
	}
} 
catch(err) 
{
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing PRA:update to child: try error ", err.message);
}


// Begin new rules for BLD_20231116_REV process
//================================================================
if(matches(appTypeArray[1],"Revision"))
{
	logDebug("Running actions for Building Records and Revisions at PRA");
	if(isTaskStatus("Process for Issuance","Payment Requested"))
	{
		updateTask("Process for Issuance","Payment Received","Payment Received via Citizen Portal. Updated by script","");
		updateAppStatus("Payment Received","Updated by script on Payment Received via Citizen Portal");
		editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"));
		editTaskSpecific("Process for Issuance","Possession Start Date",dateAdd(null,0,"Y"));
	}
	if(isTaskActive("Distribution") && isTaskStatus("Distribution","Payment Requested"))
	{
		logDebug("running actions for active Distribution at Payment Requested");
		if(balanceDue < 1) 
		{
			updateTask("Distribution","Payment Received","Updated on Payment of fees due","");
			updateAppStatus("Payment Received","Updated by script on Payment Received via Citizen Portal");
			editTaskDueDate("Distribution",dateAdd(null,1,"Y"));
			editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));
		}
	}
}
// Begin rules for Deferred
//======================================================
if(appTypeArray[1] == "Deferred Submittal")
{
	if(isTaskStatus("Process for Issuance","Payment Requested"))
	{
		updateTask("Process for Issuance","Payment Received","Payment Received via Citizen Portal. Updated by script","");
		updateAppStatus("Payment Received","Updated by script on Payment Received via Citizen Portal");	
		editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"));
		editTaskSpecific("Process for Issuance","Possession Start Date",dateAdd(null,0,"Y"));
	}
}

	
/**
 * Abe >> IT Req# 1566: added AA/ACA initiated auto-advance 
 **/
if (matches(appTypeArray[1], "Administrative", "MBLA", "Pre Development", "Project", "SB 9")) {

    logDebug("Running actions for Online Planning records on PRA event ...");

    if (!publicUser) {
        if (isTaskActive("Permit Initiation") && balanceDue == 0) {
            closeTask("Permit Initiation", "Fees Paid", "Fees paid, updated by script", "");
            if(AInfo["Project Office"] == "Auburn") assignCap("PLNSUP_ABN");
            if(AInfo["Project Office"] == "Tahoe") assignCap("PLNSUP_TAH");
        }
    }
    else {
        if (isTaskStatus("Permit Initiation", "Payment Requested") && isTaskActive("Permit Initiation")) {
            closeTask("Permit Initiation", "Fees Paid", "Fees paid, updated by script", "");
            if(AInfo["Project Office"] == "Auburn") assignCap("PLNSUP_ABN");
            if(AInfo["Project Office"] == "Tahoe") assignCap("PLNSUP_TAH");
        }
    }
}

var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing PRA script ", debug);	

/*============================ Internal Functions required for this script =================================================*/

function editTaskDueDateGPT(wfstr, wfdate) // optional process name.  if wfstr == "*", set for all tasks
{
	var useProcess = false;
	var processName = "";
	var vCapId = capId;
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}
	if (arguments.length == 4) {
		vCapId = arguments[3]; // subprocess
	}
	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(vCapId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			wfObj[i].setDueDate(aa.date.parseDate(wfdate));
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
			if (tResult.getSuccess())
				logDebug("Set Workflow Task: " + fTask.getTaskDescription() + " due Date " + wfdate);
			else {
				logMessage("**ERROR: Failed to update due date on workflow: " + tResult.getErrorMessage());
				return false;
			}
		}
	}
}










function createNotificationTPS3(emailTemplate,doContacts,vContactTypes,doLp,vLicType,lpToEmail,doOtherContacts,getOwner,getPrimeAddr,doStaffEmail,addParentID,staffDefault) {
/*========================================================================================================================================================================== 
| This is a standarized function for generating one or multiple email notifications using the scripting engine and the Notification templates.  
| The following parameters must be passed to this function:
| Email Template = name of the notification template to be used for this email.
| doContacts = set to "Y" if contact emails are included in the 'to email' distribution list. Set to "N" otherwise
| vContactTypes = list of contact types to include in the 'to email' list. Enter list as types separated by commas with only one set of "" e.g. "Applicant,Arborist,Designer"
| doLp = set to "Y" or "N" to control if licensed professionals are included in the distribution list. If set to "N", vLicType and lpToEmail can be set to "N"
| vLicType = array of license types to include in the licensed professional email list (e.g. vLicType = "Contractor,Electrical")
| lpToEmail = set to "Y" or "N" to control if licensed professionals are in the 'to email' list or the 'copy to' list, if "Y" then 'to email' if "N" 'copy email';
| doOtherContacts = set to "Y" or "N" to control if 'other' contact types should be included in the vCcEmail list (copy to list). 
| getOwner = set to "Y" or "N" to control if Owner information is included in the parameter list.
| getPrimeAddr = set to "Y" or "N" to control if primary address for record is required for the notification parameter list. returns $$addressLine$$
| doStaffEmail = set to "Y" or "N" to control if assigned staff is included in the 'to email' list, set to 'T' if staffDefault is to be used as the assignedStaff.
|                set to "B" if email should go to default AND assignedToStaff
| addParentID = set to "Y" or "N" to control if parent altId of current record is included in the notification. 
| staffDefault = the email address of the staff member to include in the vToEmail if no staff is assigned to the record. Use userID if toStaffEmail set to 'T'. 
| Staff params = $$assignedStaffParam$$
|		         $$staffEmailParam$$
|		         $$staffNameParam$$
| Parameters returned by the getContactParams4Notification() function: $$contactFullName$$; $$contactEmail$$; $$contactFirstName$$; $$contactLastName$$; $$contactAddressLine1$$; $$contactPhoneNumber1$$
| Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
/------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
/* Initialize standard parameters for notification */
var vEmailSent = false;
var vFromEmail = "";
var vToEmail = "";
var vCcEmail = "";
var pcapIdString = "";
var emailParameters = aa.util.newHashtable();
var reportParams = aa.util.newHashtable();
vFromEmail = "";
logDebug(" Do staff=" + doStaffEmail + ", Add parent= " + addParentID + ", Staff default = " + staffDefault);

// start loading parameters for notification
logDebug("loading deeplink parameters");
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaDeepLinkAppTypeAlias$$
// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
getRecordParams4Notification(emailParameters); 
addParameter(reportParams,"RecordID",capIDString); 

if(vEventName == "WorkflowTaskUpdateAfter") {
	addParameter(emailParameters,"$$wfStatusParam$$", wfStatus); 
	addParameter(emailParameters,"$$wfDateParam$$", wfDateMMDDYYYY); 
	addParameter(emailParameters,"$$taskNameParam$$",wfTask);
	addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
	wfDueDate = getTaskDueDate("wfTask");
	if(wfDueDate != null) {
		addParameter(emailParameters,"$$wfDueDateParam$$",wfDueDate);
	}
}

if (vEventName == "InspectionScheduleAfter") {
	addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
	addParameter(emailParameters, "$$inspType$$", inspType);
}

if(getOwner == "Y") {
	getPrimaryOwnerParams4Notification(emailParameters);
}

if(addParentID == "Y") {
	pcapId = getParent();
	if(pcapId != null) {
	pcapIDString = pcapId.getCustomID();
	addParameter(emailParameters,"$$parentAltId$$",pcapIDString);
	}
}

/* Get To email contact types */
/* Some of the parameters returned by the getContactParams4Notification() function: $$contactFullName$$; $$contactEmail$$; $$contactFirstName$$; $$contactLastName$$; $$contactAddressLine1$$; $$contactPhoneNumber1$$ */
if(doContacts == "Y" || doOtherContacts == "Y") {
	var cTypeArray = new Array();
	cTypeArray = vContactTypes.split(",");
}
/* Get To emails for contacts */
if(doContacts == "Y") {
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId); 
	for (thisCon in conArray) {
		if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
			logDebug(conArray[thisCon]["contactType"]) ;
			getContactParams4Notification(emailParameters, conArray[thisCon]);
			if(emailParameters.get("$$contactEmail$$") != null) {
			vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
			}
		}
	}

}
/* Get cc emails for other contacts */
if(doOtherContacts == "Y") {
	conArray = getContactArrayWithPrimary(capId);
	for (thisCon in conArray) {
		if(!exists(conArray[thisCon]["contactType"],cTypeArray) && conArray[thisCon]["email"] != null && conArray[thisCon]["email"] != "") {
			vCcEmail = vCcEmail + conArray[thisCon]["email"] + "; ";
		}
	}
}

if(doLp == "Y") {
	var licProfsArray = new Array(); 
	var vLicTypeArray = new Array();
	licProfsArray = getLicenseProfessional(capId);
	vLicTypeArray = vLicType.split(",");
	for(thisProf in licProfsArray) {
		currentProf = licProfsArray[thisProf]; 
		lpType = currentProf.getLicenseType();
		if((currentProf.getEmail() != null && currentProf.getEmail() != "") && exists(lpType, vLicTypeArray)) {
			profEmail = currentProf.getEmail();
			if((profEmail != null && profEmail != "") && lpToEmail == "Y") {
				vToEmail = vToEmail + profEmail + "; ";
			}
			if((profEmail != null && profEmail != "") && lpToEmail != "Y") {
				vCcEmail = vCcEmail + profEmail + "; ";
			}
		}
	}
}

/* Get primary permit address */
if(getPrimeAddr == "Y") {
	getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */
}

/* Get assigned staff email address */
if(doStaffEmail == "Y") {
	var vStaffEmail = staffDefault; 
	logDebug("Staff default is: " + staffDefault);
	var assignedToEmail = ""; 
	var assignedTo = getAssignedToStaff(); 
	if(assignedTo != null) {
		assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
		logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
		if(!matches(assignedToEmail,undefined,"",null)) {
			vStaffEmail = assignedToEmail;
		}
	}
	vToEmail = vToEmail + vStaffEmail + "; "; 
}

if(doStaffEmail == "B") {
	var vStaffEmail = staffDefault; 
	logDebug("Staff default is: " + staffDefault);
	vToEmail = vToEmail + staffDefault + "; ";	
	var assignedToEmail = ""; 
	var assignedTo = getAssignedToStaff(); 
	if(assignedTo != null) {
		assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
		logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
		if(!matches(assignedToEmail,undefined,"",null)) {
			vToEmail = vToEmail + assignedToEmail + "; ";
		}
	}
}

/* If record is assigned to staff add assigned staff parameters */
var assignedStaff = getAssignedToStaff(); 
if(doStaffEmail == "T" && staffDefault != "") {
	assignedStaff = staffDefault;
}
if(assignedStaff != null) {
staffResult = aa.person.getUser(assignedStaff);
	if (!staffResult.getSuccess())
		{ logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
	if (staffResult.getSuccess()) {
	staffObject = staffResult.getOutput();
	var staffEmail = staffObject.getEmail();
	var staffFirst = staffObject.getFirstName(); 
	var staffLast = staffObject.getLastName(); 
	logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
	}
	var staffName = staffFirst + " " + staffLast;
	if(!matches(staffEmail,undefined,"",null)) {
		addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
		addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
		addParameter(emailParameters,"$$staffNameParam$$",staffName);
	}
}



logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
// aa.print("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

// vToEmail = "tdunn@truepointsolutions.com"; vCcEmail = "tdunn@truepointsolutions.com";
vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
logDebug("Email Sent = " + vEmailSent); 

}
/*------------------------------------------------------------------------------------------------------/
| Program : DUA:Building/star/star/star
| Event   : DocumentUploadAfter
|
| Client  : Placer County, CA
| Usage   : Document Upload After for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|  
|   Notes : TDunn 03/31/2022 Initialized EMSE 3.0 version.\
|           TDunn 04/10 - 04/20 multiple updates.
|           TDunn 06/02/2022 updated 'To' and Cc email addresses for staff
|           TDunn 06/19/2023 added update to Submittal task on document upload.
|           TDunn 09/18/2023 updated backupToEmail for Solar App to SolarApp@placer.ca.gov
|           TDunn 01/26/2024 added rules for wf process BLD_20230501_MAIN
|           TDunn 05/30/2024 updated actions for resubmittal when at Distribution
|           TDunn 09/04/2024 added actions for Revisions on document upload
|           TDunn 10/25/2024 added appStatus updates on documents uploaded and corrected API user.
|           TDunn 11/14/2024 updated Submittal Review and Distribution due date rules
|           TDunn 01/28/2025 updated task and rec status update on resubmit to just 'Received'.
|           TDunn 01/31/2025 updated capStatus to Resubmittal Received.
|           TDunn 03/04/2025 added logic to test for if from Pre-screen for DUA resubmittal via ACA
|           TDunn 03/25/2025 added rules for PC Master wf Process for documents uploaded
|           TDunn 08/29/2025 copied to Non-prod1
|           TDunn 08/30/2025 deployed to Github
|			TDunn 01/02/2026 removed random 're' typo
|           TDunn 07/14/2026 added updating in possession date
|
/------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"JMCKENZIE","KHOBDAY","TDUNN","MHELVICK","JMCKENZI","ADMIN")) {showDebug = 3;}

sendDUAEmails = false;
fileDateCompare = new Date(fileDate);
if(fileDateCompare < edrStartDate) { //edrStartDate variable is set in INCLUDES_CUSTOM_GLOBALS
	sendDUAEmails = true;
	logDebug("<font color='blue'>Will Send DUA Emails if applicable </font>");
} else {logDebug("<font color='red'>Will Not Send DUA Emails</font>");}

publicUserEDR = false;
logDebug("Inside DUA:Building/*/*/* script");
if(doDigEplan && currentUserID == "SVC_AGENT") loadCustomScript("DUA:DIGEPLAN");

// loadCustomScript("DUA_EXECUTE_DIGEPLAN_SCRIPTS_PLN"); /* Example from Menlo Park, may NOT need for this agency */
// Global variables for document management
var newDocModelArray = documentModelArray.toArray();
var docGroupArray = ["BUILDING"];
/* Replace with correct document types */
var docTypeArray = ["Application Attachment","Stormwater Quality Plan","Internal Only"];
var todayDate = dateAdd(null,0);

// Generate notices to staff
//if(publicUser) {
if((publicUser || publicUserEDR == true) && capIDString.indexOf("TMP") == -1) 
{
	logDebug("Inside publicUser if statement block");
	var assignedToStaff = "";
	var report = null;
	var reportName = "Report Name";
	var reportModule = "Building";
	var emailTemplate = "NOTICE_DOCS_UPLOADED_BLD";
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var fileNames = [];	
	var emailParameters = aa.util.newHashtable();
	getRecordParams4Notification(emailParameters); //$$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$.
	getAPOParams4Notification(emailParameters);
	var backupToEmail = "tdunn1025@gmail.com";
	backupToEmail = "cdrait@placer.ca.gov";
	if(appTypeArray[3] == "Solar App")
	{
		backupToEmail = "SolarApp@placer.ca.gov";
	}

	if(matches(capStatus,"Corrections Required","Issued")) 
	{
		if(isTaskActive("Plan Check","BLD_20181201_REVISIONS")) {
			foundStaff = true;
			assignedToStaff = getTaskAssignUser("Plan Check","BLD_20181201_REVISIONS");
			logDebug("Is plan check Revisions for " + assignedToStaff);
		}
		if(isTaskActive("Plan Check","BLD_20181201_MAIN")) {
			assignedToStaff = getTaskAssignUser("Plan Check","BLD_20181201_MAIN");
			logDebug("Is regular Plan Check for " + assignedToStaff);
		}		
		if(!matches(assignedToStaff,null,undefined,"","RETIRED")) {
			staffResult = aa.person.getUser(assignedToStaff);
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
				addParameter(emailParameters,"$$assignedStaffParam$$",assignedToStaff);
				addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
				addParameter(emailParameters,"$$staffNameParam$$",staffName);
				vToEmail = staffEmail;
			}
			else{
				vToEmail = backupToEmail;
			}
		}
		else{
			vToEmail = backupToEmail;
		}
		if(AInfo["Project Office"]== "Auburn") {
			addParameter(emailParameters,"$$officeParam$$","Auburn");
			vCcEmail = "BLDPlanCheck@placer.ca.gov";
		}		
		if(AInfo["Project Office"] == "Tahoe") {
			addParameter(emailParameters,"$$officeParam$$","Tahoe");
			vCcEmail = "BLDTahoe@placer.ca.gov";
		}
		if(isTaskActive("Revisions","BLD_20181201_MAIN") && isTaskActive("Department Distribution","BLD_20181201_REVISIONS") && !isTaskActive("Plan Check","BLD_20181201_REVISIONS")) {
			vToEmail = vCcEmail;
			vCcEmail = "";
		}
		if(!isTaskActive("Plan Check","BLD_20181201_REVISIONS") && !isTaskActive("Plan Check","BLD_20181201_MAIN") && AInfo["Project Office"]== "Auburn") {
			vToEmail = "OnlineBLDPermits@placer.ca.gov";
			vCcEmail = "BLDPlanCheck@placer.ca.gov";

		}
	}
	// New block for resubmittals on wf process BLD_20230501_MAIN
	//-------------------------------------------------------------
	var preTriageListArray = new Array();
	preTriageList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BTRIAGE"); // get Triage tasks
	preTriageListArray = preTriageList.split(",");
	for(tl in preTriageListArray)
	{
		logDebug("task in array: " + preTriageListArray[tl]);
	}
	
	if(matches(capStatus,"Corrections Required","Submittal Incomplete","Responses Received"))
	{
		logDebug("Inside first if for matches capStatus");
		if(isTaskActive("Submittal Review","BLD_20230501_MAIN"))
		{
			logDebug("Inside matches active task");
			if(isTaskStatus("Submittal Review","Pending Resubmittal","BLD_20230501_MAIN"))
			{
				logDebug("Inside matches task status");
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_20230501_MAIN");
				updateTask("Submittal Review","Received","Document uploaded following a Submittal Incomplete status. Updated by script","");
				updateAppStatus("Received","Document uploaded following a Submittal Incomplete status. Updated by script");				
			}
		}
		if(isTaskActive("Distribution","BLD_20230501_MAIN"))
		{
			if(isTaskStatus("Distribution","Pending Resubmittal","BLD_20230501_MAIN"))
			{
				recFromTriage = false;
				for(xx in preTriageListArray)
				{
					failTask = "";
					thisReview = preTriageListArray[xx];
					logDebug("Triage required test, current task: " + thisReview);
					if(isTaskStatus(thisReview,"Corrections Required"))
					{
						failTask = failTask + thisReview + ";";
						recFromTriage = true;
						logDebug("Task with corrections: " + thisReview);
					}
				}
				editTaskDueDate("Distribution",dateAdd(null,1,"Y"),"BLD_20230501_MAIN");
				updateAppStatus("Resubmittal Received","Document uploaded following a Corrections Required/Responses Received status. Updated by script");
				editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));				
				if(recFromTriage)
				{
					updateTask("Distribution","Resubmittal Received","Resubmittal from Pre-screen received. Updated by script","Resubmittal from Pre-screen");
				}
				else {
					var resubNum = getAppSpecific("Resubmittal Number");
					logDebug("Resub Number is " + resubNum);
					if(matches(getAppSpecific("Resubmittal Number"),null,"",undefined,0))
					{
						resubNum = 1;
					}
					updateTask("Distribution","Resubmittal Received","Submittal " + formatResubNum(resubNum) + " received. Updated by script","Submittal " + formatResubNum(resubNum));
				}
				
			}
		}
	}
	//--- End block for BLD_20230501_MAIN -------------------------
	
	// New block for resubmittals on wf process BLD_20231116_REV
	//-------------------------------------------------------------
	logDebug("Should be running rules for Revisions")
	if(matches(capStatus,"Corrections Required","Submittal Incomplete","Responses Received"))
	{
		logDebug("Inside matches capStatus section");
		if(isTaskActive("Submittal Review","BLD_20231116_REV"))
		{
			logDebug("Inside matches active task");			
			if(isTaskStatus("Submittal Review","Pending Resubmittal","BLD_20231116_REV"))
			{
				logDebug("Inside matches task status");
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_20231116_REV");
				updateTask("Submittal Review","Received","Document uploaded following a Submittal Incomplete status. Updated by script","");
				updateAppStatus("Received","Document uploaded following a Submittal Incomplete status. Updated by script");
			}
		}
		if(isTaskActive("Distribution","BLD_20231116_REV"))
		{
			if(isTaskStatus("Distribution","Pending Resubmittal","BLD_20231116_REV"))
			{
				recFromTriage = false;
				for(xx in preTriageListArray)
				{
					failTask = "";
					thisReview = preTriageListArray[xx];
					logDebug("Triage required test, current task: " + thisReview);
					if(isTaskStatus(thisReview,"Corrections Required"))
					{
						failTask = failTask + thisReview + ";";
						recFromTriage = true;
						logDebug("Task with corrections: " + thisReview);
					}
				}
				editTaskDueDate("Distribution",dateAdd(null,1,"Y"),"BLD_20230501_MAIN");
				updateAppStatus("Resubmittal Received","Document uploaded following a Corrections Required/Responses Received status. Updated by script");
				editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));	
				if(recFromTriage)
				{
					updateTask("Distribution","Resubmittal Received","Resubmittal from Pre-screen received. Updated by script","Resubmittal from Pre-screen");
				}
				else {
					var resubNum = getAppSpecific("Resubmittal Number");
					logDebug("Resub Number is " + resubNum);
					if(matches(getAppSpecific("Resubmittal Number"),null,"",undefined,0))
					{
						resubNum = 1;
					}					
					updateTask("Distribution","Resubmittal Received","Submittal " + formatResubNum(resubNum) + " received. Updated by script","Submittal " + formatResubNum(resubNum));
				}		
			}
		}
	}
	
	//--- End block for BLD_20231116_REV -------------------------

	// New block for resubmittals on wf process BLD_DEFERRED_20240710
	//-------------------------------------------------------------
	logDebug("Should be running rules for Deferred")
	if(matches(capStatus,"Corrections Required","Submittal Incomplete","Responses Received"))
	{
		logDebug("Inside matches capStatus section");
		if(isTaskActive("Submittal Review","BLD_DEFERRED_20240710"))
		{
			logDebug("Inside matches active task");			
			if(matches(capStatus,"Submittal Incomplete"))
			{
				logDebug("Inside matches task status");
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_DEFERRED_20240710");
				updateTask("Submittal Review","Received","Document uploaded following a Submittal Incomplete status. Updated by script","");
				updateAppStatus("Received","Document uploaded following a Submittal Incomplete status. Updated by script");
			}
			if(matches(capStatus,"Corrections Required") && isTaskStatus("Building Plan Check","Corrections Required","BLD_DEFERRED_20240710"))
			{			
				var resubNum = getAppSpecific("Resubmittal Number");
				logDebug("Resub Number is " + resubNum);
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_DEFERRED_20240710");
				editTaskSpecific("Submittal Review","Possession Start Date",dateAdd(null,0,"Y"));
				updateTask("Submittal Review","Resubmittal Received","Submittal " + formatResubNum(resubNum) + " received. Updated by script","Submittal " + formatResubNum(resubNum));
				updateAppStatus("Resubmittal Received","Document uploaded following a Corrections Required/Responses Received status. Updated by script");	
			}
		}
	}
	
	//--- End block for BLD_DEFERRED_20240710 -------------------------
	
	// New block for resubmittals on wf process BLD_PLNCHK_20241222
	//-------------------------------------------------------------	
	logDebug("Should be running rules for Master")
	if(matches(capStatus,"Corrections Required","Submittal Incomplete","Responses Received"))
	{
		logDebug("Inside matches capStatus section");
		if(isTaskActive("Submittal Review","BLD_PLNCHK_20241222"))
		{
			logDebug("Inside matches active task");			
			if(isTaskStatus("Submittal Review","Pending Resubmittal","BLD_PLNCHK_20241222"))
			{
				logDebug("Inside matches task status");
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_PLNCHK_20241222");
				updateTask("Submittal Review","Received","Document uploaded following a Submittal Incomplete status. Updated by script","");
				updateAppStatus("Received","Document uploaded following a Submittal Incomplete status. Updated by script");
			}
		}
		if(isTaskActive("Distribution","BLD_PLNCHK_20241222"))
		{
			if(isTaskStatus("Distribution","Pending Resubmittal","BLD_PLNCHK_20241222"))
			{

				editTaskDueDate("Distribution",dateAdd(null,1,"Y"),"BLD_20230501_MAIN");
				updateAppStatus("Resubmittal Received","Document uploaded following a Corrections Required/Responses Received status. Updated by script");				
				var resubNum = getAppSpecific("Resubmittal Number");
				logDebug("Resub Number is " + resubNum);
				if(matches(getAppSpecific("Resubmittal Number"),null,"",undefined,0))
				{
					resubNum = 1;
				}
				editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));
				updateTask("Distribution","Resubmittal Received","Submittal " + formatResubNum(resubNum) + " received. Updated by script","Submittal " + formatResubNum(resubNum));
			}
		}
	}	

	//--- End block for BLD_PLNCHK_20241222	--------------------------/

	if(sendDUAEmails && capStatus == "Received") {
		if(AInfo["Project Office"]== "Auburn") {
			addParameter(emailParameters,"$$officeParam$$","Auburn");
			vToEmail = "OnlineBLDPermits@placer.ca.gov";
			vCcEmail = "BLDPlanCheck@placer.ca.gov";

		}
		if(AInfo["Project Office"] == "Tahoe") {
			addParameter(emailParameters,"$$officeParam$$","Tahoe");
			vToEmail = "OnlineBLDPermitsTahoe@placer.ca.gov";
			vCcEmail = "";
			//vToEmail = "cdrait@placer.ca.gov";
		}
	}
	logDebug("Template = " + emailTemplate);
	logDebug("Office = " + AInfo["Project Office"]);
	logDebug("Assigned to staff = " + assignedToStaff);
	logDebug("Params: " + emailParameters + "; to email:" + vToEmail + "; copy to email:" + vCcEmail);
	
	sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,fileNames);

}




/* Template for limiting criteria for generating an upload notification */
//if (publicUser && capIDString.indexOf("TMP") == -1) {
if(currentUserID == "TDUNN") {
	
	/* Generatng report and notification standard variables */
	var report = null;
	var reportName = "Report Name";
	var reportModule = "Building";
	var emailTemplate = "TBD_NOTICE_TO_APPLICANT";
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var fileNames = [];	
	var emailParameters = aa.util.newHashtable();
	getRecordParams4Notification(emailParameters); //$$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$.
	getAPOParams4Notification(emailParameters);
	var backupToEmail = "tdunn@truepointsolutions.com";


	// emailDocUploadNotificationGen(docGroupArrayModule,docTypeArrayModule,emailTemplateName,backupToEmail); /* this is custom function from another agency */
	// var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, fileNames);

}

// Add variables here for actions set
var thisComment = "My comment";
var sampleCriteria = false;

if(sampleCriteria) {
	for (dl in newDocModelArray) {
		logDebug("Document type = " + newDocModelArray[dl]["docCategory"]);
		// activate to enumerate the object elements
		// for (xx in newDocModelArray[dl]) {
			// logDebug("Element name: " + xx + "; Element value: " + newDocModelArray[dl][xx]);
		// }
		// initialize dcoument information variables
		theDocType = newDocModelArray[dl]["docCategory"];
		theFileName = newDocModelArray[dl]["fileName"];
		theDocName = newDocModelArray[dl]["docName"];
		theUploadBy = newDocModelArray[dl]["fileUpLoadBy"];
		theDocDesc = newDocModelArray[dl]["docDescription"];
		if(exists(theDocType,docTypeArray))  {
			if(theDocType == "The doc type to match on") {
				// insert actions here
			}

			logDebug("Found Document type = " + newDocModelArray[dl]["docCategory"]);
			logDebug("File Name is " + newDocModelArray[dl]["fileName"]);
			logDebug("Document name is " + newDocModelArray[dl]["docName"]);
			logDebug("File uploaded by " + newDocModelArray[dl]["fileUpLoadBy"]);
			thisComment = "Document type is " + theDocType + "; File name: " + theFileName + "; Document name: " + theDocName + "; description: " + theDocDesc + "; uploaded by " + theUploadBy;
			// additional actions here
		}
	}

	emailInspDocUploadNotification(docGroupArray,docTypeArray)
}


/*
Common Element names to include in output
=========================================
fileName
fileUpLoadBy
docName
docDescription
=========================================
*/

//email("mckenzie@govpath.tech","noreply@placer.ca.gov","DUA PLACERCO NONPROD1" + capIDString,debug);
sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing Building DUA script " + capIDString, debug);

// External functions
//=============================
function getTaskAssignUser(wfstr) 
{
	// optional process name.
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
			processName = arguments[1]; // subprocess
			useProcess = true;
	}
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess()) {
		wfObj = workflowResult.getOutput();
	} else {
		 logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); 
		 return false; 
	}
	for(i in wfObj) {
		var fTask = wfObj[i];
		if((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*")  && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var taskAssignUser = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
			if (taskAssignUser != null) {
				// re-grabbing for userid.
				wfUserObj = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
				return wfUserObj.getUserID();
			}
		}
	}
	return false;
}


// Example custom function to send notification to staff
function emailInspDocUploadNotification(docGroups,docCategories) {
	logDebug("Inside new function");
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();
	
	for (dl in newDocModelArr) {
		logDebug("Doc cat = " + newDocModelArr[dl]["docCategory"]);
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories)) {
			logDebug("Found doc match for " + newDocModelArr[dl]["docCategory"]);
			// creates document list for this upload session
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}
	
	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "DUA_BUILDING_INSPECTION_REPORT";
		var emailParameters = aa.util.newHashtable();
		// place holder for document attachment parameters
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var assignedToFullName = "";
		var assignedToEmail = "tdunn@truepointsolutions.com";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}	
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);
		
		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}


// Parameter documentation for using this function //
//function createNotificationTPS2(emailTemplate,doContacts,vContactTypes,doLp,vLicType,lpToEmail,doOtherContacts,getOwner,getPrimeAddr,doStaffEmail,addParentID,staffDefault)
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
| getPrimeAddr = set to "Y" or "N" to control if primary address for record is required for the notification parameter list.
| doStaffEmail = set to "Y" or "N" to control if assigned staff is included in the 'to email' list, set to 'T' if staffDefault is to be used as the assignedStaff.
|                Set to W if using assigned to task staff ID.
| addParentID = set to "Y" or "N" to control if parent altId of current record is included in the notification. 
| staffDefault = the email address of the staff member to include in the vToEmail if no staff is assigned to the record. Use userID if toStaffEmail set to 'T'
/------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/




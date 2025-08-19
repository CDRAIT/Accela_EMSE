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
|
/------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"JMCKENZIE","KHOBDAY","TDUNN")) {showDebug = 1;}

logDebug("Inside DUA:Building/*/*/* script");

// loadCustomScript("DUA_EXECUTE_DIGEPLAN_SCRIPTS_PLN"); /* Example from Menlo Park, may NOT need for this agency */
// Global variables for document management
var newDocModelArray = documentModelArray.toArray();
var docGroupArray = ["BUILDING"];
/* Replace with correct document types */
var docTypeArray = ["Application Attachment","Stormwater Quality Plan","Internal Only"];
var todayDate = dateAdd(null,0);

// Generate notices to staff
//if(publicUser) {
if(publicUser && capIDString.indexOf("TMP") == -1) 
{																				   
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

	if(matches(capStatus,"Corrections Required","Issued")) {
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
	
	if(capStatus == "Received") {
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
	if(capStatus == "Submittal Incomplete" && isTaskActive("Submittal Review","BLD_20230501_MAIN"))
	{
		updateTask("Submittal Review","Submittal Received","Document uploaded following a Submittal Incomplete status. Updated by script","");
	}
}

// var sendResult = aa.sendMail(defaultFrom,"cdrait@placer.ca.gov", "", "Testing Building DUA script ", debug);	
//sendResult = aa.sendMail(defaultFrom,"tdunn@truepointsolutions.com", "", "Testing Building DUA script ", debug);	

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

// External functions
//=============================
function getTaskAssignUser(wfstr) {
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
               for (i in wfObj) {
                              var fTask = wfObj[i];
                              if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*")  && (!useProcess || fTask.getProcessCode().equals(processName))) {
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



// Script name:
// WTUA:DIGEPLAN
//WTUA DIGEPLAN BLD_PLACERCO
// TDunn:  01/30/2025 Updated list of plan review tasts for the 'reviewTasksArray'.
logDebug("<font color='green'>Inside WTUA DIGEPLAN BLD</font>");

//EMAILS NOT TRIGGERED: appIncompleteTaskStatus, consolidationResubmitStatus, readyToIssueTaskStatus, issueStatus
//EMAILS TRIGGERED FROM MAIN WTUA-BUILDING SCRIPT


/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables for BLD
var docGroupArrayModule = ["BUILDING","BLD_PLANREVIEW_DPC","DEFERRED","BLD_SOLARAPP"];
var docTypeArrayModule = ["Plans","Supporting Documents"];
var inReviewDocStatus = "In Review";
var reviewCompleteDocStatus = "Review Complete";
var approvedDocStatus = "Approved";

//Generic Workflow Variables
var reviewTasksArray = [];
if(!appMatch("Building/Residential/Master/*"))rTaskList = lookup("PLAN REVIEW - REQUIRED REVIEWS","BLDPERMIT");
if(appMatch("Building/Residential/Master/*")) rTaskList = lookup("PLAN REVIEW - REQUIRED REVIEWS","MASTER");
reviewTasksArray = rTaskList.split(",");
// Original Review Task List Array = ["Initial Planning Review","TRPA Completeness Review","Plan Completeness Review","Planning Review","Engineering and Surveying Review","Environmental Health Review","Fire Review","Environmental Engineering Review","Public Works Review","Air Pollution Control Review","Stormwater and Floodplain Review","TRPA Review","Building Plan Check"];
var reviewTaskResubmitStatus = ["Corrections Required"]; //USED FOR AUTO UPDATE CONSOLIDATION TASK
var reviewTaskApprovedStatus = ["Approved", "Approved Pending Resubmittal"]; //USED FOR AUTO UPDATE CONSOLIDATION TASK
var appIncompleteTask = ["Submittal Review"];
var appIncompleteTaskStatus = ["Submittal Incomplete"]; //Record Status: Submittal Incomplete
var routingTask = ["Distribution"];
var routingStatusArray = ["Distribute"]; //Record Status: In Review
var consolidationTask = "Distribution Reconciliation"; //cannot be an array of tasks
var consolidationResubmitStatus = ["Corrections Required"]; //Record Status: Corrections Required
var readyToIssueTask = ["Process for Issuance"];
var readyToIssueTaskStatus = ["Ready to Issue"]; //Record Status: Final Processing
var issueTask = ["Process for Issuance"];
var issueStatus = ["Issued"]; //Record Status: Issued


var electronicPlans = edrPlansExist(docGroupArrayModule,docTypeArrayModule) ;
if (electronicPlans) logDebug("<font color='green'>electronicPlans: " + electronicPlans + "</font>");
else logDebug("<font color='red'>electronicPlans: false </font>");

var digEplanApprovedReports = digEplanReportExists(digEplanAPIUser,["Approved"]);
if (digEplanApprovedReports) logDebug("<font color='green'> DIGEPLAN APPROVAL REPORTS EXIST FOR THIS RECORD </font>");
else logDebug("<font color='red'> DIGEPLAN APPROVAL REPORTS DO NOT EXIST FOR THIS RECORD </font>");

if(!publicUser) {
	//enter as many of these as there are customizations for doc groups by record type
	var docGroupForDPC = getAppSpecific("DocumentGroupforDPC");
	if(docGroupForDPC == null) {
		if(appMatch("Building/*/*/*")) docGroupForDPC = String("BLD_PLANREVIEW_DPC");
		if(appMatch("Building/Deferred Submittal/*/*")) docGroupForDPC = String("DEFERRED");
		if(appMatch("Building/Residential/PV Solar/*")) docGroupForDPC = String("BLD_SOLARAPP");
		
		editAppSpecific("DocumentGroupforDPC",docGroupForDPC);
	}

	editAppSpecific("RequiredDocumentTypes","");
	var docTypes = String(selectDocConfigByGroupPermissions(docGroupForDPC,[]));
	//logDebug("<font color='green'>docTypes: " + docTypes + "</font>");
	//logDebug("<font color='green'>AdditionalDocumentTypes: " + AInfo["AdditionalDocumentTypes"] + "</font>");
	//logDebug("<font color='green'>docTypes = AdditionalDocumentTypes: " + (docTypes == AInfo["AdditionalDocumentTypes"]) + "</font>");

	if(docTypes != AInfo["AdditionalDocumentTypes"]) {
		logDebug("<font color='blue'>Update Additional Document Types</font>");
		editAppSpecific("AdditionalDocumentTypes",docTypes);
	}
}

/*-----START DIGEPLAN EDR SCRIPTS-----*/

//send email to Applicant on appIncompleteTask/appIncompleteTaskStatus
if(exists(wfTask,appIncompleteTask) && exists(wfStatus,appIncompleteTaskStatus)) {
	//logDebug("<font color='green'>Send App Incomplete Email</font>");
	//emailAppIncompleteNotification(wfTask,wfStatus,wfComment);
}

//update consolidationTask when all required reviewTasksArray tasks have been resulted
if(exists(wfTask,reviewTasksArray) && checkForPendingReviews(reviewTasksArray) == false) {
	//logDebug("<font color='green'>All Reviews resulted</font>");
	if(isTaskActive(consolidationTask) && checkForCorrectionsNeeded(reviewTasksArray,reviewTaskResubmitStatus) == true) {
		logDebug("<font color='green'>All Reviews resulted, update Consolidation Task for Corrections</font>");
		//activateTask(consolidationTask);
		updateTask(consolidationTask,"Ready for Reconciliation - Corrections","Required Reviews are completed. Permit is ready for comments reconciliation for plan review.","");
	}
	if(isTaskActive(consolidationTask) && checkForCorrectionsNeeded(reviewTasksArray,reviewTaskResubmitStatus) == false) {
		logDebug("<font color='green'>All Reviews approved, update Consolidation Task</font>");
		updateTask(consolidationTask,"Ready for Reconciliation - Approved","Required Reviews are completed and approved.","");
	}
}

if(wfTask == "Distribution Reconciliation" && wfStatus == "Create Review Comments Report") {
	try{
	    now = new Date(aa.util.now());
		var customStartTime = now.getTime();
		logDebug("========== Start Custom Code @: " + now.toDateString() + " " + now.toTimeString().replace(" ", "," + now.getMilliseconds()) + "==========");

		var docModels = null;
		processOptions = [];
		processOptions.processName = "Markups.Comment Report";
		logDebug("processOptions.processName: " + processOptions.processName);
		processOptions.description = "Comment Report - API Generated";
		logDebug("processOptions.description: " + processOptions.description);
		if (typeof (digEplanProcesses[processOptions.processName]) == "undefined" || !digEplanProcesses[processOptions.processName].id) {
			logDebug("Invalid processName: " + processOptions.processName);
		} else {
			logDebug("Valid processName: " + processOptions.processName + ", id: " + digEplanProcesses[processOptions.processName].id
				+ ", capId: " + (capId && capId.getCustomID ? capId.getCustomID() : capId)
			);
		}
		digEplan.runCaseProcess(capId, processOptions);

		now = new Date(aa.util.now());
		logDebug("========== Finished Custom Code @: " + now.toDateString() + " " + now.toTimeString().replace(" ", "," + now.getMilliseconds()) + ", Elapsed: " + ((now.getTime() - customStartTime) / 1000) + "==========");
	} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
	}
}

//send email to Applicant on consolidationTask/consolidationResubmitStatus
if(wfTask == consolidationTask && exists(wfStatus,consolidationResubmitStatus)) {
	//logDebug("<font color='green'>Send Corrections Email</font>");
	consolidationResubmitStatusWF = wfStatus;
	//emailCorrectionsNotification(wfStatus,consolidationResubmitStatusWF);
}

//send email to Applicant on readyToIssueTask/readyToIssueTaskStatus
if(exists(wfTask,readyToIssueTask) && exists(wfStatus,readyToIssueTaskStatus)) {
	//logDebug("<font color='green'>Send Ready to Issue Email</font>");
	//emailReadyToIssueNotification(wfTask,wfStatus,wfComment);
	
	//Update Approved Document ACA Permissions on readyToIssueTask/readyToIssueTaskStatus
	if(digEplanApprovedReports) {
		docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
		if(docArray != null && docArray.length > 0) {
			for (d in docArray) {
				//logDebug("<font color='green'>DocumentID: " + docArray[d]["documentNo"] + "</font>");
				//logDebug("<font color='green'>DocumentGroup: " + docArray[d]["docGroup"] + "</font>");
				//logDebug("<font color='green'>DocName: " + docArray[d]["docName"] + "</font>");
				//logDebug("<font color='green'>DocumentID: " + docArray[d]["documentNo"] + "</font>");
				//logDebug("<font color='green'>UploadBy: " + docArray[d]["fileUpLoadBy"] + "</font>");
				if(matches(docArray[d]["docStatus"],approvedDocStatus) && exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) {
					if(docArray[d]["docName"].indexOf("Sheet Report") == -1) {
						logDebug("<font color='green'>*Approved Plan/Document DocumentID: " + docArray[d]["documentNo"] + "</font>");
						//change permissions to hide approved from ACA
							updateAcaDocSecurity(docArray[d],"ADD",[approvedDocStatus]);
						//docArray[d].setDocCategory("Approved Report");
						updateDocResult = aa.document.updateDocument(docArray[d]);
						//logDebug("<font color='blue'>Document " + docArray[d]["documentNo"] + " Category updated</font>");
					}

					if(docArray[d]["docName"].indexOf("Sheet Report") >= 0) {
						logDebug("<font color='green'>*Sheet Report DocumentID: " + docArray[d]["documentNo"] + "</font>");
						//change permissions to hide sheet reports from ACA
							updateAcaDocSecurity(docArray[d],"ADD",[null,approvedDocStatus]);
					}
				}
			}
		}
	}
}

//send email to Applicant on issueTask/issueStatus 
if(exists(wfTask,issueTask) && exists(wfStatus,issueStatus)) {
	//logDebug("<font color='green'>Send Issued Email</font>");
	//emailIssuedNotification(wfStatus,wfStatus,wfComment);
	
	//Update Approved Document ACA Permissions on issueTask/issueStatus
	if(digEplanApprovedReports) {
		docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
		if(docArray != null && docArray.length > 0) {
			for (d in docArray) {
				if(docArray[d]["docStatus"] == approvedDocStatus) {
					//change permissions to show approved docs in ACA
						updateAcaDocSecurity(docArray[d],"REMOVE",[approvedDocStatus]);
				}
				if(docArray[d]["docStatus"] == inReviewDocStatus) {
					docArray[d].setDocStatus(reviewCompleteDocStatus);
					//updateDocResult = aa.document.updateDocument(docArray[d]);
				}
			}
		}
	}
}

//precache refresh for DPC
digEplanPreCache(digEplanSubDomain,capIDString);

synchronizeDocFileNames();

/*-----END DIGEPLAN EDR SCRIPTS-----*/

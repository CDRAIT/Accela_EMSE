/*-----------------------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Deferred Submittal!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Building Deferrred submittals
| wfProcess: BLD_DEFERRED_20240710
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 08/22/2024 created script
|         : TDunn 10/02/2024 added "moveDoc" functionality to 'Process for Issuance' - 'Approved' section
|         : TDunn 12/06/2024 changed plan check hours accumulation to use standard wfHours field.
|         : TDunn 12/12/2024 added logic to assess additiona review time on parent permit.
|         : TDunn 12/20/2024 added updating parent record work desc with deferred work desc
|         : TDunn 03/22/2025 updated payment request to include source of fees on parent.
|         : TDunn 03/25/2025 added logic to remove block final for active Deferred. Remove statement currently remarked out.
|         : TDunn 03/28/2025 added new notifications for Applicant Information Requested
|         : TDunn 04/04/2025 updated task assignment and task due dates
|         : TDunn 04/08/2025 added rules for setting Submittal Review due dates for manual 'Received' status
|         : TDunn 04/24/2025 added Signature Requested to workflow process
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/31/2025 deployed to Github
|         : TDunn 12/26/2025 removed getTaskAssignUserHistTD() function script and added to INCLUDES_CUSTOM
|         : TDunn 12/26/2025 corrected parameters for call to getTaskAssignUserHistTD
|         : TDunn 03/05/2026 added Approval notification to applicant, owner
|         : TDunn 03/19/2026 deployed to production
|
\-------------------------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"TDUNN")) {showDebug = 1;}

var pCapId = null;
var dCapId = capId;
var planCheckStaff = "";
var thisCheckType = "Full Review";
var pcheckType = "Full";
var dueDateRecType = "";
var dPcheckType = getAppSpecific("Plan Check Type");
var resubNum = 0;
var addNumDays = 1;

logDebug("Processing rules for workflow process 'BLD_DEFERRED_20240710'");
if(getParent() != null && getParent() != false)
{
	logDebug("Parent found");
	pCapId = getParent();
	pCapIDString = pCapId.getCustomID();
	pCap = aa.cap.getCap(pCapId).getOutput();
	pappTypeResult = pCap.getCapType();
	pappTypeAlias = pappTypeResult.getAlias();
	pappTypeString = pappTypeResult.toString();
	pappTypeArray = pappTypeString.split("/");
	pCapStatus = pCap.getCapStatus();
	logDebug("Parent Type = " + pappTypeString + "; Parent customID = " + pCapIDString);
	pWorkDesc = workDescGet(pCapId);
	currentScope = getAppSpecific("Scope of Work",pCapId);
	parentType = getAppSpecific("Type of Work",pCapId);
	logDebug("parentType = " + parentType + "; currentScope = " + currentScope);
	thisCheckType = getAppSpecific("Plan Check Type",pCapId);
}


if(!matches(dPcheckType,"",null,undefined,false)) thisCheckType = dPcheckType; 	
if(thisCheckType == "Quick Check") pcheckType = "Quick";
if(thisCheckType == "Over the Counter") pcheckType = "OTC";
if(thisCheckType == "Full Review") pcheckType = "Full";

if(pappTypeArray[1] == "Residential") dueDateRecType = "Res" + pcheckType;
if(pappTypeArray[1] == "Commercial") dueDateRecType = "Com" + pcheckType;

if(wfProcess == "BLD_DEFERRED_20240710")
{
	if(wfTask == "Submittal Review")
	{
		logDebug("Running submittal review if clause");
		if(wfStatus == "Submittal Incomplete")
		{
			updateTask("Submittal Review","Pending Resubmittal","Submittal Incomplete. Updated by script","-Pending Resubmittal",wfProcess);
			editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),wfProcess);
			// Submittal Incomplete Notification and status/date updates
			if(checkForContactEmail("Applicant"))
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			}
			var emailTemplate = "NOTICE_BLD_ADDITIONAL_INFORMATION_REQUIRED";
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant,Owner";
			cTypeArray = vContactTypes.split(",");
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; 
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
			getRecordParams4Notification(emailParameters);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
			addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
			addParameter(emailParameters,"$$cdrEmail$$",cdrEmail);
			
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
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
			if(vToEmail != "")
			{
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
			var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
			} else
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. Applicant Request for Information was NOT sent.</b></font><br><br>Please review applicant contact record for a valid email address");
			}				
			// createNotificationTPS2("NOTICE_BLD_ADDITIONAL_INFORMATION_REQUIRED","Y","Applicant","N","","N","N","N","Y","N","N","");
			editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"));
			if(getAssignedToStaff()!= null) 
			{
				capAssignedTo = getAssignedToStaff();
				logDebug("Assigned Tech is " + capAssignedTo);
				assignTask("Submittal Review",capAssignedTo);
			}	
		}
		
		if(wfStatus == "Received")
		{
			logDebug("Inside matches capStatus section");
			if(matches(capStatus,"Submittal Incomplete"))
			{
				logDebug("Inside matches cap status Incomplete");
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_DEFERRED_20240710");
				updateTask("Submittal Review","Received","Manual status update by staff. Updated by script","");
			}
			if(matches(capStatus,"Corrections Required"))
			{
				logDebug("Inside matches cap status Corrections");
				var resubNum = getAppSpecific("Resubmittal Number");
				logDebug("Resub Number is " + resubNum);
				editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),"BLD_DEFERRED_20240710");
				updateTask("Submittal Review","Resubmittal Received","Submittal " + formatResubNum(resubNum) + " received. Updated by script","Submittal " + formatResubNum(resubNum));
				updateAppStatus("Resubmittal Received","Manual task status update by staff. Updated by script");	
			}			
		}			

		if(wfStatus == "Submittal Accepted")
		{
			updateTask("Submittal Review","Submittal Accepted","","",wfProcess);
			resubNum = AInfo["Resubmittal Number"];
			thisTask = "Building Plan Check";
			thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
			if(resubNum <= 1)
			{
				addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,0);
				if(pCapId != null)
				{
					capId = pCapId;
					planCheckStaff = getTaskAssignUserHistTD("Building Plan Check","",pCapId);
					logDebug("Plan check staff: " + planCheckStaff);
					capId = dCapId;
					if(!matches(planCheckStaff,"",false,undefined,null))
					{
						logDebug("Should be assigning task");
						assignTask(thisTask,planCheckStaff,wfProcess);
					}
					else{
						assignTask(thisTask,thisStaff,wfProcess);
					}
						
				}else{
					assignTask(thisTask,thisStaff,wfProcess);
				}					
			}
			if(resubNum > 1)
			{
				addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,1);
				cAssigned = getTaskAssignUserHistTD(thisTask,"");
				logDebug("Building Plan Check " + cAssigned);
				if(!matches(cAssigned,false,"",null,undefined))
				{
					assignTask(thisTask,cAssigned,wfProcess);
				} else{
					assignTask(thisTask,thisStaff,wfProcess);
				}				
			}
			editTaskDueDate(thisTask,dateAdd(null,addNumDays,"Y"),wfProcess);		
		}
	}

	if(wfTask == "Building Plan Check")
	{
		vTotHrs = 0;
		if(matches(wfStatus,"Approved","Corrections Required"))
		{
			logDebug("Hours recorded: " + wfHours);
			if(wfHours > 0)
			{
				vTotHrs = (AInfo["Total Hours Charged"] *1);
				vTotHrs = (vTotHrs *1) + (wfHours * 1);
				editTaskSpecific("Process for Issuance","Total Hours Charged",vTotHrs);
				wfHours = 0;
				logDebug("Total Hours : " + vTotHrs);
				AInfo["Total Hours Charged"] = vTotHrs;
			}
			useTaskSpecificGroupName = true;
			TsiInfo = new Array();
			loadTaskSpecific(TsiInfo,capId);
			newCycle = 0;

			logDebug(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"]);
			if(matches(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"],null,"",undefined))
			{
				editTaskSpecific(wfTask,"Cycle Number",0);
				TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"] = 0;
			}
			newCycle = 1 * TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"];
			newCycle = newCycle + 1;
			editTaskSpecific(wfTask,"Cycle Number",newCycle);
			useTaskSpecificGroupName = false;
					
		}	
		if(wfStatus == "Corrections Required")
		{
			if(checkForContactEmail("Applicant"))
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			}
			// Set and update resubmittal number
			if(matches(AInfo["Resubmittal Number"],null,"",0)) 
			{
				editAppSpecific("Resubmittal Number",1);
				AInfo["Resubmittal Number"] = 1;
			}
			var resubNum = 1 * AInfo["Resubmittal Number"];
			resubNum = resubNum + 1;
			logDebug("Resub Number is " + resubNum);
			editAppSpecific("Resubmittal Number",resubNum);
			//---------------------------------------------
			updateTask("Submittal Review","Pending Resubmittal","Corrections required, pending " + formatResubNum(resubNum) + " Submittal. Updated by script","-Pending " + formatResubNum(resubNum) + " Submittal");
			editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"));
			createNotificationTPS2("NOTICE_BLD_CORRECTIONS REQUIRED","Y","Applicant","N","","N","N","N","Y","N","N","");
		}
		if(wfStatus == "Approved")
		{
			thisStaff = lookup("SDL:BLD Default Assignment","Process for Issuance");
			editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"),wfProcess);
			assignTask("Process for Issuance",thisStaff);
		}

	}
	if(wfTask == "Process for Issuance")
	{
		if(wfStatus == "Payment Requested")
		{
			if(AInfo["Total Hours Charged"] > 0)
			{
				feeQty = AInfo["Total Hours Charged"];
				if(matches(AInfo["Assess Fee"],"Y","YES","Yes")) {addFee("0913","B_RES","FINAL",feeQty,"N",pCapId);}
			}
			showMessage = true;
			comment("Generating payment due notification");
			var emailTemplate = "NOTICE_BUILDING_FEES_DUE";
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant";
			cTypeArray = vContactTypes.split(",");
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			addParameter(emailParameters,"$$projectTypeParam$$","building permit");			
			addParameter(emailParameters,"$$sourceParam$$","Deferred Submittal");
			addParameter(emailParameters,"$$sourceID$$",capIDString);		
			getACARecordParam4Notification(emailParameters,acaSite,pCapId); // returns $$acaRecordUrl$$; 
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters,pCapId);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));
			
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
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
			if(vToEmail != "")
			{
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
			var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
			} else
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. Payment Due notification was NOT sent.</b></font><br><br>Please review applicant contact record for a valid email address");
			}
		}			
		
		if(wfStatus == "Approved")
		{
			if (pCapId != null) 
			{
				var cWorkDesc = workDescGet(capId);
				var typeSuffix = " # ";
				var newWorkDesc = "";
				
				newWorkDesc = pWorkDesc + "\n\n"
				+ "*** " + appTypeArray[1] + typeSuffix + capIDString + " - Complete on " + dateAdd(null,0) + "\n\n" 
				+ "Description: " + cWorkDesc + "\n\n";
				newLength = newWorkDesc.length;
				logDebug("new description character length: " + newLength);
				updateWorkDesc(newWorkDesc,pCapId);
				
				// Determine if this on the last/only Deferred Submittal for parent permit. If true, remove capCondition
				//-------------------------------------------------------------------------------------------------------
				try
				{
					myChildArray = getChildren("Buildng/Deferred Submittal/*/*",pCapId);
					if(myChildArray != null && myChildArray.length > 0) 
					{
						logDebug("Number of Children: " + myChildArray.length);
						var cProcess = "BLD_20231116_REV";
						var isOnly = true;
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
								if(!matches(c_capStatus,"Approved","Withdrawn")) 
								{
									isOnly = false;
								}

							}
						}
						if(isOnly)
						{
							logDebug("Removing prevent final condition on all deferred approved or withdrawn. Removed action currently remarked out");
							// removeCapCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Deferred Submittals are Approved",pCapId);
						}						
					}
				}
				catch(err) 
				{
					logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
					aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing All deferred clear: try error ", err.message);
				}			
			}
			
			// Initiate Move documents with target doc status to the from child to parent pCapId
			if (pCapId != null) 
			{
				var targetStatus = "Approved";
				var newStatus = "Approved Deferred";
				var newDescription = capIDString + " - " + newStatus;
				var docArrEnv = aa.document.getCapDocumentList(capId, "ADMIN");
				var docArr = null;
				var docItem;
				var docsToMove = [];
				var mvRslt;

				if (docArrEnv.success == true) {
					docArr = docArrEnv.output;
			
					for (docItem in docArr) {
						if (docArr[docItem].docStatus == targetStatus) {
							docsToMove.push(docArr[docItem]);
						}
					}
			
					if (docsToMove.length > 0) {
						for (docItem = 0; docItem< docsToMove.length; docItem++) {
							mvRslt = moveDoc(docsToMove[docItem], pCapId, newStatus, newDescription);

							if(mvRslt == 1) logDebug("<font color='blue'>" + docsToMove[docItem].getDocumentNo() + " Doc Moved to " + pCapId.getCustomID() + "</font>");
					
							if (isNaN(mvRslt)) {
								logDebug("Error moving document" + docsToMove[docItem].docName + ": " + String(mvRslt));
							}
						}
					}
				}
				else {
					logDebug("Error getting record documents: " + docArrEnv.errorMessage);
				}
			}	
			else if (pCapId == null) {
			logDebug("No documents moved because there's no destination record.");
			}
			
			/* Notification for Deferred Submittal Approved */
			showMessage = true;
			comment("Generating Notice of Approval");
			var emailTemplate = "NOTICE_BUILDING_REV-DEF_APPROVED";
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant,Owner";
			cTypeArray = vContactTypes.split(",");
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			getACARecordParam4Notification(emailParameters,acaSite,pCapId); // returns $$acaRecordUrl$$;
			addParameter(emailParameters,"$$projectTypeParam$$","building permit");	
			addParameter(emailParameters,"$$sourceParam$$","Deferred Submittal");
			addParameter(emailParameters,"$$sourceID$$",capIDString);
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters,pCapId);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));
			
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
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
			if(vToEmail != "")
			{
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
			var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
			} else
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. Payment Due notification was NOT sent.</b></font><br><br>Please review applicant contact record for a valid email address");
			}			
		}
		
		if(wfStatus == "Applicant Information Requested")
		{
			logDebug("Generating Applicant Information Requested notification");
			var emailTemplate = "APPLICANT_INFO_REQUESTED";
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant,Owner";
			cTypeArray = vContactTypes.split(",");
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; 
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
			getRecordParams4Notification(emailParameters);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
			addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
			addParameter(emailParameters,"$$cdrEmail$$",cdrEmail);
			// Get list of any active preissuance tasks - Not applicable to Deferred Submittals
			var piListParam = "No preissuance requirements for Deferred Submittals";
			// var found = 0;
			// var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
			// preTasksArraySD = preIssueListSD.split(",");	
			// for(thisPI in preTasksArraySD)
			// {
				// cTask = preTasksArraySD[thisPI];
				// logDebug("Tesing if preissuance task " + cTask + " is active");
				// if(isTaskActive(cTask))
				// {	
					// found++;
					// if(found<=1)
					// {
						// piList = cTask;
					// }
					// else if(found > 1)
					// {
						// piList = piList + "; " + cTask;
					// }
				// }
				// if(found > 0)
				// {
					// piListParam = piList;
				// }
			// }
			addParameter(emailParameters,"$$preIssueList$$",piListParam);	
			
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
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
			if(vToEmail != "")
			{
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
			var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
			} else
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. Applicant Request for Information was NOT sent.</b></font><br><br>Please review applicant contact record for a valid email address");
			}
		}
		// Generate signature requested notification
		if(wfStatus == "Signature Requested")
		{
			if(checkForContactEmail("Applicant"))
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			}
			var emailTemplate = "SIG_REQUEST";
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant,Owner";
			cTypeArray = vContactTypes.split(",");
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; 
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
			getRecordParams4Notification(emailParameters);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
			addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
			addParameter(emailParameters,"$$cdrEmail$$",cdrEmail);
			
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
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
			if(vToEmail != "")
			{
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
			var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters,null);
			} else
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. Applicant Request for Information was NOT sent.</b></font><br><br>Please review applicant contact record for a valid email address");
			}			
			//createNotificationTPS2("SIG_REQUEST","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
		}		
	}
}


//===========================================================================
/*---------------------------------------------------------------------------/
| wfProcess = BLD_DEFERRED_20240710 
| Rules:
| On 'Submittal Incomplete' or 'Corrections Required' set Submittal task to 
| 'Pending Resubmittal'
| Assign Building Plan Check to Staff approving Parent Building Plan Check
| Via DUA or DUDA update Submittal task to Submittal Received if 
|'Pending Resubmittal' on Submittal or Corrections Req on Building Plan Check
| Generate standard payment requested notice on 'Payment Requested'
| On PRA when via ACA, when 'Process for Issuance' = 'Payment Requested' update
| status to 'Payment Received' and appStatus to 'Pending Issuance'

/---------------------------------------------------------------------------*/
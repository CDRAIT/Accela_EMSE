/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Residential!Master!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Building Residential records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/22/2024 created script
|         : TDunn 01/14/2024 updated revision rules to exclude creating a revision on a Revision record.
|         : TDunn 01/16/2025 added due date and default task assignment
|         : TDunn 02/12/2025 added presetTSI for Corrections Required at Reconciliation
|         : TDunn 03/27/2025 added rules for Withdrawn at Reconciliation
|         : TDunn 03/27/2025 added revision notification to applicant; added deferred submittal creation and notification
|         : TDunn 03/28/2025 added additional logic and variable to manage processing both the main process and the revision process
|         : TDunn 03/28/2025 added Signature Required and Additional Information notifications.
|         : TDunn 04/17/2025 added Preissuance Pending rules and actions; updated Issued status to 'Approved'
|         : TDunn 04/22/2025 added tracking additional plan review hours and assessing additional plan review fees on parent from Revisions.
|         : TDunn 04/24/2025 corrected issue with Deferred submittal child record creation using wrong record type.
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/31/2025 deployed to Github
|         : TDunn 03/20/2026 reenabled update to Expiration Date and updated period to 120 months for dateAddMonths
|         : TDunn 03/20/2026 deployed to production
|         : TDunn 07/15/2026 added in possession date rules
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"TDUNN","EAFTAHI","MHELVIC"))
{
 	showDebug = 1;
}
logDebug("Running WTUA:Building/Residential/Master ");

loadCustomScript("WTUA:DIGEPLAN");

// Prereq: Application Attachment policy changed to not having download permission for ACA CAP Creator
if(wfTask == "Process for Issuance" && wfStatus == "Approved"){
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput(); 
	for(x in docArray) 
		if(docArray[x].getDocCategory() == "Application Attachment" || (matches(docArray[x].getDocCategory(),"Plans","Supporting Documents","Approved Report") && docArray[x].getDocStatus() == "Approved")){
			/* permission string: 0100000000, activates download only for CAP Creator
			 * setViewRole() sets download permission only 
                         */
			docArray[x].setViewRole("0100000000");
			aa.document.updateDocument(docArray[x]); 
		}
}

logDebug("wfProcess = " + wfProcess);

// Begin new rules for BLD_PLNCHK_20241222 process for Plan Check Only records
// Note: the same workflow is used for Plan Check Revisions and the criteria for
// managing the variations in actions are embedded in this script
//===========================================================================================
if(wfProcess == "BLD_PLNCHK_20241222")
{
	logDebug("Running code for process BLD_PLNCHK_20241222");
	// Initialize defaults and flags
	var closureStaff = "CDRA_UNASSIGNED";
	var pfiStaff = "CDRA_UNASSIGNED";
	var doLimited = false;
	var pcheckType = "Full";
	var dueDateRecType = "";
	var varLookupTable = "SDL:Residential Scope of Work";
	var thisScope = getAppSpecific("Scope of Work");
	var thisType = getAppSpecific("Type of Work");
	var thisCheckType = getAppSpecific("Plan Check Type");
    var srvwListArray = new Array();
	var srvwList = "";
	var clearStatus = "Cleared";
	var failStatus = "Corrections Required";
	var recFromTriage = false;
	var triageReason = "";
	var triageDo = false;
	var triageOne = false;
	var triageTwo = false;
	var triageThree = false;
	var preTriageListArray = new Array();
	preTriageList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BTRIAGE"); // get Triage tasks
	preTriageListArray = preTriageList.split(",");
	var tahoeFlag = false;
	var trpaFlag = "NA";
	var reFlag = "NA";
	var doStormFloodNotice = false;
	var stmfldFlag = "NA";
	var isPlacerFire = false;
	var fDistrict = "";
	var comFire = false;
	var isDriveway = false;
	var dwSlope = getAppSpecific("Slope of Driveway");
	var	includesDW = getAppSpecific("Includes Driveway");
	var hasParent = false
	
	if(matches(AInfo["Project Office"],"Auburn")) { tahoeFlag = true; }

	if(appTypeArray[3] == "Revision")
	{
		if(getParent() != null && getParent() != false)
		{
			logDebug("Parent found");
			pCapId = getParent();
			if(pCapId) hasParent = true;
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
		}		
	}

	// Executing actions for Submittal Review statuses
	//================================================
	if(wfTask == "Submittal Review") 
	{
		useTaskSpecificGroupName = true;
		TsiInfo = new Array();
		loadTaskSpecific(TsiInfo,capId);
		newCycle = 0;
		if(matches(wfStatus,"Submittal Accepted","Submittal Incomplete")) 
		{

			logDebug(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"]);
			if(matches(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"],null,"",undefined))
			{
				editTaskSpecific(wfTask,"Cycle Number",0);
				TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"] = 0;
			}
			newCycle = 1 * TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"];
			newCycle = newCycle + 1;
			editTaskSpecific(wfTask,"Cycle Number",newCycle);
		}
		useTaskSpecificGroupName = false;
		
		if(wfStatus == "Submittal Accepted") 
		// preset TSI for required reviews
		{

			assignThisTask("Distribution",wfProcess);	
			editTaskDueDate("Distribution",dateAdd(null,1,"Y"),wfProcess);
			editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));
			updateTask("Distribution","Submittal Received","Possession Start Date logged by system","",wfProcess);					
		}


		// Submittal Incomplete Notification and status/date updates
		if(matches(wfStatus,"Submittal Incomplete")) 
		{
			if(checkForContactEmail("Applicant"))
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			}
			createNotificationTPS2("NOTICE_BLD_ADDITIONAL_INFORMATION_REQUIRED","Y","Applicant","N","","N","N","N","Y","N","N","");
			updateTask("Submittal Review","Pending Resubmittal","Submittal incomplete. Updated by script","Pending Resubmittal");
			editTaskDueDate("Distribution",dateAdd(null,2,"Y"),wfProcess);
			if(getAssignedToStaff()!= null) 
			{
				capAssignedTo = getAssignedToStaff();
				logDebug("Assigned Tech is " + capAssignedTo);
				assignTask("Distribution",capAssignedTo);
			}
			editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),wfProcess);
		}
			
	}

	// Setting dueDate lookup criteria
	//====================================================================
	pcheckType = "Master"
	dueDateRecType = pcheckType;	
	
	//Distribution
	/* -------------------------------------------------------------
	|  Tasks in the primary Distribution list for plan review cycle:
	|  Tasks with TSI on Distribution task for preset or manual update:
    |  Planning Review,Building Plan Check,Fire Review,TRPA Review, Fire Review - Partner Agency
	|  
	\-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
	if (matches(wfTask, "Distribution") && !matches(wfStatus, "Payment Requested"))
	{		
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
	
	if (matches(wfTask, "Distribution") && matches(wfStatus, "Distribute")) 
	{
		// Rules for activating other review task on Distribution task result 
		var preIssueFlag = false; 
		autoRouteReviewsTD("P", "Y","MASTER");
		if(matches(AInfo["Fire Review - Partner Agency"],"Y","Yes") && !isTaskStatus("Fire Review - Partner Agency","Complete"))
		{
			activateTask("Fire Review - Partner Agency",wfProcess);
			updateTask("Fire Review - Partner Agency","Completion Pending","","-(Preissuance Requirement)",wfProcess);
			assignPreissue("Fire Review - Partner Agency",wfProcess);		
		}	
		// for setting review task dates and staff assignment during autoRouteReviewsTD();
		resubNum = AInfo["Resubmittal Number"];
		if(resubNum <= 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,0);	
		}
		if(resubNum > 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,1);	
		}
		setDueDate("MASTER",addNumDays,wfProcess);
		assignConcurrent("MASTER",wfProcess,resubNum);
		setConcurrentStatusAndPossDate("MASTER",wfProcess);		
	}
	
	// Rules for Distribution/Not Required - Plan Check Only
	if(matches(wfTask, "Distribution") && matches(wfStatus, "Not Required - Plan Check Only"))
	{
		activateTask("Building Plan Check",wfProcess);
		resubNum = AInfo["Resubmittal Number"];
		newStatus = "Submittal Received";
		if(resubNum <= 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,0);	
		}
		if(resubNum > 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,1);
			newStatus = "Resubmittal Received";
		}
		editTaskDueDate("Building Plan Check",dateAdd(null,addNumDays,"Y"),wfProcess);
		editTaskSpecific("Building Plan Check","Possession Start Date",dateAdd(null,0,"Y"));
		updateTask("Building Plan Check",newStatus,"Possession Start date logged. Updated by script","",wfProcess);		
		assignConcurrent("MASTER",wfProcess,resubNum);
		thisStaff = lookup("SDL:BLD Default Assignment","Building Plan Check");
		if(resubNum <= 1)
		{
			assignTask("Building Plan Check",thisStaff,wfProcess);
		}
		if(resubNum > 1)
		{
			cAssigned = getTaskAssignUser("Building Plan Check");
			if(!matches(cAssigned,false,"",null,undefined))
			{
				assignTask("Building Plan Check",cAssigned,wfProcess);
			} else{
				assignTask("Building Plan Check",thisStaff,wfProcess);
			}
		}						
	}
	
	// Distribution/ Not Required - Process for Issuance
	if (matches(wfTask, "Distribution") && matches(wfStatus, "Not Required - Process for Issuance"))
	{
		thisStaff = pfiStaff;
		thisTask = "Process for Issuance";
		cAssigned = getTaskAssignUser(thisTask);
		editTaskDueDate(thisTask,dateAdd(null,2,"Y"),wfProcess);
		editTaskSpecific("Process for Issuance","Possession Start Date",dateAdd(null,0,"Y"));
		updateTask("Process for Issuance","Final Processing","Possession Start date logged. Updated by script","",wfProcess);		
		logDebug("Process for Issuance assigned to " + cAssigned);
		if(!matches(cAssigned,false,"",null,undefined,"ACAPAYMENT"))
		{
			assignTask(thisTask,cAssigned,wfProcess);
		} else{
			assignTask(thisTask,thisStaff,wfProcess);
		}		
	}
	
	// Rules for Payment Requested
	if(matches(wfTask, "Distribution") && matches(wfStatus,"Payment Requested"))
	{
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
		addParameter(emailParameters,"$$projectTypeParam$$","master plan check");			
		addParameter(emailParameters,"$$sourceParam$$","master plan check application");
		addParameter(emailParameters,"$$sourceID$$",capIDString);
		addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
		addParameter(emailParameters,"$$addressLine$$","plan check Only, no associated address");			
		if(appTypeArray[3] == "Revision" && hasParent)
		{
			getACARecordParam4Notification(emailParameters,acaSite,pCapId);
			getRecordParams4Notification(emailParameters,pCapId);
			addParameter(emailParameters,"$$sourceParam$$","master plan check revision");				
		} else{				
			getACARecordParam4Notification(emailParameters,acaSite); 
			getRecordParams4Notification(emailParameters);
		}
		// Parameter returned by getACARecordParam4Notification(emailParameters,acaSite):  $$acaRecordUrl$$;
		// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
		
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
	

	// Planning 
	if(matches(wfTask,"Planning Review"))
	{	
		logDebug("processing Planning Review rules");

	}
	//-- End Planning Review block -------------------------------------------------

	// Rules for updating TSI Distribution and task activation fields when review task is Approved -------------
		
	// Special Actions for individual review tasks
	//==============================================
	// Building Plan Check -------------------------
	if(wfTask == "Building Plan Check")
	{
		if(appTypeArray[3] == "Revision")
		{
			vTotHrs = 0;
			logDebug("Hours recorded: " + wfHours);
			if(wfHours > 0)
			{
				vTotHrs = (AInfo["Total Hours Charged"] *1);
				vTotHrs = (vTotHrs *1) + (wfHours * 1);
				editTaskSpecific("Distribution Reconciliation","Total Hours Charged",vTotHrs);
				logDebug("Total Hours : " + vTotHrs);
				AInfo["Total Hours Charged"] = vTotHrs;
			}
			if(wfStatus == "Approved Pending Resubmittal")
			{
				logDebug("Inside " + wfTask + " when task is " + wfStatus);
			
			}
		}
	}	
	
	// Update Cycle for all review tasks
	if((wfTask.indexOf("Review") > -1 || wfTask == "Building Plan Check") && !matches(wfTask,"Submittal Review","Fire Review - Partner Agency"))
	{
		useTaskSpecificGroupName = true;
		TsiInfo = new Array();
		loadTaskSpecific(TsiInfo,capId);
		newCycle = 0;
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal","Corrections Required")) 
		{
			// for(tt in TsiInfo)
			// {
				// logDebug("TSI: " + tt + " = " + TsiInfo[tt]);
			// }
			logDebug(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"]);
			if(matches(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"],null,"",undefined))
			{
				editTaskSpecific(wfTask,"Cycle Number",0);
				TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"] = 0;
			}
			newCycle = 1 * TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"];
			newCycle = newCycle + 1;
			editTaskSpecific(wfTask,"Cycle Number",newCycle);
			
		}
		useTaskSpecificGroupName = false;
	}
	
	// Rules for updating Dist Recon task when all Plan Review tasks are complete
	if((wfTask.indexOf("Review") > -1 || wfTask == "Building Plan Check") && !matches(wfTask,"Submittal Review","Fire Review - Partner Agency"))
	{
		// set due date and staff assignment
		if(isTaskStatus("Distribution","Distribute"))
		{
			var allRevComplete = true;	
			rtaskListArray = new Array();
			rtaskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "MASTER"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
			rtaskListArray = rtaskList.split(",");
			for(rtl in rtaskListArray)
			{
				rTask = rtaskListArray[rtl];

				if(rTask != wfTask && isTaskActive(rTask,wfProcess))
				{
					allRevComplete = false;
				}
			}
			if(allRevComplete)
			{
				thisStaff = lookup("SDL:BLD Default Assignment","Distribution Reconciliation");
				thisTask = "Distribution Reconciliation";
				editTaskDueDate(thisTask,dateAdd(null,1,"Y"));
				
				resubNum = AInfo["Resubmittal Number"];
				if(resubNum <= 1)
				{
					assignTask(thisTask,thisStaff,wfProcess);
				}
				if(resubNum > 1)
				{		
					cAssigned = getTaskAssignUser(thisTask);
					if(!matches(cAssigned,false,"",null,undefined,"ACAPAYMENT"))
					{
						assignTask(thisTask,cAssigned,wfProcess);
					} else{
						assignTask(thisTask,thisStaff,wfProcess);
					}
				}					
			}
		}
		var distRecStatus = "Ready for Reconciliation - Approved";
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal","Corrections Required")) 
		{
			var reviewListArray = new Array();
			var reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS","MASTER"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
			reviewListArray = reviewList.split(",");
			var noActiveFlag = true;
			for(rvw in reviewListArray)
			{
				cReview = reviewListArray[rvw];
				if(cReview != wfTask)
				{
					if(isTaskActive(cReview)) { noActiveFlag = false; }
				}
			}
			if(noActiveFlag)
			{
				var isCorrection = false;
				for(nc in reviewListArray)
				{
					ncReview = reviewListArray[nc];
					if(isTaskStatus(ncReview,"Corrections Required",wfProcess))
					{
						isCorrection = true;
					}
				}
				if(isCorrection)
				{
					distRecStatus = "Ready for Reconciliation - Corrections";
				}
				editTaskSpecific("Distribution Reconciliation","Possession Start Date",dateAdd(null,0,"Y"));
				updateTask("Distribution Reconciliation",distRecStatus,"Possession Start Date logged by system.","");
			}
		}
	}	
	
	// Distribution Reconciliation -------------------------------------------------
	if(matches(wfTask,"Distribution Reconciliation")) 
	{
		// Increment cycle count
		if(!matches(wfStatus,"Create Review Comments Report","Withdrawn"))
		{
			useTaskSpecificGroupName = true;
			TsiInfo = new Array();
			loadTaskSpecific(TsiInfo,capId);
			newCycle = 0;
			if(matches(wfStatus,"Complete","Corrections Required")) 
			{

				logDebug(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"]);
				if(matches(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"],null,"",undefined))
				{
					editTaskSpecific(wfTask,"Cycle Number",0);
					TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"] = 0;
				}
				newCycle = 1 * TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"];
				newCycle = newCycle + 1;
				editTaskSpecific(wfTask,"Cycle Number",newCycle);
			}
			useTaskSpecificGroupName = false;
		}
		
		if(wfStatus == "Corrections Required")
		{
			if(checkForContactEmail("Applicant"))
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			}
			editTaskSpecific("Distribution","Possession Start Date",dateAdd(null,0,"Y"));
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
			updateTask("Distribution","Pending Resubmittal","Corrections required, pending " + formatResubNum(resubNum) + " Submittal. Updated by script","Pending " + formatResubNum(resubNum) + " Submittal");
		
			//---------------------------------------------
			createNotificationTPS2("NOTICE_BLD_CORRECTIONS REQUIRED","Y","Applicant","N","","N","N","N","Y","N","N","");
			thisTask = "Distribution";
			assignThisTask(thisTask,wfProcess);
			editTaskDueDate("Distribution",dateAdd(null,1,"Y"),wfProcess);
			presetTSIpco("MASTER","Distribution","Approved","Cleared","ThirdStatus");
			if(AInfo["Assess Fee"] != null) {editTaskSpecific("Distribution Reconciliation","Assess Fee",null);}
		}
		
		// Distribution Reconciliation - Complete
		if(wfStatus == "Complete")
		{
			if(isTaskStatus("Distribution","Distribute")) {updateTask("Distribution","Distributed","Updated by script on Distribution Reconciliation Complete","");}
			editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"),wfProcess);
			editTaskSpecific("Process for Issuance","Possession Start Date",dateAdd(null,0,"Y"));
			updateTask("Process for Issuance","Final Processing","Reconciliation 'Complete'. Possession Start Date logged by system","",wfProcess);					
			thisStaff = pfiStaff;
			thisTask = "Process for Issuance";
			cAssigned = getTaskAssignUser(thisTask);
			logDebug("Process for Issuance assigned to " + cAssigned);
			assignThisTask(thisTask,wfProcess);
			
			if(AInfo["Total Hours Charged"] > 0)
			{
				feeQty = AInfo["Total Hours Charged"];
				if(matches(AInfo["Assess Fee"],"Y","YES","Yes") && appTypeArray[3] == "Revision") {addFee("0913","B_RES","FINAL",feeQty,"N",pCapId);}
			}			
			
			// New block for setting reminder/due dates for Preissuance tasks
			var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PRE4MASTER"); // Get list of preissuance tasks
			preTasksArraySD = preIssueListSD.split(",");
			for(thisPI in preTasksArraySD)
			{
				cTask = preTasksArraySD[thisPI];
				logDebug("For setting date, current cTask = " + cTask);
				if(isTaskActive(cTask)) 
				{ 
					editTaskDueDate(cTask,dateAdd(null,1,"Y"),wfProcess); 
					editTaskSpecific(cTask,"Possession Start Date",dateAdd(null,0,"Y"));
					updateTask(cTask,"Awaiting Review","Possession Start Date logged by system","",wfProcess);					
				}
			}
		}
		
		// Distribution Reconciliation - Withdrawn
		if(wfStatus == "Withdrawn")
		{
			if(matches(AInfo["Assess Fee"],"Yes","Y","YES") && AInfo["Total Hours Charged"] > 0 && appTypeArray[3] == "Revision") 
			{
				feeQty = AInfo["Total Hours Charged"];
				addFee("0913","B_RES","FINAL",feeQty,"N",pCapId);
			}
			setTask(wfTask,"N","Y");
			var preIssueListWD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PRE4MASTER"); // Get list of preissuance tasks
			preTasksArrayWD = preIssueListWD.split(",");
			for(thisPI in preTasksArrayWD)
			{
				cTask = preTasksArrayWD[thisPI];
				logDebug("For deactivating, current cTask = " + cTask);
				if(isTaskActive(cTask)) { setTask(cTask,"N","N"); }
			}
			updateAppStatus("Withdrawn","Application withdrawn at Distribution Reconciliation. Updated by script");
		}		
	}

	// Preissuance tasks section ===========================================
	// Preissuance tasks: Fire Review - Partner Agency

	if(wfStatus == "Complete" && wfTask != "Distribution Reconciliation")
	{
		if(matches(wfTask,"Fire Review - Partner Agency"))
		{
			editTaskSpecific("Distribution","Fire Review - Partner Agency","N");
			if(isTaskActive("Process for Issuance"))
			{
				updateAppStatus("Final Processing","All preissuance tasks Complete or inactive. Updated by script");
				editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"),wfProcess);
				editTaskSpecific("Process for Issuance","Possession Start Date",dateAdd(null,0,"Y"));					
				updateTask("Process for Issuance","Final Processing","All preissuance tasks Complete or inactive. Possession Start Date logged by system","",wfProcess);				
			}			
		}
	}

	// Process for Issuance
	if(wfTask == "Process for Issuance") 
	{
		// set cycle number
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
		
		if(wfStatus == "Approved" && appTypeArray[3] != "Revision") 
		{
			logDebug("Updating Approval Date " + dateAdd(null,0));
			editAppSpecific("Issue Date",dateAdd(null,0));
			editAppSpecific("Expiration Date",dateAddMonths(null,120));
			if(trpaFlag.indexOf("Tahoe Regional") > -1)
			{
				editAppSpecific("TRPA Permit Expiration",dateAdd(null,1095));
			}
		}
		if(wfStatus == "Approved" && appTypeArray[3] == "Revision") 
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
			
			logDebug("Updating app status");
			updateAppStatus("Approved","Revision " + capIDString + " Completed. Status updated by script",pCapId);		
			
			// Initiate Move documents with target doc status to the from child to parent pCapId
			if (pCapId != null) 
			{
				var targetStatus = "Approved";
				var newStatus = "Approved Revision";
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
		}		
		
		if(wfStatus == "Payment Requested")
		{
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
			addParameter(emailParameters,"$$projectTypeParam$$","master plan check");			
			addParameter(emailParameters,"$$sourceParam$$","master plan check application");
			addParameter(emailParameters,"$$sourceID$$",capIDString);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
			addParameter(emailParameters,"$$addressLine$$","plan check Only, no associated address");			
			if(appTypeArray[3] == "Revision" && hasParent)
			{
				getACARecordParam4Notification(emailParameters,acaSite,pCapId);
				getRecordParams4Notification(emailParameters,pCapId);
				addParameter(emailParameters,"$$sourceParam$$","master plan check revision");				
			} else{				
				getACARecordParam4Notification(emailParameters,acaSite); 
				getRecordParams4Notification(emailParameters);
			}
			// Parameter returned by getACARecordParam4Notification(emailParameters,acaSite):  $$acaRecordUrl$$;
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
 
				
			
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
			
			// Get list of any active preissuance tasks
			var piListParam = "No active preissuance requirements";
			var found = 0;
			var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PRE4MASTER"); // Get list of preissuance tasks
			preTasksArraySD = preIssueListSD.split(",");	
			for(thisPI in preTasksArraySD)
			{
				cTask = preTasksArraySD[thisPI];
				logDebug("Tesing if preissuance task " + cTask + " is active");
				if(isTaskActive(cTask))
				{	
					found++;
					if(found<=1)
					{
						piList = cTask;
					}
					else if(found > 1)
					{
						piList = piList + "; " + cTask;
					}
				}
				if(found > 0)
				{
					piListParam = piList;
				}
			}
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
		if(wfStatus == "Preissuance Tasks Pending")
		{
			logDebug("Generating Final Processing notification");
			var emailTemplate = "FINAL_PROCESSING";
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
			
			// Get list of any active preissuance tasks
			var piNoticeList = getPreIssuanceListForNotification("SDL:PreissueAlias");
			logDebug("New list is " + piNoticeList);

			
			addParameter(emailParameters,"$$preIssueList$$",piNoticeList);	
			
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
		if(wfStatus == "Signature Requested")
		{
			if(checkForContactEmail("Applicant"))
			{
				showMessage = true;
				comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			}
			createNotificationTPS2("SIG_REQUEST","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
		}		
	}
	/*-------------------------------------------------------------------------------------
	|  Added Revision child process to WTUA:Building/Residential/Master 
	/-------------------------------------------------------------------------------------*/
	// Closure phase-Revisions
	// Create Revision Child Record
	// Notes: created REVISION INFORMATION subgroup with 'Revision' alias, 'Last Revision Number' field, and 'hideRev' field to support this segment
	
	if(wfTask == "Closure")
	{
		if(wfStatus == "Revisions" && appTypeArray[3] != "Revision")
		{
			logDebug("Inside creating revision child record");
			var recName = "Master Plan Revision for " + capIDString;
			var cCapId = createChild("Building","Residential","Master","Revision",recName); 
			var pCapId = capId;
			var newAltID = "";
			var childExt = "-REV";
			var NewSn = getShortNotes(pCapId);
			var pWorkDesc = workDescGet(pCapId);
			// Initialize Last Rev number if null
			if(matches(AInfo["Last Revision Number"],null,"")) 
			{
				editAppSpecific("Last Revision Number",0);
				AInfo["Last Revision Number"] = 0;
			}
			var revNumber = 1 * AInfo["Last Revision Number"];

			logDebug("Child Type is :"+ childExt);
			revNumber = revNumber + 1;
			logDebug("Rev Number is " + revNumber);
			editAppSpecific("Last Revision Number",revNumber);
			var parentID = capIDString;
			logDebug("Current Record Number is " + parentID);
			// newAltID = capIDString + childExt + String(revNumber);
			newAltID = capIDString + childExt + formatRevNumber(revNumber);
			
			aa.cap.updateCapAltID(cCapId, newAltID);	
			logDebug("Child AltID = " + newAltID);
			
			// copyOwnerTPS(pCapId,cCapId);
			var assignedTo = getAssignedToStaff(pCapId); 
			if(assignedTo != null && assignedTo != "") {
				assignCap(assignedTo,cCapId);
			}
			// copyAddresses(pCapId,cCapId);
			// copyParcels(pCapId,cCapId);
			updateAppStatus("Approved - Revision Pending", "Revision " + formatRevNumber(revNumber) + " created by staff. Updated by Script", capId);
			
			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			copyContacts(pCapId,cCapId);
			
			// Auto assign and set due date for Submittal Review
			capId = cCapId;
			assignTask("Submittal Review","PERMIT CENTER_UNASSIGNED","BLD_PLNCHK_20241222");
			editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"),"BLD_PLNCHK_20241222");
			editTaskSpecific("Submittal Review","Possession Start Date",dateAdd(null,0,"Y"),cCapId);
			updateTask("Submittal Review","Received","Possession Start Date logged by system","",wfProcess,cCapId);			

			// Create notification to applicant for new Revision record created
			var vEmailTemplate = "ONLINE_PERMIT_AMENDMENT_SUBMITTED";
			var vEmailSent = false;
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var pCapIDString = capIDString;
			var emailParameters = aa.util.newHashtable();

			// Load parameters for notification
			addParameter(emailParameters,"$$parentAltId$$",pCapIDString);
			addParameter(emailParameters,"$$childaltID$$",newAltID);
			addParameter(emailParameters,"$$recNameParam$$",recName);
			addParameter(emailParameters,"$$amendType$$","Revision");
			addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", pCapId));
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));

			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters); 
			// getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */
			addParameter(emailParameters,"$$addressLine$$","plan Check Only, no associated address");
			/* Get To email contact types */
			var cTypeArray = ["Applicant","Owner"];

			/* Get To emails for contacts */
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
			for (thisCon in conArray) {
				if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
					logDebug(conArray[thisCon]["contactType"]) ;
					getContactParams4Notification(emailParameters, conArray[thisCon]);
					if(!matches(emailParameters.get("$$contactEmail$$"),"",null,undefined,false))
					{
						vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
					}
				}
			}
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + vEmailTemplate + "; emailParameters= " + emailParameters);
			vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,vEmailTemplate,emailParameters, null);
			logDebug("Email was sent: " + vEmailSent);			

			showMessage = true;
			comment("<font size = 4 color=ff000><b>Revision record created. Record number " + newAltID + ".</b></font><br><br>You can navigate to the new record using the Related Records tab.<br>");
		}
		
		/*----------------------------------------------------------------------------------------\
		|  Added Deferred Submittal child process to WTUA:Building/Residential/Master 03/27/2025
		\----------------------------------------------------------------------------------------*/
		// Closure task-Deferred Submittal status
		// Create Deferred Child Record
		// Notes: added 'Deferred Submittal Number' to REVISION INFORMATION subgroup to support this segment	
		if(wfStatus == "Deferred Submittal")
		{
			logDebug("Inside creating deferred submittal child record");
			var recName = "Master Plan Check Deferred Submittal for " + capIDString;
			var cCapId = createChild("Building","Deferred Submittal","NA","NA",recName); 
			var pCapId = capId;
			var newAltID = "";
			var childExt = "-DEF";
			var NewSn = getShortNotes(pCapId);
			var pWorkDesc = workDescGet(pCapId);
			// Initialize Last DEF number if null
			if(matches(AInfo["Deferred Submittal Number"],null,"")) 
			{
				editAppSpecific("Deferred Submittal Number",0);
				AInfo["Deferred Submittal Number"] = 0;
			}
			var defNumber = 1 * AInfo["Deferred Submittal Number"];

			logDebug("Child Type is :"+ childExt);
			defNumber = defNumber + 1;
			logDebug("DEF Number is " + defNumber);
			editAppSpecific("Deferred Submittal Number",defNumber);
			var parentID = capIDString;
			logDebug("Current Record Number is " + parentID);
			newAltID = capIDString + childExt + formatRevNumber(defNumber);
			
			aa.cap.updateCapAltID(cCapId, newAltID);	
			logDebug("Child AltID = " + newAltID);
			
			// copyOwnerTPS(pCapId,cCapId);
			var assignedTo = getAssignedToStaff(pCapId); 
			if(assignedTo != null && assignedTo != "") {
				assignCap(assignedTo,cCapId);
			}
			// copyAddresses(pCapId,cCapId);
			// copyParcels(pCapId,cCapId);	
			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			
			// Generate email notice to parent applicant for new Deferred Submittal application
			var vEmailTemplate = "ONLINE_PERMIT_AMENDMENT_SUBMITTED";
			var pCapIDString = capIDString;
			var vEmailSent = false;
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var emailParameters = aa.util.newHashtable();

			addParameter(emailParameters,"$$parentAltId$$",pCapIDString);
			addParameter(emailParameters,"$$childaltID$$",newAltID);
			addParameter(emailParameters,"$$recNameParam$$",recName);
			addParameter(emailParameters,"$$amendType$$","Deferred Submittal");
			addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", pCapId));
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",pCapId));
			
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
			getRecordParams4Notification(emailParameters); 
			// getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */	
			addParameter(emailParameters,"$$addressLine$$","Master Plan Check Only, no associated address");
			
			/* Get To email contact types */
			var cTypeArray = ["Applicant"];

			/* Get To emails for contacts */
			var conArray = new Array();
			conArray = getContactArrayWithPrimary(capId); 
			for (thisCon in conArray) 
			{
				if (exists(conArray[thisCon]["contactType"],cTypeArray)) 
				{
					logDebug(conArray[thisCon]["contactType"]) ;
					getContactParams4Notification(emailParameters, conArray[thisCon]);
					if(emailParameters.get("$$contactEmail$$") != null) 
					{
						vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
					}
				}
			}
			logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + vEmailTemplate + "; emailParameters= " + emailParameters);
			vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,vEmailTemplate,emailParameters, null);			
			
			showMessage = true;
			comment("<font size = 4 color=ff000><b>Deferred Submittal record created. Record number " + newAltID + ".</b></font><br><br>You can navigate to the new record using the Related Records tab.<br>");
		}	
	}
}





/*============================================================================================================================================================\
NOTES:

\==============================================================================================================================================================*/

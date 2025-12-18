/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!~!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Building Residential records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 05/30/2022 created script
|         : eaftahi 05/30/2022 Changed ACA Document permission,so attachments are downloadable only after Issue 
|         : EAFTAHI 04/17/2023 Added Auto-assign to "Plan Completeness Review" to user "ELECTRONIC UNASSIGNED - AUBURN"
|         : TDunn 04/25/2023 added new workflow control scripting.
|         : TDunn 05/11/2023 added new logic to pre-set TSI for 'Complete' reviews to No.
|         : MHelvick 5/17/2023 added loadCustomScript for WTUA DIGEPLAN, updated document permissions to include Plans and Supporting Documents in Approved status
|         : TDunn 05/23/2023 Modified custom function preSetTSIpco to test for both 'N' and 'No'
|         : TDunn 05/25/2023 Updated pre-setPCO function to suppress triage tasks when cleared/complete on resubmittal.
|         : TDunn 06/02/2023 modified task and status calls to matches changes to task names.
|         : TDunn 06/07/2023 added criteria to force Distribution Reconciliation task to active when triage task 'loop' action status is the last resulted
|         : TDunn 07/05/2023 added 'Building Plan Check Only' override to only activate Building Plan Check on that status.
|         : MBecker 07/27/2023  added script to send out automated email to applicant if PCCP Requred TSI is checked on Planning Review when it's Completed or Plan Check Only.
|         : TDunn 07/28/2023 moved new code by MBecker out of the new wf process criteria 'wrapper' and into a new wrapper using the 'current' default workflow process.
|                            neither the task nor the status referenced in this code exists in the new workflow.
|         : TDunn 07/28/2023 updated function call for new task statuses 'Approved' and 'Approved Pending Resubmittal' for new workflow controls
|         : TDunn 10/28/2023 added section for creating child revision records
|         : TDunn 11/07/2023 updated scripting to match new Planning Review task name and elimination of 'Detailed' planning review.
|                            updated rules and functions to match triage review tasks status names and actions
|         : TDunn 11/08/2023 added new function for formatting current submittal number to use with updateTask 'notes' parameter
|         : TDunn 11/16/2023 changed status update on parent permit for Revision creation.
|         : TDunn 11/28/2023 updated Scope of work rules to account for all Building Residential permits. Update task name to match changes to workflow task list
|         : TDunn 11/29/2023 updated logic for activating Triage tasks based on new scope rules. Updated logic for activating additional reviews or Distribution Reconciliation
|         : TDunn 12/07/2023 added section for creating deferred submittals via workflow Task Inspection status
|                            added parcel attribute based criteria for activating specific tasks.
|         : TDunn 12/08/2023 moved custom functions for workflow to INCLUDES_CUSTOM and removed from WTUA script.
|         : TDunn 01/10/2024 added auto create PCCP child permit and notification.
|         : TDunn 01/26/2024 added setting due dates for : Distribution
|         : TDunn 03/08/2024 cleanup on task activation logic
|         : TDunn 04/01/2024 additions to 'Triage' task logic and rules for addition and changes to Triage tasks
|         : TDunn 04/02/2024 additions to logic and rules for activation of Preissuance tasks
|         : TDunn 04/03/2024 additions for managing actions on updates to Preissuance tasks
|         : TDunn 04/05/2024 removed special status for review tasks adding preissuance tasks and changed logic to run for all statuses
|         : TDunn 04/05/2024 added rule to deselect Public Works Review for non Tahoe project at Submittal preset.
|         : TDunn 05/08/2024 updated logic including Commercial Full review and Commercial Limited for processing new workflow rules
|         : TDunn 05/14/2024 updated adding preissuance note to Traffic Fee Review activation
|         : TDunn 05/30/2024 added logic for activating ADU Review preissuance tasks; added Resubmittal incomplete notice for Distribution task on Incomplete status
|         : TDunn 07/10/2024 added additional logic for manual TSI overrides to defaults and presets
|         : TDunn 07/12/2024 updated rules for individual Review tasks
|         : TDunn 08/14/2024 updated rules for payment request and added additional rules pre-issuance.
|         : TDunn 09/04/2024 added setting preissuance task dates based on Reconciliation complete
|         : TDunn 09/11/2024 added requirements for EER TSI related condition flags.
|         : TDunn 09/20/2024 modified rules for ESD TSI activation of Fire Review task.
|         : TDunn 09/30/2024 fixed issue with Res/Full/Other scopes for presets; added missing sdl lookups for additional record types.
|         : TDunn 10/03/2024 updated scope lookup to type + scope for additional record types
|         : TDunn 10/10/2024 added Revision process for wfProcess == "BLD_20181201_MAIN"
|         : TDunn 10/11/2024 added rules for adding 'stop' conditions on Revision creation.
|         : TDunn 10/18/2024 added scripting for tracking review cycles based on TSI.
|         : TDunn 10/21/2024 added cycle tracking to Submittal Review.
|         : TDunn 10/24/2024 added cycle tracking to Distribution.
|         : TDunn 10/29/2024 added loadCustomScript for converted EMSE 2.0 scripting for BLD_20181201 wfProcesses
|         : TDunn 11/02/2024 added rules for new Stormwater and Flood Control TSI; added notification for Stormwater and Flood Control activation;
|                            added rules for new TSI on Public Works Review task
|         : TDunn 11/06/2024 added rules for Initial Planning 'Plan Review Type' TSI
|         : TDunn 11/07/2024 added rules for 'Complete' on preissuance tasks.
|         : TDunn 11/13/2024 added rules for Fire Review TSI
|         : TDunn 11/14/2024 added rules for review cycle task due dates
|         : TDunn 11/15/2024 added rules for task assignment
|         : TDunn 12/10/2024 added rules for updating Distribution Reconciliation task status when either Readiness/review tasks where all approved or one or more had corrections.
|         : TDunn 12/12/2024 added rules for Planning Review TSI based fee assessment.
|         : TDunn 12/20/2024 modified rules for updating Distribution Reconciliation task status when either Readiness/Review tasks where all approved or one or more had corrections.
|         : TDunn 12/22/2024 added ESD addAppConditions rules based on TSI checkbox fields
|         : TDunn 01/08/2025 restructured due date and task assignment logic for triage tasks
|         : TDunn 01/28/2025 added additional task assignment and due date logic
|         : TDunn 01/30/2025 added rules for no scope, updated rules for Stormwater, fixed issues with Stormwater and Floodplain review and notification.
|         : TDunn 02/05/2025 updated rules for Fire Review and associated TSI
|         : TDunn 02/19/2025 reformatted EVCS section for easier review
|         : TDunn 02/19/2025 updated rules for sending Stormwater and Floodplain notification to send for every activation.
|         : TDunn 02/24/2025 updates to rules for adding conditions based on TSI on task completion.
|         : TDunn 03/04/2025 fixed issue with Closure assignment
|         : TDunn 03/05/2025 added check and update for 'Resubmittal Number' out of sync with actual workflow cycle history
|         : TDunn 03/06/2025 updated notification scripting for Submittal Incomplete and payment requested.
|         : TDunn 03/07/2025 updated notification scripting and created new function 'generateNoticeToStaff' to support notifications to APCP and Stormwater reviewers when reviews activated
|         : TDunn 03/10/2025 Added or updated notifications for corrections required, additional permits required, outstanding preissuance tasks
|         : TDunn 03/12/2025 Added notifications for Applicant Information request, Final processing, Signature requested
|         : TDunn 03/13/2025 Updated Permit issued notification
|         : TDunn 03/17/2025 added notifications to applicant for new Revisions and Deferred created by staff
|         : TDunn 03/21/2025 modified payment requested notification to include source of fee to be paid
|         : TDunn 03/21/2025 updated/added Prevent Final Inspection condition flag for Revisions and Deferred Submittals
|         : TDunn 04/01/2025 updated rules for Building Plan Check assignment and due date for 'Plan Check Only'
|         : TDunn 04/02/2025 updated rules for 'noScope' to force activation of Process for Issuance when no scope is defined and no TSI updated manually
|         : TDunn 04/02/2025 changed condition type to add for Stormwater Floodplain Review Required
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/29/2025 deployed to Github repository
|         : Abe   09/10/2025 Added IT Request# 2548  
|         : TDunn 10/02/2025 added new ESD Improvement plan req notification
|         : TDunn 11/05/2025 added dynamic CDR Project Office email parameter for notifications.
|         : TDunn 11/05/2025 updated multiple notifications to accommodate addition of project office email parameter.
|         : TDunn 12/05/2025 moved setting issued dates to 'Signature Requested' from 'Issued' status a process issuance
|         : TDunn 12/09/2025 added 'firstIssuedDate' to sections setting issued date
|         : TDunn 12/17/2025 added updating Plan Check Type ASI based on Building Plan Check TSI 'Plan Check Type Override' value
|
/---------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"TDUNN","EAFTAHI","MHELVIC"))
{
 	showDebug = 1;
}
logDebug("Running WTUA:Building ... ");

if(doDigEplan) loadCustomScript("WTUA:DIGEPLAN");

// Prereq: Application Attachment policy changed to not having download permission for ACA CAP Creator
if(wfTask == "Process for Issuance" && wfStatus == "Issued"){
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput(); 
	for(x in docArray) 
		//IT Request# 2548
		if((!(matches(docArray[x].getDocCategory(),"Internal Only","Comment Report")) && docArray[x].getDocStatus() == "Approved")){
		//if(docArray[x].getDocCategory() == "Application Attachment" || (matches(docArray[x].getDocCategory(),"Plans","Supporting Documents","Approved Report") && docArray[x].getDocStatus() == "Approved")){
			/* permission string: 0100000000, activates download only for CAP Creator
			 * setViewRole() sets download permission only 
                         */
			docArray[x].setViewRole("0100000000");
			aa.document.updateDocument(docArray[x]); 
		}
}

if(wfTask == "Distribution" && wfStatus == "Distribute" && isTaskActive("Plan Completeness Review") && AInfo["Project Office"] == "Auburn") {
    logDebug("******* TASK ACTIVE:" + isTaskActive("Plan Completeness Review"));
    assignTask("Plan Completeness Review", "ELECTRONIC UNASSIGNED - AUBURN");
}

logDebug("wfProcess = " + wfProcess);
//Workflow process criteria added by TDunn, 07/28/2023
// Rules for 'current' workflow
if(wfProcess == "BLD_20181201_DISTRIBUTION")
{
	// Added by MBecker
    if (
      wfTask == "Planning Review" &&
      matches(wfStatus, "Complete", "Plan Check Only") &&
      AInfo["PCCP Required"] == "Yes"
    ) 
	{
      logDebug("Sending PCCP Automated notification email...");
      createNotificationTPS2(
        "PCCP_REQ_NOTIFICATION",
        "Y",
        "Applicant",
        "N",
        "N",
        "N",
        "N",
        "N",
        "Y",
        "N",
        "N",
        ""
        );
    }
	if(matches(wfTask,"Planning Review"))
	{	
		logDebug("processing Planning Review rules");
		logDebug("PCCP Required = " + AInfo["PCCP Required"]);
		if(matches(appTypeArray[1],"Commercial","Residential") && AInfo["PCCP Required"] == "Yes")			
		{
			logDebug("Inside appTypeArray section for Planning Review");
			cCapId = childGetByCapType("PCCP/*/*/*");
			if (matches(cCapId,null,undefined,false))
			{
				cCapId = createChild("PCCP","Land Conversion Authorization","NA","NA",capName);
				cCapIDString = cCapId.getCustomID();
				createPCCPNotification("PCCP_NOTIFICATION",cCapIDString);
				showMessage = true;
				comment("<font size = 3 color=ff000><b>This project is within the PCCP Plan Area. A PCCP record " + cCapId.getCustomID() + " has been created and must be authorized prior to permit completion</b></font>");
			}
			if(!matches(cCapId,null,undefined,false))
			{
				editTaskSpecific("Planning Review", "PCCP Record Number",cCapId.getCustomID());
			}
		}
	}
	// Run converted EMSE 2.0 script WTUA:Building/*/*/*
	logDebug("Loading custom script for BLD-20181201 wfProcesses");
	include("WTUA4BLD20181201MAIN");
}


// Begin new rules for Distribution logic for Building Permits
//=======================================================================
if(wfProcess == "BLD_20230501_MAIN")
{
	logDebug("Running code for process BLD_20230501_MAIN");
	// Initialize defaults and flags
	var closureStaff = "CDRA_UNASSIGNED";
	var pfiStaff = "CDRA_UNASSIGNED";
	var defaultStaff = "";
	var cdrEmail = "OnlineBLDPermits@placer.ca.gov";
	var stmTemplate = "TASK_REVIEW_STMWTR";
	var apcdTemplate = "TASK_REVIEW_APCD";
	var arpTemplate = "NOTICE_BLD_ADDITIONAL_PERMIT_REQUIRED"
	var stmToEmail = "StormWtrQuality@placer.ca.gov";
	var apcdToEmail = "pcapcd-aqsq@placer.ca.gov";
	var doLimited = false;
	var pcheckType = "Full";
	var dueDateRecType = "";
	var noScope = false;
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
	var doStormFloodNotice = true;
	var sentStormNotice = false;
	var stmfldFlag = "NA";
	var isPlacerFire = false;
	var fDistrict = "";
	var comFire = false;
	var isDriveway = false;
	var dwSlope = getAppSpecific("Slope of Driveway");
	var	includesDW = getAppSpecific("Includes Driveway");
	if(matches(AInfo["Project Office"],"Auburn")) { tahoeFlag = true; }
	if(matches(AInfo["Project Office"],"Tahoe")) { cdrEmail = "TahoeCounter@placer.ca.gov"; }
	if(!matches(AInfo["ParcelAttribute.COUNTYPROP"],null,undefined,false)) { reFlag = AInfo["ParcelAttribute.COUNTYPROP"]; }	
	if(!matches(AInfo["ParcelAttribute.TRPA"],null,undefined,false)) { trpaFlag = AInfo["ParcelAttribute.TRPA"]; }
	if(!matches(AInfo['ParcelAttribute.STRFLOODPLAIN'],null,undefined,false)) { stmfldFlag = AInfo['ParcelAttribute.STRFLOODPLAIN']; }
	logDebug("TRPA flag = " + trpaFlag + "; Real Estate flag = " + reFlag + "; Storm/Floodplain flag = " + stmfldFlag);
	fDistrict = AInfo["ParcelAttribute.FIREINSP"];
	logDebug("Fire District = " + fDistrict);
	if(fDistrict.indexOf("Placer County Fire") > -1)
	{
		isPlacerFire = true;
	}
	logDebug("Include DW: " + includesDW + "; Slope: " + dwSlope + "; Placer Fire: " + isPlacerFire)
	if(matches(includesDW,"Y","YES","Yes") && dwSlope >= 16)
	{
		isDriveway = true;
	}
	// Set scopes lookup for review TSI presets
	if(appTypeArray[2] == "Limited") 
	{
		varLookupTable = "SDL:OTC Scope of Work";
		thisScope = thisType + "|" + getAppSpecific("Scope of Work");
		logDebug("this scope for Res limited = " + thisScope);
	}
	if(appTypeArray[3] == "Residential<3000") 
	{
		varLookupTable = "SDL:Residential 3000 Scope of Work";
	}
	if(appTypeArray[3] == "Residential>3000") 
	{
		varLookupTable = "SDL:Residential 3000plus Scope of Work";
	}
	if(appTypeArray[3] == "Tract > 3000") 
	{
		varLookupTable = "SDL:Tract 3000plus Scope of Work";
		thisScope = thisType + "|" + getAppSpecific("Scope of Work");
		logDebug("this scope for Tract >3000 = " + thisScope);		
	}
	if(appTypeArray[3] == "Tract < 3000") {
		varLookupTable = "SDL:Tract 3000 Scope of Work";
		thisScope = thisType + "|" + getAppSpecific("Scope of Work");
		logDebug("this scope for tract <3000 = " + thisScope);			
	}
	
	if(appTypeArray[3] == "Solar App") {varLookupTable = "SDL:SolarApp Scope of Work";}
	if(appTypeArray[2] == "Plan Check Only")
	{
		if(appTypeArray[3] == "Master < 3000") {varLookupTable = "SDL:Residential Master<3000";}
		if(appTypeArray[3] == "Master > 3000") {varLookupTable = "SDL:Residential Master>3000";}
	}
	if(appTypeArray[1] == "Commercial")
	{
		comFire = true;
		if(appTypeArray[2] == "Full Review") 
		{
			varLookupTable = "SDL:Commercial Full Review Scope of Work";
			thisScope = thisType + "|" + getAppSpecific("Scope of Work");
			logDebug("this scope for commercial full = " + thisScope);
		}
		if(appTypeArray[2] == "Limited") 
		{
			varLookupTable = "SDL:Commercial Limited Scope of Work";
			thisScope = thisType + "|" + getAppSpecific("Scope of Work");
			logDebug("this scope for commercial limited = " + thisScope);
		}
	}
	if(varLookupTable == "SDL:Residential Scope of Work")
	{
		thisScope = thisType + "|" + getAppSpecific("Scope of Work");
		logDebug("Compound scope to this Res full other = " + thisScope);
	}
	// Lookup required reviews based on scope
	lkupFail = false;
	srvwList = lookup(varLookupTable,thisScope);
	if(matches(srvwList,"",undefined,false,null,"NA"))
	{
		//showMessage = true; 
		//comment("<font size = 4 color=ff000><b>No review list found for " + thisScope + ". Please review the Type of Work and Scope of work for this project.</b></font><br><br>"); 
		srvwList = "NA";
		noScope = true;
	}

	srvwListArray = srvwList.split(",");
	// Preset required triage flags
	for(xx in preTriageListArray)
	{
		thisReview = preTriageListArray[xx];
		logDebug("Triage required test, current task: " + thisReview);
		if(exists(thisReview,srvwListArray))
		{
			triageDo = true;
			if(thisReview == "Initial Planning Review") {triageOne = true;}
			if(thisReview == "Plan Completeness Review") {triageTwo = true;}
			if(thisReview == "TRPA Completeness Review") {triageThree = true;}
		}
	}
	//Remarked out 'universal 'preset' for TRPA tasks to avoid resetting a manual override.
	// if(trpaFlag.indexOf("Tahoe Regional") > -1)
	// {
		// editTaskSpecific("Distribution","TRPA Review","Y");
		// editTaskSpecific("Distribution","TRPA Completeness Review","Y");
		// triageThree = true;	
	// }
	logDebug("triageOne = " + triageOne + "; triageTwo = " + triageTwo + "; triageThree = " + triageThree);

	// Setting dueDate lookup criteria
	//=====================================================================
	if(appTypeArray[1] == "Residential")
	{
		if(appTypeArray[2] == "Full Review") 
		{
			pcheckType = "Full";
			if(thisCheckType == "Quick Check") pcheckType = "Quick";
			if(thisCheckType == "Over the Counter") pcheckType = "OTC"
			dueDateRecType = "Res" + pcheckType;
		}
		if(appTypeArray[2] == "Limited") 
		{
			pcheckType = "Quick";
			if(thisCheckType == "Full Review") pcheckType = "Full";
			if(thisCheckType == "Over the Counter") pcheckType = "OTC"
			dueDateRecType = "Res" + pcheckType;		
		}
	}	

	if(appTypeArray[1] == "Commercial")
	{
		if(appTypeArray[2] == "Full Review") 
		{
			pcheckType = "Full";
			if(thisCheckType == "Quick Check") pcheckType = "Quick";
			if(thisCheckType == "Over the Counter") pcheckType = "OTC"
			dueDateRecType = "Com" + pcheckType;
		}
		if(appTypeArray[2] == "Limited") 
		{
			pcheckType = "OTC";
			if(thisCheckType == "Full Review") pcheckType = "Full";
			if(thisCheckType == "Quick Check") pcheckType = "Quick";
			dueDateRecType = "Com" + pcheckType;		
		}
	}

	// Initialize variables for managing ESD conditions applied at plan review
	var hasEsdGradingCondition = false;
	var hasEsdImprovementCondition = false;
	var hasDpwEncroachmentCondition = false;
	var hasBmpCondition = false;
	var hasRetainingWallCondition = false;

	var gradingCondComment = "***Grading Permit Final***\n" + "Prior to issuance of Final Occupancy, construction of the associated grading permit, " +
		"ESDXX-XXXXX, must be finaled by the Placer County Engineering & Surveying Division.";
	var improvementCondComment = "***Construction Acceptance of Improvement Plans***\n" + "Prior to issuance of Final Occupancy, construction of the associated site improvement plans, " +
		"ESDXX-XXXXX, must be accepted as complete by the Placer County Engineering & Surveying Division.";
	var encroachmentCondComment = "***Encroachment Permit Final***\n" + "Prior to issuance of Final Occupancy, construction of the associated encroachment permit, " +
		"ENCRXX-XXXXX, must be finaled by the Placer County Department of Public Works.";
	var bmpCondComment = "***BMP CERTIFICATION***\n" + "Prior to issuance of Final Occupancy, certification by a licensed Civil Engineer, QSD, "+
		"or Qualified Stormwater Practitioner (QSP) shall be provided stating that all permanent stormwater quality control measures, "+ 
		"site stabilization and any applicable site design and LID measures have been completed per the approved plan.";
	var retainingCondComment = "***Retaining Wall Certification***\n" + "Site work includes grading for a private land lot and the construction of a retaining wall. "+
		"A special inspection is required at the completion of construction and a report generated by the design engineer that the retaining wall was constructed per the submitted calculations. "+
		"This written and stamped report shall be submitted to the Placer County Engineering & Surveying Division prior to the Final of this permit or the completion of the construction.";
	

	// Executing actions for Submittal Review statuses
	//===================================================
	if(wfTask == "Submittal Review") 
	{
		useTaskSpecificGroupName = true;
		TsiInfo = new Array();
		loadTaskSpecific(TsiInfo,capId);
		newCycle = 0;
		if(matches(wfStatus,"Submittal Accepted","Submittal Incomplete")) 
		{

			logDebug(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"]);
			if(matches(TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"],null,"",undefined,0))
			{
				editTaskSpecific(wfTask,"Cycle Number",0);
				TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"] = 0;
				if(AInfo["Resubmittal Number"] > 1) 
				{ 
					editAppSpecific("Resubmittal Number",1);
					AInfo["Resubmital Number"] = 1;
				}
			}
			newCycle = 1 * TsiInfo[wfProcess + "." + wfTask + "." + "Cycle Number"];
			newCycle = newCycle + 1;
			editTaskSpecific(wfTask,"Cycle Number",newCycle);
		}
		useTaskSpecificGroupName = false;
		
		if(wfStatus == "Submittal Accepted") 
		// preset TSI for required reviews
		{
			for(xy in srvwListArray)
			{
				logDebug("Task = " + srvwListArray[xy])
				editTaskSpecific("Distribution",srvwListArray[xy],"Y");
				if(srvwListArray[xy] == "Public Works Review" && !tahoeFlag)
				{
					editTaskSpecific("Distribution",srvwListArray[xy],"N");
				}
				if(srvwListArray[xy] == "Fire Review" && !isPlacerFire)
				{
					editTaskSpecific("Distribution",srvwListArray[xy],"N");
					editTaskSpecific("Distribution","Fire Review - Partner Agency","Y");
				}				
			}
			if(reFlag == "County Property")
			{
				editTaskSpecific("Distribution","Real Estate Services Review","Y");
			}			
			if(trpaFlag.indexOf("Tahoe Regional") > -1)
			{
				editTaskSpecific("Distribution","TRPA Review","Y");
				editTaskSpecific("Distribution","TRPA Completeness Review","Y");
				triageThree = true;	
			}
			if(stmfldFlag != "NA")
			{
				editTaskSpecific("Distribution","Stormwater and Floodplain Review","Y");
			}
			if(isDriveway && isPlacerFire)
			{
				editTaskSpecific("Distribution","Fire Review","Y");
			}
			if(isDriveway && !isPlacerFire)
			{
				editTaskSpecific("Distribution","Fire Review - Partner Agency","Y");
			}			
			editTaskDueDate("Distribution",dateAdd(null,1,"Y"),wfProcess);
			assignThisTask("Distribution",wfProcess);			
			// assignTask("Distribution","CDRA_UNASSIGNED",wfProcess);
		}
		// End review preset rules -----------------

		// Submittal Incomplete Notification and status/date updates
		if(matches(wfStatus,"Submittal Incomplete")) 
		{
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
			// createNotificationTPS2("NOTICE_BLD_ADDITIONAL_INFORMATION_REQUIRED","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
			
			updateTask("Submittal Review","Pending Resubmittal","Submittal incomplete. Updated by script","Pending Resubmittal");
			editTaskDueDate("Distribution",dateAdd(null,2,"Y"),wfProcess);
			editTaskDueDate("Submittal Review",dateAdd(null,1,"Y"),wfProcess);
		}
		if(wfStatus == "Awaiting Scanning" && currentUserID == "TDUNN")
		{
			logDebug("Inside test segment for Awaiting Scanning and asi email params function");
			emailParameters = aa.util.newHashtable();
			var lkupCrit = "Building";
			var paramSuccess = getPCOasi4BuildingNotification(emailParameters,lkupCrit,capId,capId);
			logDebug("paramSuccesss = " + paramSuccess);
			if(paramSuccess)
			{
				logDebug("Notification params: " + emailParameters);
			}
		}
			
	}

	//Distribution
	/* ---------------------------------------------------------------------------------------------------------------------------------------------------
	|  Tasks in the primary Distribution list for plan review cycle:
	|  Initial Planning Review,TRPA Completeness Review,Plan Completeness Review,Planning Review,Engineering and Surveying Review,Building Plan Check,Environmental Health Review,Fire Review,Environmental Engineering Review,Public Works Review,Air Pollution Control Review,Stormwater and Floodplain Review,TRPA Review
	|  Tasks with TSI on Distribution task for preset or manual update:
	|  Initial Planning Review,TRPA Completeness Review,Plan Completeness Review,Planning Review,Engineering and Surveying Review,Building Plan Check,Environmental Health Review,Fire Review,Environmental Engineering Review,Public Works Review,Air Pollution Control Review,Stormwater and Floodplain Review,TRPA Review, Real Estate Services Review, Traffic Fee
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
		triageDo = false;
		// rules for setting due dates and staff assignment
		if(newCycle <=1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Triage|All",0);
		}
		if(newCycle > 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Triage|All",1);
		}	
		for(xx in preTriageListArray)
		{
			thisReview = preTriageListArray[xx];
			logDebug("Triage TSI set to Yes test, current TSI: " + thisReview + " = " + AInfo[thisReview]);
			if(matches(AInfo[thisReview],"Y","Yes"))
			{
				triageDo = true;
				if(thisReview == "Initial Planning Review") 
				{
					triageOne = true;
				}
				if(thisReview == "Plan Completeness Review") 
				{
					triageTwo = true;
				}
				if(thisReview == "TRPA Completeness Review") 
				{
					triageThree = true;
				}				
			}
			if(!matches(AInfo[thisReview],"Y","Yes","YES"))
			{
				if(thisReview == "Initial Planning Review") {triageOne = false;}
				if(thisReview == "Plan Completeness Review") {triageTwo = false;}
				if(thisReview == "TRPA Completeness Review") {triageThree = false;}				
			}
		}
		// Rules for activating Triage tasks
		if(triageDo)
		{
			// Initial Planning Review Statuses: Cleared, Correction Required
			// Plan Completeness Review statuses: Cleared, Corrections Required
			// TRPA Completeness Review statuses: Cleared, Corrections Required
			if(isTaskStatusNull("Initial Planning Review") && isTaskStatusNull("Plan Completeness Review") && isTaskStatusNull("TRPA Completeness Review"))
			{
				if(!matches(AInfo["Initial Planning Review"],"Y","Yes","YES") && triageOne)
				{
					triageOne = false;
				}
				if(!matches(AInfo["Plan Completeness Review"],"Y","Yes","YES") && triageTwo)
				{
					triageTwo = false;
				}				
				if(!matches(AInfo["TRPA Completeness Review"],"Y","Yes","YES") && triageThree)
				{
					triageThree = false;
				}			
			}
			if(triageOne && triageTwo && triageThree)
			{
				if(isTaskStatusNull("Initial Planning Review") && isTaskStatusNull("Plan Completeness Review") && isTaskStatusNull("TRPA Completeness Review"))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("Initial Planning Review",failStatus) || isTaskStatus("Plan Completeness Review",failStatus) || isTaskStatus("Plan Completeness Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}				
			}
			if(triageOne && triageTwo && !triageThree)
			{
				if(isTaskStatusNull("Initial Planning Review") && isTaskStatusNull("Plan Completeness Review"))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("Initial Planning Review",failStatus) || isTaskStatus("Plan Completeness Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
			}
			if(triageOne && !triageTwo && triageThree)
			{
				if(isTaskStatusNull("Initial Planning Review") && isTaskStatusNull("TRPA Completeness Review"))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("Initial Planning Review",failStatus) || isTaskStatus("TRPA Completeness Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");			
				}
			}			
			if(triageOne && !triageTwo && !triageThree)
			{
				if(isTaskStatusNull("Initial Planning Review"))
				// Initial Planning Review Statuses: Cleared, Correction Required
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("Initial Planning Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");			
				}
			}
			if(!triageOne && triageTwo && triageThree)
			{
				if(isTaskStatusNull("Plan Completeness Review") && isTaskStatusNull("TRPA Completeness Review"))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("Plan Completeness Review",failStatus) || isTaskStatus("TRPA Completeness Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
			}			
			if(!triageOne && triageTwo && !triageThree)
			{
				if(isTaskStatusNull("Plan Completeness Review"))
				// Plan Completeness Review statuses: Cleared, Corrections Required
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("Plan Completeness Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");			
				}
			}
			if(!triageOne && !triageTwo && triageThree)
			{
				if(isTaskStatusNull("TRPA Completeness Review"))
				// TRPA Completeness Review statuses: Cleared, Corrections Required
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");
				}
				if(isTaskStatus("TRPA Completeness Review",failStatus))
				{
					autoRouteReviewsPCO("P", "Y","BLDPERMIT","BTRIAGE");			
				}
			}
			// assign triage tasks and set due dates
			for(xx in preTriageListArray)
			{
				thisReview = preTriageListArray[xx];
				if(matches(AInfo[thisReview],"Y","Yes"))
				{
					if(thisReview == "Initial Planning Review") 
					{
						assignThisTask(thisReview,wfProcess);
						editTaskDueDate(thisReview,dateAdd(null,addNumDays,"Y"),wfProcess);
					}
					if(thisReview == "Plan Completeness Review") 
					{
						defaultStaff = lookup("SDL:BLD Default Assignment",thisReview);
						assignTask(thisReview,defaultStaff,wfProcess);
						editTaskDueDate(thisReview,dateAdd(null,addNumDays,"Y"),wfProcess);
					}
					if(thisReview == "TRPA Completeness Review") 
					{
						assignThisTask(thisReview,wfProcess);
						editTaskDueDate(thisReview,dateAdd(null,addNumDays,"Y"),wfProcess);
					}				
				}
			}
		}
		// Rules for activating other review task on Distribution task result when all triage tasks are cleared
		var preIssueFlag = false; 
		logDebug("Rules for activating other review task on Distribution task result when all triage tasks are cleared")
		logDebug("triageOne: " + triageOne + "; triageTwo: " + triageTwo + "; triageThree: " + triageThree);
		if(!triageOne)
		{
			if((triageThree && !triageTwo && matches(getTaskStatus("TRPA Completeness Review"),"Cleared")) || (!triageThree && triageTwo && matches(getTaskStatus("Plan Completeness Review"),"Cleared")) || (triageThree && triageTwo && matches(getTaskStatus("TRPA Completeness Review"),"Cleared") && isTaskStatus("Plan Completeness Review","Cleared")) || !triageDo)
			{
				preIssueFlag = true;
				autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
				setDueDate("BLDPERMIT",addNumDays,wfProcess);
				assignConcurrent("BLDPERMIT",wfProcess,resubNum);
				
				// Generate required staff notifications for target activated reviews
				if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
				{
					stmDueDate = dateAdd(null,addNumDays,"Y");
					sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
					if(sentStormNotice)
					{
						logDebug("Send Stormwater notification is " + sentStormNotice);
					} else {
						logDebug("Failed to send Stormwater notification");
					}
				}
				if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
				{
					apcdDueDate = dateAdd(null,addNumDays,"Y");
					sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
					if(sentAPCDNotice)
					{
						logDebug("Sent APCD Review notification is " + sentAPCDNotice);
					} else {
						logDebug("Failed to send APCD notification");
					}
				}				
			}			
		}
		if(!triageTwo)
		{
			if((triageOne && !triageThree && matches(getTaskStatus("Initial Planning Review"),"Cleared")) || (!triageOne && triageThree && matches(getTaskStatus("TRPA Completeness Review"),"Cleared")) || (triageOne && triageThree && matches(getTaskStatus("Initial Planning Review"),"Cleared") && isTaskStatus("TRPA Completeness Review","Cleared")) || !triageDo)
			{
				preIssueFlag = true;
				autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
				setDueDate("BLDPERMIT",addNumDays,wfProcess);
				assignConcurrent("BLDPERMIT",wfProcess,resubNum);
				
				// Generate required staff notifications for target activated reviews
				if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
				{
					stmDueDate = dateAdd(null,addNumDays,"Y");
					sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
					if(sentStormNotice)
					{
						logDebug("Send Stormwater notification is " + sentStormNotice);
					} else {
						logDebug("Failed to send Stormwater notification");
					}
				}
				if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
				{
					apcdDueDate = dateAdd(null,addNumDays,"Y");
					sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
					if(sentAPCDNotice)
					{
						logDebug("Sent APCD Review notification is " + sentAPCDNotice);
					} else {
						logDebug("Failed to send APCD notification");
					}
				}
			}
		}		
		if(!triageThree)
		{
			if((triageOne && !triageTwo && matches(getTaskStatus("Initial Planning Review"),"Cleared")) || (!triageOne && triageTwo && matches(getTaskStatus("Plan Completeness Review"),"Cleared")) || (triageOne && triageTwo && matches(getTaskStatus("Initial Planning Review"),"Cleared") && isTaskStatus("Plan Completeness Review","Cleared")) || !triageDo)
			{
				preIssueFlag = true;
				autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
				setDueDate("BLDPERMIT",addNumDays,wfProcess);
				assignConcurrent("BLDPERMIT",wfProcess,resubNum);

				// Generate required staff notifications for target activated reviews
				if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
				{
					stmDueDate = dateAdd(null,addNumDays,"Y");
					sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
					if(sentStormNotice)
					{
						logDebug("Send Stormwater notification is " + sentStormNotice);
					} else {
						logDebug("Failed to send Stormwater notification");
					}
				}
				if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
				{
					apcdDueDate = dateAdd(null,addNumDays,"Y");
					sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
					if(sentAPCDNotice)
					{
						logDebug("Sent APCD Review notification is " + sentAPCDNotice);
					} else {
						logDebug("Failed to send APCD notification");
					}
				}				
			}
		}
		if(triageOne && triageTwo && triageThree && matches(getTaskStatus("Initial Planning Review"),"Cleared") && matches(getTaskStatus("Plan Completeness Review"),"Cleared") && matches(getTaskStatus("TRPA Completeness Review"),"Cleared"))
		{
			preIssueFlag = true;
			autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
			setDueDate("BLDPERMIT",addNumDays,wfProcess);
			assignConcurrent("BLDPERMIT",wfProcess,resubNum);
			
			// Generate required staff notifications for target activated reviews
			if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
			{
				stmDueDate = dateAdd(null,addNumDays,"Y");
				sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
				if(sentStormNotice)
				{
					logDebug("Send Stormwater notification is " + sentStormNotice);
				} else {
					logDebug("Failed to send Stormwater notification");
				}
			}
			if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
			{
				apcdDueDate = dateAdd(null,addNumDays,"Y");
				sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
				if(sentAPCDNotice)
				{
					logDebug("Sent APCD Review notification is " + sentAPCDNotice);
				} else {
					logDebug("Failed to send APCD notification");
				}
			}			
		}

		// When Distribution is Distribute and no default review tasks are defined and no TSI have manually been set to 'Y', force activation of 'Process for Issuance'	
		if(noScope)
		{
			var noTSIYes = true;	
			rtaskListArray = new Array();
			rtaskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BLDPERMIT"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
			rtaskListArray = rtaskList.split(",");
			for(rtl in rtaskListArray)
			{
				rTask = rtaskListArray[rtl];
				if(matches(AInfo[rTask],"Y","Yes","YES"))
				{
					noTSIYes = false;
					noScope = false;
				}
			}
			if(noTSIYes)
			{
				activateTask("Process for Issuance",wfProcess);
				thisTask = "Process for Issuance";
				editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"),wfProcess);
				thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
				assignTask(thisTask,thisStaff,wfProcess);
				logDebug("Process for Issuance assigned to " + thisStaff);					
			}
		}
		
		if(!triageOne && !triageTwo && !triageThree && !noScope)
		{
			autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
			setDueDate("BLDPERMIT",addNumDays,wfProcess);
			assignConcurrent("BLDPERMIT",wfProcess,resubNum);				
			
			preIssueFlag = true;
			
			// Generate required staff notifications for target activated reviews
			if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
			{
				stmDueDate = dateAdd(null,addNumDays,"Y");
				sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
				if(sentStormNotice)
				{
					logDebug("Send Stormwater notification is " + sentStormNotice);
				} else {
					logDebug("Failed to send Stormwater notification");
				}
			}
			if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
			{
				apcdDueDate = dateAdd(null,addNumDays,"Y");
				sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
				if(sentAPCDNotice)
				{
					logDebug("Sent APCD Review notification is " + sentAPCDNotice);
				} else {
					logDebug("Failed to send APCD notification");
				}
			}
		}
		
		// When Distribution is Distribute and all pre-process tasks are complete, test for and activate any applied preissuance tasks
		if(preIssueFlag)
		{
			if(matches(AInfo["Real Estate Services Review"],"Y","Yes") && !isTaskStatus("Real Estate Services Review","Complete"))
			{
				activateTask("Real Estate Services Review",wfProcess)
				updateTask("Real Estate Services Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("Real Estate Services Review",wfProcess);
			}
			if((matches(AInfo["Traffic Fee Review"],"Y","Yes") || matches(AInfo["Traffic Fee"],"Y","Yes")) && !isTaskStatus("Traffic Fee Review","Complete"))
			{
				activateTask("Traffic Fee Review",wfProcess);
				updateTask("Traffic Fee Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("Traffic Fee Review",wfProcess);
			}
			if(matches(AInfo["Placer County Fire Fee"],"Y","Yes") && !isTaskStatus("Placer County Fire Fee Review","Complete"))
			{
				activateTask("Placer County Fire Fee Review",wfProcess);
				updateTask("Placer County Fire Fee Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("Placer County Fire Fee Review",wfProcess);
			}
			if(matches(AInfo["Fire Review - Partner Agency"],"Y","Yes") && !isTaskStatus("Fire Review - Partner Agency","Complete"))
			{
				activateTask("Fire Review - Partner Agency",wfProcess);
				updateTask("Fire Review - Partner Agency","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("Fire Review - Partner Agency",wfProcess);
			}
			// Rules for ADU Reviews activation
			if((matches(AInfo["ADU Required"],"Y","Yes") || matches(AInfo["JADU Required"],"Y","Yes")) && (isTaskStatusNull("ADU Review") || !isTaskStatus("ADU Review","Complete")) && !isTaskActive("ADU Review"))
			{
				activateTask("ADU Review");
				updateTask("ADU Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("ADU Review",wfProcess);
			}
			if((matches(AInfo["ADU Required"],"Y","Yes") || matches(AInfo["JADU Required"],"Y","Yes")) && (isTaskStatusNull("ADU Addressing Review") || !isTaskStatus("ADU Addressing Review","Complete")) && !isTaskActive("ADU Addressing Review"))
			{
				activateTask("ADU Addressing Review");
				updateTask("ADU Addressing Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("ADU Addressing Review",wfProcess);
			}				
		}
	}
	
	// Rules for Distribution/Not Required - Plan Check Only
	if(matches(wfTask, "Distribution") && matches(wfStatus, "Not Required - Plan Check Only"))
	{
		thisTask = "Building Plan Check";
		thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
		resubNum = AInfo["Resubmittal Number"];
		if(resubNum <= 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,0);	
		}
		if(resubNum > 1)
		{
			addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,1);	
		}		
		activateTask("Building Plan Check",wfProcess);
		assignThisTask(thisTask,wfProcess);
		editTaskDueDate(thisTask,dateAdd(null,addNumDays,"Y"));
	}
	
	// Distribution/ Not Required - Process for Issuance
	if (matches(wfTask, "Distribution") && matches(wfStatus, "Not Required - Process for Issuance"))
	{
		editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"),wfProcess);
		thisTask = "Process for Issuance";
		thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
		assignTask(thisTask,thisStaff,wfProcess);
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
		var vContactTypes = "Applicant,Owner";
		cTypeArray = vContactTypes.split(",");
		emailParameters = aa.util.newHashtable();
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		addParameter(emailParameters,"$$projectTypeParam$$","building permit");			
		addParameter(emailParameters,"$$sourceParam$$","permit application");
		addParameter(emailParameters,"$$sourceID$$",capIDString);		
		getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; 
		// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
		getRecordParams4Notification(emailParameters);
		getPrimaryAddressLineParam4Notification(emailParameters);
		addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
		
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
	
	// Rules for activating other reviews from triage task result
	// Test current TSI values for Triage tasks for if manual activation to reset triage task active flags
	logDebug("Rules for activating other reviews from triage task result");
	if(matches(wfTask,"Initial Planning Review","Plan Completeness Review","TRPA Completeness Review"))
	{
		for(xx in preTriageListArray)
		{
			thisReview = preTriageListArray[xx];
			logDebug("Triage TSI set to Yes test, current TSI: " + thisReview + " = " + AInfo[thisReview]);
			if(matches(AInfo[thisReview],"Y","Yes"))
			{
				triageDo = true;
				if(thisReview == "Initial Planning Review") {triageOne = true;}
				if(thisReview == "Plan Completeness Review") {triageTwo = true;}
				if(thisReview == "TRPA Completeness Review") {triageThree = true;}				
			}
			if(!matches(AInfo[thisReview],"Y","Yes"))
			{
				if(thisReview == "Initial Planning Review") {triageOne = false;}
				if(thisReview == "Plan Completeness Review") {triageTwo = false;}
				if(thisReview == "TRPA Completeness Review") {triageThree = false;}				
			}		
		}
		logDebug("triageOne: " + triageOne + "; triageTwo: " + triageTwo + "; triageThree: " + triageThree);
		preIssueFlag = false;
		logDebug("current task: " + wfTask + ", " + wfStatus);
		if(matches(wfTask,"Initial Planning Review"))
		{
			logDebug("Inside Initial Planning Review Clause");
			logDebug("Plan Completeness is cleared = " + isTaskStatus("Plan Completeness Review",clearStatus));		
			logDebug("TRPA Completeness is cleared = " + isTaskStatus("TRPA Completeness Review",clearStatus));			
			if(matches(wfStatus,clearStatus) && ((!triageTwo && !triageThree) || (triageTwo && isTaskStatus("Plan Completeness Review",clearStatus) && !triageThree) || (triageThree && isTaskStatus("TRPA Completeness Review",clearStatus) && !triageTwo) || (triageTwo && isTaskStatus("Plan Completeness Review",clearStatus) && triageThree && isTaskStatus("TRPA Completeness Review",clearStatus))))
			{
				logDebug("Inside cleared clause")
				editTaskSpecific("Distribution","Initial Planning Review","N");			
				editTaskSpecific("Distribution","Plan Completeness Review","N");
				editTaskSpecific("Distribution","TRPA Completeness Review","N");
				AInfo["Plan Completeness Review"] = "No";
				AInfo["Initial Planning Review"] = "No";
				AInfo["TRPA Completeness Review"] = "No";			
				autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
				setDueDate("BLDPERMIT",addNumDays,wfProcess);
				assignConcurrent("BLDPERMIT",wfProcess,resubNum);				
				
				preIssueFlag = true;
				
				// Generate required staff notifications for target activated reviews
				if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
				{
					stmDueDate = dateAdd(null,addNumDays,"Y");
					sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
					if(sentStormNotice)
					{
						logDebug("Send Stormwater notification is " + sentStormNotice);
					} else {
						logDebug("Failed to send Stormwater notification");
					}
				}
				if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
				{
					apcdDueDate = dateAdd(null,addNumDays,"Y");
					sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
					if(sentAPCDNotice)
					{
						logDebug("Sent APCD Review notification is " + sentAPCDNotice);
					} else {
						logDebug("Failed to send APCD notification");
					}
				}
				
				if(matches(AInfo["Planning Review Type"],"Back Office Planning Review")) {assignTask("Planning Review","PLN_UNASSIGNED_BACKOFFICE",wfProcess);}
				if(matches(AInfo["Planning Review Type"],"Counter Planning Review")) {assignTask("Planning Review","PLN_UNASSIGNED_COUNTER",wfProcess);}
			}
		}
		
		if(matches(wfTask,"Plan Completeness Review"))
		{
			logDebug("Inside Plan Completeness Clause");
			logDebug("Initial Planning is cleared = " + isTaskStatus("Initial Planning Review",clearStatus));
			logDebug("TRPA Completeness is cleared = " + isTaskStatus("TRPA Completeness Review",clearStatus));		
			if(matches(wfStatus,clearStatus) && ((!triageOne && !triageThree) || (triageOne && isTaskStatus("Initial Planning Review",clearStatus) && !triageThree) || (triageThree && isTaskStatus("TRPA Completeness Review",clearStatus) && !triageOne) || (triageOne && isTaskStatus("Initial Planning Review",clearStatus) && triageThree && isTaskStatus("TRPA Completeness Review",clearStatus))))
			{
				logDebug("Inside Completeness Review cleared")
				editTaskSpecific("Distribution","Plan Completeness Review","N");
				editTaskSpecific("Distribution","Initial Planning Review","N");
				editTaskSpecific("Distribution","TRPA Completeness Review","N");			
				AInfo["Plan Completeness Review"] = "No";
				AInfo["TRPA Completeness Review"] = "No";
				AInfo["Initial Planning Review"] = "No";
				autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
				setDueDate("BLDPERMIT",addNumDays,wfProcess);
				assignConcurrent("BLDPERMIT",wfProcess,resubNum);				
				
				preIssueFlag = true;
				
				// Generate required staff notifications for target activated reviews
				if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
				{
					stmDueDate = dateAdd(null,addNumDays,"Y");
					sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
					if(sentStormNotice)
					{
						logDebug("Send Stormwater notification is " + sentStormNotice);
					} else {
						logDebug("Failed to send Stormwater notification");
					}
				}
				if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
				{
					apcdDueDate = dateAdd(null,addNumDays,"Y");
					sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
					if(sentAPCDNotice)
					{
						logDebug("Sent APCD Review notification is " + sentAPCDNotice);
					} else {
						logDebug("Failed to send APCD notification");
					}
				}
				
				if(isTaskStatus("Initial Planning Review",clearStatus))
				{
					if(matches(AInfo["Planning Review Type"],"Back Office Planning Review")) {assignTask("Planning Review","PLN_UNASSIGNED_BACKOFFICE",wfProcess);}
					if(matches(AInfo["Planning Review Type"],"Counter Planning Review")) {assignTask("Planning Review","PLN_UNASSIGNED_COUNTER",wfProcess);}					
				}
			}
		}
		if(matches(wfTask,"TRPA Completeness Review"))
		{
			logDebug("Inside TRPA Completeness Clause");
			logDebug("Initial Planning is cleared = " + isTaskStatus("Initial Planning Review",clearStatus));
			logDebug("Plan Completeness is cleared = " + isTaskStatus("Plan Completeness Review",clearStatus));	
			if(matches(wfStatus,clearStatus) && ((!triageOne && !triageTwo) || (triageOne && isTaskStatus("Initial Planning Review",clearStatus) && !triageTwo) || (triageTwo && isTaskStatus("Plan Completeness Review",clearStatus) && !triageOne) || (triageOne && isTaskStatus("Initial Planning Review",clearStatus) && triageTwo && isTaskStatus("Plan Completeness Review",clearStatus))))
			{
				logDebug("Inside TRPA Completeness Review cleared")
				editTaskSpecific("Distribution","Plan Completeness Review","N");
				editTaskSpecific("Distribution","Initial Planning Review","N");
				editTaskSpecific("Distribution","TRPA Completeness Review","N");			
				AInfo["Plan Completeness Review"] = "No";
				AInfo["TRPA Completeness Review"] = "No";			
				AInfo["Initial Planning Review"] = "No";
				autoRouteReviewsTD("P", "Y","BLDPERMIT");
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
				setDueDate("BLDPERMIT",addNumDays,wfProcess);
				assignConcurrent("BLDPERMIT",wfProcess,resubNum);				
				
				preIssueFlag = true;
				
				// Generate required staff notifications for target activated reviews
				if(matches(AInfo["Stormwater and Floodplain Review"],"Y","Yes","YES"))
				{
					stmDueDate = dateAdd(null,addNumDays,"Y");
					sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
					if(sentStormNotice)
					{
						logDebug("Send Stormwater notification is " + sentStormNotice);
					} else {
						logDebug("Failed to send Stormwater notification");
					}
				}
				if(matches(AInfo["Air Pollution Control Review"],"Y","Yes","YES"))
				{
					apcdDueDate = dateAdd(null,addNumDays,"Y");
					sentAPCDNotice = generateNoticeToStaff(apcdTemplate,apcdToEmail,apcdDueDate);
					if(sentAPCDNotice)
					{
						logDebug("Sent APCD Review notification is " + sentAPCDNotice);
					} else {
						logDebug("Failed to send APCD notification");
					}
				}
				
				if(isTaskStatus("Initial Planning Review",clearStatus))
				{
					if(matches(AInfo["Planning Review Type"],"Back Office Planning Review")) {assignTask("Planning Review","PLN_UNASSIGNED_BACKOFFICE",wfProcess);}
					if(matches(AInfo["Planning Review Type"],"Counter Planning Review")) {assignTask("Planning Review","PLN_UNASSIGNED_COUNTER",wfProcess);}					
				}				
			}
		}
	}
	if(preIssueFlag)
	{
		if(matches(AInfo["Real Estate Services Review"],"Y","Yes") && !isTaskStatus("Real Estate Services Review","Complete"))
		{
			activateTask("Real Estate Services Review",wfProcess);
			updateTask("Real Estate Services Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("Real Estate Services Review",wfProcess);
		}
		if((matches(AInfo["Traffic Fee Review"],"Y","Yes") || matches(AInfo["Traffic Fee"],"Y","Yes")) && !isTaskStatus("Traffic Fee Review","Complete"))
		{
			activateTask("Traffic Fee Review",wfProcess);
			updateTask("Traffic Fee Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("Traffic Fee Review",wfProcess);
		}
		if(matches(AInfo["Placer County Fire Fee"],"Y","Yes") && !isTaskStatus("Placer County Fire Fee Review","Complete"))
		{
			activateTask("Placer County Fire Fee Review",wfProcess);
			updateTask("Placer County Fire Fee Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("Placer County Fire Fee Review",wfProcess);
		}
		if(matches(AInfo["Fire Review - Partner Agency"],"Y","Yes") && !isTaskStatus("Fire Review - Partner Agency","Complete"))
		{
			activateTask("Fire Review - Partner Agency",wfProcess);
			updateTask("Fire Review - Partner Agency","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("Fire Review - Partner Agency",wfProcess);
		}
		// Rules for ADU Reviews activation
		if((matches(AInfo["ADU Required"],"Y","Yes") || matches(AInfo["JADU Required"],"Y","Yes")) && (isTaskStatusNull("ADU Review") || !isTaskStatus("ADU Review","Complete")) && !isTaskActive("ADU Review"))
		{
			activateTask("ADU Review");
			updateTask("ADU Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("ADU Review",wfProcess);
		}
		if((matches(AInfo["ADU Required"],"Y","Yes") || matches(AInfo["JADU Required"],"Y","Yes")) && (isTaskStatusNull("ADU Addressing Review") || !isTaskStatus("ADU Addressing Review","Complete")) && !isTaskActive("ADU Addressing Review"))
		{
			activateTask("ADU Addressing Review");
			updateTask("ADU Addressing Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("ADU Addressing Review",wfProcess);
		}
	}
	
	// Rules for activating Distribution Reconciliation task when all triage tasks are resulted when one or more failed
	if(matches(wfTask,"Initial Planning Review") && matches(wfStatus,clearStatus))
	{
		if((!triageThree && triageTwo && isTaskStatus("Plan Completeness Review",failStatus) && !isTaskActive("Plan Completeness Review")) || (!triageTwo && triageThree && isTaskStatus("TRPA Completeness Review",failStatus) && !isTaskActive("TRPA Completeness Review")) || (triageTwo && triageThree && (isTaskStatus("Plan Completeness Review",failStatus) || isTaskStatus("TRPA Completeness Review",failStatus)) && !isTaskActive("Plan Completeness Review") && !isTaskActive("TRPA Completeness Review")))
		{
			activateTask("Distribution Reconciliation",wfProcess);
			updateTask("Distribution Reconciliation","Ready for Reconciliation - Corrections","One or more readiness tasks require corrections.","");
			editTaskDueDate("Distribution Reconciliation",dateAdd(null,1,"Y"),wfProcess);
		}
	}
	if(matches(wfTask,"Plan Completeness Review") && matches(wfStatus,clearStatus))
	{
		logDebug("Inside Plan Completeness for force on Distribution. Status = " + wfStatus );
		logDebug("Initial Planning status is Corrections Required = " + isTaskStatus("Initial Planning Review",failStatus) + " isTaskActive = " + isTaskActive("Initial Planning Review"));
		if((!triageThree && triageOne && isTaskStatus("Initial Planning Review",failStatus) && !isTaskActive("Initial Planning Review")) || (!triageOne && triageThree && isTaskStatus("TRPA Completeness Review",failStatus) && !isTaskActive("TRPA Completeness Review")) || (triageOne && triageThree && (isTaskStatus("Initial Planning Review",failStatus) || isTaskStatus("TRPA Completeness Review",failStatus)) && !isTaskActive("Intial Planning Review") && !isTaskActive("TRPA Completeness Review")))
		{
			activateTask("Distribution Reconciliation",wfProcess);
			updateTask("Distribution Reconciliation","Ready for Reconciliation - Corrections","One or more readiness tasks require corrections.","");
			editTaskDueDate("Distribution Reconciliation",dateAdd(null,1,"Y"),wfProcess);
		}
	}
	if(matches(wfTask,"TRPA Completeness Review") && matches(wfStatus,clearStatus))
	{
		logDebug("Inside TRPA Completeness for force on Distribution. Status = " + wfStatus );
		logDebug("Initial Planning status is Corrections Required = " + isTaskStatus("Initial Planning Review",failStatus) + " isTaskActive = " + isTaskActive("Initial Planning Review"));
		if((!triageTwo && triageOne && isTaskStatus("Initial Planning Review",failStatus) && !isTaskActive("Initial Planning Review")) || (!triageOne && triageTwo && isTaskStatus("Plan Completeness Review",failStatus) && !isTaskActive("Plan Completeness Review")) || (triageOne && triageThree && (isTaskStatus("Initial Planning Review",failStatus) || isTaskStatus("Plan Completeness Review",failStatus)) && !isTaskActive("Intial Planning Review") && !isTaskActive("Plan Completeness Review")))
		{
			activateTask("Distribution Reconciliation",wfProcess);
			updateTask("Distribution Reconciliation","Ready for Reconciliation - Corrections","One or more readiness tasks require corrections.","");
			editTaskDueDate("Distribution Reconciliation",dateAdd(null,1,"Y"),wfProcess);
		}
	}
	// Rules for activating Distribution Reconciliation task when all active triage tasks require corrections
	if(matches(wfTask,"Initial Planning Review") && matches(wfStatus,failStatus))
	{
		if((!triageThree && !triageTwo) || (!triageThree && triageTwo && isTaskStatus("Plan Completeness Review",failStatus) && !isTaskActive("Plan Completeness Review")) || (!triageTwo && triageThree && isTaskStatus("TRPA Completeness Review",failStatus) && !isTaskActive("TRPA Completeness Review")) || (triageTwo && triageThree && (isTaskStatus("Plan Completeness Review",failStatus) && isTaskStatus("TRPA Completeness Review",failStatus)) && !isTaskActive("Plan Completeness Review") && !isTaskActive("TRPA Completeness Review")))
		{
			updateTask("Distribution Reconciliation","Ready for Reconciliation - Corrections","One or more readiness tasks require corrections.","");
			editTaskDueDate("Distribution Reconciliation",dateAdd(null,1,"Y"),wfProcess);
		}
	}
	if(matches(wfTask,"Plan Completeness Review") && matches(wfStatus,failStatus))
	{
		logDebug("Inside Plan Completeness for force on Distribution. Status = " + wfStatus );
		logDebug("Initial Planning status is Corrections Required = " + isTaskStatus("Initial Planning Review",failStatus) + " isTaskActive = " + isTaskActive("Initial Planning Review"));
		if((!triageThree && !triageOne) || (!triageThree && triageOne && isTaskStatus("Initial Planning Review",failStatus) && !isTaskActive("Initial Planning Review")) || (!triageOne && triageThree && isTaskStatus("TRPA Completeness Review",failStatus) && !isTaskActive("TRPA Completeness Review")) || (triageOne && triageThree && (isTaskStatus("Initial Planning Review",failStatus) && isTaskStatus("TRPA Completeness Review",failStatus)) && !isTaskActive("Intial Planning Review") && !isTaskActive("TRPA Completeness Review")))
		{
			updateTask("Distribution Reconciliation","Ready for Reconciliation - Corrections","One or more readiness tasks require corrections.","");
			editTaskDueDate("Distribution Reconciliation",dateAdd(null,1,"Y"),wfProcess);
		}
	}
	if(matches(wfTask,"TRPA Completeness Review") && matches(wfStatus,failStatus))
	{
		logDebug("Inside TRPA Completeness for force on Distribution. Status = " + wfStatus );
		logDebug("Initial Planning status is Corrections Required = " + isTaskStatus("Initial Planning Review",failStatus) + " isTaskActive = " + isTaskActive("Initial Planning Review"));
		if((!triageTwo && !triageOne) || (!triageTwo && triageOne && isTaskStatus("Initial Planning Review",failStatus) && !isTaskActive("Initial Planning Review")) || (!triageOne && triageTwo && isTaskStatus("Plan Completeness Review",failStatus) && !isTaskActive("Plan Completeness Review")) || (triageOne && triageThree && (isTaskStatus("Initial Planning Review",failStatus) && isTaskStatus("Plan Completeness Review",failStatus)) && !isTaskActive("Intial Planning Review") && !isTaskActive("Plan Completeness Review")))
		{
			updateTask("Distribution Reconciliation","Ready for Reconciliation - Corrections","One or more readiness tasks require corrections.","");
			editTaskDueDate("Distribution Reconciliation",dateAdd(null,1,"Y"),wfProcess);
		}
	}
	
	// Block for Planning Review for PCCP creation and TSI Fees ------------------------------
	// Planning Fees: "PARK","P_PLN" for Park Fee; "OSFH-COM","PCCP" for Open Space; "TF-HSG AHF","AFFORDABLE HOUSING" for Affordable; "TF-HSG EAF","AFFORDABLE HOUSING" for Employee Accom
	if(matches(wfTask,"Planning Review"))
	{	
		logDebug("processing Planning Review rules");
		logDebug("PCCP Required = " + AInfo["PCCP Required"]);
		if(matches(appTypeArray[1],"Commercial","Residential") && AInfo["PCCP Required"] == "Yes")			
		{
			logDebug("Inside appTypeArray section for Planning Review");
			cCapId = childGetByCapType("PCCP/*/*/*");
			if (matches(cCapId,null,undefined,false))
			{
				cCapId = createChild("PCCP","Land Conversion Authorization","NA","NA",capName);
				cCapIDString = cCapId.getCustomID();
				createPCCPNotification("PCCP_NOTIFICATION",cCapIDString);
				showMessage = true;
				comment("<font size = 3 color=ff000><b>This project is within the PCCP Plan Area. A PCCP record " + cCapId.getCustomID() + " has been created and must be authorized prior to permit completion</b></font>");
			}
			if(!matches(cCapId,null,undefined,false))
			{
				editTaskSpecific("Planning Review", "PCCP Record Number",cCapId.getCustomID());
			}
		}
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal"))
		{
			if(matches(AInfo["Park Fee Assessed"],"Y","Yes","YES")) { updateFee("PARK","P_PLN","FINAL",1,"N");}
			if(matches(AInfo["Employee Accommodation Fee Applies"],"Y","Yes","YES")) { updateFee("TF-HSG EAF","AFFORDABLE HOUSING","FINAL",1,"N");}
			if(matches(AInfo["Open Space Fee"],"Y","Yes","YES")) { updateFee("OSFH-COM","PCCP","FINAL",1,"N");}
			if(matches(AInfo["Affordable Housing Fee Applies"],"Y","Yes","YES")) { updateFee("TF-HSG AHF","AFFORDABLE HOUSING","FINAL",1,"N");}
		}
	}
	//-- End Planning Review block -------------------------------------------------

	// Rules for other tasks activating preissue tasks ------------------------------
	if(matches(wfTask,"Engineering and Surveying Review"))
	{
		if(fDistrict.indexOf("Placer County Fire") > -1)
		{
			isPlacerFire = true;
		}
		var esdTSIArray = new Array("Traffic Fee Review","Grading Permit Issuance","Improvement Plan Approval","DPW Encroachment Permit Issuance");
		var addlPermitRequiredFlag = false;
		var apList = "";
		for(esd in esdTSIArray)
		{
			thisTask = esdTSIArray[esd];
			logDebug("ESD task: " + thisTask);
			if(matches(AInfo[thisTask],"Y","Yes") && !isTaskActive(thisTask))
			{
				if(thisTask == "Grading Permit Issuance")
				{
					if(!addlPermitRequiredFlag)
					{
						apList = "Grading Permit";
					}else{
						apList = apList + ", Grading Permit";
					}
					addlPermitRequiredFlag = true;
				}
				if(thisTask == "Improvement Plan Approval")
				{
					if(!addlPermitRequiredFlag)
					{
						aplist = "Improvement Plan"
					} else{
						apList = apList + ", Improvement Plan";
					}
					addlPermitRequiredFlag = true;
					// create notification to applicant
					createNotificationTPS2("NOTICE_ESD_IMPROVEMENT_PLAN_REQ","Y","Applicant","N","","N","N","N","Y","N","N","");
				}
				if(thisTask == "DPW Encroachment Permit Issuance")
				{
					if(!addlPermitRequiredFlag)
					{
						apList = "DPW Encroachment Permit";
					}else{
						apList = apList + ", DPW Encroachment Permit";
					}
					addlPermitRequiredFlag = true;
				}					
				activateTask(thisTask,wfProcess);
				updateTask(thisTask,"Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue(thisTask,wfProcess);
			}
		}
		if(addlPermitRequiredFlag)
		{
			generateAddlPermitRequiredNotice(arpTemplate,apList);
		}
		
		if(matches(AInfo["Fire Driveway Review Required"],"Y","Yes")) 
		{
			if(isPlacerFire && !isTaskActive("Fire Review") && !isTaskStatus("Fire Review","Approved Pending Resubmittal",wfProcess) && !isTaskStatus("Fire Review","Approved",wfProcess))
			{
				activateTask("Fire Review",wfProcess);
				editTaskSpecific("Distribution","Fire Review","Y");
				thisStaff = lookup("SDL:BLD Default Assignment","Fire Review");
				assignThisTask("Fire Review",wfProcess);
				resubNum = AInfo["Resubmittal Number"];
				if(resubNum <= 1)
				{
					addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,0);	
				}
				if(resubNum > 1)
				{
					addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,1);	
				}
				editTaskDueDate("Fire Review",dateAdd(null,addNumDays,"Y"));
			}
			if(!isPlacerFire && !isTaskStatus("Fire Review - Partner Agency","Complete"))
			{
				activateTask("Fire Review - Partner Agency",wfProcess);
				updateTask("Fire Review - Partner Agency","Completion Pending","","(Preissuance Requirement)",wfProcess);
				assignPreissue("Fire Review - Partner Agency",wfProcess);
			}						
		}
		if(matches(AInfo["Stormwater and Floodplain"],"Y","Yes") && !isTaskActive("Stormwater and Floodplain Review") && !isTaskStatus("Stormwater and Floodplain Review","Approved",wfProcess))
		{
			activateTask("Stormwater and Floodplain Review",wfProcess);
			editTaskSpecific("Distribution","Stormwater and Floodplain Review","Y");
			thisStaff = lookup("SDL:BLD Default Assignment","Stormwater and Floodplain Review");
			assignThisTask("Stormwater and Floodplain Review",wfProcess);
			resubNum = AInfo["Resubmittal Number"];
			if(resubNum <= 1)
			{
				addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,0);	
			}
			if(resubNum > 1)
			{
				addNumDays = getDueInDays("SDL:DueDates","Reviews|" + dueDateRecType,1);	
			}
			editTaskDueDate("Stormwater and Floodplain Review",dateAdd(null,addNumDays,"Y"));

			stmDueDate = dateAdd(null,addNumDays,"Y");
			sentStormNotice = generateNoticeToStaff(stmTemplate,stmToEmail,stmDueDate);	
			if(sentStormNotice)
			{
				logDebug("Send Stormwater notification is " + sentStormNotice);
			} else {
				logDebug("Failed to send Stormwater notification");
			}
		}
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal"))
		{
			//checks for the conditions
			hasEsdGradingCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Grading Permit Final Required", null);
			hasEsdImprovementCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Improvement Plan Construction Acceptance Required", null);
			hasDpwEncroachmentCondition = appHasCondition("DPW - Prevent Final / Completion", null, "Encroachment Permit Final Required", null);
			hasBmpCondition = appHasCondition("ESD - Prevent Final / Completion", null, "BMP Certification", null);
			hasRetainingWallCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Retaining Wall Certification", null);
			
			//add conditions is TSI is 'CHECKED' and doesn't already exist
			if( matches(AInfo["Grading Review"] , "checked", "Checked", "CHECKED") && !(hasEsdGradingCondition))
			{
				addAppCondition("ESD - Prevent Final / Completion", "Applied","Grading Permit Final Required", gradingCondComment, "Notice", "");
			}
			if( matches(AInfo["Improvement Plan"] , "checked", "Checked", "CHECKED") && !(hasEsdImprovementCondition))
			{
				addAppCondition("ESD - Prevent Final / Completion", "Applied" ,"Improvement Plan Construction Acceptance Required", improvementCondComment, "Notice", "");
			}
			if( matches(AInfo["DPW Final Review"] , "checked", "Checked", "CHECKED") && !(hasDpwEncroachmentCondition))
			{
				addAppCondition("DPW - Prevent Final / Completion", "Applied","Encroachment Permit Final Required", encroachmentCondComment, "Notice", "");
			}
			if( matches(AInfo["BMP Certification"] , "checked", "Checked", "CHECKED") && !(hasBmpCondition))
			{
				addAppCondition("ESD - Prevent Final / Completion", "Applied","BMP Certification",bmpCondComment, "Notice", "");
			}
			if( matches(AInfo["Retaining Wall Certification"] , "checked", "Checked", "CHECKED") && !(hasRetainingWallCondition))
			{
				addAppCondition("ESD - Prevent Final / Completion","Applied" ,"Retaining Wall Certification",retainingCondComment, "Notice", "" );
			}
		}
	}
	
	if(matches(wfTask,"Environmental Engineering Review"))
	{
		if(matches(AInfo["Sewer Permit Issuance"],"Y","Yes") && !isTaskActive("Sewer Permit Issuance") && !isTaskStatus("Sewer Permit Issuance","Complete"))
		{
			activateTask("Sewer Permit Issuance",wfProcess);
			updateTask("Sewer Permit Issuance","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("Sewer Permit Issuance",wfProcess);
			generateAddlPermitRequiredNotice(arpTemplate,"Sewer Permit");
		}
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal"))
		{
			if(matches(AInfo["EE Step System Final"],"Checked","CHECKED") && !appHasCondition("Env. Engineering - Prevent Final / Completion",null, "Environmental Engineering Step System Required",null))
			{
				addAppCondition("Env. Engineering - Prevent Final / Completion", "Applied", "Environmental Engineering Step System Required", "STEP SYSTEM FINAL REQUIRED PRIOR TO BUILDING DEPARTMENT FINAL. CALL 530-886-4905 TO SCHEDULE", "Notice");
			}
			if(matches(AInfo["EE Final"],"Checked","CHECKED") && !appHasCondition("Env. Engineering - Prevent Final / Completion",null, "Environmental Engineering Final Required",null))
			{
				addAppCondition("Env. Engineering - Prevent Final / Completion", "Applied", "Environmental Engineering Final Required", "COMMERCIAL INSPECTION OR TAP INSPECTION REQUIRED PRIOR TO BUILDING DEPARTMENT FINAL. CALL 530-889-6846 TO SCHEDULE.", "Notice");
			}
		}		
	}

	if(matches(wfTask,"Public Works Review"))
	{
		if(matches(AInfo["DPW Encroachment Permit Issuance DPW"],"Y","Yes") && !isTaskActive("DPW Encroachment Permit Issuance") && !isTaskStatus("DPW Encroachment Permit Issuance","Complete"))
		{
			activateTask("DPW Encroachment Permit Issuance",wfProcess);
			updateTask("DPW Encroachment Permit Issuance","Completion Pending","","(Preissuance Requirement)",wfProcess);
			generateAddlPermitRequiredNotice(arpTemplate,"DPW Encroachment Permit");
		}
	}
	
	// Rules for updating TSI Distribution and task activation fields when review task is Approved -------------
	if(matches(wfTask,"Stormwater and Floodplain Review") && wfStatus == "Approved")
	{
		editTaskSpecific("B_ESD","Stormwater and Floodplain","N");
		editTaskSpecific("Distribution","Stormwater and Floodplain Review","N");		
	}
		
	// Special Actions for individual review tasks
	//==============================================
	// Building Plan Check/Approved Pending Resubmittal ----------------------------
	if(wfTask == "Building Plan Check")
	{
		if(AInfo["Plan Check Type"] != AInfo["Plan Check Type Override"])
		{
			editAppSpecific("Plan Check Type",AInfo["Plan Check Type Override"])
		}

		if(isTaskStatus("Distribution","Not Required - Plan Check Only"))
		{
			var allRevComplete = true;	
			rtaskListArray = new Array();
			rtaskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BLDPERMIT"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
			rtaskListArray = rtaskList.split(",");
			for(rtl in rtaskListArray)
			{
				rTask = rtaskListArray[rtl];

				if(rTask !=  wfTask && isTaskActive(rTask,wfProcess))
				{
					allRevComplete = false;
				}
			}
			if(allRevComplete)
			{
				thisTask = "Distribution Reconciliation";
				editTaskDueDate(thisTask,dateAdd(null,1,"Y"));
				assignThisTask(thisTask,wfProcess);
			}
		}
		if(wfStatus == "Approved Pending Resubmittal")
		{			
			if(matches(AInfo["LPG Tank"],"Above Ground","Underground"))
			{
				if(!appHasCondition("Fire - Prevent Final / Completion",null,"Fire LPG Article 15.12 Inspections Required",null))
				{
					addStdCondition("Fire - Prevent Final / Completion","Fire LPG Article 15.12 Inspections Required");
				}
				if(AInfo["LPG Tank"] == "Above Ground")
				{
					updateFee("9015","FIRE PLANNER FEES","FINAL",1,"N");
				}
				if(AInfo["LPG Tank"] == "Underground")
				{
					updateFee("9014","FIRE PLANNER FEES","FINAL",1,"N");
				}	
			}
		}		
	}
	
	// Special Actions for individual review tasks
	//==============================================
	
	// Stormwater and Floodplain Review actions --------------------------------
	if(matches(wfTask,"Stormwater and Floodplain Review"))
	{
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal"))
		{
			if(matches(AInfo["Required before Foundation"],"Y","Yes","YES"))
			{
				if(!appHasCondition("DPW - Prevent Building Inspections", "Applied","DPW Prevent Building Inspections", null))
				{
					addStdCondition("DPW - Prevent Building Inspections","DPW Prevent Building Inspections");
				}
			}
			if(matches(AInfo["Required before Final"],"Y","Yes","YES"))
			{
				if(!appHasCondition("DPW - Prevent Final / Completion", "Applied","Floodplain Review Required", null))
				{
					addStdCondition("DPW - Prevent Final / Completion","Floodplain Review Required");
				}
			}
		}
	}
	
	// Fire Review actions --------------------------------
	if(matches(wfTask,"Fire Review"))
	{
		logDebug("Fire Fee tsi = " + AInfo["Placer County Fire Fee Review"]);
		if(matches(AInfo["Placer County Fire Fee Review"],"Y","Yes") && !isTaskActive("Placer County Fire Fee Review"))
		{
			activateTask("Placer County Fire Fee Review",wfProcess);
			updateTask("Placer County Fire Fee Review","Completion Pending","","(Preissuance Requirement)",wfProcess);
			assignPreissue("Placer County Fire Fee Review",wfProcess);		
		}
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal"))
		{
			if(matches(AInfo["Fire Final Required"],"Y","Yes","YES"))
			{
				if(!appHasCondition("Fire - Prevent Final / Completion", "Applied","Fire Department Final Inspection Required", null))
				{
					addStdCondition("Fire - Prevent Final / Completion","Fire Department Final Inspection Required");
				}
			}
			if(matches(AInfo["LPG Article 15.12"],"Y","Yes","YES"))
			{
				if(!appHasCondition("Fire - Prevent Final / Completion", "Applied","Fire LPG Article 15.12 Inspection Required", null))
				{
					addStdCondition("Fire - Prevent Final / Completion","Fire LPG Article 15.12 Inspection Required");
				}
			}
			if(matches(AInfo["Driveway Inspection Required"],"Y","Yes","YES"))
			{
				if(!appHasCondition("Fire - Prevent Final / Completion", "Applied","Fire Driveway Inspection Required", null))
				{
					addStdCondition("Fire - Prevent Final / Completion","Fire Driveway Inspection Required");
				}
			}
		}		
	}	
	
	// Update Cycle for all review tasks -----------------
	
	if((wfTask.indexOf("Review") > -1 || wfTask == "Building Plan Check") && !matches(wfTask,"Submittal Review","Traffic Fee Review","Placer County Fire Fee Review","Real Estate Services Review","ADU Review","ADU Addressing Review"))
	{
		useTaskSpecificGroupName = true;
		TsiInfo = new Array();
		loadTaskSpecific(TsiInfo,capId);
		newCycle = 0;
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal","Corrections Required")) 
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
	
	// Rules for updating Dist Recon task when all Plan Review tasks are complete
	if((wfTask.indexOf("Review") > -1 || wfTask == "Building Plan Check") && !matches(wfTask,"Submittal Review","Traffic Fee Review","Placer County Fire Fee Review","Real Estate Services Review","ADU Review","ADU Addressing Review"))
	{
		// set due date and staff assignment
		if(isTaskStatus("Distribution","Distribute"))
		{
			var allRevComplete = true;	
			rtaskListArray = new Array();
			rtaskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BLDPERMIT"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
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
				thisTask = "Distribution Reconciliation";
				editTaskDueDate(thisTask,dateAdd(null,1,"Y"));
				assignThisTask(thisTask,wfProcess);				
			}
		}				
		
		var distRecStatus = "Ready for Reconciliation - Approved";
		if(matches(wfStatus,"Approved","Approved Pending Resubmittal","Corrections Required")) 
		{
			var reviewListArray = new Array();
			var reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS","BLDPERMIT"); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
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
				//updateTask("Distribution Reconciliation",distRecStatus,"Status updated by script.",""); // Remarked out due to duplication of WTUA digEplan script.
			}
		}
	}	
	
	// Distribution Reconciliation -------------------------------------------------
	if(matches(wfTask,"Distribution Reconciliation")) 
	{

		// Determine if from Triage tasks
		recFromTriage = false;
		failTask = "";		
		for(xx in preTriageListArray)
		{
			thisReview = preTriageListArray[xx];
			logDebug("Triage required test, current task: " + thisReview);
			if(isTaskStatus(thisReview,"Corrections Required"))
			{
				failTask = failTask + thisReview + ";";
				recFromTriage = true;
			}
		}
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
			if(recFromTriage)
			{
				updateTask("Distribution","Pending Resubmittal","Corrections required for " + failTask + ". Updated by script","Pending Resubmittal from Pre-screen");
			} else{
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
			}

			//---------------------------------------------
			
			createNotificationTPS2("NOTICE_BLD_CORRECTIONS REQUIRED","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
			thisTask = "Distribution";
			assignThisTask(thisTask,wfProcess);
			editTaskDueDate("Distribution",dateAdd(null,1,"Y"),wfProcess);
			presetTSIpco("BLDPERMIT","Distribution","Approved","Cleared","ThirdStatus");
		}
		
		// Distribution Reconciliation - Complete
		if(wfStatus == "Complete")
		{
			if(isTaskStatus("Distribution","Distribute")) {updateTask("Distribution","Distributed","Updated by script on Distribution Reconciliation Complete","");}
			editTaskDueDate("Process for Issuance",dateAdd(null,2,"Y"),wfProcess);
			thisTask = "Process for Issuance";
			thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
			assignTask(thisTask,thisStaff,wfProcess);
			
			// Preissuance tasks list: Traffic Fee review,Placer County Fire Free review,Sewer Permit Issuance,Grading Permit Issuance,Improvement Plan Approval,DPW Encroachment Permit Issuance,Real Estate Services Review,ADU Review,ADU Addressing Review,Fire Review - Partner Agency
			// New block for setting reminder/due dates for Preissuance tasks
			var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
			preTasksArraySD = preIssueListSD.split(",");
			for(thisPI in preTasksArraySD)
			{
				cTask = preTasksArraySD[thisPI];
				logDebug("For setting date, current cTask = " + cTask);
				if(isTaskActive(cTask)) { editTaskDueDate(cTask,dateAdd(null,1,"Y"),wfProcess); }
			}
			// Generate notification for active preissuance tasks to assigned staff
			var preIssueToStaffTemplate = "OUTSTANDING _PREISSUANCE_TASK";
			var thisPreToEmail = null;
			var piDueDate = null;
			var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
			preTasksArraySD = preIssueListSD.split(",");
			for(thisPI in preTasksArraySD)
			{
				cTask = preTasksArraySD[thisPI];
				logDebug("Tesing if preissuance task " + cTask + " is active");
				if(isTaskActive(cTask)) 
				{
					thisPreToEmail = getTaskAssignToEmail(cTask,wfProcess)
					var piDueDate = dateAdd(new Date(getTaskDueDate(cTask,wfProcess)),0);
					if(thisPreToEmail != false)
					{
						sendPreissueToStaff = generateNoticeToStaff(preIssueToStaffTemplate,thisPreToEmail,piDueDate,cTask);	
						if(sendPreissueToStaff)
						{
							logDebug(cTask + " notification sent to staff email, " + thisPreToEmail);
						} else {
							logDebug("Failed to send " + cTask + " notification to staff");
						}
					}
				}
			}
		}
		
		// Distribution Reconciliation - Withdrawn
		if(wfStatus == "Withdrawn")
		{
			setTask(wfTask,"N","Y");
			var preIssueListWD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
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
	// Preissuance tasks: Traffic Fee Review,Placer County fire Fee Review,Sewer Permit Issuance,Grading Permit Issuance,Improvement Plan Approval,DPW Encroachment Permit Issuance,Real Estate Services Review,ADU Review,ADU Addressing Review,Fire Review Partner Agency

	if(wfStatus == "Complete" && wfTask != "Distribution Reconciliation")
	{
		var preTasksArray = new Array();
		var preIssueList = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
		preTasksArray = preIssueList.split(",");
		if(matches(wfTask,"Grading Permit Issuance","Improvement Plan Approval","DWP Encroachment Permit Issuance","Traffic Fee Review"))
		{
			editTaskSpecific("Engineering and Surveying Review",wfTask,"N");
			if(matches(wfTask,"Traffic Fee Review")) {editTaskSpecific("Distribution","Traffic Fee","N");}
		}
		if(matches(wfTask,"Placer County Fire Fee Review"))
		{
			editTaskSpecific("Fire Review","Placer County Fire Fee Review","N");
		}
		if(matches(wfTask,"Sewer Permit Issuance"))
		{
			editTaskSpecific("Environmental Engineering Review","Sewer Permit Issuance","N");
		}
		if(matches(wfTask,"Real Estate Services Review"))
		{
			editTaskSpecific("Distribution","Real Estate Services Review","N");
		}
		if(isTaskActive("Process for Issuance"))
		{
			var allPreComplete = true;		
			for(pit in preTasksArray)
			{
				preTask = preTasksArray[pit];

				if(wfTask == preTask && wfStatus == "Complete")
				{
					for(pt2 in preTasksArray)
					{
						preTask2 = preTasksArray[pt2];
						if(preTask2 != preTask && isTaskActive(preTask2))
						{
							allPreComplete = false;
						}
					}
				}
			}
			if(allPreComplete)
			{
				updateAppStatus("Final Processing","All preissuance tasks Complete or inactive. Updated by script");
				updateTask("Process for Issuance","Final Processing","All preissuance tasks Complete or inactive. Updated by script","",wfProcess);
			}
		}
	}

	// Process for Issuance
	if(wfTask == "Process for Issuance") 
	{
		if(wfStatus == "Issued") 
		{
			/* Remarked out 12/05/2025. Moved setting dates to 'Signature Requested' task status **
			logDebug("Updating Issued Date " + dateAdd(null,0));
			editAppSpecific("Issue Date",dateAdd(null,0));
			editFirstIssuedDate(dateAdd(null,0));
			editAppSpecific("Expiration Date",dateAdd(null,730));
			if(trpaFlag.indexOf("Tahoe Regional") > -1)
			{
				editAppSpecific("TRPA Permit Expiration",dateAdd(null,1095));
			}
			/--------------------------------------------------------------------------------------*/
			if(matches(AInfo["Last Revision Number"],null,"")) {
				editAppSpecific("Last Revision Number",0);
				AInfo["Last Revision Number"] = 0;
			}
			// Generatng report and notification
			var report = null;
			var reportName = "Building Permit";
			var reportModule = "Building";
			var emailTemplate = "NOTICE_BUILDING_PERMIT_ISSUED";
			var vFromEmail = "";
			var vToEmail = "";
			var vCcEmail = "";
			var cTypeArray = new Array();
			var vContactTypes = "Applicant,Owner";
			cTypeArray = vContactTypes.split(",");
			var paramMap = aa.util.newHashMap();
			paramMap.put("RecordID",capIDString);
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaDeepLinkAppTypeAlias$$
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
			getRecordParams4Notification(emailParameters);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",thisScope);
			
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

			// If record is assigned to staff add assigned staff parameters 
			var assignedStaff = getAssignedToStaff(); 
			if(matches(assignedStaff,null,"",undefined)) {
				assignedStaff = "TDUNN";
			}
			if(assignedStaff != null) {
				staffResult = aa.person.getUser(assignedStaff);
				if (!staffResult.getSuccess())
					{ logDebug("**ERROR retrieving  user model " + assignedStaff + " : " + staffResult.getErrorMessage()) }
				if (staffResult.getSuccess()) {
					staffObject = staffResult.getOutput();
					var staffEmail = staffObject.getEmail();
					var staffFirst = staffObject.getFirstName(); 
					var staffLast = staffObject.getLastName(); 
					logDebug(staffFirst + " " + staffLast + " at " + staffEmail);
				}
				var staffName = staffFirst + " " + staffLast;
				if(!matches(staffEmail,undefined,"",null)) {
					addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
					addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
					addParameter(emailParameters,"$$staffNameParam$$",staffName);
				}
			}
			
			// Get report info
			// if (aa.reportManager.getReportModelByName(reportName)){
				// report = generateReport(reportName,paramMap,reportModule);
			// }
			// else logDebug("Unable to find report: " + reportName);
			// logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

			// var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, new Array(report));
			var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
						
			var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing WTUA sent permit script ", debug);	
			
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
			var vContactTypes = "Applicant,Owner";
			cTypeArray = vContactTypes.split(",");
			emailParameters = aa.util.newHashtable();
			var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
			acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
			addParameter(emailParameters,"$$projectTypeParam$$","building permit");			
			addParameter(emailParameters,"$$sourceParam$$","permit application");
			addParameter(emailParameters,"$$sourceID$$",capIDString);			
			getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; 
			// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
			getRecordParams4Notification(emailParameters);
			getPrimaryAddressLineParam4Notification(emailParameters);
			addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));		
			
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
			// Get list of any active preissuance tasks
			var piListParam = "No active preissuance requirements";
			var found = 0;
			var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
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
			addParameter(emailParameters,"$$cdrEmail$$",cdrEmail);
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
		// Generate signature requested notification
		if(wfStatus == "Signature Requested")
		{
			/* Moved from 'Issued' status -------------*/
			logDebug("Updating Issued Date " + dateAdd(null,0));
			editAppSpecific("Issued Date",dateAdd(null,0));
			editAppSpecific("Issue Date",dateAdd(null,0));
			editFirstIssuedDate(dateAdd(null,0));
			editAppSpecific("Expiration Date",dateAdd(null,730));
			if(trpaFlag.indexOf("Tahoe Regional") > -1)
			{
				editAppSpecific("TRPA Permit Expiration",dateAdd(null,1095));
			}			
			/*---------------------------------------*/
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
		
		}
			// if(checkForContactEmail("Applicant"))
			// {
				// showMessage = true;
				// comment("<font size = 4 color=ff000><b>No applicant email address found. " + wfStatus + " email notification cannot be sent.</b></font><br><br>A status of " + wfStatus + " for the " + wfTask + " task will send a " + wfStatus + " notification to the applicant.<br>The email notification cannot be sent without a valid applicant email address.<br> Please review applicant contact record for a valid email address.");
			// }
			// createNotificationTPS2("SIG_REQUEST","Y","Applicant,Owner","N","","N","N","N","Y","N","N","");
		
	}
	/*----------------------------------------------------------
	|  Added Revision child process to WTUA:Building/ 10/28/2023
	/-----------------------------------------------------------*/
	// Inspections phase-Revisions
	// Create Revision Child Record
	// Notes: created REVISION INFORMATION subgroup with 'Revision' alias, 'Last Revision Number' field, and 'hideRev' field to support this segment
	
	if(wfTask == "Inspections")
	{
		if(wfStatus == "Revisions")
		{
			logDebug("Inside creating revision child record");
			var recName = "Building Permit Revision for " + capIDString;
			var cCapId = createChild("Building","Revision","NA","NA",recName); 
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
			
			copyOwnerTPS(pCapId,cCapId);
			var assignedTo = getAssignedToStaff(pCapId); 
			if(assignedTo != null && assignedTo != "") {
				assignCap(assignedTo,cCapId);
			}
			copyAddresses(pCapId,cCapId);
			copyParcels(pCapId,cCapId);
			updateAppStatus("Issued - Revision Pending", "Revision " + formatRevNumber(revNumber) + " created by staff. Updated by Script", capId)

			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			copyContacts(pCapId,cCapId);

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
			getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */

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

			// Existing rules for adding conditions on Revisions at Inspection task, modified to use new revision condition
			//--------------------------------------------------------------------
			if(!appHasCondition("Building - Prevent Final / Completion", "Applied","Building Final Not Allowed until Revisions are Approved", null))
			{
				addStdCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Revisions are Approved");
			}
		}
		
		/*--------------------------------------------------------------------
		|  Added Deferred Submittal child process to WTUA:Building 12/07/2023
		/--------------------------------------------------------------------*/
		// Inspections task-Deferred Submittal status
		// Create Deferred Child Record
		// Notes: added 'Deferred Submittal Number' to REVISION INFORMATION subgroup to support this segment	
		if(wfStatus == "Deferred Submittal")
		{
			logDebug("Inside creating deferred submittal child record");
			var recName = "Building Permit Deferred Submittal for " + capIDString;
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
			
			copyOwnerTPS(pCapId,cCapId);
			var assignedTo = getAssignedToStaff(pCapId); 
			if(assignedTo != null && assignedTo != "") {
				assignCap(assignedTo,cCapId);
			}
			copyAddresses(pCapId,cCapId);
			copyParcels(pCapId,cCapId);	
			editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
			editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
			editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
			editAppSpecific("Plan Check Type",getAppSpecific("Plan Check Type",pCapId),cCapId);
			
			// Generate email notice to parent applicant for new Deferred Submittal application createDocumentFragment
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
			getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */	
			
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
			
			// New rules for adding conditions on deferred submittal
			if(!appHasCondition("Building - Prevent Final / Completion","Applied","Building Final Not Allowed until Deferred Submittals are Approved",null))
			{
				addStdCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Deferred Submittals are Approved");
			}
		}
		
		// Contruction Complete Actions
		if(wfStatus == "Construction Complete")
		{
			editTaskDueDate("Closure",dateAdd(null,2),wfProcess);
			thisStaff = closureStaff;
			thisTask = "Closure";
			assignTask(thisTask,thisStaff,wfProcess);
		}
	}
}

if (wfProcess == "BLD_20181201_MAIN")
{
	/*------------------------------------------------------------------------
	|  Added Revision child process for BLD_20181201_MAIN wfProcess 10/11/2024
	/------------------------------------------------------------------------*/
	// Inspections phase-Revisions
	// Create Revision Child Record
	// Notes: created REVISION INFORMATION subgroup with 'Revision' alias, 'Last Revision Number' field, and 'hideRev' field to support this segment
	
	if(wfTask == "Inspections" && wfStatus == "Revisions") 
	{
		logDebug("Inside creating revision child record");
		var recName = "Building Permit Revision for " + capIDString;
		var cCapId = createChild("Building","Revision","NA","NA",recName); 
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
		
		copyOwnerTPS(pCapId,cCapId);
		var assignedTo = getAssignedToStaff(pCapId); 
		if(assignedTo != null && assignedTo != "") 
		{
			assignCap(assignedTo,cCapId);
		}
		copyAddresses(pCapId,cCapId);
		copyParcels(pCapId,cCapId);
		editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
		editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
		editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
		updateAppStatus("Issued - Revision Pending", "Revision " + newAltID + " created by staff. Updated by Script", capId)

		showMessage = true;
		comment("<font size = 4 color=ff000><b>Revision record created. Record number " + newAltID + ".</b></font><br><br>You can navigate to the new record using the Related Records tab.<br>");
		if(!appHasCondition("Building - Prevent Final / Completion", "Applied","Building Final Not Allowed until Revisions are Approved", null))
		{
			addStdCondition("Building - Prevent Final / Completion","Building Final Not Allowed until Revisions are Approved");
		}
	}	
}

//IT Request# 1911 - EV Charging Station
if (matches(appTypeArray[1], "Residential", "Commercial") && appTypeArray[2] == "Limited")
{
  if (getAppSpecific("Type of Work") == "Alteration" && getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)")
  {
    // supporting both new and old WfProcess
    if ((wfProcess == "BLD_20230501_MAIN" && wfTask == "Submittal Review" && wfStatus == "Submittal Accepted") || (wfProcess == "BLD_20181201_MAIN  " && wfTask == "Application Submittal" && wfStatus == "Complete"))
	{
      if (getAppSpecific("EVCS Units Qty") == "1-25 units")
	  {
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 20, " "));
	  }
      else if (getAppSpecific("EVCS Units Qty") == "26+ units")
	  {
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 40, " "));
	  }
      else {
        logDebug('***Error***: "EVCS Units Qty" is undefined!');
	  }
	}
  }
}
//End of IT Request# 1911 - EV Charging Station  

// Custom functions in development - move to Includes_Custom on validation


/*============================================================================================================================================================\
NOTES:

\==============================================================================================================================================================*/

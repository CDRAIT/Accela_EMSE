/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Residential!Full Review!~	
|         //WTUA:Building/Residential/Full Review/*
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Residential<3000 records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/18/2020 created script
|         : TDunn 11/30/2020 added logic to add Affordable Housing fees
|         : TDunn 04/08/2021 updated logic to add Affordable Housing fees
|         : TDunn 07/30/2021 updated fee codes for AH and EA fees
|         : TDunn 01/24/2024 added new PCCP created notification logic for BLD_20181201_DISTRIBUTION wf process
|         : TDunn 03/07/2024 fixed logic error for generating PCCP notification when creating PCCP record.
|         : Abe   06/26/2024 IT Request # 1924 - ESD Building Permit Sign Off - "ESD Checklist"
|         : Abe   02/11/2025 IT Request# 2164 - Swimming Pool Safety Req. Email Notification
|         : TDunn 12/12/2025 Backed this in from nonpro1 into local and nonprod1 repositorys to sync with script window version
|
/-----------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"EAFTAHI","TDUNN")) { showDebug = 1;}
logDebug("Running EMSE WTUA:/Building/Residential/Full Review/...");

// Workflow status actions for ADU/JADU
// Actions for 'Process for Issuance' task at'Issued' status
/* This section disabled pending deployment to production
showDebug = false;
if(wfTask == "Process for Issuance" && !matches(AInfo["ADU/JADU"],"Primary Residence","",null)) {
	if(wfStatus == "Issued") {
		createNotificationTPS2("WTUA_RES3000_ISSUED_NOTICE_TO_APPLICANT","Y","Applicant","N","N","N","N","N","Y","N","N","");
	}
}
*/
// Workflow status actions for Planning Review/Complete for Residential

if(wfTask == "Planning Review" && wfStatus == "Complete") {
	
	//  Affordable Housing applies to county jurisdiction with exemptions. see doc for exemptions

	if(AInfo["City Jurisdiction"] == "County" && matches(AInfo["Type of Work"],"New","Addition") && !matches(AInfo["Scope of Work"],"Accessory Dwelling Unit","Junior Accessory Dwelling Unit","Secondary Dwelling")) {
		var afhApply = AInfo["Affordable Housing Fee Applies"];

		if(matches(afhApply,"Y","Yes")) {
			logDebug("Trying to add Affordable Housing Fee");
			addFee("TF-HSG AHF","AFFORDABLE HOUSING","FINAL",1,"N");
		}

	}
}

if(wfProcess == "BLD_20181201_DISTRIBUTION")
{
	if (wfTask == "Planning Review")
	{	
		cCapId = childGetByCapType("PCCP/Land Conversion Authorization/NA/NA");
		if(!matches(cCapId,null,false,undefined)) 
		{
			editTaskSpecific("Planning Review", "PCCP Record Number",cCapId.getCustomID());			
		}
		if (matches(cCapId,null,false,undefined) && AInfo['PCCP Required'] == "Yes")
		{
			cCapId = createChild("PCCP","Land Conversion Authorization","NA","NA",capName);
			cCapIDString = cCapId.getCustomID();			
			createPCCPNotification("PCCP_NOTIFICATION",cCapIDString);
			showMessage = true;
			comment("<font size = 3 color=ff000><b>This project is within the PCCP Plan Area. A PCCP record has been created and must be authorized prior to permit completion</b></font>");
			editTaskSpecific("Planning Review", "PCCP Record Number",cCapId.getCustomID());
		}
	}
}

// Abe - 06/26/2024: IT Request # 1924 - ESD Building Permit Sign Off - "ESD Checklist"   
var hasFloodZoneRev = false;
var vWfstr = "Flood Zone Review";

var hasEsdGradingCondition = false;
var hasEsdImprovementCondition = false;
var hasDpwEncroachmentCondition = false;
var hasBmpCondition = false;
var hasRetainingWallCondition = false;

var gradingCondComment = "***Grading Permit Final***\n" + "Prior to issuance of Final Occupancy, construction of the associated grading permit, " +
	"ESDXX-XXXXX, must be finaled by the Placer County Engineering & Surveying Division."
var improvementCondComment = "***Construction Acceptance of Improvement Plans***\n" + "Prior to issuance of Final Occupancy, construction of the associated site improvement plans, " +
	"ESDXX-XXXXX, must be accepted as complete by the Placer County Engineering & Surveying Division." 
var encroachmentCondComment = "***Encroachment Permit Final***\n" + "Prior to issuance of Final Occupancy, construction of the associated encroachment permit, " +
	"ENCRXX-XXXXX, must be finaled by the Placer County Department of Public Works.";
var bmpCondComment = "***BMP CERTIFICATION***\n" + "Prior to issuance of Final Occupancy, certification by a licensed Civil Engineer, QSD, "+
	"or Qualified Stormwater Practitioner (QSP) shall be provided stating that all permanent stormwater quality control measures, "+ 
	"site stabilization and any applicable site design and LID measures have been completed per the approved plan."
var retainingCondComment = "***Retaining Wall Certification***\n" + "Site work includes grading for a private land lot and the construction of a retaining wall. "+
	"A special inspection is required at the completion of construction and a report generated by the design engineer that the retaining wall was constructed per the submitted calculations. "+
	"This written and stamped report shall be submitted to the Placer County Engineering & Surveying Division prior to the Final of this permit or the completion of the construction."


//Checks if the ad hoc task exists

var workflowResult = aa.workflow.getTaskItems(capId, vWfstr, "", null, null, null);
if (workflowResult.getSuccess())
	wfObj = workflowResult.getOutput();
else 
	logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());

for (i in wfObj) {
	fTask = wfObj[i];
	if (fTask.getTaskDescription().toUpperCase().equals(vWfstr.toUpperCase()) )
		hasFloodZoneRev = true;		
}

//checks for the conditions
hasEsdGradingCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Grading Permit Final Required", null);
hasEsdImprovementCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Improvement Plan Construction Acceptance Required", null);
hasDpwEncroachmentCondition = appHasCondition("DPW - Prevent Final / Completion", null, "Encroachment Permit Final Required", null);
hasBmpCondition = appHasCondition("ESD - Prevent Final / Completion", null, "BMP Certification", null);
hasRetainingWallCondition = appHasCondition("ESD - Prevent Final / Completion", null, "Retaining Wall Certification", null);


if(wfProcess == "BLD_20181201_DISTRIBUTION" && wfTask == "Engineering and Surveying Review" && (wfStatus == "Complete" || wfStatus == "Pending" || wfStatus == "Pending (Tahoe back office review finished)") ) {
	//conditions
	if( matches(AInfo["Grading Review"] , "checked", "Checked", "CHECKED") && !(hasEsdGradingCondition)){
		addAppCondition("ESD - Prevent Final / Completion", "Applied","Grading Permit Final Required", gradingCondComment, "Notice", "");
	}

	if( matches(AInfo["Improvement Plan"] , "checked", "Checked", "CHECKED") && !(hasEsdImprovementCondition)){
		addAppCondition("ESD - Prevent Final / Completion", "Applied" ,"Improvement Plan Construction Acceptance Required", improvementCondComment, "Notice", "");
	}	

	if( matches(AInfo["DPW Final Review"] , "checked", "Checked", "CHECKED") && !(hasDpwEncroachmentCondition)){
		addAppCondition("DPW - Prevent Final / Completion", "Applied","Encroachment Permit Final Required", encroachmentCondComment, "Notice", "");
	}	

	if( matches(AInfo["BMP Certification"] , "checked", "Checked", "CHECKED") && !(hasBmpCondition)){
		addAppCondition("ESD - Prevent Final / Completion", "Applied","BMP Certification",bmpCondComment, "Notice", "");
	}

	if( matches(AInfo["Retaining Wall Certification"] , "checked", "Checked", "CHECKED") && !(hasRetainingWallCondition)){
		addAppCondition("ESD - Prevent Final / Completion","Applied" ,"Retaining Wall Certification",retainingCondComment, "Notice", "" );
	}
	//ad-hod
	if(AInfo["Flood Zone Review"] == "Yes" && !(hasFloodZoneRev)){
		addAdHocTask("ADHOC","Flood Zone Review","Engineering and Surveying"); 
		assignTask("Flood Zone Review","MKELLER");
	}

	//aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", "", "WTUA|Res|Full Review|Debug Results #1924 ESD Check List", debug);
}// End of IT Request # 1924


//START of: IT Request# 2164 - Swimming Pool Safety Req. Email Notification
if (appTypeArray[3] == "Other" && wfTask == "Process for Issuance" && wfStatus == "Issued")
	if (matches(getAppSpecific("Scope of Work"), "Swimming Pool", "Swimming Pool Above Ground", "Swimming Pool Remodel or Repair")) {

		var emailFrom = defaultFrom;
		var emailParams = aa.util.newHashtable();
		getPrimaryOwnerParams4NotificationWithEmail(emailParams);
		addParameter(emailParams, "$$altID$$", capId.getCustomID());
		var emailTemp = "BLD_RES_SWIMMING_POOL_LETTER";
		var defaultEmail = "Building@Placer.ca.gov";
		var emailTo = emailParams.get("$$ownerEmail$$");

		if (!(isEmptyOrNull(emailTo)) && emailTo.indexOf('@') != -1)
			emailResult = sendNotification(emailFrom, emailTo, "", emailTemp, emailParams, null);
	}

//END of:  IT Request# 2164







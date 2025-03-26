/*------------------------------------------------------------------------------------------------------/
| Program : WTUA:HazVeg/Hazardous Vegetation/NA/NA
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all HazVeg records.
|
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 10/19/2020 created script
|         : TDunn 11/09/2020 Updates to logic and formatting
|         : TDunn 11/11/2020 Added additional status rules and actions
|         : Abe   05/18/2023 changed "No additional action required" logic to end to "close out" per Estelle request  
|
/------------------------------------------------------------------------------------------------------*/

if(currentUserID == 'EAFTAHI'){ 
	showDebug = 3;
}

// get record AssignedToStaff for auto assignment and emails
var vToEmail = "";
var vStaffEmail = "emaxwell@placer.ca.gov"; 
var inspAssigned = "EMAXWELL";
logDebug("Staff default is: " + inspAssigned);
var assignedToEmail = ""; 
var assignedTo = getAssignedToStaff(); 
logDebug('assignedTo value: ' + assignedTo);
if(assignedTo != null) {
	inspAssigned = assignedTo;
	assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
	logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
	if(!matches(assignedToEmail,undefined,"",null)) {
		vStaffEmail = assignedToEmail;
	}
}
vToEmail = vToEmail + vStaffEmail + "; "; 

// Set actions for Complaint / Request Received
if(wfTask == "Complaint Received") {
	assignTask("Inspection",inspAssigned);
}

// Set actions for Inspection task statuses
if(wfTask == "Inspection") {
	if(wfStatus == "Non-compliant") {
		if(matches(getAppSpecific("Date Non-compliance Determined"),null,"")) {
			editAppSpecific("Date Non-compliance Determined",dateAdd(null,0));
		}
		if(!parcelConditionExists("Hazardous Vegetation")) {
			logDebug("Trying to add condition");
			conditionComment = capIDString + ": " + getShortNotes();
			conditionType = "Hazardous Vegetation";
			conditionStatus = "Applied(Applied)";
			conditionSeverity = "Notice";
			conditionName = "Active Hazardous Vegetation Case";
			capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
			logDebug("Is parcel result success: " + capParcelResult);
			if(capParcelResult.getSuccess()) {
				Parcels = capParcelResult.getOutput().toArray();
				parcelValidatedNumber = Parcels[0].getParcelNumber();
				logDebug("APN:" + parcelValidatedNumber + ", " + conditionType + ", " + conditionStatus + ", " + conditionName + ", " + conditionComment + ", " + conditionSeverity);
				addParcelCondition(parcelValidatedNumber,conditionType,conditionStatus,conditionName,conditionComment,conditionSeverity);
			}
		}
		assignTask("Action",inspAssigned);
	}
	if(wfStatus == "Compliant") {
		editAppSpecific("Compliance Date",dateAdd(null,0));
	}
}

if(matches(wfStatus,"Close Out","Compliant")) {
	removeParcelCondition(null,"Hazardous Vegetation","Active Hazardous Vegetation Case");

}

// Set actions for Action task statuses
if(wfTask == "Action") { 
	if(wfStatus == "Payment Required") {
		closeTask("Abatement","Notes","Closed by script, no further abatement required","");
	}
	if(matches(wfStatus,"Issued NOVOTA","Issued NOVOTA in the field")) {
		editAppSpecific("Date of Final NOVOTA",dateAdd(null,0)); 
		editAppSpecific("Appeal Deadline",dateAdd(null,15));
		if(matches(getAppSpecific("Date of First NOVOTA"),null,"")) {
			editAppSpecific("Date of First NOVOTA",dateAdd(null,0));
		}
		scheduleInspectDate("Site Inspection",dateAdd(null,30),inspAssigned); // add TSI field with days to follow-up inspection.
	}
	if(wfStatus == "Administrative Citation") {
		editAppSpecific("Date of Administrative Citation",dateAdd(null,0));
		editAppSpecific("Citation Appeal Deadline",dateAdd(null,15));
	}
	if(wfStatus == "No additional action required") {
		closeTask("Abatement","Notes","Closed by script, no further abatement required","No Additional Action Required");
		//branchTask("Payment Request","Notes","Closed by script, no fees due","");
                  closeTask("Payment Request","Notes","Closed by script, no fees due", "No Additional Action Required");
	}		
}

// Set actions for Hearing task statuses
if(wfTask == "Hearing") {
	if(wfStatus == "Hearing Scheduled") {
		editAppSpecific("Hearing Date",AInfo["Hearing Scheduled Date"]);
	}
	if(matches(wfStatus,"Appeal Denied","Citation Not Upheld","NOVOTA Not Upheld")) {
		editAppSpecific("Hearing Decision Date",dateAdd(null,0))
	}
}

// Set Actions for Abatement task statuses
// Add additional status for Inspection/Abatement warrant (add ASI for this as well) Add option for Citation fine payment in addition to recovery costs. (1000 civil remendy add headers to custom layout).
if(wfTask == "Abatement") {
	if(wfStatus == "Contractor Notified") {
		editAppSpecific("Abatement Contractor Notification Date",dateAdd(null,0));
	}
	if(wfStatus == "Abatement Warrant Issued") {
		editAppSpecific("Abatement Warrant",dateAdd(null,0));
	}
	if(wfStatus == "Abated") {
		editAppSpecific("Nuisance Abated Date",dateAdd(null,0));
	}
}

// Set Actions for Payment Request task statuses
if(wfTask == "Payment Request") {
	if(wfStatus == "1st Payment Request Sent") {
		editAppSpecific("Payment Request Date",dateAdd(null,0));
	}
	if(wfStatus == "2nd Payment Request Sent") {
		editAppSpecific("2nd Payment Request Date",dateAdd(null,0));
	}
	if(wfStatus == "Final Payment Request Sent") {
		editAppSpecific("Final Payment Request Date",dateAdd(null,0));
	}
	if(wfStatus == "Partial Payment Received") {
		editAppSpecific("Payment Received Date",dateAdd(null,0));
	}
	if(wfStatus == "Citation Fine Payment Received") {
		editAppSpecific("Citation Fine Payment",dateAdd(null,0));
	}
	if(wfStatus == "Payment Received") {
		editAppSpecific("Final Payment Received Date",dateAdd(null,0));
	}
}

// Set actions for Lien task statuses
if(wfTask = "Lien") {
	if(wfStatus == "Lien Approved by Board") {
		editAppSpecific("Lien Applied Date",dateAdd(null,0));
	}
}

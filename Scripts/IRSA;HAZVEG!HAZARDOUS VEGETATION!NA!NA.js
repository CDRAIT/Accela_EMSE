/*------------------------------------------------------------------------------------------------------/
| Program : IRSA:HazVeg/Hazardous Vegetation/NA/NA
| Event   : InspectionResultSubmitAfter
|
| Client  : Placer County (placerco)
| Usage   : Inspection Result Submit After for all HazVeg records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 10/19/2020 Created script
|         : TDunn 11/25/2020 added rules for updating workflow based on inspection results
|         : Abe   03/31/2025 Commented whole event regarding IT Req# 1986 - HV new WF
|                
| 
/------------------------------------------------------------------------------------------------------*/

/* Key inspection variables -/
| currentUserID
| Inspection #0
| inspId 16030809
| inspResult = Pass
| inspComment = null
| inspResultDate = 4/24/2019
| inspGroup = B_MAIN
| inspType = 6000-Final
| inspSchedDate = 4/25/2019
| inspTotalTime = null
/-------------------------*/

// Add parcel condition when Site Inspection is Corrective Action Required
// if(inspType == "Site Inspection") {
// 	// Update workflow on site inspection results
// 	if(inspResult == "Corrective Action Required") {
        
        
// 		branchTask("Inspection","Non-compliant","Last inspection result was 'Corrective Action Required'. Updated by script", "Non-Compliant");
// 		if(matches(getAppSpecific("Date Non-compliance Determined"),null,"")) {
// 			editAppSpecific("Date Non-compliance Determined",dateAdd(null,0));
// 		}

// 		// Add parcel condition when violation first verified
// 		logDebug("Parcel exists = " + parcelExistsOnCap());
// 		if(parcelExistsOnCap()) {
// 			if(!parcelConditionExists("Hazardous Vegetation")) {
// 				conditionComment = capIDString + ": " + getShortNotes();
// 				conditionType = "Hazardous Vegetation";
// 				conditionStatus = "Applied(Applied)";
// 				conditionSeverity = "Notice";
// 				conditionName = "Active Hazardous Vegetation Case";
// 				capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
				
// 				if(capParcelResult.getSuccess()) {
// 					Parcels = capParcelResult.getOutput().toArray();
// 					parcelValidatedNumber = Parcels[0].getParcelNumber();
// 					logDebug("APN:" + parcelValidatedNumber + ", " + conditionType + ", " + conditionStatus + ", " + conditionName + ", " + conditionComment + ", " + conditionSeverity);
// 					addParcelCondition(parcelValidatedNumber,conditionType,conditionStatus,conditionName,conditionComment,conditionSeverity);
// 				}
// 			}
// 		}
// 	}
// 	if(inspResult == "Unfounded") {
// 		closeTask("Inspection","Unfounded","No violation found on initial inspection. Closing case. Updated by script", "Unfounded");
// 	}
// 	if(inspResult == "Resolved") {
// 		branchTask("Inspection","Compliant","Last inspection result was 'Resolved'. Updated by script", "Resolved");
// 		removeParcelCondition(null,"Hazardous Vegetation","Active Harzardous Vegetation Case");
// 	}

// }



// if(inspResult == "Resolved") {
// 	removeParcelCondition(null,"Hazardous Vegetation","Active Harzardous Vegetation Case");
// }
/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Commercial!Full Review!~
|         //WTUA:Building/Commercial/Full Review/*
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Residential<3000 records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/18/2020 created script
|         : TDunn 04/08/2021 updated logic to add Employee Accommodation Fee
|         : TDunn 04/14/2021 added update to school district if ASI is not populated
|         : TDunn 05/25/2021 updated logic to use 'Yes' when to add fee and updated field name 
|         : TDunn 07/30/2021 updated fee codes for AH and EA fees
|
/------------------------------------------------------------------------------------------------------*/

// Workflow for Planning Review for Commercial
showDebug = false;
logDebug("School is: " + AInfo["ParcelAttribute.SCHOOL"]);
if(matches(AInfo["Elementary School District"],null,"","NA") && AInfo["ParcelAttribute.SCHOOL"] != null) {
	editAppSpecific("Elementary School District",AInfo["ParcelAttribute.SCHOOL"]); 
}

if(wfTask == "Planning Review" && wfStatus == "Complete") {
	/* Employee accommodation fee applies when: Mixed Use with residential, all new and some alteration for non residential when Elementary school district is Tahoe-Truckee unified school district. 
	  TSI 'Employee Accommodation Fee Applies' value is 'Y' or 'Yes'
	*/
	logDebug("School = " + AInfo["Elementary School District"] + ". And work = " + AInfo["Type of Work"] + "; and Scope = " + AInfo["Scope of Work"]);
	if(AInfo["Elementary School District"] == "TAHOE TRUCKEE UNIFIED SCHOOL DISTRICT" && AInfo["Type of Work"] == "New" && !matches(AInfo["Scope of Work"],"Church","Cell Tower","Convalescent or Home for the Elderly","Public Building")) {
		var eaApply = AInfo["Employee Accommodation Fee Applies"]; 
		logDebug("Inside first if, Exempt = " + AInfo["Employee Accommodation Fee Applies"]);
		
		if(matches(eaApply,"Y","Yes")) {	
			updateFee("TF-HSG EAF","AFFORDABLE HOUSING","FINAL",1,"N");
		}
		
	}
}
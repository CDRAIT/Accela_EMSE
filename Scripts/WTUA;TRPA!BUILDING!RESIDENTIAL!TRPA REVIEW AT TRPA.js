/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;TRPA!Building!Residential!TRPA Review at TRPA
|         //WTUA:TRPA/Building/Residential/TRPA Review at TRPA
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
|         : TDunn 06/09/2021 created version for TRPA Res
|         : TDunn 07/30/2021 updated fee codes for AH and EA fees
|
/------------------------------------------------------------------------------------------------------*/

// Workflow status actions for ADU/JADU
// Actions for 'Process for Issuance' task at'Issued' status
/* This section disabled pending deployment to production
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
			logDebug("Trying to add TF-HSG AHF");
			addFee("TF-HSG AHF","AFFORDABLE HOUSING","FINAL",1,"N");
		}

	}
}
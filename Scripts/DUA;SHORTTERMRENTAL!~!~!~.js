/*------------------------------------------------------------------------------------------------------/
| Program : DUA:ShortTermRental/star/star/star
| Event   : DocumentUploadAfter
|
| Client  : Placer County, CA (placerco)
| Usage   : Document Upload After for all STR records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|  
|   Notes : TDunn 12/23/2020 Created script
|
/------------------------------------------------------------------------------------------------------*/

// Disabled scripts line for Digiplan functionality pending implementation at a later date
// loadCustomScript("DUA_EXECUTE_DIGEPLAN_SCRIPTS_PLN");

logDebug("Inside DUA:ShortTermRental/*/*/* script");

// if (publicUser && capIDString.indexOf("TMP") == -1) {
	// var emailTemplateName = "DUA_PLANNING_STAFF_GEN_NOTIFICATION";
	// var docGroupArrayModule = ["PLANNING"];
	// var docTypeArrayModule = ["Plans","Correspondence","Arborist Report","Project Description Letter","HMIF","Application Form","CEQA","Chemical Inventory","Applicant Communication"];
	// var backupToEmail = "planning@menlopark.org";

	// emailDocUploadNotificationGen(docGroupArrayModule,docTypeArrayModule,emailTemplateName,backupToEmail);

// }

// Update status back to received after online document upload
if(publicUser) {
	updateAppStatus("Received","Documents uploaded");
}
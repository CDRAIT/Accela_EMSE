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
| Notes   : EAFTAHI 05/30/2022 created script
|         : EAFTAHI 05/30/2022 "Application Attachments" are downloadable only after Issue 
|         : EAFTAHI 04/17/2023 Auto-assign "ELECTRONIC UNASSIGNED - AUBURN/Tahoe" to "Plan Completeness Review" task 
|         : EAFTAHI 07/05/2023 Auto-assign "ELECTRONIC UNASSIGNED - AUBURN/Tahoe" to "Plan Check"
|         : mbecker 09/01/2023 PCCP Required Y auto email send task for PCCP group 
|         : TDunn   01/30/2023 PCCP notification requirement from 09/01/2023 superceded and remarked out.
|
/------------------------------------------------------------------------------------------------------*/


/** 
 *
 * 05/30/2022 
 * PRE-REQUISIT:  Remove download permission for ACA CAP Creator from "Application Attachment" policy
 * permission string: 0100000000, activates download only for CAP Creator
 * setViewRole() sets download permission only 
*/
showDebug =  false;
if (wfTask == "Process for Issuance" && wfStatus == "Issued") {
    docArray = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
    for (x in docArray)
        if (docArray[x].getDocCategory() == "Application Attachment") {


            docArray[x].setViewRole("0100000000");
            aa.document.updateDocument(docArray[x]);
        }
}


/**
 **
 ** eaftahi | Patrick H. Request   | 04/17/2023 
 **
 */
if (wfTask == "Department Distribution" && wfStatus == "Distribute" &&
    isTaskActive("Plan Completeness Review") && AInfo["Application Received"] == "Online") {

    if (AInfo["Project Office"] == "Auburn") assignTask("Plan Completeness Review", "ELECTRONIC UNASSIGNED - AUBURN");
    if (AInfo["Project Office"] == "Tahoe") assignTask("Plan Completeness Review", "ELECTRONIC UNASSIGNED - TAHOE");
}


/**
 * 
 * eaftahi | Front Counter (Cal Val) Request# 1609   | 07/05/2023
 * 
 * 
 */

if (((wfTask == "Application Submittal" && wfStatus == "Complete") || (wfTask == "Department Distribution" && wfStatus == "Not Required - Plan Check Only")) && isTaskActive("Plan Check", "BLD_20181201_MAIN" ) && AInfo["Application Received"] == "Online") {
    if (AInfo["Project Office"] == "Auburn") assignTask("Plan Check", "ELECTRONIC UNASSIGNED - AUBURN", "BLD_20181201_MAIN");
    if (AInfo["Project Office"] == "Tahoe") assignTask("Plan Check", "ELECTRONIC UNASSIGNED - TAHOE", "BLD_20181201_MAIN");
}

/* Remarked out 01/30/2024 by TDunn per new specification */
//Workflow process criteria added by TDunn, 07/28/2023
// Rules for 'current' workflow
/*
if (wfProcess == "BLD_20181201_DISTRIBUTION") {
  // Added by MBecker 9/1/2023
  if (
    wfTask == "Planning Review" &&
    matches(wfStatus, "Complete", "Plan Check Only") &&
    AInfo["PCCP Required"] == "Yes"
  ) {
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
}
*/
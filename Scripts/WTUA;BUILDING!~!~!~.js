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
|         : Abe     04/09/2025 IT Request# 1911 - EV Charging Station
|         : Abe     09/11/2025 IT Request# 2569 - WF Email Notification (It's for current workflow only - doesn't apply to DigEplan)

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


//IT Request# 1911 - EV Charging Station
if (matches(appTypeArray[1], "Residential", "Commercial") && appTypeArray[2] == "Limited")
  if (getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)")
    //supporting both new and old WfProcess
    if ((wfProcess == "BLD_20230501_MAIN" && wfTask == "Submittal Review" && wfStatus == "Submittal Accepted") ||
      (wfProcess == "BLD_20181201_MAIN" && wfTask == "Application Submittal" && wfStatus == "Complete")) {

      if (getAppSpecific("EVCS Units Qty") == "1-25 units")
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 20, " "));
      if (getAppSpecific("EVCS Units Qty") == "26+ units")
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 40, " "));
    }

//End of IT Request# 1911 - EV Charging Station 

//Satrt: IT Request# 2569 - WF Email Notification (It's for current workflow only - doesn't apply to DigEplan)    
if (wfTask == 'Planning Review' && matches(wfStatus, 'Complete', 'Plan Check Only'))
  if (isTaskStatus('Plan Completeness Review', 'incomplete')) {
    var templateName = "Staff_BLD_Planning_Approval_Notification";
    var emailCc = "BLDplancheck@placer.ca.gov";
    var emailTo = getTasksignedOffEmail("Plan Completeness Review", "BLD_20181201_DISTRIBUTION");
    var emailParams = aa.util.newHashtable();
    var contactName = getUserFullName();
    var contactEmail = getUserEmail();
    addParameter(emailParams, "$$signoffName$$", contactName);
    addParameter(emailParams, "$$signoffEmail$$", contactEmail);
    getRecordParams4Notification(emailParams); //"$$altID$$"
    var result = sendNotification(defaultFrom,emailTo,emailCc,templateName,emailParams,null);
  }
//End: IT Request# 2569 


/*------------------------------------------------------------------------------------------------------/
| <=========== Local Functions and Classes (Used by this script) ===========>
/------------------------------------------------------------------------------------------------------*/
function getTasksignedOffEmail(wfstr) // optional process name
{
  var useProcess = false;
  var processName = "";
  if (arguments.length == 2) {
    processName = arguments[1]; // subprocess
    useProcess = true;
  }

  var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
  if (workflowResult.getSuccess())
    wfObj = workflowResult.getOutput();
  else {
    logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
    return false;
  }

  for (var i in wfObj) {
    fTask = wfObj[i];
    if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
      var taskUserObj = fTask.getTaskItem().getSysUser();
      var userObj = aa.person.getUser(taskUserObj.getFirstName(), taskUserObj.getMiddleName(), taskUserObj.getLastName()).getOutput();
      return userObj.getEmail();
    }
  }
}
/*=============================================================================================
| Program : WTUA;ESD!IMPROVEMENT PLAN!~!~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all Code/Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : EAftahi 10/30/2023 created the script
| Update  : 
|         
/=============================================================================================*/

showMessage = false; showDebug = false;

if (wfTask == 'Construction Inspection' && wfStatus == 'Construction Complete') {
    var pParentCapId = capId;
    var pCustomId = pParentCapId.getCustomID();
    var cCapType = 'PublicWorks/Encroachment/*/*';
    var cChildCapId = childGetByCapType(cCapType, pParentCapId);

    if (cChildCapId && typeof (cChildCapId) != 'undefined') {      //if there's a Encr child
        var cCustomId = cChildCapId.getCustomID();
        var cWfstr = 'Final Inspections';
        var cProcessName = 'ESD_ENC';
        var cWfstat = 'Complete';
        var cWfcomment = "Completed by Script - 'Construction Inspection' completed on " + pCustomId + " (parent record)";
        var cWfnote = '';

        var workflowResult = aa.workflow.getTaskItems(cChildCapId, cWfstr, cProcessName, null, null, null);
        if (workflowResult.getSuccess())
            var wfObj = workflowResult.getOutput();
        else {
            logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
            //return false;
        }
        for (i in wfObj){
            var fTask = wfObj[i];
            if (fTask.getTaskDescription().toUpperCase().equals(cWfstr.toUpperCase()) && (fTask.getProcessCode().equals(cProcessName)) && fTask.getActiveFlag() == 'Y') {
                var dispositionDate = aa.date.getCurrentDate();
                var stepnumber = fTask.getStepNumber();
                var processID = fTask.getProcessID();  
                var dispositionResult = aa.workflow.handleDisposition(cChildCapId, stepnumber, processID, cWfstat, dispositionDate, cWfnote, cWfcomment, systemUserObj, "Y");
                if(dispositionResult.getSuccess()){
                    showMessage = true;
                    customComment("'Final Inspections' successfully completed on " + cCustomId + "!");
                }
            }
            else if (fTask.getTaskDescription().toUpperCase().equals(cWfstr.toUpperCase()) && (fTask.getProcessCode().equals(cProcessName)) && fTask.getActiveFlag() == 'N'){
                showMessage = true;
                customComment("'Final Inspections' on " + cCustomId  + " has already been signed off or inactive!");
            }
        }
    }
}
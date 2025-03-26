/*=============================================================================================
| Program : WTUB:Planning!Pre-Application!~!~
|
| Event   : WorkflowTaskUpdateBefore
|
| Client  : Placer County, CA
| Usage   : Development script for all Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 08/02/2023 added two new 'cancel' actions for Extension of Time records.
|
|         
|
/=============================================================================================*/

// Cancel 'Complete' status if target record number is invalid
//-------------------------------------------------------------
if(wfStatus == "Pre-Application Complete" && AInfo["Record Type"] == "Extension of Time")
{
	if(matches(AInfo["Extension of Time Permit Number"],null,"",undefined))
	{
			showMessage = true;
			customComment("There is no permit number provided for the extension of time project.  The Pre-Application cannot be designated as 'Complete'!");
			cancel = true;
	}else
	{
		myCapId = AInfo["Extension of Time Permit Number"]; 
		eCapId = aa.cap.getCapID(myCapId).getOutput();
		if(matches(eCapId,null,undefined,false))
		{
			showMessage = true;
			customComment("The provided permit/project number cannot be found. Please review and correct the permit/project number prior to attempting to resulting this Pre-Application as 'Pre-Application Complete'");
			cancel = true;
		}
	}
}


// custom 'comment' function.  This is actually in the INCLUDES_CUSTOM NOT this script. ** This has not been deployed or tested **
function customComment(cstr){
    var message= "<span style='display:flex; width:1200px; height:50px; background-color:#fff0f5; align-items: center; margin-top:20px; font-size:15px; font-weight: bold;'> <p>" +
    cstr + "</p></span>";
    
    if (showDebug) logDebug(message);
	if (showMessage) logMessage(message);
}
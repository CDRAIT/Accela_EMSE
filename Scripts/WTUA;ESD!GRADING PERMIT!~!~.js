/*=============================================================================================
| Program : WTUA:ESD/Grading Permit/~/~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : WTUA script for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : EAftahi 12/04/2023 Create script
|           TDunn 01/09/2024 Added standard event script header information.
|                            Standardized variable declaration and reorganized logic
|							 Added PCCP record created notification
|           TDunn 01/30/2024 updated for deployment to production.
|
/=============================================================================================*/
if(matches(currentUserID,"EAFTAHI","TDUNN")) { showDebug = 1;}
logDebug("Entering the EMSE WTUA:/ESD/GP/*/* ...");

if(matches(appTypeArray[1],"Grading Permit"))
{
	if(matches(wfTask,"Planning Review and CEQA Determination") && AInfo["PCCP Required"] == "Yes")
	{
		cCapId = childGetByCapType("PCCP/Land Conversion Authorization/*/*");
		if (matches(cCapId,null,undefined,false))
		{
			cCapId = createChild("PCCP","Land Conversion Authorization","NA","NA",capName);
			cCapIDString = cCapId.getCustomID();
			createPCCPNotification("PCCP_NOTIFICATION",cCapIDString);
			showMessage = true;
			comment("<font size = 3 color=ff000><b>This project is within the PCCP Plan Area. A PCCP record " + cCapId.getCustomID() + " has been created and must be authorized prior to permit completion</b></font>");
		}
		if(!matches(cCapId,null,undefined,false))
		{
			editTaskSpecific("Planning Review and CEQA Determination", "PCCP Record Number",cCapId.getCustomID());
		}
	}
}

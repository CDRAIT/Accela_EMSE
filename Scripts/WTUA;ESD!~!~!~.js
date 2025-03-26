/*=============================================================================================
| Program : WTUA:ESD/~/~/~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : WTUA script for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/09/2024 created script 
|           TDunn 01/10/2024 converted EMSE 2.0 code sections for PCCP child record creation to EMSE 3.0
|                            added creation of notification to all contacts and owners.
|           TDunn 01/30/2024 deployed EMSE 3.0 version to production. 
|           Abe   1031/2024  IT Request# 2201 - ESD Housing WF Task Edits  
|
/=============================================================================================*/
if(matches(currentUserID,"EAFTAHI","TDUNN")) { showDebug = 1;}
logDebug("Entering the EMSE WTUA:/ESD/*/*/* ...");


if(matches(appTypeArray[1],"Improvement Plan"))
{
	if(matches(wfTask,"Planning Review") && AInfo["PCCP Required"] == "Yes")
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
			editTaskSpecific("Planning Review", "PCCP Record Number",cCapId.getCustomID());
		}
	}
}

//START OF: IT Request# 2201 - ESD Housing WF Task Edits

if(matches(appTypeArray[1],"Final Subdivision Map"))
    if(wfTask == "Map Review Status" && wfStatus == "Dept Signoff Distribution" && isTaskActive("CEO Housing Unit Review")){
        var emailParams = aa.util.newHashtable();
        getRecordParams4Notification(emailParams);
        var dueDate = getTaskDueDate("CEO Housing Unit Review");
        addParameter(emailParams, "$$dueDate$$", dueDate.toDateString());
        var emailFrom = "";
        var emailTo = "";  
        var emailTemp = "ESD_CEO_HOUSING_REVIEW_NOTIFICATION_TO_STAFF";
        sendNotification(emailFrom, emailTo, "", emailTemp, emailParams, null);
    }
  
//END Of: IT Request# 2201 - ESD Housing WF Task Edits  
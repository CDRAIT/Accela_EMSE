/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Residential!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Building Residential records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn TPS 12/24/2025 Converted from EMSE 2.0 script
|         : TDunn 12/30/2025 updated criteria for setting Plan Check Expiration
|         : TDunn 01/07/2026 added additional 20181201 processes to criteria for running code
/---------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"TDUNN","EAFTAHI","MHELVIC"))
{
 	showDebug = 1;
}

logDebug("Running WTUA:Building/Residential ");
if(matches(wfProcess,"BLD_20181201_DISTRIBUTION","BLD_20181201_MAIN","BLD_20181201_REVISIONS"))
{
	if(matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Expiration Date",dateAdd(null,730));
	if(matches(wfTask,"Ready to Issue","Plan Check","Issue Status","Process for Issuance") && wfStatus == "Issued" && AInfo["Code Enforcement Action"] == "Yes")
		editAppSpecific("Expiration Date",dateAdd(null,182));
	if(matches(wfTask,"Application Submittal") && wfStatus == "Complete" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	if(isTaskStatus("Application Submittal","Complete","BLD_20181201_MAIN") && AInfo["Application Received"] == "Online" && AInfo["Code Enforcement Action"] != "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	if(isTaskStatus("Application Submittal","Complete","BLD_20181201_MAIN") && AInfo["Application Received"] == "Online" && AInfo["Code Enforcement Action"] == "Yes")
		editAppSpecific("Plan Check Expiration",dateAdd(null,182));
	if(wfTask == "Fire Review" && matches(wfStatus,"Complete","Revisions") && AInfo["Fire Conditions"] == "Yes")
		addStdCondition("Fire - Prevent Final / Completion", "Fire Department Final Inspection Required");
	if(wfTask == "Environmental Engineering Review" && matches(wfStatus,"Complete","Revisions") && AInfo["FAC Conditions"] == "Yes")
		addStdCondition("Env. Engineering - Prevent Final / Completion", "Environmental Engineering Final Inspection Required");
	if(wfTask == "Air Pollution Control District" && matches(wfStatus,"Complete","Revisions") && AInfo["APCD Final"] == "Yes") addStdCondition("Other - Prevent Final / Completion", "APCD Final Inspection Required");
	if(wfTask == "Planning Review" && matches(wfStatus,"Complete","Revisions") && AInfo["Planning Conditions"] == "Yes") addStdCondition("Planning - Prevent Final / Completion", "Planning Department Final Inspection Required");
	if(wfTask == "Environmental Health Review" && matches(wfStatus,"Complete","Revisions") && AInfo["Env Health Final"] == "Yes") addStdCondition("Env. Health - Prevent Final / Completion", "Environmental Health Final Inspection Required");
	if(wfTask == "Engineering and Surveying Review" && matches(wfStatus,"Complete","Revisions") && AInfo["ESD Conditions"] == "Yes") addStdCondition("ESD - Prevent Final / Completion", "Engineering and Surveying Final Inspection Required");
	if(wfTask == "Planning Review" && wfStatus == "Complete" && AInfo["Open Space Fee"] == "Yes") addFee("OSFH-RES","PCCP","FINAL",1,"N");
}

//IT Request# 1911 - EV Charging Station
if (appTypeArray[2] == "Limited")
{
  if (getAppSpecific("Type of Work") == "Alteration" && getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)")
  {
    // supporting both new and old WfProcess
    if ((wfProcess == "BLD_20230501_MAIN" && wfTask == "Submittal Review" && wfStatus == "Submittal Accepted") || (wfProcess == "BLD_20181201_MAIN  " && wfTask == "Application Submittal" && wfStatus == "Complete"))
	{
      if (getAppSpecific("EVCS Units Qty") == "1-25 units")
	  {
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 20, " "));
	  }
      else if (getAppSpecific("EVCS Units Qty") == "26+ units")
	  {
        editAppSpecific("EVCS Issuance Deadline", dateAdd(wfDateMMDDYYYY, 40, " "));
	  }
      else {
        logDebug('***Error***: "EVCS Units Qty" is undefined!');
	  }
	}
  }
}
//End of IT Request# 1911 - EV Charging Station  




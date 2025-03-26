/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;ShortTermRental!Enforcement!NA!NA
|         //WTUA:ShortTermRental/Enforcement/NA/NA
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all STR Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 08/18/2021 created script test
|         : TDunn 08/26/2021 updates to match new fields and other revisions to the spec.
|         : EAFTAHI 05/13/2022 Remove ASITABLE, add logic to the Investigation, Enforcement and Final Processing
|		  : EAFTAHI 06/01/2022 Remove all CASE STATUS related logic, No more need to Case Status (ASI Field)
|         : TDunn 02/20/2023 fixed inacurate references to TSI values to update corresponding ASI values.
|         : TDunn 02/20/2023 reinstated updates to Violations table on parent STR permit based on Case resolution
|         : TDunn 04/13/2023 Recreated some configuration elements to support script updates
|         : Abe   10/29/2024 IT Request# 2170 - Add Appeal Info to the Case STR's ASI

|
/---------------------------------------------------------------------------------------------------------------*/

if(currentUserID == "TDUNN" || currentUserID == "EAFTAHI") {
	showDebug = 1;
}

var tsiArray = new Array;
loadTaskSpecific(tsiArray);
var pCapId = null;
pCapId = getParent();
logDebug(pCapId);

var tableName = "VIOLATIONS";
var pvTable = new Array();
var vCaseNum = "";

if(!matches(pCapId,null,false,undefined,""))
{
	pvTable = loadASITable(tableName,pCapId);
}


/* Investigation */
if(wfTask == "Investigation") {
	if(matches(wfStatus,"Confirmed Violation","Resolved prior to arrival") && !matches(tsiArray["Site Finding"],null,"")){
		thisFinding = tsiArray["Site Finding"];
		logDebug("Other is " + tsiArray["Site Finding if Other"]);
		if(thisFinding == "Other" && !matches(tsiArray["Site Finding if Other"],null,"")) { 
			editAppSpecific("Other Site Finding",tsiArray["Site Finding if Other"]); 
		}
		editAppSpecific("Site Finding",thisFinding);
	}
	if(!matches(tsiArray["Local Contact Responded"],null,"")) {editAppSpecific("Local Contact Responded",tsiArray["Local Contact Responded"]);}
	if(!matches(tsiArray["Property Manager Responded"],null,"")) {editAppSpecific("Property Manager Responded",tsiArray["Property Manager Responded"]);}
	if(!matches(tsiArray["Property Owner Responded"],null,"")) {editAppSpecific("Property Owner Responded",tsiArray["Property Owner Responded"]);}
	if(!matches(tsiArray["Occupant Responded"],null,"")) {editAppSpecific("Occupant Responded",tsiArray["Occupant Responded"]);}
}


if(wfTask == "Enforcement" && !matches(wfStatus,"Notes","Appealed","Resolved","Resolved-Not in time frame")) {
	editAppSpecific("Action",wfStatus); 
	if(wfStatus == "Other") {
		editAppSpecific("Other Action",tsiArray["Action if Other"]);
	}
	if(matches(wfStatus,"1st Citation","2nd Citation") && !matches(tsiArray["Citation Number"],null,""))
	{
		editAppSpecific("Citation Number",tsiArray["Citation Number"]);
	}
}
	

if(wfTask == "Final Processing" && pCapId != null) 
{
	if(!matches(wfStatus,"Notes","Request for Payment") && pCapId != null) {
		for(thisRow in pvTable) 
		{
			vCaseNum = pvTable[thisRow]["Case #"].toString();
			vCapId = capIDString.toString();
			logDebug("Case #: " + capIDString + " Status = " + wfStatus);
			logDebug("vCapId = " + vCapId);
			logDebug("Case # in table = " + pvTable[thisRow]["Case #"]);
			logDebug("vCaseNum = " + vCaseNum);
			if(vCaseNum == vCapId) 
			{
				logDebug("Updating Status");
				pvTable[thisRow]["Status"] = String(wfStatus);
				if(!matches(wfComment,"",null)) 
				{
					pvTable[thisRow]["Additional Notes"] = String(wfComment);
				}
				if(!matches(AInfo["Violation"],"",null,undefined))
				{
					pvTable[thisRow]["Violation"] = String(AInfo["Violation"]);
					pvTable[thisRow]["Violation Code"] = String(AInfo["Violation Code"]);
				}
			}
		}
		removeASITable(tableName,pCapId); 
		addASITable(tableName,pvTable,pCapId);
	}
	editAppSpecific("Additional Notes",String(wfComment));
}

//START of: IT Request# 2170 - Add Appeal Info to the Case STR's ASI
if(wfTask == "Enforcement" && wfStatus == "Appealed"){
    editAppSpecific("Appealed", "Yes");
    editAppSpecific("Appeal Date", wfDateMMDDYYYY);
}

if(wfTask == "Hearing")
    editAppSpecific("Appeal Result", wfStatus);
//END of: IT Request# 2170 - Add Appeal Info to the Case STR's ASI

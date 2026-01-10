/*------------------------------------------------------------------------------------------------------/
| Program : CTRCA:Building/Residential/PV Solar/SolarApp Revision
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap after for all Solar Revision records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 01/17/2024 Created script
|         : MHelvic 07/01/2024 added digEplanTmpRecordConversion section.  Required for revisions when the altId is altered in the script.
|         : TDunn 07/01/2024 added new workflow task update rules, added appending revision workdesc to parent workdesc
|         : TDunn 07/11/2024 updated parent cap status to Issued; updated write to parent description to use newAltID
|                            added updating parent valuation based on delta with child rev valuation.
|         : TDunn 11/06/2024 modified formatting of revision description pushed up to parent.
|         : TDunn 11/13/2024 deployed to production
|         : TDunn 10/22/2025 updated logic for audit frequency and auto task assignment.
|
/---------------------------------------------------------------------------------------------------------------------*/
if(currentUserID == "TDUNN") 
{
	showDebug = 1;
}
logDebug("Inside CTRCA:Building/Residential/PV Solar/SolarApp Revision");

// Rules for standard issuance and post issuance audit
logDebug("executing code to test for select for audit");
var dontAudit = true;
var fAudit = 4;
var numCount = 0;
if(lookup("lkupScriptConstants","frequency") != undefined)
{
	fAudit = lookup("lkupScriptConstants","frequency");	
}
if(lookup("lkupScriptConstants","solarAppRev") != undefined)
{
	var strCount = lookup("lkupScriptConstants","solarAppRev");
	numCount = strCount * 1;
	var byFreq = numCount/fAudit;
	if(byFreq == byFreq.toFixed())
	{
	   dontAudit = false;
	}
	logDebug("Current count: " + numCount + ", byFreq: " + byFreq + ", dontAudit = " + dontAudit);
	numCount = numCount + 1;
	editLookup("lkupScriptConstants","solarAppRev",numCount.toString());
}


logDebug("Inside CTRCA:Building/Residential/PV Solar/SolarApp Revision");
// NOTES: create custom field 'Last Revision Number', default to zero (0).
var pCapId = "";
var cCapId = capId;
var revNumber = 0;
var vDelta = 1;
var parentCapString = aa.env.getValue("ParentCapID");
var newAltID ="Not updated";

logDebug("parentCapString= " + parentCapString);

var saveCap = cap; 
cap = aa.cap.getCap(parentCapString).getOutput();
if (parentCapString) 
{
	pCapIdSplit = String(parentCapString).split("-"); 
	pCapId = aa.cap.getCapID(pCapIdSplit[0],pCapIdSplit[1],pCapIdSplit[2]).getOutput(); 
	pCapIDString = pCapId.getCustomID(); 
	logDebug("Parent CAPID String= " + pCapIDString);
	revNumber = 1 * getAppSpecific("Last Revision Number",pCapId);

	var pvalobj = aa.finance.getContractorSuppliedValuation(pCapId,null).getOutput();	
	if (pvalobj.length) {
		//estValue = valobj[0].getEstimatedValue();
		pcalcValue = pvalobj[0].getCalculatedValue();
		//feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
		logDebug("Parent calc value: " + pcalcValue);
	}
	if(calcValue > pcalcValue)
	{
		vDelta = calcValue - pcalcValue;
		if(vDelta > 0)
		{
			addCalcValuation("CONTRACT PRICE","CONTRACT PRICE",vDelta,"2022",pCapId);
		}
		
	}
	
	logDebug("child calc value: " + calcValue);

	var recName = "SolarAPP+ Revision for " + pCapIDString;
	var childExt = "-REV";
	var	pWorkDesc = workDescGet(pCapId);
	// Create work description for revision
	var newWorkDesc = "";
	var cNewWorkDesc = "";
	var newPanel = "No";
	var panelAmps = "";
	newWorkDesc = "Solar App Plus Project ID: " + AInfo["Solar App ID"] + "\n\n" + "Scope: " + AInfo["Project Type"] + "\n\n" + "PV System Size: " + AInfo["System Size"] + " kW DC" + "\n\n" 
	+ "(" + AInfo["Number of Panels"] + ") PV Modules: " + AInfo["PV Module Manufacturer"] + "\n\n" 
	+ "(" + AInfo["Number of Inverters"] + ") Inverter(s): " + AInfo["Inverter Model Numbers"] + "\n\n" 
	if(matches(AInfo["Project Type"],"PV Solar and Storage")) 
	{
		newWorkDesc = newWorkDesc + "Energy Storage System Size: " + AInfo["Energy Storage System Size"] + " kWh" + "\n\n"
		+ "(" + AInfo["Number of ESS"] + ") ESS: " + AInfo["Energy Storage System Manufacturer"] + "\n\n" 
		+ "(" + AInfo["Number of Energy Management Systems"] + ") Energy Management Systems: " + AInfo["Energy Management System Manufacturer"] + "\n\n" 
	}
	
	if(matches(AInfo["Panel Upgrade"],"Y","Yes","YES"))
	{
		newPanel = "Yes";
		panelAmps =  "Proposed Main Panel Size: " + AInfo["Main Panel Amperage"] + "A" + "\n\n" 
	}
	newWorkDesc = newWorkDesc + "Main Panel Upgrade/Changeout: " + newPanel + "\n\n" + panelAmps;
	updateWorkDesc(newWorkDesc,capId);
	
	// Alternate formattting for revision description pushed up to parent.
	cNewWorkDesc = "Solar App Plus Project ID: " + AInfo["Solar App ID"] + "\n" + "Scope: " + AInfo["Project Type"] + "\n" + "PV System Size: " + AInfo["System Size"] + " kW DC" + "\n" 
	+ "(" + AInfo["Number of Panels"] + ") PV Modules: " + AInfo["PV Module Manufacturer"] + "\n" 
	+ "(" + AInfo["Number of Inverters"] + ") Inverter(s): " + AInfo["Inverter Model Numbers"] + "\n" 
	if(matches(AInfo["Project Type"],"PV Solar and Storage")) 
	{
		cNewWorkDesc = cNewWorkDesc + "Energy Storage System Size: " + AInfo["Energy Storage System Size"] + " kWh" + "\n"
		+ "(" + AInfo["Number of ESS"] + ") ESS: " + AInfo["Energy Storage System Manufacturer"] + "\n" 
		+ "(" + AInfo["Number of Energy Management Systems"] + ") Energy Management Systems: " + AInfo["Energy Management System Manufacturer"] + "\n" 
	}
	
	if(matches(AInfo["Panel Upgrade"],"Y","Yes","YES"))
	{
		newPanel = "Yes";
		panelAmps =  "Proposed Main Panel Size: " + AInfo["Main Panel Amperage"] + "A" + "\n" 
	}
	cNewWorkDesc = cNewWorkDesc + "Main Panel Upgrade/Changeout: " + newPanel + "\n" + panelAmps;
	//updateWorkDesc(cNewWorkDesc,capId);
	
	revNumber = revNumber + 1;
	
	newAltID = pCapIDString + childExt + formatRevNumber(revNumber);
	aa.cap.updateCapAltID(cCapId, newAltID);
	capIDString = newAltID;
	logDebug("Revision # " + newAltID);
	editAppSpecific("Last Revision Number",revNumber,pCapId);
	editAppSpecific("Project Office",getAppSpecific("Project Office",pCapId),cCapId);
	editAppSpecific("Type of Work",getAppSpecific("Type of Work",pCapId),cCapId);
	editAppSpecific("Scope of Work",getAppSpecific("Scope of Work",pCapId),cCapId);	
	editAppSpecific("Issued Date",dateAdd(null,0),cCapId);

	var pNewWorkDesc = "";
	pNewWorkDesc = "*** REVISION # " + newAltID + " - Issued on " + dateAdd(null,0) + "\n\n"
	+ "Nature of the Revision: " + AInfo["Scope of Work for Revisions"] + "\n\n"
	+ cNewWorkDesc + "----------------------------------------------------" + "\n\n" 
	+ pWorkDesc;
	newLength = pNewWorkDesc.length;
	logDebug("new description character length: " + newLength);
	updateWorkDesc(pNewWorkDesc,pCapId);
	
	copyAddresses(pCapId,cCapId);
	copyParcels(pCapId,cCapId);
	copyContacts(pCapId,cCapId);
	copyOwnerTPS(pCapId,cCapId);
	editAppName(recName,cCapId);
	
	// update workflow	
	if(dontAudit)
	{
		logDebug("standard workflow updates");
		closeTask("Process for Issuance","Issued","SolarApp Plus revision submittal auto issued via script","");
		updateAppStatus("Issued","Revision " + newAltID + " submitted via Citizen Portal, auto-issued and reset parent status to issued. Status updated by script",pCapId);

	}else{
		logDebug("executing audit workflow updates");
		branchTask("Process for Issuance","Issued","SolarApp Plus submittal auto issued via script","");
		assignTask("Document Verification Review","CSULLIVAN");
		editTaskDueDate("Document Verification Review",dateAdd(null,3));
	}	
	
	// Generatng report and notification
	var vAsyncScript = "CTRCA_BUILDINGRESIDENTIALPVSOLAR12";
	var envParameters = aa.util.newHashMap();
	envParameters.put("capId", capId);
	envParameters.put("cap", cap);
	envParameters.put("capIDString", newAltID);   
	logDebug("envParameters: " + envParameters);
	//call async script
	logDebug("Calling CTRCA_BUILDINGRESIDENTIALPVSOLAR12");
	// delay(4000);
	aa.runAsyncScript(vAsyncScript, envParameters);
	logDebug("Back from CTRCA_BUILDINGRESIDENTIALPVSOLAR12");
}	

//sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@govPath.tech","","Test: revision created " + newAltID, debug);


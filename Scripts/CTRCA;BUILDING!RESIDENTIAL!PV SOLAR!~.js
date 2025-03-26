/*=============================================================================================
| Program : CTRCA:Building/Residential/PV Solar/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Script for all Building/Residential PV Solar records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 09/15/2023 created EMSE 3.0 version
|         : TDunn 09/17/2023 added issuance email notification to applicant and updating the Issued and Expiration dates.
|         : TDunn 09/18/2023 added updating work description based on custom field data, updates of custom fields processed
|                            updates to notification for issuance.
|         : TDunn 09/19/2023 added logic for post issuance audit review.  
|         : TDunn 09/20/2023 Updated work description section
|         : TDunn 10/02/2023 extracted the permit generation call to a separate script called from the added aa.runAsyncScript(vAsyncScript, envParameters) lines
|         : TDunn 10/16/2023 added logic to update the capName collected in a custom field during the ACA submittal.
|         : TDunn 10/25/2023 added updating 'Issue Date' field on Record tab
|         : TDunn 10/26/2023 added new function to add row to Valuation table based on custom field 'Valuation' 
|         : TDunn 02/02/2024 remarked out Valuation update section.  Replaced by using Valution component in ACA pageflow
|
/========================================================================================================================================================*/
if(currentUserID == "TDUNN") 
{
	showDebug = 1;
}
logDebug("Running CTRCA:Building/Residential/PV Solar");
if(appTypeArray[3] == "Solar App")
{
	// Rules for standard issuance and post issuance audit
	logDebug("executing code to test for select for audit");
	var dontAudit = true;
	var fAudit = 6;
	var numCount = 0;
	if(lookup("lkupScriptConstants","solarApp") != undefined)
	{
		var strCount = lookup("lkupScriptConstants","solarApp");
		numCount = strCount * 1;
		bySix = numCount/fAudit;
		if(bySix == bySix.toFixed())
		{
		   dontAudit = false;
		}
		logDebug("Current count: " + numCount + ", bySix: " + bySix + ", dontAudit = " + dontAudit);
		numCount = numCount + 1;
		editLookup("lkupScriptConstants","solarApp",numCount.toString());
	}

	if(dontAudit)
	{
		logDebug("standard workflow updates");
		closeTask("Process for Issuance","Issued","SolarApp Plus submittal auto issued via script","");

	}else{
		logDebug("executing audit workflow updates");
		branchTask("Process for Issuance","Issued","SolarApp Plus submittal auto issued via script","");
		assignTask("Document Verification Review","TDUNN");
		editTaskDueDate("Document Verification Review",dateAdd(null,3));
	}
	

	logDebug("PV Solar is " + AInfo["Project Type"]);
	
	var newWorkDesc = "";
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
	editAppName(AInfo["Permit Name"]);
	editAppSpecific("Issued Date",dateAdd(null,0));
	editAppSpecific("Expiration Date",dateAdd(null,365));
	editFirstIssuedDate(dateAdd(null,0));

	// Remarked out on 02/02/2024, replaced by using Valuation Calculator component in ACA
	// var contValue = 0;
	// contValue = AInfo["Valuation"];
	// logDebug("contValue = " + contValue);

	// addCalcValuation("CONTRACT PRICE","CONTRACT PRICE",contValue,"2022",capId);
		
	// Generatng report and notification
	var vAsyncScript = "CTRCA_BUILDINGRESIDENTIALPVSOLAR12";
	var envParameters = aa.util.newHashMap();
	envParameters.put("capId", capId);
	envParameters.put("cap", cap);
	envParameters.put("capIDString", capIDString);   
	logDebug("envParameters: " + envParameters);
	//call async script
	logDebug("Calling CTRCA_BUILDINGRESIDENTIALPVSOLAR12");
	// delay(4000);
	aa.runAsyncScript(vAsyncScript, envParameters);
	logDebug("Back from CTRCA_BUILDINGRESIDENTIALPVSOLAR12");	

}
var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing CTRCA SolarApp script in Prod", debug);	


function delay(ms) {
    var cur_d = new Date();
    var ms_passed = 0;
    var d = new Date();
    try {
        java.lang.Thread.sleep(ms);
        d = new Date();
        ms_passed = d - cur_d;
        logDebug("Delayed " + ms_passed + "ms");
    }
    catch (err) {
        /*
        * This will happen if the sleep is woken up - you might want to check
        * if enough time has passed. (Handled in the while delay loop
        */
        d = new Date();
        ms_passed = d - cur_d;
        logDebug("sleep interrupted " + err.message + " delayed " + ms_passed + "ms");
    }
    d = new Date();
    ms_passed = d - cur_d;
    if (ms_passed < ms) { // If not enough time has passed execute while delay loop. CPU Intensive.
        while (ms_passed < ms) {
            d = new Date();
            ms_passed = d - cur_d;
        }
        logDebug("Continued delay until " + ms_passed + "ms");
    }
}

/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Code!Vehicle Abatement!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Vehicle Abatement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 05/13/2024 created script
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("In the WTUA:Code/Vehicle Abatement/*/* ...");

if (wfTask == "Request Received" && wfStatus == "Referred") {
	var emailParams = aa.util.newHashtable();
	addParameter(emailParams, "$$altID$$", capIDString);
	addParameter(emailParams, "$$emailSubject$$", "VEHICLE ABATEMENT REFERRAL");
	var templateName = "VA_GENERAL_TEMPLATE";
	var emailTo = "";
	var emailCC = "";

	var reportParams = aa.util.newHashMap();
	addParameter(reportParams, "RecordID", capIDString);
	var reportName = "Vehicle Referral Letter";
	var reportModule = "Code";
	var reportFile = null;


	if (AInfo["PCRD"] == "CHECKED")
		emailTo += lookup("SDL: C_VA_Ref_Agencies", "PCRD") + ";";
	if (AInfo["CHP"] == "CHECKED")
		emailTo += lookup("SDL: C_VA_Ref_Agencies", "CHP") + ";";
	if (AInfo["PCSO"] == "CHECKED")
		emailTo += lookup("SDL: C_VA_Ref_Agencies", "PCSO") + ";";
	if (AInfo["Other"] == "CHECKED")
		emailTo += AInfo["OtherEmail"] + ";";


	reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Vehicle_Abatement_Rreferral_Permit# " + capIDString + ".pdf");

	if (emailTo != null && emailTo != "" && emailTo != " ")
		if (emailTo.indexOf('@') != -1)
			sendNotification("", emailTo, emailCC, templateName, emailParams, new Array(reportFile));
		else
			logDebug("*** Error Sending Email: Agency Email Corrupted!");
}

if (wfTask == "Vehicle Tagging" && wfStatus == "DMV Search & Vehicle Tagging") {
	editAppSpecific("ClaimLetterSent", wfDateMMDDYYYY);
	createAttachClaimLtrRefunctionport();
}


/*=======================================
  Local Functions  
/========================================*/
function createAttachClaimLtrReport() {
	var reportName = "Vehicle Claim Letter";
	var reportModule = "Code";
	var reportParams = aa.util.newHashMap();
	addParameter(reportParams, "RecordID", capIDString);

	var licPlate = '';
	var vin = '';
	var model = '';
	var make = '';
	var regStatus = '';


	for (var index = 1; index <= getAppSpecific("Number of Vehicles"); index++) {
		licPlate = getAppSpecific("VPlate_" + index.toString());
		vin = getAppSpecific("VIN_" + index.toString());
		model = getAppSpecific("VModel_" + index.toString());
		make = getAppSpecific("VMake_" + index.toString());
		regStatus = getAppSpecific("VRegStatus_" + index.toString());
		if (regStatus != "Stolen") {
			addParameter(reportParams, "vehPlate", licPlate);
			addParameter(reportParams, "vehVIN", vin);
			addParameter(reportParams, "vehMake", make);
			addParameter(reportParams, "vehModel", model);

			if (!matches(getAppSpecific("VOwnerName_" + index.toString()), null, "", " ")) {
				addParameter(reportParams, "contactName", getAppSpecific("VOwnerName_" + index.toString()), null, "", " ");
				address = getAppSpecific("VOwnerAddress_" + index.toString()) + '\n' +
					getAppSpecific("VOwnerCity_" + index.toString()) + ', ' + getAppSpecific("VOwnerState_" + index.toString()) + ' ' +
					getAppSpecific("VOwnerZip_" + index.toString());
				addParameter(reportParams, "contactAddress", address);
				//generateReport(reportName, reportParams, reportModule, "Claim_Ltr_" + licPlate + "_Owner");
				if (generateReportPCO(reportName, reportParams, reportModule)) {
					var docList = aa.document.getCapDocumentList(capId, "ADMIN").getOutput();
					docList[docList.length - 1].setDocName("Claim_Ltr_" + licPlate + "_Owner"); //last Document just uploaded		
					aa.document.updateDocument(docList[docList.length - 1]);
				}
				if (!matches(getAppSpecific("VLienName_" + index.toString()), null, "", " ")) {
					addParameter(reportParams, "contactName", getAppSpecific("VLienName_" + index.toString()), null, "", " ");
					address = getAppSpecific("VLienAddress_" + index.toString()) + '\n' +
						getAppSpecific("VLienCity_" + index.toString()) + ', ' + getAppSpecific("VLienState_" + index.toString()) + ' ' +
						getAppSpecific("VLienZip_" + index.toString());
					addParameter(reportParams, "contactAddress", address);

					if (generateReportPCO(reportName, reportParams, reportModule)) {
						var docList = aa.document.getCapDocumentList(capId, "ADMIN").getOutput();
						docList[docList.length - 1].setDocName("Claim_Ltr_" + licPlate + "_Lienholder"); //last Document just uploaded
						aa.document.updateDocument(docList[docList.length - 1]);
					}
				}
				if (!matches(getAppSpecific("VBuyerName_" + index.toString()), null, "", " ")) {
					addParameter(reportParams, "contactName", getAppSpecific("VBuyerName_" + index.toString()), null, "", " ");
					address = getAppSpecific("VBuyerAddress_" + index.toString()) + '\n' +
						getAppSpecific("VBuyerCity_" + index.toString()) + ', ' + getAppSpecific("VBuyerState_" + index.toString()) + ' ' +
						getAppSpecific("VBuyerZip_" + index.toString());
					addParameter(reportParams, "contactAddress", address);
					if (generateReportPCO(reportName, reportParams, reportModule)) {
						var docList = aa.document.getCapDocumentList(capId, "ADMIN").getOutput();
						docList[docList.length - 1].setDocName("Claim_Ltr_" + licPlate + "_Buyer"); //last Document just uploaded
						aa.document.updateDocument(docList[docList.length - 1]);
					}
				}
			}
		}
	}
}

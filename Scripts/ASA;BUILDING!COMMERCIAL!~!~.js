/*=============================================================================================
| Program : ASA:Building/Commercial/~/~
|
| Event   : ApplicationSpecificUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all Building/Commercial records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/11/2022 created 3.0 version
|         : TDunn Note disable the corresponding standard choice script.
|         : eaftahi 12/03/2025 Added IT Request# 2698
|
/=============================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:Building/Commercial");

var varAutoInvoiceFees = "N"
var	varLookupTable = "Commercial Scope of Work";

if(appTypeArray[2] == "Limited") {
	varLookupTable = "OTC Scope of Work Commercial"; 
}

// Add fees for v360 new record
if(!publicUser) {
	var varSpecialFees = ""; 
	var varSpecialFees = lookup(varLookupTable,getAppSpecific("Scope of Work")); 
	var specFeeCodes = new Array();
	specFeeCodes = varSpecialFees.split(",");
	for(thisCode in specFeeCodes) {
		var doSPfees = false; 
		var addedSPFees = "";
		var fsFlag = "None";
		if(specFeeCodes[thisCode] != null) {
			varIsFeeSched = specFeeCodes[thisCode]; 
			fsFlag = varIsFeeSched.substring(0,3);
		}
		if(fsFlag == "FS|") {
			fSchedName = varIsFeeSched.substring(3); 
			logDebug("Sched Name = " + fSchedName); 
			addAllFees(fSchedName,"FINAL",1,"N");
		}
		var feeFlag = "None";
		if(specFeeCodes[thisCode] != null) {
			varIsFee = specFeeCodes[thisCode]; 
			feeFlag = varIsFee.substring(0,3);
		}
		if(feeFlag == "FF|") {
			feeName = varIsFee.substring(3); 
			updateFee(feeName,"B_COM","FINAL",1,"N");
		}
		if(fsFlag == "SP|" && AInfo["Type of Work"] == "New") {
			landUse = varIsFeeSched.substring(3); 
			logDebug("Land Use code is " + landUse);
			if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
				addedSPFees = addSpFeesTPS(landUse); 
				logDebug("SP fees applied = " + addedSPFees);
			}
		}
		if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0747") {updateFee("0747","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0748") {updateFee("0748","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0749") {updateFee("0749","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FF9053") {updateFee("9053","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FMITCM") {
			addFee("FIRE-MITCM","B_COM","FINAL",1,"N");
		} else {
			updateFee("FIRE-MITCM","B_COM","FINAL",0,"N");
		}
	}
	if(appTypeArray[2] != "Business License") {
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	}
	if(AInfo["Third Party Review"] == "Yes") {
		addFee("0113", "B_COM", "FINAL",1,"N"); removeFee("0102","FINAL");
	}
	//IT Request# 2698
	if(AInfo["Scope of Work"] == "Permanent Membrane Structure"){
		addFee("0913", "B_COM", "FINAL",2,"N");
	}
	//end of IT Request# 2698

	// Adding new TECH fee
	if(matches(appTypeArray[2],"Full Review","Limited")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
}
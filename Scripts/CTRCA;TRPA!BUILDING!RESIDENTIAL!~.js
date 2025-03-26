/*=============================================================================================
| Program : CTRCA;TRPA!Building!Residential!~
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap after for all TRPA Residential records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/10/2022 Added fee scripting for publicUser submittals
|         : Abe   02/20/2024 Modified the ADU/JADU Fees' logic based on the new ASI fields																					
|
|
/==========================================================================================================*/
logDebug("Running CTRCA:TRPA Residential");
var varAutoInvoiceFees = "N";
var spTypeFlag = true;
var varLookupTable = "Residential Scope of Work";
if(matches(appTypeArray[2],"Residential","Multi-Family")) {varLookupTable = "Residential Scope of Work";}
if(matches(appTypeArray[3],"Project","TRPA Review at TRPA")) {varLookupTable = "Residential 3000plus Scope of Work";}
if(matches(appTypeArray[2],"Non-Residential")) {varLookupTable = "Commercial Scope of Work";}

logDebug("Fee lookup table is " + varLookupTable);

if(publicUser) {
	var varSpecialFees = "";
	var specFeeCodes = new Array(); 	
	var fsFlag ="";
	var feeCodes ="";
	var fSchedName = "";
	var feeName = "";
	var thisQty = 1;
	var thisScope = getAppSpecific("Scope of Work");
	var thisADU = ""; 
	var thisJADU = "";
	var addFeeFlag = true;
	var slFlags = "";
	var slFlagCodes = new Array();	
	var slLookupTable = "sdl:Land Use Codes";
	varSpecialFees = lookup(varLookupTable,thisScope); 
	specFeeCodes = varSpecialFees.split(",");
	if(matches(appTypeArray[3],"Project","TRPA Review at TRPA")) {
		// thisADU = getAppSpecific("ADU/JADU");
		thisADU = getAppSpecific("ADU Required");
        thisJADU = getAppSpecific("JADU Required");
	}
	for(thisCode in specFeeCodes) {
		var fsFlag = "None";
		if(specFeeCodes[thisCode] != null) {
			feeCodes = specFeeCodes[thisCode];
			fsFlag = feeCodes.substring(0,3);
			
			if(fsFlag == "FS|") {
				fSchedName = feeCodes.substring(3); 
				addAllFees(fSchedName,"FINAL",1,varAutoInvoiceFees);
			}
			if(fsFlag == "FF|") {
				thisQty = 1;
				addFeeFlag = true;
				feeName = feeCodes.substring(3);
				// update fee quantity when New and has ADU/JADU
				// Abe 02/20/2024: modified the adu/jadu fees based on the new ASI fields
				// if(matches(appTypeArray[3],"Project","TRPA Review at TRPA") && matches(thisScope,"Single Family > 3000") && thisADU != "Primary Residence" && matches(feeName,"0751","0752")) {
				if(matches(appTypeArray[3],"Project","TRPA Review at TRPA") && matches(thisScope,"Single Family > 3000") && matches(feeName,"0751","0752")) {
					if(thisADU == "Yes" && thisJADU == "No") {thisQty = getAppSpecific("ADU SqFt")/getAppSpecific("Primary Residence sqft");}
					if(thisADU == "No" && thisJADU == "Yes") {thisQty = getAppSpecific("JADU SqFt")/getAppSpecific("Primary Residence sqft");}
					if(thisADU == "Yes" && thisJADU == "Yes") {thisQty = (getAppSpecific("JADU SqFt") *1 + getAppSpecific("ADU SqFt") * 1)/getAppSpecific("Primary Residence sqft");}
					thisQty = thisQty.toFixed(4);
					logDebug("Quantity = " + thisQty);
				}
				if(thisScope =="Accessory Dwelling Unit" && matches(feeName,"0750","0754","0756")) {
					sqftADU = getAppSpecific("ADU SqFt");
					if(sqftADU < 750) {
						addFeeFlag = false;
					}
					if(sqftADU > 750) {
						if(thisADU == "Yes" && thisJADU == "No") {thisQty = getAppSpecific("ADU SqFt")/getAppSpecific("Primary Residence sqft");}
						if(thisADU == "Yes" && thisJADU == "Yes") {thisQty = (getAppSpecific("JADU SqFt") *1 + getAppSpecific("ADU SqFt") * 1)/getAppSpecific("Primary Residence sqft");}
						thisQty = thisQty.toFixed(4);
						logDebug("Quantity = " + thisQty);
						// actual is ratio of primary sqft to adu sqft for over 750 sqft of adu/jadu and no upper limit. when with primary use same calc.
						// less than 750 sqft
					}
				}
					
				if(addFeeFlag) {
					updateFee(feeName,"B_RES","FINAL",thisQty,varAutoInvoiceFees);
				}
			}
			if(fsFlag == "SP|" && spTypeFlag) {
				landUse = feeCodes.substring(3);
				logDebug("Land Use code is " + landUse);
				if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
					slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
					slFlagCodes = slFlags.split(";");

					for(thisFlag in slFlagCodes) {
						luCode = slFlagCodes[thisFlag];
						newCode = luCode.trim();
						logDebug("This flag is " + newCode);

						if(lookup(slLookupTable,newCode) != null) {
							logDebug("This is a land use code");
							if(newCode == landUse) {
								logDebug("Land use from fee list lookup matches this land use");
								var slFeeList ="";
								var slFeeArray = new Array();
								var spDev = newCode.substring(0,2);
								if(newCode == "RVMPLD") {spDev = newCode;}								
								var slFeeSched = lookup("sdl:SP Fee Schedules",spDev);
								logDebug("This is the fee schedule " + slFeeSched);
								slFeeList = lookup(slLookupTable,newCode);
								slFeeArray = slFeeList.split(",");
								for(thisSlFee in slFeeArray) {
									slFeeCode = slFeeArray[thisSlFee];
									updateFee(slFeeCode,slFeeSched,"FINAL",1,varAutoInvoiceFees);
								}
							}
						}

					}
					
				}
				
				
			}
			logDebug("thisCode = " + specFeeCodes[thisCode]);
		}
	}
	// Add new TECH fee for affected TRPA record types
	if((matches(appTypeArray[2],"Multi-Family","Non-Residential","Residential")&& matches(appTypeArray[3],"Project","Qualified Exempt","TRPA Review at TRPA"))){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
	if(getAppSpecific("Third Party Review") == "Yes") {
		addFee("0713", "B_RES", "FINAL",1,varAutoInvoiceFees); 
		removeFee("0715","FINAL");
	}
}
/*=============================================================================================
| Program : ASIUA;Building!Commercial!Full Review!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all Residential Full records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 10/28/2021 created script.   Manages adding special fees based on land use and scope
|         : Abe   10/27/2025 IT REQUEST 2694 - Pool Letter ASI
|
/==============================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}

// Initilize variables and lookups

logDebug("Inside Building Commercial Full");
var varLookupTable = "Commercial Scope of Work";
var varSpecialFees = ""; 
varSpecialFees = lookup(varLookupTable,getAppSpecific("Scope of Work")); 
var specFeeCodes = new Array(); 
specFeeCodes = varSpecialFees.split(",");
for(thisCode in specFeeCodes) {
	if(specFeeCodes[thisCode] != null) {
		logDebug("spec fee code is " + specFeeCodes[thisCode]);
		varIsFeeSched = specFeeCodes[thisCode];
		fsFlag = varIsFeeSched.substring(0,3);
		logDebug("Fs flag is " + fsFlag);
	}else {
		fsFlag = "None";
	}
	logDebug("FS flag after else is " + fsFlag);
	if(fsFlag == "SP|" && AInfo["Type of Work"] == "New") {
		landUse = varIsFeeSched.substring(3); 
		logDebug("Land Use code is " + landUse);
		
		if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
			var slFlags = "";  
			var slFlagCodes = new Array();   
			var slLookupTable = "sdl:Land Use Codes"; 
			var pvspFeeType = AInfo["PVSP Impact Fee Type"];
			var foundFees = false;
			if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
				slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
				
				slFlagCodes = slFlags.split(";");
				// PVLDRAAC
				for(thisFlag in slFlagCodes) {
					luCode = slFlagCodes[thisFlag];
					newCode = luCode.trim();
					// newCode = "PVCMU";

					if(lookup(slLookupTable,newCode) != null) {
						logDebug("This is a land use code");
						if(newCode == landUse) {
							logDebug("Land use from fee list: (" + landUse + ") lookup matches this land use: " + newCode);
							if(matches(landUse,"PVCMU","PVO","PVCOM")) {
								spDev = newCode.substring(0,2);
								if(pvspFeeType == "Commercial") {
									spCode = spDev + "SPC";
								}
								if(pvspFeeType == "Industrial") {
									spCode = spDev + "SPI";
								}
								slFeeSched = lookup("sdl:SP Fee Schedules",spDev);
								logDebug("This is the fee schedule " + slFeeSched);
								slFeeList = lookup(slLookupTable,spCode);
								slFeeArray = slFeeList.split(",");
								for(thisSlFee in slFeeArray) {
									slFeeCode = slFeeArray[thisSlFee];
									logDebug("Fee code is " + slFeeCode);
									updateFee(slFeeCode,slFeeSched,"FINAL",1,"N");
								}
								foundFees = true;
							}
						}
						
					}
				}
				
			}
		}
	}
}


// IT REQUEST 2694 - Pool Letter ASI
if(getAppSpecific("Pool Letter Mailed") == "CHECKED") {
	createCapComment("Pool Safety Regulation letter mailed.");
}


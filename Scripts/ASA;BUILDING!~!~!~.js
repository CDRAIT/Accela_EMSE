/*=============================================================================================
| Program : ASA:Building/~/~/~
|
| Event   : ApplicationSpecificUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 04/28/2020 created production version
|         : Abe   04/09/2025 IT Request# 1911 - EV Charging Station 
|         
|
/=============================================================================================*/
if(matches(currentUserID,"TDUNN","JMCKENZI", "EAFTAHI")) { showDebug = 1;}

logDebug("Running ASA:Building for SP Fees and std condition");

	var slFlags = "";
	var slFlagCodes = new Array();
	var slFeeSched = "SP_PLACER_VINEYARDS";
	var slFeeList ="";
	var slFeeArray = new Array();
	var feeName = "";
	var thisQty = 1;
	var thisScope = getAppSpecific("Scope of Work");
	var thisADU = ""; 
	var addFee = true;
	var slLookupTable = "sdl:Land Use Codes";
	if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
		slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
	    
		slFlagCodes = slFlags.split(";");
		// MARIPOSA SEWER REIMBURSEMENT FLAG; PVLDRAAC	
		for(thisFlag in slFlagCodes) {
			luCode = slFlagCodes[thisFlag];
			newCode = luCode.trim();
			logDebug("This flag is " + newCode);
			if(newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
				logDebug("Trying to add condition");
				addStdCondition("Env. Engineering - Notification","Reimbursement Agreements for Sewer");
			}
		}
	}

//IT Request# 1911 - EV Charging Station
if (!publicUser)
    if (matches(appTypeArray[1], "Residential", "Commercial") && appTypeArray[2] == "Limited")
        if (getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)") {
            if (getAppSpecific("EVCS Units Qty") == "1-25 units")
                editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 5, " "));

            if (getAppSpecific("EVCS Units Qty") == "26+ units")
                editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 10, " "));
        }

//End of IT Request# 1911 - EV Charging Station 

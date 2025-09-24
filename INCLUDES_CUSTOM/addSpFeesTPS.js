function addSpFeesTPS(landUse) {

	var slFlags = "";
	var slFlagCodes = new Array();
	var slLookupTable = "sdl:Land Use Codes";
	var pvspFeeType = AInfo["PVSP Impact Fee Type"];
	var foundFees = false;
	if (AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
		slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];

		slFlagCodes = slFlags.split(";");
		// PVLDRAAC
		for (thisFlag in slFlagCodes) {
			luCode = slFlagCodes[thisFlag];
			newCode = luCode.trim();
			// newCode = "PVCMU";
			if (lookup(slLookupTable, newCode) != null) {
				logDebug("This is a land use code");
				if (newCode == landUse) {
					logDebug("Land use from fee list lookup matches this land use");
					var slFeeList = "";
					var slFeeArray = new Array();
					var spDev = newCode.substring(0, 2);
					if (newCode == "RVMPLD") { spDev = newCode; }
					var slFeeSched = lookup("sdl:SP Fee Schedules", spDev);
					logDebug("This is the fee schedule " + slFeeSched);
					slFeeList = lookup(slLookupTable, newCode);
					slFeeArray = slFeeList.split(",");
					for (thisSlFee in slFeeArray) {
						slFeeCode = slFeeArray[thisSlFee];
						updateFee(slFeeCode, slFeeSched, "FINAL", 1, "N");
					}
					foundFees = true;
				}
			}
			var foundCode = true;
			if (lookup(slLookupTable, newCode) != null) {
				logDebug("This is a land use code");
				if (newCode == landUse && foundCode) {
					logDebug("Land use from fee list lookup matches this land use");
					if (matches(landUse, "PVCMU", "PVO", "PVCOM")) {
						spDev = newCode.substring(0, 2);
						if (pvspFeeType == "Commercial") {
							spCode = spDev + "SPC";
						}
						if (pvspFeeType == "Industrial") {
							spCode = spDev + "SPI";
						}
						slFeeSched = lookup("sdl:SP Fee Schedules", spDev);
						logDebug("This is the fee schedule " + slFeeSched);
						slFeeList = lookup(slLookupTable, spCode);
						slFeeArray = slFeeList.split(",");
						for (thisSlFee in slFeeArray) {
							slFeeCode = slFeeArray[thisSlFee];
							logDebug("Fee code is " + slFeeCode);
							// updateFee(slFeeCode,slFeeSched,"FINAL",1,"N");
						}
						// foundCode = false;
						foundFees = true;
					}
				}

			}
		}

	}
	return foundFees;
}

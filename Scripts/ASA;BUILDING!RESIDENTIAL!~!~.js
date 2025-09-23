/*=============================================================================================================================
| Program : ASA;Building!Residential!~!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all Residential Full records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 09/15/2020 created script
|         : TDunn 11/18/2020 added new logic to auto calc impact fees for Res <3000 when new and ADU
|         : TDunn 02/24/2021 added new logic to include Res > 3000 for ADU and JADU fee rules
|         : GWL   07/06/2021 add initialization of varLookupTable to default as "Residential Scope of Work"
|         : TDunn 10/11/2021 added scripting for SP fees
|         : TDunn 10/21/2021 updated SP fee scripts to manage new SP schedule
|         : TDunn 07/07/2022 added Tract > 3000 and < 3000 to ADU/JADU scripting rules
|         : EAftahi 10/18/2023 modified rules to meet the latest Custom Fields updates
|         : TDunn 11/06/2023 added SolarApp+ fee rules
|         : TDunn 11/14/2023 added additional logic to include SolarApp+ as an 'exception' for adding and collecting fees online.
|         : EAftahi 12/07/2023 IT Request # 1865 - added "Addressing" Ad Hoc task 
|	  : EAftahi 11/18/2023 IT Request # 1590 - Tracking ADUs - changed the code based on new ASI fields		
|         : EAftahi 03/07/2024 IT Request # 1978 - do not Auto Invoice 'Solar Roof Mount' fees
|	  : EAftahi 04/29/2024 IT Request # 1998 - ADU Ad-Hoc Task - adds Ad-Hoc task for ADU/JADU permits(ADU Review & Addressing)
|         : TDunn   08/14/2024 during restore process kept production version and added new editDueDate rule for new workflow.
|         : Abe     10/17/2024 IT Request # 2059 Auto Create Flag for SPMUD (Utility Geocode)
|         : TDunn   03/22/2025 Disabled dolimited flag for limited scope records to eliminate add fees at ACA for testing.
|         : TDunn   08/28/2025 Added Abe IT request #2221 code to 'test' script version
|         : TDunn   08/28/2025 added Abe IT request # 2493
|         : TDunn   08/29/2025 copied to Non-prod1
|         : TDunn   08/29/2025 deployed to GitHub
|         : Abe     09/02/2025 IT Request # 2504 - Added Fee code 0515 to the SolarApp Fee Calculations
|         : TDunn   09/23/2025 added try clause on IT requests 1978 and 2221
|
/================================================================================================================================*/
if (currentUserID == "TDUNN" || currentUserID == "EAFTAHI") {
    showDebug = 1;
}
logDebug("Running ASA:Building Residential");
var varAutoInvoiceFees = "N";
//Abe: IT Request # 1978 - Online Solar Submittal: 
//do not auto invoice limited Solars fees - commented the related code and added "Solar App" only

// if(cap.isCreatedByACA() && (appMatch("Building/Residential/Limited/*") || appTypeArray[3] == "Solar App" )) 
// {
// 	varAutoInvoiceFees = "Y";
// }
try
{
	if (cap.isCreatedByACA() && ((appMatch("Building/Residential/Limited/*") && !matches(getAppSpecific("Scope of Work"), "Solar Roof Mount")) || appTypeArray[3] == "Solar App")) 
	{
		varAutoInvoiceFees = "Y";
	}
	//end of IT Request # 1978 - Online Solar Submittal

	//IT Request# 2221 - SB937 - Fee Deferral
	if (!publicUser)
		if (appTypeArray[2] == "Full Review" && (matches(appTypeArray[3], "Other", "Residential<3000", "Residential>3000", "Tract < 3000", "Tract > 3000")))
			if (matches(getAppSpecific("Type of Work"), "Addition", "Manufactured Home", "New", "Farmworker Housing") && getAppSpecific("YesToFeeDeferral") == "CHECKED")
				addStdCondition("Building - Prevent Final / Completion", "SB-937 Mitigation Fee Act");

	//End of IT Request# 2221
}catch(err)
{
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Test: ASA:Building/Residential try error1 ", err.message);	
}


try
{
	var spTypeFlag = true;
	var doLimited = false;
	var doSolarApp = false;
	var varLookupTable = "Residential Scope of Work";
	// Assess Fees
	if (appTypeArray[2] == "Limited") { varLookupTable = "OTC Scope of Work"; }
	if (appTypeArray[3] == "Tract-Third Party Rev. < 3000") { varLookupTable = "Third Party Review"; }
	if (appTypeArray[3] == "Residential<3000") { varLookupTable = "Residential 3000 Scope of Work"; }
	if (appTypeArray[3] == "Residential>3000") { varLookupTable = "Residential 3000plus Scope of Work"; }
	if (appTypeArray[3] == "Solar App") {
		varLookupTable = "SolarApp Scope of Work";
		doSolarApp = true;
	}
	if (appTypeArray[2] == "Limited" && publicUser) {
		varLookupTable = "OTC Scope of Work ACA";
		// doLimited = true;	// Remarked this out for testing to remove adding fees at ACA submittal
		spTypeFlag = false;
		logDebug("Is limited = " + doLimited);
	}
	if (appTypeArray[3] == "Tract < 3000") {
		varLookupTable = "ResidentialTract < 3000";
		if (!matches(AInfo["Type of Work"], "New", "Manufactured Home")) {
			spTypeFlag = false;
		}
	}

	if (appTypeArray[3] == "Tract > 3000") {
		varLookupTable = "ResidentialTract > 3000";
		if (!matches(AInfo["Type of Work"], "New", "Manufactured Home")) {
			spTypeFlag = false;
		}
	}
	if (appTypeArray[3] == "Master < 3000") { varLookupTable = "Residential Master<3000"; }
	if (appTypeArray[3] == "Master > 3000") { varLookupTable = "Residential Master>3000"; }
	if (appTypeArray[3] == "Tract-Third Party Rev > 3000") { varLookupTable = "Third Party Review"; }
	if (appTypeArray[3] == "Tract-Third Party Rev < 3000") { varLookupTable = "Third Party Review"; }
	logDebug("Fee lookup table is " + varLookupTable);


	if (!publicUser || doLimited || doSolarApp) 
	{
		var varSpecialFees = "";
		var specFeeCodes = new Array();
		var fsFlag = "";
		var feeCodes = "";
		var fSchedName = "";
		var feeName = "";
		var thisQty = 1;
		var thisScope = getAppSpecific("Scope of Work");
		if (doLimited) { thisScope = getAppSpecific("Scope of Work ACA"); }
		var thisADU = "";
		var thisJADU = "";
		var addFeeFlag = true;
		var slFlags = "";
		var slFlagCodes = new Array();
		var slLookupTable = "sdl:Land Use Codes";
		varSpecialFees = lookup(varLookupTable, thisScope);
		specFeeCodes = varSpecialFees.split(",");
		if (matches(appTypeArray[3], "Residential<3000", "Residential>3000", "Tract < 3000", "Tract > 3000", "Other")) {
			thisADU = getAppSpecific("ADU Required");
			thisJADU = getAppSpecific("JADU Required");
		}
		for (thisCode in specFeeCodes) {
			var fsFlag = "None";
			if (specFeeCodes[thisCode] != null) {
				feeCodes = specFeeCodes[thisCode];
				fsFlag = feeCodes.substring(0, 3);

				if (fsFlag == "FS|") {
					fSchedName = feeCodes.substring(3);
					addAllFees(fSchedName, "FINAL", 1, varAutoInvoiceFees);
				}
				if (fsFlag == "FF|") {
					thisQty = 1;
					addFeeFlag = true;
					feeName = feeCodes.substring(3);
					// update fee quantity when New and has ADU/JADU
					if (matches(appTypeArray[3], "Residential<3000", "Residential>3000", "Tract < 3000", "Tract > 3000") && matches(thisScope, "Single Family < 3000", "Single Family > 3000") && matches(feeName, "0751", "0752")) {
						if (thisADU == "Yes" && matches(thisJADU, "No", "")) { thisQty = getAppSpecific("ADU SqFt") / getAppSpecific("Primary Residence sqft"); }
						if (matches(thisADU, "No", "") && thisJADU == "Yes") { thisQty = getAppSpecific("JADU SqFt") / getAppSpecific("Primary Residence sqft"); }
						if (thisADU == "Yes" && thisJADU == "Yes") { thisQty = (getAppSpecific("JADU SqFt") * 1 + getAppSpecific("ADU SqFt") * 1) / getAppSpecific("Primary Residence sqft"); }
						thisQty = thisQty.toFixed(4);
						logDebug("Quantity = " + thisQty);
					}
					if (thisScope == "Accessory Dwelling Unit" && matches(feeName, "0750", "0754", "0756")) {
						sqftADU = getAppSpecific("ADU SqFt");
						if (sqftADU < 750) {
							addFeeFlag = false;
						}
						if (sqftADU > 750) {
							if (thisADU == "Yes" && matches(thisJADU, "No", "")) { thisQty = getAppSpecific("ADU SqFt") / getAppSpecific("Primary Residence sqft"); }
							if (thisADU == "Yes" && thisJADU == "Yes") { thisQty = (getAppSpecific("JADU SqFt") * 1 + getAppSpecific("ADU SqFt") * 1) / getAppSpecific("Primary Residence sqft"); }
							thisQty = thisQty.toFixed(4);
							logDebug("Quantity = " + thisQty);
							// actual is ratio of primary sqft to adu sqft for over 750 sqft of adu/jadu and no upper limit. when with primary use same calc.
							// less than 750 sqft
						}
					}

					if (addFeeFlag) {
						updateFee(feeName, "B_RES", "FINAL", thisQty, varAutoInvoiceFees);
					}
				}
				if (fsFlag == "SP|" && spTypeFlag) {
					landUse = feeCodes.substring(3);
					logDebug("Land Use code is " + landUse);
					if (AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
						slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
						slFlagCodes = slFlags.split(";");

						for (thisFlag in slFlagCodes) {
							luCode = slFlagCodes[thisFlag];
							newCode = luCode.trim();
							logDebug("This flag is " + newCode);

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
										updateFee(slFeeCode, slFeeSched, "FINAL", 1, varAutoInvoiceFees);
									}
								}
							}

						}

					}

				}
				logDebug("thisCode = " + specFeeCodes[thisCode]);

			}

			if (AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FIREFEE") { updateFee("FIRE-MITRE", "B_RES", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.FIRE_7A"] == "Defensible Space Inspection Required (Section 7A)" && specFeeCodes[thisCode] == "FIRE_7A") { updateFee("9007", "B_RES", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.FIREINSP"] == "Placer" && specFeeCodes[thisCode] == "FIREINSP") {
				updateFee("0916", "B_RES", "FINAL", 1, "N");
				updateFee("0917", "B_RES", "FINAL", 1, "N");
			}
			if (AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0747") { updateFee("0747", "B_RES", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0748") { updateFee("0748", "B_RES", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0749") { updateFee("0749", "B_RES", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FF9053") { updateFee("9053", "B_RES", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Morgan Knolls" && specFeeCodes[thisCode] == "TF-HSG MK") { updateFee("TF-HSG MK", "AFFORDABLE HOUSING", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Bickford Ranch" && specFeeCodes[thisCode] == "TF-HSG BKF") { updateFee("TF-HSG BKF", "AFFORDABLE HOUSING", "FINAL", 1, "N"); }
			if (AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Martis Valley West Parcel SP" && specFeeCodes[thisCode] == "TF-HSG MVW") { updateFee("TF-HSG MVW", "AFFORDABLE HOUSING", "FINAL", 1, "N"); }

		}

		if (!publicUser) {
			editAppSpecific("Plan Check Expiration", dateAdd(null, 365));
		}

		if (getAppSpecific("Plumbing") == "CHECKED") {
			updateFee("0710", "B_RES", "FINAL", 1, "N");
		}
		if (getAppSpecific("Electrical") == "CHECKED") {
			updateFee("0711", "B_RES", "FINAL", 1, "N");
		}
		if (getAppSpecific("HVAC-Mechanical") == "CHECKED") {
			updateFee("0712", "B_RES", "FINAL", 1, "N");
		}

		//IT Req# 2493

		// if(publicUser && AInfo["Scope of Work ACA"] == "Mechanical" && AInfo["MECHANICAL - Number of Systems"] > 1) {    //# of Packages
		// 	updateFee("0712","B_RES","FINAL",getAppSpecific("MECHANICAL - Number of Systems"),"Y");
		// }	
		if(publicUser && AInfo["Scope of Work ACA"] == "Mechanical") {
			if(getAppSpecific("MECHANICAL - System Type") == "Package Unit"  && AInfo["MECHANICAL - Number of Systems"] > 1)     //# of Packages
				updateFee("0712","B_RES","FINAL",getAppSpecific("MECHANICAL - Number of Systems"),"Y");
			if(getAppSpecific("MECHANICAL - System Type") == "Split System"  && AInfo["MECHANICAL - Number of Splits"] > 1)     //# of Splits
				updateFee("0712","B_RES","FINAL",getAppSpecific("MECHANICAL - Number of Splits"),"Y");
		}
		// end of IT Req# 2493

		if (publicUser && AInfo["Scope of Work ACA"] == "Solar Roof Mount" && matches(AInfo["SOLAR - Panel Changeout"], "Y", "Yes")) {

			//Abe 03/07/2024 IT Request # 1978 - changed updateFee("0711","B_RES","FINAL",1,"Y") --> updateFee("0711","B_RES","FINAL",1,"N");
			updateFee("0711", "B_RES", "FINAL", 1, "N");
		}
		if (getAppSpecific("Third Party Review") == "Yes") {
			addFee("0713", "B_RES", "FINAL", 1, "N");
			removeFee("0715", "FINAL");
		}
		// Special fees for SolarApp
		if (publicUser && appTypeArray[3] == "Solar App") {
			if (matches(AInfo["Panel Upgrade"], "Y", "Yes") || AInfo["Project Type"] == "PV Solar and Storage") {
				updateFee("0711", "B_RES", "FINAL", 1, varAutoInvoiceFees);
			}
			if (matches(AInfo["Panel Upgrade"], "Y", "Yes") && AInfo["Project Type"] == "PV Solar and Storage") {
				updateFee("0711", "B_RES", "FINAL", 2, varAutoInvoiceFees);
			}			
			//Start: Abe - IT Request # 2504 
			if (AInfo["Project Type"] == "PV Solar and Storage") {
				updateFee("0515", "B_RES", "FINAL", 1, varAutoInvoiceFees);
			}
			//End: Abe - IT Request # 2504 
			//updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
		}

		if (AInfo["Type of Work"] == "Renewal") {
			removeAllFees(capId);
			addFee("0911", "B_RES", "FINAL", 1, "N");
			addFee("0924", "B_RES", "FINAL", 1, "N");
			addFee("0913", "B_RES", "FINAL", 1, "N");
		}

		if (appMatch("Building/Residential/Full Review/Renewal")) {
			removeAllFees(capId);
			addFee("0911", "B_RES", "FINAL", 1, "N");
			addFee("0924", "B_RES", "FINAL", 1, "N");
			addFee("0913", "B_RES", "FINAL", 1, "N");
		}
		if ((appTypeArray[2] == "Full Review" && matches(appTypeArray[3], "Renewal", "Other", "Residential>3000", "Residential<3000", "Tract > 3000", "Tract < 3000")) || matches(appTypeArray[2], "Plan Check Only", "Limited")) {
			updateFee("TECH", "ACCOUNTING", "FINAL", 1, varAutoInvoiceFees);
		}
	}

	if ((appTypeArray[2] == "Full Review" && matches(appTypeArray[3], "Renewal", "Other", "Residential>3000", "Residential<3000", "Tract > 3000", "Tract < 3000")) || matches(appTypeArray[2], "Plan Check Only", "Limited")) {
		editTaskDueDate("Submittal Review", dateAdd(null, 2), "BLD_20230501_MAIN");
	}
	
} catch(e)
{
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Test: ASA:Building/Residential try error2 ", e.message);	
}
 aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Test: ASA:Building/Residential: debug ", debug);

/*=============================================================================================
| Program : CTRCA;Building!Residential!Full Review!~
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap after for all Residential Full records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/09/2021 Created script
|         : TDunn 01/09/2022 Added fees scripting for publicUser submittals
|         : eaftahi 10/18/2023 modified the ADU/JADU section to cover the latest Custom Fields update
|         : eaftahi 12/07/2023 added "Addressing" Ad Hoc task req# 1865
|         : eaftahi 01/16/2025 IT Req# 2221 Fee deferral - SB937 
|         : eaftahi 12/03/2025 Added IT Request# 2698
|
/==========================================================================================================*/


logDebug("Running CTRCA:Building Residential");
var varAutoInvoiceFees = "N";


//IT Request# 1865 & 1998
if (publicUser) {
	if (matches(appTypeArray[2], "Full Review") && (matches(AInfo["ADU Required"], "Yes") || matches(AInfo["JADU Required"], "Yes"))) {
		if (getAppProcessCode(capId) == "BLD_20181201_MAIN") {
			addAdHocTask("ADHOC", "Addressing", "", "LDEROBER");

			if (AInfo["Project Office"] == "Auburn")
				addAdHocTask("ADHOC", "ADU Review", "", "PHOFFMAN");
			else
				addAdHocTask("ADHOC", "ADU Review", "", "TLYKINS");
		}
	}
	//IT Request# 2698
	if (appTypeArray[2] == "Other" && AInfo["Scope of Work"] == "Permanent Membrane Structure") {
		addFee("0913", "B_RES", "FINAL", 2, "N");
	}
	//end of IT Request# 2698
}
//End of IT Request# 1865 & 1998

//IT Request# 2221 - SB937 - Fee Deferral
if ((matches(appTypeArray[3], "Other", "Residential<3000", "Residential>3000", "Tract < 3000", "Tract > 3000")))
	if (matches(getAppSpecific("Type of Work"), "Addition", "Manufactured Home", "New", "Farmworker Housing") && getAppSpecific("YesToFeeDeferral") == "CHECKED")
		addStdCondition("Building - Prevent Final / Completion", "SB-937 Mitigation Fee Act");
//End of IT Request# 2221


var spTypeFlag = true;
var varLookupTable = "Residential Scope of Work";
// Assess Fees
if(appTypeArray[2] == "Limited") {varLookupTable = "OTC Scope of Work";}
if(appTypeArray[3] == "Tract-Third Party Rev. < 3000") {varLookupTable = "Third Party Review";}
if(appTypeArray[3] == "Residential<3000") {varLookupTable = "Residential 3000 Scope of Work";}
if(appTypeArray[3] == "Residential>3000") {varLookupTable = "Residential 3000plus Scope of Work";}
if(appTypeArray[3] == "Tract < 3000") {
	varLookupTable = "ResidentialTract < 3000";
	if(!matches(AInfo["Type of Work"],"New","Manufactured Home")) {
		spTypeFlag = false;
	}
}
if(appTypeArray[3] == "Tract > 3000") {
	varLookupTable = "ResidentialTract > 3000";
	if(!matches(AInfo["Type of Work"],"New","Manufactured Home")) {
		spTypeFlag = false;
	}	
}
if(appTypeArray[3] == "Master < 3000") {varLookupTable = "Residential Master<3000";}
if(appTypeArray[3] == "Master > 3000") {varLookupTable = "Residential Master>3000";}
if(appTypeArray[3] == "Tract-Third Party Rev > 3000") {varLookupTable = "Third Party Review";}
if(appTypeArray[3] == "Tract-Third Party Rev < 3000") {varLookupTable = "Third Party Review";}
logDebug("Fee lookup table is " + varLookupTable);


if(publicUser && !appMatch("Building/Residential/Limited/*")) {
	var varSpecialFees = "";
	var specFeeCodes = new Array(); 	
	var fsFlag ="";
	var feeCodes ="";
	var fSchedName = "";
	var feeName = "";
	var thisQty = 1;
	var thisScope = getAppSpecific("Scope of Work");
	var thisADU = getAppSpecific("ADU Required");; 
	var thisJADU = getAppSpecific("JADU Required");
	var addFeeFlag = true;
	var slFlags = "";
	var slFlagCodes = new Array();	
	var slLookupTable = "sdl:Land Use Codes";
	varSpecialFees = lookup(varLookupTable,thisScope); 
	specFeeCodes = varSpecialFees.split(",");

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
				if(matches(appTypeArray[3],"Residential<3000","Residential>3000") && matches(thisScope,"Single Family < 3000","Single Family > 3000") && matches(feeName,"0751","0752")) {
					if(thisADU == "Yes" && thisJADU == "Yes") {thisQty = (getAppSpecific("JADU SqFt") *1 + getAppSpecific("ADU SqFt") * 1)/getAppSpecific("Primary Residence sqft");}
					if(thisADU == "Yes" && matches(thisJADU,"No","")) {thisQty = getAppSpecific("ADU SqFt")/getAppSpecific("Primary Residence sqft");}
					if(matches(thisADU, "No", "") && thisJADU == "Yes") {thisQty = getAppSpecific("JADU SqFt")/getAppSpecific("Primary Residence sqft");}
					thisQty = thisQty.toFixed(4);
					logDebug("Quantity = " + thisQty);
				}
				if(thisScope =="Accessory Dwelling Unit" && matches(feeName,"0750","0754","0756")) {
					sqftADU = getAppSpecific("ADU SqFt");
					if(sqftADU < 750) {
						addFeeFlag = false;
					}
					if(sqftADU > 750) {
						if(thisADU == "Yes" && thisJADU == "Yes") {thisQty = (getAppSpecific("JADU SqFt") *1 + getAppSpecific("ADU SqFt") * 1)/getAppSpecific("Primary Residence sqft");}
						if(thisADU == "Yes" && matches(thisJADU, "No", "")) {thisQty = getAppSpecific("ADU SqFt")/getAppSpecific("Primary Residence sqft");}
						
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


		if(AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FIREFEE") {updateFee("FIRE-MITRE","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.FIRE_7A"] == "Defensible Space Inspection Required (Section 7A)" && specFeeCodes[thisCode] == "FIRE_7A") {updateFee("9007","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.FIREINSP"] == "Placer" && specFeeCodes[thisCode] == "FIREINSP") {
			updateFee("0916","B_RES","FINAL",1,"N"); 
			updateFee("0917","B_RES","FINAL",1,"N");
		}
		if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0747") {updateFee("0747","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0748") {updateFee("0748","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0749") {updateFee("0749","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FF9053") {updateFee("9053","B_RES","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Morgan Knolls" && specFeeCodes[thisCode] == "TF-HSG MK") {updateFee("TF-HSG MK","AFFORDABLE HOUSING","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Bickford Ranch" && specFeeCodes[thisCode] == "TF-HSG BKF") {updateFee("TF-HSG BKF","AFFORDABLE HOUSING","FINAL",1,"N");}
		if(AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Martis Valley West Parcel SP" && specFeeCodes[thisCode] == "TF-HSG MVW") {updateFee("TF-HSG MVW","AFFORDABLE HOUSING","FINAL",1,"N");}

	}
		
	if(!publicUser) {
		editAppSpecific("Plan Check Expiration",dateAdd(null,365));
	}

	if(getAppSpecific("Plumbing") == "CHECKED") { 
	updateFee("0710","B_RES","FINAL",1,"N");
	}
	if(getAppSpecific("Electrical") == "CHECKED") {
		updateFee("0711","B_RES","FINAL",1,"N");
	}
	if(getAppSpecific("HVAC-Mechanical") == "CHECKED") {
		updateFee("0712","B_RES","FINAL",1,"N");
	}
	if(publicUser && AInfo["Scope of Work ACA"] == "Mechanical" && AInfo["MECHANICAL - Number of Systems"] > 1) {
		updateFee("0712","B_RES","FINAL",getAppSpecific("MECHANICAL - Number of Systems"),"Y");
	}
	if(getAppSpecific("Third Party Review") == "Yes") {
		addFee("0713", "B_RES", "FINAL",1,"N"); 
		removeFee("0715","FINAL");
	}

	if(AInfo["Type of Work"] == "Renewal" ) {
		removeAllFees(capId);
		addFee("0911","B_RES","FINAL",1,"N"); 
		addFee("0924","B_RES","FINAL",1,"N");
		addFee("0913","B_RES","FINAL",1,"N");
	}

	if(appMatch("Building/Residential/Full Review/Renewal")) {
		removeAllFees(capId); 
		addFee("0911","B_RES","FINAL",1,"N"); 
		addFee("0924","B_RES","FINAL",1,"N");
		addFee("0913","B_RES","FINAL",1,"N");
	}
	 
	if((appTypeArray[2] == "Full Review" && matches(appTypeArray[3],"Renewal","Other","Residential>3000","Residential<3000","Tract > 3000","Tract < 3000")) || matches(appTypeArray[2],"Plan Check Only","Limited")){
		addFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
}

// sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing Commercial submittal ", debug);

if((getAppSpecific("ADU Required") == "Yes" || getAppSpecific("JADU Required") == "Yes"))
	sendResult = aa.sendMail("noreply@placer.ca.gov","eaftahi@placer.ca.gov", "", "CTRCA;Building!Residential!Full Review!NA: ADU/JADU in prod", debug);



/*================================================
**
** Internal Functions
**
================================================*/

/**
 * 
 * @param {capId} capIdItem 
 * @returns String: Main process code
 */
function getAppProcessCode(capIdItem) {
    var workflowResult = aa.workflow.getMasterProcess(capIdItem);
    if (workflowResult.getSuccess()) {
        var wfObj = workflowResult.getOutput();

        var fTask = wfObj[0];
        return fTask.getProcessCode();
    }
    else {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
}
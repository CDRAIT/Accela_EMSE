/*=============================================================================================
| Program : CTRCA;Building!Residential!Master!~
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap after for all Residential Master Plan Check only
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/18/2025 Adapted from CTRCA;Building!Residential!Full Review!~ 
|           TDunn 12/19/2025 updated lookup table 
|         
|
/==========================================================================================================*/


logDebug("Running CTRCA:Building Residential");
var varAutoInvoiceFees = "N";

var spTypeFlag = false;
var varLookupTable = "SDL:PCMasterPlanScope";
// Assess Fees
logDebug("Fee lookup table is " + varLookupTable);

try
{
	if(publicUser) 
	{
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

		if(getAppSpecific("Third Party Review") == "Yes") 
		{
			addFee("0713", "B_RES", "FINAL",1,"N"); 
			removeFee("0715","FINAL");
		}
		 
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
} catch(e)
{
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Test: CTRCA:Building/Residential/Master try error2 ", e.message);	
}
sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Test: CTRCA:Building/Residential/Master: debug ", debug);


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
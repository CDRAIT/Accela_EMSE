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
|         : Abe   11/17/2026 Synced to PROD
/=============================================================================================*/
if(currentUserID == "EAFTAHI") {
	showDebug = 1;
}
logDebug("Running ASA:Building/Commercial ...");


//#region INITIALIZATION
//INITIALIZATION ----

//fee related variables
var varAutoInvoiceFees = "N"
var feeSchedule = ""; //TODO: check the GENERAL FEE Schedule and bring it here
var feeQty = 1;
var feePeriod = "FINAL";

var	varLookupTable = "SDL: BLD COMM FULL REVIEW SoW";
if(appTypeArray[2] == "Limited") {varLookupTable = "SDL: BLD COMM LMTD SoW";}

var varSPLookupTable = "SDL: BLD COMM SoW SPECIFIC PLAN"; //Specific Plan per Scope of Work lookup table for Commercial records

//#endregion INITIALIZATION


//#region FEE CALCULATION
// FEE CALCULATION ----
if (!publicUser) {
	logDebug("Adding Commercial fees for non-public users ...");

	var feesStr = lookup(varLookupTable, AInfo["Scope of Work"]);
	addFees2Record(feesStr, feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);





}//end of if(!publicUser)

/**
 * 
 * @param {String} feeStr: The fee code to be added to the record
 * @param {String} varFeeSchedule: the general fee schedule to be used for the fee
 * @param {String} varFeePeriod: the period for the fee
 * @param {Number} varFeeQty: the quantity of the fee
 * @param {String} varAutoInvoice: flag indicating whether to auto-invoice fees ("Y" or "N")
 */
function addFees2Record(varFeeStr, varFeeSchedule, varFeePeriod, varFeeQty, varAutoInvoice){
	var varFeeArr = new Array();
	if (!isEmpty(varFeeStr))
		varFeeArr = varFeeStr.split(",");
	logDebug("Adding following fees: " + varFeeArr);
	for (thisFee in varFeeArr) {
		if (varFeeArr[thisFee] != null) {
			var varFee = varFeeArr[thisFee];
			if (varFee.indexOf("SP|") == -1) {
				if (getFeeSchedule(varFee)) {
					varFeeSchedule = getFeeSchedule(varFee);
				}
				updateFee(varFee, varFeeSchedule, varFeePeriod, varFeeQty, varAutoInvoice);
			}
			if (varFee.indexOf("SP|") == 0) {
				//TODO: Handle Specific Plan fees
			}

		}
	}//end of for loop
}

function getFeeSchedule(feeStr) {
	var  BLD_IMPACT_FEES = ["0130",
	"0131",
	"0132",
	"0133",
	"0134",
	"0135",
	"0136",
	"0747",
	"0748",
	"0749",
	"0750",
	"0751",
	"0752",
	"0753",
	"0756",
	"0757",
	"0759",
	"HWY70-XRV",
	"MARTISOPEN",
	"PINYON-AFF"
	];
	var  FIRE_PLANNER_FEES = ["9007",
	"9052",
	"9053",
	"9054-COM",
	"9054-RES",
	"FIRE-MITCM",
	"FIRE-MITRE"
	];
	if(exists(feeStr, BLD_IMPACT_FEES)) { return "BLD_IMPACT_FEES"; }
	if(exists(feeStr, FIRE_PLANNER_FEES)) { return "FIRE_PLANNER_FEES"; }
	return false;
}

//#endregion FEE CALCULATION




//#region COMMERCIAL GENERAL RULES
// COMMERCIAL GENERAL RULES ----
editAppSpecific("Plan Check Expiration",dateAdd(null,365));

//#endregion COMMERCIAL GENERAL RULES


//#region Fee Calculation
// Fee Calculation for Building/Commercial records ----
// Coveres both Full Review and Limited Review scenarios
// Determines the appropriate Scope of Work (SoW) and Type of Work (ToW) lookup tables based on the review type





if (!publicUser) {
	//ADDING DEFAULT BUILDING FEES ----

	/* Adding Standard Scope of Work fees */
	var feesStr = lookup(varLookupTable, AInfo["Scope of Work"]);
	if (!isEmpty(feesStr)) {
		var varFeeArr = feesStr.split(",");
		logDebug("Adding following fees: " + varFeeArr);
		for(thisFeeCode in varFeeArr) {
			if(varFeeArr[thisFeeCode] != null) {
				var varFee = varFeeArr[thisFeeCode]; 
				updateFee(varFee,feeSchedule,feePeriod,feeQty,varAutoInvoiceFees);
			}
		}
	} // End of Standard Scope of Work fees

	/* Additional Scope-Specific fees */ 
	/* These fees don't fall under standard` categories and are added separately based on Specific SoW & ToW. */
	if(AInfo["Type of Work"] == "New") {
		if(AInfo["Scope of Work"] == "Accessory Structure") {updateFee("B-0112",feeSchedule,feePeriod,feeQty,varAutoInvoiceFees);}
		if(AInfo["Scope of Work"] == "Commercial New Construction") {updateFee("0132","BLD_IMPACT_FEES",feePeriod,feeQty,varAutoInvoiceFees);}

		if(AInfo["Scope of Work"] == "Multi-Family") {
			updateFee("0130","BLD_IMPACT_FEES",feePeriod,feeQty,varAutoInvoiceFees);
			updateFee("0756","BLD_IMPACT_FEES",feePeriod,feeQty,varAutoInvoiceFees);
		}
	}//End of Additional
	
	//Adding SPECIFIC PLAN FEES ----
	/* These fees are applied to the records based on SPECIAL_LAND_FEES_FLAGS set in the parcel attributes */
	if (AInfo["Type of Work"] == "New" && !isEmpty(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"])) {
		var varSpFlags = lookup(varSPLookupTable, AInfo["Scope of Work"]);
		if (!isEmpty(varSpFlags)) {
			var spFlagsArray = varSpFlags.split(",");
			for (thisFlag in spFlagsArray) {
				if (spFlagsArray[thisFlag] != null) {
					if (spFlagsArray[thisFlag].indexOf("SP|") != -1) {
						landUse = spFlagsArray[thisFlag].substring(3);
						logDebug("Land Use code is " + landUse);
						addedSPFees = addSpFeesTPS(landUse);
						logDebug("SP fees applied = " + addedSPFees);
					}
					if (spFlagsArray[thisFlag].indexOf("SP|") == -1) {
						logDebug("Non-SP flag found: " + spFlagsArray[thisFlag]);
						//TODO: C0747 applies to "Convalescent or Home for the Elderly" and we don't have this sow in our new scopes; find the correct scope
						//if (AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0747") { updateFee("0747", "B_RES", "FINAL", 1, "N"); }

						//NOTE: C0748 doesn't exist in the stdChoice
						//if (AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0748") { updateFee("0748", "B_RES", "FINAL", 1, "N"); }
						
						//NOTE: FF9053 doesn't exist in the stdChoice
						//if (AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FF9053") { updateFee("9053", "B_RES", "FINAL", 1, "N"); }

						//TODO: Townhome also is listed for 0749 fee; I dont have it in the new SoW.
						if (AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0749") { updateFee("0749", "BLD_IMPACT_FEES", "FINAL", 1, "N"); }
						if (AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FMITCM") {addFee("FIRE-MITCM", "FIRE_PLANNER_FEES", "FINAL", 1, "N");}


					}
				}

			}
		}
	}//end of SPECIFIC PLAN FEES

	
	//TODO: Review and update 0113 and 0102 fees for Third Party Review
	//These are the plan check fees 
	// if(AInfo["Third Party Review"] == "Yes") {
	// 	addFee("0113", "B_COM", "FINAL",1,"N"); removeFee("0102","FINAL");
	// }

	// TODO: Review and update NEW TECH fee	
	if(matches(appTypeArray[2],"Full Review","Limited")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}


} //End of if(!publicUser)

//#endregion of Fee Calculations

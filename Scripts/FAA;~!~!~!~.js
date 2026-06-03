/*------------------------------------------------------------------------------------------------------/
| Program : FAA:~!~!~!~.js
| Event   : FeeAssessAfter
|
| Client  : Placer County, CA
| Usage   : 
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/18/2021 created script.
|		  : TDunn 12/16/2021 added logic for add on Tech fee when main Tech fee is invoiced
|         : TDunn 12/20/2021 updated logic to account for multiply instances of adding new fees with one
|                            or more Tech fees already existing and/or invoiced.
|         : TDunn 01/14/2022 added logic to add TECH fee to affected records that do not have a TECH fee yet
|         : TDunn 03/22/2022 updating logic to manage possible fee code exceptions to TECH fee and fee adds by other events.
|         : TDunn 04/15/2022 added test for when no fee codes exist in exempt fees list. cleaned up some criteria logic
|         : TDunn 07/20/2022 updated maximum tech fee value to use a lookup.
|         : TDunn 05/16/2024 fixed calculation error for TECH-ADJ amount on exempt fees.
|         : TDunn 04/16/2026 added excluding PW Imp Plan record 
|         : TDunn 05/19/2026 added Improvement Plan Type as part of exclusion rule Imp Plan records
|
/---------------------------------------------------------------------------------------------------------------------*/

if(currentUserID == "TDUNN" || currentUserID == "EAFTAHI") {
	showDebug = 1;
}
// Start of variable declaration
//===================================
var thisAmt = 0;
var techFeeTotals = 0;
var xmptAmount = 0;
var feeAmt = 0;
var rawAdj = 0;
var fixedAdj = 0;
var xfcodeArray = new Array();
var vLkupTable = "lkupTechFeeExemptFees"
var vLkupCriteria = "Exempt"
var maxFee = (lookup("lkupFeeFactor","techMax") *1); // New value effective 7/23/22 is 498.07
var maxFeeAdj = (maxFee * 1) - .1;
logDebug("Current Tech fee maximum amount is " + maxFee);

// Test for exempt record types
if(!matches(appTypeArray[1],"Improvement Plan") || (appTypeArray[1] == "Improvement Plan" && matches(AInfo["Improvement Plan Type"],"Utility","BFAT")))
{
	// Test for TECH exempt fees 
	//=============================
	var feeList = lookup(vLkupTable,vLkupCriteria);
	if(feeList != "NONE") {
		xfcodeArray = feeList.split(","); 
		for(fcode in xfcodeArray) {
			feeCode = xfcodeArray[fcode];
			if(feeExists(feeCode,"NEW","INVOICED")) {
				feeAmt = feeAmount(feeCode,"NEW","INVOICED");
				xmptAmount = xmptAmount + (1 * feeAmt);
				logDebug("Code " + fcode + " " + feeCode + ", amount= " + feeAmt);
			}
		}
	}
	logDebug("Total Exempt Amount = " + xmptAmount);
	if(xmptAmount > 1) {
		logDebug("Exempt amount = " + xmptAmount);
		logDebug("TECH-ADJ Fee amount = " + (-1 * xmptAmount * .035));
		rawAdj = (-1 * xmptAmount);
		fixedAdj = rawAdj.toFixed(3);
		logDebug("TECH-ADJ Fee fixed amount = " + fixedAdj);
	}

	// When Tech fee is not invoiced
	//===============================
	if(feeExists("TECH","NEW")) {
		removeFee("TECH","FINAL"); 
		addFee("TECH","ACCOUNTING","FINAL",1,"N");
		if(xmptAmount > 1) {
			if(feeExists("TECH-ADJ","NEW")) {
				logDebug("TECH-ADJ Fee exists, adding");
				removeFee("TECH-ADJ","FINAL");
				addFee("TECH-ADJ","ACCOUNTING","FINAL",fixedAdj,"N");
			}
			if(!feeExists("TECH-ADJ","NEW")) {
				logDebug("TECH-ADJ Fee does not exist, adding");
				addFee("TECH-ADJ","ACCOUNTING","FINAL",fixedAdj,"N");
			}
		}
	}

	// Adding TECH fee to record types that don't add any fees upfront
	if(matches(appTypeArray[1],"Ag Sign") && !feeExists("TECH","NEW","INVOICED")) {
		addFee("TECH","ACCOUNTING","FINAL",1,"N");
	}

	// If Tech fee is already invoiced
	//==================================================================

	if(feeExists("TECH","INVOICED")) {
		var techFeeAmt = feeAmount("TECH","INVOICED");
		techFeeAmt = techFeeAmt.toFixed(3);
		var feesCharged = techFeeAmt/.035;
		var fixedFeesChgd = feesCharged.toFixed(3);
		var feeByDate = feeGetTotByDateRange(dateAdd(null,-1460),dateAdd(null,0),"NEW","INVOICED");
		if(xmptAmount > 1) {
			feeByDate = feeByDate - xmptAmount;
			logDebug("New fee by date = " + feeByDate);
		}											 
		var vFeesTotal = feeByDate - techFeeAmt;
		var chkFeesAmount = feeAmountExcept(capId);
		
		logDebug("Fee amount total = " + chkFeesAmount + ", Fee by date = " + feeByDate);
		techFeeTotals = techFeeAmt;
		logDebug("techFeeTotals 1: " + techFeeTotals);
		logDebug("TechFeeAmt: " + techFeeAmt + "; feeCharged: " + feesCharged + "; fixedFeesChgd: " + fixedFeesChgd + "; Actual Fee total: " + vFeesTotal);
		//aa.print("TechFeeAmt: " + techFeeAmt + "; feeCharged: " + feesCharged + "; fixedFeesChgd: " + fixedFeesChgd + "; Actual Fee total: " + vFeesTotal);	
		if(!feeExists("TECH-ADJ","NEW","INVOICED")) {		
			thisAmt = vFeesTotal - fixedFeesChgd;
			logDebug("Amount to surcharge: " + thisAmt);
			//aa.print("Amount to surcharge: " + thisAmt);		
		}
		if(feeExists("TECH-ADJ","NEW","INVOICED")) {
			var tech2Amt = feeAmount("TECH-ADJ","NEW","INVOICED");
			logDebug("Tech2 amount: " + tech2Amt);
			tech2Amt = tech2Amt.toFixed(3);
			vFeesTotal = vFeesTotal - tech2Amt;
			thisAmt = vFeesTotal - fixedFeesChgd;
			techFeeTotals = (1 * techFeeTotals) + (1 * tech2Amt);
			logDebug("TechFeeAmt: " + techFeeAmt + "; tech2Amt: " + tech2Amt + "; fixedFeesChgd: " + fixedFeesChgd + "; Actual Fee total: " + vFeesTotal);
			logDebug("techFeeTotals2: " + techFeeTotals);
			logDebug("Amount to surcharge: " + thisAmt);
			// aa.print("Amount to surcharge: " + thisAmt);		
		}
		fixedAmt = thisAmt.toFixed(3); 
		logDebug("New fee amount = " + fixedAmt);
		// aa.print("New fee amount = " + fixedAmt);
		maxTest = (vFeesTotal * .035); 
		logDebug("Total Tech fee is " + maxTest.toFixed(3));
		// aa.print("Total Tech fee is " + maxTest.toFixed(3));
		// if(maxTest < 400) {
			// tempToAdd = fixedAmt * .035;
			// logDebug("New Total = " + maxTest);
			// logDebug("Temp to add = " + tempToAdd);
		// }
		if(maxTest > maxFee) {
			var tempToAdd = fixedAmt * .035;
			logDebug("Temp to add: " + tempToAdd);
			amtOver = maxTest - maxFee;
			logDebug("Amount over = " + amtOver);
			vDelta = tempToAdd - amtOver;
			logDebug("New tech2 fee amt: " + vDelta.toFixed(3));
			var newToAdd = vDelta/.035;
			fixedAmt = newToAdd.toFixed(3);
			logDebug("New to add: " + fixedAmt);
		}
		if(fixedAmt > 1 && techFeeTotals < maxFeeAdj || (fixedAmt == 0 && techFeeTotals > 0)) {
			logDebug("New Tech qty = " + fixedAmt);
			logDebug("New Tech amt = " + fixedAmt * .035);
			//aa.print("New Tech qty = " + fixedAmt);
			//aa.print("New Tech amt = " + fixedAmt * .035);
			logDebug("techFeeTotals 3: " + techFeeTotals);
			updateFee("TECH-ADJ","ACCOUNTING","FINAL",fixedAmt,"N");
		}
	}
}else{
	logDebug("Tech fee does not apply to " + appTypeArray[1]);
	showMessage = true;
	comment("Tech fee does not apply to " + appTypeArray[1])
}

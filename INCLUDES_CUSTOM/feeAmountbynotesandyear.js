function feeAmountbynotesandyear(capid, fcode, altid, year) {
	var feeTotal = 0;
	var maltid = altid + ".";
	var feeResult = aa.finance.getFeeItemByFeeCode(capid, fcode, "FINAL");
	if (feeResult.getSuccess()) { var feeObjArr = feeResult.getOutput(); }
	else { logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }

	for (ff in feeObjArr)
		if ((altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes())) && String(feeObjArr[ff].getF4FeeItem().getApplyDate()).substring(0, 4) == year)
			feeTotal += feeObjArr[ff].getF4FeeItem().getFee();


	return feeTotal;
}

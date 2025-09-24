function feeExistsbynotes(feestr, altid) // optional statuses to check for
{
	var checkStatus = false;
	var statusArray = new Array();
	var maltid = altid + ".";

	//get optional arguments 
	if (arguments.length > 2) {
		checkStatus = true;
		for (var i = 2; i < arguments.length; i++)
			statusArray.push(arguments[i]);
	}

	var feeResult = aa.finance.getFeeItemByFeeCode(capId, feestr, "FINAL");
	if (feeResult.getSuccess()) { var feeObjArr = feeResult.getOutput(); }
	else { logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }

	for (ff in feeObjArr)
		if (feestr.equals(feeObjArr[ff].getF4FeeItem().getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getF4FeeItem().getFeeitemStatus(), statusArray)) && (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes())))
			return true;

	return false;
}

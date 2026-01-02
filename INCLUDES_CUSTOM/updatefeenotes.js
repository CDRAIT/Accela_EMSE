function updatefeenotes(feeCap,fcode,altid,feeComment)
{
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(feeCap,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		fsm1 = feeObjArr[ff].getF4FeeItem();
	        fsm1.setFeeNotes(feeComment);
                aa.finance.editFeeItem(fsm1);
}

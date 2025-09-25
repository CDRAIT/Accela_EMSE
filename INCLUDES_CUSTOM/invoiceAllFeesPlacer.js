function invoiceAllFeesPlacer(capid) {
	var itemCap = capid;
	var targetFees = loadFeesplacer(itemCap);
	var feeSeqArray = new Array();
	var paymentPeriodArray = new Array();
	for (tFeeNum in targetFees) {
		targetFee = targetFees[tFeeNum];
		if (targetFee.status == "NEW" && targetFee.notes.substring(0, 3) != "AC-" && Number(targetFee.notes.length()) < 11) {
			feeSeqArray.push(targetFee.sequence);
			paymentPeriodArray.push(targetFee.period);

		}
	}
	var invoicingResult = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
	if (!invoicingResult.getSuccess()) {
		logDebug("**ERROR: Invoicing fee items not successful.  Reason: " + invoicingResult.getErrorMessage());
		return false;
	}
}

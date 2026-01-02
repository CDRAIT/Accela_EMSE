function getinvoicebalance(InvNbr) {
	var feeAmount = 0;
	var amtPaid = 0;
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
	for (fNum in fList)
		if (fList[fNum].getInvoiceNbr() == InvNbr) {
			feeAmount += new Number(String(fList[fNum].getFee()));
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess()) {
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if ((fList[fNum].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()) && (pfObj[ij].getInvoiceNbr() == InvNbr))
						amtPaid += pfObj[ij].getFeeAllocation()
			}
		}

	return feeAmount - amtPaid;
}

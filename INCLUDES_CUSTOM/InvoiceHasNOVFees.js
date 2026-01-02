function InvoiceHasNOVFees(InvNbr) {
	var match = "False";
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
	for (fNum in fList)
		if (fList[fNum].getInvoiceNbr() == InvNbr && matches(fList[fNum].getFeeCode(), "AQ_NOV")) {
			match = "True"
		}
	return match
}

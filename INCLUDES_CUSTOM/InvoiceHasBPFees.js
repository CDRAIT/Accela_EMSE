function InvoiceHasBPFees(InvNbr) {
	var match = "False";
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
	for (fNum in fList)
		if (fList[fNum].getInvoiceNbr() == InvNbr && matches(fList[fNum].getFeeCode(), "BP_FEE", "BP_EXT")) {
			match = "True"
		}
	return match
}

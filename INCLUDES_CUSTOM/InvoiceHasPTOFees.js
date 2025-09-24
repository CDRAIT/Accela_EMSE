function InvoiceHasPTOFees(InvNbr) {
	var match = "False";
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
	for (fNum in fList)
		if (fList[fNum].getInvoiceNbr() == InvNbr && matches(fList[fNum].getFeeCode(), "AQENGPOEXCEP", "AQENGPONONEM", "AQ_PO_BOIL", "AQ_P_BURNHTR", "AQ_P_ELECENG", "AQ_P_GASFUEL", "AQ_P_MGASFUL", "AQ_P_ELECHP", "AQ_P_INCINER", "AQ_P_PFE", "AQ_P_SEMICON", "AQ_P_STATCON")) {
			match = "True"
		}
	return match
}

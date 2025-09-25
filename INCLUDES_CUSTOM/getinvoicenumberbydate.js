function getinvoicenumberbydate(capid, date) {
	// date format needs to be MM/DD/YYYY
	var invoicenumber = "";

	iListResult = aa.finance.getInvoiceByCapID(capid, null);
	iList = iListResult.getOutput();
	for (iNum in iList)
		if (dateFormatted(iList[iNum].getInvDate().getMonth(), iList[iNum].getInvDate().getDayOfMonth(), iList[iNum].getInvDate().getYear(), "").equals(date))
			invoicenumber = iList[iNum].getInvNbr();
	return invoicenumber
}

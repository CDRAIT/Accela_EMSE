function getexpirationyear(itemCap) {
	b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput();

	expdate = b1ExpResult.getExpDate().getYear() - 1;
	return expdate

}

function getthroughputyear(itemCap) {
	b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput();

	expdate = b1ExpResult.getExpDate().getYear() - 2;
	return expdate

}

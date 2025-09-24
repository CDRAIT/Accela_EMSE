function updateACAaccess(capIDString) {
	//var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
	//var ds = initialContext.lookup("java:/AA"); 
	//var conn = ds.getConnection(); 
	var conn = aa.db.getConnection();
	var Sql = "update B1PERMIT SET B1_ACCESS_BY_ACA = 'Y' where B1_ALT_ID like ?";
	var sSelect = conn.prepareStatement(Sql);
	sSelect.setString(1, capIDString);

	return sSelect.executeUpdate();
	conn.close();
}

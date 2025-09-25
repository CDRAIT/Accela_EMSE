function getProcessCount(capIDString) {
	//var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
	//var ds = initialContext.lookup("java:/AA");
	//var conn = ds.getConnection(); 
	var conn = aa.db.getConnection();
	var result = "";
	var B1_ALT_ID = "";
	var getSQL = "select Count(B1_APPL_STATUS) as Test from B1PERMIT where B1_PER_SUB_TYPE = 'Process' AND B1_ALT_ID like ? AND B1_APPL_STATUS != 'Closed'";
	var sSelect = conn.prepareStatement(getSQL);
	sSelect.setString(1, capIDString);
	var rs = sSelect.executeQuery();
	while (rs.next()) {
		result = rs.getString("Test");


	}
	rs.close();
	conn.close();
	return result;
}

function addCalcValuation(occType, unitType, unitAmt, vVersion, vCapId) {
	bVal = aa.finance.createBCalcValuatnScriptModel();
	logDebug("unitType: " + unitType + "; occType: " + occType + "; unitAmt: " + unitAmt);
	bVal.setAuditID("ADMIN");
	bVal.setCapID(vCapId);
	bVal.setConTyp(unitType);
	bVal.setUnitValue(parseFloat(unitAmt));
	bVal.setUseTyp(occType);
	bVal.setVersion(vVersion);

	r = aa.finance.createBCalcValuatn(bVal);

	logDebug("Calculated Value is " + bVal.getTotalValue());
}

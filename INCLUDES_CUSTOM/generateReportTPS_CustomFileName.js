function generateReportTPS_CustomFileName(aaReportName, parameters, rModule, newRptName) {
	/*this variation of generateReportTPS was created to alter both the name of the file that is both stored against the record and sent to customer via email*/

	var reportName = aaReportName;

	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();

	report.setModule(rModule);
	report.setCapId(capId);

	report.setReportParameters(parameters);

	//var permit = aa.reportManager.hasPermission(reportName, currentUserID);
	var permit = aa.reportManager.hasPermission(reportName, "ADMIN");

	if (permit.getOutput().booleanValue()) {
		var reportResult = aa.reportManager.getReportResult(report);

		if (reportResult) {
			reportResult = reportResult.getOutput();
			//aa.print("Original File Name:" + reportResult.getName());
			originalFileName = reportResult.getName(); //stores the original file name for future reference

			/*Change Report File Name of email attachment*/
			reportResultTest = reportResult;
			reportResultTestModel = reportResultTest.getReportResultModel();
			reportResultTestModel.setName(newRptName);
			/*end: Change Report File Name of email attachment*/

			var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			//logDebug("Report Result: " + reportResult);
			reportFile = reportFile.getOutput();
			return reportFile
		} else {
			logDebug("Unable to run report: " + reportName + " for Admin" + systemUserObj);
			return false;
		}
	} else {
		logDebug("No permission to report: " + reportName + " for Admin" + systemUserObj);
		return false;
	}
}

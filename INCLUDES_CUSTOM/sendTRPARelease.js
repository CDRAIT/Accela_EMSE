function sendTRPARelease() {
	// Converted from ES_SENDTRPA_RELEASE - Tdunn, 02/15/2023
	var emailResult = false;
	var emailSendFrom = null;
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailParameters = null;
	var reportParams = null;
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	addParameter(reportParams, "AltID", capIDString);
	report = generateReportPCO("TRPA Release Letter", reportParams, "TRPA");
	//emailSendFrom = "noreply@placer.ca.gov";
	emailSendFrom = defaultFrom;
	cap = aa.cap.getCap(capId).getOutput();
	alias = cap.capModel.getAppTypeAlias();
	logDebug("Alias: " + alias);
	addParameter(emailParameters, "$$INSPECTIONTYPE$$", inspType);
	addParameter(emailParameters, "$$RESULTDATE$$", inspResultDate);
	addParameter(emailParameters, "$$RECORDALIAS$$", alias);
	addParameter(emailParameters, "$$RECORDALTID$$", capIDString);
	addParameter(emailParameters, "$$INVOICEDTOTAL$$", feesInvoicedTotal);
	addParameter(emailParameters, "$$BALANCEDUE$$", balanceDue);
	emailResult = sendNotification(emailSendFrom, emailStaff, emailStaffCC, "TRPA_RELEASE_LETTER_NOTICE", emailParameters, new Array(report));
	logDebug("Email result = " + emailResult);
	return emailResult;

}

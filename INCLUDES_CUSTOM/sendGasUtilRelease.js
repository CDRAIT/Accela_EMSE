function sendGasUtilRelease() {
	// Replaces ES_SEND_GAS_UTIL_RELEASE - 02/15/2023, Tdunn, TPS
	/* Updated to use lookup based on parcel attribute 'GAS UTILITY' to return correct email address */

	var params = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	//var emailSendFrom = "noreply@placer.ca.gov";
	var emailSendFrom = defaultFrom;
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailResult = false;
	var xMessage = "";
	var ccTo = "BLDOutsource@placer.ca.gov";
	addParameter(reportParams, "inspId", inspId);
	report = generateReportPCO("Utility Release", reportParams, "Building");
	getRecordParams4Notification(params);
	getInspectionParams4Notification(params);
	addParameter(params, "$$ScopeOfWork$$", getAppSpecific("Scope of Work"));
	var vProvider = AInfo["ParcelAttribute.GAS UTILITY"];
	var vTemplate = lookup("lkupUtilReleaseGas", vProvider);
	logDebug("strcontrol = " + vTemplate);
	if (matches(AInfo['ParcelAttribute.GAS UTILITY'], null, undefined, "")) {
		xMessage = "Attention needed - you are attempting to pass an inspection where utility provider(s) are missing. Utility release not sent due to no provider listed.  Utility provider(s) information will need to be added to the parcel before re-resulting the inspection.";
	}
	if (!matches(AInfo['ParcelAttribute.GAS UTILITY'], null, undefined, "") && matches(vTemplate, "", null, undefined)) {
		logDebug("Inside vTemplate undefined");
		xMessage = "Attention needed - you are attempting to pass an inspection where there is an error with the utility provider(s). Utility release not sent due to data error with utility provider.  Utility provider(s) information on the parcel will need to be corrected before re-resulting the inspection.";
		ccTo = "cdrait@placer.ca.gov";
	}
	addParameter(params, "$$errorContent$$", xMessage);
	addParameter(params, "$$copyTo$$", ccTo);

	if (!matches(vProvider, "", null, undefined) && !matches(vTemplate, "", null, undefined)) {
		emailResult = sendNotification(emailSendFrom, emailStaff, emailStaffCC, vTemplate, params, new Array(report));
	}

	if (matches(AInfo['ParcelAttribute.GAS UTILITY'], null, undefined, "", "NA") || matches(vTemplate, "", null, undefined)) {
		vTemplate = "UTILITY_RELEASE";
		emailStaff = getCurrentUserStaffInfo(params);
		emailResult = sendNotification(emailSendFrom, emailStaff, emailStaffCC, vTemplate, params, null);
	}
	logDebug("Release email for " + AInfo["ParcelAttribute.GAS UTILITY"] + " using template " + vTemplate + ", result = " + emailResult);
	if (xMessage != "") {
		showMessage = true;
		comment(xMessage);
	}
	return emailResult;
}

function emailInspectionResultParameters() {
	// Converted from ES_EMAIL_INSPECTION_RESULT_PARAMETERS - Tdunn, 02/15/2023
	var contactTypes = new Array("Inspection Contact");
	var notificationTemplate = "AA_MESSAGE_INSPECTION_STATUS_CHANGE";
	var iCon = null;
	var contactArray = new Array();
	contactArray = getContactArray();
	for (iCon in contactArray) {
		if (exists(contactArray[iCon]["contactType"], contactTypes)) {
			// converted from ES_EMAIL_INSPECTION_RESULT - Tdunn, 02/15/2023
			params = aa.util.newHashtable();
			tContact = contactArray[iCon];
			getRecordParams4Notification(params);
			getContactParams4Notification(params, tContact);
			aa.print("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getInspectionParams4Notification(params);
			emailSendFrom = null;
			emailStaff = null;
			emailStaffCC = null;
			report = null;
			emailSendFrom = "";
			emailStaff = tContact["email"];
			emailStaffCC = "";
			if (!matches(tContact["email"], null, "", undefined)) {
				sendNotification(emailSendFrom, emailStaff, emailStaffCC, notificationTemplate, params, report);
			}
		}
	}
}

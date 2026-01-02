function createPCCPNotification(emailTemplate, pccpCapIDString) {
	/* Initialize standard parameters for notification */
	var vEmailSent = false;
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var pcapIdString = "";
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();

	// start loading parameters for notification
	logDebug("loading deeplink parameters");
	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters, acaSite); // returns $$acaRecordUrl$$; $$acaAppTypeAlias$$
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters);
	addParameter(reportParams, "RecordID", capIDString);

	// add short notes parameter
	var sNotes = getShortNotes();
	addParameter(emailParameters, "$$shortNotes$$", sNotes);
	addParameter(emailParameters, "$$PCCPAltID$$", pccpCapIDString);

	if (vEventName == "WorkflowTaskUpdateAfter") {
		addParameter(emailParameters, "$$wfStatusParam$$", wfStatus);
		addParameter(emailParameters, "$$wfDateParam$$", wfDateMMDDYYYY);
		addParameter(emailParameters, "$$taskNameParam$$", wfTask);
		addParameter(emailParameters, "$$wfCommentParam$$", wfComment);
		wfDueDate = getTaskDueDate("wfTask");
		if (wfDueDate != null) {
			addParameter(emailParameters, "$$wfDueDateParam$$", wfDueDate);
		}
	}

	if (vEventName == "InspectionScheduleAfter") {
		addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
		addParameter(emailParameters, "$$inspType$$", inspType);
	}

	/* Get To email contact types */
	conArray = getContactArrayWithPrimary(capId);
	for (thisCon in conArray) {
		if (!matches(conArray[thisCon]["email"], null, "", undefined)) {
			vToEmail = vToEmail + conArray[thisCon]["email"] + "; ";
		}
	}

	// Get Owner emails
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();

		for (o in owner) {
			thisOwner = owner[o];
			ownerEmail = thisOwner.getEmail();
			ownerName = thisOwner.getOwnerFullName();
			ownerPhone = thisOwner.getPhone();
			logDebug("Email: " + ownerEmail + "; Name: " + ownerName + "; Phone: " + ownerPhone);
			if (!matches(thisOwner.getEmail(), null, "", undefined)) {
				vToEmail = vToEmail + ownerEmail + "; ";
			}
		}
	}

	/* Get assigned staff parameters */
	var assignedStaff = getAssignedToStaff();
	if (assignedStaff != null) {
		staffResult = aa.person.getUser(assignedStaff);
		if (!staffResult.getSuccess()) { logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
		if (staffResult.getSuccess()) {
			staffObject = staffResult.getOutput();
			var staffEmail = staffObject.getEmail();
			var staffFirst = staffObject.getFirstName();
			var staffLast = staffObject.getLastName();
			logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
		}
		var staffName = staffFirst + " " + staffLast;
		if (!matches(staffEmail, undefined, "", null)) {
			addParameter(emailParameters, "$$assignedStaffParam$$", assignedStaff);
			addParameter(emailParameters, "$$staffEmailParam$$", staffEmail);
			addParameter(emailParameters, "$$staffNameParam$$", staffName);
		}
	}

	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

	vEmailSent = sendNotification(vFromEmail, vToEmail, vCcEmail, emailTemplate, emailParameters, null);
	logDebug("Email Sent = " + vEmailSent);
}

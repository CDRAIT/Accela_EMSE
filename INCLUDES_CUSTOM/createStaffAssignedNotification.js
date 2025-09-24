function createStaffAssignedNotification(emailTemplate, vContactType, defaultPhoneNum) {
	logDebug("Inside createStaffAssignedNotification function");
	/* Initialize standard parameters for notification */
	var vEmailSent = false;
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
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
	var notFound = true;
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId);
	logDebug("Entering test for specified contact type");
	for (thisCon in conArray) {
		if (conArray[thisCon]["contactType"] == vContactType) {
			foundEmail = conArray[thisCon]["email"]
			logDebug("Found specified contact type: " + conArray[thisCon]["contactType"] + " email: " + foundEmail);
			if (!matches(foundEmail, null, "", undefined)) {
				vToEmail = vToEmail + foundEmail + "; ";
				notFound = false;
			}
		}
	}
	if (notFound) {
		logDebug("Inside not found");
		for (thisCon in conArray) {
			thisEmail = conArray[thisCon]["email"];
			thisPrimary = conArray[thisCon]["primaryFlag"];
			thisType = conArray[thisCon]["contactType"];
			logDebug(thisType + "; " + thisEmail + "; " + thisPrimary);
			if (matches(thisPrimary, "Yes", "Y", "YES", "true") && !matches(thisEmail, null, "", undefined)) {
				vToEmail = vToEmail + thisEmail + "; ";
				vContactType = thisType;
			}
		}
	}

	for (thisCon in conArray) {
		logDebug("Inside other contacts");
		if (conArray[thisCon]["contactType"] != vContactType) {
			thisEmail = conArray[thisCon]["email"];
			thisPrimary = conArray[thisCon]["primaryFlag"];
			thisType = conArray[thisCon]["contactType"];
			logDebug(thisType + "; " + thisEmail + "; " + thisPrimary);
			if (!matches(thisEmail, null, "", undefined)) {
				vCcEmail = vCcEmail + thisEmail + "; ";
			}
		}
	}

	// Get Owner emails
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		logDebug("Inside Owners");
		owner = capOwnerResult.getOutput();

		for (o in owner) {
			thisOwner = owner[o];
			ownerEmail = thisOwner.getEmail();
			ownerName = thisOwner.getOwnerFullName();
			ownerPhone = thisOwner.getPhone();
			logDebug("Email: " + ownerEmail + "; Name: " + ownerName + "; Phone: " + ownerPhone);
			if (!matches(thisOwner.getEmail(), null, "", undefined)) {
				vCcEmail = vCcEmail + ownerEmail + "; ";
			}
		}
	}

	/* Get assigned staff parameters */
	logDebug("Getting staff assignment");
	var assignedStaff = getAssignedToStaff();
	if (assignedStaff != null) {
		staffResult = aa.person.getUser(assignedStaff);
		if (!staffResult.getSuccess()) { logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
		if (staffResult.getSuccess()) {
			staffObject = staffResult.getOutput();
			// for(xy in staffObject)
			// {
			// logDebug(xy + ": " + staffObject[xy]);
			// }
			var staffEmail = staffObject.getEmail();
			var staffFirst = staffObject.getFirstName();
			var staffLast = staffObject.getLastName();
			var staffPhone = staffObject.getPhoneNumber();
			logDebug(staffFirst + " " + staffLast + " at " + staffEmail + "; Phone: " + staffPhone);
		}
		if (matches(staffPhone, "", null, undefined)) {
			staffPhone = defaultPhoneNum.toString();
		}
		var staffName = staffFirst + " " + staffLast;
		if (!matches(staffEmail, undefined, "", null)) {
			addParameter(emailParameters, "$$assignedStaffParam$$", assignedStaff);
			addParameter(emailParameters, "$$staffEmailParam$$", staffEmail);
			addParameter(emailParameters, "$$staffNameParam$$", staffName);
			addParameter(emailParameters, "$$staffPhoneParam$$", formatStaffPhone(staffPhone));
			vCcEmail = vCcEmail + staffEmail + "; ";
		}
	}

	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
	vEmailSent = sendNotification(vFromEmail, vToEmail, vCcEmail, emailTemplate, emailParameters, null);
	logDebug("Email Sent = " + vEmailSent);
}

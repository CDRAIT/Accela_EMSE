function getCurrentUserStaffInfo(emailParameters) {
	// Get user information for inspector resulting inspection - CurrentUserID
	var assignedStaff = currentUserID;
	var staffResult = aa.person.getUser(assignedStaff);
	if (!staffResult.getSuccess()) {
		logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage())
		return false;
	}
	if (staffResult.getSuccess()) {
		staffObject = staffResult.getOutput();
		var staffEmail = staffObject.getEmail();
		var staffFirst = staffObject.getFirstName();
		var staffLast = staffObject.getLastName();
		logDebug(staffFirst + " " + staffLast + " @" + staffEmail);

		var staffName = staffFirst + " " + staffLast;
		if (!matches(staffEmail, undefined, "", null)) {
			addParameter(emailParameters, "$$assignedStaffParam$$", assignedStaff);
			addParameter(emailParameters, "$$staffEmailParam$$", staffEmail);
			addParameter(emailParameters, "$$staffNameParam$$", staffName);
			return staffEmail;
		}
	}
}

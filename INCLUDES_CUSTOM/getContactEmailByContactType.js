function getContactEmailByContactType(pContactType, capid) {
	//Invoice Contact
	//Responsible Official
	// Returns the email address for the first Contact found on a Record with Contact Type = pContactType parameter
	// optional capid parameter
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capid;
	if (arguments.length == 2) thisCap = arguments[1];

	var cArray = new Array();

	if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
	{
		capContactArray = cap.getContactsGroup().toArray();
	}
	else {
		var capContactResult = aa.people.getCapContactByCapID(thisCap);
		if (capContactResult.getSuccess()) {
			var capContactArray = capContactResult.getOutput();
		}
	}

	var contactEmailToReturn = "";
	var contactTypeForCompare = "";

	if (capContactArray) {
		for (yy in capContactArray) {
			contactTypeForCompare = capContactArray[yy].getPeople().contactType;

			if (contactTypeForCompare == pContactType) {
				contactEmailToReturn = capContactArray[yy].getPeople().email;
				logDebug("DEBUG: Found Contact with Type = " + pContactType + ".  Email address for Contact = " + contactEmailToReturn);
				break;
			}
		}
	}

	if (contactEmailToReturn == null) {
		contactEmailToReturn = "";
	}

	logDebug("Returning contact email address: " + contactEmailToReturn);
	return contactEmailToReturn;
}

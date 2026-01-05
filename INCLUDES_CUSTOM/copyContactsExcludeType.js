function copyContactsExcludeType(pFromCapId, pToCapId, pContactType) {
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType
	var targetCapID = aa.cap.getCapID(pToCapId);
	var vToCapId = targetCapID.getOutput();

	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			if (Contacts[yy].getCapContactModel().getContactType() != pContactType) {
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(vToCapId);
				aa.people.createCapContact(newContact);
				copied++;
				logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
			}

		}
	}
	else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

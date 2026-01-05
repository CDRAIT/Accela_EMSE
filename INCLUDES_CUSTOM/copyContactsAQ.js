function copyContactsAQ(pFromCapId, pToCapId) {
	//Copies all contacts from pFromCapId to pToCapId
	//07SSP-00037/SP5017
	//
	if (pToCapId == null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;

	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			if (Contacts[yy].getPeople().getContactType() != "Field Inspection") {
				var newContact = Contacts[yy].getCapContactModel();

				// Retrieve contact address list and set to related contact
				var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
				if (contactAddressrs.getSuccess()) {
					var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
					newContact.getPeople().setContactAddressList(contactAddressModelArr);
				}
				newContact.setCapID(vToCapId);

				// Create cap contact, contact address and contact template
				aa.people.createCapContactWithAttribute(newContact);
				copied++;
				logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
			}
		}
	} else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

function removeCapContactplacer(capId) {

	var contact = aa.people.getCapContactByCapID(capId).getOutput();
	for (x in contact) {
		if (contact[x].getPeople().getContactType() != "Field Inspection") {
			var test = aa.people.removeCapContact(capId, contact[x].getPeople().getContactSeqNumber());
		}
	}
}

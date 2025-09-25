function getAPOParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
	//Get Address Line Param
	var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId, "Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addressLine = ad.getDisplayAddress();
	}
	addParameter(params, "$$addressLine$$", addressLine);
	//Get Parcel Number Param
	var parcelNumber = "";
	paResult = aa.parcel.getParcelandAttribute(capId, null);
	if (paResult.getSuccess()) {
		Parcels = paResult.getOutput().toArray();
		for (zz in Parcels) {
			if (Parcels[zz].getPrimaryParcelFlag() == "Y") {
				parcelNumber = Parcels[zz].getParcelNumber();
			}
		}
	}
	addParameter(params, "$$parcelNumber$$", parcelNumber);
	//Get Owner Param
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				addParameter(params, "$$ownerEmail$$", thisOwner.getEmail());
				addParameter(params, "$$ownerAddr$$", thisOwner.getMailAddress1());
				addParameter(params, "$$ownerCity$$", thisOwner.getMailCity());
				addParameter(params, "$$ownerState$$", thisOwner.getMailState());
				addParameter(params, "$$ownerZip$$", thisOwner.getMailZip());
				break;
			}
		}
	}
	return params;
}

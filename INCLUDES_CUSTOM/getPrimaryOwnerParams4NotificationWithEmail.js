function getPrimaryOwnerParams4NotificationWithEmail(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    capOwnerResult = aa.owner.getOwnerByCapId(capId);

    if (capOwnerResult.getSuccess()) {
        owner = capOwnerResult.getOutput();

        for (o in owner) {
            thisOwner = owner[o];
            if (thisOwner.getPrimaryOwner() == "Y") {
                addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
                addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				addParameter(params, "$$ownerEmail$$", thisOwner.getEmail());
                break;
            }
        }
    }
    return params;
}

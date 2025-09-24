function getuserID(Name) {
	var userID = "No UserID";
	var name = Name.split(" ");
	var useremail = aa.person.getUser(name[0], "", name[1]).getOutput();
	if (useremail.getUserID() != null && useremail.getUserID() != "") {
		userID = useremail.getUserID();
	}

	return userID;
}

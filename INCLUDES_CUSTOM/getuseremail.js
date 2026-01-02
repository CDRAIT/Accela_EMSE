function getuseremail(Name) {
	var email = "No Email Address";
	var name = Name.split(" ");
	var useremail = aa.person.getUser(name[0], "", name[1]).getOutput();
	if (useremail.getEmail() != null && useremail.getEmail() != "") {
		email = useremail.getEmail();
	}

	return email;
}

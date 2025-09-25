function getTaskAssignToEmail(thisTaskArg,tprocess)
{
	/* Get task assigned staff email address */
	var vStaffEmail = "";
	var assignedToEmail = ""; 
	var assignedTo = getTaskAssignUser(thisTaskArg,tprocess);
	if(!matches(assignedTo,null,undefined,"")) 
	{
		assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
		logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
		if(!matches(assignedToEmail,undefined,"",null,false)) 
		{
			vStaffEmail = assignedToEmail;
		}
		else{
			return false;
		}
	}
	return vStaffEmail;
}
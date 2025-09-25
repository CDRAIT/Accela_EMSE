function getUserIDfromFullName(FullName) {
    var Fname = "";
    var Mname = "";
    var Lname = "";
    var namecount = String(FullName).split(" ").length;
    var name = String(FullName).split(" ");
    if (namecount == 2) {
        Fname = name[0];
        Lname = name[1];
    }
    if (namecount == 3) {
        Fname = name[0];
        Mname = name[1];
        Lname = name[2];
    }
    var pUserIdObj = aa.person.getUser(Fname, Mname, Lname);
    var pUserId = pUserIdObj.getOutput();

    var returnValue = pUserId["gaUserID"];

    return returnValue

}

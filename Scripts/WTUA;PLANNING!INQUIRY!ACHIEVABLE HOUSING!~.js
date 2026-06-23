/*=================================================================================================================================/
| Program : WTUA;Planning/Inquiry/Achievable Housing/~.js
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : WTUA script for all Inquiry Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe  06/22/2026 Created the branch
|         : Abe  06/22/2026 Added the IT Request # 2887 - Achievable Housing Interest Form
|         : Abe  06/22/2026 Added the IT Request # 2887 to the gitHub
|         
/=====================================================================================================================================*/
if (matches(currentUserID, "JMCKENZI", "TDUNN", "EAFTAHI")) { showDebug = 1; }
logDebug("starting WTUA:Planning/Inquiry/Achievable Housing/~ ...");

var emailTemplate = "";
var mailTo = "";
var mailCc = "";
var emailParams = aa.util.newHashtable();
var officeEmail = getAppSpecific("Project Office") == "Tahoe" ? "onlinePlnPermitsTahoe@placer.ca.gov" : "onlinePlnPermits@placer.ca.gov";
var assignedPlanner = "";

addParameter(emailParams, "$$altID$$", capId.getCustomID());
addParameter(emailParams, "$$PLNOfficeEmail$$", officeEmail);

var sendEmail = false;


if (wfTask == "Form Review" && wfStatus == "Incomplete") {
    //Send email to Contact with Task Comments    
    emailTemplate = "PLN_INCOMPLETE_HOUSING_INQUIRY";

    if (getContactByType("Contact", capId))
        mailTo = getContactEmailByContactType("Contact", capId);

    addParameter(emailParams, "$$wfComment$$", wfComment);
    sendEmail = true;
}

if (wfTask == "Customer Discussion" && wfStatus == "Scheduled") {

    emailTemplate = "PLN_INQUIRY_MEETING_SCHEDULED";
    if (getContactByType("Contact", capId))
        mailTo = getContactEmailByContactType("Contact", capId);

    var assignedStaff = getAssignedToStaff();
    if (assignedStaff != null) {
        var staffResult = aa.person.getUser(assignedStaff);
        if (!staffResult.getSuccess()) { logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
        if (staffResult.getSuccess()) {
            var staffObject = staffResult.getOutput();
            var staffEmail = staffObject.getEmail();
            var staffFirst = staffObject.getFirstName();
            var staffLast = staffObject.getLastName();
            var staffPhone = staffObject.getPhoneNumber();
            assignedPlanner = staffFirst + " " + staffLast + "; " + staffEmail + "; " + staffPhone;
        }
    }

    addParameter(emailParams, "$$meetingDate$$", AInfo["Meeting Date"]);
    addParameter(emailParams, "$$meetingTime$$", AInfo["Meeting Time"]);
    addParameter(emailParams, "$$meetingLocation$$", AInfo["Meeting Location"]);
    addParameter(emailParams, "$$TeamsLink$$", !matches(AInfo["Teams Link"], null, "", " ") ? AInfo["Teams Link"] : "N/A");
    addParameter(emailParams, "$$assignedPlanner$$", assignedPlanner);
    sendEmail = true;
}

if (sendEmail) {
    var result = sendNotification(defaultFrom, mailTo, mailCc, emailTemplate, emailParams, null);
}
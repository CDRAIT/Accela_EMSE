/*=================================================================================================================================/
| Program : WTUA;Planning/Inquiry/~/~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : WTUA script for all Inquiry Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe  03/04/2026 Created the branch
|         : Abe  03/04/2026 Added the IT Request # 2887 - Achievable Housing Interest Form
|         
/=====================================================================================================================================*/
if(matches(currentUserID,"JMCKENZI","TDUNN", "EAFTAHI")) {showDebug = 1;}
logDebug("WTUA:Planning/Inquiry/~/~: started...");

var varStrContent = "";
var mailTo = "";
var mailCc = "eaftahi@placer.ca.gov";
var mailSubject = "Action Required - Achievable Housing Inquiry - " + capId.getCustomID();

if (getContactByType("Contact", capId))
    mailTo = getContactEmailByContactType("Contact", capId);


if(wfTask == "Form Review" && wfStatus == "Incomplete") {
    //Send email to Contact with Task Comments
    varStrContent = "The Achievable Housing Inquiry form you submitted is missing required information. Please review the instructions below and update your form accordingly." + "<br><br>";
    varStrContent += "<b>Instructions/Comments:</b> " + "<br>";
    varStrContent += wfComment + "<br><br>"; 
    aa.sendMail(defaultFrom, mailTo, mailCc, mailSubject, varStrContent);

}

if(wfTask == "Customer Discussion" && wfStatus == "Scheduled") {
    //Send email to contact with scheduled date
        //Send email to Contact with Task Comments
    varStrContent = "We are pleased to invite you to a meeting to discuss your submitted Achievable Housing Inquiry." + "<br><br>";
    varStrContent += "<b>Date:</b> " + AInfo["Meeting Date"] + "<br>";
    varStrContent += "<b>Time:</b> " + "TBD" + "<br>";        
    varStrContent += "<b>Location:</b> " + "TBD" + "<br><br>"; 
    aa.sendMail(defaultFrom, mailTo, mailCc, mailSubject, varStrContent);
}
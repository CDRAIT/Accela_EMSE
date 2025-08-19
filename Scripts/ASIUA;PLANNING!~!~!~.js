/*===========================================================================================/
| Program : ASIUA;Planning!~!~!~
|
| Event   : ApplicationSpecificInfoUpdateAfter 
|
| Client  : Placer County, CA
| Usage   : ASIUA script for all Planning records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 09/26/2024 Created  
|         : Abe 09/26/2024 Converted stdChoice branch to EMSE 3.0
|         : Abe 09/26/2024 added IT Request #2057 - ECS Notification on PLNs (item# 3)
|         
|
/=============================================================================================*/
showDebug = false; showMessage = false;
if(matches(currentUserID,"EAFTAHI")) {showDebug = 1;}

//conversion from stdChoice ASIUA:PLN
var vShortNotes = "";
var assignedToFullName = null;

if (typeof (PROJECT) == "object")
    for (thisRow in PROJECT) {
        var vEntitlement = null;
        var tableRow = PROJECT[thisRow];
        vEntitlement = tableRow["Entitlement"];
        vShortNotes += vEntitlement + ";";
    }
if (vShortNotes != null)
    updateShortNotes(vShortNotes);
//End of conversion

//Start of IT Request# 2057 - ECS Notification on PLNs
var assignedTo = getAssignedToStaff(); 
if(assignedTo != null) 
    assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFullName();

var emailParameters = aa.util.newHashtable();
addParameter(emailParameters, "$$altID$$", capIDString);
addParameter(emailParameters, "$$fileDate$$", fileDate);
addParameter(emailParameters, "$$capName$$", capName);
addParameter(emailParameters, "$$assigneeName$$", assignedToFullName); 

if(appTypeArray[1] != "Pre-Application" && matches(AInfo["ECSNotificationSent"], 'No', '', 'Undefined') && AInfo["Major or Minor Project"]== "Major"){
    sendNotification(defaultFrom, "","", "ECS_NOTICE_UPDATE_TO_MAJOR_PROJECT", emailParameters, null);
    editAppSpecific("ECSNotificationSent", "Yes"); 
    aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", "", "DEBUG: "+ "ASIUA:PLANNING/*/*/*)", debug);
} 
//End of IT Request # 2057
/*===========================================================================================/
| Program : CTRCA:Planning/Inquiry/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : CTRCA script for all Planning Inquiry records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   03/04/2026 Created the branch 
|         : Abe   03/04/2026 Added the IT Request # 2887 - Achievable Housing Interest Form
|
|         
|
/=============================================================================================*/
if(matches(currentUserID,"JMCKENZI","TDUNN", "EAFTAHI")) {showDebug = 1;}
logDebug("CTRCA:Planning/Inquiry/~/~: started...");

var StrContent = "A New Achievable Housing Inquiry has been submitted. Please review the details below and follow up with the inquirer as needed." + "<br><br>";
StrContent += "<b>Inquiry Number:</b> " + capId.getCustomID() + "<br>";
StrContent += "<b>Inquiry Name:</b> " + capName + "<br>";
StrContent += "<b>Received Date:</b> " + fileDate + "<br>";


if(getAppSpecific("Project Office") == "Tahoe" ){
    aa.sendMail(defaultFrom, "planningTahoe", "eaftahi@placer.ca.gov", "New Achievable Housing Inquiry Recieved - " + capId.getCustomeID(), StrContent);
}
if(getAppSpecific("Project Office") == "Auburn"){
    aa.sendMail(defaultFrom, "planningAuburn", "eaftahi@placer.ca.gov", "New Achievable Housing Inquiry Recieved - " + capId.getCustomID(), StrContent);
}



/*=============================================================================================
| Program : ASA:Planning/~/~/~
|
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : ASA script for all Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/19/2021 created production version 
|         : Abe   09/05/2024  added IT Rquest# 2057 - ECS Notifications for PLN
|         
|
/=============================================================================================*/
showDebug = false; showMessage = false;

if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:Planning");

	var slFlags = "";
	var slFlagCodes = new Array();
	var slFeeSched = "SP_PLACER_VINEYARDS";
	var slFeeList ="";
	var slFeeArray = new Array();
	var feeName = "";
	var thisQty = 1;
	var thisScope = getAppSpecific("Scope of Work");
	var thisADU = ""; 
	var addFee = true;
	var slLookupTable = "sdl:Land Use Codes";
	if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
		slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
	    
		slFlagCodes = slFlags.split(";");
		// MARIPOSA SEWER REIMBURSEMENT FLAG; PVLDRAAC	
		for(thisFlag in slFlagCodes) {
			luCode = slFlagCodes[thisFlag];
			newCode = luCode.trim();
			logDebug("This flag is " + newCode);
			if(newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
				logDebug("Trying to add condition");
				addStdCondition("Env. Engineering - Notification","Reimbursement Agreements for Sewer");
			}
		}
	}

//IT Request # 2057- ECS Notifications for PLN
var emailTemp = "";
var emailParams = aa.util.newHashtable();
addParameter(emailParams, "$$altID$$", capIDString);
addParameter(emailParams, "$$fileDate$$", fileDate);
addParameter(emailParams, "$$capName$$", capName);
logDebug(emailParams);
if (appTypeArray[1] == "Pre-Application" && !publicUser) {
    if (AInfo["Predevelopment Meeting"] == "Yes"){
        emailTemp = "ECS_NOTICE_PREDEV_MEETING_PREAPP";
        sendResult = sendNotification("", "", "", emailTemp, emailParams, null);
        logDebug(sendResult);
        assignCap('ECS_TECH');
    }
    if (AInfo["Is this a Major Project"] == "Yes" && AInfo["Predevelopment Meeting"] == "No" && AInfo["Extension of Time"] == "No"){
        emailTemp = "ECS_NOTICE_MAJOR_PROJECT_PREAPP";
        sendNotification("", "", "", emailTemp, emailParams, null);
        assignCap('ECS_TECH');
    }
	aa.sendMail("noreply@placer.ca.gov", "eaftahi@placer.ca.gov", "", "PLN PREAPP ASA- IT REQ #2057", debug);
}
//End of IT Request # 2057
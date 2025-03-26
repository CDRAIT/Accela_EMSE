/*======================================================================================/
| Program : CTRCA;ShortTermRental!Short Term Rental!~!~
|         //CTRCA:ShortTermRental/Short Term Rental/NA/NA
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Convert to real cap for all STR records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/20/2020 created script
|         : TDunn 01/04/2021 added notification call.
|         : TDunn 01/09/2021 added update to altId based on TOT number
|         : TDunn 01/14/2021 added new notification call with additional newAltId parameter
|         : TDunn 02/10/2021 updated criteria to test for valid TOT record before adding parent
|
/==========================================================================================*/

showDebug = true;

// Get 'TOT' number and update custom field
logDebug("Running Short Term Rental CTRCA script");
logDebug("TOT: " + capName);
if(capName != null && capName != "") {
	var thisToday = new Date(dateAdd(null,0));
	var thisDate = thisToday.getDate();
	var thisYear = thisToday.getFullYear();
	var thisMonth = thisToday.getMonth();
	var yearString = thisYear.toString();
	var twoYear = yearString.substr(2,2);
	var newAltId = "STR" + twoYear + "-" + capName;
	logDebug("New alt ID is " + newAltId);
	logDebug("This year is " + twoYear);
	editAppSpecific("TOT Registration Number",capName);
	aa.cap.updateCapAltID(capId, newAltId);		
}

if(getParent() == null || getParent() == false) {
	logDebug("No parent found, trying to link based on TOT number");
	var parentSuccess = true;
	var totNumber = capName;
	pCapId = aa.cap.getCapID(totNumber).getOutput();
	if(pCapId != null) {
		logDebug("TOT Reg number = " + totNumber);
		parentSuccess = addParent(totNumber);
	}
	else {
		showMessage = true;
		comment("Failed to find TOT Registration registration number " + totNumber);
	}
}

var emailTemplate = "ASA_STR_CONFIRMATION_TO_APPLICANT";

createNotificationTPS2(emailTemplate,"Y","Applicant","N","","N","N","N","Y","N","N","tdunn@truepointSolutions.com");
/*

var vFromEmail = "";
var vToEmail = "";
var vCcEmail = "tdunn@truepointsolutions.com";
var cTypeArray = new Array();
var vContactTypes = "Applicant";
cTypeArray = vContactTypes.split(",");
emailParameters = aa.util.newHashtable();
var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaDeepLinkAppTypeAlias$$
// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
getRecordParams4Notification(emailParameters);
// addParameter(emailParameters,"$$newAltId$$", newAltId); 

var conArray = new Array();
conArray = getContactArrayWithPrimary(capId); 
for (thisCon in conArray) {
	if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
		logDebug(conArray[thisCon]["contactType"]) ;
		getContactParams4Notification(emailParameters, conArray[thisCon]);
		if(emailParameters.get("$$contactEmail$$") != null) {
		vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
		}
	}
}
*/
// logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
// emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);


// var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Production STR CTRCA script ", debug);	

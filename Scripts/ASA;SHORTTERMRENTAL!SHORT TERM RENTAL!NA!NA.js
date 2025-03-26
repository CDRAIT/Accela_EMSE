/*======================================================================================/
| Program : ASA;ShortTermRental!Short Term Rental!~!~
|         //ASA:ShortTermRental/Short Term Rental/NA/NA
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all STR records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/10/2020 created script
|         : TDunn 11/12/2020 added call to populate appName into custom field
|         : TDunn 12/01/2021 added logic to add fees at submittal
|         : TDunn 01/09/2021 added logic to update altId to STR plus TOT registration number
|         : TDunn 01/14/2021 removed all logic and calls for publicUser
|
/==========================================================================================*/


showDebug = true;

// Get 'TOT' number and update custom field
logDebug("Running Short Term Rental ASA script");
if(!publicUser) {
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
		
}
var sendResult = aa.sendMail("noreply@sccgov.org","tdunn@truepointsolutions.com", "", "Testing ASA script ", debug);


/*======================================================================================/
| Program : ASA;ShortTermRental!TOT Registration!~!~
|         //ASA:ShortTermRental/TOT Registration/NA/NA
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all STR records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/05/2021 created script 
|
/==========================================================================================*/


showDebug = false;

// Get 'TOT' number and update custom field
logDebug("Running TOT Registration ASA script");
if(capName != null && capName != "") {

		editAppSpecific("Registration Number",capName);
		aa.cap.updateCapAltID(capId,capName);	
}

var sendResult = aa.sendMail("noreply@sccgov.org","tdunn@truepointsolutions.com", "", "Testing DUA script ", debug);	
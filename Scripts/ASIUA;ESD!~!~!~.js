/*===========================================================================================/
| Program : ASIUA;ESD!~!~!~
|
| Event   : ApplicationSpecificInfoUpdateAfter 
|
| Client  : Placer County, CA
| Usage   : ASIUA script for all ESD Records
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 10/22/2026 Created  
|         : Abe 10/22/2026 added IT Request# 3932 - ESD Fee Study
|                          This contains Grading Permit Type change logic 
|         : Abe 10/23/2026 Added ASIUA:ESD/Improvement Plan/~/~ and disabled
|
/=============================================================================================*/
showDebug = false; showMessage = false;
if(matches(currentUserID,"EAFTAHI")) {showDebug = 1;}

//will add this to INCLUDES_CUSTOM later
//"INFO", "SUCCESS", "WARNING", "ERROR"
eval(getScriptText("INCLUDES_LOGGING", null, null));
logDebug("Running ASIUA;ESD!~!~!~ ...");

var varAutoInvoiceFees = 'N';

if (!publicUser) {
    if (matches(appTypeArray[1], "Grading Permit")) {   //Need verification to continue
        thisGradingType = getAppSpecific("Grading Permit Type");
        if (thisGradingType == "Standard") {
            updateFee("EGP", "ESD", "FINAL", 1, varAutoInvoiceFees);
            if (feeExists("EGPENGPLANS", 'NEW')) removeFee("EGPENGPLANS", "FINAL");
            if (feeExists("EGPPOND", 'NEW')) removeFee("EGPPOND", "FINAL");
        }
        if (thisGradingType == "Engineered") {
            updateFee("EGPENGPLANS", "ESD", "FINAL", 1, varAutoInvoiceFees);
            if(feeExists("EGP","NEW")) removeFee("EGP", "FINAL");
            if (feeExists("EGPPOND", 'NEW')) removeFee("EGPPOND", "FINAL");
        }
        if (thisGradingType == "Pond"){
            addFee("EGPPOND", "ESD", "FINAL", 1, varAutoInvoiceFees);
            if(feeExists("EGP","NEW")) removeFee("EGP", "FINAL");
            if (feeExists("EGPENGPLANS", 'NEW')) removeFee("EGPENGPLANS", "FINAL");
        }
    }

    //Abe 10/23/2026: Converted from "ASIUA:ESD/Improvement Plan" stdChoice
    if (matches(appTypeArray[1], "Improvement Plan")) { 
        if(getAppSpecific("Improvement Plan Type"))
            updateShortNotes(getAppSpecific("Improvement Plan Type"));
    }
}

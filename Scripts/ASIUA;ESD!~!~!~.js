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
|         : Abe 10/23/2026 Added StdChoice ASIUA:ESD/Improvement Plan/~/~ here and disabled it
|         : Abe 11/20/2026 added last FEE STUDY updates and sent to NP1 and database(EMSE TOOL)
|
/=============================================================================================*/
showDebug = false; showMessage = false;
if(matches(currentUserID,"EAFTAHI")) {showDebug = 1;}


logDebug("Running ASIUA;ESD!~!~!~ ...");

var varAutoInvoiceFees = 'N';

if (!publicUser) {
    //NOTE: Update associated fees after post-submittal "ASI:GRADING PERMIT TYPE" updates by staff
    if (matches(appTypeArray[1], "Grading Permit")) {   
        var varGradingType = getAppSpecific("GP Type");
        if (varGradingType == "Standard") {
            logDebug("Grading Permit Type: Standard, adding/updating EGP fee ...");
            updateFee("EGP", "ESD", "FINAL", 1, varAutoInvoiceFees);
            if (feeExists("EGPENGPLANS", 'NEW')) removeFee("EGPENGPLANS", "FINAL");
            if (feeExists("EGPPOND", 'NEW')) removeFee("EGPPOND", "FINAL");
        }
        if (varGradingType == "Engineered") {
            logDebug("Grading Permit Type: Engineered, adding/updating EGPENGPLANS fee ...");
            updateFee("EGPENGPLANS", "ESD", "FINAL", 1, varAutoInvoiceFees);
            if(feeExists("EGP","NEW")) removeFee("EGP", "FINAL");
            if (feeExists("EGPPOND", 'NEW')) removeFee("EGPPOND", "FINAL");
        }
        if (varGradingType == "Pond"){
            logDebug("Grading Permit Type: Pond, adding/updating EGPPOND fee ...");
            updateFee("EGPPOND", "ESD", "FINAL", 1, varAutoInvoiceFees);
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

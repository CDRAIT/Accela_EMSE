/*=============================================================================================
| Program : ASIUA;Code!~!~!~
| Event   : ApplicationSpecificInfoUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Application Specific Info Update After for all Code records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : EAFTAHI 14/09/2023 created script.   
|           update short Notes with the Violation Description from VIOLATIONS ASIT (Violation Code)
|
|
/==============================================================================================*/
showDebug = false; showMessage = false;

if(currentUserID  == "EAFTAHI") showDebug = 3;
var varShortNotes = "";
if (typeof (VIOLATIONS) == "object") {
    for (thisRow in VIOLATIONS) {
        var tableRow = VIOLATIONS[thisRow];
        var varViolationCode = tableRow["Violation Code"];
        varViolationCode = varViolationCode.toString();
        logDebug("varViolationCode= " + varViolationCode);
        var varIndex = varViolationCode.indexOf("-") + 1;
        logDebug("varIndex= " + varIndex);
        var varViolationDesc = varViolationCode.substring(varIndex).trim();
        logDebug("varViolationDesc= " + varViolationDesc);
        varShortNotes = varShortNotes + varViolationDesc + "; ";
    }
}
if (varShortNotes != "")
    updateShortNotes(varShortNotes);
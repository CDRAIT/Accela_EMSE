/*------------------------------------------------------------------------------------------------------/
| Program : ISA:~/~/~/~
| Event   : InspectionScheduleAfter
|
| Client  : Placer County (placerco)
| Usage   : Inspection Result Submit After 
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   02/23/2026 converted from Standard Choice to EMSE 3.0
|         : 

|                
/------------------------------------------------------------------------------------------------------*/

if(matches(currentUserID,"JMCKENZI", "EAFTAHI","TDUNN"))
{
	showDebug = 3;
}

logDebug("Inside ISA:*/*/*/* ...");
logDebug("Adding 515 ESS inspection if 513 Solar Panel-Final is scheduled ...");

if (insType == '513 Solar Panel-Final')
    if (!(checkInspectionResult("515 ESS", "Pass") ||
        checkInspectionResult("515 ESS", "Final Pass") ||
        checkInspectionResult("515 ESS", "Not Required") ||
        checkInspectionResult("515 ESS", "Waived") ||
        checkInspectionResult("515 ESS", "Phased pass fee charged") ||
        checkInspectionResult("515 ESS", "Scheduled"))) {
        if (!publicUser) scheduleInspectDate("515 ESS", varSchedDate, varInspUsername, null, "Automatically Added");
        if (publicUser) scheduleInspectDate("515 ESS", varACASchedDate, varInspUsername, varSchedTime, "Automatically Added");
    }



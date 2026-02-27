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
| Notes   : Abe   02/27/2026 converted from Standard Choice to EMSE 3.0
|         : 

|                
/------------------------------------------------------------------------------------------------------*/

if (matches(currentUserID, "JMCKENZI", "EAFTAHI", "TDUNN")) {
    showDebug = 1;
}

logDebug("Inside ISA:*/*/*/* ...");


if (inspType == '513 Solar Panel-Final') {
    logDebug("Adding 515 ESS inspection if 513 Solar Panel-Final is scheduled ...");

    if (!
        (checkInspectionResult("515 ESS", "Pass") ||
        checkInspectionResult("515 ESS", "Final Pass") ||
        checkInspectionResult("515 ESS", "Not Required") ||
        checkInspectionResult("515 ESS", "Waived") ||
        checkInspectionResult("515 ESS", "Phased pass fee charged") ||
        checkInspectionResult("515 ESS", "Scheduled"))
    ) {
        logDebug("515 ESS doesn't exist");

        var varInspectorUsername = getInspector(inspType);
        logDebug("varInspectorUsername: " + varInspectorUsername);        

        if (matches(varInspectorUsername, null, undefined, "", "AACMAT"))
            varInspectorUsername = "BLDG";
        
        if (!publicUser) scheduleInspectDate("515 ESS", varSchedDate, varInspectorUsername, null, "Automatically Added");

        if (publicUser) {
            var acaFixedDateTime = new Array();
             acaFixedDateTime = fixDateForACA(convertDate(inspSchedDate));
            scheduleInspectDate("515 ESS", acaFixedDateTime[0], varInspectorUsername, acaFixedDateTime[1], "Automatically Added");
        }
    }
}


function fixDateForACA(myDate)  {
    var myMonth = "";
    var myDay = "";
    var myYear = "";
    var myHour = "";
    var myMin = "";
    var AorP = "AM";

    myMonth = myDate.getMonth(); 
    myMonth = parseInt(myMonth)+1; 
    if(parseInt(myMonth) < 10 ) 
        myMonth = "0" + myMonth;


    myDay = myDate.getDate();
     if(parseInt(myDay) < 10 ) 
        myDay = "0" + myDay;

     myYear = myDate.getFullYear();

     myHour = myDate.getHours();
     if(parseInt(myHour) > 11) 
        AorP = "PM"; 
    if(parseInt(myHour) < 10) 
        myHour = "0" + myHour;

    myMin = myDate.getMinutes();
    if(parseInt(myMin) < 10) 
        myMin = "0" + myMin;

    // varACASchedDate = myMonth + "/" + myDay + "/" + myYear; 
    // varSchedTime = myHour + ":" + myMin + AorP;
    return [myMonth + "/" + myDay + "/" + myYear, myHour + ":" + myMin + AorP];
    
}


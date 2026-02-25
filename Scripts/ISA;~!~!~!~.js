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

var isBuildingOrTRPA = false;
if (matches(appTypeArray[0], "Building", "TRPA")) {
    isBuildingOrTRPA = true;
}

//The following code should be run for Building and TRPA only.
//if (isBuildingOrTRPA) {

/*
    Inspection #0
    inspId = 1256639
    inspObj = com.accela.aa.emse.dom.InspectionScriptModel@383b5753
    inspGroup = B_BLDG
    inspType = 101 Setback
    inspInspector =
    InspectorFirstName = null
    InspectorMiddleName = null
    InspectorLastName = null
    inspSchedDate = 02/25/2026
    inspSchedTime = null
    inspAMPM =
    inspTime = null
    inspParent =
   */

    var groupTxt = "";
    var varInsGroup = inspGroup;
    var varInspType = inspType;
    var varSchedDate = inspSchedDate;
    
    

    var doNotReq = false;
    var varUseInspInspector = false;
    var varInspUsername = "BLDG";

    var varInspType = new Array();


    if (publicUser) {
        assignInspection(inspId, varInspUsername, capId);
    }

    if (vEventName == "InspectionMultipleScheduleAfter") {        //from AA
        varUseInspInspector = true;
    }

    if (vEventName == "InspectionScheduleAfter") {  //This event triggers when the inspection is scheduled from Mobile App & ACA (ConstructAPI)      
        inspInspector = "";
    }


    if (getInspector(inspType) != null) {
        varInspUsername = getInspector(inspType);
        logDebug("Inspection Type = " + inspType + ". Inspector ID = " + getInspector(inspType));
    }


/*

    if (varUseInspInspector) {
        varInspUsername = inspInspector;
        logDebug("Inspection Type = " + inspType + ". Inspector ID = " + varInspUsername);
    }

    if (varInspUsername == "RETIRED" || varInspUsername == "") {
        varInspUsername = "BLDG";
        assignInspection(inspId, varInspUsername, capId);
    }

    //if(lookup("Group Inspection Lookup",inspType) != null)  {for(thisCode in varInspType) branch("ES_SCHEDULE_INSP_GROUP");}

    if (lookup("Group Inspection Lookup", inspType) != null) {
        var varInspList = lookup("Group Inspection Lookup", inspType);
        varInspType = varInspList.split(",");
        doNotReq = true;
        for (thisCode in varInspType) branch("ES_SCHEDULE_INSP_GROUP");
    }

    if (doNotReq) {
        resultInspection(varInspType, "Complete", dateAdd(null, 0), "Group Scheduled");
    }

    if (lookup("Energy Form Inspection Lookup", inspType) != null) {
        var varInspList = lookup("Energy Form Inspection Lookup", inspType);
        varInspType = new Array();
        varInspType = varInspList.split(",");
        for (thisCode in varInspType)
            branch("ES_SCHEDULE_ENERGY_FORM_INSP");
    }

    if (publicUser) {
        myDate = convertDate(varSchedDate); branch("ES_FixDateForACA");
        AutoScheduleUnpassedInspections("BLDG", varACASchedDate, capId);
    }


    if (!publicUser && (currentUserID == "BLDG" || inspInspector == "")) AutoScheduleUnpassedInspections("BLDG", varSchedDate, capId);

    if (!publicUser && currentUserID != "BLDG" && inspInspector != "") AutoScheduleUnpassedInspections(inspInspector, varSchedDate, capId);

}

//ES_SCHEDULE_INSP_GROUP ##########
doFlag = true;
if(checkInspectionResult(varInspType[thisCode],"Pass") || checkInspectionResult(varInspType[thisCode],"Not Required") || checkInspectionResult(varInspType[thisCode],"Phased pass fee charged"))  doFlag = false;
if(checkInspectionResult(varInspType[thisCode],"Scheduled")) doFlag = true;

// if(checkInspectionResult(varInspType[thisCode],"Pass") ) doFlag = false;
// if(checkInspectionResult(varInspType[thisCode],"Not Required") ) doFlag = false;
// if(checkInspectionResult(varInspType[thisCode],"Phased pass fee charged"))  doFlag = false;
// if(checkInspectionResult(varInspType[thisCode],"Scheduled")) doFlag = true;

if(publicUser) { myDate = convertDate(varSchedDate); branch("ES_FixDateForACA");}

if(varInspType[thisCode]!= null && doFlag && !publicUser) scheduleInspectDate(varInspType[thisCode],varSchedDate,varInspUsername,null,groupTxt);
if(varInspType[thisCode]!= null && doFlag && publicUser ) scheduleInspectDate(varInspType[thisCode],varACASchedDate,varInspUsername,varSchedTime,groupTxt);
// END ES_SCHEDULE_INSP_GROUP ##########


//ES_SCHEDULE_ENERGY_FORM_INSP ##########
true ^ doFlag = true;
checkInspectionResult(varInspType[thisCode],"Scheduled") ^ doFlag = false;
{Project Office} == "Tahoe" && inspType == "433 Reroof Final" ^ doFlag = false;
publicUser && doFlag ^ myDate = convertDate(varSchedDate); branch("ES_FixDateForACA");
varInspType[thisCode]!= null && doFlag && !publicUser ^ scheduleInspectDate(varInspType[thisCode],varSchedDate,"BLDG",null,"Automatically Added");
varInspType[thisCode]!= null && doFlag && publicUser ^ scheduleInspectDate(varInspType[thisCode],varACASchedDate,"BLDG",varSchedTime,"Automatically Added");

//END ES_SCHEDULE_ENERGY_FORM_INSP ##########


//ES_FixDateForACA ##########
true ^ myMonth = ""; myDay = ""; myYear = ""; myHour = ""; myMin = ""; AorP = "AM";
true ^ myMonth = myDate.getMonth(); myMonth = parseInt(myMonth)+1; if(parseInt(myMonth) < 10 ) myMonth = "0" + myMonth;
true ^ myDay = myDate.getDate(); if(parseInt(myDay) < 10 ) myDay = "0" + myDay;
true ^ myYear = myDate.getFullYear();
true ^ myHour = myDate.getHours(); if(parseInt(myHour) > 11) AorP = "PM"; if(parseInt(myHour) < 10) myHour = "0" + myHour;
true ^ myMin = myDate.getMinutes(); if(parseInt(myMin) < 10) myMin = "0" + myMin;
true ^ varACASchedDate = myMonth + "/" + myDay + "/" + myYear; varSchedTime = myHour + ":" + myMin + AorP;
//end ES_FixDateForACA ##########


*/




/*

//ISA:TRPA/Building/NA/NA

if(publicUser) {assignInspection(inspId,"BLDG",capId);}

groupTxt = ""; varInspUsername = "BLDG";varInspType = inspType; doNotReq = false; varUseInspInspector = false;

if(vEventName == "InspectionMultipleScheduleAfter") { varSchedDate = inspSchedDate; varUseInspInspector = true;}
if(vEventName == "InspectionScheduleAfter") {varSchedDate = inspSchedDate; inspInspector = "";}

if(lookup("Group Inspection Lookup",inspType) != null) { varInspList = lookup("Group Inspection Lookup",inspType); varInspType = new Array(); varInspType = varInspList.split(","); doNotReq = true;}
if(getInspector(inspType) != null) {varInspUsername = getInspector(inspType); comment("Inspection Type = " + inspType + ". Inspector ID = " + getInspector(inspType));}
if(varUseInspInspector) varInspUsername = inspInspector; comment("Inspection Type = " + inspType + ". Inspector ID = " + varInspUsername);

if(varInspUsername == "RETIRED" || varInspUsername == "")  {varInspUsername = "BLDG"; assignInspection(inspId,varInspUsername,capId);}
if(lookup("Group Inspection Lookup",inspType) != null) { for(thisCode in varInspType) branch("ES_SCHEDULE_INSP_GROUP");}

if(doNotReq) {resultInspection(varInspType,"Complete",dateAdd(null,0),"Group Scheduled");}
if(lookup("Energy Form Inspection Lookup",inspType) != null) {varInspList = lookup("Energy Form Inspection Lookup",inspType); varInspType = new Array(); varInspType = varInspList.split(",");}
if(lookup("Energy Form Inspection Lookup",inspType) != null) {for(thisCode in varInspType) branch("ES_SCHEDULE_ENERGY_FORM_INSP");}
if(publicUser) {myDate = convertDate(varSchedDate); branch("ES_FixDateForACA");}
if(publicUser) {AutoScheduleUnpassedInspections("BLDG", varACASchedDate, capId);}
if(!publicUser && (currentUserID == "BLDG" || inspInspector == "")) { AutoScheduleUnpassedInspections("BLDG", varSchedDate, capId);}
if(!publicUser && !currentUserID == "BLDG" && inspInspector != "")  {AutoScheduleUnpassedInspections(inspInspector, varSchedDate , capId);}



*/
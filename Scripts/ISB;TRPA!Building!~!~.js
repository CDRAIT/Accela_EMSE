/*------------------------------------------------------------------------------------------------------/
| Program : ISB:TRPA/Building/~/~
| Event   : InspectionScheduleBefore
|
| Client  : Placer County (placerco)
| Usage   : Inspection Result Submit Before for all TRPA/Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 04/10/2026 Converted to EMSE 3.0 from StdChoice ISB:TRPA/Building
|                
/------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"EAFTAHI"))
{
	showDebug = 1;
}

logDebug("Processing ISB:TRPA/Building/~/~ ...");

//#001
cancel = false;
showMessage = false;

var vCancelFlag = false;
var vString = "";

var isFinalInspection = false;
if (inspType == "600" ||
    inspType == "601 Final-Building" ||
    inspType == "602 Final-Electrical" ||
    inspType == "603 Final-Plumbing" ||
    inspType == "604 Final-Mechanical" ||
    inspType == "605 Certificate of Occupancy" ||
    inspType == "606 Agriculture Setback Final" ||
    inspType == "608 Temporary C of O" ||
    inspType == "513 Solar Panel-Final" ||
    inspType == "905 Manufactured Home-Final") {

    isFinalInspection = true;
}



//#010
if(balanceDue > 0){
    vString += "<font size = 4 color=ff000><b>Balance Due:</b></font><br>There is a balance due of $" + balanceDue;    
    vString += " for this Building Permit. A final inspection cannot be scheduled.<br><br>";
    vCancelFlag = true;
}

//#016
if(feeGetTotByDateRange(dateAdd(null,-730),dateAdd(null,0),"NEW") > 0 ){
    vString += "<font size = 4 color=ff000><b>Assessed Fees:</b></font><br>There are uninvoiced assessed fees in the amount of $"+ feeGetTotByDateRange(dateAdd(null,-730),dateAdd(null,0),"NEW");    
    vString +=  " for this Building Permit.  No additional inspections can be scheduled until the fees are assessed and paid.<br><br>";
    vCancelFlag = true;
}

//#090
if(capStatus != "Inspection Request Received" && capStatus != "Issued" && capStatus != "Re-Issue" && capStatus != "OPEN" && capStatus != "Revisions"){
    vString += "<font size = 4 color=ff000><b>Inspections cannot be scheduled</b></font><br>The current status is: " + capStatus;    
    vString += " for this Building Permit. All building permts must be in either an Issued or Re-Issue status to schedule inspections.<br><br>";
    vCancelFlag = true;
}

//#100
//Checking Prevent Inspection app conditions
if(appHasCondition("Building - Prevent Building Inspections", "Applied", null, null)||
appHasCondition("Planning - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("ESD - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("Env. Engineering - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("Code Compliance - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("Env. Health - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("DPW - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("Fire - Prevent Building Inspections", "Applied", null, null) ||
appHasCondition("Other - Prevent Building Inspections", "Applied", null, null)){

    vString += "<font size = 4 color=ff000><b>Inspections cannot be scheduled on this permit because not all conditions have been met.</b></font><br><br>";    
    vCancelFlag = true; 
}


//#110
//checking Prevent Final Inspection app conditions
if (isFinalInspection) {
    if (appHasCondition("Building - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Planning - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("ESD - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Env. Engineering - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Code Compliance - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Env. Health - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("DPW - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Fire - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Other - Prevent Final / Completion", "Applied", null, null)
    ) {

        vString += "<font size = 4 color=ff000><b>A Final Inspection cannot be scheduled on this permit because not all conditions have been met.</b></font><br><br>";        
        vCancelFlag = true;
    }

}
 //#120
 //checking misc Prevent Finals app conditions
if (isFinalInspection) {
    // branch("ES_BLD_CHECK_CONDS") Converted branch to script called below
    include("BUILDINGCHECKCONDITIONS");
    
    //Line# 900 within branch("ES_BLD_CHECK_CONDS")
    include("BUILDINGCHECKPARCELCONDITIONS");
}


if(vCancelFlag){
    showMessage = true;
    customComment(vString);
    cancel = true;
}
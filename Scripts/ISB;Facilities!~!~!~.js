/*------------------------------------------------------------------------------------------------------/
| Program : ISB:Facilities/~/~/~
| Event   : InspectionScheduleBefore
|
| Client  : Placer County (placerco)
| Usage   : Inspection Result Submit Before for all Facilities records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 04/10/2026 Converted to EMSE 3.0 from StdChoice ISB:Facilities
|                
/------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"EAFTAHI"))
{
	showDebug = 1;
}

logDebug("Processing ISB:Facilities/~/~/~ ...");

cancel = false;
showMessage = false;

//#100
if(balanceDue > 0) {
    showMessage = true;
    var vString = "<font size = 4 color=ff000><b>Balance Due:</b></font><br>There is a balance due of $" 
    vString += balanceDue; 
    vString += " for this Facilities Permit.  No additional inspections can be scheduled until the balance due it paid.<br>";

    customComment(vString);
    cancel = true;
}

//#110
if(feeGetTotByDateRange(dateAdd(null,-730),dateAdd(null,0),"NEW") > 0){
    showMessage = true;
    var vString = "<font size = 4 color=ff000><b>Assessed Fees:</b></font><br><br>There are uninvoiced assessed fees in the amount of $"; 
    vString += feeGetTotByDateRange(dateAdd(null,-730),dateAdd(null,0),"NEW"); 
    vString += " for this Facilities Permit.  No additional inspections can be scheduled until the fees are assessed and paid.<br>";

    customComment(vString);
    cancel = true
}
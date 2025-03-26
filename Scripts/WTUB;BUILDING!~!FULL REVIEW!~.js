/*------------------------------------------------------------------------------------------------------/
| Program : WTUB;Building!NA!Full Review!NA
|         : WTUB:Building/NA/Full Review/NA
| Event   : WorkflowTaskUpdateBefore
|
| Client  : Placer County, CA: PLACERCO
| Usage   : Workflow Task Update Before for all building Full Reviews. Block Plan Check completion if Plan Check Fees unpaid
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|    Notes: EAFTAHI 11/17/2022: Created
|           EAFTAHI 12/06/2022: Added Status to the feeExists()
|                               Changed if conditions 
|           
|

if ((appTypeArray[1] == 'Residential' || appTypeArray[1] == 'Commercial'))
    if (wfTask == "Plan Check" && wfProcess == "BLD_20181201_MAIN" && wfStatus == "Complete" )
        if ( (feeExists("0715","NEW","INVOICED") && feeBalance("0715")> 0) || (feeExists("0102","NEW","INVOICED") && feeBalance("0102") > 0)) {
            showMessage = true;
            comment("<font size = 4 color=ff000><b> Unpaid Plan Check Fee! </b></font><br> Plan Check fees must be paid before PLAN CHECK completion.");
            cancel = true;
        }

/------------------------------------------------------------------------------------------------------*/
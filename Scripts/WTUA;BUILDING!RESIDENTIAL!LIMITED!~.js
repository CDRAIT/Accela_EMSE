/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Building!Residential!Limited!~	
|         //WTUA:Building/Residential/Limited/*
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for  records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe   09/09/2024 created branch
|         : Abe   09/09/2024 IT Request # 2148 - Add Flood Zone Ad-Hoc 
|
/------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"EAFTAHI")) { showDebug = 1;}
logDebug("Running EMSE WTUA:/Building/Residential/Limited/...");

//Abe 09/09/2024: IT Request# 2148
if(wfProcess == "BLD_20181201_DISTRIBUTION" && wfTask == "Engineering and Surveying Review" && matches(wfStatus,"Complete","Pending", "Pending (Tahoe back office review finished)")){
    if(AInfo["Flood Zone Review"] == "Yes" && !(taskStatus("Flood Zone Review","ADHOC"))){
        addAdHocTask("ADHOC","Flood Zone Review","Engineering and Surveying");
        assignTask("Flood Zone Review","MKELLER");
    }
        
}
//End of IT Request# 2148
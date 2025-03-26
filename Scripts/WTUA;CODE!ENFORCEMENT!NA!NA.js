/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Code!Enforcement!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Vehicle Abatement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 11/22/2024 created script - Converted from StdChoice, WTUA:Code/~/~/~ branch
|          
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("In the WTUA:Code/Enforcement/*/* ...");

if(matches(wfStatus,"Resolved","Notes", "Appeal Hearing CBO","Referred","Unfounded","No Violation")) {
    removeParcelCondition(null,"Code","Unlawful Landuse"); 
    removeParcelCondition(null,"Code Compliance - Notification","Unlawful Land Use");
}
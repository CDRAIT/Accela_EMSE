/*======================================================================================/  
| Program : ASA;HazVeg!Hazardous Vegetation!~!~  
| Event   : ApplicationSubmitAfter  
|  
| Client  : Placer County, CA  
| Usage   : Application Submit After for all HazVeg records.  
|   
|  
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.  
|  
| Notes   : TDunn 10/15/2020 created script  
|         : Abe   03/31/2025 IT Request # 1986 - HazVeg Workflow Revise  
|  
/==========================================================================================*/

if (currentUserID == "EAFTAHI") { showDebug = true; }
// Set received date in custom Fields
logDebug("Executing EMSE ASA:HazVeg/Hazardous Vegetation/*/* ...");

editAppSpecific("Complaint / Request Received", dateAdd(null, 0));

/**   
 *     
 * Abe - 07/09/2024:  IT Request # 1986 - HazVeg Workflow Revise   
 *
*/

//logDebug("******* parentCapId:" + parentCapId);
if (publicUser)
    editAppSpecific("Received via", "Online");

if (!publicUser && !parentCapId ) 
    sendAcknowledgementLtr2Applicant();

//End of IT Request # 1986 - HazVeg Workflow Revise  
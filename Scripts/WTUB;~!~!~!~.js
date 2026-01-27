/*------------------------------------------------------------------------------------------------------/
| Program : WTUB;~!~!~!
|         : WTUB:NA/NA/NA/NA
| Event   : WorkflowTaskUpdateBefore
|
| Client  : Placer County, CA: PLACERCO
| Usage   : Workflow Task Update Before for all records. 
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|    Notes: EAFTAHI 01/27/2026: Created
|           EAFTAHI 01/27/2026: Added IT Request# 2584 - Testing script to check PCCP Hold parcel condition
|           
|
/------------------------------------------------------------------------------------------------------*/


logDebug("Running WTUB:*/*/*/* ...");

//IT Request# 2584
var hasPCCPHold = 0;
var isIssuanceTask = false;
hasPCCPHold = getConditions("PCCP - Prevent Issuance / Approval", "Applied", "PCCP Application Required", null).length;

if(hasPCCPHold){  //check if issuance

 if (   //Building
		(matches(wfProcess, "BLD_20230501_MAIN", "BLD_20181201_MAIN", "BLD_DEFERRED_20240710","BLD_PLNCHK_20241222", "BLD_20231116_REV") && wfTask == "Process for Issuance" && matches(wfStatus, "Issued", "Signature Requested", "Approved")) ||
		(matches(wfProcess, "B_OTC", "B_Master") && wfTask == "Plan Check" && matches(wfStatus, "Issued","Complete")) ||
		//EnV Health
        (wfProcess == "EH_STD" && wfTask == "Review Closure" && wfStatus == "Complete")  ||        
		//ESD
		(matches(wfProcess, "ESD_FM1", "ESD_PM1", "ESD_ROS") && wfTask == "Final ESD Review" && matches(wfStatus, "Complete","Approved")) ||        
        (wfProcess == "ESD_GRAD_WFDCNV" && wfTask == "Permit to Applicant" && wfStatus == "Complete") ||         
        (wfProcess == "ESD_IMPROVEMENTPLN" && wfTask == "Improvement Plan Final Approval" && wfStatus == "Approved") ||         
        
        (wfProcess == "EED_SEWER" && wfTask == "Ready to Issue" && wfStatus == "Issued") ||        //Sewer Permit

        (wfProcess == "P_ADMIN1" && wfTask == "Decision" && wfStatus == "Approved") ||        //Admin
        (wfProcess == "P_PCPROJECT" && wfTask == "Final Decision" && wfStatus == "Complete") ||        //Planning
        (wfProcess == "P_MBLA1" && wfTask == "ZA/PRC Hearing" && wfStatus == "Approved") ||   //Subdivision
        (wfProcess == "P_PRE1" && wfTask == "Checklist Sent to Applicant" && wfStatus == "Complete") ||   //All ACA records
        (wfProcess == "P_PLN2" && wfTask == "Project Closure" && wfStatus == "Closed") ||   //Planning Master

        (wfProcess == "ESD_ABAN" && wfTask == "BOS Hearing" && wfStatus == "Approved") ||  //ESD Abandonment
        (wfProcess == "ESD_ENC" && wfTask == "Site Inspection" && wfStatus == "Plan Check") ||      //ENC Permit

        (wfProcess == "P_SAV" && wfTask == "Project Closure" && wfStatus == "Complete")      //TRPA PLANNING
    ) {
        isIssuanceTask = true;
    }
}
logDebug( "Cancel = " + hasPCCPHold && isIssuanceTask);
if (hasPCCPHold && isIssuanceTask) {
    //stop issuance, completion, approval, etc. of all record types
    showMessage = true;
    var vString = "There are Applied Conditions that must be cleared before proceeding.";
    customComment(vString);
    cancel = true;
}
//End of IT Request# 2584
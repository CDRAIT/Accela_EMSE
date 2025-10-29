/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;Code!Enforcement!~!~
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all Code Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : eaftahi 11/22/2024 created script - Converted from StdChoice, WTUA:Code/~/~/~ branch
|           EAFTAHI 10/01/2025 Added IT Request# 1675 - New Code Compliance WF
|
|
/--------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

if (currentUserID == "EAFTAHI") { showDebug = 1; }
logDebug("In the WTUA:Code/Enforcement/*/* ...");

//Old WF
if (matches(wfStatus, "Resolved", "Notes", "Appeal Hearing CBO", "Referred", "Unfounded", "No Violation")) {
    removeParcelCondition(null, "Code", "Unlawful Landuse");
    removeParcelCondition(null, "Code Compliance - Notification", "Unlawful Land Use");
}

var varAInfo = new Array();

//To append wf process code.wftask. to TSI field label
useTaskSpecificGroupName==true;
loadTaskSpecific(varAInfo);
logDebug("*****************The New AInfo: "+ varAInfo);



if (wfProcess == "CODE_ENF") { //New Workflow

//assigns the record to the current user regardless of the tasks
if(matches(wfStatus, "Unfounded", "Referred & Closed", "Duplicate", "Withdrawn" )){
	assignCap(currentUserID);    
}

    if (wfTask == "Complaint Recieved") {
        if (wfStstus == "Unfounded") {
            //Send Unfounded Letter to Applicant (2)
        }
        if (wfStstus == "Referred & Closed") {
            //Send Referral Email to Agencies (4)
            //Send Referral Letter to Applicant (3)
        }
        if (wfStatus == "Referred & Investigation") {
            //Send Referral Email to Agencies (4)
            //Send Referral Letter to Applicant (3)
            // Send Courtesy Notice Letter to Parties (5)
        }
        if (wfStatus == "Courtesy Notice Sent") {
            // Send Courtesy Notice Letter to Parties (5)
        }
    }

    if (wfTask == "Investigation") {
        if(wfStatus == "Referred & Closed") {
            //send Referral Email to Agencies (4)
            //Send Referral Letter to Applicant (3)
        }
        if(wfStatus == "Referred & Violation"){
            //send Referral Email to Agencies (4)
            //Send Referral Letter to Applicant (3)
            
        }
    }

    if (wfTask == "Enforcement Action") {
        if (wfStatus == "NOV Mailed") {
            //Create NOV Letter (6)
        }
        if (wfStatus == "Citation & Notice of Nuisance") {
            //Create the fork manually
            activateTask("Citation");
            activateTask("Nuisance Outcome");
            closeTask("Enforcement Action", "Citation & Notice of Nuisance","Closed by Script","Forked by Script");

            //Create Nuisance Letter (11)
            //Nuisance Email to Staff (12)

        }
        if (wfStatus == "Notice of Nuisance") {            
            //Create Nuisance Letter (11)
        }
    }

    if (wfTask == "Citation") {
        if (wfStatus == "Citation") {
            // Create Citation Letter (7)}
            //Email Citation Appeal to Officer (8)         
        }
    }

    if (wfTask == "Appeal") {
        if (wfStatus == "No Appeal") {
            //Create the fork manually
            activateTask("Citation");
        }
    }

    if (wfTask == "Administrative Hearing") {
        if (wfStatus == "Pending Hearing") {
            //Send Hearing Letter (9)
            //Send Complainant Hearing Notice (19)
        }
        if (wfStatus == "Continued") {
            //Send Hearing Letter (9)
            //Send Complainant Hearing Notice (19)
        }
        if (wfStatus == "Citation Upheld") {
            //Email Citaion Upheld to Officer (10)

            //Create fork Manually
            activateTask("Enforcement Action");
        }        
    }

    if (wfTask == "Abatement Hearing") {
        if (matches(wfStatus, "Pending Hearing", "Continued")) {
            //Nuicance Abatement Letter (13)
        }
        if (wfStatus == "Abatement Upheld") {
            //Reinspection Email to staff (14) - or Create an inspection 
        }
    }

    if (wfTask == "Reinspection Outcome") {
        if (wfStatus == "In Violation - Enforcement") {
            // Create the fork manually            
            activateTask("Enforcement Action");            
        }
    }

    if ((wfTask == "Citation" && wfStatus == "Complied") ||
        (wfTask == "Abatement Processing" && wfStatus == "Abatement Complete") ||
        (wfTask == "Administrative Hearing" && matches(wfStatus, "Complied", "Citation Upheld")) ||
        (wfTask == "Appeal" && wfStatus == "No Appeal")) {
        //Send Case Closed Letter (15)
    }

    if (wfTask == "Fine Processing") {
        if (wfStatus == "Request for Payment") {
            //Create Invoice Cover Letter (16)
            //Eamil Fines Due to Staff (17)
        }
        if (wfStatus == "Subsequent Request") {
            //Eamil Fines Due to Staff (17)
            //Invoice Cover Letter, 2nd (18)
        }
    }
}


/*------------------------------------------------------------------------------------------------------/
| Program : ISB:Building/~/~/~
| Event   : InspectionScheduleBefore
|
| Client  : Placer County (placerco)
| Usage   : Inspection Result Submit Before for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 04/10/2026 Converted to EMSE 3.0 from StdChoice ISB:Building
|           Abe 04/10/2026 Merged current ISB into ISB:Building 
|                
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Program : ISB:~/~/~/~
| Event   : InspectionScheduleBefore
|
| Client  : Placer County (placerco)
| Usage   : Inspection Result Submit Before for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/03/2021 updated scripting for cancelled or rescheduled inspection.
|         : TDunn 01/10/2022 updated script to generate rescheduled notice from ISB event.
|         : Abe   06/25/2024 IT Request# 1485 - New Building Inspection Flags/Conditions
|         : TDunn 11/02/2024 converted main EMSE 2.0 ISB:Building and disabled standard choice
|         : TDunn 11/02/2024 added DPW Inspection schedule stop conditions
|         : TDunn 01/11/2026 deployed to nonprod1
|         : TDunn 01/11/2026 added logic to stop inspection scheduling on Revisions and Deferred Submittals		  
|         : TDunn 03/20/2026 ?
|         : Abe   04/10/2026 Synced the Github version with database - the Github was behind!
|         : Abe   05/13/2026 added 515 ESS to the "Final Inspection" list - IT REQUEST# 3465
|         : Abe   07/01/2026 Replaced all noreply@placer.ca.gov emails to defaultFrom (INCLUDES_CUSTOM_GLOBALS)
|
|
/------------------------------------------------------------------------------------------------------*/

if (matches(currentUserID, "JMCKENZI", "EAFTAHI", "TDUNN")) {
    showDebug = 1;
}
logDebug("Processing ISB:Building/~/~/~ ...");

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
    inspType == "515 ESS" ||
    inspType == "905 Manufactured Home-Final") {

    isFinalInspection = true;
}


var appHasAllowInspFlag = false;
if (appHasCondition("Building - Allow Inspections through 100 Series", "Applied", null, null) ||
    appHasCondition("Building - Allow Inspections through 200 Series", "Applied", null, null) ||
    appHasCondition("Building - Allow Inspections through 300 Series", "Applied", null, null)) {
    appHasAllowInspFlag = true;
}



var appTypeString = "";
var appTypeArray = new Array();
if (capId != null) {
    capIDString = capId.getCustomID();
    cap = aa.cap.getCap(capId).getOutput();
    appTypeResult = cap.getCapType();
    appTypeAlias = appTypeResult.getAlias();
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");
}
logDebug("Record Type: " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);

//generates rescheduled notice to staff
if (vEventName == "InspectionMultipleScheduleBefore") {
    logDebug(inspSchedDate);
    varUseInspInspector = true;
    varSchedTime = "00:00AM";
}

if (vEventName == "InspectionScheduleBefore") {
    inspSchedDate = InspectionDate;
    varSchedTime = "00:00AM";
    varUseInspInspector = false;

    if (!matches(getLastScheduledInspector(inspType), "", null, undefined, "BUILDING")) {
        logDebug(getLastScheduledInspector(inspType));
        inspInspector = getLastScheduledInspector(inspType);
        varUseInspInspector = true;
    }
}

if (varUseInspInspector) {
    var senderEmailAddr = defaultFrom;                                              
    var emailAddrAdmin = "tdunn@truepointsolutions.com";
    var ccEmailAddrAdmin = "";
    var emailText = inspType + "; " + inspInspector + "; scheduled = " + checkInspectionResult(inspType, "Scheduled");
    var lastInspector = getLastScheduledInspector(inspType);
    var emailParameters = aa.util.newHashtable();
    var inspResult = "Rescheduled";

    logDebug("Inspection type is " + inspType);
    logDebug(checkInspectionResult(inspType, "Scheduled"));
    logDebug("Prior assigned to " + lastInspector);
    logDebug("assigned to: " + inspInspector);
    // Try generating the notice from here when checkInspectionResult is true, the inspection already exists and is scheduled.
    if (lastInspector != "BLDG" && checkInspectionResult(inspType, "Scheduled")) {
        logDebug("Sending email");
        // aa.sendMail(senderEmailAddr, emailAddrAdmin, ccEmailAddrAdmin, "ISB Test Results", emailText);
        var staffEmail = "";
        var assignedStaff = getLastScheduledInspector(inspType);
        logDebug("Assigned to = " + assignedStaff);
        if (assignedStaff == null) {
            assignedStaff = getInspector(inspType);
            logDebug("Assigned to = " + assignedStaff);
        }
        if (!matches(assignedStaff, "BLDG", null, "", undefined)) {
            staffResult = aa.person.getUser(assignedStaff);
            if (!staffResult.getSuccess()) { logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
            if (staffResult.getSuccess()) {
                staffObject = staffResult.getOutput();
                staffEmail = staffObject.getEmail();
                var staffFirst = staffObject.getFirstName();
                var staffLast = staffObject.getLastName();
                logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
                var staffName = staffFirst + " " + staffLast;
            }

            if (!matches(staffEmail, undefined, "", null)) {
                vToEmail = staffEmail;
                vFromEmail = "";
                vCcEmail = "";
                vTemplateName = "IRSA_CANCEL_RESCHEDULE_NOTICE_TO_INSPECTOR";
                addParameter(emailParameters, "$$assignedStaffParam$$", assignedStaff);
                addParameter(emailParameters, "$$staffEmailParam$$", staffEmail);
                addParameter(emailParameters, "$$staffNameParam$$", staffName);
                addParameter(emailParameters, "$$inspTypeParam$$", inspType);
                addParameter(emailParameters, "$$inspResultParam$$", inspResult);
                addParameter(emailParameters, "$$inspSchedDateParam$$", inspSchedDate);
                addParameter(emailParameters, "$$altID$$", capIDString);

                emailResult = sendNotification(vFromEmail, vToEmail, vCcEmail, vTemplateName, emailParameters, null);
                logDebug("Email sent is " + emailResult);
            }

        }
    }
}
//End of rescheduled notice

// Converted from EMSE 2.0 ISB:Building/*/*/* on 11/02/2024
// Abe: 04/102026 - updated the following codes and added the rest of Emse 2.0 from ISB:Building

if (!matches(capStatus, "Inspection Request Received", "Issued", "Re-Issue", "OPEN", "Revisions", "Issued - Revision Pending")) {
    vString += "<font size = 4 color=ff000><b>Inspections cannot be scheduled</b></font><br>The current status is: ";
    vString += capStatus + " for this Building Permit. All building permts must be in either an Issued or Re-Issue status to schedule inspections.<br><br>";
    vCancelFlag = true;
}

//Duplicate of below 
// if ((inspType == "601 Final-Building" || inspType == "600") && balanceDue > 0) 
// {	
//     vString += "<font size = 4 color=ff000><b>Balance Due:</b></font><br><br>There is a balance due of $";
//     vString += balanceDue + " for this Building Permit.  A final inspection cannot be scheduled.<br>";
// 	vCancelFlag = true;
// }

if (balanceDue > 0) {
    vString += "<font size = 4 color=ff000><b>Balance Due:</b></font><br><br>There is a balance due of $";
    vString += balanceDue + " for this Building Permit. No additional inspections can be scheduled until the balance due is paid.<br><br>";
    vCancelFlag = true;
}

if (feeGetTotByDateRange(dateAdd(null, -730), dateAdd(null, 0), "NEW") > 0)  //Abe: The link below should be replaced by ACA permit link
{
    vString += "<font size = 4 color=ff000><b>Assessed Fees:</b></font><br><br>There are uninvoiced assessed fees in the amount of $";
    vString += feeGetTotByDateRange(dateAdd(null, -730), dateAdd(null, 0), "NEW") + " for this Building Permit.";
    vString += "No additional inspections can be scheduled until the fees are assessed and paid.<br> <br> Once your fees have been invoiced, you can pay them online at ";
    vString += "<STRONG>officialpayments.com</STRONG> by clicking <A style=\"COLOR: #0066cc\" href=\"https://www.officialpayments.com/pc_entry_standard.jsp?productId=223084910730056797356729673718599771\" target=_blank><STRONG><U>HERE</U></STRONG></A>. ";
    vString += "All fees must be paid by 4:30 pm the day <I>prior</I> to your desired inspection date. <br><br>";
    vCancelFlag = true;
}

if (appHasCondition("Env. Health OTC Tuesday", "Applied", null, null)) {
    vString += "<font size = 4 color=ff000>Inspections cannot be scheduled on this permit because not all conditions have been met.</font> <br><br>";
    vCancelFlag = true;
}

if (appHasCondition("Fire District OTC Tuesday", "Applied", null, null)) {
    vString += "<font size = 4 color=ff000>Inspections cannot be scheduled on this permit because not all conditions have been met.</font> <br><br>";
    vCancelFlag = true;
}

if (appHasCondition("Building - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("Planning - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("ESD - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("Env. Engineering - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("Code Compliance - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("Env. Health - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("DPW - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("Fire - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("Other - Prevent Building Inspections", "Applied", null, null) ||
    appHasCondition("DPW - Prevent Building Inspections", "Applied", "DPW Prevent Building Inspections", null)) {
    vString += "<font size = 4 color=ff000><b>Inspections cannot be scheduled on this permit because not all inspection stop conditions have been met.</b></font><br><br>";
    vCancelFlag = true;
}

//Prevent final Inspection
if (isFinalInspection) {
    if (appHasCondition("Building - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Planning - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("ESD - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Env. Engineering - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Code Compliance - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Env. Health - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("DPW - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Fire - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("PUD - Prevent Final / Completion", "Applied", null, null) ||
        appHasCondition("Other - Prevent Final / Completion", "Applied", null, null)) {

        vString += "<font size = 4 color=ff000><b>A Final Inspection cannot be scheduled on this permit because not all conditions have been met.</b></font><br><br>";
        vCancelFlag = true;
    }
}

//Dublicate
// if (inspType == "601 Final-Building" && appHasCondition("DPW - Prevent Final / Completion", "Applied", null, null)) {
//     showMessage = true;
//     comment("<font size = 4 color=ff000><b>A Final Building Inspection cannot be scheduled on this permit because a DPW - Prevent Final / Completion condition has not been met.</b></font><br><br>");
//     cancel = true;
// }

if (isFinalInspection) {
    // branch("ES_BLD_CHECK_CONDS") Converted branch to script called below
    include("BUILDINGCHECKCONDITIONS");
    // Line# 900 within branch("ES_BLD_CHECK_CONDS")
    include("BUILDINGCHECKPARCELCONDITIONS");
}

// Carry forward current rule to cancel final inspection request when Revision pending
// List of inspection to block:  914 TRPA Final, Final Inspection to Close Permit, 601 Final-Building.  May want to include 602 Final-Electrical, 603 Final-Plumbing, 604 Final-Mechanical
if (matches(capStatus, "Issued - Revision Pending")) {
    logDebug("1 cancel = " + cancel);
    var blockFinalArray = new Array();
    var commentStr = "";
    var lkUpValue = "blockFinalFull";
    blockFinalArray = lookup("InspectionBlockListOnRevision", lkUpValue).split(",");
    logDebug("final array: " + blockFinalArray);
    cflag = false;
    logDebug("cflag = " + cflag);
    for (tInsp in blockFinalArray) {
        cInsp = blockFinalArray[tInsp];
        logDebug("current from list: " + cInsp);
        if (cInsp == inspType) {
            logDebug(cInsp + " is blocked")
            cflag = true;
        }
        logDebug("cflag = " + cflag);
    }
    if (cflag) {
        vString += "The " + inspType + " inspection cannot be scheduled when the Building Permt status is " + capStatus;
        vString += "<br><br>";
        //showMessage = true;
        //comment(commentStr);
        vCancelFlag = true;
    }
    //logDebug("2 cancel = " + cancel);
}


if (matches(appTypeArray[1], "Revision", "Deferred Submittal")) {
    vString += "Scheduling an inspection  on a " + appTypeArray[1] + " is not allowed. Please schedule all inspections on the parent permit.<br><br>"
    //showMessage = true;
    // customComment(messageStr);
    vCancelFlag = true;
}
//logDebug("3 cancel = " + cancel);

//Abe- 06/25/2024 - IT Request # 1485 - New Building Inspection Flags/Conditions
if (appHasAllowInspFlag) {
    //TBD
    var resArr = checkAllowanceConditions(inspType);
    if(resArr[1]){
        vString += resArr[0];
        vCancelFlag = true;
    }

}
//End of IT Request # 1485 


if (vCancelFlag) {
    showMessage = true;
    customComment(vString);
    cancel = true;
}



/***************************************
 * 
 * Internal Use functions
 * 
 * *********************************** */

//Abe 0414/2026 - Item# 1485 
function checkAllowanceConditions(vInspType) {
    var returnArr = new Array();
    var allowInsp100s = false;
    var allowInsp200s = false;
    var allowInsp300s = false;
    var inspLookupTbl = "Inspection Allowance List";

    allowInsp100s = appHasCondition("Building - Allow Inspections through 100 Series", "Applied", null, null);
    allowInsp200s = appHasCondition("Building - Allow Inspections through 200 Series", "Applied", null, null);
    allowInsp300s = appHasCondition("Building - Allow Inspections through 300 Series", "Applied", null, null);

    var validInspArr = new Array();
    var allowInspSchled = false;
    var messageStr = "";


    if (allowInsp100s) {
        validInspArr = lookup(inspLookupTbl, "insp100s").split(",");
        messageStr += "The '" + vInspType + "' cannot be scheduled on this permit because 'Building - Allow Inspections through 100 Series - Foundation Only' has not been cleared.<br><br>";
    }
    else if (allowInsp200s) {
        validInspArr = lookup(inspLookupTbl, "insp200s").split(",");
        messageStr += "The '" + vInspType + "' cannot be scheduled on this permit because 'Building - Allow Inspections through 200 Series - Deferred Submittal Required' has not been cleared.<br><br>";
    }
    else if (allowInsp300s) {
        validInspArr = lookup(inspLookupTbl, "insp300s").split(",");
        messageStr += "The '" + vInspType + "' cannot be scheduled on this permit because 'Building - Allow Inspections through 300 Series - Deferred Submittal Required (300)' has not been cleared.<br><br>";
    }
    else {
        validInspArr.length = 0;
        allowInspSchled = true;
    }


    var thisInspType = vInspType.substring(0, 3);
    if (allowInsp100s||allowInsp200s||allowInsp300s)
        for (i in validInspArr)
            if (thisInspType == validInspArr[i]){
                allowInspSchled = true;
                break;
            }
                

    returnArr[0] = messageStr;
    returnArr[1] = !(allowInspSchled);

    return (returnArr);
}
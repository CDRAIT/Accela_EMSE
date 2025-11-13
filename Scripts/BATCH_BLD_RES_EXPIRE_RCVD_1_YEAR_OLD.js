/*
Batch Job: Auto expires "Received" BLD RES Records
Description: Finds all BLD RES records with Application Status = "RECEIVED" 
            and update their status to "EXPIRED" if "Filedate" greater than a year
Author: Abe
Date: 2025-11-13
*/

try {
    aa.print("===== STARTING BATCH JOB =====");
    //Configuration
    var showDebug = true;
    var sysDate = aa.date.getCurrentDate();
    var batchJobID = aa.batchJob.getJobID().getOutput();
    var batchJobName = "" + aa.env.getValue("batchJobName");
    var systemUserObj = aa.person.getUser("ADMIN").getOutput();
    var maxSeconds = 10 * 60;                                         // number of seconds allowed for batch processing, usually < 5*60
    var documentOnly = false;                                         // Document Only -- displays hierarchy of std choice steps
    var emailText = "";



    var recordGroup = "Building";     // Top-level record type
    var recordType = "Residential";   // Leave null to include all subtypes
    var recordSubType = "";
    var recordCategory = "";
    var currentStatus = "Received";         // Only update records in this status
    var newStatus = "Expired";           // Desired new status
    var statusComment = "Updated by batch job"; // Optional comment

    //Get all Building/Residential records   
    var capListResult = aa.cap.getByAppType(recordGroup, recordType);
    if (!capListResult.getSuccess()) {
        aa.print("ERROR getting records: " + capListResult.getErrorMessage());
        throw "Failed to get record list.";
    }
    var capList = capListResult.getOutput();
    aa.print("Found " + capList.length + " Building/Residential records in total.");
    var updatedCount = 0;
    //Loop through each record
    for (var i in capList) {
        var cap = capList[i];
        var capId = cap.getCapID();
        var altId = capId.getCustomID();
        // Get the current status
        var capModelResult = aa.cap.getCap(capId);
        if (!capModelResult.getSuccess()) {
            aa.print("Failed to get CAP model for " + altId);
            continue;
        }
        var capModel = capModelResult.getOutput().getCapModel();
        var capFileDate = capModel.getFileDate()
        var appStatus = capModel.getCapStatus();
        // Only update if status matches "Test"
        if (appStatus == currentStatus) {
            if (getDateDiff(capFileDate)>365) {
                var updateResult = updateAppStatus(newStatus, statusComment, capId);
                if (updateResult.getSuccess()) {
                    aa.print(" Updated " + altId + " | " + currentStatus + " TO " + newStatus);
                    updatedCount++;
                } else {
                    aa.print(" Failed to update " + altId + ": " + updateResult.getErrorMessage());
                }

            }
        }
    }
    aa.print("===== BATCH JOB COMPLETE =====");
    aa.print("Total records updated: " + updatedCount);
} catch (err) {
    aa.print("ERROR: " + err);
}



function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
        aa.print("DEBUG : " + edesc);
        emailText += "DEBUG : " + edesc + " ";
    }
}

function updateAppStatus(stat, cmt, capId) { // optional cap id
    var itemCap = capId;
    if (arguments.length == 3)
        itemCap = arguments[2]; // use cap ID specified in args

    var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
    if (updateStatusResult.getSuccess())
        logDebug("Updated application status to " + stat + " successfully.");
    else
        logDebug("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is " + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}


function getDateDiff(date1) {

    //var date1 = new Date(DatetoComp);

    var sysDate = aa.date.getCurrentDate();

    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");

    //aa.print("sysDateMMDDYYYY:" + sysDateMMDDYYYY + "--DatetoComp:" + DatetoComp);



    var date2 = new Date(sysDateMMDDYYYY);

    var diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));

    //aa.print("diffDays:" + diffDays);

    return diffDays;

}

function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0" + pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
		day = "0" + pDay.toString();

	if (pFormat == "YYYY-MM-DD")
		ret = pYear.toString() + "-" + mth + "-" + day;
	else
		ret = "" + mth + "/" + day + "/" + pYear.toString();

	return ret;
} 
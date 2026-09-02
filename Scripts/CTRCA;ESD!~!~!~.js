/*=============================================================================================
| Program : CTRCA:ESD/~/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/11/2022 created production version 
| Update  : EAFTAHI 08/31/2023 create staff notification for online Submission (GP and others)
|         : TDunn 04/16/2026 removed Improvement Plan from addition of Tech fee
|         : TDunn 05/19/2026 added Improvement Plan Type as part of exclution rule Imp Plan records   
|
/=============================================================================================*/
logDebug("Running CTRCA:ESD");

var varAutoInvoiceFees = "N"

var notificationTemplate = "STAFF_NEW_ONLINE_PERMIT_SUBMITTED_ESD";
params = aa.util.newHashtable();

// "$$altID$$", "$$capName$$", "$$recordTypeAlias$$", "$$capStatus$$", "$$fileDate$$", "$$balanceDue$$", "$$workDesc$$
getRecordParams4Notification(params);

//add APO (Complaint Location) to the Params - "$$addressLine$$", "$$parcelNumber$$", "$$ownerFullName$$" ,"$$ownerPhone$$" 
getAPOParams4Notification(params);

var emailSendFrom = "";
var toEmailStaff = "";
var emailStaffCC = "";
var sendEmail = false;
var report = null;

if (publicUser) {
    if (matches(appTypeArray[1], "Grading Permit")) {
        addFee("DPEXEMPVER", "ESD", "FINAL", 1, "N");
        addFee("DPGP", "ESD", "FINAL", 1, "N");

        // GP online applications notification
        if (matches(getAppSpecific("Project Office"), "Auburn")) {
            toEmailStaff = "jpeacock@placer.ca.gov";
            emailStaffCC = "mwilson@placer.ca.gov";
            sendEmail = true;
        }else {
            toEmailStaff = "eng_surv@placer.ca.gov";
            emailStaffCC = "EStanifo@placer.ca.gov; FStamm@placer.ca.gov; mgrammenos@placer.ca.gov";
            sendEmail = true;
        }
    }

    if (matches(appTypeArray[1], "Record of Survey")) {
        addFee("DPROS", "ESD", "FINAL", 1, "N");

        // ROS online applications notification
        toEmailStaff = "eng_surv@placer.ca.gov";
        emailStaffCC = "wday@placer.ca.gov; cgutierrez@placer.ca.gov";
        sendEmail = true;
    }


    if(sendEmail){
        sendNotification(emailSendFrom, toEmailStaff, emailStaffCC, notificationTemplate, params, report);
    }

    
    /**
	 * Abe 09/02/2026: Replacing existing TECH FEE Logic with a new one
	 * 
    // Adding new TECH fee
    if (matches(appTypeArray[1], "Final Subdivision", "Grading Permit", "Improvement Plan Revision", "Parcel Map", "Record of Survey")) {
        updateFee("TECH", "ACCOUNTING", "FINAL", 1, varAutoInvoiceFees);
    }    
	if(appTypeArray[1] == "Improvement Plan" && matches(AInfo["Improvement Plan Type"],"Utility","BFAT")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
    */

    
    // Abe 09/02/2026: New TECH FEE Logic
	//Adding TECH fee to all ESD's, un-invoiced

    if (matches(appTypeArray[1], "Final Subdivision Map", "Grading Permit", "Improvement Plan Revision", "Improvement Plan", "Parcel Map", "Record of Survey", "Misc Fee" )) {
		varAutoInvoiceFees = 'N';
		updateFee("TECH V2", "ACCOUNTING", "FINAL", 1, varAutoInvoiceFees);
	}



    aa.sendMail(fromDefault, "eaftahi@placer.ca.gov", "", "NONPROD1 ESD CTRCA - TECH V2", debug);
}
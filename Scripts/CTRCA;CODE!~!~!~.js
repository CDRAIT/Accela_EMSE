/*=============================================================================================
| Program : CTRCA;Code!~!~!~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all Code/Enforcement records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 08/16/2023 Created 3.0 version
| Update  : Abe 08/16/2023 Added Staff Notification - Enforcement
|         : Abe 08/22/2024 Added Staff Notification for Vehicle Abatement - IT Request# 2024
|         : 
|         
/=============================================================================================*/
if (publicUser) {
    logDebug("Entring the EMSE CTRCA:Code/*/*/* ....");

    editAppSpecific("Application Received", "Online");

    //var notificationTemplate = "NEW_ONLINE_CODE_CASE_ACK_LETTER";  /* this is for sending ack to complainant */

    var notificationTemplate = "STAFF_NEW_ONLINE_CASE_SUBMITTED_CODE"; /* This is for Staff notice */
    var complainantName = "";
    var complainantEmail = "";
    var complainantPhone = "";

    var emailParams = aa.util.newHashtable();
    var emailSendFrom = "";
    var toEmailStaff = "";
    var emailStaffCC = "";


    toEmailStaff = (getAppSpecific("Project Office") == "Tahoe") ? "codeCompTahoe@placer.ca.gov" : "codeComp@placer.ca.gov";

    if (appTypeArray[1] == "Enforcement") {
        complainantName = getAppSpecific("Complaintant");
        complainantEmail = getAppSpecific("Complaintant Email");
        complainantPhone = getAppSpecific("Complaintant Phone");
    }

    if (appTypeArray[1] == "Vehicle Abatement") {
        complainantName = getAppSpecific("Complainant Name");
        complainantEmail = getAppSpecific("Complainant Email");
        if (getAppSpecific("Complainant Phone"))
            complainantPhone = getAppSpecific("Complainant Phone");
        else
            complainantPhone = getAppSpecific("Complainant Work Phone");

        //Copying ASITable to ASI Fields 
        var vIndex = 1;
        if (typeof (VEHICLEDESCRIPTION) == "object") {
            for (thisRow in VEHICLEDESCRIPTION) {
                var tableRow = VEHICLEDESCRIPTION[thisRow];
                //var varViolationCode = tableRow["vehYear"];
                editAppSpecific("VYear_" + vIndex.toString(), tableRow["VehYear"]);
                editAppSpecific("VMake_" + vIndex.toString(), tableRow["VehMake"]);
                editAppSpecific("VModel_" + vIndex.toString(), tableRow["VehModel"]);
                editAppSpecific("VColor_" + vIndex.toString(), tableRow["VehColor"]);
                editAppSpecific("VPlate_" + vIndex.toString(), tableRow["VehPlate"]);
                editAppSpecific("VIN_" + vIndex.toString(), tableRow["VehVIN"]);
                editAppSpecific("VMiscInfo_" + vIndex.toString(), tableRow["MiscInfo"]);
                vIndex += 1;

            }
            editAppSpecific("Number of Vehicles", (vIndex - 1));
        }
   }


    if (complainantName)
        addParameter(emailParams, "$$complainantName$$", complainantName);
    else
        addParameter(emailParams, "$$complainantName$$", "Anonymous");
    if (complainantEmail)
        addParameter(emailParams, "$$complainantEmail$$", complainantEmail);
    else
        addParameter(emailParams, "$$complainantEmail$$", "N/A");
    if (complainantPhone)
        addParameter(emailParams, "$$complainantPhone$$", complainantPhone);
    else
        addParameter(emailParams, "$$complainantPhone$$", "N/A");

    // "$$altID$$", "$$capName$$", "$$recordTypeAlias$$", "$$capStatus$$", "$$fileDate$$", "$$balanceDue$$", "$$workDesc$$
    getRecordParams4Notification(emailParams);

    //"$$addressLine$$", "$$parcelNumber$$", "$$ownerFullName$$" ,"$$ownerPhone$$" 
    getAPOParams4Notification(emailParams);
    sendNotification(emailSendFrom, toEmailStaff, emailStaffCC, notificationTemplate, emailParams, null);
    //sendResult = aa.sendMail("noreply@placer.ca.gov","eaftahi@placer.ca.gov", "", "C_VA CTRCA Debug ", debug);
}




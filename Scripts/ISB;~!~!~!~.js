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
|         : TDunn 01/11/2026 Restored cancel for when status is Issued - Revision Pending based on inspection type  
|         : TDunn 01/11/2026 added cancel for scheduling attempt on Revisions and Deferred Submittals. 
|         : TDunn 03/29/2026 added additional 'final' inspection to block lookup list
|         : TDunn 03/20/2026 fixed issue with incorrect cancel
|     
/------------------------------------------------------------------------------------------------------------------*/

/*
if(matches(currentUserID,"JMCKENZI", "EAFTAHI","TDUNN"))
{
	showDebug = 1;
}
// Initialize  cancel to false to counter bug
cancel = false;	
logDebug("cancel initialized to " + cancel);
var	appTypeString = "";
var	appTypeArray = new Array();
if(capId != null){
	capIDString = capId.getCustomID();
	cap = aa.cap.getCap(capId).getOutput();
	appTypeResult = cap.getCapType();
	appTypeAlias = appTypeResult.getAlias();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");
}
logDebug("Record Type: " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
if(vEventName == "InspectionMultipleScheduleBefore") {
	logDebug(inspSchedDate); 
	varUseInspInspector = true; 
	varSchedTime = "00:00AM";
}
if(vEventName == "InspectionScheduleBefore") {
	inspSchedDate = InspectionDate; 
	varSchedTime = "00:00AM";
	varUseInspInspector = false;

	if(!matches(getLastScheduledInspector(inspType),"",null,undefined,"BUILDING")) {
		logDebug(getLastScheduledInspector(inspType));
		inspInspector = getLastScheduledInspector(inspType);
		varUseInspInspector = true;
	}
}
if(varUseInspInspector) {
	var senderEmailAddr = defaultFrom;
	var emailAddrAdmin = "tdunn@truepointsolutions.com";
	var ccEmailAddrAdmin = "";
	var emailText = inspType + "; " + inspInspector + "; scheduled = " + checkInspectionResult(inspType,"Scheduled");
	var lastInspector = getLastScheduledInspector(inspType);
	var emailParameters = aa.util.newHashtable();
	var inspResult = "Rescheduled";

	logDebug("Inspection type is " + inspType);
	logDebug(checkInspectionResult(inspType,"Scheduled"));
	logDebug("Prior assigned to " + lastInspector);
	logDebug("assigned to: " + inspInspector);
	// Try generating the notice from here when checkInspectionResult is true, the inspection already exists and is scheduled.
	if(lastInspector != "BLDG" && checkInspectionResult(inspType,"Scheduled")) {
		logDebug("Sending email");
		// aa.sendMail(senderEmailAddr, emailAddrAdmin, ccEmailAddrAdmin, "ISB Test Results", emailText);
		var staffEmail = "";
		var assignedStaff = getLastScheduledInspector(inspType);
		logDebug("Assigned to = " + assignedStaff);
		if(assignedStaff == null) {
			assignedStaff = getInspector(inspType);
			logDebug("Assigned to = " + assignedStaff);
		}
		if(!matches(assignedStaff,"BLDG",null,"",undefined)) {
			staffResult = aa.person.getUser(assignedStaff);
			if (!staffResult.getSuccess())
				{ logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
			if (staffResult.getSuccess()) {
				staffObject = staffResult.getOutput();
				staffEmail = staffObject.getEmail();
				var staffFirst = staffObject.getFirstName(); 
				var staffLast = staffObject.getLastName(); 
				logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
				var staffName = staffFirst + " " + staffLast;
			}

			if(!matches(staffEmail,undefined,"",null)) {
				vToEmail = staffEmail;
				vFromEmail = "";
				vCcEmail = "";
				vTemplateName = "IRSA_CANCEL_RESCHEDULE_NOTICE_TO_INSPECTOR";
				addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
				addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
				addParameter(emailParameters,"$$staffNameParam$$",staffName);
				addParameter(emailParameters,"$$inspTypeParam$$",inspType);
				addParameter(emailParameters,"$$inspResultParam$$",inspResult);
				addParameter(emailParameters,"$$inspSchedDateParam$$",inspSchedDate);
				addParameter(emailParameters,"$$altID$$",capIDString);
				
				emailResult = sendNotification(vFromEmail,vToEmail, vCcEmail, vTemplateName, emailParameters, null);
				logDebug("Email sent is " + emailResult);
			}
			
		}
	}
}


//Abe- 06/25/2024 - IT Request # 1485 - New Building Inspection Flags/Conditions
//logDebug("vEventName = " + vEventName);

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

if(allowInsp100s)
    {
        validInspArr = lookup(inspLookupTbl, "insp100s").split(",");
        messageStr = "The '"+ inspType + "' cannot be scheduled on this permit because 'Building - Allow Inspections through 100 Series - Foundation Only' has not been cleared."        
    }
else if(allowInsp200s)
    {
        validInspArr = lookup(inspLookupTbl, "insp200s").split(",");
        messageStr = "The '"+ inspType + "' cannot be scheduled on this permit because 'Building - Allow Inspections through 200 Series - Deferred Submittal Required' has not been cleared.";        
    }
else if(allowInsp300s)
    {
        validInspArr = lookup(inspLookupTbl, "insp300s").split(",");
        messageStr = "The '" + inspType + "' cannot be scheduled on this permit because 'Building - Allow Inspections through 300 Series - Deferred Submittal Required (300)' has not been cleared.";
    }
else
    {
        validInspArr.length = 0;
        allowInspSchled = true;
    }

//logDebug("***validInspArr: " + validInspArr);
//logDebug("***validInspArr Length: " + validInspArr.length);
//logDebug("***Inspction Code: " + inspType.substring(0,3));
//logDebug("***Inspection Type: " + inspType);

thisInspType = inspType.substring(0,3);
if (validInspArr.length > 0)
    for (i in validInspArr)
        if (validInspArr[i] == thisInspType)
            allowInspSchled = true;

if(!allowInspSchled){
    showMessage = true;
    customComment(messageStr);
    cancel = true;    
}
//End of IT Request # 1485 


if(allowInsp100s || allowInsp200s || allowInsp300s){
	logDebug("allowInsp100s = " + allowInsp100s);
	logDebug("allowInsp200s = " + allowInsp200s);
	logDebug("allowInsp300s = " + allowInsp300s);
	//aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", ccEmailAddrAdmin, "ISB Debug Results", debug);
}

// List of inspection to block:  914 TRPA Final, Final Inspection to Close Permit, 601 Final-Building.  May want to include 602 Final-Electrical, 603 Final-Plumbing, 604 Final-Mechanical
if(matches(capStatus,"Issued - Revision Pending"))
{
	logDebug("cancel state after if statement for Rev pending status: " + cancel);
	var blockFinalArray = new Array();
	var commentStr = "";
	var lkUpValue = "blockFinalFull";
	blockFinalArray = lookup("InspectionBlockListOnRevision",lkUpValue).split(",");
	logDebug("final array: " + blockFinalArray);
	if(exists(inspType,blockFinalArray))
	{
		commentStr = "The " + inspType + " inspection cannot be scheduled when the Building Permt status is " + capStatus;
		showMessage = true;
		customComment(commentStr);
		cancel = true;
	}
	logDebug("cancel status after testing for block inspections: " + cancel);
}
// Prohibit scheduling inspections on Revisons and Deferred Submittals
if(matches(appTypeArray[1],"Revision","Deferred Submittal"))
{
	messageStr = "Scheduling an inspection  on a " + appTypeArray[1] + " is not allowed. Please schedule all inspections on the parent permit."
	showMessage = true;
	customComment(messageStr);
	cancel = true;
}

*/


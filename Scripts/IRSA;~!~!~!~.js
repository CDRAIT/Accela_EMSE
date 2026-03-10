/*----------------------------------------------------------------------------------------------------------------/
| Program : IRSA:~/~/~/~  (actually *s not tilde)
| Event   : InspectionResultSubmitAfter
|
| Client  : Placerco, CA
| Usage   : Inspection Result Submit After for all  records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 02/08/2023 Created script 
|         : TDunn 02/14/2023 updated script to call new notification functions
|         : TDunn 02/15/2023 integrated EMSE 2.0 IRMA scripts into IRSA EMSE 3.0 script
|         : TDunn 02/26/2023 converted utility release branches to functions
|         : TDunn 04/14/2023 updated script and converted functions
|         : TDunn 05/02/2023 added initializing appTypeArray, capIDString and capStatus
|         : TDunn 08/11/2023 updated utility notification functions with additional error trapping for bad parcel utility data
|         : TDunn 08/28/2023 added additionial logic for new error message emails for bad parcel utility data
|         : TDunn 11/16/2023 added code to ensure parcel attributes are instantiated for use by the utility release script block
|         : TDunn 09/27/2024 added TRPA flag for Expiration date updates.
|         : TDunn 12/06/2024 updated generateReport function calls to use new name 'generateReportPCO'
|         : TDunn 03/31/2025 added closeTask on inspection final for workflow process BLD_20230501_MAIN
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/29/2025 added two service request by Abe
|         : TDunn 08/29/2025 deployed to Github
|         : Abe   01/13/2026 Added TRPARelease to the Buildings with isTRPA= True (IT Req# 2981)
|         : Abe   03/10/2026 Added AInfo['ParcelAttribute.ELECTRIC UTILITY'] check to the 515 ESS inspection result controls (IT Req# 3221)
| 
/-----------------------------------------------------------------------------------------------------------------*/
if (matches(currentUserID,"JMCKENZI","TDUNN","EAFTAHI")) 
{
	showDebug = 1;
}
	
// Initialize appTypeArray for conditional branching
var	appTypeString = "";
var	appTypeArray = new Array();
var capIDString = "";
if(capId != null){
	capIDString = capId.getCustomID();
	cap = aa.cap.getCap(capId).getOutput();
	appTypeResult = cap.getCapType();
	appTypeAlias = appTypeResult.getAlias();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");
	capStatus = cap.getCapStatus();
}

loadParcelAttributes(AInfo);
logGlobals(AInfo);
var trpaFlag = "NA";
var isTRPA = false;

if(!matches(AInfo["ParcelAttribute.TRPA"],null,undefined,false)) { trpaFlag = AInfo["ParcelAttribute.TRPA"]; }	
if(trpaFlag.indexOf("Tahoe Regional") > -1)
{
	isTRPA = true;
}	

// Controls for InspectionResultModifyAfter event
if(matches(vEventName,"InspectionResultModifyAfter"))
{
	// Controls for Building
	if(appTypeArray[0] == "Building")
	{		
		if (lookup("Group Inspection Lookup",inspType) != null) 
		{
			varInspList = lookup("Group Inspection Lookup",inspType);
			varInspType = new Array();
			varInspType = varInspList.split(",");
		}

		if (getInspector(inspType) != null) 
		{
			groupInspName = getInspector(inspType);
			comment("Inspection Type = " + inspType + ". Inspector ID = " + getInspector(inspType));
		}

		if (lookup("Group Inspection Lookup",inspType) != null) 
		{
			for(thisCode in varInspType) resultInspection(varInspType[thisCode],inspResult,dateAdd(null,0),"Group Resulted");
		}

		if ((inspType == "518 Gas Service") && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
		{
			sendGasUtilRelease();
		}

		if (((inspType == "513 Solar Panel-Final" && AInfo['ParcelAttribute.ELECTRIC UTILITY'] == "SMUD") || (inspType == "501 Temp Power Pole" || inspType == "502 Perm Power Pole" ||  inspType == "503 Electrical Service" ||  inspType == "504 AG Electrical Service" ||  inspType == "507 Electrical Service Change")) && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
		{
			sendElecUtilRelease();
		}

		//Start: IT Req# 3221
		if (inspType == "515 ESS" && matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'], "SMUD", "PGE") && ( inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass"))
		{
			sendElecUtilRelease();
		}
		//End of IT Req# 3221
		
		//IT Req# 2981
		if (isTRPA) {
			if (inspType == "914 TRPA Final" && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass"))
				if (feeExists('TTSECURITY')) {
					logDebug(feeExists('TTSECURITY'));
					sendTRPARelease();
				}
		}
		//End of IT req# 2981

		if (inspResult != "") 
		{
			emailInspectionResultParameters()
		}
	}
	if(appTypeArray[0] == "TRPA")
	{
		if(appTypeArray[1] == "Building")
		{
			if (lookup("Group Inspection Lookup",inspType) != null) 
			{
				varInspList = lookup("Group Inspection Lookup",inspType);
				varInspType = new Array();
				varInspType = varInspList.split(",");
			}

			if (getInspector(inspType) != null)
			{
				groupInspName = getInspector(inspType);
				comment("Inspection Type = " + inspType + ". Inspector ID = " + getInspector(inspType));
			}

			if (lookup("Group Inspection Lookup",inspType) != null) 
			{
				for(thisCode in varInspType) resultInspection(varInspType[thisCode],inspResult,dateAdd(null,0),"Group Resulted");
			}

			if ((inspType == "518 Gas Service") && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
			{
				sendGasUtilRelease();
			}

			if (((inspType == "513 Solar Panel-Final" && AInfo['ParcelAttribute.ELECTRIC UTILITY'] == "SMUD") || (inspType == "501 Temp Power Pole" || inspType == "502 Perm Power Pole" ||  inspType == "503 Electrical Service" ||  inspType == "504 AG Electrical Service" ||  inspType == "507 Electrical Service Change")) && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
			{
				sendElecUtilRelease();
			}
			//Start: IT Req# 2504
			if ((inspType == "515 ESS") && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) {
				sendElecUtilRelease();
			}
			//End: IT Req# 2504


			if (inspType == "914 TRPA Final" && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass") && (appMatch("TRPA/Building/Multi-Family/Project") || appMatch("TRPA/Building/Multi-Family/TRPA Review at TRPA") || appMatch("TRPA/Building/Residential/Project") || appMatch("TRPA/Building/Residential/TRPA Review at TRPA") || appMatch("TRPA/Building/TRPA MOU Project/*"))) {
				sendTRPARelease();
			}
			if (inspResult != "") {
				emailInspectionResultParameters();
			}
		}
	}
	
}

// Controls for InspectionResultSubmitAfter event
if(matches(vEventName,"InspectionResultSubmitAfter","V360InspectionResultSubmitAfter"))
{
	// Set appTypeString array for proper control by module and record type.
	if(capId != null)
	{
		capIDString = capId.getCustomID();
		logDebug(capIDString);
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		logDebug(appTypeResult);
		appTypeAlias = appTypeResult.getAlias();
		logDebug(appTypeAlias);
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		capStatus = cap.getCapStatus();
		logDebug("Record Type: " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
	}
	// Controls for IRSA:Building
	if(appTypeArray[0] == "Building")
	{
		logDebug("Running Inspection result rules for Building");
		if (inspResult == "Final Pass") {
			closeTask("Inspections","Construction Complete","Building Granted a Final Pass"," ","BLD_20181201_MAIN");
			closeTask("Inspections","Construction Complete","Building Granted a Final Pass"," ","BLD_20230501_MAIN");
			//aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", "", "IRSA:TRACT Homes - IT Request # 2083 ", debug);
			//Abe 04/08/2025: IT Req# 2340
			if (appTypeArray[3] == "Solar App")
				closeTask("Inspection", "Construction Complete", "Permit Granted a Final Pass", " ", "B_SOLARAPP");

		}

		if (matches(inspResult,"Not Ready - Fee Charged","Phased pass fee charged","Phased fail fee charged")) {
			addFee("0910","B_RES","FINAL",1,"Y");
			aa.finance.reCalculateFees();
		}

		if (lookup("Group Inspection Lookup",inspType) != null) {
			varInspList = lookup("Group Inspection Lookup",inspType);
			varInspType = new Array();
			varInspType = varInspList.split(",");
		}

		if (getInspector(inspType) != null) {
			groupInspName = getInspector(inspType);
			comment("Inspection Type = " + inspType + ". Inspector ID = " + getInspector(inspType));
		}

		if (lookup("Group Inspection Lookup",inspType) != null) {
			for(thisCode in varInspType) resultInspection(varInspType[thisCode],inspResult,dateAdd(null,0),"Group Resulted");
		}

		pCapId = capId;
		isChild = false;
		if (childGetByCapType("Facilities/Sewer/Permit/NA") && inspType == "527 Sewer-Final" && matches(inspResult,"Pass","Final Pass")) {
			cCapId = childGetByCapType("Facilities/Sewer/Permit/NA");
			isChild = true;
		}

		if (isChild) {
			capId = cCapId;
			closeTask("Inspection","Inspection Complete","527 Sewer-Final was Passed"," ");
			capId = pCapId;
		}

		if ((inspType == "518 Gas Service") && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) {
			sendGasUtilRelease();
		}

		if (((inspType == "513 Solar Panel-Final" && AInfo['ParcelAttribute.ELECTRIC UTILITY'] == "SMUD") || (inspType == "501 Temp Power Pole" || inspType == "502 Perm Power Pole" ||  inspType == "503 Electrical Service" ||  inspType == "504 AG Electrical Service" ||  inspType == "507 Electrical Service Change")) && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
		{
			sendElecUtilRelease();
		}
		//Start: IT Req# 3221
		if (inspType == "515 ESS" && matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'], "SMUD", "PGE") && ( inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass"))
		{
			sendElecUtilRelease();
		}
		//End of IT Req# 3221
		
		//IT Req# 2981
		if (isTRPA) {
			if (inspType == "914 TRPA Final" && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass"))
				if (feeExists('TTSECURITY')) {
					logDebug(feeExists('TTSECURITY'));
					sendTRPARelease();
				}
		}
		//End of IT req# 2981
		
		if(isTRPA)
		{
			if(inspType == "911 TRPA Pre-Grade" && (inspResult == "Pass" || inspResult == "Final Pass"))
			{
				editAppSpecific("TRPA Permit Expiration",dateAdd(null,730));
			}
		}
	}
	// Controls for IRSA TRPA/Building
	if(appTypeArray[0] == "TRPA")
	{
		if(appTypeArray[1] == "Building")
		{
			//Converted from IRSA:TRPA/Building - Tdunn, 02/15/2023
			if (inspResult == "Final Pass") 
			{
				closeTask("Inspections","Construction Complete","Building Granted a Final Pass"," ","BLD_20181201_MAIN");
			}

			if (matches(inspResult,"Not Ready - Fee Charged")) 
			{
				addFee("0910","B_RES","FINAL",1,"Y");
				aa.finance.reCalculateFees();
			}

			if (matches(inspResult,"Phased pass fee charged")) 
			{
				addFee("0910","B_RES","FINAL",1,"Y");
				aa.finance.reCalculateFees();
			}

			if (matches(inspResult,"Phased fail fee charged")) 
			{
				addFee("0910","B_RES","FINAL",1,"Y");
				aa.finance.reCalculateFees();
			}

			/* Next section test if inspection is a Group inspection.  If true results all inspection in group same as Group insp */
			if (lookup("Group Inspection Lookup",inspType) != null) 
			{
				varInspList = lookup("Group Inspection Lookup",inspType);
				varInspType = new Array();
				varInspType = varInspList.split(",");
			}

			if (getInspector(inspType) != null) 
			{
				groupInspName = getInspector(inspType);
				comment("Inspection Type = " + inspType + ". Inspector ID = " + getInspector(inspType));
			}

			if (lookup("Group Inspection Lookup",inspType) != null) 
			{
				for(thisCode in varInspType) resultInspection(varInspType[thisCode],inspResult,dateAdd(null,0),"Group Resulted");
			}

			if (inspType == "914 TRPA Final" && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass") && (appMatch("TRPA/Building/Multi-Family/Project") || appMatch("TRPA/Building/Multi-Family/TRPA Review at TRPA") || appMatch("TRPA/Building/Residential/Project") || appMatch("TRPA/Building/Residential/TRPA Review at TRPA") || appMatch("TRPA/Building/TRPA MOU Project/*"))) 
			{
				sendTRPARelease();
			}

			if ((inspType == "518 Gas Service") && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
			{
				sendGasUtilRelease();
			}

			if (((inspType == "513 Solar Panel-Final" && AInfo['ParcelAttribute.ELECTRIC UTILITY'] == "SMUD") || (inspType == "501 Temp Power Pole" || inspType == "502 Perm Power Pole" ||  inspType == "503 Electrical Service" ||  inspType == "504 AG Electrical Service" ||  inspType == "507 Electrical Service Change")) && (inspResult == "FINALPASS" || inspResult == "Final Pass" || inspResult == "PASS" || inspResult == "Pass")) 
			{
				sendElecUtilRelease();
			}

			if (inspResult != "") 
			{
				emailInspectionResultParameters();
			}
		}
	}
}
		
/*----------------------------------------------/
| Custom functions required by IRSA script
/-----------------------------------------------*/
function sendElecUtilRelease()
{
	//converted from ES_SEND_ELEC_UTIL_RELEASE - 02/15/2023 Tdunn, TPS
	var params = aa.util.newHashtable();
	var reportParams = aa.util.newHashMap();
	var emailSendFrom = defaultFrom;
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailResult = false;
	var xMessage = "";
	var ccTo = "BLDOutsource@placer.ca.gov";
	addParameter(reportParams,"inspId",inspId);
	report = generateReportPCO("Utility Release",reportParams,"Building");
	getRecordParams4Notification(params);
	getInspectionParams4Notification(params);
	addParameter(params, "$$ScopeOfWork$$", getAppSpecific("Scope of Work"));
	var vProvider = AInfo["ParcelAttribute.ELECTRIC UTILITY"];
	if(vProvider != null)
		vProvider = vProvider.trim();	
	var vTemplate = lookup("lkupUtilReleaseElec",vProvider);
	logDebug("strcontrol = " + vTemplate);
	if(matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'],null,undefined,""))
	{
		xMessage = "Attention needed - you are attempting to pass an inspection where utility provider(s) are missing. Utility release not sent due to no provider listed.  Utility provider(s) information will need to be added to the parcel before re-resulting the inspection.";
	}
	if(!matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'],null,undefined,"") && matches(vTemplate,"",null,undefined))
	{
		logDebug("Inside vTemplate is undefined")
		xMessage = "Attention needed - you are attempting to pass an inspection where there is an error with the utility provider(s). Utility release not sent due to data error with utility provider.  Utility provider(s) information on the parcel will need to be corrected before re-resulting the inspection.";
		ccTo = "cdrait@placer.ca.gov";
	}
	addParameter(params,"$$errorContent$$",xMessage);
	addParameter(params,"$$copyTo$$",ccTo);
	
	if(!matches(vProvider,"",null,undefined) && !matches(vTemplate,"",null,undefined))
	{
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,new Array(report));
	}

	if (matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'],null,undefined,"","NA") || matches(vTemplate,"",null,undefined))
	{
		vTemplate = "UTILITY_RELEASE";
		emailStaff = getCurrentUserStaffInfo(params);
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,null);
	}
	logDebug("Release email for " + AInfo['ParcelAttribute.ELECTRIC UTILITY'] + " using template " + vTemplate + ", result = " + emailResult);
	logDebug(xMessage);
	if(xMessage != "")
	{
		showMessage = true;
		comment(xMessage);
	}
	return emailResult;
}


function sendGasUtilRelease()
{
	// Replaces ES_SEND_GAS_UTIL_RELEASE - 02/15/2023, Tdunn, TPS
	/* Updated to use lookup based on parcel attribute 'GAS UTILITY' to return correct email address */
	
	var params = aa.util.newHashtable();
	var reportParams = aa.util.newHashMap();
	var emailSendFrom = defaultFrom;
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailResult = false;
	var xMessage = "";
	var ccTo = "BLDOutsource@placer.ca.gov";
	addParameter(reportParams,"inspId",inspId);
	report = generateReportPCO("Utility Release",reportParams,"Building");
	getRecordParams4Notification(params);
	getInspectionParams4Notification(params);
	addParameter(params, "$$ScopeOfWork$$", getAppSpecific("Scope of Work"));
	var vProvider = AInfo["ParcelAttribute.GAS UTILITY"];
	if(vProvider != null)
		vProvider = vProvider.trim();	
	var vTemplate = lookup("lkupUtilReleaseGas",vProvider);
	logDebug("strcontrol = " + vTemplate);
	if(matches(AInfo['ParcelAttribute.GAS UTILITY'],null,undefined,""))
	{
		xMessage = "Attention needed - you are attempting to pass an inspection where utility provider(s) are missing. Utility release not sent due to no provider listed.  Utility provider(s) information will need to be added to the parcel before re-resulting the inspection.";
	}
	if(!matches(AInfo['ParcelAttribute.GAS UTILITY'],null,undefined,"") && matches(vTemplate,"",null,undefined))
	{
		logDebug("Inside vTemplate undefined");
		xMessage = "Attention needed - you are attempting to pass an inspection where there is an error with the utility provider(s). Utility release not sent due to data error with utility provider.  Utility provider(s) information on the parcel will need to be corrected before re-resulting the inspection.";
		ccTo = "cdrait@placer.ca.gov";
	}
	addParameter(params,"$$errorContent$$",xMessage);
	addParameter(params,"$$copyTo$$",ccTo);
	
	if(!matches(vProvider,"",null,undefined) && !matches(vTemplate,"",null,undefined))
	{
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,new Array(report));
	}	
	
	if (matches(AInfo['ParcelAttribute.GAS UTILITY'],null,undefined,"","NA") || matches(vTemplate,"",null,undefined))
	{
		vTemplate = "UTILITY_RELEASE";
		emailStaff = getCurrentUserStaffInfo(params);
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,null);
	}
	logDebug("Release email for " + AInfo["ParcelAttribute.GAS UTILITY"] + " using template " + vTemplate + ", result = " + emailResult);
	if(xMessage != "")
	{
		showMessage = true;
		comment(xMessage);
	}
	return emailResult;	
}

function sendTRPARelease()
{
	// Converted from ES_SENDTRPA_RELEASE - Tdunn, 02/15/2023
	var emailResult = false;
	var emailSendFrom = null;
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailParameters = null;
	var reportParams = null;
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashMap();
	addParameter(reportParams,"AltID",capIDString);
	report = generateReportPCO("TRPA Release Letter",reportParams,"TRPA");
	emailSendFrom = defaultFrom;
	cap = aa.cap.getCap(capId).getOutput();
	alias = cap.capModel.getAppTypeAlias();
	logDebug("Alias: " + alias);
	addParameter(emailParameters,"$$INSPECTIONTYPE$$",inspType);
	addParameter(emailParameters,"$$RESULTDATE$$",inspResultDate);
	addParameter(emailParameters,"$$RECORDALIAS$$",alias);
	addParameter(emailParameters,"$$RECORDALTID$$",capIDString);
	addParameter(emailParameters,"$$INVOICEDTOTAL$$",feesInvoicedTotal);
	addParameter(emailParameters,"$$BALANCEDUE$$",balanceDue);
	emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,"TRPA_RELEASE_LETTER_NOTICE",emailParameters,new Array(report));
	logDebug("Email result = " + emailResult);
	return emailResult;

}

function emailInspectionResultParameters()
{
	// Converted from ES_EMAIL_INSPECTION_RESULT_PARAMETERS - Tdunn, 02/15/2023
	var contactTypes = new Array("Inspection Contact");
	var notificationTemplate = "AA_MESSAGE_INSPECTION_STATUS_CHANGE";
	var iCon = null;
	var contactArray = new Array();
	contactArray = getContactArray();
	for (iCon in contactArray) {
		if (exists(contactArray[iCon]["contactType"],contactTypes)) {
			// converted from ES_EMAIL_INSPECTION_RESULT - Tdunn, 02/15/2023
			params = aa.util.newHashtable();
			tContact =contactArray[iCon];
			getRecordParams4Notification(params);
			getContactParams4Notification(params,tContact);
			aa.print("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getInspectionParams4Notification(params);
			emailSendFrom = null;
			emailStaff = null;
			emailStaffCC = null;
			report = null;
			emailSendFrom = "";
			emailStaff = tContact["email"];
			emailStaffCC = "";
			if (!matches(tContact["email"],null,"",undefined)) 
			{
				sendNotification(emailSendFrom,emailStaff,emailStaffCC,notificationTemplate,params,report);
			}		
		}
	}
}


function getCurrentUserStaffInfo(emailParameters)
{
	// Get user information for inspector resulting inspection - CurrentUserID
	var assignedStaff = currentUserID; 
	var staffResult = aa.person.getUser(assignedStaff);
	if (!staffResult.getSuccess())
		{
			logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) 
			return false;
		}
	if (staffResult.getSuccess()) 
	{
		staffObject = staffResult.getOutput();
		var staffEmail = staffObject.getEmail();
		var staffFirst = staffObject.getFirstName(); 
		var staffLast = staffObject.getLastName(); 
		logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
	
		var staffName = staffFirst + " " + staffLast;
		if(!matches(staffEmail,undefined,"",null)) 
		{
			addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
			addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
			addParameter(emailParameters,"$$staffNameParam$$",staffName);
			return staffEmail;
		}
	}
}

function lookup(stdChoice,stdValue) 
{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
	   if (bizDomScriptResult.getSuccess())
		   {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;

}

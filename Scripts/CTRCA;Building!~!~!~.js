/*======================================================================================================
| Program : CTRCA:Building/~/~/~
|
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all Building/ records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : MHelvick 05/09/2024 created 3.0 version
|         : TDunn 07/10/2024 added createCapComment to preserve original workdesc
|         : TDunn 09/19/2024 added update to appName to append '(TRPA)' for parcels in TRPA jurisdiction
|         : TDunn 11/14/2024 added auto assignment for Submittal Review
|         : TDunn 11/15/2024 added setting due date for Submittal Review
|         : TDunn 01/30/2025 added try/catch clause for parcel related rules
|         : Abe   02/05/2025 IT Request# 1911 - EV Charging Station
|         : TDunn 03/06/2025 converted and disabled remaining EMSE 2.0 CTRCA:Building/*** script.
|         : TDunn 03/17/2025 updated new online submittal notification
|         : TDunn 03/19/2025 added try/catch clause to instantiate wfProcess code to control notification.
|
/======================================================================================================*/
showDebug = 1
logDebug("Running CTRCA:Building/");

//For 'Revision' or 'Deferred' Type records, if the altId is changing at submittal, then the CTRCA DigEplan code needs to be in CTRCA for the specific record type.
//See CTRCA:BUILDING/RESIDENTIAL/REVISION/NA for example
if(!appMatch("Building/*/*/SolarApp Revision") && !appMatch("Building/Residential/Master/Revision") && !appMatch("Building/Revision/*/*") && !appMatch("Building/Deferred Submittal/*/*")) loadCustomScript("CTRCA:DIGEPLAN");
email("mckenzie@truepointsolutions.com","noreplyTEST@placer.ca.gov","PLACERCO TEST CTRCA " + capIDString,debug);

// Copy original description field into record comment when app is submitted by customer for data integrity
var appWorkDesc = workDescGet(capId);
logDebug("Original work description: " + appWorkDesc);
appWorkDesc = "Work Description at Original submittal on " + dateAdd(null,0) + " : " + appWorkDesc;
createCapComment(appWorkDesc,capId);

try
{
	// update capName if TRPA area parcel.
	var trpaFlag = "NA";
	if(!matches(AInfo["ParcelAttribute.TRPA"],null,undefined,false)) { trpaFlag = AInfo["ParcelAttribute.TRPA"];}
	logDebug("TRPA attribute = " + trpaFlag);

	if(trpaFlag.indexOf("Tahoe Regional") > -1)
	{
		editAppSpecific("TRPA Permit","Y");
		if(capName.indexOf("(TRPA)") < 0)
		{
			var newName = capName + " (TRPA)";
			editAppName(newName,capId);
		}
	}else{
		editAppSpecific("TRPA Permit","N");
	}
} catch(e)
{
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Test: CTRCA:Building try error ", e.message);	
}

// Auto assign and set due date for Submittal Review
assignTask("Submittal Review","CDRA_UNASSIGNED");
editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"));


//IT Request# 1911 - EV Charging Station
//when publicUser fileDate doesnt represent the actual submission date, then deadlines are incorrect. so used current sysDate string
if(publicUser)
	if (matches(appTypeArray[1], "Residential", "Commercial") && appTypeArray[2] == "Limited")
		if (getAppSpecific("Type of Work") == "Alteration" && getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)")        
				if (getAppSpecific("EVCS Units Qty") == "1-25 units")
					editAppSpecific("EVCS Processing Deadline", dateAdd(sysDateMMDDYYYY, 5, " "));
				else if (getAppSpecific("EVCS Units Qty") == "26+ units")
					editAppSpecific("EVCS Processing Deadline", dateAdd(sysDateMMDDYYYY, 10, " "));
				else
					logDebug('***Error***: "EVCS Units Qty" is undefined!');
//End of IT Request# 1911 - EV Charging Station  

// Begin converted EMSE 2.0 CTRCA:Building/*** TDunn 3/6/2025
var varUpdateWorkDesc = false;

if(publicUser)
{
	if (AInfo['Scope of Work ACA'] == "Solar Roof Mount") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "INSTALL LOCATION: " + AInfo['SOLAR - Install Location'] + "\n\n" + 
		"CURRENT MAIN AMPERAGE: " + AInfo['SOLAR - Current Panel Amperage'] + "\n\n" + "PANEL CHANGEOUT: " + AInfo['SOLAR - Panel Changeout'] + "\n\n" 
		+ "PROPOSED AMPERAGE: " + AInfo['SOLAR - Proposed Panel Amperage'] + "\n\n" + "INVERTER TYPE/SIZE: "  + AInfo['SOLAR - Inverter Type Size'] + "\n\n" 
		+ "NUMBER OF PANELS/TYPE: "  + AInfo['SOLAR - Panel Number and Type'] + "\n\n" + "MOUNTING SYSTEM: "  + AInfo['SOLAR - Mounting System'] + "\n\n" 
		+ "SYSTEM OUTPUT (kW): "  + AInfo['SOLAR - System Output']  + "\n\n" + "TRENCHING / GRADING: "  + AInfo['SOLAR - Trenching or Grading'] + " " 
		+ AInfo['SOLAR - Trenching or Grading Desc'];
	}

	if (AInfo['Scope of Work ACA'] == "Electrical") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "CURRENT PANEL AMPERAGE: " + AInfo['ELECTRICAL- Current Panel Amperage'] + "\n\n" 
		+ "PROPOSED PANEL AMPERAGE: " + AInfo['ELECTRICAL - Proposed Panel Amperage'] + "\n\n" + "CHANGE OUT / NEW: " 
		+ AInfo['ELECTRICAL - Change Out or New'] + " - " + AInfo['ELECTRICAL - Work Being Performed'];
	}

	if (AInfo['Scope of Work ACA'] == "Mechanical") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "NEW / REPLACEMENT: " + AInfo['MECHANICAL - New or Replacement'] + "\n\n" 
		+ "# OF SYSTEMS: " + AInfo['MECHANICAL - Number of Systems'] + "\n\n" + "DUCT AFFECTED: " + AInfo['MECHANICAL - Duct Affected'] + "\n\n" 
		+ "SYSTEM TYPE: " + AInfo['MECHANICAL - System Type'];
	}

	if (AInfo['Scope of Work ACA'] == "Plumbing") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "GAS TYPE: " + AInfo['PLUMBING - Gas Type'] + "\n\n" 
		+ "WORK LOCATION: " + AInfo['PLUMBING - Work Location'] + "\n\n" + "TYPE / FEET / SIZE OF PIPE: " + AInfo['PLUMBING - Pipe Type Feet Size'] + "\n\n" 
		+ "EQUIPMENT SERVICED: " + AInfo['PLUMBING - Equipment Serviced'] + "\n\n" + "EQUIPMENT DEMAND: " + AInfo['PLUMBING - Equipment Demand'];
	}

	if (AInfo['Scope of Work ACA'] == "Water Heater") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "HEAT SOURCE: " + AInfo['WATERHEATER - Heat Source'] + "\n\n" 
		+ "REPLACEMENT / ADDITIONAL: " + AInfo['WATERHEATER - Replacement or Additional'] + "\n\n" + "TYPE: " + AInfo['WATERHEATER - Type'] + "\n\n" 
		+ "SIZE (gallons): " + AInfo['WATERHEATER - Size'] + "\n\n" + "UNIT LOCATION: " + AInfo['WATERHEATER - Unit Location'];
	}

	if (AInfo['Scope of Work ACA'] == "Reroof") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "STRUCTURE: " + AInfo['REROOF - Structure Being Reroofed'] + "\n\n" 
		+ "MATERIAL / ASSEMBLY: " + AInfo['REROOF - Material or Assembly'] + "\n\n" + "CURRENT ROOF: " + AInfo['REROOF - Current Roof Covering'] + "\n\n" 
		+ "OVERLAYING EXISTING: " + AInfo['REROOF - Overlay Existing Roof'] + "\n\n" + "# OF EXISTING LAYERS: " + AInfo['REROOF - Number of Existing Layers'];
	}

	if (AInfo['Scope of Work ACA'] == "Window Change Out") 
	{
		varUpdateWorkDesc = true;
		varNewWorkDesc = workDescGet(capId) + "\n\n" + "# WINDOWS BEING REPLACED: " + AInfo['WINDOWCHANGE - Windows Being Replaced'] + "\n\n" 
		+ "FRAME TYPE: " + AInfo['WINDOWCHANGE - Window Frame'] + "\n\n" + "RETROFIT WINDOWS: " + AInfo['WINDOWCHANGE - Retrofit'] + "\n\n" 
		+ "SIZE CHANGES: " + AInfo['WINDOWCHANGE - Size Changes'];
	}

	if (varUpdateWorkDesc) 
	{
		updateWorkDesc(varNewWorkDesc);
	}
	
	editAppSpecific("Application Received","Online");
	editAppSpecific("Primary Plan Check Contact", "Agent");
	
	if (AInfo['ParcelAttribute.COUNTYPROP'] == "COUNTYPROP" || AInfo['ParcelAttribute.COUNTYPROP'] == "County Property") 
	{
		emailParameters = aa.util.newHashtable();
		getRecordParams4Notification(emailParameters);
		sendNotification("noreply@placer.ca.gov","",null, "REAL_ESTATE_SVCS_NOTIFICATION", emailParameters, null);
	}
	
	var wfProcess = "";
	try
	{
		var isWfProcess = getAppProcessCode(capId);
		logDebug("process code is " + isWfProcess);
		if(isWfProcess) 
		{ 
			wfProcess = isWfProcess;
			logDebug("wfProcess = " + wfProcess);
		}
	}
	catch (err) {
		logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
		aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing CTRCA:Building try error ", err.message);
	}		
	if(wfProcess == "BLD_20230501_MAIN")
	{
		var notificationTemplate = "NEW_ONLINE_PERMIT_SUBMITTED";
		var contactTypes = new Array("Applicant","Owner");
		iCon = null;
		var contactArray = new Array();
		contactArray = getContactArray();
		for (iCon in contactArray) 
		{
			if (exists(contactArray[iCon]["contactType"],contactTypes))
			{			
				// converted from branch("ES_EMAIL_NEW_ONLINE_PERMIT")
				params = aa.util.newHashtable();
				tContact =contactArray[iCon];
				getRecordParams4NotificationJM(params);
				getContactParams4Notification(params,tContact);
				aa.print("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
				getPrimaryAddressLineParam4Notification(params);
				emailSendFrom = null;
				emailTo = null;
				emailCC = null;
				report = null;
				emailSendFrom = "";
				emailTo = tContact["email"];
				emailCC = "";
				if (!matches(tContact["email"],null,"",undefined) && !appMatch("Building/Residential/PV Solar/*")) 
				{
					sendNotification(emailSendFrom,emailTo,emailCC,notificationTemplate,params,report);
				}
			}
		}
	}
}
sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com","","Test: PLACERCO CTRCA Builing for wf process is" + wfProcess, debug);

/*====================================
Notes

workDescGet(pCapId);
updateWorkDesc(newParentWorkDesc,pCapId);

=====================================*/

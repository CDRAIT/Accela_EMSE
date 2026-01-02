/*=============================================================================================
| Program : ASA;Building!~!~!~
|
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 04/28/2020 created production version
|         : TDunn 03/28/2024 converted production EMSE 2.0 to EMSE 3.0
|         :                  added edit to TRPA Permit field to 'Y' for Tahoe parcel attribute
|         : TDunn 04/04/2024 added additional validation for updates to record info for TRPA projects
|         : TDunn 04/05/2024 removed 'attempt' to update additional TRPA related information other than 'TRPA Permit' field
|         : eaftahi 05/02/2024 fixed invalid variable from addFee to vAddFee
|         : TDunn 09/19/2024 added update to appName to append '(TRPA)' to TRPA jurisdiction permits
|         : TDunn 11/14/2024 added auto assignment for Submittal Review
|         : TDunn 11/15/2024 added setting due date for Submittal Review
|         : TDunn 01/19/2025 remarked out adding adhoc tasks
| 		  : Abe   02/05/2025 IT Request# 1911 - EV Charging Station
|         : TDunn 02/12/2025 added additional code from EMSE 2.0 ASA:Building and disabled EMSE 2.0 standard choice script
|         : TDunn 03/17/2025 added wfProcess call to test for BLD_20230501_MAIN 
|         : TDunn 03/17/2025 added new submittal notification for staff record creation
|         : TDunn 08/29/2025 added Abe IT request #1911
|         : TDunn 08/29/2025 deployed to non-prod1 via GitHub
|         : Abe   09/03/2025 IT Request #2059 - Auto Create SPMUD Flag
|         : TDunn 10/03/2025 removed wfprocess criteria for staff record creation notification
|         : TDunn 11/05/2025 added dynamic parameter for Project Office email address.
|
/=============================================================================================*/
if(matches(currentUserID,"TDUNN","JMCKENZI","EAFTAHI")) { showDebug = 1;}

logDebug("Running ASA:Building for SP Fees and std condition");

try
{
	var slFlags = "";
	var slFlagCodes = new Array();
	var slFeeSched = "SP_PLACER_VINEYARDS";
	var slFeeList ="";
	var slFeeArray = new Array();
	var feeName = "";
	var thisQty = 1;
	var thisScope = getAppSpecific("Scope of Work");
	var thisADU = ""; 
	var vAddFee = true;
	var projectOffice = null;
	var cdrEmail = "OnlineBLDPermits@placer.ca.gov";
	var slLookupTable = "sdl:Land Use Codes";
	if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
		slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
		
		slFlagCodes = slFlags.split(";");
		// MARIPOSA SEWER REIMBURSEMENT FLAG; PVLDRAAC	
		for(thisFlag in slFlagCodes) {
			luCode = slFlagCodes[thisFlag];
			newCode = luCode.trim();
			logDebug("This flag is " + newCode);
			if(newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
				logDebug("Trying to add condition");
				addStdCondition("Env. Engineering - Notification","Reimbursement Agreements for Sewer");
			}
		}
	}
	


	// additional legacy code from EMSE 2.0 version
	deleteTask(capId, "TRPA Planning Review"); 
	deleteTask(capId, "TRPA Planning Review"); //Repeated intentionally to delete BOTH instances of the task	
	deleteTask(capId, "TRPA ESD Review"); 
	deleteTask(capId, "TRPA ESD Review"); //Repeated intentionally to delete BOTH instances of the task
	
	
	var trpaFlag = "NA";
	if(!matches(AInfo["ParcelAttribute.TRPA"],null,undefined,false)) { trpaFlag = AInfo["ParcelAttribute.TRPA"];}
	logDebug("TRPA attribute = " + trpaFlag);
	updateRefParcelToCap();

	
	if (!publicUser) 
	{
		loadCustomScript("CSLB_LP_IMPORT_SOAP");
		
		// Update geocode ASI fields from parcel attributes
		if (AInfo['ParcelAttribute.FLOODPLAIN'] != null) 
		{
			editAppSpecific("100 Year Flood Plain",AInfo['ParcelAttribute.FLOODPLAIN']);
		} else {
			editAppSpecific("100 Year Flood Plain","No");
		}

		if (AInfo['ParcelAttribute.OVERFLIGHT'] != null) 
		{
			editAppSpecific("Airport Overflight Zone District",AInfo['ParcelAttribute.OVERFLIGHT']);
		} else {
			editAppSpecific("Airport Overflight Zone District","No");
		}

		if (AInfo['ParcelAttribute.TRPA'] != null) 
		{
			editAppSpecific("TRPA",AInfo['ParcelAttribute.TRPA']);
		} else {
			editAppSpecific("TRPA","No");
		}

		if (AInfo['ParcelAttribute.TAHOEBEACHES'] != null) 
		{
			editAppSpecific("Tahoe Beach Property",AInfo['ParcelAttribute.TAHOEBEACHES']);
		} else {
			editAppSpecific("Tahoe Beach Property","No");
		}

		if (AInfo['ParcelAttribute.JURISDICTION'] != null) 
		{
			editAppSpecific("City Jurisdiction",AInfo['ParcelAttribute.JURISDICTION']);
		} else {
			editAppSpecific("City Jurisdiction","NA");
		}

		if (AInfo['ParcelAttribute.BLUEOAKS'] != null) 
		{
			editAppSpecific("Blue Oaks Ranch Consv Easement",AInfo['ParcelAttribute.BLUEOAKS']);
		} else {
			editAppSpecific("Blue Oaks Ranch Consv Easement","No");
		}

		if (AInfo['ParcelAttribute.CLCA'] != null) 
		{
			editAppSpecific("Williamson Act",AInfo['ParcelAttribute.CLCA']);
		} else {
			editAppSpecific("Williamson Act","No");
		}

		if (AInfo['ParcelAttribute.FIRE'] != null) 
		{
			editAppSpecific("Fire District",AInfo['ParcelAttribute.FIRE']);
		} else {
			editAppSpecific("Fire District","NA");
		}

		if (AInfo['ParcelAttribute.PAHA'] != null) 
		{
			editAppSpecific("Potential Avalanche Hazard Area",AInfo['ParcelAttribute.PAHA']);
		} else {
			editAppSpecific("Potential Avalanche Hazard Area","No");
		}

		if (AInfo['ParcelAttribute.CEMETARY'] != null) 
		{
			editAppSpecific("Cemetery District",AInfo['ParcelAttribute.CEMETARY']);
		} else {
			editAppSpecific("Cemetery District","NA");
		}

		if (AInfo['ParcelAttribute.ZONING'] != null) 
		{
			editAppSpecific("Zoning",AInfo['ParcelAttribute.ZONING']);
		} else {
			editAppSpecific("Zoning","NA");
		}

		if (AInfo['ParcelAttribute.SCHOOL'] != null) 
		{
			editAppSpecific("Elementary School District",AInfo['ParcelAttribute.SCHOOL']);
		} else {
			editAppSpecific("Elementary School District","NA");
		}
		if(AInfo['ParcelAttribute.FIREINSP'] != null)
		{
			editAppSpecific("Fire Plancheck Inspection",AInfo['ParcelAttribute.FIREINSP']);
		} else {
			editAppSpecific("Fire Plancheck Inspection","NA");
		}
		
		// Create Geo message
		var varCount = 0;
		var mBody = "";

		mBody = "<font size = 3 color=ff000><b>This property is in: </b></font><br> ";
		if (AInfo['ParcelAttribute.FLOODPLAIN'] != null) 
		{
			mBody = mBody + "the 100 Year Flood Plain<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.OVERFLIGHT'] != null)
		{
			mBody = mBody + "the Airport Overflight Zone District<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.TRPA'] != null) 
		{
			mBody = mBody + "the Tahoe Regional Planning District<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.TAHOEBEACHES'] != null) 
		{
			mBody = mBody + "a Tahoe Beach Property zone<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.JURISDICTION'] != null) 
		{
			mBody = mBody + AInfo['ParcelAttribute.JURISDICTION'] + " Jurisdiction<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.BLUEOAKS'] != null) 
		{
			mBody = mBody + "the Blue Oaks Ranch Conservancy Easement<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.CLCA'] != null) 
		{
			mBody = mBody + "The Williamson Act<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.FIRE'] != null)
		{
			mBody = mBody + AInfo['ParcelAttribute.FIRE'] + " fire district<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.PAHA'] != null) 
		{
			mBody = mBody + "a Potential Avalanche Hazard Area<br>";
			varCount = varCount + 1;
		}
		if (AInfo['ParcelAttribute.CEMETARY'] != null) 
		{
			mBody = mBody + AInfo['ParcelAttribute.CEMETARY'] + " cemetery district<br>";
			varCount = varCount + 1;
		}
		if (varCount > 0) 
		{
			mBody = mBody + "!";
			showMessage = true;
			comment(mBody);
		}
		// End Geo message
		
		if(AInfo['ParcelAttribute.COUNTYPROP'] == "COUNTYPROP" || AInfo['ParcelAttribute.COUNTYPROP'] == "County Property") 
		{
			//addAdHocTask("ADHOC","Real Estate Services Review","County Property");
			emailParameters = aa.util.newHashtable();
			getRecordParams4Notification(emailParameters);
			sendNotification("noreply@placer.ca.gov","",null, "REAL_ESTATE_SVCS_NOTIFICATION", emailParameters, null);
		}
	}

	if (matches(appTypeArray[3],"Amendment < 3000","Amendment > 3000","Amendment") && getParent()) 
	{
		pCapId = getParent();
		logDebug("The pCapId is:"+pCapId);
		cCapId = capId;
		logDebug("The ccapId is:"+cCapId);
		bldAmndString = updateChildAltID2Digits(pCapId,cCapId,"_AM");
	}

	if (AInfo['Scope of Work'] != null) {updateShortNotes(AInfo['Scope of Work']);}

	if (AInfo['ParcelAttribute.BLDRESPONSE'] == "Tahoe") 
	{
		editAppSpecific("Project Office","Tahoe");
		projectOffice = "Tahoe";
		//editAppSpecific("TRPA Permit","Y");

	}else{
		editAppSpecific("Project Office","Auburn");
		projectOffice = "Auburn";
		//editAppSpecific("TRPA Permit","N");
	}
	logDebug("trpaFlag = " + trpaFlag);
	if(trpaFlag.indexOf("Tahoe Regional") > -1)
	{
		editAppSpecific("TRPA Permit","Y");
		var newName = capName + " (TRPA)";
		editAppName(newName,capId);
	}else{
		editAppSpecific("TRPA Permit","N");
	}

	createRefContactsFromCapContactsAndLink(capId,null,null,false,true,comparePeopleGeneric);

	// Add conditions to parcels
	if (AInfo['Fee Deferral'] == "CHECKED" && matches(parcelConditionExists("Fee Deferral"),false,"False")) 
	{
		addParcelCondition(null, "Other - Prevent Final / Completion", "Applied", "Fee Deferral", "Fee(s) deferred", "Notice");
	}

	if (AInfo['Deed Restricted Secondary Dwelling'] == "CHECKED" && matches(parcelConditionExists("Deed Restriction"),false,"False")) 
	{
		addParcelCondition(null, "Planning - Notification", "Applied", "Deed Restricted Secondary Dwelling", "This parcel contains a Deed Restricted Secondary Dwelling", "Notice");
	}

	if (AInfo['ParcelAttribute.SPECIFIC PLAN'] == "Pinyon Creek II") 
	{
		addFee("PINYON-AFF", "B_RES","FINAL",1,"N");
		showMessage = true;
		comment("<font size = 3 color=ff000><b>This project requires Affordable Housing Fee. You must enter the number of units on the PINYON-AFF fee</b></font>");
	}


	if (AInfo['ParcelAttribute.FIRE'] == "Sacramento Metropolitan Fire District") 
	{
		addStdCondition("Fire - Prevent Issuance / Approval", "Review by Sac Metro Fire may be required");
	}

	// Add fees for watershed areas
	if (AInfo['ParcelAttribute.DC'] != null && matches(appTypeArray[2],"Full Review")) 
	{
		var varFeePrefix = "";
		
		if ((matches(appTypeArray[1],"Commercial") && AInfo['Scope of Work'] == "Apartment") || (matches(appTypeArray[1],"Residential") && AInfo['Scope of Work'] == "Duplex")) 
		{
			varFeePrefix = "DDCH";
		}

		if (matches(appTypeArray[1],"Residential") && matches(AInfo['Type of Work'],"New","Manufactured Home") && matches(AInfo['Scope of Work'],"Manufactured Home on Foundation","Manufactured Home on Piers","Manufactured Home Secondary","Secondary Dwelling","Single Family < 3000","Single Family > 3000","Tract Home < 3000","Tract Home > 3000")) 
		{
			varFeePrefix = "DDCR";
		}

		if (matches(appTypeArray[1],"Commercial") && AInfo['Type of Work'] == "New" && matches(AInfo['Scope of Work'],"Arena Commercial","Auditorium Assembly","Business","Church","Commercial Modular or Manufactured New","Convalescent or Home for the Elderly","Dormatory or Employee Housing","Fire Station","Hotel Motel","Manufacturing/Industrial","Medical Office","Mini Storage","Modular Office","Office","Public Building","Repair Garage","Restaurant","Retail","School","Service Station","Warehouse","Bank","Bowling Alley","Library","Pubilc Parking Garage","Theater")) 
		{
			varFeePrefix = "DDCC";
		}

		if (AInfo['ParcelAttribute.DC'] == "Antelope Creek Watershed" && varFeePrefix != "") 
		{
			addFee(varFeePrefix + " ANTLO","D_DRYCREEK","FINAL",1,"N");
		}

		if (AInfo['ParcelAttribute.DC'] == "Linda Creek North Watershed" && varFeePrefix != "") 
		{
			addFee(varFeePrefix + " LINDN","D_DRYCREEK","FINAL",1,"N");
		}

		if (AInfo['ParcelAttribute.DC'] == "Linda Creek South Watershed" && varFeePrefix != "") 
		{
			addFee(varFeePrefix + " LINDS","D_DRYCREEK","FINAL",1,"N");
		}

		if (AInfo['ParcelAttribute.DC'] == "Main Stem Watershed" && varFeePrefix != "") 
		{
			addFee(varFeePrefix + " MAIN","D_DRYCREEK","FINAL",1,"N");
		}

		if (AInfo['ParcelAttribute.DC'] == "Miners Ravine Watershed" && varFeePrefix != "") 
		{
			addFee(varFeePrefix + " MINER","D_DRYCREEK","FINAL",1,"N");
		}

		if (AInfo['ParcelAttribute.DC'] == "Secret Ravine Watershed" && varFeePrefix != "") 
		{
			addFee(varFeePrefix + " SECRE","D_DRYCREEK","FINAL",1,"N");
		}
		if(AInfo['ParcelAttribute.DC'] == "Strap Ravine Watershed" && varFeePrefix != "")
		{
			addFee(varFeePrefix + " STRAP","D_DRYCREEK","FINAL",1,"N");
		}
	}
	if(AInfo['ParcelAttribute.FIRE'] == "Sacramento Metropolitan Fire District") {addStdCondition("Fire - Prevent Issuance / Approval", "Review by Sac Metro Fire may be required");}
	if(!publicUser)
	{
		assignTask("Submittal Review","CDRA_UNASSIGNED");
		editTaskDueDate("Submittal Review",dateAdd(null,2,"Y"));
	}
	
	//IT Request# 1911 - EV Charging Station
	if (!publicUser)
	{
		if(matches(appTypeArray[1], "Residential", "Commercial") && appTypeArray[2] == "Limited")
		{
			if (getAppSpecific("Type of Work") == "Alteration" && getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)")
			{
				if (getAppSpecific("EVCS Units Qty") == "1-25 units") 
				{	
					editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 5, " "));
				} else if(getAppSpecific("EVCS Units Qty") == "26+ units")
				{
					editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 10, " "));
				} else {
					logDebug('***Error***: "EVCS Units Qty" is undefined!');
				}
			}
		}
	}
	//End of IT Request# 1911 - EV Charging Station 	
} catch(e)
{
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing ASA:Building try error ", e.message);	
}


if(!publicUser)
{	
	try
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
				if(projectOffice = "Tahoe") cdrEmail = "TahoeCounter@placer.ca.gov";
				addParameter(params,"$$cdrEmail$$",cdrEmail);
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
	catch (err) {
		logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
		aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing ASA:Building not public user try error ", err.message);
	}
}

//IT Request# 1911 - EV Charging Station
try{
	if (!publicUser)
		if (matches(appTypeArray[1], "Residential", "Commercial") && appTypeArray[2] == "Limited")
			if (getAppSpecific("Scope of Work") == "Electric Vehicle Charging Station (EVCS)") {
				if (getAppSpecific("EVCS Units Qty") == "1-25 units")
					editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 5, " "));

				if (getAppSpecific("EVCS Units Qty") == "26+ units")
					editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 10, " "));
			}

	//End of IT Request# 1911 - EV Charging Station

	//IT Request#2059 - Auto Create SPMUD Flag
	if (AInfo["ParcelAttribute.UTILITY"] != null && AInfo["ParcelAttribute.UTILITY"] != "" && AInfo["ParcelAttribute.UTILITY"] != undefined)
		if (AInfo["ParcelAttribute.UTILITY"].startsWith("SOUTH PLACER MUD"))
			if ((appTypeArray[1] == "Commercial" && appTypeArray[2] == "Full Review") || (appTypeArray[1] == "Residential" && appTypeArray[2] == "Full Review" && matches(appTypeArray[3], 'Other', 'Residential<3000', 'Residential>3000', 'Tract < 3000', 'Tract > 3000')))
				addStdCondition('Env. Engineering - Prevent Issuance / Approval', 'Project in SPMUD Jurisdiction');
	//End of IT Request#2059 - Auto Create SPMUD Flag 
}
catch (err)
{
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
	aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing ASA:Building EV message try error ", err.message);
}

aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing ASA:Building: debug ", debug);

/* ---------------------------------------------
Notes from 04/28/2021
deploy the condition part to production asap

Notes from 03/28/2024
Converted emse 2.0 'ASA:Building all' to EMSE 3.0

For Testing: Disabled ASA:Building/*
------------------------------------------------*/
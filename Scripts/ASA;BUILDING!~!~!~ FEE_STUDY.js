/*=============================================================================================
| Program : ASA:Building/~/~/~
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
|         : TDunn 07/27/2026 added setting in possession date for back office creation
|		  : Abe   11/09/2026 added "Code Organizer", "Code TO DO" tags for more readability.  If you use VS Code, install 'Code Organizer' & 'Code TO DO' to see the regions and easily navigate through the script sections.
|         : Abe   11/09/2026 updated IT Request#2059, added isEmpty() utility function for checking parcel attributes and simplified condition checks
|		  : Abe   11/09/2026 added regions to the script for better organization and readability
|         : Abe   11/18/2026 added general building fees to Fee section
|
|
|
|
/=============================================================================================*/
if (matches(currentUserID, "TDUNN", "JMCKENZI", "EAFTAHI")) { showDebug = 1; }

logDebug("Running ASA:Building ...");


//#region INITIALIZATION & GENERAL CODES
// INITIALIZATION & GENERAL CODES ----
var projectOffice = null;
var slFlags = "";
var slFlagCodes = new Array();

//fee related variables
var feeSchedule = "";  //TODO: TBD
var varAutoInvoiceFees = "N";
var feeQty = 1;
var feePeriod = "FINAL";

if (AInfo['Scope of Work'] != null) { updateShortNotes(AInfo['Scope of Work']); }

/* Update TRPA flag based on parcel attribute */
var trpaFlag = "NA";
if (!matches(AInfo["ParcelAttribute.TRPA"], null, undefined, false)) { trpaFlag = AInfo["ParcelAttribute.TRPA"]; }
logDebug("TRPA attribute = " + trpaFlag);
updateRefParcelToCap();


/* Additional legacy code from EMSE 2.0 version */
deleteTask(capId, "TRPA Planning Review");
deleteTask(capId, "TRPA Planning Review"); //Repeated intentionally to delete BOTH instances of the task	
deleteTask(capId, "TRPA ESD Review");
deleteTask(capId, "TRPA ESD Review"); //Repeated intentionally to delete BOTH instances of the task


/* Determine project office based on parcel attribute BLDRESPONSE */
if (AInfo['ParcelAttribute.BLDRESPONSE'] == "Tahoe") {
	editAppSpecific("Project Office", "Tahoe");
	projectOffice = "Tahoe";
} else {
	editAppSpecific("Project Office", "Auburn");
	projectOffice = "Auburn";
}


/* Set TRPA flag based on project office, update capName  */
logDebug("trpaFlag = " + trpaFlag);
if (trpaFlag.indexOf("Tahoe Regional") > -1) {
	editAppSpecific("TRPA Permit", "Y");
	var newName = capName + " (TRPA)";
	editAppName(newName, capId);
} else {
	editAppSpecific("TRPA Permit", "N");
}

createRefContactsFromCapContactsAndLink(capId, null, null, false, true, comparePeopleGeneric);


//#endregion


//#region General/Base Building Fees
//GENERAL & BASE BUILDING FEES ----

//This part is adding all general Building fees to the records based on:
// - Record Type (RT)
// - Parcel attributes such as SPECIAL_LAND_FEES_FLAGS and TRPA

//B_RECORDS_BASE: 0903=> B-0116, 0790 (Records Fee-Base)
//B_RECORDS_FULL: 0903=> B-0116, 0901, 0902
//B_COMM_FULL:  
// 0108 Accessibility Compliance Review	(B-0113)
// 0109 Building Permit Fee-Commercial	
// 0104 Commercial Electric	
// 0105 Commercial Mechanical	
// 0106 Commercial Plumbing	
// 0107 Commercial Seismic   (B-0115)
// 0115 Energy Compliance Review-Commercial  (B-0112)
// 0102 Plan Check Fee-Commercial
//B_COMM_PARTIAL: 
// 0108 Accessibility Compliance Review	(B-0113)
// 0109 Building Permit Fee-Commercial	
// 0107 Commercial Seismic
// 0115 Energy Compliance Review-Commercial
// 0102 Plan Check Fee-Commercial

//Extra Fees from Fee Study	
//0132	Facility Fee-Commercial
//0130	Facility Fee-Multifamily
//0756	Animal Services Capital Facility-MFD/SEC

//Imaging/Processing/Storage Fees
//0790
//0901:Records Fee-Letter
//0902:Records Fee-Plans


//AppString: AppGroup/AppType/AppSubType/AppCategory

//===============================================================================



//for all records 
//REVIEW: CHECK Exceptions: Revisions and Calfire and Deferred submittal 
//TODO: Make sure that these fee should be invoiced for limited records or not


if (appTypeArray[3].indexOf("Revision") == -1 && !matches(appTypeArray[1], "CalFire", "Deferred Submittal", "Revision")) {
	logDebug("Adding default Building fees B-0116, 0790...");
	updateFee("B-0116", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	updateFee("0790", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);  //REVIEW: Check fee Schedule of 0790

	if (appTypeArray[2] == "Full Review") {
		//REVIEW: Check fee Schedule of 0901 and 0902
		logDebug("Adding default Building fees 0901, 0902...");
		updateFee("0901", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
		updateFee("0902", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}
}

//IMPACT & SPECIFIC PLAN FEES ----
logDebug("Adding 'PINYON-AFF' fee ...");
// NOTE: "Pinyon-AFF" Schedule is "BLD_IMPACT_FEES"
if (AInfo['ParcelAttribute.SPECIFIC PLAN'] == "Pinyon Creek II") {
	addFee("PINYON-AFF", "BLD_IMPACT_FEES", feePeriod, feeQty, varAutoInvoiceFees);
	showMessage = true;
	logMessage("This project requires Affordable Housing Fee. Enter <b>Number of Units</b> on the <b>PINYON-AFF fee</b>.", "WARNING");
}

logDebug("Adding DRYCREEK WATERSHED Fees ...");
if (AInfo['ParcelAttribute.DC'] != null && matches(appTypeArray[2], "Full Review")) {
	var varFeePrefix = "";
	if ((matches(appTypeArray[1], "Commercial") && AInfo['Scope of Work'] == "Multi-Family") || (matches(appTypeArray[1], "Residential") && AInfo['Scope of Work'] == "Duplex")) {
		varFeePrefix = "DDCH";
	}

	if (matches(appTypeArray[1], "Residential") && matches(AInfo['Scope of Work'], "Manufactured Home", "Single Family Dwelling - Custom", "Single Family Dwelling - Production", "Accessory Dwelling Unit", "Farm Worker Housing")) {
		varFeePrefix = "DDCR";
	}

	if (matches(appTypeArray[1], "Commercial") && matches(AInfo['Scope of Work'], "Commercial New Construction")) {
		varFeePrefix = "DDCC";
	}

	feeSchedule = "D_DRYCREEK";
	if (AInfo['ParcelAttribute.DC'] == "Antelope Creek Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " ANTLO", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}

	if (AInfo['ParcelAttribute.DC'] == "Linda Creek North Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " LINDN", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}

	if (AInfo['ParcelAttribute.DC'] == "Linda Creek South Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " LINDS", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}

	if (AInfo['ParcelAttribute.DC'] == "Main Stem Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " MAIN", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}

	if (AInfo['ParcelAttribute.DC'] == "Miners Ravine Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " MINER", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}

	if (AInfo['ParcelAttribute.DC'] == "Secret Ravine Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " SECRE", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}
	if (AInfo['ParcelAttribute.DC'] == "Strap Ravine Watershed" && varFeePrefix != "") {
		addFee(varFeePrefix + " STRAP", feeSchedule, feePeriod, feeQty, varAutoInvoiceFees);
	}
}//end of watershed fees

//#endregion General/Base Fees


//#region CONDITIONS/FLAGS
// CONDITIONS & FLAGS ----


/* Abe 11/09/2026 Removed extra codes from special Land Fees Flags */
logDebug("Adding StdCondition for Special Land Fees Flags: MARIPOSA SEWER REIMBURSEMENT FLAG ...");

if (!isEmpty(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"])) {
	slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
	slFlagCodes = slFlags.split(";");
	// MARIPOSA SEWER REIMBURSEMENT FLAG; PVLDRAAC	
	for (thisFlag in slFlagCodes) {
		luCode = slFlagCodes[thisFlag];
		newCode = luCode.trim();
		logDebug("This Special Land Fee flag is: " + newCode);
		if (newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
			logDebug("Trying to add 'Reimbursement Agreements for Sewer' condition");
			addStdCondition("Env. Engineering - Notification", "Reimbursement Agreements for Sewer");
		}
	}
}

logDebug("Adding general Std Conditions ...");

if (AInfo['ParcelAttribute.FIRE'] == "Sacramento Metropolitan Fire District") {
	addStdCondition("Fire - Prevent Issuance / Approval", "Review by Sac Metro Fire may be required");
}

/* IT Request#2059 - Auto Create SPMUD Flag */
if (appTypeArray[2] == "Full Review" && !isEmpty(AInfo["ParcelAttribute.UTILITY"]) && AInfo["ParcelAttribute.UTILITY"].startsWith("SOUTH PLACER MUD")) {
	addStdCondition('Env. Engineering - Prevent Issuance / Approval', 'Project in SPMUD Jurisdiction');
}

logDebug("Adding Parcel Conditions ...");

if (AInfo['Fee Deferral'] == "CHECKED" && matches(parcelConditionExists("Fee Deferral"), false, "False")) {
	addParcelCondition(null, "Other - Prevent Final / Completion", "Applied", "Fee Deferral", "Fee(s) deferred", "Notice");
}

if (AInfo['Deed Restricted Secondary Dwelling'] == "CHECKED" && matches(parcelConditionExists("Deed Restriction"), false, "False")) {
	addParcelCondition(null, "Planning - Notification", "Applied", "Deed Restricted Secondary Dwelling", "This parcel contains a Deed Restricted Secondary Dwelling", "Notice");
}

//#endregion


//#region NOTIFICATIONS
//RECORD'S NOTIFICATIONS ----
logDebug("Sending notifications for new submittal for STAFF Record Creation...");
if (!publicUser) {

	emailSendFrom = null;
	emailTo = null;
	emailCC = null;
	report = null;

	var notificationTemplate = "";
	var emailParameters = aa.util.newHashtable();
	getRecordParams4NotificationJM(emailParameters);
	getPrimaryAddressLineParam4Notification(emailParameters);

	/* New Submittal Notification for STAFF Record Creation */
	var cdrEmail = "OnlineBLDPermits@placer.ca.gov";
	var contactTypes = new Array("Applicant", "Owner");
	var iCon = null;
	var contactArray = new Array();
	contactArray = getContactArray();
	for (iCon in contactArray) {
		if (exists(contactArray[iCon]["contactType"], contactTypes)) {
			// converted from branch("ES_EMAIL_NEW_ONLINE_PERMIT")				
			tContact = contactArray[iCon];

			getContactParams4Notification(emailParameters, tContact);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);

			if (projectOffice = "Tahoe") cdrEmail = "TahoeCounter@placer.ca.gov";
			addParameter(emailParameters, "$$cdrEmail$$", cdrEmail);
			emailSendFrom = "";
			emailTo = tContact["email"];
			emailCC = "";
			if (!matches(tContact["email"], null, "", undefined) && !appMatch("Building/Residential/PV Solar/*")) {
				notificationTemplate = "NEW_ONLINE_PERMIT_SUBMITTED";
				sendNotification(emailSendFrom, emailTo, emailCC, notificationTemplate, params, report);
			}
		}
	}


	/* Placer County Real Estate Email Notification */
	logDebug("Sending Placer County Real Estate Email Notification if applicable...");
	if (AInfo['ParcelAttribute.COUNTYPROP'] == "COUNTYPROP" || AInfo['ParcelAttribute.COUNTYPROP'] == "County Property") {
		sendNotification(defaultFrom, "", null, "REAL_ESTATE_SVCS_NOTIFICATION", emailParameters, null);
	}

} //End !publicUser
//#endregion


//#region GEO-CODE ASI UPDATE AND GEO MESSAGE FROM PARCEL ATTRIBUTES
//GEO-CODE ASI UPDATE FROM PARCEL ATTRIBUTES ----
//==========================================

if (!publicUser) {

	loadCustomScript("CSLB_LP_IMPORT_SOAP");


	if (AInfo['ParcelAttribute.FLOODPLAIN'] != null) {
		editAppSpecific("100 Year Flood Plain", AInfo['ParcelAttribute.FLOODPLAIN']);
	} else {
		editAppSpecific("100 Year Flood Plain", "No");
	}

	if (AInfo['ParcelAttribute.OVERFLIGHT'] != null) {
		editAppSpecific("Airport Overflight Zone District", AInfo['ParcelAttribute.OVERFLIGHT']);
	} else {
		editAppSpecific("Airport Overflight Zone District", "No");
	}

	if (AInfo['ParcelAttribute.TRPA'] != null) {
		editAppSpecific("TRPA", AInfo['ParcelAttribute.TRPA']);
	} else {
		editAppSpecific("TRPA", "No");
	}

	if (AInfo['ParcelAttribute.TAHOEBEACHES'] != null) {
		editAppSpecific("Tahoe Beach Property", AInfo['ParcelAttribute.TAHOEBEACHES']);
	} else {
		editAppSpecific("Tahoe Beach Property", "No");
	}

	if (AInfo['ParcelAttribute.JURISDICTION'] != null) {
		editAppSpecific("City Jurisdiction", AInfo['ParcelAttribute.JURISDICTION']);
	} else {
		editAppSpecific("City Jurisdiction", "NA");
	}

	if (AInfo['ParcelAttribute.BLUEOAKS'] != null) {
		editAppSpecific("Blue Oaks Ranch Consv Easement", AInfo['ParcelAttribute.BLUEOAKS']);
	} else {
		editAppSpecific("Blue Oaks Ranch Consv Easement", "No");
	}

	if (AInfo['ParcelAttribute.CLCA'] != null) {
		editAppSpecific("Williamson Act", AInfo['ParcelAttribute.CLCA']);
	} else {
		editAppSpecific("Williamson Act", "No");
	}

	if (AInfo['ParcelAttribute.FIRE'] != null) {
		editAppSpecific("Fire District", AInfo['ParcelAttribute.FIRE']);
	} else {
		editAppSpecific("Fire District", "NA");
	}

	if (AInfo['ParcelAttribute.PAHA'] != null) {
		editAppSpecific("Potential Avalanche Hazard Area", AInfo['ParcelAttribute.PAHA']);
	} else {
		editAppSpecific("Potential Avalanche Hazard Area", "No");
	}

	if (AInfo['ParcelAttribute.CEMETARY'] != null) {
		editAppSpecific("Cemetery District", AInfo['ParcelAttribute.CEMETARY']);
	} else {
		editAppSpecific("Cemetery District", "NA");
	}

	if (AInfo['ParcelAttribute.ZONING'] != null) {
		editAppSpecific("Zoning", AInfo['ParcelAttribute.ZONING']);
	} else {
		editAppSpecific("Zoning", "NA");
	}

	if (AInfo['ParcelAttribute.SCHOOL'] != null) {
		editAppSpecific("Elementary School District", AInfo['ParcelAttribute.SCHOOL']);
	} else {
		editAppSpecific("Elementary School District", "NA");
	}
	if (AInfo['ParcelAttribute.FIREINSP'] != null) {
		editAppSpecific("Fire Plancheck Inspection", AInfo['ParcelAttribute.FIREINSP']);
	} else {
		editAppSpecific("Fire Plancheck Inspection", "NA");
	}

	// Create Geo message
	var varCount = 0;
	var mBody = "";

	mBody = "<font size = 3 color=ff000><b>This property is in: </b></font><br> ";
	if (AInfo['ParcelAttribute.FLOODPLAIN'] != null) {
		mBody = mBody + "the 100 Year Flood Plain<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.OVERFLIGHT'] != null) {
		mBody = mBody + "the Airport Overflight Zone District<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.TRPA'] != null) {
		mBody = mBody + "the Tahoe Regional Planning District<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.TAHOEBEACHES'] != null) {
		mBody = mBody + "a Tahoe Beach Property zone<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.JURISDICTION'] != null) {
		mBody = mBody + AInfo['ParcelAttribute.JURISDICTION'] + " Jurisdiction<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.BLUEOAKS'] != null) {
		mBody = mBody + "the Blue Oaks Ranch Conservancy Easement<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.CLCA'] != null) {
		mBody = mBody + "The Williamson Act<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.FIRE'] != null) {
		mBody = mBody + AInfo['ParcelAttribute.FIRE'] + " fire district<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.PAHA'] != null) {
		mBody = mBody + "a Potential Avalanche Hazard Area<br>";
		varCount = varCount + 1;
	}
	if (AInfo['ParcelAttribute.CEMETARY'] != null) {
		mBody = mBody + AInfo['ParcelAttribute.CEMETARY'] + " cemetery district<br>";
		varCount = varCount + 1;
	}
	if (varCount > 0) {
		mBody = mBody + "!";
		showMessage = true;
		comment(mBody);
	}
	// End Geo message
} //End !uplicUser
//#endregion GEO-CODE ASI UPDATE AND GEO MESSAGE FROM PARCEL ATTRIBUTES


//#region ASI UPDATES
//ASI UPDATES ----

/* IT Request# 1911 - EV Charging Station
   Abe 11/17/26: Removed unnecessary check for Residential and Commercial 
			   : Removed checking of Type of Work since MEP is the only one for EVCS
 */
if (!publicUser) {
	if (appTypeArray[2] == "Limited")
		if (AInfo["Scope of Work"] == "Electric Vehicle Charging Station (EVCS)" && !isEmpty(AInfo["EVCS Units Qty"])) {
			if (AInfo["EVCS Units Qty"] == "1-25 units") {
				editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 5, " "));
			} else if (AInfo["EVCS Units Qty"] == "26+ units") {
				editAppSpecific("EVCS Processing Deadline", dateAdd(fileDate, 10, " "));
			}
		}
}//end of (!publicUser)

//#endregion ASI Fields update


//#region WORKFLOW RULES
//WORKFLOW RULES ----
/* Added setting in possession date for back office creation */
if (!publicUser) {
	assignTask("Submittal Review", "PERMIT CENTER_UNASSIGNED");
	editTaskDueDate("Submittal Review", dateAdd(null, 2, "Y"));
	editTaskSpecific("Submittal Review", "Possession Start Date", dateAdd(null, 0, "Y"));
	updateTask("Submittal Review", "Received", "Possession Start Date logged by system", "", wfProcess);
}
//#endregion WORKFLOW RULES

aa.sendMail(defaultFrom, "eaftahi@placer.ca.gov", "", "Testing ASA:Building: debug ", debug);

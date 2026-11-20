/*=============================================================================================
| Program : ASA:ESD/~/~/~
|
| Event   : ApplicationSpecificUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Development script for all ESD records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/19/2021 created production version 
|         : TDunn 01/11/2022 updated to logic for adding fees on NOT publicUser
<<<<<<< Updated upstream
|         
=======
|         : TDunn 04/16/2026 Excluded Improvement Plan from Tech fee 
|         : TDunn 05/19/2026 added Improvement Plan Type as part of exclusion rule Imp Plan records
|		  : Abe   10/22/2026 Synced this script to prod (Copied from PROD)
|         : Abe   10/22/2026 commented cruft codes - Cleansing
|         : Abe   10/22/2026 added IT Request# 3932 - ESD Fee Study
|         : Abe   10/23/2026 added fee logics from all ASA:ESD branches (stdChoices)
|         : Abe * 10/23/2026 disabled ASA:ESD/Final Map/~/~ stdChoice - recordType doesn't exist
|         : Abe   10/23/2026 added ASA:ESD/Improvement Plan/~/~ StdChoice and disabled
|         : Abe   10/23/2026 added ASA:ESD/Parcel Map/~/~ stdChoice and disabled
|         : Abe   10/26/2026 commented fee automation associated with depricated Fee items
|
>>>>>>> Stashed changes
|
/=============================================================================================*/
showDebug = false; showMessage = false;

<<<<<<< Updated upstream
if(currentUserID == "TDUNN") {
=======
if (matches(currentUserID), "TDUNN", "EAFTAHI") {
>>>>>>> Stashed changes
	showDebug = 1;
}

logDebug("Running ASA:ESD ...");

/**
 * Abe 10/22/2026: This section not required
 * 
	var slFeeSched = "SP_PLACER_VINEYARDS";
	var slFeeList ="";
	var slFeeArray = new Array();
	var feeName = "";
	var thisQty = 1;
	var thisScope = getAppSpecific("Scope of Work");
	var thisADU = ""; 
	var addFeeFlag = true;
	var slLookupTable = "sdl:Land Use Codes";	
*/

var varAutoInvoiceFees = "N";
/**
 * 
 * Abe 10/23/2026: Update ASI "Project Office" based on ParcelAttribute.BLDRESPONSE
 *               : Added the codes from ASA:ESD stdChoice
 *               : Currently there are 1200 APNs with invalid "ParcelAttribute.BLDRESPONSE" value: added if-else
 * 
 */
var vProjectOffice = "";

if (AInfo["ParcelAttribute.BLDRESPONSE"] == "Tahoe") {
	editAppSpecific("Project Office", "Tahoe");
	vProjectOffice = "Tahoe";
}
else if (AInfo["ParcelAttribute.BLDRESPONSE"] == "Auburn") {
	editAppSpecific("Project Office", "Auburn");
	vProjectOffice = "Auburn";
}
else {
	logDebug("ParcelAttribute.BLDRESPONSE: Null or Empty Value!", "WARNING");
	logDebug("Project Office: invalid!", "WARNING");
}

//Adding "Reimbursement" flag for "Mariposa" SPECIAL_LAND_FEES_FLAGS
var slFlags = "";
var slFlagCodes = new Array();
<<<<<<< Updated upstream
var slFeeSched = "SP_PLACER_VINEYARDS";
var slFeeList ="";
var slFeeArray = new Array();
var feeName = "";
var thisQty = 1;
var thisScope = getAppSpecific("Scope of Work");
var thisADU = ""; 
var addFeeFlag = true;
var slLookupTable = "sdl:Land Use Codes";
if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
	slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
	
=======
if (AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
	slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
>>>>>>> Stashed changes
	slFlagCodes = slFlags.split(";");
	// MARIPOSA SEWER REIMBURSEMENT FLAG; PVLDRAAC	
	for(thisFlag in slFlagCodes) {
		luCode = slFlagCodes[thisFlag];
		newCode = luCode.trim();
		logDebug("This flag is " + newCode);
<<<<<<< Updated upstream
		if(newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
			logDebug("Trying to add condition");
			addStdCondition("Env. Engineering - Notification","Reimbursement Agreements for Sewer");
		}
	}
}
if(!publicUser) {
	if(matches(appTypeArray[1],"Grading Permit")) {
		addFee("DPEXEMPVER","ESD","FINAL",1,"N"); 
		addFee("DPGP","ESD","FINAL",1,"N");
	}
	if(matches(appTypeArray[1],"Record of Survey")) {
		addFee("DPROS","ESD","FINAL",1,"N");
	}
	// Adding new TECH fee
	if(matches(appTypeArray[1],"Final Subdivision Map","Grading Permit","Improvement Plan","Improvement Plan Revision","Parcel Map","Record of Survey")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
}


	
/*

=======
		if (newCode == "MARIPOSA SEWER REIMBURSEMENT FLAG") {
			logDebug("Trying to add condition...");
			addStdCondition("Env. Engineering - Notification", "Reimbursement Agreements for Sewer");
		}
	}
}

//Beginning: IT Request# 3932 - ESD Fee Study
if (!publicUser) {

	//auto-add GP's defualt fees per Type
	if (appTypeArray[1] == "Grading Permit") {
		thisGradingType = getAppSpecific("Grading Permit Type");
		if (thisGradingType == "Standard") addFee("EGP", "ESD", "FINAL", 1, varAutoInvoiceFees);
		if (thisGradingType == "Engineered") addFee("EGPENGPLANS", "ESD", "FINAL", 1, varAutoInvoiceFees);
		if (thisGradingType == "Pond") addFee("EGPPOND", "ESD", "FINAL", 1, varAutoInvoiceFees);

		//Adding "Exemption Verification Fee" to all GP - Waiting for PLANNING Fee Study to confirm
		addFee("PL-EXV", "P_PLN", "FINAL", 1, varAutoInvoiceFees);

		//Abe 10/23/2026: added assignCap from ASA:ESD stdChoice
		if (matches(vProjectOffice, "Auburn", ""))
			assignCap("JPEACOCK");

		if (matches(vProjectOffice, "Tahoe"))
			assignCap("FSTAMM");
	}

	if (appTypeArray[1] == "Record of Survey") {
		addFee("EROS", "ESD", "FINAL", 1, varAutoInvoiceFees);
	}

	if (appTypeArray[1] == "Parcel Map") {
		addFee("EPARCELMAP", "ESD", "FINAL", 1, varAutoInvoiceFees);

		//Abe 10/23/2026: added from ASA:ESD/Parcel Map
		activateTask("Security Posted")
	}

	if (appTypeArray[1] == "Final Subdivision Map") {
		addFee("EFINALMAP", "ESD", "FINAL", 1, varAutoInvoiceFees);
	}

	if (appTypeArray[1] == "Improvement Plan") {
		//Abe 10/23/2026: Added from "ASA:ESD/Improvement Plan" stdChoice 
		vImpPlanType = getAppSpecific("Improvement Plan Type");
		if (vImpPlanType) {
			updateShortNotes(vImpPlanType);
		}

		addFee("EWINTERIZ", "ESD", "FINAL", 1, varAutoInvoiceFees);
		addFee("EPLNCHK", "ESD", "FINAL", 1, varAutoInvoiceFees);
		addFee("EINSPECT", "ESD", "FINAL", 1, varAutoInvoiceFees);

		/*** 
		 * 
		 * Abe - 10/26/2026 >> Commented automation associated with depricated Fee codes
		 * 
		 * 		 
		addFee("DMMICROFLM", "ESD", "FINAL", 1, varAutoInvoiceFees);		
		if (matches(vImpPlanType, "FF", "PN"))
			addFee("DPPCSEWER", "ESD", "FINAL", 1, varAutoInvoiceFees); 
		 *
		 *
		*/
	}

	//Adding TECH2 fee - future
	if (matches(appTypeArray[1], "Final Subdivision Map", "Grading Permit", "Improvement Plan Revision", "Parcel Map", "Record of Survey")) {
		updateFee("TECH2", "ACCOUNTING", "FINAL", 1, varAutoInvoiceFees);
	}
	if (appTypeArray[1] == "Improvement Plan" && matches(AInfo["Improvement Plan Type"], "Utility", "BFAT")) {
		updateFee("TECH2", "ACCOUNTING", "FINAL", 1, varAutoInvoiceFees);
	}
}


/** 
 * Adding new TECH fee
 * Abe 10/22/2026: Commented - Must define a new Tech fee based on IT Req# 3772
 *                 Sample: TECH2 
 * 
	if(matches(appTypeArray[1],"Final Subdivision Map","Grading Permit","Improvement Plan Revision","Parcel Map","Record of Survey")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
	if(appTypeArray[1] == "Improvement Plan" && matches(AInfo["Improvement Plan Type"],"Utility","BFAT")){
		updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
	}
*/

/**
 * Abe 10/22/2026: Before Fee Study - Kept for history
 * 
	if(!publicUser) {
		if(matches(appTypeArray[1],"Grading Permit")) {
			addFee("DPEXEMPVER","ESD","FINAL",1,"N"); 
			addFee("DPGP","ESD","FINAL",1,"N");
		}
		if(matches(appTypeArray[1],"Record of Survey")) {
			addFee("DPROS","ESD","FINAL",1,"N");
		}
		// Adding new TECH fee
		if(matches(appTypeArray[1],"Final Subdivision Map","Grading Permit","Improvement Plan Revision","Parcel Map","Record of Survey")){
			updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
		}
		if(appTypeArray[1] == "Improvement Plan" && matches(AInfo["Improvement Plan Type"],"Utility","BFAT")){
			updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
		}
	}
>>>>>>> Stashed changes
*/
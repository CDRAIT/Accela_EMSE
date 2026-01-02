/*=========================================================================================================
| Program : ASIUA;Building!Residential!~!~
| Event   : ApplicationSpecificInfoUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Application Specific Info Update After for all Residential records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 09/15/2020 created script
|         : TDunn 11/18/2020 added new logic to auto calc impact fees for Res <3000 when new and ADU
|         : TDunn 02/24/2021 added new logic to include Res > 3000 for ADU and JADU fee rules
|         : GWL   07/06/2021 add initialization of varLookupTable to default as "Residential Scope of Work"
|         : TDunn 10/11/2021 added scripting for SP fees
|         : TDunn 10/21/2021 updated SP fee scripts to manage new SP schedule
|         : TDunn 01/17/2022 updated how Building Res Limited fees are added on ACA submittals.
|         : TDunn 07/07/2022 added Tract > 3000 and < 3000 to ADU/JADU rules
|         : EAftahi 10/18/2023 modified the ADU/JADU section to meet the latest Custom Fields changes 
|         : EAftahi 03/07/2024 IT Request # 1978 - do not Auto Invoice 'Solar Roof Mount' fees
|         : EAftahi 04/29/2024 IT Request# 1998 & 1865 Adding Ad-Hoc tasks, ADU Review & Addressing, to the ADU/JADU Apps
|         : TDunn 09/19/2024 Removed update to Plan check expiration date.
|         : TDunn 10/01/2024 Remarked out 'addAllFees' function due to fee assessment errors
|         : TDunn 10/10/2024 changed all 'addFee' to updateFee unless associated with a 'removeAllFees' call.
|         : TDunn 10/10/2024 added master flag and 'Tract' flag to control reassessing fees.
|         : TDunn 01/08/2025 remarked out adhoc task additions for ADU and Addressing
|         : TDunn 04/09/2025 added 'notTract' flag to new Master record type to skip assessing fees.
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/31/2025 deployed to GitHub
|         : Abe   11/07/2025 added IT Req 2694 - Pool Letter ASI
|         : TDunn 11/17/2025 added test for SVC_AGENT user to halt executing ASIUA actions
|
/==========================================================================================================*/
if(matches(currentUserID,"TDUNN","EAFTAHI")) 
{
	showDebug = 1;
}
logDebug("Running ASA:Building Residential in ASIUA mode");
var varAutoInvoiceFees = "N";

//Abe: IT Request # 1978: chenged IF clause to exclude the "Solar Roof Mount" apps
// if(cap.isCreatedByACA() && appMatch("Building/Residential/Limited/*")) {
// 	varAutoInvoiceFees = "Y";
// }

if(currentUserID != "SVC_AGENT")
{
	var spTypeFlag = true;
	var doLimited = false;
	var notTract = true;
	var updateOn = true;
	var varLookupTable = "Residential Scope of Work";
	// Assess Fees
	if(appTypeArray[2] == "Limited") {varLookupTable = "OTC Scope of Work";}
	if(appTypeArray[3] == "Tract-Third Party Rev. < 3000") {varLookupTable = "Third Party Review";}
	if(appTypeArray[3] == "Residential<3000") {varLookupTable = "Residential 3000 Scope of Work";}
	if(appTypeArray[3] == "Residential>3000") {varLookupTable = "Residential 3000plus Scope of Work";}
	if(appTypeArray[2] == "Limited" && publicUser) {
		varLookupTable = "OTC Scope of Work ACA";
		doLimited = true;
		spTypeFlag = false;
		logDebug("Is limited = " + doLimited);
	}
	if(appTypeArray[3] == "Tract < 3000") {
		varLookupTable = "ResidentialTract < 3000";
		notTract = false;
		if(!matches(AInfo["Type of Work"],"New","Manufactured Home")) {
			spTypeFlag = false;
		}
	}

	if(appTypeArray[3] == "Tract > 3000") {
		varLookupTable = "ResidentialTract > 3000";
		notTract = false;	
		if(!matches(AInfo["Type of Work"],"New","Manufactured Home")) {
			spTypeFlag = false;
		}	
	}
	if(appTypeArray[3] == "Master < 3000") {varLookupTable = "Residential Master<3000";}
	if(appTypeArray[3] == "Master > 3000") {varLookupTable = "Residential Master>3000";}
	if(appTypeArray[2] == "Master")
	{
		varLookupTable = "SDL:PCMasterPlanScope";
		notTract = false;
	}
	if(appTypeArray[3] == "Tract-Third Party Rev > 3000") 
	{
		varLookupTable = "Third Party Review";
		notTract = false;
	}
	if(appTypeArray[3] == "Tract-Third Party Rev < 3000") 
	{
		varLookupTable = "Third Party Review";
		notTract = false;
	}
	logDebug("Fee lookup table is " + varLookupTable);


	if((notTract || doLimited) && updateOn) 
	{
		var varSpecialFees = "";
		var specFeeCodes = new Array(); 	
		var fsFlag ="";
		var feeCodes ="";
		var fSchedName = "";
		var feeName = "";
		var thisQty = 1;
		var thisScope = getAppSpecific("Scope of Work");
		if(doLimited) { thisScope = getAppSpecific("Scope of Work ACA");}
		var thisADU = ""; 
		var thisJADU = "";
		var addFeeFlag = true;
		var slFlags = "";
		var slFlagCodes = new Array();	
		var slLookupTable = "sdl:Land Use Codes";
		varSpecialFees = lookup(varLookupTable,thisScope); 
		specFeeCodes = varSpecialFees.split(",");
		if(matches(appTypeArray[3],"Residential<3000","Residential>3000", "Tract < 3000","Tract > 3000", "Other")){
			thisADU = getAppSpecific("ADU Required");
			thisJADU = getAppSpecific("JADU Required");
		}
		for(thisCode in specFeeCodes) {
			var fsFlag = "None";
			if(specFeeCodes[thisCode] != null) {
				feeCodes = specFeeCodes[thisCode];
				fsFlag = feeCodes.substring(0,3);
				
				if(fsFlag == "FS|") {
					fSchedName = feeCodes.substring(3); 
					//addAllFees(fSchedName,"FINAL",1,varAutoInvoiceFees);
				}
				if(fsFlag == "FF|") {
					thisQty = 1;
					addFeeFlag = true;
					feeName = feeCodes.substring(3);
					// update fee quantity when New and has ADU/JADU
					if(matches(appTypeArray[3],"Residential<3000","Residential>3000","Tract < 3000","Tract > 3000") && matches(thisScope,"Single Family < 3000","Single Family > 3000") && matches(feeName,"0751","0752")) {
						if(thisADU == "Yes" && matches(thisJADU,"No", "")) {thisQty = getAppSpecific("ADU SqFt")/getAppSpecific("Primary Residence sqft");}
						if(matches(thisADU, "No", "") && thisJADU == "Yes") {thisQty = getAppSpecific("JADU SqFt")/getAppSpecific("Primary Residence sqft");}
						if(thisADU == "Yes" && thisJADU == "Yes") {thisQty = (getAppSpecific("JADU SqFt") *1 + getAppSpecific("ADU SqFt") * 1)/getAppSpecific("Primary Residence sqft");}
						thisQty = thisQty.toFixed(4);
						logDebug("Quantity = " + thisQty);
					}
					if(thisScope =="Accessory Dwelling Unit" && matches(feeName,"0750","0754","0756")) {
						sqftADU = getAppSpecific("ADU SqFt");
						if(sqftADU < 750) {
							addFeeFlag = false;
						}
						if(sqftADU > 750) {
							if(thisADU == "Yes" && matches(thisJADU, "No", "")) {thisQty = getAppSpecific("ADU SqFt")/getAppSpecific("Primary Residence sqft");}
							if(thisADU == "Yes" && thisJADU == "Yes") {thisQty = (getAppSpecific("JADU SqFt") *1 + getAppSpecific("ADU SqFt") * 1)/getAppSpecific("Primary Residence sqft");}
							thisQty = thisQty.toFixed(4);
							logDebug("Quantity = " + thisQty);
							// actual is ratio of primary sqft to adu sqft for over 750 sqft of adu/jadu and no upper limit. when with primary use same calc.
							// less than 750 sqft
						}
					}
						
					if(addFeeFlag) {
						updateFee(feeName,"B_RES","FINAL",thisQty,varAutoInvoiceFees);
					}
				}
				if(fsFlag == "SP|" && spTypeFlag) {
					landUse = feeCodes.substring(3);
					logDebug("Land Use code is " + landUse);
					if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
						slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
						slFlagCodes = slFlags.split(";");

						for(thisFlag in slFlagCodes) {
							luCode = slFlagCodes[thisFlag];
							newCode = luCode.trim();
							logDebug("This flag is " + newCode);

							if(lookup(slLookupTable,newCode) != null) {
								logDebug("This is a land use code");
								if(newCode == landUse) {
									logDebug("Land use from fee list lookup matches this land use");
									var slFeeList ="";
									var slFeeArray = new Array();
									var spDev = newCode.substring(0,2);
									if(newCode == "RVMPLD") {spDev = newCode;}												  
									var slFeeSched = lookup("sdl:SP Fee Schedules",spDev);
									logDebug("This is the fee schedule " + slFeeSched);
									slFeeList = lookup(slLookupTable,newCode);
									slFeeArray = slFeeList.split(",");
									for(thisSlFee in slFeeArray) {
										slFeeCode = slFeeArray[thisSlFee];
										updateFee(slFeeCode,slFeeSched,"FINAL",1,varAutoInvoiceFees);
									}
								}
							}
							
						}
						
					}
					
					
				}
				logDebug("thisCode = " + specFeeCodes[thisCode]);
				
			}


			if(AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FIREFEE") {updateFee("FIRE-MITRE","B_RES","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.FIRE_7A"] == "Defensible Space Inspection Required (Section 7A)" && specFeeCodes[thisCode] == "FIRE_7A") {updateFee("9007","B_RES","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.FIREINSP"] == "Placer" && specFeeCodes[thisCode] == "FIREINSP") {
				updateFee("0916","B_RES","FINAL",1,"N"); 
				updateFee("0917","B_RES","FINAL",1,"N");
			}
			if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0747") {updateFee("0747","B_RES","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0748") {updateFee("0748","B_RES","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.CEMETARY"] == "Placer County Cemetery District" && specFeeCodes[thisCode] == "C0749") {updateFee("0749","B_RES","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.FIREFEE"] == "Placer County Fire Protection District" && specFeeCodes[thisCode] == "FF9053") {updateFee("9053","B_RES","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Morgan Knolls" && specFeeCodes[thisCode] == "TF-HSG MK") {updateFee("TF-HSG MK","AFFORDABLE HOUSING","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Bickford Ranch" && specFeeCodes[thisCode] == "TF-HSG BKF") {updateFee("TF-HSG BKF","AFFORDABLE HOUSING","FINAL",1,"N");}
			if(AInfo["ParcelAttribute.SPECIFIC PLAN"] == "Martis Valley West Parcel SP" && specFeeCodes[thisCode] == "TF-HSG MVW") {updateFee("TF-HSG MVW","AFFORDABLE HOUSING","FINAL",1,"N");}

		}
			
		if(getAppSpecific("Plumbing") == "CHECKED") { 
		updateFee("0710","B_RES","FINAL",1,"N");
		}
		if(getAppSpecific("Electrical") == "CHECKED") {
			updateFee("0711","B_RES","FINAL",1,"N");
		}
		if(getAppSpecific("HVAC-Mechanical") == "CHECKED") {
			updateFee("0712","B_RES","FINAL",1,"N");
		}
		if(publicUser && AInfo["Scope of Work ACA"] == "Mechanical" && AInfo["MECHANICAL - Number of Systems"] > 1) {
			updateFee("0712","B_RES","FINAL",getAppSpecific("MECHANICAL - Number of Systems"),"Y");
		}

		if(publicUser && AInfo["Scope of Work ACA"] == "Solar Roof Mount" && matches(AInfo["SOLAR - Panel Changeout"],"Y","Yes")) {
			//Abe 03/07/2024 IT Request # 1978 - changed updateFee("0711","B_RES","FINAL",1,"Y") --> updateFee("0711","B_RES","FINAL",1,"N");
			updateFee("0711","B_RES","FINAL",1,"Y");
		}
		if(getAppSpecific("Third Party Review") == "Yes") {
			updateFee("0713", "B_RES", "FINAL",1,"N"); 
			removeFee("0715","FINAL");
		}

		if(AInfo["Type of Work"] == "Renewal" ) {
			removeAllFees(capId);
			addFee("0911","B_RES","FINAL",1,"N"); 
			addFee("0924","B_RES","FINAL",1,"N");
			addFee("0913","B_RES","FINAL",1,"N");
		}

		if(appMatch("Building/Residential/Full Review/Renewal")) {
			removeAllFees(capId); 
			addFee("0911","B_RES","FINAL",1,"N"); 
			addFee("0924","B_RES","FINAL",1,"N");
			addFee("0913","B_RES","FINAL",1,"N");
		}
		if((appTypeArray[2] == "Full Review" && matches(appTypeArray[3],"Renewal","Other","Residential>3000","Residential<3000","Tract > 3000","Tract < 3000")) || matches(appTypeArray[2],"Plan Check Only","Limited")){
			updateFee("TECH","ACCOUNTING","FINAL",1,varAutoInvoiceFees);
		}

	} 

	//IT Req 2694 - Pool Letter ASI
	if (appTypeArray[2] == "FullReview" || appTypeArray[3] == "Other")
		if (getAppSpecific("Pool Letter Mailed") == "CHECKED") {
			createCapComment("Pool Safety Regulation letter mailed.");
		}
	//End of IT Req 2694




	//IT Request# 1998 & 1865 
	//checks if Ad-hocs already exists
	var hasAddressing = false;
	var hasAduReview = false;

	var thisADU = getAppSpecific("ADU Required");
	var thisJADU = getAppSpecific("JADU Required");

	var wfTaskResults = aa.workflow.getTasks(capId);
	if (wfTaskResults.getSuccess())
		var wfTask = wfTaskResults.getOutput();
	else
		logDebug("**ERROR: Failed to get workflow object: " + wfTaskResults.getErrorMessage());
	for (i in wfTask) {
		var tempTask = wfTask[i];
			if (tempTask.getTaskDescription().toUpperCase().equals("addressing".toUpperCase()))
				hasAddressing = true;
			if(tempTask.getTaskDescription().toUpperCase().equals("ADU Review".toUpperCase()))
				hasAduReview = true;
	}

}
// if (thisADU == "Yes" || thisJADU == "Yes")  {
	// if(!(hasAddressing))
		// addAdHocTask("ADHOC", "Addressing", "", "LDEROBER");
	// if(!(hasAduReview) && AInfo["Project Office"] == "Auburn")
		// addAdHocTask("ADHOC", "ADU Review", "", "PHOFFMAN");
	// else if(!(hasAduReview) && AInfo["Project Office"] == "Tahoe")
		// addAdHocTask("ADHOC", "ADU Review", "", "TLYKINS");
// }
//End Of IT Request# 1998 & 1865 

//sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing Limited submittal in prod", debug);
//sendResult = aa.sendMail("noreply@placer.ca.gov","eaftahi@placer.ca.gov", "", "ASIUA;Building!Residential!~!~ in prod", debug);


// PVLDAIR,PVLDAIW,PVLDAIRW,PVLDAIJT,PVLDAIS,PVLDAISD,PVLDAIOS,PVLDAIROW,PVLDAIEM,PVLDAIRVSP,PVLDAIADM,PVLDASS,PVLDAST,PVLDASADM,PVLDANP,PVLDANPIL,PVLDANPADM,PVLDACP,PVLDACPADM,PVLDASAC,PVLDASACADM,PVRIEGO99-AR,PVROSETMPR-AR,PVTIER2R-AR,PVAGWATER
/* FF|0903,FF|0790,FF|0711 ELEC
FF|0903,FF|0790,FF|0712	Mech
FF|0903,FF|0790,FF|0710	Plumb
FF|0903,FF|0790,FF|0722 Reroof
FF|0903,FF|0790,FF|0731 Solar
FF|0903,FF|0790,FF|0710	WTR
FF|0903,FF|0790,FF|0734 Window
*/
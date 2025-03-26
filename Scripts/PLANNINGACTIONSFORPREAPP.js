/* --------------------------------------------------------------------------------------------------------------------
| Script name: PlanningActionsForPreApp
| Converted ASA:Planning to be called from WTUA:Planning/Pre-Application for use with EMSE 3.0 scripting
| Converted: 8/10/2023 - 8/28/2023 TDunn, TPS
----------------------------------------------------------------------------------------------------------------------*/
var varBaseFlag = true;
var rezoneGPAflag = false;
var rezGPAcounter = 0;
var varEIAQflag = true;
var varLastFee = "0";
var varHighFee = false;
var varFeeCode2 = "";
var varWhichFee = "";
var varRank = "0";
var varEntitlement = null;
var varShortNotes = "";

if (typeof(PROJECT) == "object") 
{
	/* Converted from ES_FLAG_SPECIAL_RULES */

	for (thisRow in PROJECT) 
	{

		tableRow = PROJECT[thisRow];
		varEntitlement = tableRow["Entitlement"];
		varShortNotes = varShortNotes + varEntitlement + ";";
		if (matches(varEntitlement,"General Plan Amendment","Rezoning")) 
		{
			rezGPAcounter = rezGPAcounter + 1;
		}
		if (matches(varEntitlement,"Adminstrative Review","Minor Land Division","MUP Type A","MUP Type B","MUP Type C","Variance")) 
		{
			/* Converted from ES_GET_HIGHEST_FEE */
			varWhichFee = lookup("ESLKUP_ENTFEE",varEntitlement);
			varRank = varWhichFee.substring(0,1);
			logDebug("varRank = " + varRank + " for Entitlement " + varEntitlement + "<br> varLastFee = " + varLastFee);
			if (varRank > varLastFee) 
			{
				varLastFee = varRank;
				varFeeCode2 = varWhichFee.substring(2);
				logDebug(" varRank = " + varRank + "<br> varLastFee = " + varLastFee + "<br> varFeeCode2 = " + varFeeCode2);
			}
		}
	}
}

if (varShortNotes != "") 
{
	updateShortNotes(varShortNotes);
}

if (typeof(PROJECT) == "object") 
{
	for (thisRow in PROJECT) 
	{
		/* Converted from ("ES_GET_FEES_BY_ENTITLEMENT") */
		tableRow = PROJECT[thisRow];
		varEntitlement = null;
		validCode = false;
		varNoRule = true;
		varFeeCode = "";
		varEntitlement = tableRow["Entitlement"];
		varPlanFeesString = lookup("Entitlements",varEntitlement);
		logDebug(" Fee String = " + varPlanFeesString);
		planFeeCodes = new Array();
		planFeeCodes = varPlanFeesString.split(",");
		if (matches(varEntitlement,"General Plan Amendment","Rezoning") && rezGPAcounter == 2) 
		{
			varNoRule = false;
			rezoneGPAflag = true;
		}

		if (matches(varEntitlement,"Adminstrative Review","Minor Land Division","MUP Type A","MUP Type B","MUP Type C","Variance")) 
		{
			varNoRule = false;
			varHighFee = true;
		}

		for (thisCode in planFeeCodes) 
		{
			/* converted from ("ES_ADD_FEES_PLANNING") */
			if (planFeeCodes[thisCode] != null && planFeeCodes[thisCode] != "None") 
			{
				validCode = true;
				varFeeCode = planFeeCodes[thisCode];
			}

			if (validCode && varBaseFlag && varFeeCode == "P_BASE") 
			{
				addFee("PL-EXV","P_PLN","FINAL",1,"N");
				addFee("PL-NOE","P_PLN","FINAL",1,"N");
				varBaseFlag = false;
			}

			if (validCode && varNoRule && varFeeCode != "PL-EIAQ" && varFeeCode != "P_BASE" && varFeeCode != "9007") 
			{
				addFee(varFeeCode,"P_PLN","FINAL",1,"N");
			}

			if (varEIAQflag && varFeeCode == "PL-EIAQ") 
			{
				addFee(varFeeCode,"P_PLN","FINAL",1,"N");
				varEIAQflag = false;
			}

			if (varHighFee) 
			{
				updateFee(varFeeCode2,"P_PLN","FINAL",1,"N");
			}

			if (validCode && varFeeCode == "9007") 
			{
				addFee(varFeeCode,"FIRE PLANNER FEES","FINAL",1,"N");
			}
		}
	}
}

if (matches(appTypeArray[2],"MBLA")) 
{
	addFee("PL-MBLA", "P_PLN","FINAL",1,"N");
	addFee("PL-EXV", "P_PLN","FINAL",1,"N");
	addFee("PL-NOE", "P_PLN","FINAL",1,"N");
}

if (matches(appTypeArray[1],"Administrative","Internal County Project","MBLA","Pre Development","Project") && !feeExists("TECH","NEW","INVOICED")) 
{
	updateFee("TECH","ACCOUNTING","FINAL",1,"N");
}

copyGeoToASI();
geoMessage();
updateRefParcelToCap();
createRefContactsFromCapContactsAndLink(capId,null,null,false,true,comparePeopleGeneric);


if (appMatch("Planning/MBLA/NA/NA")) 
{
	updateShortNotes("Minor Boundary Line Adjustment");
}

if (AInfo['Project Office'] == "Auburn") 
{
	assignCap("PLNTECH_ABN");
}

if (AInfo['Project Office'] == "Tahoe") 
{
	assignCap("PLNTECH_TAH");
}

// Internal functions for this script.  Move to Includes custom on deployment
//============================================================================
function geoMessage()
{
	// Converted from branch("ES_GEO_MESSAGE")
	varCount= 0;
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
}

function copyGeoToASI()
{
	// Converted from branch("ES_COPY_GEO_TO_ASI")
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

	if (AInfo['ParcelAttribute.TRPA'] != null) {
		editAppSpecific("TRPA",AInfo['ParcelAttribute.TRPA']);
		} else {
		editAppSpecific("TRPA","No");
		}

	if (AInfo['ParcelAttribute.TAHOEBEACHES'] != null) {
		editAppSpecific("Tahoe Beach Property",AInfo['ParcelAttribute.TAHOEBEACHES']);
		} else {
		editAppSpecific("Tahoe Beach Property","No");
		}

	if (AInfo['ParcelAttribute.JURISDICTION'] != null) {
		editAppSpecific("City Jurisdiction",AInfo['ParcelAttribute.JURISDICTION']);
		} else {
		editAppSpecific("City Jurisdiction","NA");
		}

	if (AInfo['ParcelAttribute.BLUEOAKS'] != null) {
		editAppSpecific("Blue Oaks Ranch Consv Easement",AInfo['ParcelAttribute.BLUEOAKS']);
		} else {
		editAppSpecific("Blue Oaks Ranch Consv Easement","No");
		}

	if (AInfo['ParcelAttribute.CLCA'] != null) {
		editAppSpecific("Williamson Act",AInfo['ParcelAttribute.CLCA']);
		} else {
		editAppSpecific("Williamson Act","No");
		}

	if (AInfo['ParcelAttribute.FIRE'] != null) {
		editAppSpecific("Fire District",AInfo['ParcelAttribute.FIRE']);
		} else {
		editAppSpecific("Fire District","NA");
		}

	if (AInfo['ParcelAttribute.PAHA'] != null) {
		editAppSpecific("Potential Avalanche Hazard Area",AInfo['ParcelAttribute.PAHA']);
		} else {
		editAppSpecific("Potential Avalanche Hazard Area","No");
		}

	if (AInfo['ParcelAttribute.CEMETARY'] != null) {
		editAppSpecific("Cemetery District",AInfo['ParcelAttribute.CEMETARY']);
		} else {
		editAppSpecific("Cemetery District","NA");
		}

	if (AInfo['ParcelAttribute.ZONING'] != null) {
		editAppSpecific("Zoning",AInfo['ParcelAttribute.ZONING']);
		} else {
		editAppSpecific("Zoning","NA");
		}

	if (AInfo['ParcelAttribute.SCHOOL'] != null) {
		editAppSpecific("Elementary School District",AInfo['ParcelAttribute.SCHOOL']);
		} else {
		editAppSpecific("Elementary School District","NA");
	}
}
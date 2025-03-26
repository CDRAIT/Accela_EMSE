/*======================================================================================/
| Program : ASA;ShortTermRental!STR Renewal!~!~
|         //ASA:ShortTermRental/STR Renewal/NA/NA
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all STR records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 12/04/2020 created script
|         : TDunn 12/07/2020 added logic for updating short notes and workDesc
|		  : TDunn 12/08/2020 updates and corrections
|
|
/==========================================================================================*/

if(currentUserID == "TDUNN") {
	showDebug = true;
}
// Get 'TOT' number and update custom field
logDebug("Running Short Term Rental ASA script");
// editAppSpecific("TOT Registration Number",capName);
// if(!publicUser) {
	// if(AInfo["Rental Management"] == "Private") {
		// addFee("STR-101","STR_PERMIT","FINAL",1,"Y");
		// addFee("STR-103","STR_PERMIT","FINAL",1,"Y");
	// }else {
		// addFee("STR-102","STR_PERMIT","FINAL",1,"Y");
		// addFee("STR-104","STR_PERMIT","FINAL",1,"Y");
	// }
// }
pcapId = getParent();

if(pcapId != null) {
	editAppSpecific("Rental Management",AInfo["Rental Management"],pcapId);
	if(!matches(AInfo["Type of Ownership"],null,"")) {
		editAppSpecific("Type of Ownership",AInfo["Type of Ownership"],pcapId);
	}
	if(!matches(AInfo["Residential Association"],null,"")) {
		editAppSpecific("Residential Association",AInfo["Residential Association"],pcapId);
	}
	if(!matches(AInfo["Primary or Secondary Dwelling"],null,"")) {
		editAppSpecific("Primary or Secondary Dwelling",AInfo["Primary or Secondary Dwelling"],pcapId);
	}
	if(!matches(AInfo["Rental Unit Type"],null,"")) {
		editAppSpecific("Rental Unit Type",AInfo["Rental Unit Type"],pcapId);
	}
	if(!matches(AInfo["Rental Unit Sqft"],null,"")) {
		editAppSpecific("Rental Unit Sqft",AInfo["Rental Unit Sqft"],pcapId);
	}
	
	if(!matches(AInfo["Number of Bedrooms"],null,"")) {
		editAppSpecific("Number of Bedrooms",AInfo["Number of Bedrooms"],pcapId);
	}
	if(!matches(AInfo["Maximum Occupancy"],null,"")) {
		editAppSpecific("Maximum Occupancy",AInfo["Maximum Occupancy"],pcapId);
	}
	if(!matches(AInfo["Onsite parking spaces"],null,"")) {
		editAppSpecific("Onsite parking spaces",AInfo["Onsite parking spaces"],pcapId);
	}
	if(!matches(AInfo["Garbage Service Provider"],null,"")) {
		editAppSpecific("Garbage Service Provider",AInfo["Garbage Service Provider"],pcapId);
	}
	if(!matches(AInfo["Has Bear Box"],null,"")) {
		editAppSpecific("Has Bear Box",AInfo["Has Bear Box"],pcapId);
	}
	if(!matches(AInfo["Trash Recepticals"],null,"")) {
		editAppSpecific("Trash Recepticals",AInfo["Trash Recepticals"],pcapId);
	}
	if(!matches(AInfo["Number of Fire Extinguishers"],null,"")) {
		editAppSpecific("Number of Fire Extinguishers",AInfo["Number of Fire Extinguishers"],pcapId);
	}
	if(!matches(AInfo["Number of smoke alarms"],null,"")) {
		editAppSpecific("Number of smoke alarms",AInfo["Number of smoke alarms"],pcapId);
	}
	if(!matches(AInfo["Number of carbon monoxide detectors"],null,"")) {
		editAppSpecific("Number of carbon monoxide detectors",AInfo["Number of carbon monoxide detectors"],pcapId);
	}
	
	copyContacts(capId,pcapId);
	updateAppStatus("Renewal Submitted","Updated by script",pcapId);
	copyAddresses(capId,pcapId);
	
}

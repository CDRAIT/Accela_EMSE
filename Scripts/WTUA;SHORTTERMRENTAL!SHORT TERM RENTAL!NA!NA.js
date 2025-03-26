/*------------------------------------------------------------------------------------------------------/
| Program : WTUA;ShortTermRental!Short Term Rental!NA!NA
|         //WTUA:ShortTermRental/Short Term Rental/NA/NA
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : Workflow Task Update After for all STR records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 11/11/2020 created script
|         : TDunn 12/02/2020 added expiration date calc
|                            added update fees logic for the In Review status
|         : TDunn 01/05/2021 updated notification parameters
|         : TDunn 01/18/2021 added logic to pro-rate fees for 2021 transition year
|         : TDunn 02/01/2021 updated logic for adding full fees versus pro-rate
																						   
|         
|
/------------------------------------------------------------------------------------------------------*/

if(currentUserID == "TDUNN") {
	showDebug = 1;
}

if(capName != null && capName != "") {
	var thisAlt = capIDString;
	logDebug(capIDString);
	var thisLong = thisAlt.length();
	logDebug(thisLong);
	var justTOT = thisLong - 6;
	logDebug(justTOT);
	var underScore = thisAlt.indexOf("_");
	logDebug("Underscore at " + underScore);
					  
												   
  
	  
	var thisTOTNum = thisAlt.substr(6,justTOT);
  
	logDebug("Current Number = " + thisTOTNum);
	logDebug("capName = " + capName);
	if(capName != thisTOTNum) {
		var thisToday = new Date(dateAdd(null,0));
		var thisDate = thisToday.getDate();
		var thisYear = thisToday.getFullYear();
		var thisMonth = thisToday.getMonth();
		var yearString = thisYear.toString();
		var twoYear = yearString.substr(2,2);
		var newAltId = "STR" + twoYear + "-" + capName;
		logDebug("New alt ID is " + newAltId);
		logDebug("This year is " + twoYear);
		// editAppSpecific("TOT Registration Number",capName);
		aa.cap.updateCapAltID(capId,newAltId);	
	}	
}

if(wfTask == "Status") {
	if(wfStatus == "Link Permit to TOT") {
		logDebug("Trying to get parent");
		if(getParent() == null || getParent() == false) {
			logDebug("No parent found, trying to link based on TOT number");
			var parentSuccess = true;
			var totNumber = capName;
			pCapId = aa.cap.getCapID(totNumber).getOutput();
			if(pCapId != null) {
				var totChildren = new Array();
				var totalFound = 0;
				totChildren = getChildren("ShortTermRental/Short Term Rental/NA/NA",pCapId);
				if(totChildren == null || totChildren.length == 0) {
					logDebug("TOT record " + totNumber + " has no other children");
				}
				else{
					totalFound = totChildren.length;
					totalFound = totalFound + 1;
					newAltId = newAltId + "_" + totalFound;
					aa.cap.updateCapAltID(capId, newAltId);
				}
				logDebug("TOT Reg number = " + totNumber);
				parentSuccess = addParent(totNumber);
			}
			else {
				showMessage = true;
				comment("Failed to find TOT Registration registration number " + totNumber);
			}
		}
	}
	
	if(wfStatus == "Additional Information Required") {
/*		logDebug("Trying to get parent");
		if(getParent() == null || getParent() == false) {
			logDebug("No parent found, trying to link based on TOT number");
			var parentSuccess = true;
			var totNumber = getAppSpecific("TOT Registration Number");
			logDebug("TOT Reg number = " + totNumber);
			parentSuccess = addParent(totNumber);
			logDebug("Parent success is " + parentSuccess);
			if(parentSuccess == false) {
				comment("Failed to find TOT Registration registration number " + totNumber);
				showMessage = true;
			}
		}
*/
		createNotificationTPS2("NOTICE_STR_ADDITIONAL_INFORMATION_REQUIRED","Y","Applicant","N","","N","N","N","Y","N","N","");
	}
	
	

	if(wfStatus == "Ready to Issue") {
		if(matches(AInfo["Project Office"],null,"")) { editAppSpecific("Project Office","Tahoe"); }
		
		logDebug("Running fees section");
		var expDate = AInfo["Expiration Date"];
		var expDateNew = new Date(expDate);
		var thisToday = new Date(dateAdd(null,0));
		var thisDate = thisToday.getDate();
		var thisYear = thisToday.getFullYear();
		var thisMonth = thisToday.getMonth();
		var yearString = thisYear.toString();
		var twoYear = yearString.substr(2,2);
		//aa.print("This year is " + twoYear);
		var expMonth = expDateNew.getMonth();
		//aa.print("Expiration month = " + expMonth);
		logDebug("Expiration month = " + expMonth);
		var realExpMonth = expMonth;
		//aa.print("Real Month = " + realExpMonth);
		logDebug("Real Month = " + realExpMonth);		
		var expYear = thisYear;
		var nextYear = new Date(dateAdd(null,365));
		var newYear = nextYear.getFullYear();
		logDebug("This year = " + thisYear + ". Next year = " + newYear);
		//aa.print("This year = " + thisYear + ". Next year = " + newYear);
		var proQty = (12-expMonth) // updated to the new date month of 1 less than calendar month to allow for including dec as 1 month remaining. Need to update to production.
		logDebug("Pro rate qty " + proQty);
		//aa.print("Pro rate qty " + proQty);
		if(expDate == null || expDate == "" || expDate == undefined) {
			logDebug("There is no expDate");
			if(AInfo["Rental Management"] == "Private") {
				if(!feeExists("STR-101","INVOICED")) {updateFee("STR-101","STR_PERMIT","FINAL",1,"Y");}
				if(!feeExists("STR-103","INVOICED")) {updateFee("STR-103","STR_PERMIT","FINAL",1,"Y");}
			}else {
				if(!feeExists("STR-102","INVOICED")) {updateFee("STR-102","STR_PERMIT","FINAL",1,"Y");}
				if(!feeExists("STR-104","INVOICED")) {updateFee("STR-104","STR_PERMIT","FINAL",1,"Y");}
			}
		}			
		if(proQty > 0 && (expDate != null && expDate != "")) {
			logDebug("Expiration Date is " + expDate + " and proQty is " + proQty);
			if(AInfo["Rental Management"] == "Private") {
				if(!feeExists("STR-105","INVOICED")) {updateFee("STR-105","STR_PERMIT","FINAL",proQty,"Y");}
				if(!feeExists("STR-103","INVOICED")) {updateFee("STR-103","STR_PERMIT","FINAL",1,"Y");}
			}else {
				if(!feeExists("STR-106","INVOICED")) {updateFee("STR-106","STR_PERMIT","FINAL",proQty,"Y");}
				if(!feeExists("STR-104","INVOICED")) {updateFee("STR-104","STR_PERMIT","FINAL",1,"Y");}
			}
			
		}
		createNotificationTPS2("WTUA:STR_PAYFEESDUE","Y","Applicant","N","","N","N","N","Y","N","N","");
	}
	
}

// Manual issuing via workflow
if(wfStatus == "Issued") {
	logDebug("Running manual issue solution");
	if(balanceDue < 1) {
		// Determine expiration date year and set expiration date
		var thisToday = new Date(dateAdd(null,0));
		var thisDate = thisToday.getDate();
		var thisYear = thisToday.getFullYear();
		var thisMonth = thisToday.getMonth();
		var expYear = thisYear;
		var nextYear = new Date(dateAdd(null,365));
		var newYear = nextYear.getFullYear();
		logDebug("This year = " + thisYear + ". Next year = " + newYear);
		if(thisMonth > 10) {
			expYear = newYear;
		}
		var newExpDate = "12/31/" + expYear;
		logDebug("Expiration Date = " + newExpDate);
		editAppSpecific("Expiration Date",dateAdd(newExpDate,0));
		editAppSpecific("Effective Date",dateAdd(null,0));
		
		// Add STR Permit Condition to Parcel
		if(!parcelConditionExists("Short Term Rental")) {
			logDebug("Trying to add condition");
			conditionComment = capIDString + ": " + getShortNotes();
			conditionType = "Short Term Rental";
			conditionStatus = "Applied(Applied)";
			conditionSeverity = "Notice";
			conditionName = "Short Term Rental Permitted";
			capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
			logDebug("Is parcel result success: " + capParcelResult);
			if(capParcelResult.getSuccess()) {
				Parcels = capParcelResult.getOutput().toArray();
				parcelValidatedNumber = Parcels[0].getParcelNumber();
				logDebug("APN:" + parcelValidatedNumber + ", " + conditionType + ", " + conditionStatus + ", " + conditionName + ", " + conditionComment + ", " + conditionSeverity);
				addParcelCondition(parcelValidatedNumber,conditionType,conditionStatus,conditionName,conditionComment,conditionSeverity);
			}
		}
		// Generatng report and notification
		var report = null;
		var reportName = "STR Permit";
		var reportModule = "ShortTermRental";
		var emailTemplate = "PRA_STR_PERMIT_ISSUED_NOTICE_TO_APPLICANT";
		var vFromEmail = "";
		var vToEmail = "";
		var vCcEmail = "";
		var cTypeArray = new Array();
		var vContactTypes = "Applicant";
		cTypeArray = vContactTypes.split(",");
		var paramMap = aa.util.newHashMap();
		paramMap.put("PermitID",capIDString);
		paramMap.put("REGEN","false");
		emailParameters = aa.util.newHashtable();
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaDeepLinkAppTypeAlias$$
		// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$capTypeAlias$$
		getRecordParams4Notification(emailParameters);
		
		var conArray = new Array();
		conArray = getContactArrayWithPrimary(capId); 
		for (thisCon in conArray) {
			if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
				logDebug(conArray[thisCon]["contactType"]) ;
				getContactParams4Notification(emailParameters, conArray[thisCon]);
				if(emailParameters.get("$$contactEmail$$") != null) {
				vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
				}
			}
		}

	
		if (aa.reportManager.getReportModelByName(reportName)){
			report = generateReportPCO(reportName,paramMap,reportModule);
		}
		else logDebug("Unable to find report: " + reportName);
		logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; vEmailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

		var	emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, new Array(report));
					
		// var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing PRA script ", debug);	
		
	}
}


if(matches(wfStatus,"Closed","Revoked")) {
	removeParcelCondition(null,"Short Term Rental","Short Term Rental Permitted");
}


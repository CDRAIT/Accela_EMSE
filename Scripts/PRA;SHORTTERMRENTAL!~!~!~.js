/*------------------------------------------------------------------------------------------------------/
| Program : PRA:ShortTermRental/~/~/~  (actually *s not tilde)
| Event   : PaymentReceiveAfter
|
| Client  : Placer County, CA
| Usage   : PaymentReceiveAfter for all STR Permits
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 01/04/2021 Created script
|         : TDunn 01/18/2021 added test for cHolderName to eliminate duplicate notifications
|         : TDunn 02/02/2021 added new parameter to report params
|
\-------------------------------------------------------------------------------------------------------*/

if(publicUser || currentUserID == "TDUNN") {
	logDebug("Running auto issue solution");
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

		if(cHolderName != null && cHolderName != "") {
			emailResult = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, new Array(report));
			updateTask("Status","Issued","All fees due paid, auto issued by script");
		}
					
		// var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing PRA script ", debug);	
		
	}
}

//Designed for code and HazVeg modules - their new workflow
function sendAcknowledgementLtr2Applicant() {
	var reportName = "";
	var reportModule = "";
	var reportFile = null;
	var reportParams = aa.util.newHashMap();
	addParameter(reportParams, "altID", capIDString);

	//var emailFrom = "noreply@placer.ca.gov";
	var emailFrom = defaultFrom;
	var emailTo = "";
	var emailCC = "";   //Use the email template

	var emailTemp = "";
	var emailParams = aa.util.newHashtable();
	addParameter(emailParams, "$$altID$$", capIDString);
	//addParameter(emailParams, "$$emailSubject$$", "ACKNOWLEDGMENT OF VEHICLE ABATEMENT REQUEST");

	if (appTypeArray[0] == "Code") {
		if (appTypeArray[1] == "Enforcement") {
			//TBD
		}
		else if (appTypeArray[1] == "Vehicle Abatement") {
			reportName = "Vehicle Acknowledgement Letter";
			reportModule = "Code";
			emailTemp = "VA_GENERAL_TEMPLATE";
			addParameter(emailParams, "$$emailSubject$$", "ACKNOWLEDGMENT OF VEHICLE ABATEMENT REQUEST");
			emailTo = getAppSpecific("Complainant Email");
		}
	}

	if (appTypeArray[0] == "HazVeg") {
		if (appTypeArray[1] == "Hazardous Vegetation") {
			reportName = "Acknowledgment Letter";
			reportModule = "HazVeg";
			addParameter(emailParams, "$$emailSubject$$", "ACKNOWLEDGMENT OF HAZARDOUS VEGETATION CASE");
			emailTemp = "HV_GENERAL_EMAIL_TEMPLATE";
			emailTo = getAppSpecific("Complainant Email");
		}
		else if (appTypeArray[1] == "Defensible Space") {
			reportName = "DEF Acknowledgment Ltr";
			reportModule = "HazVeg";
			addParameter(emailParams, "$$emailSubject$$", "ACKNOWLEDGMENT OF DEFENSIBLE SPACE REQUEST");
			emailTemp = "H_DEF_GENERAL_EMAIL_TEMPLATE";
			emailTo = getAppSpecific("Complainant Email");
		}
	}

	//running & Creating report file 
	if (aa.reportManager.getReportInfoModelByName(reportName) && !(isEmptyOrNull(emailTo)) && emailTo.indexOf('@') != -1) {
		reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Acknowledgement_Letter_Case# " + capIDString + ".pdf");
		sendResults = sendNotification(emailFrom, emailTo, emailCC, emailTemp, emailParams, new Array(reportFile));
	}
}

//CTRCA:DIGEPLAN for NONPROD1
logDebug("<font color='green'>INSIDE CTRCA DIGEPLAN</font>");
//create variable for tmpCapID in case the altID is updated earlier in the event.
tmpCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();
if (tmpCapId) capId = tmpCapId;
tmpCapIDString = capId.getCustomID();
logDebug("tmpCapIDString : " + tmpCapIDString);

try {
	// Get the TMPRecordID custom field value
	var tmpRecordID = getAppSpecific("TMPRecordID");
	logDebug("TMPRecordID custom field: " + tmpRecordID);

	if (tmpRecordID != undefined)  {
		// Call the DigEplan TMP record conversion API
		digEplanTmpRecordConversion(tmpCapIDString,tmpRecordID);
	} else {
		if (tmpRecordID == undefined) logDebug("<font color='red'>UNABLE TO CALL DIGEPLAN TMP RECORD CONVERSION API, AS TMPRecordID IS UNDEFINED</font>");
	}
}
catch (err) {
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}


	//enter as many of these as there are customizations for doc groups by record type
	docGroupForDPC = "";
	if(AInfo["DocumentGroupforDPC"] == null) {
		if(appMatch("Building/*/*/*")) docGroupForDPC = String("BLD_PLANREVIEW_DPC");
		if(appMatch("Building/Deferred Submittal/*/*")) docGroupForDPC = String("DEFERRED");
		if(appMatch("Building/Residential/PV Solar/*")) docGroupForDPC = String("BLD_SOLARAPP");

		editAppSpecific("DocumentGroupforDPC",docGroupForDPC);
		editAppSpecific("AdditionalDocumentTypes",selectDocConfigByGroupPermissions(docGroupForDPC,[]));
	}
	editAppSpecific("RequiredDocumentTypes","");

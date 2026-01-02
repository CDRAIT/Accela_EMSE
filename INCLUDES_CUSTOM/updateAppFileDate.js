function updateAppFileDate(pfileDateStr) {
	var itemCapId = capId;
	if (arguments.length == 2) itemCapId = arguments[1];

	if (itemCapId) {
		var capResult = aa.cap.getCap(itemCapId);
		var capScriptModel = capResult.getOutput();

		if (capScriptModel) {
			//set values for CAP record
			var capModel = capScriptModel.getCapModel();
			capModel.setFileDate(new java.util.Date(pfileDateStr));

			var editResult = aa.cap.editCapByPK(capModel);
			if (!editResult.getSuccess())
				logDebug("Failed to update filedate");
			else
				logDebug("Cap fileDate successfully updated!");
		}//end capSciptModelCheck
	} //end capId check
}

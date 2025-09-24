function customComment(cstr) {
	var message = "<span style='display:flex; width:1200px; height:50px; background-color:#fff0f5; align-items: center; margin-top:20px; font-size:15px; font-weight: bold;'> <p>" +
		cstr + "</p></span>";

	if (showDebug) logDebug(message);
	if (showMessage) logMessage(message);

}

/*---------------------------------------------
|	This function is required for the new SOAP CSLB Integration
|	This needs to be included in the INCLUDES_CUSTOM
|	TruePoint Solutions - Jan 2021
|	
-----------------------------------------------*/
function XMLTagValue(xmlstring, tag) {
	var startIndex = xmlstring.indexOf("<" + String(tag) + ">");
	if (startIndex == -1) return "";
	//   logDebug("startIndex:" + startIndex);
	//   logDebug("");
	var endIndex = xmlstring.indexOf("</" + String(tag) + ">", startIndex + 1);
	//   logDebug("endIndex:" + endIndex);
	//   logDebug("");
	//   logDebug("");
	var substring = xmlstring.slice(
		startIndex + 1 + String(tag).length + 1,
		endIndex
	);
	//   logDebug("substring:" + substring);
	//   logDebug("");
	//   logDebug("");
	return substring;
}

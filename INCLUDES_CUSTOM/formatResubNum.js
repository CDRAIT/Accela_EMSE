function formatResubNum(reSubNum) {
	var resubStr = "";
	var numExt = "th";
	if (reSubNum == 1 || reSubNum == 21) {
		numExt = "st";
	}
	if (reSubNum == 2 || reSubNum == 22) {
		numExt = "nd";
	}
	if (reSubNum == 3 || reSubNum == 23) {
		numExt = "rd";
	}
	logDebug("Resub string is " + String(reSubNum));
	resubStr = String(reSubNum) + numExt;
	return resubStr;
}

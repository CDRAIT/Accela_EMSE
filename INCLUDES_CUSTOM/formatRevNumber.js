function formatRevNumber(revNum) {
	var revString = "";
	if (revNum >= 100) {
		revString = String(revNum);
	}
	if (revNum >= 10 && revNum < 100) {
		revString = "0" + String(revNum);
	}
	if (revNum < 10) {
		revString = "00" + String(revNum);
	}
	return revString;
}

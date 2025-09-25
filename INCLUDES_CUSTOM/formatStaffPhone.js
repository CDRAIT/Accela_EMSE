function formatStaffPhone(phoneStr) {
	if (!matches(phoneStr, "", null, undefined)) {
		vPhoneStr = phoneStr.replace(' ', '').replace('(', '').replace(')', '').replace('-', ''); //Abe - added to clear any format
		var areaCode = vPhoneStr.substring(0, 3);
		var vPrefix = vPhoneStr.substring(3, 6);
		var pNumber = vPhoneStr.substring(6, 10);
		fNumber = "(" + areaCode + ")" + vPrefix + "-" + pNumber;
		return fNumber;
	} else {
		fNumber = "No number found";
		return fNumber;
	}
}

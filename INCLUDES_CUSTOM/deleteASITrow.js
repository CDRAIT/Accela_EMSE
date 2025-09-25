function deleteASITrow(arr, column_name, value) {
	for (var i = 0; i < arr.length; i++) {
		if (String(arr[i][column_name]) == String(value)) {
			logDebug("Found a match");
			arr.splice(i, 1);
		}
	}
	return arr
}

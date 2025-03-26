var cap = aa.env.getValue("CapModel");
var parcel = getParcel();
var message = getMessage(parcel);
displayMessage(message);

function getMessage(parcel) {
	var message = "";
	// var citiFlag = getGISInfo('PLACERCO', parcel, 'Parcel_With_Mega', 'JURISTICTION');
	// var citiFlag = getGISInfo('PLACERCO', parcel, 'Parcel_With_Mega', 'CITY JURISTICTION');
	// var citiFlag = getGISInfo('PLACERCO', parcel, 'Parcel_With_Mega', 'BLDRESPONSE');
	var citiFlag = getGISInfo('PLACERCO', parcel, 'City Limits', 'CITY');

	//check if in any city limits, we only allow County/unincorporated permits: 'na' means in the county limits
	if (citiFlag != 'na') {
		message ="The Parcel associated with this complaint is in the City limits of <b>" + citiFlag + "</b>.<br> The County does not process cases in " + citiFlag + " city limits.";
	} 	
	return message;
}

//get parcel number from capmodel
function getParcel() {
	var parcel;
	try {
		parcel = cap.getParcelModel().getParcelNo();
	} catch (err) {
		logDebug("Parcel Error: " + err.getMessage());
		return parcel;
	}
	return parcel;
}

//display message in ACA - stop moving forward
function displayMessage(str) {
	if (str) {
		aa.env.setValue("ErrorCode", "-1");
		aa.env.setValue("ErrorMessage", str);
	}
}

//get drill-down data for specific parcel number.
function getGISInfo(svc, parcelNumber, layer, attributename) {
	var distanceType = "feet";
	var retString = "na";
	if (!parcelNumber) {
		return retString;
	}
	//get parcel object
	var fGisObjs = aa.gis.getParcelGISObjects(parcelNumber);
	var fGisObj;
	if (fGisObjs.getSuccess()) {
		fGisObj = fGisObjs.getOutput()[0];
	}
	//set buffer object
	var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
	if (bufferTargetResult.getSuccess()) {
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
	}

	var bufchk = aa.gis.getBufferByRadius(fGisObj, "0", distanceType, buf);

	if (bufchk.getSuccess())
		var proxArr = bufchk.getOutput();
	else { logDebug("**WARNING: Retrieving Buffer Check Results. Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()); return false }

	for (a2 in proxArr) {
		var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
		for (z1 in proxObj) {
			var v = proxObj[z1].getAttributeValues();
			retString = v[0];
		}

	}
	return retString;
}


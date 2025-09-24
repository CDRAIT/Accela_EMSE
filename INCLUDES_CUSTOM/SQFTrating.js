function SQFTrating(SQFT) {
	if (Number(SQFT) > 0 && Number(SQFT) < 10) {
		var rating = "0.1";
	}
	else if (Number(SQFT) >= 10 && Number(SQFT) < 15) {
		var rating = "10";
	}
	else if (Number(SQFT) >= 15 && Number(SQFT) < 25) {
		var rating = "15";
	}
	else if (Number(SQFT) >= 25 && Number(SQFT) < 40) {
		var rating = "25";
	}
	else if (Number(SQFT) >= 40 && Number(SQFT) < 100) {
		var rating = "40";
	}
	else if (Number(SQFT) >= 100) {
		var rating = "100";
	}
	else {
		var rating = "no rating";
	}
	return rating;
}

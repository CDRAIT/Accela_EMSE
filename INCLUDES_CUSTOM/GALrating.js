function GALrating(GAL) {
	if (Number(GAL) > 0 && Number(GAL) < 40000) {
		var rating = "0.1";
	}
	else if (Number(GAL) >= 40000 && Number(GAL) < 100000) {
		var rating = "40000";
	}
	else if (Number(GAL) >= 100000 && Number(GAL) < 400000) {
		var rating = "100000";
	}
	else if (Number(GAL) >= 400000 && Number(GAL) < 1000000) {
		var rating = "400000";
	}
	else if (Number(GAL) >= 1000000 && Number(GAL) < 1500000) {
		var rating = "1000000";
	}
	else if (Number(GAL) >= 1500000) {
		var rating = "1500000";
	}
	else {
		var rating = "no rating";
	}
	return rating;
}

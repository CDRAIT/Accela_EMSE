function Nozrating(Noz) {
	if (Number(Noz) > 0 && Number(Noz) < 7) {
		var rating = "06";
	}
	else if (Number(Noz) >= 7 && Number(Noz) < 13) {
		var rating = "12";
	}
	else if (Number(Noz) >= 13 && Number(Noz) < 19) {
		var rating = "18";
	}
	else if (Number(Noz) >= 19 && Number(Noz) < 25) {
		var rating = "24";
	}
	else if (Number(Noz) >= 25 && Number(Noz) < 31) {
		var rating = "30";
	}
	else if (Number(Noz) >= 31) {
		var rating = "31";
	}
	else {
		var rating = "no rating";
	}
	return rating;
}

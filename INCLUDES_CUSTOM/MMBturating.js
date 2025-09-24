function MMBturating(MMBtu) {
	if (Number(MMBtu) > 0 && Number(MMBtu) < 1.5) {
		var rating = "0.1";
	}
	else if (Number(MMBtu) >= 1.5 && Number(MMBtu) < 5) {
		var rating = "1.5";
	}
	else if (Number(MMBtu) >= 5 && Number(MMBtu) < 15) {
		var rating = "5";
	}
	else if (Number(MMBtu) >= 15 && Number(MMBtu) < 50) {
		var rating = "15";
	}
	else if (Number(MMBtu) >= 50 && Number(MMBtu) < 100) {
		var rating = "50";
	}
	else if (Number(MMBtu) >= 100 && Number(MMBtu) < 200) {
		var rating = "100";
	}
	else if (Number(MMBtu) >= 200) {
		var rating = "200";
	}
	else {
		var rating = "no rating";
	}
	return rating;
}

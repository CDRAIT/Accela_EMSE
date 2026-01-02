function KVArating(KVA) {
	if (Number(KVA) > 0 && Number(KVA) < 150) {
		var rating = "0.1";
	}
	else if (Number(KVA) >= 150 && Number(KVA) < 450) {
		var rating = "150";
	}
	else if (Number(KVA) >= 450 && Number(KVA) < 4500) {
		var rating = "450";
	}
	else if (Number(KVA) >= 4500 && Number(KVA) < 14500) {
		var rating = "4500";
	}
	else if (Number(KVA) >= 14500 && Number(KVA) < 45000) {
		var rating = "14500";
	}
	else if (Number(KVA) >= 45000) {
		var rating = "45000";
	}
	else {
		var rating = "no rating";
	}
	return rating;
}

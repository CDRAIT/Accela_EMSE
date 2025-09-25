function getInspectionParams4Notification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    	
    addParameter(params, "$$inspId$$", inspId);
    addParameter(params, "$$inspResult$$", inspResult);
    addParameter(params, "$$inspType$$", inspType);
    addParameter(params, "$$inspObj$$", inspObj);
    addParameter(params, "$$inspGroup$$", inspGroup);
    //addParameter(params, "$$inspResultComment$$", inspResultComment); 
    addParameter(params, "$$inspResultDate$$", inspResultDate);

    return params;
}

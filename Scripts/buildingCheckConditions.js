/*---------------------------------------------------------------------------------------------------
| Program : buildingCheckConditions
| Event   : Called from ISB 
| Client  : Placer County 'Placerco'
| Useage  : replaces EMSE 2.0 rules for prior branch
|
| Notes   : TDunn  11/02/2024 Converted from branch ES_BLD_CHECK_COND
|
|
/----------------------------------------------------------------------------------------------------*/

//var vCancelFlag = false;
vString = "<font size = 4 color=ff000><b>The following condition(s) has(have) not been met:</b></font><br>";
if (appHasCondition("Final","Applied","APCD Final",null)) {
	vCancelFlag = true;
	vString = vString + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","EED Final",null)) {
	vCancelFlag = true;
	vString = vString + "EED Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","ESD Final",null)) {
	vCancelFlag = true;
	vString = vString + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Environmental Health Final",null)) {
	vCancelFlag = true;
	vString = vString + "Environmental Health Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Facility Services Final",null)) {
	vCancelFlag = true;
	vString = vString + "Facility Services Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Fire Final",null)) {
	vCancelFlag = true;
	vString = vString + "Fire Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Fire Alarm Final",null)) {
	vCancelFlag = true;
	vString = vString + "Fire Alarm Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Flood Cert. Final",null)) {
	vCancelFlag = true;
	vString = vString + "Flood Cert. Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Planning Final",null)) {
	vCancelFlag = true;
	vString = vString + "Planning Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Public Works Final",null)) {
	vCancelFlag = true;
	vString = vString + "Public Works Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Sewer Final",null)) {
	vCancelFlag = true;
	vString = vString + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Water Dept. Final",null)) {
	vCancelFlag = true;
	vString = vString + "Water Dept. Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Sewer Final Inspection",null)) {
	vCancelFlag = true;
	vString = vString + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENG. AND SURVEYING FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","AIR POLLUTION FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","AIR POLLUTION CONTROL FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","APCD FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","APCDFinal",null)) {
	vCancelFlag = true;
	vString = vString + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","BUILDING DEPARTMENT FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "Building Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","BUILDING FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "Building Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","Defensible Space Final",null)) {
	vCancelFlag = true;
	vString = vString + "Defensible Space Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","DPW FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "Public Works Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","EH FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "Environmental Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENGINEERING AND SURVEYING FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","Env Health Final",null)) {
	vCancelFlag = true;
	vString = vString + "Environmental Health Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENVIRONMENTAL ENGINEERING FINAL INSPECT",null)) {
	vCancelFlag = true;
	vString = vString + "Environmental Engineering Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENVIRONMENTAL HEALTH FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Environmental Health Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ESD Final",null)) {
	vCancelFlag = true;
	vString = vString + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FACILITY SERVICES FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Facility Services Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE DEPARTMENT FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Fire Department Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "Fire Department Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE SPRINKLER INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Fire Sprinkler Inspection has not been met<br>";
	}

if (appHasCondition(null,"Applied","PLANNING DEPARTMENT FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","PLANING FINAL",null)) {
	vCancelFlag = true;
	vString = vString + "Planning Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","PUBLIC WORKS FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Public Works Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","SEWER FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","Sewer Final",null)) {
	vCancelFlag = true;
	vString = vString + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","WATER DISTRICT FINAL INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Water District Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FEE DEFERRAL",null)) {
	vCancelFlag = true;
	vString = vString + "Fee Deferral Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","STREET TREES",null)) {
	vCancelFlag = true;
	vString = vString + "Street Trees Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE DEFENSIBLE INSPECTION",null)) {
	vCancelFlag = true;
	vString = vString + "Defensible Space Condition has not been met<br>";
	}

if (appHasCondition("Env Health Final","Applied",null,null)) {
	vCancelFlag = true;
	vString = vString + "Environmental Health Condition has not been met<br>";
	}

if (appHasCondition("Planning Final","Applied",null,null)) {
	vCancelFlag = true;
	vString = vString + "Planning Final Condition has not been met<br>";
	}

if (appHasCondition("Fire Department Final","Applied",null,null)) {
	vCancelFlag = true;
	vString = vString + "Fire Department Final Condition has not been met<br>";
	}

if (appHasCondition("Fire Defensible Inspection","Applied",null,null)) {
	vCancelFlag = true;
	vString = vString + "Fire Sprinkler Inspection has not been met<br>";
	}
vString += "<br>";

logDebug("Exiting of BuildingCheckConditions ...");

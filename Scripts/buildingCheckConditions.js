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

var varCancelFlag = false;
mBody = "<font size = 4 color=ff000><b>The following condition(s) has(have) not been met:</b></font><br><br>";
if (appHasCondition("Final","Applied","APCD Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","EED Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "EED Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","ESD Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Environmental Health Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Environmental Health Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Facility Services Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Facility Services Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Fire Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Fire Alarm Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Alarm Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Flood Cert. Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Flood Cert. Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Planning Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Planning Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Public Works Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Public Works Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Sewer Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Water Dept. Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Water Dept. Final Condition has not been met<br>";
	}

if (appHasCondition("Final","Applied","Sewer Final Inspection",null)) {
	varCancelFlag = true;
	mBody = mBody + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENG. AND SURVEYING FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","AIR POLLUTION FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","AIR POLLUTION CONTROL FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","APCD FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","APCDFinal",null)) {
	varCancelFlag = true;
	mBody = mBody + "APCD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","BUILDING DEPARTMENT FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Building Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","BUILDING FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Building Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","Defensible Space Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Defensible Space Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","DPW FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Public Works Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","EH FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Environmental Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENGINEERING AND SURVEYING FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","Env Health Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Environmental Health Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENVIRONMENTAL ENGINEERING FINAL INSPECT",null)) {
	varCancelFlag = true;
	mBody = mBody + "Environmental Engineering Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ENVIRONMENTAL HEALTH FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Environmental Health Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","ESD Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "ESD Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FACILITY SERVICES FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Facility Services Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE DEPARTMENT FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Department Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Department Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE SPRINKLER INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Sprinkler Inspection has not been met<br>";
	}

if (appHasCondition(null,"Applied","PLANNING DEPARTMENT FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","PLANING FINAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Planning Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","PUBLIC WORKS FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Public Works Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","SEWER FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","Sewer Final",null)) {
	varCancelFlag = true;
	mBody = mBody + "Sewer Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","WATER DISTRICT FINAL INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Water District Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FEE DEFERRAL",null)) {
	varCancelFlag = true;
	mBody = mBody + "Fee Deferral Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","STREET TREES",null)) {
	varCancelFlag = true;
	mBody = mBody + "Street Trees Final Condition has not been met<br>";
	}

if (appHasCondition(null,"Applied","FIRE DEFENSIBLE INSPECTION",null)) {
	varCancelFlag = true;
	mBody = mBody + "Defensible Space Condition has not been met<br>";
	}

if (appHasCondition("Env Health Final","Applied",null,null)) {
	varCancelFlag = true;
	mBody = mBody + "Environmental Health Condition has not been met<br>";
	}

if (appHasCondition("Planning Final","Applied",null,null)) {
	varCancelFlag = true;
	mBody = mBody + "Planning Final Condition has not been met<br>";
	}

if (appHasCondition("Fire Department Final","Applied",null,null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Department Final Condition has not been met<br>";
	}

if (appHasCondition("Fire Defensible Inspection","Applied",null,null)) {
	varCancelFlag = true;
	mBody = mBody + "Fire Sprinkler Inspection has not been met<br>";
	}

varValidateOn = "Final";
// branch("CreateCollectionOfParcels") replaced with function called below
createCollectionOfParcels();  // custom function deployed to nonprod1 Includes_Custom 1/11/2026
if (varCancelFlag) 
{
	showMessage = true;
	comment(mBody);
	cancel = true;
	/* appHasCondition(cType,cStatus,cDesc,cImpact) cDesc = Condition Name */;
}

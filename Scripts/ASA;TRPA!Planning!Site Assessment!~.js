/*=============================================================================================
| Program : ASA;TRPA!Planning!Site Assessment!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for TRPA Site Assessments
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : Abe 09/26/2025 created script.
|         : Abe 09/26/2025 IT Request# 2014 - updated to copy parcelAttributes to ASI feilds
|
|
/==============================================================================================*/

if (currentUserID == "EAFTAHI") {
    showDebug = 1;
}
logDebug("Running ASA:TRPA; PLANNING; Site ASSESSMENT");

if (AInfo["ParcelAttribute.SUBDIVISION"] != null) {
    editAppSpecific("Subdivision", AInfo["ParcelAttribute.SUBDIVISION"]);
}


if (AInfo["ParcelAttribute.YEAR STRUCTURE BUILT"] != null) {
    editAppSpecific("Year Structure Built", AInfo["ParcelAttribute.YEAR STRUCTURE BUILT"]);

}

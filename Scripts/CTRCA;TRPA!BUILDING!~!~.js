/*=============================================================================================
| Program : CTRCA;TRPA!Building!~!~
| Event   : ConvertToRealCapAfter
|
| Client  : Placer County, CA
| Usage   : for all TRPA Apps
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : EAftahi 05/07/2024 created script
|         : EAftahi 05/07/2024 IT Request# 1865 & 1998 - Adds ad-hoc "ADU Review" & "Addressing" to ADU/JADU Apps
|         : Abe   01/16/2025 IT Req# 2221 Fee deferral - SB937 
|
/=============================================================================================*/

//IT Request# 1865 & 1998
if (publicUser && matches(appTypeArray[3], 'Project', 'TRPA Review at TRPA') && (matches(AInfo["ADU Required"], "Yes") || matches(AInfo["JADU Required"], "Yes"))) {
	addAdHocTask("ADHOC", "Addressing", "", "LDEROBER");
	addAdHocTask("ADHOC", "ADU Review", "", "TLYKINS");
}//End of IT Request# 1865 & 1998


//IT Req# 2221 Fee deferral - SB937 
var isQualified = false;
if (publicUser) {
    if (appTypeArray[2] == "Multi-Family" && matches(appTypeArray[3], "Project", "TRPA Review at TRPA"))
        if ((getAppSpecific("Type of Work") == "Manufactured Home" && (matches(getAppSpecific("Scope of Work"), "Manufactured Home on Foundation", "Manufactured Home on Piers", "Manufactured Home Secondary"))) ||
            (getAppSpecific("Type of Work") == "New" && (matches(getAppSpecific("Scope of Work"), "Accessory Dwelling Unit", "Junior Accessory Dwelling Unit", "Single Family > 3000"))))
            isQualified = true;

    if (appTypeArray[2] == "Non-Residential" && matches(appTypeArray[3], "TRPA Review at TRPA"))
        if ((matches(getAppSpecific("Type of Work"), "Addition", "New", "Rebuild") && (matches(getAppSpecific("Scope of Work"), "Apartment", "Hotel Motel", "Townhome", "Convalescent or Home for the Elderly", "Dormatory or Employee Housing"))))
            isQualified = true;

    if (appTypeArray[2] == "Residential" && appTypeArray[3] == "Project")
        if ((getAppSpecific("Type of Work") == "Addition" && getAppSpecific("Scope of Work") == "Residential Addition > 3000") ||
            (getAppSpecific("Type of Work") == "Manufactured Home" && matches(getAppSpecific("Scope of Work"), "Manufactured Home on Foundation", "Manufactured Home on Piers", "Manufactured Home Secondary")) ||
            (getAppSpecific("Type of Work") == "New" && matches(getAppSpecific("Scope of Work"), "Accessory Dwelling Unit", "Junior Accessory Dwelling Unit", "Single Family > 3000")) ||
            (getAppSpecific("Type of Work") == "Rebuild" && getAppSpecific("Scope of Work") == "Residential Rebuild"))
            isQualified = true;
}
if (isQualified && getAppSpecific("YesToFeeDeferral") == "CHECKED")
    addStdCondition("Building - Prevent Final / Completion", "SB-937 Mitigation Fee Act");

//End of IT Req# 2221 Fee deferral - SB937 
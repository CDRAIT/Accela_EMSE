/*---------------------------------------------------------------------------------------------------
| Program : buildingCheckParcelConditions
| Event   : Called from ISB 
| Client  : Placer County 'Placerco'
| Useage  : replaces EMSE 2.0 rules for prior branch
|
| Notes   : Abe  04/10/2026 Converted from branch ES_BLD_CHECK_COND line# 900: CreateCollectionOfParcels 
|
|
/----------------------------------------------------------------------------------------------------*/

var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
var varParcels = capParcelResult.getOutput().toArray();
if (varParcels && varParcels.length > 0)
    for (varEachParcel in varParcels) {
        //branch("CreateCollectionOfParcelConditions");
        var varParcelNumber = varParcels[varEachParcel].getParcelNumber();
        var varParcelConditions = aa.parcelCondition.getParcelConditions(varParcelNumber);
        var varConditions = varParcelConditions.getOutput();
        if (varConditions != null && varConditions.length > 0)
            for (varEachCondition in varConditions) {
                //branch("ValidateParcelConditions");
                var varCondTypeCode = varConditions[varEachCondition].getConditionType();
                var varCondStatus = varConditions[varEachCondition].getConditionStatus();
                var varCondDesc = varConditions[varEachCondition].getConditionDescription();
                if (varCondTypeCode == "Parcel" && varCondDesc == "FEE DEFERRAL" && varCondStatus == "Applied") {
                    vString += "<font size = 4 color=ff000>This permit cannot be finaled because the <b>Fee Deferral Condition</b> has not been met.</font><br><br>";
                    vCancelFlag = true;
                }
                if (varCondStatus == "Applied" &&
                    (varCondTypeCode == "Building - Prevent Final / Completion" ||
                        varCondTypeCode == "Planning - Prevent Final / Completion" ||
                        varCondTypeCode == "ESD - Prevent Final / Completion" ||
                        varCondTypeCode == "Env. Engineering - Prevent Final / Completion" ||
                        varCondTypeCode == "Code Compliance - Prevent Final / Completion" ||
                        varCondTypeCode == "Env. Health - Prevent Final / Completion" ||
                        varCondTypeCode == "DPW - Prevent Final / Completion" ||
                        varCondTypeCode == "Fire - Prevent Final / Completion" ||
                        varCondTypeCode == "Other - Prevent Final / Completion")) {

                    vString += "<font size = 4 color=ff000>This permit cannot be finaled because the all Parcel Conditions have not been met.</font><br><br>";
                    vCancelFlag = true;
                }
            }
    }

    logDebug("End of buildingCheckParcelConditions");
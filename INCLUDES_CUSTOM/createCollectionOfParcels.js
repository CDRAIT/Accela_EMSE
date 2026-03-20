function createCollectionOfParcels()
{
	var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	varParcels = capParcelResult.getOutput().toArray();
	if (varParcels != null) 
	{
		for (varEachParcel in varParcels)
		{
			// converted from branch CreateCollectionOfParcelConditions
			varParcelNumber = varParcels[varEachParcel].getParcelNumber();
			varParcelConditions = aa.parcelCondition.getParcelConditions(varParcelNumber);
			varConditions = varParcelConditions.getOutput();
			if (varConditions != null) 
			{
				for (varEachCondition in varConditions)
				{
					// converted from branch ValidateParcelConditions
					varCondTypeCode = varConditions[varEachCondition].getConditionType();
					varCondStatus = varConditions[varEachCondition].getConditionStatus();
					varCondDesc = varConditions[varEachCondition].getConditionDescription();
					if (varValidateOn == "Issue" && varCondTypeCode == "Parcel" && varCondDesc == "Hopkins Village Affordable Housing" && varCondStatus == "Applied") 
					{
						showMessage = true;
						comment("<font size = 4 color=ff000>This permit cannot be issued because the <b>Hopkins Village Affordable Housing Condition</b> has not been met</font>");
						cancel = true;
					}

					if (varValidateOn == "Issue" && varCondStatus == "Applied" && (varCondTypeCode == "Building - Prevent Issuance / Approval" || varCondTypeCode == "Planning - Prevent Issuance / Approval" || varCondTypeCode == "ESD - Prevent Issuance / Approval" || varCondTypeCode == "Env. Engineering - Prevent Issuance / Approval" || varCondTypeCode == "Code Compliance - Prevent Issuance / Approval" || varCondTypeCode == "Env. Health - Prevent Issuance / Approval" || varCondTypeCode == "DPW - Prevent Issuance / Approval" || varCondTypeCode == "Fire - Prevent Issuance / Approval" || varCondTypeCode == "Other - Prevent Issuance / Approval")) 
					{
						showMessage = true;
						comment("<font size = 4 color=ff000><b>There are applied Parcel Conditions that must be cleared before proceeding.</b></font><br><br>");
						cancel = true;
					}

					if (varValidateOn == "Final" && varCondTypeCode == "Parcel" && varCondDesc == "FEE DEFERRAL" && varCondStatus == "Applied") 
					{
						showMessage = true;
						comment("<font size = 4 color=ff000>This permit cannot be finaled because the <b>Fee Deferral Condition</b> has not been met.</font>");
						cancel = true;
					}

					if (varValidateOn == "Final" && varCondStatus == "Applied" && (varCondTypeCode == "Building - Prevent Final / Completion" || varCondTypeCode == "Planning - Prevent Final / Completion" || varCondTypeCode == "ESD - Prevent Final / Completion" || varCondTypeCode == "Env. Engineering - Prevent Final / Completion" || varCondTypeCode == "Code Compliance - Prevent Final / Completion" || varCondTypeCode == "Env. Health - Prevent Final / Completion" || varCondTypeCode == "DPW - Prevent Final / Completion" || varCondTypeCode == "Fire - Prevent Final / Completion" || varCondTypeCode == "Other - Prevent Final / Completion")) 
					{
						showMessage = true;
						comment("<font size = 4 color=ff000>This permit cannot be finaled because the all Parcel Conditions have not been met.</font>");
						cancel = true;
					}
				}
			}
		}
	}
}
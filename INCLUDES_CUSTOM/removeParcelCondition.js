// There is a bug in the current internal function so Keith added the repaired function here
function removeParcelCondition(parcelNum,cType,cDesc)
//if parcelNum is null, condition is added to all parcels on CAP
	{
	if (!parcelNum)
		{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				parcelNum = Parcels[zz].getParcelNumber()
				logDebug("Removing Condition to parcel #" + zz + " = " + parcelNum);
				var pcResult = aa.parcelCondition.getParcelConditions(parcelNum);
				if (!pcResult.getSuccess())
					{ logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()) ; return false }
				var pcs = pcResult.getOutput();
				for (pc1 in pcs)
					{
						if (pcs[pc1].getConditionType().equals(cType) && pcs[pc1].getConditionDescription().equals(cDesc))
						{
							var rmParcelCondResult = aa.parcelCondition.removeParcelCondition(pcs[pc1].getConditionNumber(),parcelNum); 
							if (rmParcelCondResult.getSuccess())
								logDebug("Successfully removed condition to Parcel " + parcelNum + "  (" + cType + ") " + cDesc);
							else
								logDebug( "**ERROR: removing condition to Parcel " + parcelNum + "  (" + cType + "): ");
						}
					}
				}
			}
		}
	else
		{
		var pcResult = aa.parcelCondition.getParcelConditions(parcelNum);
		if (!pcResult.getSuccess())
			{ logDebug("**WARNING: error getting parcel conditions : " + pcResult.getErrorMessage()) ; return false }
		var pcs = pcResult.getOutput();
		for (pc1 in pcs)
			{
			if (pcs[pc1].getConditionType().equals(cType) && pcs[pc1].getConditionDescription().equals(cDesc))
				{
					var rmParcelCondResult = aa.parcelCondition.removeParcelCondition(pcs[pc1].getConditionNumber(),parcelNum); 
			    if (rmParcelCondResult.getSuccess())
						logDebug("Successfully removed condition to Parcel " + parcelNum + "  (" + cType + ") " + cDesc);
					else
						logDebug( "**ERROR: removing condition to Parcel " + parcelNum + "  (" + cType + "): ");
				}
			}
		}
	}

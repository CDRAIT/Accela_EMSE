//ApplicationSubmitAfter4Renew  ** For SAC County **
//Set incomleted CAPID (CAP id)  for test.    
//Unit Test Parameters --> begin
//aa.env.setValue("PermitId1", "07EST");
//aa.env.setValue("PermitId2", "00000");
//aa.env.setValue("PermitId3", "00103");


// Show Debug Message
var showMessage = false;	// Set to true to see results in popup window
var showDebug = false;		// Set to true to see debug messages in popup window

var message = "";		// Message String
var debug = "";			// Debug String
var br = "<BR>";		// Break Tag

// -------------------------------------------------------------------------------------------------

//Set partent CAPID for test.
//var parentCapIDModel = aa.cap.getCapIDModel("07WEN", "00000", "00011");
//aa.env.setValue("ParentCapID", parentCapIDModel.getOutput());
//Unit Test Parameter --> end 

var partialCapId = getIncompleteCapId();
var parentCapId = aa.env.getValue("ParentCapID");

//1. Check to see if license is ready for renew
logDebug("At Step 1");
if (isRenewProcess(parentCapId, partialCapId))
{
	logDebug("CAPID(" + parentCapId + ") is ready for renew. PartialCap (" + partialCapId + ")");
	//2. Associate partial cap with parent CAP.
	var result = aa.cap.createRenewalCap(parentCapId, partialCapId, true);
	logDebug("At Step 2");
	if (result.getSuccess())
	{
		//3. Copy key information from parent license to partial cap
		copyKeyInfo(parentCapId, partialCapId);
		logDebug("At Step 3");
		//4. Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow that it is searched by ACA user.
		aa.cap.updateAccessByACA(partialCapId, "Y");
		logDebug("At Step 4");
	}
	else
	{
		logDebug("ERROR: Associate partial cap with parent CAP. " + result.getErrorMessage());
	}
}
//aa.env.setValue("ScriptReturnCode","0");
//aa.env.setValue("ScriptReturnMessage", "ApplicationSubmitAfter4Renew perform renewal process.");
message = "ApplicationSubmitAfter4Renew perform renewal process is finished.";

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
	}
else
	{
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
	}

function logDebug(dstr)
	{
	debug+=dstr + br;
	}

function logMessage(dstr)
	{
	message+=dstr + br;
	}
	

function isRenewProcess(parentCapID, partialCapID)
{
	//1. Check to see parent CAP ID is null.
	if (parentCapID == null || partialCapID == null 
		|| aa.util.instanceOfString(parentCapID))
	{
		return false;
	}
	//2. Get CAPModel by PK for partialCAP.
	var result = aa.cap.getCap(partialCapID);
	if(result.getSuccess())
	{
		capScriptModel = result.getOutput();
		//2.1. Check to see if it is partial CAP.	
		if (capScriptModel.isCompleteCap())
		{
			logDebug("ERROR: It is not partial CAP(" + capScriptModel.getCapID() + ")");
			return false;
		}
	}
	else
	{
		logDebug("ERROR: Fail to get CAPModel (" + partialCapID + "): " + result.getErrorMessage());
		return false;
	}
	//3.  Check to see if the renewal was initiated before. 
	result = aa.cap.getProjectByMasterID(parentCapID, "Renewal", "Incomplete");
	if(result.getSuccess())
	{
		partialProjects = result.getOutput();
		if (partialProjects != null && partialProjects.length > 0)
		{
			//Avoid to initiate renewal process multiple times.
			logDebug("Warning: Renewal process was initiated before. ( "+ parentCapID + ")");
			return false;
		}
		
	}
	//4 . Check to see if parent CAP is ready for renew.
	return isReadyRenew(parentCapID);
}

function isReadyRenew(capid)
{
	if (capid == null || aa.util.instanceOfString(capid))
	{
		return false;
	}
	var result = aa.expiration.isExpiredLicenses(capid);
    if(result.getSuccess())
	{
		return true;
	}  
    else 
    {
      logDebug("ERROR: Failed to get expiration with CAP(" + capid + "): " + result.getErrorMessage());
    }
	return false;
}

function getIncompleteCapId()  
{
    var s_id1 = aa.env.getValue("PermitId1");
    var s_id2 = aa.env.getValue("PermitId2");
    var s_id3 = aa.env.getValue("PermitId3");

    var result = aa.cap.getCapIDModel(s_id1, s_id2, s_id3);
    if(result.getSuccess())
	{
      return result.getOutput();
	}  
    else 
    {
      logDebug("ERROR: Failed to get capId: " + result.getErrorMessage());
      return null;
    }
}


function copyKeyInfo(srcCapId, targetCapId)
{
	//copy ASI infomation
	editAppSpecific("Permit Number",getAppSpecific("Permit Number",srcCapId),targetCapId);
	editAppSpecific("Stack Height (ft)",getAppSpecific("Stack Height (ft)",srcCapId),targetCapId);
	editAppSpecific("Stack Diameter (ft)",getAppSpecific("Stack Diameter (ft)",srcCapId),targetCapId);
	editAppSpecific("Exhaust Flow (ACFM)",getAppSpecific("Exhaust Flow (ACFM)",srcCapId),targetCapId);
	editAppSpecific("Exhaust Temperature (F)",getAppSpecific("Exhaust Temperature (F)",srcCapId),targetCapId);
	editAppSpecific("Location (longitude)",getAppSpecific("Location (longitude)",srcCapId),targetCapId);
	editAppSpecific("Location (latitude)",getAppSpecific("Location (latitude)",srcCapId),targetCapId);
	editAppSpecific("Manufacturer",getAppSpecific("Manufacturer",srcCapId),targetCapId);
	editAppSpecific("Model",getAppSpecific("Model",srcCapId),targetCapId);
	editAppSpecific("Max Rated Horsepower (bhp)",getAppSpecific("Power Rating",srcCapId),targetCapId);
	editAppSpecific("Fuel Type",getAppSpecific("Fuel Type",srcCapId),targetCapId);
	editAppSpecific("Fuel Usage Units",getAppSpecific("Fuel Usage Units",srcCapId),targetCapId);
	editAppSpecific("Max Hourly Fuel Usage",getAppSpecific("Max Hourly Fuel Usage",srcCapId),targetCapId);
	editAppSpecific("Max Heat Input Rating (MMBtu/hr)",getAppSpecific("Max Heat Input Rating (MMBtu/hr)",srcCapId),targetCapId);
	editAppSpecific("Device ID",getAppSpecific("Device ID",srcCapId),targetCapId);
	editAppSpecific("Stack ID",getAppSpecific("Device ID",srcCapId) + getAppSpecific("Process ID",srcCapId),targetCapId);
	editAppSpecific("Engine Description",getAppSpecific("Engine Description",srcCapId),targetCapId);
         //copy License infomation
	// copyLicenseProfessional(srcCapId, targetCapId);
	//copy Address infomation
	  copyAddress(srcCapId, targetCapId);
	//copy AST infomation
	//  copyAppSpecificTable(srcCapId, targetCapId);
	//copy Parcel infomation
	//  copyParcel(srcCapId, targetCapId);
	//copy People infomation
	  copyPeople(srcCapId, targetCapId);
	//copy Owner infomation
	  copyOwner(srcCapId, targetCapId);
	//Copy CAP condition information
	  //copyCapCondition(srcCapId, targetCapId);
	//Copy additional info.
	//  copyAdditionalInfo(srcCapId, targetCapId);
	//Copy Education information.
	  //copyEducation(srcCapId, targetCapId);
	//Copy Continuing Education information.
	  //copyContEducation(srcCapId, targetCapId);
	//Copy Examination information.
	  //copyExamination(srcCapId, targetCapId);
	//Copy Application Name.
          copyApplicationName(srcCapId, targetCapId);
	//Copy Work Description.
          copyDetailedDescription(srcCapId, targetCapId);
}



function copyDetailedDescription(srcCapId, targetCapId)
{
    //1. Get CapWorkDesModel with source CAPID.
    var srcCapWorkDesModel = getCapWorkDesModel(srcCapId);
    if (srcCapWorkDesModel == null)
    {
        return;
    }
    //2. Copy Detailed Description from source to target.
    var targetCapWorkDesModel = srcCapWorkDesModel.getCapWorkDesModel();
    targetCapWorkDesModel.setCapID(targetCapId);
    aa.cap.createCapWorkDes(targetCapWorkDesModel);
}


function getCapWorkDesModel(capId)
{
	capWorkDesModel = null;
	var s_result = aa.cap.getCapWorkDesByPK(capId);
	if(s_result.getSuccess())
	{
		capWorkDesModel = s_result.getOutput();
	}
	else
	{
		aa.print("ERROR: Failed to get CapWorkDesModel: " + s_result.getErrorMessage());
		capWorkDesModel = null;	
	}
	return capWorkDesModel;
}


function copyApplicationName(srcCapId, targetCapId)
{
	//1. Get CapModel with source CAPID.
	var srcCapModel = getCapModel(srcCapId, true);
	if (srcCapModel == null)
	{
		return;
	}
	//2. Get CapModel with target CAPID.
	var targetCapModel = getCapModel(targetCapId, true);
	if (targetCapModel == null)
	{
		return;
	}
	//3. Copy application name from source to target.
	var srcCapName = srcCapModel.getSpecialText();
	targetCapModel.setSpecialText(srcCapName);
	aa.cap.editCapByPK(targetCapModel);
}

function getCapModel(capId, isActive)
{
	capModel = null;
	//If the isActive is true, it will return the active CAP. 
	//If the isActive is false, it will return the active or inactive CAP. 
	var s_result = aa.cap.getCapByPK(capId, isActive);
	if(s_result.getSuccess())
	{
		capModel = s_result.getOutput();
	}
	else
	{
		aa.print("ERROR: Failed to get CapModel: " + s_result.getErrorMessage());
		capModel = null;	
	}
	return capModel;
}



function copyEducation(srcCapId, targetCapId)
{
	if(srcCapId != null && targetCapId != null)
	{
		aa.education.copyEducationList(srcCapId, targetCapId);
	}
}

function copyContEducation(srcCapId, targetCapId)
{
	if(srcCapId != null && targetCapId != null)
	{
		aa.continuingEducation.copyContEducationList(srcCapId, targetCapId);
	}
}

function copyExamination(srcCapId, targetCapId)
{
	if(srcCapId != null && targetCapId != null)
	{
		aa.examination.copyExaminationList(srcCapId, targetCapId);
	}
}

function copyAppSpecificInfo(srcCapId, targetCapId)
{
	//1. Get Application Specific Information with source CAPID.
	var  appSpecificInfo = getAppSpecificInfo(srcCapId);
	if (appSpecificInfo == null || appSpecificInfo.length == 0)
	{
		return;
	}
	//2. Set target CAPID to source Specific Information.
	for (loopk in appSpecificInfo)
	{
		var sourceAppSpecificInfoModel = appSpecificInfo[loopk];
		
		sourceAppSpecificInfoModel.setPermitID1(targetCapId.getID1());
		sourceAppSpecificInfoModel.setPermitID2(targetCapId.getID2());
		sourceAppSpecificInfoModel.setPermitID3(targetCapId.getID3());	
		//3. Edit ASI on target CAP (Copy info from source to target)
		aa.appSpecificInfo.editAppSpecInfoValue(sourceAppSpecificInfoModel);
	}
}


function getAppSpecificInfo(capId)
{
	capAppSpecificInfo = null;
	var s_result = aa.appSpecificInfo.getByCapID(capId);
	if(s_result.getSuccess())
	{
		capAppSpecificInfo = s_result.getOutput();
		if (capAppSpecificInfo == null || capAppSpecificInfo.length == 0)
		{
			logDebug("WARNING: no appSpecificInfo on this CAP:" + capId);
			capAppSpecificInfo = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to appSpecificInfo: " + s_result.getErrorMessage());
		capAppSpecificInfo = null;	
	}
	// Return AppSpecificInfoModel[] 
	return capAppSpecificInfo;
}

function copyLicenseProfessional(srcCapId, targetCapId)
{
	//1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessional(srcCapId);
	if (capLicenses == null || capLicenses.length == 0)
	{
		return;
	}
	//2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessional(targetCapId);
	//3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses)
	{
		sourcelicProfModel = capLicenses[loopk];
		//3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		targetLicProfModel = null;
		//3.2 Check to see if sourceLicProf exist.
		if (targetLicenses != null && targetLicenses.length > 0)
		{
			for (loop2 in targetLicenses)
			{
				if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
				{
					targetLicProfModel = targetLicenses[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched licProf model.
		if (targetLicProfModel != null)
		{
			//3.3.1 Copy information from source to target.
			aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
			//3.3.2 Edit licProf with source licProf information. 
			aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
		}
		//3.4 It is new licProf model.
		else
		{
			//3.4.1 Create new license professional.
			aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
		}
	}
}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2)
{
	if (licProfScriptModel1 == null || licProfScriptModel2 == null)
	{
		return false;
	}
	if (licProfScriptModel1.getLicenseType().equals(licProfScriptModel2.getLicenseType())
		&& licProfScriptModel1.getLicenseNbr().equals(licProfScriptModel2.getLicenseNbr()))
	{
		return true;
	}
	return	false;
}

function getLicenseProfessional(capId)
{
	capLicenseArr = null;
	var s_result = aa.licenseProfessional.getLicenseProf(capId);
	if(s_result.getSuccess())
	{
		capLicenseArr = s_result.getOutput();
		if (capLicenseArr == null || capLicenseArr.length == 0)
		{
			logDebug("WARNING: no licensed professionals on this CAP:" + capId);
			capLicenseArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to license professional: " + s_result.getErrorMessage());
		capLicenseArr = null;	
	}
	return capLicenseArr;
}


function copyAddress(srcCapId, targetCapId)
{
	//1. Get address with source CAPID.
	var capAddresses = getAddress(srcCapId);
	if (capAddresses == null || capAddresses.length == 0)
	{
		return;
	}
	//2. Get addresses with target CAPID.
	var targetAddresses = getAddress(targetCapId);
	//3. Check to see which address is matched in both source and target.
	for (loopk in capAddresses)
	{
		sourceAddressfModel = capAddresses[loopk];
		//3.1 Set target CAPID to source address.
		sourceAddressfModel.setCapID(targetCapId);
		targetAddressfModel = null;
		//3.2 Check to see if sourceAddress exist.
		if (targetAddresses != null && targetAddresses.length > 0)
		{
			for (loop2 in targetAddresses)
			{
				if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2]))
				{
					targetAddressfModel = targetAddresses[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched address model.
		if (targetAddressfModel != null)
		{
		
			//3.3.1 Copy information from source to target.
			aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
			//3.3.2 Edit address with source address information. 
			aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
		}
		//3.4 It is new address model.
		else
		{	
			//3.4.1 Create new address.
			aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
		}
	}
}

function isMatchAddress(addressScriptModel1, addressScriptModel2)
{
	if (addressScriptModel1 == null || addressScriptModel2 == null)
	{
		return false;
	}
	var streetName1 = addressScriptModel1.getStreetName();
	var streetName2 = addressScriptModel2.getStreetName();
	if ((streetName1 == null && streetName2 != null) 
		|| (streetName1 != null && streetName2 == null))
	{
		return false;
	}
	if (streetName1 != null && !streetName1.equals(streetName2))
	{
		return false;
	}
	return true;
}

function getAddress(capId)
{
	capAddresses = null;
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses == null || capAddresses.length == 0)
		{
			logDebug("WARNING: no addresses on this CAP:" + capId);
			capAddresses = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to address: " + s_result.getErrorMessage());
		capAddresses = null;	
	}
	return capAddresses;
}

function copyAppSpecificTable(srcCapId, targetCapId)
{
	var tableNameArray = getTableName(srcCapId);
	if (tableNameArray == null)
	{
		return;
	}
	for (loopk in tableNameArray)
	{
		var tableName = tableNameArray[loopk];
		//1. Get appSpecificTableModel with source CAPID
		var targetAppSpecificTable = getAppSpecificTable(srcCapId,tableName);
		
		//2. Edit AppSpecificTableInfos with target CAPID
		var aSTableModel = null;
		if(targetAppSpecificTable == null)
		{
			return;
		}
		else
		{
		    aSTableModel = targetAppSpecificTable.getAppSpecificTableModel();
		}
		aa.appSpecificTableScript.editAppSpecificTableInfos(aSTableModel,targetCapId,null);
	}
	
}

function getTableName(capId)
{
	var tableName = null;
	var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
	if(result.getSuccess())
	{
		tableName = result.getOutput();
		if(tableName!=null)
		{
			return tableName;
		}
	}
	return tableName;
}

function getAppSpecificTable(capId,tableName)
{
	appSpecificTable = null;
	var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
	if(s_result.getSuccess())
	{
		appSpecificTable = s_result.getOutput();
		if (appSpecificTable == null || appSpecificTable.length == 0)
		{
			logDebug("WARNING: no appSpecificTable on this CAP:" + capId);
			appSpecificTable = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
		appSpecificTable = null;	
	}
	return appSpecificTable;
}

function copyParcel(srcCapId, targetCapId)
{
	//1. Get parcels with source CAPID.
	var copyParcels = getParcel(srcCapId);
	if (copyParcels == null || copyParcels.length == 0)
	{
		return;
	}
	//2. Get parcel with target CAPID.
	var targetParcels = getParcel(targetCapId);
	//3. Check to see which parcel is matched in both source and target.
	for (i = 0; i < copyParcels.size(); i++)
	{
		sourceParcelModel = copyParcels.get(i);
		//3.1 Set target CAPID to source parcel.
		sourceParcelModel.setCapID(targetCapId);
		targetParcelModel = null;
		//3.2 Check to see if sourceParcel exist.
		if (targetParcels != null && targetParcels.size() > 0)
		{
			for (j = 0; j < targetParcels.size(); j++)
			{
				if (isMatchParcel(sourceParcelModel, targetParcels.get(j)))
				{
					targetParcelModel = targetParcels.get(j);
					break;
				}
			}
		}
		//3.3 It is a matched parcel model.
		if (targetParcelModel != null)
		{
			//3.3.1 Copy information from source to target.
			var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput();
			var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, targetParcelModel).getOutput();
			aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
			//3.3.2 Edit parcel with sourceparcel. 
			aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
		}
		//3.4 It is new parcel model.
		else
		{
			//3.4.1 Create new parcel.
			aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput());
		}
	}
}

function isMatchParcel(parcelScriptModel1, parcelScriptModel2)
{
	if (parcelScriptModel1 == null || parcelScriptModel2 == null)
	{
		return false;
	}
	if (parcelScriptModel1.getParcelNumber().equals(parcelScriptModel2.getParcelNumber()))
	{
		return true;
	}
	return	false;
}

function getParcel(capId)
{
	capParcelArr = null;
	var s_result = aa.parcel.getParcelandAttribute(capId, null);
	if(s_result.getSuccess())
	{
		capParcelArr = s_result.getOutput();
		if (capParcelArr == null || capParcelArr.length == 0)
		{
			logDebug("WARNING: no parcel on this CAP:" + capId);
			capParcelArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to parcel: " + s_result.getErrorMessage());
		capParcelArr = null;	
	}
	return capParcelArr;
}

function copyPeople(srcCapId, targetCapId)
{
	//1. Get people with source CAPID.
	var capPeoples = getPeople(srcCapId);
	if (capPeoples == null || capPeoples.length == 0)
	{
		return;
	}
	//2. Get people with target CAPID.
	var targetPeople = getPeople(targetCapId);
	//3. Check to see which people is matched in both source and target.
	for (loopk in capPeoples)
	{
		sourcePeopleModel = capPeoples[loopk];
		//3.1 Set target CAPID to source people.
		sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
		targetPeopleModel = null;
		//3.2 Check to see if sourcePeople exist.
		if (targetPeople != null && targetPeople.length > 0)
		{
			for (loop2 in targetPeople)
			{
				if (isMatchPeople(sourcePeopleModel, targetPeople[loop2]))
				{
					targetPeopleModel = targetPeople[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched people model.
		if (targetPeopleModel != null)
		{
			//3.3.1 Copy information from source to target.
			aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
			//3.3.2 Edit People with source People information. 
			aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
		}
		//3.4 It is new People model.
		else
		{
			//3.4.1 Create new people.
			aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
		}
	}
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2)
{
	if (capContactScriptModel == null || capContactScriptModel2 == null)
	{
		return false;
	}
	var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
	var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
	var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
	var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
	var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
	var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
	var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
	var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
	if ((contactType1 == null && contactType2 != null) 
		|| (contactType1 != null && contactType2 == null))
	{
		return false;
	}
	if (contactType1 != null && !contactType1.equals(contactType2))
	{
		return false;
	}
	if ((firstName1 == null && firstName2 != null) 
		|| (firstName1 != null && firstName2 == null))
	{
		return false;
	}
	if (firstName1 != null && !firstName1.equals(firstName2))
	{
		return false;
	}
	if ((lastName1 == null && lastName2 != null) 
		|| (lastName1 != null && lastName2 == null))
	{
		return false;
	}
	if (lastName1 != null && !lastName1.equals(lastName2))
	{
		return false;
	}
	if ((fullName1 == null && fullName2 != null) 
		|| (fullName1 != null && fullName2 == null))
	{
		return false;
	}
	if (fullName1 != null && !fullName1.equals(fullName2))
	{
		return false;
	}
	return	true;
}

function getPeople(capId)
{
	capPeopleArr = null;
	var s_result = aa.people.getCapContactByCapID(capId);
	if(s_result.getSuccess())
	{
		capPeopleArr = s_result.getOutput();
		if (capPeopleArr == null || capPeopleArr.length == 0)
		{
			logDebug("WARNING: no People on this CAP:" + capId);
			capPeopleArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
		capPeopleArr = null;	
	}
	return capPeopleArr;
}

function copyOwner(srcCapId, targetCapId)
{
	//1. Get Owners with source CAPID.
	var capOwners = getOwner(srcCapId);
	if (capOwners == null || capOwners.length == 0)
	{
		return;
	}
	//2. Get Owners with target CAPID.
	var targetOwners = getOwner(targetCapId);
	//3. Check to see which owner is matched in both source and target.
	for (loopk in capOwners)
	{
		sourceOwnerModel = capOwners[loopk];
		//3.1 Set target CAPID to source Owner.
		sourceOwnerModel.setCapID(targetCapId);
		targetOwnerModel = null;
		//3.2 Check to see if sourceOwner exist.
		if (targetOwners != null && targetOwners.length > 0)
		{
			for (loop2 in targetOwners)
			{
				if (isMatchOwner(sourceOwnerModel, targetOwners[loop2]))
				{
					targetOwnerModel = targetOwners[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched owner model.
		if (targetOwnerModel != null)
		{
			//3.3.1 Copy information from source to target.
			aa.owner.copyCapOwnerModel(sourceOwnerModel, targetOwnerModel);
			//3.3.2 Edit owner with source owner information. 
			aa.owner.updateDailyOwnerWithAPOAttribute(targetOwnerModel);
		}
		//3.4 It is new owner model.
		else
		{
			//3.4.1 Create new Owner.
			aa.owner.createCapOwnerWithAPOAttribute(sourceOwnerModel);
		}
	}
}

function isMatchOwner(ownerScriptModel1, ownerScriptModel2)
{
	if (ownerScriptModel1 == null || ownerScriptModel2 == null)
	{
		return false;
	}
	var fullName1 = ownerScriptModel1.getOwnerFullName();
	var fullName2 = ownerScriptModel2.getOwnerFullName();
	if ((fullName1 == null && fullName2 != null) 
		|| (fullName1 != null && fullName2 == null))
	{
		return false;
	}
	if (fullName1 != null && !fullName1.equals(fullName2))
	{
		return false;
	}
	return	true;
}

function getOwner(capId)
{
	capOwnerArr = null;
	var s_result = aa.owner.getOwnerByCapId(capId);
	if(s_result.getSuccess())
	{
		capOwnerArr = s_result.getOutput();
		if (capOwnerArr == null || capOwnerArr.length == 0)
		{
			logDebug("WARNING: no Owner on this CAP:" + capId);
			capOwnerArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to Owner: " + s_result.getErrorMessage());
		capOwnerArr = null;	
	}
	return capOwnerArr;
}

function copyCapCondition(srcCapId, targetCapId)
{
	//1. Get Cap condition with source CAPID.
	var capConditions = getCapConditionByCapID(srcCapId);
	if (capConditions == null || capConditions.length == 0)
	{
		return;
	}
	//2. Get Cap condition with target CAPID.
	var targetCapConditions = getCapConditionByCapID(targetCapId);
	//3. Check to see which Cap condition is matched in both source and target.
	for (loopk in capConditions)
	{
		sourceCapCondition = capConditions[loopk];
		//3.1 Set target CAPID to source Cap condition.
		sourceCapCondition.setCapID(targetCapId);
		targetCapCondition = null;
		//3.2 Check to see if source Cap condition exist in target CAP. 
		if (targetCapConditions != null && targetCapConditions.length > 0)
		{
			for (loop2 in targetCapConditions)
			{
				if (isMatchCapCondition(sourceCapCondition, targetCapConditions[loop2]))
				{
					targetCapCondition = targetCapConditions[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched Cap condition model.
		if (targetCapCondition != null)
		{
			//3.3.1 Copy information from source to target.
			sourceCapCondition.setConditionNumber(targetCapCondition.getConditionNumber());
			//3.3.2 Edit Cap condition with source Cap condition information. 
			aa.capCondition.editCapCondition(sourceCapCondition);
		}
		//3.4 It is new Cap condition model.
		else
		{
			//3.4.1 Create new Cap condition.
			aa.capCondition.createCapCondition(sourceCapCondition);
		}
	}
}

function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2)
{
	if (capConditionScriptModel1 == null || capConditionScriptModel2 == null)
	{
		return false;
	}
	var description1 = capConditionScriptModel1.getConditionDescription();
	var description2 = capConditionScriptModel2.getConditionDescription();
	if ((description1 == null && description2 != null) 
		|| (description1 != null && description2 == null))
	{
		return false;
	}
	if (description1 != null && !description1.equals(description2))
	{
		return false;
	}
	var conGroup1 = capConditionScriptModel1.getConditionGroup();
	var conGroup2 = capConditionScriptModel2.getConditionGroup();
	if ((conGroup1 == null && conGroup2 != null) 
		|| (conGroup1 != null && conGroup2 == null))
	{
		return false;
	}
	if (conGroup1 != null && !conGroup1.equals(conGroup2))
	{
		return false;
	}
	return true;
}

function getCapConditionByCapID(capId)
{
	capConditionScriptModels = null;
	
	var s_result = aa.capCondition.getCapConditions(capId);
	if(s_result.getSuccess())
	{
		capConditionScriptModels = s_result.getOutput();
		if (capConditionScriptModels == null || capConditionScriptModels.length == 0)
		{
			logDebug("WARNING: no cap condition on this CAP:" + capId);
			capConditionScriptModels = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to get cap condition: " + s_result.getErrorMessage());
		capConditionScriptModels = null;	
	}
	return capConditionScriptModels;
}

function copyAdditionalInfo(srcCapId, targetCapId)
{
	//1. Get Additional Information with source CAPID.  (BValuatnScriptModel)
	var  additionalInfo = getAdditionalInfo(srcCapId);
	if (additionalInfo == null)
	{
		return;
	}
	//2. Get CAP detail with source CAPID.
	var  capDetail = getCapDetailByID(srcCapId);
	//3. Set target CAP ID to additional info.
	additionalInfo.setCapID(targetCapId);
	if (capDetail != null)
	{
		capDetail.setCapID(targetCapId);
	}
	//4. Edit or create additional infor for target CAP.
	aa.cap.editAddtInfo(capDetail, additionalInfo);
}

//Return BValuatnScriptModel for additional info.
function getAdditionalInfo(capId)
{
	bvaluatnScriptModel = null;
	var s_result = aa.cap.getBValuatn4AddtInfo(capId);
	if(s_result.getSuccess())
	{
		bvaluatnScriptModel = s_result.getOutput();
		if (bvaluatnScriptModel == null)
		{
			logDebug("WARNING: no additional info on this CAP:" + capId);
			bvaluatnScriptModel = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
		bvaluatnScriptModel = null;	
	}
	// Return bvaluatnScriptModel
	return bvaluatnScriptModel;
}

function getCapDetailByID(capId)
{
	capDetailScriptModel = null;
	var s_result = aa.cap.getCapDetail(capId);
	if(s_result.getSuccess())
	{
		capDetailScriptModel = s_result.getOutput();
		if (capDetailScriptModel == null)
		{
			logDebug("WARNING: no cap detail on this CAP:" + capId);
			capDetailScriptModel = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
		capDetailScriptModel = null;	
	}
	// Return capDetailScriptModel
	return capDetailScriptModel;
}
function editAppSpecific(itemName,itemValue,itemCap)  // optional: itemCap
{
	useAppSpecificGroupName = false;
	var updated = false;
	var i=0;
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)

			{
                          logMessage("**WARNING","CAP # " + customId +", editAppSpecific requires group name prefix when useAppSpecificGroupName is true");
                          //logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ;
                          return false;
                        }

		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	
   	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "")
		{
			while (i < appspecObj.length && !updated)
			{
				if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
				{
					appspecObj[i].setChecklistComment(itemValue);
						
					var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
					if (actionResult.getSuccess()) 
					{	
                                                //logMessage("INFO","CAP # " + customId +", App spec info item " + itemName + " has been given a value of " + itemValue);
						//logDebug("app spec info item " + itemName + " has been given a value of " + itemValue);
					}
					else 
					{
                                                //logMessage("**ERROR","CAP # " + customId +", Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " +   actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
						//logDebug("**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " +   actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
					}
						
					updated = true;
					//AInfo[itemName] = itemValue;  // Update array used by this script
				}

				i++;
				
			} // while loop
		} // item name blank
	} // got app specific object	
	else
	{ 
		logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
	}
}//End Function
function getAppSpecific(itemName,itemCap)  // optional: itemCap
{
	useAppSpecificGroupName = false;
	var updated = false;
	var i=0;
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}
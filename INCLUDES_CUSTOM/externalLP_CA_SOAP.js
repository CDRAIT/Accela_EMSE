function externalLP_CA_SOAP(licNum, rlpType, doPopulateRef, doPopulateTrx, itemCap) {
	/*
	Version: 3.2 - TruePoint Solutions

	Usage:

	licNum		:  Valid CA license number.   Non-alpha, max 8 characters.  If null, function will use the LPs on the supplied CAP ID
	rlpType		:  License professional type to use when validating and creating new LPs
	doPopulateRef 	:  If true, will create/refresh a reference LP of this number/type
	doPopulateTrx 	:  If true, will copy create/refreshed reference LPs to the supplied Cap ID.   doPopulateRef must be true for this to work
	itemCap		:  If supplied, licenses on the CAP will be validated.  Also will be refreshed if doPopulateRef and doPopulateTrx are true

	returns: non-null string of status codes for invalid licenses

	examples:

	appsubmitbefore   (will validate the LP entered, if any, and cancel the event if the LP is inactive, cancelled, expired, etc.)
	===============
	true ^ cslbMessage = "";
	CAELienseNumber ^ cslbMessage = externalLP_CA(CAELienseNumber,CAELienseType,false,false,null);
	cslbMessage.length > 0 ^ cancel = true ; showMessage = true ; comment(cslbMessage)

	appsubmitafter  (update all CONTRACTOR LPs on the CAP and REFERENCE with data from CSLB.  Link the CAP LPs to REFERENCE.   Pop up a message if any are inactive...)
	==============
	true ^ 	cslbMessage = externalLP_CA(null,"CONTRACTOR",true,true,capId)
	cslbMessage.length > 0 ^ showMessage = true ; comment(cslbMessage);

	Note;  Custom LP Template Field Mappings can be edited in the script below
	 */

	var returnMessage = "";

	// Build array of LPs to check
	var workArray = new Array();
	if (licNum)
		workArray.push(String(licNum));

	if (itemCap) {
		var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
		if (capLicenseResult.getSuccess()) {
			var capLicenseArr = capLicenseResult.getOutput();
		} else {
			logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
			return false;
		}

		if (capLicenseArr == null || !capLicenseArr.length) {
			logDebug("**WARNING: no licensed professionals on this CAP");
		} else {
			for (var thisLic in capLicenseArr)
				if (capLicenseArr[thisLic].getLicenseType() == rlpType)
					workArray.push(capLicenseArr[thisLic]);
		}
	} else {
		doPopulateTrx = false; // can't do this without a CAP;
	}

	for (var thisLic = 0; thisLic < workArray.length; thisLic++) {
		var licNum = workArray[thisLic];
		var licObj = null;
		var isObject = false;

		if (typeof licNum == "object") {
			// is this one an object or string?
			licObj = licNum;
			licNum = licObj.getLicenseNbr();
			isObject = true;
		}

		// Make the call to the California State License Board

		var endPoint = "https://www.cslb.ca.gov/onlineservices/DataPortalAPI/GetbyClassification.asmx";
		var method = "http://CSLB.Ca.gov/GetLicense";
		var xmlout = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cslb="http://CSLB.Ca.gov/"><soapenv:Header/><soapenv:Body><cslb:GetLicense><cslb:LicenseNumber>%%LICNUM%%</cslb:LicenseNumber><cslb:Token>%%TOKEN%%</cslb:Token></cslb:GetLicense></soapenv:Body></soapenv:Envelope>';
		//var licNum = "9";
		var token = lookup("CSLB_INTEGRATION", "CSLB TOKEN");

		if (!token || token == "") {
			logDebug("CSLB_INTEGRATION CSLB TOKEN not configured");
			return false;
		}

		xmlout = xmlout.replace("%%LICNUM%%", licNum);
		xmlout = xmlout.replace("%%TOKEN%%", token);

		var headers = aa.util.newHashMap();
		headers.put("Content-Type", "text/xml");
		headers.put("SOAPAction", method);

		var res = aa.httpClient.post(endPoint, headers, xmlout);


		// check the results
		var result;
		var isError = false;
		if (res.getSuccess()) {
			result = String(res.getOutput());
		} else {
			isError = true;
		}

		var lpStatus = XMLTagValue(result, "Status");
		// Primary Status
		//
		if (lpStatus && lpStatus != "") {
			returnMessage += "License:" + licNum + " status is " + lpStatus + ".";
		} else {
			isError = true;
			returnMessage += "CLSB returns no data ";
		}
		if (isError) {
			returnMessage += "License " + licNum + " : ";
			returnMessage += "URL: " + endPoint + " : ";
			returnMessage += "Headers:" + headers + " : ";
			returnMessage += "Payload: " + xmlout + " : ";
			returnMessage += "Result: " + result + " : ";
			continue;
		}


		if (doPopulateRef) {
			// refresh or create a reference LP
			var updating = false;
			// check to see if the licnese already exists...if not, create.
			var newLic = getRefLicenseProf(licNum);

			if (newLic) {
				updating = true;
				logDebug("Updating existing Ref Lic Prof : " + licNum);
			} else {
				var newLic = aa.licenseScript.createLicenseScriptModel();
			}

			if (isObject) {
				// update the reference LP with data from the transactional, if we have some.
				if (licObj.getAddress1())
					newLic.setAddress1(licObj.getAddress1());
				if (licObj.getAddress2())
					newLic.setAddress2(licObj.getAddress2());
				if (licObj.getAddress3())
					newLic.setAddress3(licObj.getAddress3());
				if (licObj.getAgencyCode())
					newLic.setAgencyCode(licObj.getAgencyCode());
				if (licObj.getBusinessLicense())
					newLic.setBusinessLicense(licObj.getBusinessLicense());
				if (licObj.getBusinessName())
					newLic.setBusinessName(licObj.getBusinessName());
				if (licObj.getBusName2())
					newLic.setBusinessName2(licObj.getBusName2());
				if (licObj.getCity())
					newLic.setCity(licObj.getCity());
				if (licObj.getCityCode())
					newLic.setCityCode(licObj.getCityCode());
				if (licObj.getContactFirstName())
					newLic.setContactFirstName(licObj.getContactFirstName());
				if (licObj.getContactLastName())
					newLic.setContactLastName(licObj.getContactLastName());
				if (licObj.getContactMiddleName())
					newLic.setContactMiddleName(licObj.getContactMiddleName());
				if (licObj.getCountryCode())
					newLic.setContryCode(licObj.getCountryCode());
				if (licObj.getEmail())
					newLic.setEMailAddress(licObj.getEmail());
				if (licObj.getCountry())
					newLic.setCountry(licObj.getCountry());
				if (licObj.getEinSs())
					newLic.setEinSs(licObj.getEinSs());
				if (licObj.getFax())
					newLic.setFax(licObj.getFax());
				if (licObj.getFaxCountryCode())
					newLic.setFaxCountryCode(licObj.getFaxCountryCode());
				if (licObj.getHoldCode())
					newLic.setHoldCode(licObj.getHoldCode());
				if (licObj.getHoldDesc())
					newLic.setHoldDesc(licObj.getHoldDesc());
				if (licObj.getLicenseExpirDate())
					newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
				if (licObj.getLastRenewalDate())
					newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
				if (licObj.getLicesnseOrigIssueDate())
					newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
				if (licObj.getPhone1())
					newLic.setPhone1(licObj.getPhone1());
				if (licObj.getPhone1CountryCode())
					newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
				if (licObj.getPhone2())
					newLic.setPhone2(licObj.getPhone2());
				if (licObj.getPhone2CountryCode())
					newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
				if (licObj.getSelfIns())
					newLic.setSelfIns(licObj.getSelfIns());
				if (licObj.getState())
					newLic.setState(licObj.getState());
				if (licObj.getSuffixName())
					newLic.setSuffixName(licObj.getSuffixName());
				if (licObj.getZip())
					newLic.setZip(licObj.getZip());
			}
			// ---This sets values in the Comment field of the LP---
			var BondCancellationDate = XMLTagValue(result, "BondCancellationDate");
			var BondEffectiveDate = XMLTagValue(result, "BondEffectiveDate");
			var BusinessType = XMLTagValue(result, "BusinessType");
			var Classifications = XMLTagValue(result, "Classifications");
			var ClassificationList = Classifications.split("|");
			for (var m = 0; m < ClassificationList.length; m++) {
				cb = ClassificationList[m];
				logDebug(cb);

				//editRefLicProfAttribute(licNum, "CLASS CODE " + (m + 1), cb);
			}
			var ContractorBondAmount = XMLTagValue(result, "ContractorBondAmount");
			var ContractorBondNumber = XMLTagValue(result, "ContractorBondNumber");
			var ContractorBondNumber = XMLTagValue(result, "ContractorBondNumber");
			var ExpirationDate = XMLTagValue(result, "ExpirationDate");
			var ExpirationDate = XMLTagValue(result, "ExpirationDate");
			var IssueDate = XMLTagValue(result, "IssueDate");
			var IssueDate = XMLTagValue(result, "IssueDate");
			var PolicyCancellationDate = XMLTagValue(result, "PolicyCancellationDate");
			var PolicyEffectiveDate = XMLTagValue(result, "PolicyEffectiveDate");
			var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
			var SuretyCompany = XMLTagValue(result, "SuretyCompany");
			var SuretyCompany = XMLTagValue(result, "SuretyCompany");
			var WorkersCompCoverageType = XMLTagValue(result, "WorkersCompCoverageType");
			var WorkersCompInsuranceCompany = XMLTagValue(result, "WorkersCompInsuranceCompany");
			var WorkersCompPolicyNumber = XMLTagValue(result, "WorkersCompPolicyNumber");

			var commt = "";
			//var expCommt = expression.getValue("LP::professionalModel*comment"); //***Comment out for Function call

			commt += "Entity: " + BusinessType + "\n";
			commt += "Issued On: " + IssueDate + "\n";
			//commt += "Reissued On : **NEED FIELD"  + "\n";
			commt += "Expires On: " + ExpirationDate + "\n\n";

			commt += "CLASSIFICATIONS: " + ClassificationList.join(" ,") + "\n\n";

			commt += "CONTRACTOR BONDS: \n";
			commt += "\tSuretyTp: " + SuretyCompany + "\n\tBondNo: " + ContractorBondNumber + "\n\tBond Amount: " + ContractorBondAmount + "\n\n";
			commt += "WORKERS COMP: \n";
			commt += "\tExempt: " + WorkersCompCoverageType + "\n\tInsCoCde: " + WorkersCompPolicyNumber + "\n\tInsCoName: " + WorkersCompInsuranceCompany + "\n";
			commt += "\tPolicyNo: " + WorkersCompPolicyNumber + "\n\tWCEffDt: " + PolicyEffectiveDate + "\n\tWCExpDt: " + PolicyExpirationDate + "\n\tWCCancDt: " + PolicyCancellationDate + "\n";

			newLic.setComment(commt);  //****For the Function
			//expCommt.value = commt;  //****For the Expression
			//expression.setReturn(expCommt);  //****For the Expression
			//----End of LP Comments section----
			// Now set data from the CSLB
			var BusinessName = XMLTagValue(result, "BusinessName");
			if (BusinessName != "")
				newLic.setBusinessName(BusinessName.replace(/\+/g, " ").formatToHTML());
			var Address = XMLTagValue(result, "Address");
			if (Address != "")
				newLic.setAddress1(Address.replace(/\+/g, " ").formatToHTML());
			var City = XMLTagValue(result, "City");
			if (City != "")
				newLic.setCity(City.replace(/\+/g, " ").formatToHTML());
			var State = XMLTagValue(result, "State");
			if (State != "")
				newLic.setState(State.replace(/\+/g, " ").formatToHTML());
			var Zip = XMLTagValue(result, "ZIP");
			if (Zip != "")
				newLic.setZip(Zip.replace(/\+/g, " ").formatToHTML());

			var PhoneNumber = String(XMLTagValue(result, "PhoneNumber"));
			if (PhoneNumber != "")
				newLic.setPhone1(PhoneNumber.replace(/\+/g, " ").replace(/\ /g, "-").replace(/\(/g, "").replace(/\)/g, "").formatToHTML());
			newLic.setAgencyCode(aa.getServiceProviderCode());
			newLic.setAuditDate(sysDate);
			newLic.setAuditID(currentUserID);
			newLic.setAuditStatus("A");
			newLic.setLicenseType(rlpType);
			newLic.setLicState("CA"); // hardcode CA
			newLic.setStateLicense(licNum);

			var IssueDate = XMLTagValue(result, "IssueDate");
			if (IssueDate)
				newLic.setLicenseIssueDate(aa.date.parseDate(IssueDate));
			var ExpirationDate = XMLTagValue(result, "ExpirationDate");
			if (ExpirationDate)
				newLic.setLicenseExpirationDate(aa.date.parseDate(ExpirationDate));
			var WorkersCompPolicyNumber = XMLTagValue(result, "WorkersCompPolicyNumber");
			if (WorkersCompPolicyNumber)
				newLic.setWcPolicyNo(WorkersCompPolicyNumber);
			var PolicyEffectiveDate = XMLTagValue(result, "PolicyEffectiveDate");
			if (PolicyEffectiveDate)
				newLic.setWcEffDate(aa.date.parseDate(PolicyEffectiveDate));
			var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
			if (PolicyExpirationDate)
				newLic.setWcExpDate(aa.date.parseDate(PolicyExpirationDate));
			//added 2/24/2021
			var PolicyCancellationDate = XMLTagValue(result, "PolicyCancellationDate");
			if (PolicyCancellationDate)
				newLic.setWcCancDate(aa.date.parseDate(PolicyCancellationDate));
			var WorkersCompInsuranceCompany = XMLTagValue(result, "WorkersCompInsuranceCompany");
			if (WorkersCompInsuranceCompany)
				newLic.setInsuranceCo(WorkersCompInsuranceCompany);
			var WorkersCompCoverageType = XMLTagValue(result, "WorkersCompCoverageType");
			if (WorkersCompCoverageType == "Exempt") newLic.setWcExempt("Y"); else newLic.setWcExempt("N");

			//
			// Do the refresh/create and get the sequence number
			//
			if (updating) {
				var myResult = aa.licenseScript.editRefLicenseProf(newLic);
				var licSeqNbr = newLic.getLicSeqNbr();
			} else {
				var myResult = aa.licenseScript.createRefLicenseProf(newLic);

				if (!myResult.getSuccess()) {
					logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
					continue;
				}

				var licSeqNbr = myResult.getOutput();
			}

			logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " Sequence Number " + licSeqNbr);

			/////
			/////  Attribute Data -- first copy from the transactional LP if it exists
			/////

			if (isObject) {
				// update the reference LP with attributes from the transactional, if we have some.
				var attrArray = licObj.getAttributes();

				if (attrArray) {
					for (var k in attrArray) {
						var attr = attrArray[k];
						editRefLicProfAttribute(
							licNum,
							attr.getAttributeName(),
							attr.getAttributeValue());
					}
				}
			}

			/////
			/////  Attribute Data
			/////
			/////  NOTE!  Agencies may have to configure template data below based on their configuration.  Please note all edits
			/////
			var Classifications = XMLTagValue(result, "Classifications");
			var ClassificationList = Classifications.split("|");

			for (var m = 0; m < ClassificationList.length; m++) {
				cb = ClassificationList[m];
				logDebug(cb);
				editRefLicProfAttribute(licNum, "CLASS CODE " + (m + 1), cb);
			}
			var ContractorBondAmount = XMLTagValue(result, "ContractorBondAmount");
			if (ContractorBondAmount)
				editRefLicProfAttribute(licNum, "BOND AMOUNT", ContractorBondAmount);
			//added 2/5/2021
			//Bond Information
			var ContractorBondNumber = XMLTagValue(result, "ContractorBondNumber");
			if (ContractorBondNumber)
				editRefLicProfAttribute(licNum, "BOND NUMBER", ContractorBondNumber);

			var BondEffectiveDate = XMLTagValue(result, "BondEffectiveDate");
			if (BondEffectiveDate)
				editRefLicProfAttribute(licNum, "BOND EFFECTIVE DATE", BondEffectiveDate);

			var SuretyCompany = XMLTagValue(result, "SuretyCompany");
			if (SuretyCompany)
				editRefLicProfAttribute(licNum, "BOND INSURANCE COMPANY", SuretyCompany);

			var BondCancellationDate = XMLTagValue(result, "BondCancellationDate");
			if (BondCancellationDate)
				editRefLicProfAttribute(licNum, "BOND EXPIRATION", BondCancellationDate);

			//Added for Placer 3/10/2021
			var ExpirationDate = XMLTagValue(result, "ExpirationDate");
			if (ExpirationDate)
				editRefLicProfAttribute(licNum, "EXPIRATION DATE", ExpirationDate);

			var WorkersCompPolicyNumber = XMLTagValue(result, "WorkersCompPolicyNumber");
			if (WorkersCompPolicyNumber)
				editRefLicProfAttribute(licNum, "WORKERS POLICY", WorkersCompPolicyNumber);

			var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
			if (PolicyExpirationDate)
				editRefLicProfAttribute(licNum, "WORKERS EXP", PolicyExpirationDate);

			var WorkersCompCoverageType = XMLTagValue(result, "WorkersCompCoverageType");
			if (WorkersCompCoverageType)
				editRefLicProfAttribute(licNum, "WORKMANS COMP EXEMPT", WorkersCompCoverageType);

			// populate transactional LP ----------------------------------------------------------
			if (doPopulateTrx) {
				var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, licSeqNbr);
				if (!lpsmResult.getSuccess()) {
					logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
				}

				var lpsm = lpsmResult.getOutput();

				// Remove from CAP

				var isPrimary = false;

				if (capLicenseArr != null) {
					for (var currLic in capLicenseArr) {
						var thisLP = capLicenseArr[currLic];
						if (
							thisLP.getLicenseType() == rlpType &&
							thisLP.getLicenseNbr() == licNum) {
							logDebug("Removing license: " + thisLP.getLicenseNbr() + " from CAP.  We will link the new reference LP");
							if (thisLP.getPrintFlag() == "Y") {
								logDebug("...remove primary status...");
								isPrimary = true;
								thisLP.setPrintFlag("N");
								aa.licenseProfessional.editLicensedProfessional(thisLP);
							}
							var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
							if (capLicenseResult.getSuccess()) {
								logDebug("...Success.");
							} else {
								logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage());
							}
						}
					}
				}

				// add the LP to the CAP
				var asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm);
				if (!asCapResult.getSuccess()) {
					logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage());
				} else {
					logDebug("Associated the CAP to the new LP");
				}

				// Now make the LP primary again
				if (isPrimary) {
					var capLps = getLicenseProfessional(itemCap);

					for (var thisCapLpNum in capLps) {
						if (capLps[thisCapLpNum].getLicenseNbr().equals(licNum)) {
							var thisCapLp = capLps[thisCapLpNum];
							thisCapLp.setPrintFlag("Y");
							aa.licenseProfessional.editLicensedProfessional(thisCapLp);
							logDebug("Updated primary flag on Cap LP : " + licNum);
						}
					}
				}
			} // do populate on the CAP
		} // do populate on the REF
	} // for each license

	if (returnMessage.length > 0)
		return returnMessage;
	else
		return null;
}

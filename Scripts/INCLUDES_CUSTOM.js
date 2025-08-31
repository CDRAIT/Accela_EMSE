/*------------------------------------------------------------------------------------------------------/
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   : Placer County Custom Functions:
|  9/8/2015 Keith add removeParcelCondition because of error in STD function
|  5/3/2016 JMcKenzie >> Added functions to support Inspection Email Notifications:
|							- getRecordParams4Notification
|							- getACARecordParam4Notification
|							- getACADeepLinkParam4Notification
|							- getACADocDownloadParam4Notification
|							- getContactParams4Notification
|							- getInspectionParams4Notification
|							- getPrimaryAddressLineParam4Notification
|							- getPrimaryOwnerParams4Notification
|							- getACADocumentDownloadUrl
|							- getACARecordURL
|							- getDeepLinkUrl
|  3/23/2017 JMcKenzie >> Updated function "getRecordParams4Notification" to include Scope and Office
|  2/21/2018 Ngraf >> Added Functions to support Air Quality module:
|							- updatefeenotes
|							- getfeeFeeSeqNbr
|							- feeBalancebynotes
|							- feeAmountbynotes
|							- cloneConditions
|							- HPrating
|							- MMBturating
|							- KVArating
|  5/9/2018 Ngraf >> Added Functions to support Air Quality module: 
|							- getContactEmailByContactType
|							- sendEmailwAttchmnt
|  6/13/2018 Ngraf >> Added Functions to support Air Quality module: 
|							- Nozrating
|							- loadFeesplacer
|							- invoiceAllFeesPlacer
|							- getinvoicenumberbydate
|							- CreateCalendarAppt
|							- getinvoicebalance
|
|	12/14/2018 TDUNN >> Added function getContactArrayWithPrimary() to support email notifications.
|  						Added function getPrimaryOwnerParams4NotificationWithEmail.  Added getting email
|  						Added function getAssignedToStaff() to support email notification to assigned staff
|						Added function getUserIDfromFullName(FullName) to support email notification to assigned staff
|    4/24/2019 GWL   >> Updated function  AutoScheduleUnpassedInspections()  
|                         to include inspection status conditions: "Phased fail fee charged", "Phased pass fee charged" 
|    4/10/2020 GWL   >> Added Functions from Accela to support Remote Inspection:
|							- emailNotificationNoAttachmentRemoteInspection
|							- getStandardChoiceArray
|							- getRecordParams4Notification
|							- getInspectionScheduleParams4Notification
|							- getPrimaryAddressLineParam4Notification
|							- getDepartmentParams4Notification
|							- getInspectorWebConferenceURL
|							- isEmptyOrNull
|							- sendAppToACA4Edit
|							- getUserObjsByDistrict
|							- getUserObjs
|							- getUserInspectorObjs
|							- userObj
|    11/05/2020 TDunn >> Added custom function createNotificationTPS2() to simplify and standardize creating new notification
|                        Added custom function loadCustomScript() to enable calling 3.0 javascript files
|    03/02/2021 TDunn >> renamed modified function getRecordParams4Notification (from 3/23/2017) to getRecordParams4NotificationJM to avoid conflicts with base version
|    03/23/2021 mbecker  added 2 new functions for new CSLB calls.
|                                                       - externalLP_CA_SOAP.js
|                                                       - XMLTagValue.js 
|   10/20/2021 TDunn >> Added custom function to add special SP fees for Commercial Full Review permits.
|   04/20/2023 EAftahi >> Added custom function, customComment
|   10/18/2023 TDunn >> Added new functions for utility release notification
|   10/19/2023 TDunn >> Added new function for adding a row to the Valuation table: addCalcValuation()
|   11/16/2023 TDunn >> Added new custom functions for worklfow management
|   01/10/2024 TDunn >> Added new function for creating PCCP record created notification: createPCCPNotification(emailTemplate,pccpCapIDString) 
|   01/12/2024 TDunn >> Added new function for staff assignment notification: function createStaffAssignedNotification(emailTemplate,vContactType) 
|   01/12/2024 TDunn >> Added new function to format staff phone numbers for notifications or other applications: formatStaffPhone()
|   05/14/2024 TDunn >> Corrected logic error in if statement in function setReviewWorkflowTasksByTsiFieldsTPS()
|   06/19/2024 TDunn >> updated function 'createStaffAssignedNotification(emailTemplate,vContactType)' to include staff title as a parameter
|   08/28/2024 Abe   >> Added function generateReportTPS_CustomFileName() written by TDunn
|   08/28/2024 Abe   >> Modified function getAPOParams4Notification(), added ownerEmail and address to the params
|   09/27/2024 TDunn >> Added new function copyDocumentsTPS()
|   09/27/2024 TDunn >> Added new function createChildNoContacts for creating EOT child records without copying contact or APO information
|   10/25/2024 TDunn >> added status update in autoRouteReviewsTD for full review cycle activation.
|   11/05/2024 TDunn >> updated getTaskStatus to take capId as a third parameter
|   12/06/2024 TDunn >> updated name of custom 'generateReport' to 'generateReportPCO'
|   12/19/2024 Abe   >> Added function sendAcknowledgementLtr2Applicant() for sending email for Code and HazVeg modules 
|   01/03/2025 TDunn >> added functions assignConcurrent(lkupCriteria,tprocess,vCycle) and assignPreissue(pTask,tprocess) to support auto-assignment
|   01/03/2025 TDunn >> added functions  getDueInDays(vtable,vcriteria,vcycle) and setDueDate(lkupCriteria,numDays,tprocess) to support automating due dates
|   02/12/2025 TDunn >> added functions assignThisTask() and generateStormFloodNotice()
|   03/05/2025 TDunn >> added function getCycleNum() to return current cycle number of target task.
|   03/06/2025 TDunn >> added function createCapComment()
|   03/07/2025 TDunn >> added function generateNoticeToStaff()
|   03/14/2025 TDunn >> added custom functions: getPCOasi4BuildingNotification(params,deptCrit); generateAddlPermitRequiredNotice(vTemplate,rpList); getTaskAssignToEmail(thisTaskArg,tprocess)
|   03/14/2025 TDunn >> added custom function getAppProcessCode(capIdItem) 
|   03/31/2025 TDunn >> added custom function  getPreIssuanceListForNotification  requires name of std choice lookup for list.      
|
/---------------------------------------------------------------------------------------------------------------------------------------------------------*/


function externalLP_CA_PLACERCO(licNum, rlpType, doPopulateRef, doPopulateTrx, itemCap) {

    /*
    Version: 3.2

	Usage:

		licNum			:  Valid CA license number.   Non-alpha, max 8 characters.  If null, function will use the LPs on the supplied CAP ID
    rlpType			:  License professional type to use when validating and creating new LPs
    doPopulateRef 	:  If true, will create/refresh a reference LP of this number/type
    doPopulateTrx 	:  If true, will copy create/refreshed reference LPs to the supplied Cap ID.   doPopulateRef must be true for this to work
    itemCap			:  If supplied, licenses on the CAP will be validated.  Also will be refreshed if doPopulateRef and doPopulateTrx are true

	returns: non-null string of status codes for invalid licenses

	examples:

	appsubmitbefore   (will validate the LP entered, if any, and cancel the event if the LP is inactive, cancelled, expired, etc.)
    ===============
    true ^ cslbMessage = "";
    CAELienseNumber ^ cslbMessage = externalLP_CA(CAELienseNumber,false,false,CAELienseType,null);
    cslbMessage.length > 0 ^ cancel = true ; showMessage = true ; comment(cslbMessage)

	appsubmitafter  (update all CONTRACTOR LPs on the CAP and REFERENCE with data from CSLB.  Link the CAP LPs to REFERENCE.   Pop up a message if any are inactive...)
    ==============
    true ^ 	cslbMessage = externalLP_CA(null,true,true,"CONTRACTOR",capId)
    cslbMessage.length > 0 ^ showMessage = true ; comment(cslbMessage);

	Note;  Custom LP Template Field Mappings can be edited in the script below
    */

    var returnMessage = "";

    var workArray = new Array();
    if (licNum)
        workArray.push(String(licNum));

    if (itemCap) {
        var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
        if (capLicenseResult.getSuccess()) {
            var capLicenseArr = capLicenseResult.getOutput();
        }
        else
        { logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

        if (capLicenseArr == null || !capLicenseArr.length)
        { logDebug("**WARNING: no licensed professionals on this CAP"); }
        else {
            for (var thisLic in capLicenseArr)
                if (capLicenseArr[thisLic].getLicenseType() == rlpType)
                workArray.push(capLicenseArr[thisLic]);
        }
    }
    else
        doPopulateTrx = false; // can't do this without a CAP;

    for (var thisLic = 0; thisLic < workArray.length; thisLic++) {
        var licNum = workArray[thisLic];
        var licObj = null;
        var isObject = false;

        if (typeof (licNum) == "object")  // is this one an object or string?
        {
            licObj = licNum;
            licNum = licObj.getLicenseNbr();
            isObject = true;
        }

        // Make the call to the California State License Board

        // var saxBuilder = aa.proxyInvoker.newInstance("org.jdom.input.SAXBuilder").getOutput();
        // var aURLArgList = new Array()
        //aURLArgList[0] = "https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + licNum;
        // var oURL = aa.proxyInvoker.newInstance("java.net.URL",aURLArgList).getOutput();
        // var document = saxBuilder.build(oURL); //("https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + licNum);
        // var root = document.getRootElement();
        //11-27 aded this section for CSLB update
        var document;
        var root;
        var aURLArgList = "https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + licNum;
        var vOutObj = aa.httpClient.get(aURLArgList);
        if (vOutObj.getSuccess()) {
            var vOut = vOutObj.getOutput();
            var sr = aa.proxyInvoker.newInstance("java.io.StringBufferInputStream", new Array(vOut)).getOutput();
            var saxBuilder = aa.proxyInvoker.newInstance("org.jdom.input.SAXBuilder").getOutput();
            document = saxBuilder.build(sr);
            root = document.getRootElement();
        }
        else {
            return;
        }



        var errorNode = root.getChild("Error");
        if (errorNode) {
            logDebug("Error for license " + licNum + " : " + errorNode.getText().replace(/\+/g, " "));
            returnMessage += "License " + licNum + " : " + errorNode.getText().replace(/\+/g, " ") + " ";
            continue;
        }

        var lpBiz = root.getChild("BusinessInfo");
        var lpStatus = root.getChild("PrimaryStatus");
        var lpClass = root.getChild("Classifications");
        var lpBonds = root.getChild("ContractorBond");
        var lpWC = root.getChild("WorkersComp");

        // Primary Status
        // 3 = expired, 10 = good, 11 = inactive, 1 = canceled.   We will ignore all but 10 and return text.
        var stas = lpStatus.getChildren();
        for (var i = 0; i < stas.size(); i++) {
            var sta = stas.get(i);

            if (sta.getAttribute("Code").getValue() != "10")
                returnMessage += "License:" + licNum + ", " + sta.getAttribute("Desc").getValue() + " ";
        }

        if (doPopulateRef)  // refresh or create a reference LP
        {
            var updating = false;

            // check to see if the licnese already exists...if not, create.

            var newLic = getRefLicenseProf(licNum)

            if (newLic) {
                updating = true;
                logDebug("Updating existing Ref Lic Prof : " + licNum);
            }
            else {
                var newLic = aa.licenseScript.createLicenseScriptModel();
            }

            if (isObject)  // update the reference LP with data from the transactional, if we have some.
            {
                if (licObj.getAddress1()) newLic.setAddress1(licObj.getAddress1());
                if (licObj.getAddress2()) newLic.setAddress2(licObj.getAddress2());
                if (licObj.getAddress3()) newLic.setAddress3(licObj.getAddress3());
                if (licObj.getAgencyCode()) newLic.setAgencyCode(licObj.getAgencyCode());
                if (licObj.getBusinessLicense()) newLic.setBusinessLicense(licObj.getBusinessLicense());
                if (licObj.getBusinessName()) newLic.setBusinessName(licObj.getBusinessName());
                if (licObj.getBusName2()) newLic.setBusinessName2(licObj.getBusName2());
                if (licObj.getCity()) newLic.setCity(licObj.getCity());
                if (licObj.getCityCode()) newLic.setCityCode(licObj.getCityCode());
                if (licObj.getContactFirstName()) newLic.setContactFirstName(licObj.getContactFirstName());
                if (licObj.getContactLastName()) newLic.setContactLastName(licObj.getContactLastName());
                if (licObj.getContactMiddleName()) newLic.setContactMiddleName(licObj.getContactMiddleName());
                if (licObj.getCountryCode()) newLic.setContryCode(licObj.getCountryCode());
                if (licObj.getEmail()) newLic.setEMailAddress(licObj.getEmail());
                if (licObj.getCountry()) newLic.setCountry(licObj.getCountry());
                if (licObj.getEinSs()) newLic.setEinSs(licObj.getEinSs());
                if (licObj.getFax()) newLic.setFax(licObj.getFax());
                if (licObj.getFaxCountryCode()) newLic.setFaxCountryCode(licObj.getFaxCountryCode());
                if (licObj.getHoldCode()) newLic.setHoldCode(licObj.getHoldCode());
                if (licObj.getHoldDesc()) newLic.setHoldDesc(licObj.getHoldDesc());
                if (licObj.getLicenseExpirDate()) newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
                if (licObj.getLastRenewalDate()) newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
                if (licObj.getLicesnseOrigIssueDate()) newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
                if (licObj.getPhone1()) newLic.setPhone1(licObj.getPhone1());
                if (licObj.getPhone1CountryCode()) newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
                if (licObj.getPhone2()) newLic.setPhone2(licObj.getPhone2());
                if (licObj.getPhone2CountryCode()) newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
                if (licObj.getSelfIns()) newLic.setSelfIns(licObj.getSelfIns());
                if (licObj.getState()) newLic.setState(licObj.getState());
                if (licObj.getSuffixName()) newLic.setSuffixName(licObj.getSuffixName());
                if (licObj.getZip()) newLic.setZip(licObj.getZip());
            }

            // Now set data from the CSLB

            if (lpBiz.getChild("Name").getText() != "") newLic.setBusinessName(unescape(lpBiz.getChild("Name").getText()).replace(/\+/g, " "));
            if (lpBiz.getChild("Addr1").getText() != "") newLic.setAddress1(unescape(lpBiz.getChild("Addr1").getText()).replace(/\+/g, " "));
            if (lpBiz.getChild("Addr2").getText() != "") newLic.setAddress2(unescape(lpBiz.getChild("Addr2").getText()).replace(/\+/g, " "));
            if (lpBiz.getChild("City").getText() != "") newLic.setCity(unescape(lpBiz.getChild("City").getText()).replace(/\+/g, " "));
            if (lpBiz.getChild("State").getText() != "") newLic.setState(unescape(lpBiz.getChild("State").getText()).replace(/\+/g, " "));
            if (lpBiz.getChild("Zip").getText() != "") newLic.setZip(unescape(lpBiz.getChild("Zip").getText()).replace(/\+/g, " "));
            if (lpBiz.getChild("BusinessPhoneNum").getText() != "") newLic.setPhone1(unescape(stripNN(lpBiz.getChild("BusinessPhoneNum").getText()).replace(/\+/g, " ")));
            newLic.setAgencyCode(aa.getServiceProviderCode());
            newLic.setAuditDate(sysDate);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setLicState("CA");  // hardcode CA
            newLic.setStateLicense(licNum);

            if (lpBiz.getChild("IssueDt").getText()) newLic.setLicenseIssueDate(aa.date.parseDate(lpBiz.getChild("IssueDt").getText()));
            if (lpBiz.getChild("ExpireDt").getText()) newLic.setLicenseExpirationDate(aa.date.parseDate(lpBiz.getChild("ExpireDt").getText()));
            if (lpBiz.getChild("ReissueDt").getText()) newLic.setLicenseLastRenewalDate(aa.date.parseDate(lpBiz.getChild("ReissueDt").getText()));

            var wcs = root.getChild("WorkersComp").getChildren();

            for (var j = 0; j < wcs.size(); j++) {
                wc = wcs.get(j);

                if (wc.getAttribute("PolicyNo").getValue()) newLic.setWcPolicyNo(wc.getAttribute("PolicyNo").getValue());
                if (wc.getAttribute("InsCoCde").getValue()) newLic.setWcInsCoCode(unescape(wc.getAttribute("InsCoCde").getValue()));
                if (wc.getAttribute("WCEffDt").getValue()) newLic.setWcEffDate(aa.date.parseDate(wc.getAttribute("WCEffDt").getValue()))
                if (wc.getAttribute("WCExpDt").getValue()) newLic.setWcExpDate(aa.date.parseDate(wc.getAttribute("WCExpDt").getValue()))
                if (wc.getAttribute("WCCancDt").getValue()) newLic.setWcCancDate(aa.date.parseDate(wc.getAttribute("WCCancDt").getValue()))
                if (wc.getAttribute("Exempt").getValue() == "E") newLic.setWcExempt("Y"); else newLic.setWcExempt("N");
                
                break; // only use first
            }

            //
            // Do the refresh/create and get the sequence number
            //
            if (updating) {
                var myResult = aa.licenseScript.editRefLicenseProf(newLic);
                var licSeqNbr = newLic.getLicSeqNbr();
            }
            else {
                var myResult = aa.licenseScript.createRefLicenseProf(newLic);

                if (!myResult.getSuccess()) {
                    logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
                    continue;
                }

                var licSeqNbr = myResult.getOutput()
            }

            logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " Sequence Number " + licSeqNbr);


            /////
            /////  Attribute Data -- first copy from the transactional LP if it exists
            /////


            if (isObject)  // update the reference LP with attributes from the transactional, if we have some.
            {
                var attrArray = licObj.getAttributes();

                if (attrArray) {
                    for (var k in attrArray) {
                        var attr = attrArray[k];
                        editRefLicProfAttribute(licNum, attr.getAttributeName(), attr.getAttributeValue());
                    }
                }
            }

            /////
            /////  Attribute Data
            /////
            /////  NOTE!  Agencies may have to configure template data below based on their configuration.  Please note all edits
            /////

            var cbs = root.getChild("Classifications").getChildren();
            for (var m = 0; m < cbs.size(); m++) {
                cb = cbs.get(m);

                if (m == 0) {
                    editRefLicProfAttribute(licNum, "CLASS CODE 1", cb.getAttribute("Code").getValue());
                    editRefLicProfAttribute(licNum, "CLASS DESC 1", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
                }

                if (m == 1) {
                    editRefLicProfAttribute(licNum, "CLASS CODE 2", cb.getAttribute("Code").getValue());
                    editRefLicProfAttribute(licNum, "CLASS DESC 2", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
                }
                if (m == 2) {
                    editRefLicProfAttribute(licNum, "CLASS CODE 3", cb.getAttribute("Code").getValue());
                    editRefLicProfAttribute(licNum, "CLASS DESC 3", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
                }

                if (m == 3) {
                    editRefLicProfAttribute(licNum, "CLASS CODE 4", cb.getAttribute("Code").getValue());
                    editRefLicProfAttribute(licNum, "CLASS DESC 4", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
                }
                if (m == 4) {
                    editRefLicProfAttribute(licNum, "CLASS CODE 5", cb.getAttribute("Code").getValue());
                    editRefLicProfAttribute(licNum, "CLASS DESC 5", unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g, " "));
                }
            }

            var bos = root.getChild("ContractorBond").getChildren();

            for (var n = 0; n < bos.size(); n++) {
                var bo = bos.get(n);
                if (bo.getAttribute("BondAmt").getValue()) editRefLicProfAttribute(licNum, "BOND AMOUNT", unescape(bo.getAttribute("BondAmt").getValue()));
                if (bo.getAttribute("BondCancDt").getValue()) editRefLicProfAttribute(licNum, "BOND EXPIRATION", unescape(bo.getAttribute("BondCancDt").getValue()));

                if (bo.getAttribute("SuretyTp").getValue()) editRefLicProfAttribute(licNum, "BOND SURETY TYPE", unescape(bo.getAttribute("SuretyTp").getValue()));
                if (bo.getAttribute("InsCoCde").getValue()) editRefLicProfAttribute(licNum, "BOND CODE", unescape(bo.getAttribute("InsCoCde").getValue()));
                if (bo.getAttribute("InsCoName").getValue()) editRefLicProfAttribute(licNum, "BOND INSURANCE COMPANY", unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g, " "));
                if (bo.getAttribute("BondNo").getValue()) editRefLicProfAttribute(licNum, "BOND NUMBER", unescape(bo.getAttribute("BondNo").getValue()));
                if (bo.getAttribute("BondEffDt").getValue()) editRefLicProfAttribute(licNum, "BOND EFFECTIVE DATE", unescape(bo.getAttribute("BondEffDt").getValue()));

            // Load Worker's comp data to attribute fields
            
            var wcs = root.getChild("WorkersComp").getChildren();

            for (var j = 0; j < wcs.size(); j++) {
                wc = wcs.get(j);

                if (wc.getAttribute("PolicyNo").getValue()) editRefLicProfAttribute(licNum, "WORKERS POLICY", wc.getAttribute("PolicyNo").getValue());
                if (wc.getAttribute("WCExpDt").getValue()) editRefLicProfAttribute(licNum, "WORKERS EXP", wc.getAttribute("WCExpDt").getValue());
                if (wc.getAttribute("Exempt").getValue() == "E") editRefLicProfAttribute(licNum, "WORKMANS COMP EXEMPT", "Y"); else editRefLicProfAttribute(licNum, "WORKMANS COMP EXEMPT", "N");

                break; // only use first
            }
            // Populate License Expiration date into an attribute field
            if (lpBiz.getChild("ExpireDt").getText()) editRefLicProfAttribute(licNum, "EXPIRATION DATE",(lpBiz.getChild("ExpireDt").getText()));
                
                // Currently unused but could be loaded into custom attributes.
                /*
                aa.print("Bond Surety Type       : " + unescape(bo.getAttribute("SuretyTp").getValue()))
                aa.print("Bond Code              : " + unescape(bo.getAttribute("InsCoCde").getValue()))
                aa.print("Bond Insurance Company : " + unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g," "))
                aa.print("Bond Number            : " + unescape(bo.getAttribute("BondNo").getValue()))
                aa.print("Bond Amount            : " + unescape(bo.getAttribute("BondAmt").getValue()))
                aa.print("Bond Effective Date    : " + unescape(bo.getAttribute("BondEffDt").getValue()))
                aa.print("Bond Cancel Date       : " + unescape(bo.getAttribute("BondCancDt").getValue()))
                */
                break; // only use first bond
            }

            if (doPopulateTrx) {
                var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, licSeqNbr)
                if (!lpsmResult.getSuccess())
                { logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage()); }

                var lpsm = lpsmResult.getOutput();

                // Remove from CAP

                var isPrimary = false;

                for (var currLic in capLicenseArr) {
                    var thisLP = capLicenseArr[currLic];
                    if (thisLP.getLicenseType() == rlpType && thisLP.getLicenseNbr() == licNum) {
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
                        }
                        else
                        { logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage()); }
                    }
                }

                // add the LP to the CAP
                var asCapResult = aa.licenseScript.associateLpWithCap(itemCap, lpsm)
                if (!asCapResult.getSuccess())
                { logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage()) }
                else
                { logDebug("Associated the CAP to the new LP") }

                // Now make the LP primary again
                if (isPrimary) {
                    var capLps = getLicenseProfessional(itemCap);

                    for (var thisCapLpNum in capLps) {
                        if (capLps[thisCapLpNum].getLicenseNbr().equals(licNum)) {
                            var thisCapLp = capLps[thisCapLpNum];
                            thisCapLp.setPrintFlag("Y");
                            aa.licenseProfessional.editLicensedProfessional(thisCapLp);
                            logDebug("Updated primary flag on Cap LP : " + licNum);

                            // adding this return will cause the test script to work without error, even though this is the last statement executed
                            //if (returnMessage.length > 0) return returnMessage;
                            //else return null;

                        }
                    }
                }
            } // do populate on the CAP
        } // do populate on the REF
    } // for each license

    if (returnMessage.length > 0) return returnMessage;
    else return null;

} // end function

function loadParcelAttributesTPS(thisArr) {
    // Modified version of the loadParcelAttributes()
    // Returns an associative array of Parcel Attributes
    // Optional second parameter, parcel number to load from
    // If no parcel is passed, function is using the ParcelValidatedNumber variable defined in the "BEGIN Event Specific Variables" list in ApplicationSubmitBefore

    var parcelNum = ParcelValidatedNumber;
    if (arguments.length == 2) parcelNum = arguments[1]; // use parcel number specified in args

    if (parcelNum.length != 0 && parcelNum != "" && parcelNum != null) {
        var fParcelObj = null;
        var parcelResult = aa.parcel.getParceListForAdmin(parcelNum, null, null, null, null, null, null, null, null, null);
        if (!parcelResult.getSuccess())
            logDebug("**ERROR: Failed to get Parcel object: " + parcelResult.getErrorType() + ":" + parcelResult.getErrorMessage());
        else
            var fParcelObj = parcelResult.getOutput()[0];
        var fParcelModel = fParcelObj.parcelModel;

        var parcelAttrObj = fParcelModel.getParcelAttribute().toArray();
        for (z in parcelAttrObj)
            thisArr["ParcelAttribute." + parcelAttrObj[z].getAttributeName()] = parcelAttrObj[z].getAttributeValue();

        // Explicitly load some standard values
        thisArr["ParcelAttribute.Block"] = fParcelModel.getBlock();
        thisArr["ParcelAttribute.Book"] = fParcelModel.getBook();
        thisArr["ParcelAttribute.CensusTract"] = fParcelModel.getCensusTract();
        thisArr["ParcelAttribute.CouncilDistrict"] = fParcelModel.getCouncilDistrict();
        thisArr["ParcelAttribute.ExemptValue"] = fParcelModel.getExemptValue();
        thisArr["ParcelAttribute.ImprovedValue"] = fParcelModel.getImprovedValue();
        thisArr["ParcelAttribute.InspectionDistrict"] = fParcelModel.getInspectionDistrict();
        thisArr["ParcelAttribute.LandValue"] = fParcelModel.getLandValue();
        thisArr["ParcelAttribute.LegalDesc"] = fParcelModel.getLegalDesc();
        thisArr["ParcelAttribute.Lot"] = fParcelModel.getLot();
        thisArr["ParcelAttribute.MapNo"] = fParcelModel.getMapNo();
        thisArr["ParcelAttribute.MapRef"] = fParcelModel.getMapRef();
        thisArr["ParcelAttribute.ParcelArea"] = fParcelModel.getParcelArea();
        thisArr["ParcelAttribute.ParcelStatus"] = fParcelModel.getParcelStatus();
        thisArr["ParcelAttribute.SupervisorDistrict"] = fParcelModel.getSupervisorDistrict();
        thisArr["ParcelAttribute.Tract"] = fParcelModel.getTract();
        thisArr["ParcelAttribute.PlanArea"] = fParcelModel.getPlanArea();
    }
}

function updateChildAltID2Digits(pcapId, ccapId, suffix) {
    /*---------------------------------------------------------------------------------------------------------/
    | Function Intent: 
    | This function is designed to update the AltId (b1permit.b1_alt_id) of an child record (ccapId).
    | The new AltId will be created using the AltId of its parent record (pcapId) plus the suffix variable
    | provided. Finally the end of the new id will be the number of child records of that record type.
    |
    | Example:
    | Parent AltId: 499-12-67872
    | Child AltId: 499-12-67872-ELEC-01
    |   499-12-67872-ELEC-02
    |   499-12-67872-ELEC-03
    |
    | Returns:
    | Outcome  Description   Return Type
    | Success: New AltID of Childrecord AltID String
    | Failure: Error    null null
    |
    | Call Example:
    | updateChildAltID(pcapId, ccapId, "-ELEC-"); 
    |
    | 01/15/2014 - TDunn
    | Version 2 Created
    |
    | Required paramaters in order:
    | pcapId - capId model of the parent record
    | ccapId - capId model of the child record
    | suffix - string that will be appended to the end of the parent AltId (ie. "-ELEC-")
    |
    /----------------------------------------------------------------------------------------------------------*/
    var p_AltId = pcapId.getCustomID();

    /* Only want first 11 chracters of Alt ID. <- This will be adjusted based on number of characters in Improvement Plan AltID */
    p_AltId = p_AltId.substring(0, 11);

    var c_AltId = ccapId.getCustomID();
    var c_cap = aa.cap.getCap(ccapId).getOutput();
    var c_appTypeResult = c_cap.getCapType();
    var c_appTypeString = c_appTypeResult.toString();
    var c_appTypeArray = c_appTypeString.split("/");

    //Get the number of child records by type provided
    var totChildren = getChildren(c_appTypeArray[0] + "/" + c_appTypeArray[1] + "/*/*", pcapId);
    if (totChildren === null || totChildren.length === 0)
    { logDebug("**ERROR: getChildren function found no children"); return null; }

    //Set the numeric suffix of the new AltId number to the actual number of child records that exists for the type.
    var totalFound = totChildren.length;
    var i = 0;

    //When using the clone feature multiple records can be created at the same time. When this happens the AltIds of the
    //children records are not set. To correctly set the AltIds we need to start with the last number and work backwards.
    //This ensures all the new child records receive a unique AltId.

    for (i = 0; i <= totChildren.length; i++) {

        //Add leading 0's if single digit
        if (totalFound < 10) { totalFound = '0' + totalFound; }

        var newAltId = p_AltId + suffix + totalFound + "";
        var updateResult = aa.cap.updateCapAltID(ccapId, newAltId);
        if (updateResult.getSuccess()) {
            logDebug("Updated child record AltId to " + newAltId + ".");
            break;
        }
        else {
            if (i == totalFound) {
                logDebug("** ERROR: Failed to update the AltID for " + c_AltId + ". " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
                return null;
            }
            //Might be duplicate because of multiple clones, try the next lower number
            totalFound = totChildren.length - (1 + i);
            //Check for negative
            if (totalFound < 0) {
                logDebug("**ERROR: Number used for AltID would be less than 0. Failed to update the AltID for " + c_AltId + ". ");
                return null;
            }
            logDebug("** Attempting the next number: " + totalFound + ".");
        }
    }
    return newAltId;
}
// This modification of the standard taskCloseAllExcept() adds the processID parameter to the handleDisposition method.
function taskCloseAllSubsExcept(pStatus, pComment) {
    // Closes all tasks in CAP with specified status and comment
    // Optional task names to exclude
    // 06SSP-00152
    //
    var taskArray = new Array();
    var closeAll = false;
    if (arguments.length > 2) //Check for task names to exclude
    {
        for (var i = 2; i < arguments.length; i++)
            taskArray.push(arguments[i]);
    }
    else
        closeAll = true;

    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    var fTask;
    var stepnumber;
    var processID;
    var dispositionDate = aa.date.getCurrentDate();
    var wfnote = " ";
    var wftask;

    for (i in wfObj) {
        fTask = wfObj[i];
        wftask = fTask.getTaskDescription();
        stepnumber = fTask.getStepNumber();
        processID = fTask.getProcessID();
        if (closeAll) {
            aa.workflow.handleDisposition(capId, stepnumber, processID, pStatus, dispositionDate, wfnote, pComment, systemUserObj, "Y");
            logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
            logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
        }
        else {
            if (!exists(wftask, taskArray)) {
                aa.workflow.handleDisposition(capId, stepnumber, processID, pStatus, dispositionDate, wfnote, pComment, systemUserObj, "Y");
                logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
                logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
            }
        }
    }
}

function editFirstIssuedDate(issuedDate) {  // option CapId

    var itemCap = capId
    if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args
    var cdScriptObjResult = aa.cap.getCapDetail(itemCap);

    if (!cdScriptObjResult.getSuccess())  {

        logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()); return false; 
    }

    var cdScriptObj = cdScriptObjResult.getOutput();
    if (!cdScriptObj) {

        logDebug("**ERROR: No cap detail script object"); return false; 
    }

    cd = cdScriptObj.getCapDetailModel();
    var javascriptDate = new Date(issuedDate);
    var vIssuedDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());
    cd.setFirstIssuedDate(vIssuedDate);
    cdWrite = aa.cap.editCapDetail(cd);

    if (cdWrite.getSuccess()) {

        logDebug("updated first issued date to " + vIssuedDate); return true; 
    }

    else {

        logDebug("**ERROR updating first issued date: " + cdWrite.getErrorMessage()); return false; 
    }

}

function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
	}
}

function generateReportPCO(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);
    logDebug(parameters);
    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}




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

function getRecordParams4NotificationJM(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$altID$$", capIDString);
    addParameter(params, "$$capName$$", capName);
    addParameter(params, "$$capStatus$$", capStatus);
    addParameter(params, "$$fileDate$$", fileDate);
    addParameter(params, "$$workDesc$$", workDescGet(capId));
    addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
    addParameter(params, "$$capTypeAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
    addParameter(params, "$$SCOPEOFWORK$$", getAppSpecific("Scope of Work", capId));
    addParameter(params, "$$PROJECTOFFICE$$", getAppSpecific("Project Office", capId));

    return params;
}

function getACARecordParam4Notification(params, acaUrl) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));

    return params;
}

function getACADeepLinkParam4Notification(params, acaUrl, pAppType, pAppTypeAlias, module) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
    addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);

    return params;
}

function getACADocDownloadParam4Notification(params, acaUrl, docModel) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl, docModel));

    return params;
}


function getContactParams4Notification(params, pContact) {
    // pass in a hashtable and it will add the additional parameters to the table
    // pass in contact to retrieve informaiton from

    thisContact = pContact;
    conType = "contact";
    //logDebug("Contact Array: " + thisContact["contactType"] + " Param: " + conType);

    addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
    addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
    addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
    addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);
    addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);
    addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);
    addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);
    addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);
    addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);
    addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);
    addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);
    addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);
    addParameter(params, "$$" + conType + "City$$", thisContact["city"]);
    addParameter(params, "$$" + conType + "State$$", thisContact["state"]);
    addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);
    addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);
    addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);
    addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);
    addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

    return params;
}



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

/*
function getPrimaryAddressLineParam4Notification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    var addressLine = "";

    adResult = aa.address.getPrimaryAddressByCapID(capId, "Y");

    if (adResult.getSuccess()) {
        ad = adResult.getOutput().getAddressModel();

        addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
    }

    return params;
}
*/

function getPrimaryOwnerParams4Notification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    capOwnerResult = aa.owner.getOwnerByCapId(capId);

    if (capOwnerResult.getSuccess()) {
        owner = capOwnerResult.getOutput();

        for (o in owner) {
            thisOwner = owner[o];
            if (thisOwner.getPrimaryOwner() == "Y") {
                addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
                addParameter(params, "$$ownerPhone$$", thisOwner.getPhone);
                break;
            }
        }
    }
    return params;
}


function getACADocumentDownloadUrl(acaUrl, documentModel) {

    //returns the ACA URL for supplied document model

    var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);
    if (acaUrlResult.getSuccess()) {
        acaDocUrl = acaUrlResult.getOutput();
        return acaDocUrl;
    }
    else {
        logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
        return false;
    }
}


function getACARecordURL(acaUrl) {

    var acaRecordUrl = "";
    var id1 = capId.ID1;
    var id2 = capId.ID2;
    var id3 = capId.ID3;

    acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";
    acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();
    acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
    acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

    return acaRecordUrl;
}

function getDeepLinkUrl(acaUrl, appType, module) {
    var acaDeepLinkUrl = "";

    acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
    acaDeepLinkUrl += appType;
    acaDeepLinkUrl += "&Module=" + module;

    return acaDeepLinkUrl;
}

function getContactArrayWithPrimary() {
    // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
    // optional capid
    // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
    // on ASA it should still be pulled normal way even though still partial cap
    var thisCap = capId;
    if (arguments.length == 1) thisCap = arguments[0];

    var cArray = new Array();

    if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
    {
        capContactArray = cap.getContactsGroup().toArray();
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(thisCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
        }
    }

    if (capContactArray) {

        for (yy in capContactArray) {
            var aArray = new Array();
            aArray["lastName"] = capContactArray[yy].getPeople().lastName;
            aArray["firstName"] = capContactArray[yy].getPeople().firstName;
            aArray["middleName"] = capContactArray[yy].getPeople().middleName;
            aArray["businessName"] = capContactArray[yy].getPeople().businessName;
            aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
            aArray["contactType"] = capContactArray[yy].getPeople().contactType;
            aArray["relation"] = capContactArray[yy].getPeople().relation;
            aArray["phone1"] = capContactArray[yy].getPeople().phone1;
            aArray["phone2"] = capContactArray[yy].getPeople().phone2;
            aArray["email"] = capContactArray[yy].getPeople().email;
            aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
            aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
            aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
            aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
            aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
            aArray["fax"] = capContactArray[yy].getPeople().fax;
            aArray["notes"] = capContactArray[yy].getPeople().notes;
            aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
            aArray["fullName"] = capContactArray[yy].getPeople().fullName;
            //aArray["contactTypeFlag"] = capContactArray[yy].getPeople().getContactTypeFlag();
            aArray["primaryFlag"] = capContactArray[yy].getPeople().getFlag();

            if (arguments.length == 0 && !cap.isCompleteCap()) // using capModel to get contacts
                var pa = capContactArray[yy].getPeople().getAttributes().toArray();
            else
                var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
            for (xx1 in pa)
                aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;
            cArray.push(aArray);
        }
    }
    return cArray;
}

function getPrimaryOwnerParams4NotificationWithEmail(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    capOwnerResult = aa.owner.getOwnerByCapId(capId);

    if (capOwnerResult.getSuccess()) {
        owner = capOwnerResult.getOutput();

        for (o in owner) {
            thisOwner = owner[o];
            if (thisOwner.getPrimaryOwner() == "Y") {
                addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
                addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				addParameter(params, "$$ownerEmail$$", thisOwner.getEmail());
                break;
            }
        }
    }
    return params;
}

function getAssignedToStaff() // option CapId
{
    var itemCap = capId
    if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

    var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
    if (!cdScriptObjResult.getSuccess()) {
        logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
        return false;
    }

    var cdScriptObj = cdScriptObjResult.getOutput();

    if (!cdScriptObj) {
        logDebug("**ERROR: No cap detail script object");
        return false;
    }

    cd = cdScriptObj.getCapDetailModel();

    //cd.setCompleteDept(iName.getDeptOfUser());
    var returnValue = cd.getAsgnStaff();
    //cdScriptObj.setCompleteDate(sysDate);

    //logDebug("Returning Assigned To Staff value: " + returnValue);

    return returnValue;
}

function getUserIDfromFullName(FullName) {
    var Fname = "";
    var Mname = "";
    var Lname = "";
    var namecount = String(FullName).split(" ").length;
    var name = String(FullName).split(" ");
    if (namecount == 2) {
        Fname = name[0];
        Lname = name[1];
    }
    if (namecount == 3) {
        Fname = name[0];
        Mname = name[1];
        Lname = name[2];
    }
    var pUserIdObj = aa.person.getUser(Fname, Mname, Lname);
    var pUserId = pUserIdObj.getOutput();

    var returnValue = pUserId["gaUserID"];

    return returnValue

}





function addAdHocTask(adHocProcess, adHocTask, adHocNote)
{
//adHocProcess must be same as one defined in R1SERVER_CONSTANT
//adHocTask must be same as Task Name defined in AdHoc Process
//adHocNote can be variable
//Optional 4 parameters = Assigned to User ID must match an AA user
//Optional 5 parameters = CapID
	var thisCap = capId;
	var thisUser = currentUserID;
	if(arguments.length > 3)
		thisUser = arguments[3]
	if(arguments.length > 4)
		thisCap = arguments[4];
	var userObj = aa.person.getUser(thisUser);
	if (!userObj.getSuccess())
	{
		logDebug("Could not find user to assign to");
		return false;
	}
	var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
	taskObj.setProcessCode(adHocProcess);
	taskObj.setTaskDescription(adHocTask);
	taskObj.setDispositionNote(adHocNote);
	taskObj.setProcessID(0);
	taskObj.setAssignmentDate(aa.util.now());
	taskObj.setDueDate(aa.util.now());
	taskObj.setAssignedUser(userObj.getOutput());
	wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
	wf.createAdHocTaskItem(taskObj);
	return true;
}


/**
 *  Copies all previously Failed inspections, and reschedules them when ANY inspection is scheduled.
 *  @param schedInspector - Inspector assigned to the Inspection the was explicitly scheduled.  Same inspector will be assigned to the auto-added inspections.
 *  @param schedDate - Scheduled date assigned to the Inspection the was explicitly scheduled.  Same scheduled date will be assigned to the auto-added inspections.
 *  @param myCap - capIdModel of the target record
 */
function AutoScheduleUnpassedInspections(schedInspector, schedDate, myCap) {
	
	capInspections = aa.inspection.getInspections(myCap);

	if (capInspections.getSuccess()) {
	   inspArray = capInspections.getOutput();
	} else {
	   aa.print(capInspections.getErrorMessage());
	   aa.abortScript();
	}

	if (schedInspector == "") {schedInspector = "BLDG"}
	
	i=0;
	x1=0;
	x2=0;
	x3=0;
	inspNotPassed = new Array();
	inspCompSched = new Array();
	inspToCreate = new Array();

	while(i < inspArray.length) {
	inspItem = inspArray[i];

	if (inspItem.getInspectionStatus() == "Fail"  || 
		inspItem.getInspectionStatus() == "No Access" ||
		inspItem.getInspectionStatus() == "Partial Approval" ||
		inspItem.getInspectionStatus() == "Phased fail fee charged" ||			
		inspItem.getInspectionStatus() == "Not Ready" ||
		inspItem.getInspectionStatus() == "Not ready-fee charged" ||
		inspItem.getInspectionStatus() == "Not Ready - Fee Charged") {
			inspNotPassed[x1] = inspItem.getInspectionType();
			x1 = x1 + 1;
		} 

	if (inspItem.getInspectionStatus() == "Pass" || 
		inspItem.getInspectionStatus() == "Phased pass fee charged" ||	
		inspItem.getInspectionStatus() == "Not Required" ||
		inspItem.getInspectionStatus() == "Scheduled" ||
		inspItem.getInspectionStatus() == "Final Pass") {
			inspCompSched[x2] = inspItem.getInspectionType();
			x2 = x2 + 1;
		}  	
		
	i = i + 1;
	}

	
	insp=0;
	aa.print("\n" + "INSPECTIONS NOT PASSED:");
	while(insp < inspNotPassed.length) {
	inspNotPassedItem = inspNotPassed[insp];

	if (!exists(inspNotPassedItem, inspCompSched) && !exists(inspNotPassedItem, inspToCreate)) {
		inspToCreate[x3] = inspNotPassedItem;
		x3 = x3 + 1;
	} 

	aa.print(inspNotPassedItem);
	insp = insp + 1;
	}

	insp=0;
	aa.print("\n" + "INSPECTION COMPLETED / SCHEDULED:");
	while(insp < inspCompSched.length) {
	inspCompSchedItem = inspCompSched[insp];
	aa.print(inspCompSchedItem);
	insp = insp + 1;
	}

	insp=0;
	aa.print("\n" + "INSPECTIONS TO BE RESCHEDULED:");
	while(insp < inspToCreate.length) {
	inspToCreateItem = inspToCreate[insp];
	scheduleInspectDate(inspToCreateItem,schedDate,schedInspector,null,"Automatically Added");  //This function doesn't execute in Script Tester, but does actually work in practice
	aa.print(inspToCreateItem + " / " + schedInspector + " / " + schedDate);
	insp = insp + 1;
	}
}
function updatefeenotes(feeCap,fcode,altid,feeComment)
{
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(feeCap,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		fsm1 = feeObjArr[ff].getF4FeeItem();
	        fsm1.setFeeNotes(feeComment);
                aa.finance.editFeeItem(fsm1);
}

function feeBalancebynotes(capid,fcode,altid)
	{
	// Searches payment fee items and returns the unpaid balance of a fee item

	var amtFee = 0;
	var amtPaid = 0;
	var maltid = altid + ".";

	var feeResult=aa.finance.getFeeItemByFeeCode(capid,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
			{
			amtFee+=feeObjArr[ff].getFee();
			var pfResult = aa.finance.getPaymentFeeItems(capid, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid+=pfObj[ij].getFeeAllocation()
				}
			}
	return amtFee - amtPaid;
	}

function feeAmountbynotes(capid,fcode,altid) 
	{
	var feeTotal = 0;
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(capid,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		feeTotal+= feeObjArr[ff].getF4FeeItem().getFee();
	
			
	return feeTotal;
	}

function cloneConditions(fromCapId, toCapId) 
	{

	var sourceCapID = aa.cap.getCapID(fromCapId);
	var targetCapID = aa.cap.getCapID(toCapId);
	var scapId = sourceCapID.getOutput();
	var tcapId = targetCapID.getOutput();
	
	var getFromCondResult = aa.capCondition.getCapConditions(scapId);
	if (getFromCondResult.getSuccess())
		var condA = getFromCondResult.getOutput();
	else
		{ logDebug( "**ERROR: getting cap conditions: " + getFromCondResult.getErrorMessage()) ; return false}
		
	for (cc in condA)
		{
		var addCapCondResult = aa.capCondition.cloneCapCondition(scapId,tcapId);
		if (addCapCondResult.getSuccess())
			logDebug("Successfully added condition");
		else
			logDebug( "**ERROR: adding condition" + addCapCondResult.getErrorMessage());
		}
	}
	
function HPrating (HP)
{
if(Number(HP) > 0 && Number(HP) < 50)
{
	var rating = "0.1";
}
else if(Number(HP) >= 50 && Number(HP) < 100)
{
	var rating = "50";
}
else if(Number(HP) >= 100 && Number(HP) < 200)
{
	var rating = "100";
}
else if(Number(HP) >= 200 && Number(HP) < 300)
{
	var rating = "200";
} 
else if(Number(HP) >= 300 && Number(HP) < 400)
{
	var rating = "300";
}
else if(Number(HP) >= 400 && Number(HP) < 500)
{
	var rating = "400";
}
else if(Number(HP) >= 500 && Number(HP) < 600)
{
	var rating = "500";
}
else if(Number(HP) >= 600)
{
	var rating = "600";
}	
else
{
	var rating = "no rating";
}
return rating;
}

function MMBturating (MMBtu)
{
if(Number(MMBtu) > 0 && Number(MMBtu) < 1.5)
{
	var rating = "0.1";
}
else if(Number(MMBtu) >= 1.5 && Number(MMBtu) < 5)
{
	var rating = "1.5";
}
else if(Number(MMBtu) >= 5 && Number(MMBtu) < 15)
{
	var rating = "5";
}
else if(Number(MMBtu) >= 15 && Number(MMBtu) < 50)
{
	var rating = "15";
}
else if(Number(MMBtu) >= 50 && Number(MMBtu) < 100)
{
	var rating = "50";
} 
else if(Number(MMBtu) >= 100 && Number(MMBtu) < 200)
{
	var rating = "100";
}
else if(Number(MMBtu) >= 200)
{
	var rating = "200";
}
else
{
	var rating = "no rating";
}
return rating;
}

function KVArating (KVA)
{
if(Number(KVA) > 0 && Number(KVA) < 150)
{
	var rating = "0.1";
}
else if(Number(KVA) >= 150 && Number(KVA) < 450)
{
	var rating = "150";
}
else if(Number(KVA) >= 450 && Number(KVA) < 4500)
{
	var rating = "450";
}
else if(Number(KVA) >= 4500 && Number(KVA) < 14500)
{
	var rating = "4500";
}
else if(Number(KVA) >= 14500 && Number(KVA) < 45000)
{
	var rating = "14500";
} 
else if(Number(KVA) >= 45000)
{
	var rating = "45000";
}
else
{
	var rating = "no rating";
}
return rating;
}
function feeExistsbynotes(feestr,altid) // optional statuses to check for
	{
	var checkStatus = false;
	var statusArray = new Array(); 
	var maltid = altid + ".";

	//get optional arguments 
	if (arguments.length > 2)
		{
		checkStatus = true;
		for (var i=2; i<arguments.length; i++)
			statusArray.push(arguments[i]);
		}

	var feeResult=aa.finance.getFeeItemByFeeCode(capId,feestr,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if ( feestr.equals(feeObjArr[ff].getF4FeeItem().getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getF4FeeItem().getFeeitemStatus(),statusArray) ) && (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes())))
			return true;
			
	return false;
	}
function sendEmailwAttchmnt(fromAddress,toAddress,ccAddress,reportSubject,reportContent,aaReportName,aaReportParamName,aaReportParamValue)
{
	var reportName = aaReportName;
	
	reportmodel = aa.reportManager.getReportInfoModelByName(reportName);
	report = reportmodel.getOutput(); 
	
	report.setModule(appTypeArray[0]); 
	report.setCapId(capId); 
	
	var parameters = aa.util.newHashMap();	
	//Make sure the parameters includes some key parameters. 
	parameters.put(aaReportParamName, aaReportParamValue);
	
	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		
		if(reportResult) 
		{ 
			reportResult = reportResult.getOutput(); 
			var reportFile = aa.reportManager.storeReportToDisk(reportResult); 

			reportFile = reportFile.getOutput();
			var sendResult = aa.sendEmail(fromAddress,toAddress,ccAddress, reportSubject, reportContent, reportFile);
		}
		if(sendResult.getSuccess()) 
			logDebug("A copy of this report has been sent to the valid email addresses."); 
		else 
			logDebug("System failed send report to selected email addresses because mail server is broken or report file size is great than 5M."); 
	}
	else
		logDebug("No permission to report: "+ reportName + " for Admin" + systemUserObj);
}
function getContactEmailByContactType(pContactType,capid)
{
	//Invoice Contact
	//Responsible Official
	// Returns the email address for the first Contact found on a Record with Contact Type = pContactType parameter
	// optional capid parameter
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capid;
	if (arguments.length == 2) thisCap = arguments[1];

	var cArray = new Array();

	if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
		{
		capContactArray = cap.getContactsGroup().toArray() ;
		}
	else
		{
		var capContactResult = aa.people.getCapContactByCapID(thisCap);
		if (capContactResult.getSuccess())
			{
			var capContactArray = capContactResult.getOutput();
			}
		}
	
	var contactEmailToReturn = "";
	var contactTypeForCompare = "";
	
	if (capContactArray)
	{
		for (yy in capContactArray)
		{
			contactTypeForCompare = capContactArray[yy].getPeople().contactType;
		
			if(contactTypeForCompare == pContactType)
			{
				contactEmailToReturn = capContactArray[yy].getPeople().email;
				logDebug("DEBUG: Found Contact with Type = " + pContactType + ".  Email address for Contact = " + contactEmailToReturn);
				break;
			}
		}
	}

	if(contactEmailToReturn == null)
	{
		contactEmailToReturn = "";
	}
	
	logDebug("Returning contact email address: " + contactEmailToReturn);
	return contactEmailToReturn;
}
function Nozrating (Noz)
{
if(Number(Noz) > 0 && Number(Noz) < 7)
{
	var rating = "06";
}
else if(Number(Noz) >= 7 && Number(Noz) < 13)
{
	var rating = "12";
}
else if(Number(Noz) >= 13 && Number(Noz) < 19)
{
	var rating = "18";
}
else if(Number(Noz) >= 19 && Number(Noz) < 25)
{
	var rating = "24";
}
else if(Number(Noz) >= 25 && Number(Noz) < 31)
{
	var rating = "30";
} 
else if(Number(Noz) >= 31)
{
	var rating = "31";
}
else
{
	var rating = "no rating";
}
return rating;
}
function getinvoicenumberbydate(capid,date)
{
	// date format needs to be MM/DD/YYYY
	var invoicenumber = "";
	
	iListResult = aa.finance.getInvoiceByCapID(capid,null);
	iList = iListResult.getOutput();
	for (iNum in iList)
		if(dateFormatted(iList[iNum].getInvDate().getMonth(),iList[iNum].getInvDate().getDayOfMonth(),iList[iNum].getInvDate().getYear(),"").equals(date))
			invoicenumber = iList[iNum].getInvNbr();
	return 	invoicenumber
}

function invoiceAllFeesPlacer(capid) {
	var itemCap = capid;
	var targetFees = loadFeesplacer(itemCap);
	var feeSeqArray = new Array();
	var paymentPeriodArray = new Array();
	for (tFeeNum in targetFees)
		{
		targetFee = targetFees[tFeeNum];
			if (targetFee.status == "NEW" && targetFee.notes.substring(0,3) != "AC-" && Number(targetFee.notes.length()) < 11)
				{
				feeSeqArray.push(targetFee.sequence);
				paymentPeriodArray.push(targetFee.period);

				}
		}
		var invoicingResult = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
		if (!invoicingResult.getSuccess())
			{
			logDebug("**ERROR: Invoicing fee items not successful.  Reason: " +  invoicingResult.getErrorMessage());
			return false;
			}
}

function loadFeesplacer(capid)
	{
	//  load the fees into an array of objects.  Does not
	var itemCap = capid;
	if (arguments.length > 0)
		{
		ltcapidstr = arguments[0]; // use cap ID specified in args
		if (typeof(ltcapidstr) == "string")
                {
				var ltresult = aa.cap.getCapID(ltcapidstr);
	 			if (ltresult.getSuccess())
  				 	itemCap = ltresult.getOutput();
	  			else
  				  	{ logMessage("**ERROR: Failed to get cap ID: " + ltcapidstr + " error: " +  ltresult.getErrorMessage()); return false; }
                }
		else
			itemCap = ltcapidstr;
		}

  	var feeArr = new Array();

	var feeResult=aa.fee.getFeeItems(itemCap);
		if (feeResult.getSuccess())
			{ var feeObjArr = feeResult.getOutput(); }
		else
			{ logDebug( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); return false }

		for (ff in feeObjArr)
			{
			fFee = feeObjArr[ff];
			var myFee = new Fee();
			var amtPaid = 0;
			var invoicenotes = "Blank"

			var pfResult = aa.finance.getPaymentFeeItems(itemCap, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if (fFee.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
						amtPaid+=pfObj[ij].getFeeAllocation()
				}
                    if (fFee.getF4FeeItemModel().getFeeNotes() != null)
					{
						invoicenotes = fFee.getF4FeeItemModel().getFeeNotes();
					}

			myFee.notes = invoicenotes;
			myFee.sequence = fFee.getFeeSeqNbr();
			myFee.code =  fFee.getFeeCod();
			myFee.description = fFee.getFeeDescription();
			myFee.unit = fFee.getFeeUnit();
			myFee.amount = fFee.getFee();
			myFee.amountPaid = amtPaid;
			if (fFee.getApplyDate()) myFee.applyDate = convertDate(fFee.getApplyDate());
			if (fFee.getEffectDate()) myFee.effectDate = convertDate(fFee.getEffectDate());
			if (fFee.getExpireDate()) myFee.expireDate = convertDate(fFee.getExpireDate());
			myFee.status = fFee.getFeeitemStatus();
			myFee.period = fFee.getPaymentPeriod();
			myFee.display = fFee.getDisplay();
			myFee.accCodeL1 = fFee.getAccCodeL1();
			myFee.accCodeL2 = fFee.getAccCodeL2();
			myFee.accCodeL3 = fFee.getAccCodeL3();
			myFee.formula = fFee.getFormula();
			myFee.udes = fFee.getUdes();
			myFee.UDF1 = fFee.getUdf1();
			myFee.UDF2 = fFee.getUdf2();
			myFee.UDF3 = fFee.getUdf3();
			myFee.UDF4 = fFee.getUdf4();
			myFee.subGroup = fFee.getSubGroup();
			myFee.calcFlag = fFee.getCalcFlag();;
			myFee.calcProc = fFee.getFeeCalcProc();

			feeArr.push(myFee)
			}

		return feeArr;
		}

function CreateCalendarAppt (DESCRIPTION,ENDDATE,ENDTIME,STARTDATE,STARTTIME,SUBJECT,LOCATION)
{
	// ENDDATE and STARTDATE has to be in this format YYYYMMDD
	// ENDTIME and STARTTIME is miltary time and format is HHMM
	var edate = ENDDATE.split("/");
	var endate = edate[2] + edate[0] + edate[1];
	var enddate = endate.toString();
	var sdate = STARTDATE.split("/");
	var stardate = sdate[2] + sdate[0] + sdate[1];
	var startdate = stardate.toString();
	var etime = ENDTIME.replace(":", "").toString();
	var stime = STARTTIME.replace(":", "").toString();
	
var e = "BEGIN:VCALENDAR\n";
e = e + "PRODID:-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN\n";
e = e + "VERSION:2.0\n";
e = e + "METHOD:PUBLISH\n";
e = e + "X-MS-OLK-FORCEINSPECTOROPEN:TRUE\n";
e = e + "BEGIN:VTIMEZONE\n";
e = e + "TZID:Pacific Standard Time\n";
e = e + "BEGIN:STANDARD\n";
e = e + "RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\n";
e = e + "TZOFFSETFROM:-0700\n";
e = e + "TZOFFSETTO:-0800\n";
e = e + "END:STANDARD\n";
e = e + "BEGIN:DAYLIGHT\n";
e = e + "RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\n";
e = e + "TZOFFSETFROM:-0800\n";
e = e + "TZOFFSETTO:-0700\n";
e = e + "END:DAYLIGHT\n";
e = e + "END:VTIMEZONE\n";
e = e + "BEGIN:VEVENT\n";
e = e + "CLASS:PUBLIC\n"; 
e = e + "DESCRIPTION:" + DESCRIPTION + "\n";
e = e + "DTEND;TZID='Pacific Standard Time':" + enddate + "T" + etime + "00\n";
e = e + "DTSTART;TZID='Pacific Standard Time':" + startdate + "T" + stime + "00\n";
e = e + "LOCATION:" + LOCATION + "\n";
e = e + "PRIORITY:5\n";
e = e + "SEQUENCE:0\n";
e = e + "SUMMARY;LANGUAGE=en-us:" + SUBJECT + "\n";
e = e + "TRANSP:OPAQUE\n";
e = e + "X-MICROSOFT-CDO-BUSYSTATUS:BUSY\n";
e = e + "X-MICROSOFT-CDO-IMPORTANCE:1\n";
e = e + "X-MICROSOFT-DISALLOW-COUNTER:FALSE\n";
e = e + "X-MS-OLK-AUTOFILLLOCATION:FALSE\n";
e = e + "X-MS-OLK-CONFTYPE:0\n";
e = e + "BEGIN:VALARM\n";
e = e + "TRIGGER:-PT2880M\n"; //controls the reminder time
e = e + "ACTION:DISPLAY\n";
e = e + "DESCRIPTION:Reminder\n";
e = e + "END:VALARM\n";
e = e + "END:VEVENT\n";
e = e + "END:VCALENDAR\n";
return e
}
function getinvoicebalance(InvNbr)
{
	var feeAmount = 0;
	var amtPaid = 0;
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getInvoiceNbr() == InvNbr)
			    {	
				  feeAmount += new Number(String(fList[fNum].getFee()));
			  var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess())
				{
				var pfObj = pfResult.getOutput();
				for (ij in pfObj)
					if ((fList[fNum].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()) && (pfObj[ij].getInvoiceNbr() == InvNbr))
						amtPaid+=pfObj[ij].getFeeAllocation()
				}
				}
				
				return feeAmount - amtPaid;
}
function getChildrencount(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		childStatus = childArray[xx].getCapStatus();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch && (childStatus.equals("ACTIVE") || childStatus.equals("Active")))
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray.length;

	}
function GALrating (GAL)
{
if(Number(GAL) > 0 && Number(GAL) < 40000)
{
	var rating = "0.1";
}
else if(Number(GAL) >= 40000 && Number(GAL) < 100000)
{
	var rating = "40000";
}
else if(Number(GAL) >= 100000 && Number(GAL) < 400000)
{
	var rating = "100000";
}
else if(Number(GAL) >= 400000 && Number(GAL) < 1000000)
{
	var rating = "400000";
}
else if(Number(GAL) >= 1000000 && Number(GAL) < 1500000)
{
	var rating = "1000000";
} 
else if(Number(GAL) >= 1500000)
{
	var rating = "1500000";
}
else
{
	var rating = "no rating";
}
return rating;
}

function SQFTrating(SQFT)
{
if(Number(SQFT) > 0 && Number(SQFT) < 10)
{
	var rating = "0.1";
}
else if(Number(SQFT) >= 10 && Number(SQFT) < 15)
{
	var rating = "10";
}
else if(Number(SQFT) >= 15 && Number(SQFT) < 25)
{
	var rating = "15";
}
else if(Number(SQFT) >= 25 && Number(SQFT) < 40)
{
	var rating = "25";
}
else if(Number(SQFT) >= 40 && Number(SQFT) < 100)
{
	var rating = "40";
} 
else if(Number(SQFT) >= 100)
{
	var rating = "100";
}
else
{
	var rating = "no rating";
}
return rating;
}
function getfeeFeeSeqNbr(capid,fcode,altid) 
	{
	var fsm = "No Sequence Number";
	var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(capid,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		fsm = feeObjArr[ff].getF4FeeItem().getFeeSeqNbr();
		return fsm;
        return fsm;
	}
function getParentPlacer(childcapid) 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(childcapid,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	}
function copyContactsExcludeType(pFromCapId, pToCapId, pContactType)
	{
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType
	var targetCapID = aa.cap.getCapID(pToCapId);
	var vToCapId  = targetCapID.getOutput();
	
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			{
			if(Contacts[yy].getCapContactModel().getContactType() != pContactType)
			    {
			    var newContact = Contacts[yy].getCapContactModel();
			    newContact.setCapID(vToCapId);
			    aa.people.createCapContact(newContact);
			    copied++;
			    logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
			    }
		
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
		}
	return copied;
	}
function removeCapContactplacer(capId)
{

var contact = aa.people.getCapContactByCapID(capId).getOutput();
for (x in contact)
{
	if (contact[x].getPeople().getContactType() != "Field Inspection") 
	{
	var test = aa.people.removeCapContact(capId,contact[x].getPeople().getContactSeqNumber());
	}
}
}

function copyContactsAQ(pFromCapId, pToCapId) {
	//Copies all contacts from pFromCapId to pToCapId
	//07SSP-00037/SP5017
	//
	if (pToCapId == null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;

	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			if (Contacts[yy].getPeople().getContactType() != "Field Inspection") 
			{
			var newContact = Contacts[yy].getCapContactModel();

			// Retrieve contact address list and set to related contact
			var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
			if (contactAddressrs.getSuccess()) {
				var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
				newContact.getPeople().setContactAddressList(contactAddressModelArr);
			}
			newContact.setCapID(vToCapId);

			// Create cap contact, contact address and contact template
			aa.people.createCapContactWithAttribute(newContact);
			copied++;
			logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
		}
		}
	} else {
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

function getuseremail(Name)
{ 
var email = "No Email Address";
var name = Name.split(" ");
var useremail = aa.person.getUser(name[0],"",name[1]).getOutput();
if (useremail.getEmail() != null && useremail.getEmail() != "")
{
	email = useremail.getEmail();
}

return email;
}
function getuserID(Name)
{ 
var userID = "No UserID";
var name = Name.split(" ");
var useremail = aa.person.getUser(name[0],"",name[1]).getOutput();
if (useremail.getUserID() != null && useremail.getUserID() != "")
{
	userID = useremail.getUserID();
}

return userID;
}
function InvoiceHasBPFees (InvNbr)
{
	var match = "False";
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getInvoiceNbr() == InvNbr && matches(fList[fNum].getFeeCode(),"BP_FEE","BP_EXT"))
			    {	
			       match = "True"
				}
	return match
}


function InvoiceHasPTOFees (InvNbr)
{
	var match = "False";
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getInvoiceNbr() == InvNbr && matches(fList[fNum].getFeeCode(),"AQENGPOEXCEP","AQENGPONONEM","AQ_PO_BOIL","AQ_P_BURNHTR","AQ_P_ELECENG","AQ_P_GASFUEL","AQ_P_MGASFUL","AQ_P_ELECHP","AQ_P_INCINER","AQ_P_PFE","AQ_P_SEMICON","AQ_P_STATCON"))
			    {	
			       match = "True"
				}
	return match
}
function InvoiceHasNOVFees (InvNbr)
{
	var match = "False";
	fList = aa.invoice.getFeeItemInvoiceByCustomizedNbr(InvNbr).getOutput()
			for (fNum in fList)
        	  if (fList[fNum].getInvoiceNbr() == InvNbr && matches(fList[fNum].getFeeCode(),"AQ_NOV"))
			    {	
			       match = "True"
				}
	return match
}

function copyDocuments(pFromCapId, pToCapId) {
//Copies all attachments (documents) from pFromCapId to pToCapId
var vFromCapId = pFromCapId;
var vToCapId = pToCapId;
var categoryArray = new Array();

// third optional parameter is comma delimited list of categories to copy.
if (arguments.length > 2) {
categoryList = arguments[2];
categoryArray = categoryList.split(",");
}

var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
if(capDocResult.getSuccess()) {
               if(capDocResult.getOutput().size() > 0) {
                              for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
                                             var documentObject = capDocResult.getOutput().get(docInx);
                                             currDocCat = "" + documentObject.getDocCategory();
                                             if (categoryArray.length == 0 || exists(currDocCat, categoryArray)) {
                                                            // download the document content
                                                            var useDefaultUserPassword = true;
                                                            //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                                                            var EMDSUsername = null;
                                                            var EMDSPassword = null;
                                                            var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                                                            if(downloadResult.getSuccess()) {
                                                                           var path = downloadResult.getOutput();
                                                                           logDebug("path=" + path);
                                                                           }
                                                            var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
                                                            documentObject.setDocumentNo(null);
                                                            documentObject.setCapID(vToCapId)
                                                            documentObject.setEntityID(tmpEntId);

                                                            // Open and process file
                                                            try {
                                                                           // put together the document content - use java.io.FileInputStream
                                                                           var newContentModel = aa.document.newDocumentContentModel().getOutput();
                                                                           inputstream = new java.io.FileInputStream(path);
                                                                           newContentModel.setDocInputStream(inputstream);
                                                                           documentObject.setDocumentContent(newContentModel);
                                                                           var newDocResult = aa.document.createDocument(documentObject);
                                                                           if (newDocResult.getSuccess()) {
                                                                                          newDocResult.getOutput();
                                                                                          logDebug("Successfully copied document: " + documentObject.getFileName());
                                                                                          }
                                                                           else {
                                                                                          logDebug("Failed to copy document: " + documentObject.getFileName());
                                                                                          logDebug(newDocResult.getErrorMessage());
                                                                                          }
                                                                           }
                                                            catch (err) {
                                                                           logDebug("Error copying document: " + err.message);
                                                                           return false;
                                                                           }
                                                            }
                                             } // end for loop
                              }
               }
}
function updateChildAltID2DigitsFilm(pcapId, ccapId, suffix) {
    /*---------------------------------------------------------------------------------------------------------/
    | Function Intent: 
    | This function is designed to update the AltId (b1permit.b1_alt_id) of an child record (ccapId).
    | The new AltId will be created using the AltId of its parent record (pcapId) plus the suffix variable
    | provided. Finally the end of the new id will be the number of child records of that record type.
    |
    | Example:
    | Parent AltId: 499-12-67872
    | Child AltId: 499-12-67872-ELEC-01
    |   499-12-67872-ELEC-02
    |   499-12-67872-ELEC-03
    |
    | Returns:
    | Outcome  Description   Return Type
    | Success: New AltID of Childrecord AltID String
    | Failure: Error    null null
    |
    | Call Example:
    | updateChildAltID(pcapId, ccapId, "-ELEC-"); 
    |
    | 01/15/2014 - TDunn
    | Version 2 Created
    |
    | Required paramaters in order:
    | pcapId - capId model of the parent record
    | ccapId - capId model of the child record
    | suffix - string that will be appended to the end of the parent AltId (ie. "-ELEC-")
    |
    /----------------------------------------------------------------------------------------------------------*/
    var p_AltId = pcapId.getCustomID();

    /* Only want first 11 chracters of Alt ID. <- This will be adjusted based on number of characters in Improvement Plan AltID */
    p_AltId = p_AltId.substring(0, 8);

    var c_AltId = ccapId.getCustomID();
    var c_cap = aa.cap.getCap(ccapId).getOutput();
    var c_appTypeResult = c_cap.getCapType();
    var c_appTypeString = c_appTypeResult.toString();
    var c_appTypeArray = c_appTypeString.split("/");

    //Get the number of child records by type provided
    var totChildren = getChildren(c_appTypeArray[0] + "/" + c_appTypeArray[1] + "/*/*", pcapId);
    if (totChildren === null || totChildren.length === 0)
    { logDebug("**ERROR: getChildren function found no children"); return null; }

    //Set the numeric suffix of the new AltId number to the actual number of child records that exists for the type.
    var totalFound = totChildren.length;
    var i = 0;

    //When using the clone feature multiple records can be created at the same time. When this happens the AltIds of the
    //children records are not set. To correctly set the AltIds we need to start with the last number and work backwards.
    //This ensures all the new child records receive a unique AltId.

    for (i = 0; i <= totChildren.length; i++) {

        //Add leading 0's if single digit
        if (totalFound < 10) { totalFound = '0' + totalFound; }

        var newAltId = p_AltId + suffix + totalFound + "";
        var updateResult = aa.cap.updateCapAltID(ccapId, newAltId);
        if (updateResult.getSuccess()) {
            logDebug("Updated child record AltId to " + newAltId + ".");
            break;
        }
        else {
            if (i == totalFound) {
                logDebug("** ERROR: Failed to update the AltID for " + c_AltId + ". " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
                return null;
            }
            //Might be duplicate because of multiple clones, try the next lower number
            totalFound = totChildren.length - (1 + i);
            //Check for negative
            if (totalFound < 0) {
                logDebug("**ERROR: Number used for AltID would be less than 0. Failed to update the AltID for " + c_AltId + ". ");
                return null;
            }
            logDebug("** Attempting the next number: " + totalFound + ".");
        }
    }
    return newAltId;
}




/*******
This would be called from InspectionMultipleScheduleAfter and/or InspectionScheduleAfter
Assumes you have a standard choice called DEPARTMENT_INFORMATION that stores department spcific information for the email. ex:
Standard Choice Value: Building Department
Value Desc: $$DepartmentName$$:Building Department|$$DepartmentAddress$$:123 S Overhere St.|$$DepartmentCity$$:Salt Lake City|$$DepartmentState$$:UT|$$DepartmentContactPhone$$:999-999-9999|$$DepartmentContactEmail$$:buildingdept@ut.com
*************************/
function emailNotificationNoAttachmentRemoteInspection(contactTypesList,notificationTemplateOnsite,notificationTemplateRemote,vCapId){
	//contact types separated by commas	
	
    contactTypes = new Array;
	contactTypes = contactTypesList.split(",")
    var capId = vCapId
    var acaURLDefault = lookup("ACA_CONFIGS", "ACA_SITE");
    if(!matches(acaURLDefault,null,undefined,""))
        acaURLDefault = acaURLDefault.substr(0, acaURLDefault.toUpperCase().indexOf("/ADMIN"));
    else
        acaURLDefault = null;
	
    var acaURL = acaURLDefault;
	report = null;
	contactArray = new Array;
	contactArray = getContactArray(capId);
	for (iCon in contactArray)
		{
		if (exists(contactArray[iCon]["contactType"],contactTypes))
			{
			params = aa.util.newHashtable(); 
			tContact =contactArray[iCon];
            getRecordParams4Notification(params);
            getACARecordParam4Notification(params,acaURL,capId);
			getInspectionScheduleParams4Notification(params)
			addParameter(params, "$$ContactName$$", tContact["fullName"]); // tContact["firstName"] + " " + tContact["lastName"]);addParameter(params, "$$ContactName$$", tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getDepartmentParams4Notification(params, "Building Department");
			if (inspSchedDate){
				addParameter(params, "$$inspSchedDate$$", inspSchedDate);
			}
			
			var hasRemoteInspectorURL = false;

				if (!matches(params.get("$$inspectorURL$$"),"NOT APPLICABLE - WILL BE ONSITE", "")){
					hasRemoteInspectorURL = true;
				}
			
			if(!matches(tContact["email"],null,"",undefined))
				{
					if(hasRemoteInspectorURL){
						sendNotification("noreply@placer.ca.gov",tContact["email"],"",notificationTemplateRemote ,params,null);
					}
					/*  // NO NEED FOR THIS for CDRA
					else
					{
						sendNotification("noreply@placer.ca.gov",tContact["email"],"",notificationTemplateOnsite ,params,null);
					}
					*/
				}
			}
		}
    }

function getStandardChoiceArray(stdChoice) {
	var cntItems = 0;
	var stdChoiceArray = new Array();
	var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		if(bizDomScriptObj != null){
			cntItems = bizDomScriptObj.size();
			logDebug("getStdChoiceArray: " + stdChoice + " size = " + cntItems);
			if (cntItems > 0) {
				var bizDomScriptItr = bizDomScriptObj.iterator();
				while (bizDomScriptItr.hasNext()) {
					var bizBomScriptItem = bizDomScriptItr.next();
					var stdChoiceArrayItem = new Array();
					stdChoiceArrayItem["value"] = bizBomScriptItem.getBizdomainValue();
					stdChoiceArrayItem["valueDesc"] = bizBomScriptItem.getDescription();
					stdChoiceArrayItem["active"] = bizBomScriptItem.getAuditStatus();
					stdChoiceArray.push(stdChoiceArrayItem);
				}
			}
		}
		else{
			logDebug("getStdChoiceArray: WARNING stdChoice not found - " + stdChoice);
		}
		
	}
	return stdChoiceArray;
}

//Abe>> commented this function. it's a duplicate of INCLUDES_ACCELA_FUNCTIONS
// function getRecordParams4Notification(params) {

// 	itemCapId = (arguments.length == 2) ? arguments[1] : capId;
// 	// pass in a hashtable and it will add the additional parameters to the table

// 	var itemCapIDString = itemCapId.getCustomID();
// 	var itemCap = aa.cap.getCap(itemCapId).getOutput();
// 	var itemCapName = itemCap.getSpecialText();
// 	var itemCapStatus = itemCap.getCapStatus();
// 	var itemFileDate = itemCap.getFileDate();
// 	var itemCapTypeAlias = itemCap.getCapType().getAlias();
// 	var itemHouseCount;
// 	var itemFeesInvoicedTotal;
// 	var itemBalanceDue;

// 	var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);
// 	if (itemCapDetailObjResult.getSuccess()) {
// 		itemCapDetail = itemCapDetailObjResult.getOutput();
// 		itemHouseCount = itemCapDetail.getHouseCount();
// 		itemFeesInvoicedTotal = itemCapDetail.getTotalFee();
// 		itemBalanceDue = itemCapDetail.getBalance();
// 	}

// 	var workDesc = workDescGet(itemCapId);

// 	addParameter(params, "$$altID$$", itemCapIDString);

// 	addParameter(params, "$$capName$$", itemCapName);

// 	addParameter(params, "$$recordTypeAlias$$", itemCapTypeAlias);

// 	addParameter(params, "$$capStatus$$", itemCapStatus);

// 	addParameter(params, "$$fileDate$$", itemFileDate);

// 	addParameter(params, "$$balanceDue$$", "$" + parseFloat(itemBalanceDue).toFixed(2));

// 	addParameter(params, "$$workDesc$$", (workDesc) ? workDesc : "");

// 	return params;

// }

/**
* Add Inspection Schedule After Parameters for use in Notification Templates. 
* This should be called from InspectionScheduleAfter Event
*
* @param params {HashMap}
* @return {HashMap}
*/

function getInspectionScheduleParams4Notification(params) {

	if (inspId) addParameter(params, "$$inspId$$", inspId);

	if (inspInspector) addParameter(params, "$$inspInspector$$", inspInspector);

	if (InspectorFirstName) addParameter(params, "$$InspectorFirstName$$", InspectorFirstName);

	if (InspectorMiddleName) addParameter(params, "$$InspectorMiddleName$$", InspectorMiddleName);

	if (InspectorLastName) addParameter(params, "$$InspectorLastName$$", InspectorLastName);

	if (InspectorFirstName && InspectorLastName) addParameter(params, "$$InspectorName$$", InspectorFirstName + " " + InspectorLastName);

	if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);
	
	if (inspType) addParameter(params, "$$inspType$$", inspType);
	
	if (inspSchedDate) addParameter(params, "$$inspSchedDate$$", inspSchedDate);

	if (exists(vEventName, ['InspectionMultipleScheduleAfter', 'InspectionScheduleAfter'])) {
		var adHocRemoteInspection = false;
		var adHocURL = null;
		var pim = inspObj.getInspection();
		var pact = pim.getActivity();
		var iUnits = null;

		if (inspInspectorObj) {
			var InspectorPhoneNumber = inspInspectorObj.getPhoneNumber();
			var InspectorEmail = inspInspectorObj.getEmail();
			if (InspectorPhoneNumber) addParameter(params, "$$InspectorPhoneNumber$$", InspectorPhoneNumber);
			if (InspectorEmail) addParameter(params, "$$InspectorEmail$$", InspectorEmail);
		}

		if (pim.getScheduledTime()) addParameter(params, "$$inspSchedTimeStart$$", pim.getScheduledTime2() + " " + pim.getScheduledTime());
		if (pim.getScheduledEndTime()) addParameter(params, "$$inspSchedTimeEnd$$", pim.getScheduledEndTime2() + " " + pim.getScheduledEndTime());

		if (pact.getUnitNBR() != null && pact.getUnitNBR() != "") {
			var inspUnitNumberUpper = pact.getUnitNBR().toString().toUpperCase();
			if(inspUnitNumberUpper == "REMOTE"){
				adHocRemoteInspection = true;
			}
        if (inspUnitNumberUpper == "REMOTE") {
				adHocRemoteInspection = true;
			}
			else if (inspUnitNumberUpper == "ONSITE") {
				adHocRemoteInspection = false;
				adHocURL = "NOT APPLICABLE - WILL BE ONSITE";
			}
			else if(inspUnitNumberUpper.indexOf("HTTP") > -1){
				adHocURL = pact.getUnitNBR();
			}
		}
		addParameter(params, "$$inspectorURL$$", getInspectorWebConferenceURL(inspInspector, inspGroup, inspType, adHocURL, adHocRemoteInspection));
	}

	return params;

}

function getPrimaryAddressLineParam4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
	}

	return params;
}
function getDepartmentParams4Notification(eParamsHash, deptName) {
	if (deptName == null) {
		return eParamsHash;
	}
	var rptInfoStdArray = getStandardChoiceArray("DEPARTMENT_INFORMATION");
	var foundDept = false;

	var valDesc = null;
	var defaultDeptValDesc = null;
	for (s in rptInfoStdArray) {
		if (rptInfoStdArray[s]["active"] == "A" && String(rptInfoStdArray[s]["value"]).toUpperCase() == String(deptName).toUpperCase()) {
			valDesc = rptInfoStdArray[s]["valueDesc"];
			if (isEmptyOrNull(valDesc)) {
				return eParamsHash;
			}
			valDesc = String(valDesc).split("|");
			foundDept = true;
			break;
		}//active and name match
		if (rptInfoStdArray[s]["active"] == "A" && String(rptInfoStdArray[s]["value"]).toUpperCase() == "DEFAULT") {
			defaultDeptValDesc = rptInfoStdArray[s]["valueDesc"];
			if (isEmptyOrNull(defaultDeptValDesc)) {
				return eParamsHash;
			}
			defaultDeptValDesc = String(defaultDeptValDesc).split("|");
		}
	}//all std-choice rows

	if (!foundDept) {
		// No department found, use default values
		valDesc = defaultDeptValDesc;
	}

	if (!isEmptyOrNull(valDesc)) {
		for (e in valDesc) {
			var parameterName = "";
			var tmpParam = valDesc[e].split(":");
			if (tmpParam[0].indexOf("$$") < 0)
				parameterName = "$$" + tmpParam[0].replace(/\s+/g, '') + "$$";
			else
				parameterName = tmpParam[0];

			addParameter(eParamsHash, parameterName, tmpParam[1]);
		}//for all parameters in each row
	}//has email parameters

	return eParamsHash;
}

function getInspectorWebConferenceURL(inspInspector, inspGroup, inspType, overrideURL, adhocRemoteInspection) {
    if (overrideURL && overrideURL != "") {
        return overrideURL;
    }
    var URL = lookup("REMOTE_INSPECTIONS_URLS", inspInspector);
    if (URL && URL != "") {
        if (adhocRemoteInspection) {
            return URL;
        }
        var inspGroupSetting = lookup("REMOTE_INSPECTIONS_ALLOWED_INSPECTION_TYPES", inspGroup);
        if (inspGroupSetting && inspGroupSetting != "") {
            var inspGroupSettingArray = inspGroupSetting.split(',');
            for (var i in inspGroupSettingArray) {
                var scInspType = inspGroupSettingArray[i];
                if (scInspType.toString().trim() == inspType) {
                    return URL;
                }
            }
        }
    }
    return "";
}
function isEmptyOrNull(value) {
	return value == null || value === undefined || String(value) == "";
}
/************  finish update for remote inspections****/

function sendAppToACA4Edit(isEditable){
    var vCapID = capId;
    if(arguments.length == 2)
        vCapID = arguments[1];
    
    var vCap = aa.cap.getCap(vCapID).getOutput().getCapModel();

    var editable = "EDITABLE";
    if(!isEditable){
        editable = "COMPLETE";
    }

    vCap.setCapClass(editable);
    aa.cap.editCapByPK(vCap);
}

/**
 * getUserObjsByDistrict
 * Description: Returns an array of userObj objects for all users in the system that match districtName
 * 
 * @param districtName {string}
 * @return array {userObj}
 */
function getUserObjsByDistrict(districtName){ 
	var userObjArray = new Array();
	var sysUserList
	var sysUserResult = aa.people.getSysUserList(aa.util.newQueryFormat());
	
	if (sysUserResult.getSuccess()) {
			sysUserList = sysUserResult.getOutput()
		} else {
			logDebug("**ERROR: getUserObjsByDistrict: " + sysUserResult.getErrorMessage());
			return userObjArray;
		}
	
	for(var iUser in sysUserList){
		var userId = sysUserList[iUser].getUserID();
		if (userId) {
				var vUserObj = new userObj(userId);
				var vUserDistArray = vUserObj.getUserDistricts();
				
				if (!districtName|| exists(districtName, vUserDistArray)) {
					userObjArray.push(vUserObj);
				}
        }
	}
	
	return userObjArray;
	
}

/**
 * getUserObjs
 * Description: Returns an array of userObj objects for all users in the system
 * 
 * @return array {userObj}
 */
function getUserObjs(){ 
	var userObjArray = new Array();
	var sysUserList
	var sysUserResult = aa.people.getSysUserList(aa.util.newQueryFormat());
	
	if (sysUserResult.getSuccess()) {
			sysUserList = sysUserResult.getOutput();
		} else {
			logDebug("**ERROR: getUserObjs: " + sysUserResult.getErrorMessage());
			return userObjArray;
		}
	
	for(var iUser in sysUserList){
		var userId = sysUserList[iUser].getUserID();
		if (userId) {
                userObjArray.push(new userObj(userId));
        }
	}
	
	return userObjArray;
	
}

/**
 * getUserInspectorObjs
 * Description: Returns an array of userObj objects for all users in the system that are inspectors
 * 
 * @return array {userObj}
 */
function getUserInspectorObjs(){ 
	var userObjArray = new Array();
	var sysUserList
	var sysUserResult = aa.people.getSysUserList(aa.util.newQueryFormat());
	
	if (sysUserResult.getSuccess()) {
			sysUserList = sysUserResult.getOutput();
		} else {
			logDebug("**ERROR: getUserObjs: " + sysUserResult.getErrorMessage());
			return userObjArray;
		}
	
	for(var iUser in sysUserList){
        var userId = sysUserList[iUser].getUserID();
        var isInspector = sysUserList[iUser].getIsInspector();
		if (isInspector && userId) {
            logDebug ("userId = " + userId + " - isInspector = " + isInspector);
                userObjArray.push(new userObj(userId));
        }
	}
	
	return userObjArray;
	
}

/**
 * User Object
 * Constructor:
 * @param vUserId {string} User ID
 * @return {boolean}
 *
 * Methods:
 * getEmailTemplateParams
 * @param params {HashTable}
 * @param [userType] {string} Used to create email paramerters
 * @return params {HashTable}
 *
 * getUserDisciplines()
 * @return disciplineArray {array}
 *
 * getUserDistricts()
 * @return districtArray {array}
 */
function userObj(vUserId){
	this.userID = null;
	this.userFirstName = null;
	this.userLastName =  null;
	this.userMiddleName = null;
	this.userInitial = null;
	this.userEmail = null;
	this.userTitle = null;
	this.phoneNumber = null;
	this.dailyInspUnits = null;
	this.isInspector = null;
	this.userStatus = null;
	this.billingRate = null;
	this.cashierID = null;
	this.userObject = null;
	this.userFullName = null;
	
	var iNameResult = null;
	
	if(vUserId)
		iNameResult = aa.person.getUser(vUserId.toUpperCase());

	if (iNameResult.getSuccess()){
		var iUserObj = null;
		iUserObj = iNameResult.getOutput();
		this.userObject = iUserObj;
		this.userID = iUserObj.getUserID();
		this.userFirstName = iUserObj.getFirstName();
		this.userLastName =  iUserObj.getLastName();
		this.userMiddleName = iUserObj.getMiddleName();
		this.userFullName = iUserObj.getFullName();
		this.userInitial = iUserObj.getInitial();
		this.userEmail = iUserObj.getEmail();
		this.userTitle = iUserObj.getTitle();
		this.phoneNumber = iUserObj.getPhoneNumber();
		this.dailyInspUnits = iUserObj.getDailyInspUnits();
		this.isInspector = iUserObj.getIsInspector();
		this.userStatus = iUserObj.getUserStatus();
		this.billingRate = iUserObj.getRate1();
		this.cashierID = iUserObj.getCashierID();
	}
	else{ logDebug("**ERROR retrieving user model for" + vUserId + " : " + iNameResult.getErrorMessage()) ; return false ; }
	
 this.getEmailTemplateParams = function (params, userType) {
			if(matches(userType,null,undefined,"")) userType = "user";
			
            addParameter(params, "$$" + userType + "LastName$$", this.userLastName);
            addParameter(params, "$$" + userType + "FirstName$$", this.userFirstName);
            addParameter(params, "$$" + userType + "MiddleName$$", this.userMiddleName);
            addParameter(params, "$$" + userType + "Initials$$", this.userInitial);
            addParameter(params, "$$" + userType + "PhoneNumber$$", this.phoneNumber);
            addParameter(params, "$$" + userType + "Email$$", this.userEmail);
            addParameter(params, "$$" + userType + "Title$$", this.userTitle);
			addParameter(params, "$$" + userType + "DailyInspUnits$$", this.dailyInspUnits);
			addParameter(params, "$$" + userType + "BillingRate$$", this.billingRate);
			addParameter(params, "$$" + userType + "CashierID$$", this.cashierID);
            addParameter(params, "$$" + userType + "FullName$$", this.userFullName);
            return params;
            }

	this.getUserDistricts = function () {
		var result = aa.people.getUserDistricts(this.userID);
		var userDistrictModelArray = result.getOutput();
		var districtArray = new Array();
		
		for(iD in userDistrictModelArray){
			var userDistrictModel = userDistrictModelArray[iD];
			if(userDistrictModel.getRecStatus() == 'A'){
				districtArray.push(userDistrictModel.getDistrict());
			}
		}
		
		return districtArray;
	}
	
	this.getUserDisciplines = function () {
		var result = aa.people.getUserDisciplines(this.userID);
		var userDisciplineModelArray = result.getOutput();
		var disciplineArray = new Array();
		
		for(iD in userDisciplineModelArray){
			var userDisciplineModel = userDisciplineModelArray[iD];
			if(userDisciplineModel.getRecStatus() == 'A'){
				disciplineArray.push(userDisciplineModel.getDiscipline());
			}
		}
		
		return disciplineArray;
	}	
}
function feeAmountbynotesandyear(capid,fcode,altid,year) 
	{
	var feeTotal = 0;
        var maltid = altid + ".";
	var feeResult=aa.finance.getFeeItemByFeeCode(capid,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if ((altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()) || maltid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes())) && String(feeObjArr[ff].getF4FeeItem().getApplyDate()).substring(0,4) == year)
		feeTotal+= feeObjArr[ff].getF4FeeItem().getFee();
	
			
	return feeTotal;
	}
	
function createNotificationTPS2(emailTemplate,doContacts,vContactTypes,doLp,vLicType,lpToEmail,doOtherContacts,getOwner,getPrimeAddr,doStaffEmail,addParentID,staffDefault) 
{
	/*========================================================================================================================================================================== 
	| This is a standarized function for generating one or multiple email notifications using the scripting engine and the Notification templates.  
	| The following parameters must be passed to this function:
	| Email Template = name of the notification template to be used for this email.
	| doContacts = set to "Y" if contact emails are included in the 'to email' distribution list. Set to "N" otherwise
	| vContactTypes = list of contact types to include in the 'to email' list. Enter list as types separated by commas with only one set of "" e.g. "Applicant,Arborist,Designer"
	| doLp = set to "Y" or "N" to control if licensed professionals are included in the distribution list. If set to "N", vLicType and lpToEmail can be set to "N"
	| vLicType = array of license types to include in the licensed professional email list (e.g. vLicType = "Contractor,Electrical")
	| lpToEmail = set to "Y" or "N" to control if licensed professionals are in the 'to email' list or the 'copy to' list, if "Y" then 'to email' if "N" 'copy email';
	| doOtherContacts = set to "Y" or "N" to control if 'other' contact types should be included in the vCcEmail list (copy to list). 
	| getOwner = set to "Y" or "N" to control if Owner information is included in the parameter list.
	| getPrimeAddr = set to "Y" or "N" to control if primary address for record is required for the notification parameter list.
	| doStaffEmail = set to "Y" or "N" to control if assigned staff is included in the 'to email' list, set to 'T' if staffDefault is to be used as the assignedStaff.
	| addParentID = set to "Y" or "N" to control if parent altId of current record is included in the notification. 
	| staffDefault = the email address of the staff member to include in the vToEmail if no staff is assigned to the record. Use userID if toStaffEmail set to 'T'
	/------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
	/* Initialize standard parameters for notification */
	var vEmailSent = false;
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var pcapIdString = "";
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	vFromEmail = "";
	logDebug(" Do staff=" + doStaffEmail + ", Add parent= " + addParentID + ", Staff default = " + staffDefault);

	// start loading parameters for notification
	logDebug("loading deeplink parameters");
	var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
	acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaAppTypeAlias$$
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	addParameter(reportParams,"RecordID",capIDString); 

	// add short notes parameter
	var sNotes = getShortNotes();
	addParameter(emailParameters,"$$shortNotes$$",sNotes);

	if(appTypeArray[0] == "Building")
	{
		var nScope = getAppSpecific("Scope of Work",capId);
		var nOffice = getAppSpecific("Project Office",capId);
		var nTypeOfWork = getAppSpecific("Type of Work",capId);
		addParameter(emailParameters,"$$scopeOfWork$$",nScope);
		addParameter(emailParameters,"$$typeOfWork$$",nTypeOfWork);
		addParameter(emailParameters,"$$projectoffice$$",nOffice);
	}

	if(vEventName == "WorkflowTaskUpdateAfter") {
		addParameter(emailParameters,"$$wfStatusParam$$", wfStatus); 
		addParameter(emailParameters,"$$wfDateParam$$", wfDateMMDDYYYY); 
		addParameter(emailParameters,"$$taskNameParam$$",wfTask);
		addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
		wfDueDate = getTaskDueDate("wfTask");
		if(wfDueDate != null) {
			addParameter(emailParameters,"$$wfDueDateParam$$",wfDueDate);
		}
	}

	if (vEventName == "InspectionScheduleAfter") {
		addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
		addParameter(emailParameters, "$$inspType$$", inspType);
	}

	if(getOwner == "Y") {
		getPrimaryOwnerParams4Notification(emailParameters);
	}

	if(addParentID == "Y") {
		pcapId = getParent();
		if(pcapId != null) {
		pcapIDString = pcapId.getCustomID();
		addParameter(emailParameters,"$$parentAltId$$",pcapIDString);
		}
	}

	/* Get To email contact types */
	/* Some of the parameters returned by the getContactParams4Notification() function: $$contactFullName$$; $$contactEmail$$; $$contactFirstName$$; $$contactLastName$$; $$contactAddressLine1$$; $$contactPhoneNumber1$$ */
	if(doContacts == "Y" || doOtherContacts == "Y") {
		var cTypeArray = new Array();
		cTypeArray = vContactTypes.split(",");
	}
	/* Get To emails for contacts */
	if(doContacts == "Y") {
		var conArray = new Array();
		conArray = getContactArrayWithPrimary(capId); 
		for (thisCon in conArray) {
			if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
				logDebug(conArray[thisCon]["contactType"]) ;
				getContactParams4Notification(emailParameters, conArray[thisCon]);
				if(emailParameters.get("$$contactEmail$$") != null) {
				vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
				}
			}
		}

	}
	/* Get cc emails for other contacts */
	if(doOtherContacts == "Y") {
		conArray = getContactArrayWithPrimary(capId);
		for (thisCon in conArray) {
			if(!exists(conArray[thisCon]["contactType"],cTypeArray) && conArray[thisCon]["email"] != null && conArray[thisCon]["email"] != "") {
				vCcEmail = vCcEmail + conArray[thisCon]["email"] + "; ";
			}
		}
	}

	if(doLp == "Y") {
		var licProfsArray = new Array(); 
		var vLicTypeArray = new Array();
		licProfsArray = getLicenseProfessional(capId);
		vLicTypeArray = vLicType.split(",");
		for(thisProf in licProfsArray) {
			currentProf = licProfsArray[thisProf]; 
			lpType = currentProf.getLicenseType();
			if((currentProf.getEmail() != null && currentProf.getEmail() != "") && exists(lpType, vLicTypeArray)) {
				profEmail = currentProf.getEmail();
				if((profEmail != null && profEmail != "") && lpToEmail == "Y") {
					vToEmail = vToEmail + profEmail + "; ";
				}
				if((profEmail != null && profEmail != "") && lpToEmail != "Y") {
					vCcEmail = vCcEmail + profEmail + "; ";
				}
			}
		}
	}

	/* Get primary permit address */
	if(getPrimeAddr == "Y") {
		getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */
	}

	/* Get assigned staff email address */
	if(doStaffEmail == "Y") {
		var vStaffEmail = staffDefault; 
		logDebug("Staff default is: " + staffDefault);
		var assignedToEmail = ""; 
		var assignedTo = getAssignedToStaff(); 
		if(assignedTo != null) {
			assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
			logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
			if(!matches(assignedToEmail,undefined,"",null)) {
				vStaffEmail = assignedToEmail;
			}
		}
		vToEmail = vToEmail + vStaffEmail + "; "; 
	}


	/* If record is assigned to staff add assigned staff parameters */
	var assignedStaff = getAssignedToStaff(); 
	if(doStaffEmail == "T" && staffDefault != "") {
		assignedStaff = staffDefault;
	}
	if(assignedStaff != null) {
	staffResult = aa.person.getUser(assignedStaff);
		if (!staffResult.getSuccess())
			{ logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
		if (staffResult.getSuccess()) {
		staffObject = staffResult.getOutput();
		var staffEmail = staffObject.getEmail();
		var staffFirst = staffObject.getFirstName(); 
		var staffLast = staffObject.getLastName(); 
		logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
		}
		var staffName = staffFirst + " " + staffLast;
		if(!matches(staffEmail,undefined,"",null)) {
			addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
			addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
			addParameter(emailParameters,"$$staffNameParam$$",staffName);
		}
	}



	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
	// aa.print("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

	// vToEmail = "tdunn@truepointsolutions.com"; vCcEmail = "tdunn@truepointsolutions.com";
	vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
	logDebug("Email Sent = " + vEmailSent); 

}

function loadCustomScript(scriptName) {

    try {
        scriptName = scriptName.toUpperCase();
        var emseBiz = aa.proxyInvoker.newInstance(
                "com.accela.aa.emse.emse.EMSEBusiness").getOutput();
        var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),
                scriptName, "ADMIN");
        eval(emseScript.getScriptText() + "");

    } catch (error) {
        showDebug = true;
        logDebug("<font color='red'><b>WARNING: Could not load script </b></font>" + scriptName + ". Verify the script in <font color='blue'>Classic Admin>Admin Tools>Events>Scripts</font>");
    }
}

function copyOwnerTPS(sCapID, tCapID)
{
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
		var ownrObj = ownrReq.getOutput();
		for (xx in ownrObj)
		{
			ownrObj[xx].setCapID(tCapID);
			aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
			logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName())
		}
	}
	else
		logDebug("Error Copying Owner : " + ownrObj.getErrorType() + " : " + ownrObj.getErrorMessage());
}

/*---------------------------------------------
|	This function is required for the new SOAP CSLB Integration
|	This needs to be included in the INCLUDES_CUSTOM
|	TruePoint Solutions - Jan 2021
|	
-----------------------------------------------*/
function XMLTagValue(xmlstring, tag) {
  var startIndex = xmlstring.indexOf("<" + String(tag) + ">");
  if (startIndex == -1) return "";
  //   logDebug("startIndex:" + startIndex);
  //   logDebug("");
  var endIndex = xmlstring.indexOf("</" + String(tag) + ">", startIndex + 1);
  //   logDebug("endIndex:" + endIndex);
  //   logDebug("");
  //   logDebug("");
  var substring = xmlstring.slice(
    startIndex + 1 + String(tag).length + 1,
    endIndex
  );
  //   logDebug("substring:" + substring);
  //   logDebug("");
  //   logDebug("");
  return substring;
}

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, "");
}

String.prototype.formatToHTML = function () {
    return this.replace("&\amp;", "&").replace("&\nbsp;", " ").replace("&\lt;", "<").replace("&\gt;", ">").replace("&\quot;", "\"").replace("<br />", "\r\n");
}

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
			returnMessage +="Headers:" + headers + " : ";
			returnMessage +="Payload: "+ xmlout + " : ";
			returnMessage +="Result: " + result + " : ";
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
commt += "\tSuretyTp: " + SuretyCompany +  "\n\tBondNo: " + ContractorBondNumber + "\n\tBond Amount: "+ContractorBondAmount + "\n\n";
commt += "WORKERS COMP: \n";
commt += "\tExempt: " + WorkersCompCoverageType + "\n\tInsCoCde: " + WorkersCompPolicyNumber + "\n\tInsCoName: " + WorkersCompInsuranceCompany + "\n";
commt += "\tPolicyNo: " + WorkersCompPolicyNumber + "\n\tWCEffDt: " + PolicyEffectiveDate +"\n\tWCExpDt: " + PolicyExpirationDate + "\n\tWCCancDt: " + PolicyCancellationDate + "\n";	

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
		if(PolicyCancellationDate)
		newLic.setWcCancDate(aa.date.parseDate(PolicyCancellationDate));
	var WorkersCompInsuranceCompany = XMLTagValue(result, "WorkersCompInsuranceCompany");
		if(WorkersCompInsuranceCompany)
		newLic.setInsuranceCo(WorkersCompInsuranceCompany);
	var WorkersCompCoverageType = XMLTagValue(result, "WorkersCompCoverageType");
		if(WorkersCompCoverageType == "Exempt") newLic.setWcExempt("Y"); else newLic.setWcExempt("N");

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
	if(ContractorBondNumber)
	editRefLicProfAttribute(licNum, "BOND NUMBER",ContractorBondNumber);
	
	var BondEffectiveDate = XMLTagValue(result, "BondEffectiveDate");
	if(BondEffectiveDate)
	editRefLicProfAttribute(licNum, "BOND EFFECTIVE DATE",BondEffectiveDate);
	
	var SuretyCompany = XMLTagValue(result, "SuretyCompany");
	if(SuretyCompany)
	editRefLicProfAttribute(licNum, "BOND INSURANCE COMPANY",SuretyCompany);

	var BondCancellationDate = XMLTagValue(result, "BondCancellationDate");
	if(BondCancellationDate)
	editRefLicProfAttribute(licNum, "BOND EXPIRATION",BondCancellationDate);
	
	//Added for Placer 3/10/2021
	var ExpirationDate = XMLTagValue(result, "ExpirationDate");
	if (ExpirationDate)
	editRefLicProfAttribute(licNum,"EXPIRATION DATE",ExpirationDate);

	var WorkersCompPolicyNumber = XMLTagValue(result, "WorkersCompPolicyNumber");
	if (WorkersCompPolicyNumber)
	editRefLicProfAttribute(licNum,"WORKERS POLICY",WorkersCompPolicyNumber);
		
	var PolicyExpirationDate = XMLTagValue(result, "PolicyExpirationDate");
	if (PolicyExpirationDate)
	editRefLicProfAttribute(licNum,"WORKERS EXP",PolicyExpirationDate);
		
	var WorkersCompCoverageType = XMLTagValue(result, "WorkersCompCoverageType");
	if(WorkersCompCoverageType) 
	editRefLicProfAttribute(licNum,"WORKMANS COMP EXEMPT",WorkersCompCoverageType);
	
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
function updateChildAltID2DigitsAQ(pcapId, ccapId, suffix) {
    /*---------------------------------------------------------------------------------------------------------/
    | Function Intent: 
    | This function is designed to update the AltId (b1permit.b1_alt_id) of an child record (ccapId).
    | The new AltId will be created using the AltId of its parent record (pcapId) plus the suffix variable
    | provided. Finally the end of the new id will be the number of child records of that record type.
    |
    | Example:
    | Parent AltId: 499-12-67872
    | Child AltId: 499-12-67872-ELEC-01
    |   499-12-67872-ELEC-02
    |   499-12-67872-ELEC-03
    |
    | Returns:
    | Outcome  Description   Return Type
    | Success: New AltID of Childrecord AltID String
    | Failure: Error    null null
    |
    | Call Example:
    | updateChildAltID(pcapId, ccapId, "-ELEC-"); 
    |
    | 01/15/2014 - TDunn
    | Version 2 Created
    |
    | Required paramaters in order:
    | pcapId - capId model of the parent record
    | ccapId - capId model of the child record
    | suffix - string that will be appended to the end of the parent AltId (ie. "-ELEC-")
    |
    /----------------------------------------------------------------------------------------------------------*/
    var p_AltId = pcapId.getCustomID();

    /* Only want first 11 chracters of Alt ID. <- This will be adjusted based on number of characters in Improvement Plan AltID */
    //p_AltId = p_AltId.substring(0, 10);

    var c_AltId = ccapId.getCustomID();
    var c_cap = aa.cap.getCap(ccapId).getOutput();
    var c_appTypeResult = c_cap.getCapType();
    var c_appTypeString = c_appTypeResult.toString();
    var c_appTypeArray = c_appTypeString.split("/");

    //Get the number of child records by type provided
    var totChildren = getChildren(c_appTypeArray[0] + "/" + c_appTypeArray[1] + "/*/*", pcapId);
    if (totChildren === null || totChildren.length === 0)
    { logDebug("**ERROR: getChildren function found no children"); return null; }

    //Set the numeric suffix of the new AltId number to the actual number of child records that exists for the type.
    var totalFound = totChildren.length;
    var i = 0;

    //When using the clone feature multiple records can be created at the same time. When this happens the AltIds of the
    //children records are not set. To correctly set the AltIds we need to start with the last number and work backwards.
    //This ensures all the new child records receive a unique AltId.

    for (i = 0; i <= totChildren.length; i++) {

        //Add leading 0's if single digit
        if (totalFound < 10) { totalFound = '0' + totalFound; }

        var newAltId = p_AltId + suffix + totalFound + "";
        var updateResult = aa.cap.updateCapAltID(ccapId, newAltId);
        if (updateResult.getSuccess()) {
            logDebug("Updated child record AltId to " + newAltId + ".");
            break;
        }
        else {
            if (i == totalFound) {
                logDebug("** ERROR: Failed to update the AltID for " + c_AltId + ". " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
                return null;
            }
            //Might be duplicate because of multiple clones, try the next lower number
            totalFound = totChildren.length - (1 + i);
            //Check for negative
            if (totalFound < 0) {
                logDebug("**ERROR: Number used for AltID would be less than 0. Failed to update the AltID for " + c_AltId + ". ");
                return null;
            }
            logDebug("** Attempting the next number: " + totalFound + ".");
        }
    }
    return newAltId;
}

function doConfigurableScriptActions(){
try {
    var module = null;

    if (appTypeArray && appTypeArray[0] != undefined) {
        module = appTypeArray[0];
    }

    if (module == null || module == undefined) {
        var itemCap = aa.cap.getCap(capId).getOutput();
        var itemCapModel = itemCap.getCapModel();
        module = itemCapModel.getModuleName();
    }

    if (module == null || module == undefined) {
        logDebug("ERROR: Unable to identify module");
        return null;
    }
} catch (err) {
    logDebug("ERROR: doConfigurableScriptActions Error Message:" + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}
                
                rulesetName = "CONFIGURABLE_RULESET_" + module;
                rulesetName = rulesetName.toUpperCase();
                logDebug("rulesetName: " + rulesetName);
                
                try{
                                var configRuleset = getScriptText(rulesetName);
                                if (configRuleset == ""){
                                                logDebug("No JSON file exists for this module.");
                                }else{
                                var configJSON = JSON.parse(configRuleset);

                 // match event, run appropriate configurable scripts
                                settingsArray = [];
                                if(configJSON[controlString]) {
                                                var ruleSetArray = configJSON[controlString];
                                                var scriptsToRun = ruleSetArray.StandardScripts;
                                                
                                                 for (s in scriptsToRun){
                                                                logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s]);
                                                                var script = scriptsToRun[s];
                                                                var validScript = getScriptText(script);
                                                                if (validScript == ""){
                                                                                logDebug("Configurable script " + script + " does not exist.");
                                                                }else{
                                                                                eval(getScriptText(scriptsToRun[s]));
                                                                }
                                                }
                                }
                }
                }
                catch(err){
                                logDebug("ERROR: doConfigurableScriptActions " + rulesetName + " Error Message:" + err.message);
                }
                
}

function addSpFeesTPS(landUse) {

	var slFlags = "";  
	var slFlagCodes = new Array();   
	var slLookupTable = "sdl:Land Use Codes"; 
	var pvspFeeType = AInfo["PVSP Impact Fee Type"];
	var foundFees = false;
	if(AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"] != null) {
		slFlags = AInfo["ParcelAttribute.SPECIAL_LAND_FEES_FLAGS"];
		
		slFlagCodes = slFlags.split(";");
		// PVLDRAAC
		for(thisFlag in slFlagCodes) {
			luCode = slFlagCodes[thisFlag];
			newCode = luCode.trim();
			// newCode = "PVCMU";
			if(lookup(slLookupTable,newCode) != null) {
				logDebug("This is a land use code");
				if(newCode == landUse) {
					logDebug("Land use from fee list lookup matches this land use");
					var slFeeList ="";
					var slFeeArray = new Array();
					var spDev = newCode.substring(0,2);
					if(newCode == "RVMPLD") {spDev = newCode;}
					var slFeeSched = lookup("sdl:SP Fee Schedules",spDev);
					logDebug("This is the fee schedule " + slFeeSched);
					slFeeList = lookup(slLookupTable,newCode);
					slFeeArray = slFeeList.split(",");
					for(thisSlFee in slFeeArray) {
						slFeeCode = slFeeArray[thisSlFee];
						updateFee(slFeeCode,slFeeSched,"FINAL",1,"N");
					}
					foundFees = true;
				}
			}
			var foundCode = true;
			if(lookup(slLookupTable,newCode) != null) {
				logDebug("This is a land use code");
				if(newCode == landUse && foundCode) {
					logDebug("Land use from fee list lookup matches this land use");
					if(matches(landUse,"PVCMU","PVO","PVCOM")) {
						spDev = newCode.substring(0,2);
						if(pvspFeeType == "Commercial") {
							spCode = spDev + "SPC";
						}
						if(pvspFeeType == "Industrial") {
							spCode = spDev + "SPI";
						}
						slFeeSched = lookup("sdl:SP Fee Schedules",spDev);
						logDebug("This is the fee schedule " + slFeeSched);
						slFeeList = lookup(slLookupTable,spCode);
						slFeeArray = slFeeList.split(",");
						for(thisSlFee in slFeeArray) {
							slFeeCode = slFeeArray[thisSlFee];
							logDebug("Fee code is " + slFeeCode);
							// updateFee(slFeeCode,slFeeSched,"FINAL",1,"N");
						}
						// foundCode = false;
						foundFees = true;
					}
				}
				
			}
		}
		
	}
	return foundFees;
}
function getexpirationyear(itemCap)
{
b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput();

expdate = b1ExpResult.getExpDate().getYear() - 1 ;
return expdate
	
}
function getthroughputyear(itemCap)
{
b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput();

expdate = b1ExpResult.getExpDate().getYear() - 2 ;
return expdate
	
}

function getAPOParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
	//Get Address Line Param
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addressLine = ad.getDisplayAddress();
		}
	addParameter(params, "$$addressLine$$", addressLine);
	//Get Parcel Number Param
	var parcelNumber = "";
	paResult = aa.parcel.getParcelandAttribute(capId,null);
	if (paResult.getSuccess()) {
		Parcels = paResult.getOutput().toArray();
		for (zz in Parcels) {
			if(Parcels[zz].getPrimaryParcelFlag() == "Y") {
				parcelNumber = Parcels[zz].getParcelNumber();
			}			
		}
	}
	addParameter(params,"$$parcelNumber$$",parcelNumber);
	//Get Owner Param
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
                addParameter(params, "$$ownerEmail$$", thisOwner.getEmail());
				addParameter(params, "$$ownerAddr$$", thisOwner.getMailAddress1());
				addParameter(params, "$$ownerCity$$", thisOwner.getMailCity());
				addParameter(params, "$$ownerState$$", thisOwner.getMailState());
				addParameter(params, "$$ownerZip$$", thisOwner.getMailZip());
				break;	
			}
		}
	}
	return params;
}

function customComment(cstr){
    var message= "<span style='display:flex; width:1200px; height:50px; background-color:#fff0f5; align-items: center; margin-top:20px; font-size:15px; font-weight: bold;'> <p>" +
    cstr + "</p></span>";
    
    if (showDebug) logDebug(message);
	if (showMessage) logMessage(message);

}
function getRenewalCapByParentCapIDForReviewTPS(parentCapid)
{
	projectScriptModel = [];
    if (parentCapid == null || aa.util.instanceOfString(parentCapid))
    {
        return null;
    }
    //1. Get parent license for review
    var result = aa.cap.getProjectByMasterID(parentCapid, null, null);
    if(result.getSuccess())
    {
        projectScriptModels = result.getOutput();
        if (projectScriptModels == null || projectScriptModels.length == 0)
        {
            aa.print("ERROR: Failed to get renewal CAP by parent CAPID(" + parentCapid + ") for review");
            return null;
        }
        //2. return parent CAPID.
for (i = 0; i < projectScriptModels.length; i++)
{
        projectScriptModel.push(projectScriptModels[i].getCapID())
}
        return projectScriptModel;
    }  
    else 
    {
      aa.print("ERROR: Failed to get renewal CAP by parent CAP(" + parentCapid + ") for review: " + result.getErrorMessage());
      return null;
    }
}

function deleteASITrow(arr, column_name, value)
{
for(var i = 0; i < arr.length; i++)
{
if (String(arr[i][column_name]) == String(value)) {
logDebug("Found a match");
    arr.splice(i, 1);
  }
}
return arr
}

/*----------------------------------------------/
| Custom functions required by IRSA script
/-----------------------------------------------*/
function sendElecUtilRelease()
{
	//converted from ES_SEND_ELEC_UTIL_RELEASE - 02/15/2023 Tdunn, TPS
	var params = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var emailSendFrom = "noreply@placer.ca.gov";
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailResult = false;
	var xMessage = "";
	var ccTo = "BLDOutsource@placer.ca.gov";
	addParameter(reportParams,"inspId",inspId);
	report = generateReportPCO("Utility Release",reportParams,"Building");
	getRecordParams4Notification(params);
	getInspectionParams4Notification(params);
	addParameter(params, "$$ScopeOfWork$$", getAppSpecific("Scope of Work"));
	var vProvider = AInfo["ParcelAttribute.ELECTRIC UTILITY"];
	var vTemplate = lookup("lkupUtilReleaseElec",vProvider);
	logDebug("strcontrol = " + vTemplate);
	if(matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'],null,undefined,""))
	{
		xMessage = "Attention needed - you are attempting to pass an inspection where utility provider(s) are missing. Utility release not sent due to no provider listed.  Utility provider(s) information will need to be added to the parcel before re-resulting the inspection.";
	}
	if(!matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'],null,undefined,"") && matches(vTemplate,"",null,undefined))
	{
		logDebug("Inside vTemplate is undefined")
		xMessage = "Attention needed - you are attempting to pass an inspection where there is an error with the utility provider(s). Utility release not sent due to data error with utility provider.  Utility provider(s) information on the parcel will need to be corrected before re-resulting the inspection.";
		ccTo = "cdrait@placer.ca.gov";
	}
	addParameter(params,"$$errorContent$$",xMessage);
	addParameter(params,"$$copyTo$$",ccTo);
	
	if(!matches(vProvider,"",null,undefined) && !matches(vTemplate,"",null,undefined))
	{
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,new Array(report));
	}

	if (matches(AInfo['ParcelAttribute.ELECTRIC UTILITY'],null,undefined,"","NA") || matches(vTemplate,"",null,undefined))
	{
		vTemplate = "UTILITY_RELEASE";
		emailStaff = getCurrentUserStaffInfo(params);
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,null);
	}
	logDebug("Release email for " + AInfo['ParcelAttribute.ELECTRIC UTILITY'] + " using template " + vTemplate + ", result = " + emailResult);
	logDebug(xMessage);
	if(xMessage != "")
	{
		showMessage = true;
		comment(xMessage);
	}
	return emailResult;
}


function sendGasUtilRelease()
{
	// Replaces ES_SEND_GAS_UTIL_RELEASE - 02/15/2023, Tdunn, TPS
	/* Updated to use lookup based on parcel attribute 'GAS UTILITY' to return correct email address */
	
	var params = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var emailSendFrom = "noreply@placer.ca.gov";
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailResult = false;
	var xMessage = "";
	var ccTo = "BLDOutsource@placer.ca.gov";
	addParameter(reportParams,"inspId",inspId);
	report = generateReportPCO("Utility Release",reportParams,"Building");
	getRecordParams4Notification(params);
	getInspectionParams4Notification(params);
	addParameter(params, "$$ScopeOfWork$$", getAppSpecific("Scope of Work"));
	var vProvider = AInfo["ParcelAttribute.GAS UTILITY"];
	var vTemplate = lookup("lkupUtilReleaseGas",vProvider);
	logDebug("strcontrol = " + vTemplate);
	if(matches(AInfo['ParcelAttribute.GAS UTILITY'],null,undefined,""))
	{
		xMessage = "Attention needed - you are attempting to pass an inspection where utility provider(s) are missing. Utility release not sent due to no provider listed.  Utility provider(s) information will need to be added to the parcel before re-resulting the inspection.";
	}
	if(!matches(AInfo['ParcelAttribute.GAS UTILITY'],null,undefined,"") && matches(vTemplate,"",null,undefined))
	{
		logDebug("Inside vTemplate undefined");
		xMessage = "Attention needed - you are attempting to pass an inspection where there is an error with the utility provider(s). Utility release not sent due to data error with utility provider.  Utility provider(s) information on the parcel will need to be corrected before re-resulting the inspection.";
		ccTo = "cdrait@placer.ca.gov";
	}
	addParameter(params,"$$errorContent$$",xMessage);
	addParameter(params,"$$copyTo$$",ccTo);
	
	if(!matches(vProvider,"",null,undefined) && !matches(vTemplate,"",null,undefined))
	{
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,new Array(report));
	}	
	
	if (matches(AInfo['ParcelAttribute.GAS UTILITY'],null,undefined,"","NA") || matches(vTemplate,"",null,undefined))
	{
		vTemplate = "UTILITY_RELEASE";
		emailStaff = getCurrentUserStaffInfo(params);
		emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,vTemplate,params,null);
	}
	logDebug("Release email for " + AInfo["ParcelAttribute.GAS UTILITY"] + " using template " + vTemplate + ", result = " + emailResult);
	if(xMessage != "")
	{
		showMessage = true;
		comment(xMessage);
	}
	return emailResult;	
}

function sendTRPARelease()
{
	// Converted from ES_SENDTRPA_RELEASE - Tdunn, 02/15/2023
	var emailResult = false;
	var emailSendFrom = null;
	var emailStaff = null;
	var emailStaffCC = null;
	var report = null;
	var emailParameters = null;
	var reportParams = null;
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	addParameter(reportParams,"AltID",capIDString);
	report = generateReportPCO("TRPA Release Letter",reportParams,"TRPA");
	emailSendFrom = "noreply@placer.ca.gov";
	cap = aa.cap.getCap(capId).getOutput();
	alias = cap.capModel.getAppTypeAlias();
	logDebug("Alias: " + alias);
	addParameter(emailParameters,"$$INSPECTIONTYPE$$",inspType);
	addParameter(emailParameters,"$$RESULTDATE$$",inspResultDate);
	addParameter(emailParameters,"$$RECORDALIAS$$",alias);
	addParameter(emailParameters,"$$RECORDALTID$$",capIDString);
	addParameter(emailParameters,"$$INVOICEDTOTAL$$",feesInvoicedTotal);
	addParameter(emailParameters,"$$BALANCEDUE$$",balanceDue);
	emailResult = sendNotification(emailSendFrom,emailStaff,emailStaffCC,"TRPA_RELEASE_LETTER_NOTICE",emailParameters,new Array(report));
	logDebug("Email result = " + emailResult);
	return emailResult;

}

function emailInspectionResultParameters()
{
	// Converted from ES_EMAIL_INSPECTION_RESULT_PARAMETERS - Tdunn, 02/15/2023
	var contactTypes = new Array("Inspection Contact");
	var notificationTemplate = "AA_MESSAGE_INSPECTION_STATUS_CHANGE";
	var iCon = null;
	var contactArray = new Array();
	contactArray = getContactArray();
	for (iCon in contactArray) {
		if (exists(contactArray[iCon]["contactType"],contactTypes)) {
			// converted from ES_EMAIL_INSPECTION_RESULT - Tdunn, 02/15/2023
			params = aa.util.newHashtable();
			tContact =contactArray[iCon];
			getRecordParams4Notification(params);
			getContactParams4Notification(params,tContact);
			aa.print("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getInspectionParams4Notification(params);
			emailSendFrom = null;
			emailStaff = null;
			emailStaffCC = null;
			report = null;
			emailSendFrom = "";
			emailStaff = tContact["email"];
			emailStaffCC = "";
			if (!matches(tContact["email"],null,"",undefined)) 
			{
				sendNotification(emailSendFrom,emailStaff,emailStaffCC,notificationTemplate,params,report);
			}		
		}
	}
}


function getCurrentUserStaffInfo(emailParameters)
{
	// Get user information for inspector resulting inspection - CurrentUserID
	var assignedStaff = currentUserID; 
	var staffResult = aa.person.getUser(assignedStaff);
	if (!staffResult.getSuccess())
		{
			logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) 
			return false;
		}
	if (staffResult.getSuccess()) 
	{
		staffObject = staffResult.getOutput();
		var staffEmail = staffObject.getEmail();
		var staffFirst = staffObject.getFirstName(); 
		var staffLast = staffObject.getLastName(); 
		logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
	
		var staffName = staffFirst + " " + staffLast;
		if(!matches(staffEmail,undefined,"",null)) 
		{
			addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
			addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
			addParameter(emailParameters,"$$staffNameParam$$",staffName);
			return staffEmail;
		}
	}
}

function addCalcValuation(occType,unitType,unitAmt,vVersion,vCapId)
{
	bVal = aa.finance.createBCalcValuatnScriptModel();
	logDebug("unitType: " + unitType + "; occType: " + occType + "; unitAmt: " + unitAmt);
	bVal.setAuditID("ADMIN"); 
	bVal.setCapID(vCapId); 
	bVal.setConTyp(unitType); 
	bVal.setUnitValue(parseFloat(unitAmt)); 
	bVal.setUseTyp(occType); 
	bVal.setVersion(vVersion);

	r = aa.finance.createBCalcValuatn(bVal);
	
	logDebug("Calculated Value is "+bVal.getTotalValue()); 

}
/*----------------------------------------------/
| End Custom functions required by IRSA script
/---------------------------------------------------------------------------------------------------*/

//========================================================================================================
// Custom functions for Workflow management updated 12/07/2023
//========================================================================================================
// auto route functions

function autoRouteReviewsTD(reviewType, initial, lkupCriteria) {
    //reviewType is no longer used. Kept in function in to accommodate existing references
    // E - Electronic
    // P - Physical
    //initial is not longer used. Kept in function to accommodate existing references
	// lkupCriteria is the 'row' select criteria for the list of reviews, based one the module or specific record type workflow.
	// Note: to only manage which tasks to activate, set reviewType to 'P' and initial to 'N' *** no longer used or referenced ***

    logDebug("Inside autoRouteReviews TD().  Params: " + reviewType + ", " + initial);

    reviewListArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    reviewListArray = reviewList.split(",")

    //logDebug("About to call function setReviewWorkflowTasksByTsiFields(reviewListArray)");

	setReviewWorkflowTasksByTsiFieldsTPS(reviewListArray); //Activate Review Task and set Due Date from TSI.

	updateAppStatus("In Review","");
}


function setReviewWorkflowTasksByTsiFieldsTPS(allTasksArray) {
    // Activate any review tasks where TSI Review field is "Yes", and set the Task Due Date from TSI Review Date field.
    // This assumes all review tasks are parallel, and that the Workflow Task name is synonymous with the TSI field names.  i.e. Task Name = Building Review, 
    // TSI Review = Building Review, TSI Review Date = Building Review Date
    // Assumes TSI "Review Date" field has been set (by expression)

    logDebug("Inside function setReviewWorkflowTasksByTsiFields.  Params: " + allTasksArray);

    for (ata in allTasksArray) 
	{
        var taskRequired = false;
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));
        //If the Review TSI is set to Yes, set Required to True
        if (AInfo[thisTask] == "Yes") {
            taskRequired = true;
            logDebug("taskRequired was set to true");
        }

        if (taskRequired) {
            logDebug("task is required so set Task Due Date");
            activateTask(thisTask);
            if(isTaskStatus(thisTask,"Corrections Required") || isTaskStatus(thisTask,"Approved Pending Resubmittal") || isTaskStatus(thisTask,"Approved")) 
			{
				updateTask(thisTask,"Resubmittal Received","",""); 
			}
            //editTaskDueDate(thisTask,AInfo[thisTask + " Due Date"]);	//Set the Task Due Date from the TSI Review Date field
        }

        if (!taskRequired && statusIsNull) 
		{
            logDebug("task not required and no history so setTask N and N");
           	setTask(thisTask,"N","N",wfProcess);
        }
        if (!taskRequired && !statusIsNull) 
		{
            logDebug("task not required but has history, setTask N and Y");
            setTask(thisTask,"N","Y",wfProcess);
		}
    }
}

function autoRouteReviewsPCO(reviewType, initial, lkupCriteria, lkupTriage) 
{
    //reviewType is no longer used. Kept in function in to accommodate existing references
    // E - Electronic
    // P - Physical
    //initial is not longer used. Kept in function to accommodate existing references
	// lkupCriteria is the 'row' select criteria for the list of reviews, based one the module or specific record type workflow.
	// Note: to only manage which tasks to activate, set reviewType to 'P' and initial to 'N' *** no longer used or referenced ***

    logDebug("Inside autoRouteReviewsPCO().  Params: " + reviewType + ", " + initial);

    reviewListArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    reviewListArray = reviewList.split(",");
	
	triageListArray = new Array();
	triageList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupTriage); // get Triage tasks
	triageListArray = triageList.split(",");
    //logDebug("About to call function setReviewWorkflowTasksByTsiFields(reviewListArray)");

	setReviewWorkflowTasksByTsiFieldsPCO(reviewListArray,triageListArray); //Activate Review Task and set Due Date from TSI.
	updateAppStatus("Initial Project Review","");
}

function setReviewWorkflowTasksByTsiFieldsPCO(allTasksArray,allTriageArray) 
{
    // Only activate  review tasks from Triage list.
    // This assumes all review tasks are parallel, and that the Workflow Task name is synonymous with the TSI field names.  i.e. Task Name = Building Review, 
    // TSI Review = Building Review, TSI Review Date = Building Review Date
    // Assumes TSI "Review Date" field has been set (by expression)

    logDebug("Inside function setReviewWorkflowTasksByTsiFieldsPCO.  Params: " + wfProcess + "; task array: " + allTasksArray);

    for (ata in allTasksArray) {
        var taskRequired = false;
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + ", is null = " + isTaskStatusNull(thisTask));
        //If the Review TSI is set to Yes, set Required to True
		for(tla in allTriageArray)
		{
			triageTask = allTriageArray[tla];
			if (triageTask == thisTask && matches(AInfo[thisTask],"Yes","Y")) {
				taskRequired = true;
				logDebug("taskRequired was set to true");
			}
		}

        if (taskRequired) {
            logDebug("task is required so set Task Active");
            activateTask(thisTask);
            //editTaskDueDate(thisTask,AInfo[thisTask + " Due Date"]);	//Set the Task Due Date from the TSI Review Date field
        }

        if (!taskRequired && statusIsNull) 
		{
            logDebug("task not required and no history so setTask N and N");
			setTask(thisTask,"N","N",wfProcess);
        }
        if (!taskRequired && !statusIsNull) 
		{
            logDebug("task not required but has history, setTask N and Y");
            setTask(thisTask,"N","Y",wfProcess);
		}
    }
}

function autoRouteReviewsBPC(lkupCriteria) 
{
    logDebug("Inside autoRouteReviews TD().  Params: " + lkupCriteria);

    reviewListArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    reviewListArray = reviewList.split(",")

    for (ata in reviewListArray) {
        var taskRequired = false;
		var thisTSI = reviewListArray[ata]
        var thisTask = reviewListArray[ata] + " Review";  //For each Review in list (all Review names are in List)
		logDebug("This task is " + thisTask);
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTSI]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));
        //If the Review TSI is set to Yes, set Required to True
        if (matches(AInfo[thisTask],"Yes","Y") && !isTaskActive(thisTask)) 
		{
            //logDebug("task is required so set Task Due Date");
            activateTask(thisTask);
            //editTaskDueDate(thisTask,AInfo[thisTSI] + " Due Date"]);	//Set the Task Due Date per rule
        }
    }
	updateAppStatus("In Review","");
}

function presetTSIpco(lkupCriteria,taskName,apStatus,apStatus2,apStatus3) {
	// lkupCriteria is the 'row' select criteria for the list of reviews, based on the module or specific record type workflow.
    logDebug("Inside presetTSI().  Params: " + lkupCriteria);

    allTasksArray = new Array();
	reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    allTasksArray = reviewList.split(",");
	
    logDebug("Task List Param: " + allTasksArray);

    for (ata in allTasksArray) {
		var tsiValue = "Y";
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var thisStatus = getTaskStatus(thisTask);
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask + " and AInfo[thisTask] = " + AInfo[thisTask]);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));
        //If the last TSI value is 'apStatus' default TSI to 'N';
		if(matches(thisStatus,apStatus,apStatus2,apStatus3) || matches(AInfo[thisTask],"N","No",null,"",undefined)) 
		{
			tsiValue = "N";
		}
		editTaskSpecific(taskName,thisTask,tsiValue);
	}

}

// Task status or state related functions
function anyTaskActiveTPS(lkupCriteria) 
{
    logDebug("Inside anyTasksActive().  Params: " + lkupCriteria);

    allTasksArray = new Array();
    reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
    allTasksArray = reviewList.split(",");

    logDebug("Array of tasks to test for isTaskActive.  Params: " + allTasksArray);
    var anyActive = false;
    for (ata in allTasksArray) {
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)

        logDebug("thisTask = " + thisTask);

        //Check if task is active
        if (isTaskActive(thisTask)) {
            anyActive = true;
            logDebug(thisTask + " is active");
        }

    }
	return anyActive;
}

function closeAllActiveTasksTPS() 
{
	/* requires custom function isTaskStatusNull(), Plan Review - Required Reviews lookup, uses standard function setTask() */
    allTasksArray = new Array();
	/* get workflow task list from required reviews lookup plus non review tasks */
    if (appTypeArray[0] == "Building") reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "BLDPERMIT") + ",Submittal Review,Distribution,Distribution Reconcilliation,Process for Issuance,Inspection,Closure";
    if (appTypeArray[0] == "Planning") reviewList = lookup("PLAN REVIEW - REQUIRED REVIEWS", "ALL PLN") + ",tbd"; 
    allTasksArray = reviewList.split(",")

    logDebug("About to process task list");


    for (ata in allTasksArray) {
        var taskRequired = false;
        var thisTask = allTasksArray[ata];  //For each Review in list (all Review names are in List)
		var statusIsNull = isTaskStatusNull(thisTask);
        logDebug("thisTask = " + thisTask);
		logDebug(thisTask + " status is " + getTaskStatus(thisTask) + " is null = " + isTaskStatusNull(thisTask));

        if (statusIsNull) {
            logDebug("task has no history so setTask N and N");
			setTask(thisTask,"N","N",wfProcess);
        }
        if (!statusIsNull) {
            logDebug("task has history, setTask N and Y");
            setTask(thisTask,"N","Y",wfProcess);
		}
    }
}

function getTaskStatus(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	var itemCap = capId;
	if (arguments.length >= 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}
	if (arguments.length == 3)
		itemCap = arguments[2]; // use cap ID specified in args	

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) 
	{
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) 
		{
			if (!matches(fTask.getDisposition(),null,"",undefined)) 
			{
				thisStatus = fTask.getDisposition();
				logDebug("status is " + thisStatus);
				return thisStatus;
			}
			else {
				return false;
			}
		}	
	}
	return false;
}

function isTaskStatusNull(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 1) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			if (matches(fTask.getDisposition(),null,"",undefined)) {
				logDebug("Task status is null");
				return true;
			}
			else {
				logDebug("Task status is NOT null");
				return false;
			}
		}	
	}
	return false;
}

function checkForContactEmail(fContactType)
{
	// fContactType can be a list of contact type separated by commas but with only one set to quotes (" ") around the list
	// This function can only be used with the WTUB and WTUA events
	if(matches(wfTask,"Submittal Review","Distribution Reconcilliation","Process for Issuance") && matches(wfStatus,"Submittal Incomplete","Corrections Required","Payment Requested"))
	{
		var vToEmail = "";
		var cTypeArray = new Array();
		var vContactTypes = fContactType;
		cTypeArray = vContactTypes.split(",");
		var conArray = new Array();
		conArray = getContactArrayWithPrimary(capId); 
		emailParameters = aa.util.newHashtable();
		for (thisCon in conArray) 
		{
			if (exists(conArray[thisCon]["contactType"],cTypeArray)) 
			{
				logDebug(conArray[thisCon]["contactType"]) ;
				getContactParams4Notification(emailParameters, conArray[thisCon]);
				if(!matches(emailParameters.get("$$contactEmail$$"),null,undefined,""))
				{
					vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
				}
			}
		}
		if(vToEmail == "") 
		{
			return true
		} else
		{
			return false
		}

	}		
}

function copyOwnerTPS(sCapID, tCapID)
{
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
		var ownrObj = ownrReq.getOutput();
		for (xx in ownrObj)
		{
			ownrObj[xx].setCapID(tCapID);
			aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
			logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName())
		}
	}
	else
		logDebug("Error Copying Owner : " + ownrObj.getErrorType() + " : " + ownrObj.getErrorMessage());
}

function formatRevNumber(revNum)
{
	var revString = "";
	if(revNum >=100)
	{
		revString = String(revNum);
	}
	if(revNum >=10 && revNum < 100)
	{
		revString = "0" + String(revNum);
	}
	if(revNum < 10)
	{
		revString = "00" + String(revNum);
	}
	return revString;
}

function formatResubNum(reSubNum)
{
	var resubStr = "";
	var numExt = "th";
	if(reSubNum == 1 || reSubNum == 21)
	{
		numExt = "st";
	}
	if(reSubNum == 2 || reSubNum == 22)
	{
		numExt = "nd";
	}
	if(reSubNum == 3 || reSubNum == 23)
	{
		numExt = "rd";
	}
	logDebug("Resub string is " + String(reSubNum));
	resubStr = String(reSubNum) + numExt;
	return resubStr;
}
	

//========================================================
// End 11/19/2023 custom workflow management functions
//========================================================

function createPCCPNotification(emailTemplate,pccpCapIDString) 
{
	/* Initialize standard parameters for notification */
	var vEmailSent = false;
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var pcapIdString = "";
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();

	// start loading parameters for notification
	logDebug("loading deeplink parameters");
	var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
	acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaAppTypeAlias$$
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	addParameter(reportParams,"RecordID",capIDString); 

	// add short notes parameter
	var sNotes = getShortNotes();
	addParameter(emailParameters,"$$shortNotes$$",sNotes);
	addParameter(emailParameters,"$$PCCPAltID$$",pccpCapIDString);

	if(vEventName == "WorkflowTaskUpdateAfter") 
	{
		addParameter(emailParameters,"$$wfStatusParam$$", wfStatus); 
		addParameter(emailParameters,"$$wfDateParam$$", wfDateMMDDYYYY); 
		addParameter(emailParameters,"$$taskNameParam$$",wfTask);
		addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
		wfDueDate = getTaskDueDate("wfTask");
		if(wfDueDate != null) 
		{
			addParameter(emailParameters,"$$wfDueDateParam$$",wfDueDate);
		}
	}

	if (vEventName == "InspectionScheduleAfter") 
	{
		addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
		addParameter(emailParameters, "$$inspType$$", inspType);
	}

	/* Get To email contact types */
	conArray = getContactArrayWithPrimary(capId);
	for (thisCon in conArray) 
	{
		if(!matches(conArray[thisCon]["email"],null,"",undefined))
		{
			vToEmail = vToEmail + conArray[thisCon]["email"] + "; ";
		}
	}
	
	// Get Owner emails
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) 
	{
		owner = capOwnerResult.getOutput();
		
		for (o in owner) 
		{
			thisOwner = owner[o];
			ownerEmail = thisOwner.getEmail();
			ownerName = thisOwner.getOwnerFullName();
			ownerPhone = thisOwner.getPhone();
			logDebug("Email: " + ownerEmail + "; Name: " + ownerName + "; Phone: " + ownerPhone);
			if (!matches(thisOwner.getEmail(),null,"",undefined))
			{
				vToEmail = vToEmail + ownerEmail + "; ";
			}
		}
	}
	
	/* Get assigned staff parameters */
	var assignedStaff = getAssignedToStaff(); 
	if(assignedStaff != null) 
	{
	staffResult = aa.person.getUser(assignedStaff);
		if (!staffResult.getSuccess())
			{ logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
		if (staffResult.getSuccess()) {
		staffObject = staffResult.getOutput();
		var staffEmail = staffObject.getEmail();
		var staffFirst = staffObject.getFirstName(); 
		var staffLast = staffObject.getLastName(); 
		logDebug(staffFirst + " " + staffLast + " @" + staffEmail);
		}
		var staffName = staffFirst + " " + staffLast;
		if(!matches(staffEmail,undefined,"",null)) 
		{
			addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
			addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
			addParameter(emailParameters,"$$staffNameParam$$",staffName);
		}
	}

	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);

	vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
	logDebug("Email Sent = " + vEmailSent); 
}

function createStaffAssignedNotification(emailTemplate,vContactType,defaultPhoneNum) 
{
	logDebug("Inside createStaffAssignedNotification function");
	/* Initialize standard parameters for notification */
	var vEmailSent = false;
	var vFromEmail = "";
	var vToEmail = "";
	var vCcEmail = "";
	var emailParameters = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();

	// start loading parameters for notification
	logDebug("loading deeplink parameters");
	var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
	acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
	getACARecordParam4Notification(emailParameters,acaSite); // returns $$acaRecordUrl$$; $$acaAppTypeAlias$$
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	addParameter(reportParams,"RecordID",capIDString); 

	// add short notes parameter
	var sNotes = getShortNotes();
	addParameter(emailParameters,"$$shortNotes$$",sNotes);

	if(vEventName == "WorkflowTaskUpdateAfter") 
	{
		addParameter(emailParameters,"$$wfStatusParam$$", wfStatus); 
		addParameter(emailParameters,"$$wfDateParam$$", wfDateMMDDYYYY); 
		addParameter(emailParameters,"$$taskNameParam$$",wfTask);
		addParameter(emailParameters,"$$wfCommentParam$$",wfComment);
		wfDueDate = getTaskDueDate("wfTask");
		if(wfDueDate != null) 
		{
			addParameter(emailParameters,"$$wfDueDateParam$$",wfDueDate);
		}
	}

	if (vEventName == "InspectionScheduleAfter") 
	{
		addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
		addParameter(emailParameters, "$$inspType$$", inspType);
	}

	/* Get To email contact types */
	var notFound = true;
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId); 
	logDebug("Entering test for specified contact type");
	for (thisCon in conArray) 
	{
		if (conArray[thisCon]["contactType"] == vContactType)
		{
			foundEmail = conArray[thisCon]["email"]
			logDebug("Found specified contact type: " + conArray[thisCon]["contactType"] + " email: " + foundEmail);
			if(!matches(foundEmail,null,"",undefined))
			{
				vToEmail = vToEmail + foundEmail + "; ";
				notFound = false;
			}
		}
	}
	if(notFound)
	{
		logDebug("Inside not found");
		for (thisCon in conArray) 
		{
			thisEmail = conArray[thisCon]["email"];
			thisPrimary = conArray[thisCon]["primaryFlag"];
			thisType = conArray[thisCon]["contactType"];
			logDebug(thisType + "; " + thisEmail + "; " + thisPrimary);
			if(matches(thisPrimary,"Yes","Y","YES","true") && !matches(thisEmail,null,"",undefined))
			{
				vToEmail = vToEmail + thisEmail + "; ";
				vContactType = thisType;
			}
		}
	}
	
	for (thisCon in conArray) 
	{
		logDebug("Inside other contacts");
		if (conArray[thisCon]["contactType"] != vContactType)
		{
			thisEmail = conArray[thisCon]["email"];
			thisPrimary = conArray[thisCon]["primaryFlag"];
			thisType = conArray[thisCon]["contactType"];
			logDebug(thisType + "; " + thisEmail + "; " + thisPrimary);
			if(!matches(thisEmail,null,"",undefined))
			{
				vCcEmail = vCcEmail + thisEmail + "; ";
			}
		}
	}	

	// Get Owner emails
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) 
	{
		logDebug("Inside Owners");
		owner = capOwnerResult.getOutput();
		
		for (o in owner) 
		{
			thisOwner = owner[o];
			ownerEmail = thisOwner.getEmail();
			ownerName = thisOwner.getOwnerFullName();
			ownerPhone = thisOwner.getPhone();
			logDebug("Email: " + ownerEmail + "; Name: " + ownerName + "; Phone: " + ownerPhone);
			if (!matches(thisOwner.getEmail(),null,"",undefined))
			{
				vCcEmail = vCcEmail + ownerEmail + "; ";
			}
		}
	}
	
	/* Get assigned staff parameters */
	logDebug("Getting staff assignment");
	var assignedStaff = getAssignedToStaff(); 
	if(assignedStaff != null) 
	{
	staffResult = aa.person.getUser(assignedStaff);
		if (!staffResult.getSuccess())
			{ logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
		if (staffResult.getSuccess()) {
		staffObject = staffResult.getOutput();
		// for(xy in staffObject)
		// {
			// logDebug(xy + ": " + staffObject[xy]);
		// }
		var staffEmail = staffObject.getEmail();
		var staffFirst = staffObject.getFirstName(); 
		var staffLast = staffObject.getLastName();
		var staffPhone = staffObject.getPhoneNumber();
		var staffTitle = staffObject.getTitle();
		logDebug(staffFirst + " " + staffLast + ", " + staffTitle + " at " + staffEmail + "; Phone: " + staffPhone);
		}
		if(matches(staffPhone,"",null,undefined))
		{
			staffPhone = defaultPhoneNum.toString();
		}
		var staffName = staffFirst + " " + staffLast;
		if(!matches(staffEmail,undefined,"",null)) 
		{
			addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
			addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
			addParameter(emailParameters,"$$staffNameParam$$",staffName);
			addParameter(emailParameters,"$$staffPhoneParam$$",formatStaffPhone(staffPhone));
			addParameter(emailParameters,"$$staffTitleParam$$",staffTitle);			
			vCcEmail = vCcEmail + staffEmail + "; ";
		}
	}

	logDebug("vFromEmail= " + vFromEmail + "; vToEmail= " + vToEmail + "; vCcEmail = " + vCcEmail + "; emailTemplate= " + emailTemplate + "; emailParameters= " + emailParameters);
	vEmailSent = sendNotification(vFromEmail,vToEmail,vCcEmail,emailTemplate,emailParameters, null);
	logDebug("Email Sent = " + vEmailSent); 
}

function formatStaffPhone(phoneStr)
{
	if(!matches(phoneStr,"",null,undefined))
	{
		var areaCode = phoneStr.substring(0,3);
		var vPrefix = phoneStr.substring(3,6);
		var pNumber = phoneStr.substring(6,10);
		fNumber = "(" + areaCode + ")" + vPrefix + "-" + pNumber;
		return fNumber;
	}else
	{
	fNumber = "No number found";
	return fNumber;
	}
}
function updateACAaccess (capIDString)
{
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
	var ds = initialContext.lookup("java:/AA"); 
	var conn = ds.getConnection(); 
	var Sql = "update B1PERMIT SET B1_ACCESS_BY_ACA = 'Y' where B1_ALT_ID like ?";
	var sSelect = conn.prepareStatement(Sql);
		sSelect.setString(1, capIDString);
						
return sSelect.executeUpdate();
 conn.close();
}

function generateReportTPS_CustomFileName(aaReportName, parameters, rModule, newRptName) {
    /*this variation of generateReportTPS was created to alter both the name of the file that is both stored against the record and sent to customer via email*/
    
        var reportName = aaReportName;
    
        report = aa.reportManager.getReportInfoModelByName(reportName);
        report = report.getOutput();
    
        report.setModule(rModule);
        report.setCapId(capId);
    
        report.setReportParameters(parameters);
        
        //var permit = aa.reportManager.hasPermission(reportName, currentUserID);
        var permit = aa.reportManager.hasPermission(reportName,"ADMIN");
        
        if (permit.getOutput().booleanValue()) {
            var reportResult = aa.reportManager.getReportResult(report);
            
            if (reportResult) {
                reportResult = reportResult.getOutput();
            //aa.print("Original File Name:" + reportResult.getName());
                originalFileName = reportResult.getName(); //stores the original file name for future reference
                
                /*Change Report File Name of email attachment*/
                reportResultTest = reportResult;
                reportResultTestModel = reportResultTest.getReportResultModel();
                reportResultTestModel.setName(newRptName);
                /*end: Change Report File Name of email attachment*/
                
                var reportFile = aa.reportManager.storeReportToDisk(reportResult);
                //logDebug("Report Result: " + reportResult);
                reportFile = reportFile.getOutput();
                return reportFile
            } else {
                logDebug("Unable to run report: " + reportName + " for Admin" + systemUserObj);
                return false;
            }
        } else {
            logDebug("No permission to report: " + reportName + " for Admin" + systemUserObj);
            return false;
        }
    }
	
function getTaskAssignUser(wfstr) 
{
	// optional process name.
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) 
	{
		processName = arguments[1]; // subprocess
		useProcess = true;
	}
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
	{
		wfObj = workflowResult.getOutput();
	} else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); 
		return false; 
	}
	for (i in wfObj) 
	{
		var fTask = wfObj[i];
		if((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*")  && (!useProcess || fTask.getProcessCode().equals(processName))) 
		{
			var taskAssignUser = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
			if (taskAssignUser != null) 
			{
				// re-grabbing for userid.
				wfUserObj = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
				return wfUserObj.getUserID();
			}
		}
	}
	return false;
}

function getTaskAssignUserHist(wfstr,wfStat)
{
	var tasks = null; 
	var taskUser = null;
	var lastResult = -1;
	/* Retrieve workflow history */
	tasks = aa.workflow.getHistory(capId).getOutput();
	if(tasks != null && tasks.length > 0) {
		/* If history found loop through history and retrieve most recent assigned user for task */
		for(var i in tasks) {
			if(tasks[i].getCompleteFlag().equals("Y") && tasks[i].getTaskDescription().equals("Planning Review") && ((lastPlan == -1 || tasks[lastPlan].getStatusDate() < tasks[i].getStatusDate()) && (tasks[i].getAssignedStaff() != null && aa.person.getUser(tasks[i].getAssignedStaff().getFirstName(), tasks[i].getAssignedStaff().getMiddleName(), tasks[i].getAssignedStaff().getLastName()).getSuccess()))) lastPlan = i;

			if(tasks[i].getTaskDescription().equals(wfstr) && tasks[i].getDisposition().equals(wfStat) && ((lastResult == -1 || tasks[lastResult].getStatusDate() < tasks[i].getStatusDate()) && (tasks[i].getAssignedStaff() != null && aa.person.getUser(tasks[i].getAssignedStaff().getFirstName(), tasks[i].getAssignedStaff().getMiddleName(), tasks[i].getAssignedStaff().getLastName()).getSuccess()))){
				lastResult = i;
			}
		}
		logDebug("lastResult = " + lastResult);
	}
	/* If found prior user return for matching task if user is still active, else return false */
	if(lastResult > -1) {
		taskUser = aa.person.getUser(tasks[lastResult].getAssignedStaff().getFirstName(), tasks[lastResult].getAssignedStaff().getMiddleName(), tasks[lastResult].getAssignedStaff().getLastName()); 
		if(taskUser != null && taskUser.getSuccess() && taskUser.getOutput().getAuditStatus().equals("A")) {
			return taskUser.getOutput().getUserID();
		} else {
			return false;
		}
	}
}

function createChildNoContacts(grp,typ,stype,cat,desc) // optional parent capId
{
	//
	// creates the new application and returns the capID object
	//

	var itemCap = capId
	if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args
	
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
			var newId = appCreateResult.getOutput();
			logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
			
			// create Detail Record
			capModel = aa.cap.newCapScriptModel().getOutput();
			capDetailModel = capModel.getCapModel().getCapDetailModel();
			capDetailModel.setCapID(newId);
			aa.cap.createCapDetail(capDetailModel);

			var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
			var result = aa.cap.createAppHierarchy(itemCap, newId); 
			if (result.getSuccess())
				logDebug("Child application successfully linked");
			else
				logDebug("Could not link applications");

			// Copy Parcels

			// var capParcelResult = aa.parcel.getParcelandAttribute(itemCap,null);
			// if (capParcelResult.getSuccess())
				// {
				// var Parcels = capParcelResult.getOutput().toArray();
				// for (zz in Parcels)
					// {
					// logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
					// var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
					// newCapParcel.setParcelModel(Parcels[zz]);
					// newCapParcel.setCapIDModel(newId);
					// newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
					// newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
					// aa.parcel.createCapParcel(newCapParcel);
					// }
				// }

			// Copy Contacts - disabled for use with EOT process
			// capContactResult = aa.people.getCapContactByCapID(itemCap);
			// if (capContactResult.getSuccess())
			// {
			// Contacts = capContactResult.getOutput();
			// for (yy in Contacts)
				// {
				// var newContact = Contacts[yy].getCapContactModel();
				// newContact.setCapID(newId);
				// aa.people.createCapContact(newContact);
				// logDebug("added contact");
				// }
			// }	

			// Copy Addresses
			// capAddressResult = aa.address.getAddressByCapId(itemCap);
			// if (capAddressResult.getSuccess())
			// {
				// Address = capAddressResult.getOutput();
				// for (yy in Address)
				// {
					// newAddress = Address[yy];
					// newAddress.setCapID(newId);
					// aa.address.createAddress(newAddress);
					// logDebug("added address");
				// }
			// }
			
			return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}

function copyDocumentsTPS(pFromCapId, pToCapId) 
{
//Copies all attachments (documents) from pFromCapId to pToCapId
var vFromCapId = pFromCapId;
var vToCapId = pToCapId;
var categoryArray = new Array();

// third optional parameter is comma delimited list of categories to copy.
if (arguments.length > 2) {
categoryList = arguments[2];
categoryArray = categoryList.split(",");
}

var capDocResult = aa.document.getDocumentListByEntity(vFromCapId,"CAP");
if(capDocResult.getSuccess()) {
   if(capDocResult.getOutput().size() > 0) {
	  for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
		 var documentObject = capDocResult.getOutput().get(docInx);
		 currDocCat = "" + documentObject.getDocCategory();
		 if (categoryArray.length == 0 || exists(currDocCat, categoryArray)) {
			// download the document content
			var useDefaultUserPassword = true;
			//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
			var EMDSUsername = null;
			var EMDSPassword = null;
			var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
			if(downloadResult.getSuccess()) {
						   var path = downloadResult.getOutput();
						   logDebug("path=" + path);
						   }
			var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
			documentObject.setDocumentNo(null);
			documentObject.setCapID(vToCapId)
			documentObject.setEntityID(tmpEntId);

			// Open and process file
			try {
						   // put together the document content - use java.io.FileInputStream
						   var newContentModel = aa.document.newDocumentContentModel().getOutput();
						   inputstream = new java.io.FileInputStream(path);
						   newContentModel.setDocInputStream(inputstream);
						   documentObject.setDocumentContent(newContentModel);
						   var newDocResult = aa.document.createDocument(documentObject);
						   if (newDocResult.getSuccess()) {
										  newDocResult.getOutput();
										  logDebug("Successfully copied document: " + documentObject.getFileName());
										  }
						   else {
										  logDebug("Failed to copy document: " + documentObject.getFileName());
										  logDebug(newDocResult.getErrorMessage());
										  }
						   }
			catch (err) {
						   logDebug("Error copying document: " + err.message);
						   return false;
						   }
			}
		 } // end for loop
	  }
   }
}

function getProcessCount(capIDString)
{
 var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
 var ds = initialContext.lookup("java:/AA");
 var conn = ds.getConnection(); 
 var result = "";
 var B1_ALT_ID = "";
 var getSQL = "select Count(B1_APPL_STATUS) as Test from B1PERMIT where B1_PER_SUB_TYPE = 'Process' AND B1_ALT_ID like ? AND B1_APPL_STATUS != 'Closed'";
 var sSelect = conn.prepareStatement(getSQL);
 sSelect.setString(1, capIDString);
        var rs= sSelect.executeQuery(); 
 while(rs.next())
 {
  result = rs.getString("Test");
  
 
 }
 rs.close();
 conn.close();
 return result ;
}

function getTroughputCount(capIDString)
{
 var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
 var ds = initialContext.lookup("java:/AA");
 var conn = ds.getConnection(); 
 var result = "";
 var B1_ALT_ID = "";
 var getSQL = "select Count(B1_ACCESS_BY_ACA) as Test from B1PERMIT where B1_PER_SUB_TYPE = 'Throughput' AND B1_ALT_ID like ? AND B1_APPL_STATUS != 'Closed'";
 var sSelect = conn.prepareStatement(getSQL);
 sSelect.setString(1, capIDString);
        var rs= sSelect.executeQuery(); 
 while(rs.next())
 {
  result = rs.getString("Test");
  
 
 }
 rs.close();
 conn.close();
 return result ;
}


function sendAcknowledgementLtr2Applicant() {
	var reportName = "";
	var reportModule = "";
	var reportFile = null;
	var reportParams = aa.util.newHashMap();
	addParameter(reportParams, "altID", capIDString);

	var emailFrom = "noreply@placer.ca.gov";
	var emailTo = "";
	var emailCC = "";   //Use the email template

	var emailTemp = "";
	var emailParams = aa.util.newHashtable();
	addParameter(emailParams, "$$altID$$", capIDString);
	addParameter(emailParams, "$$emailSubject$$", "Acknowledgement Letter");

	if (appTypeArray[0] == "Code")
		if (appTypeArray[1] == "Enforcement") {
			//do sth
		}
		else if (appTypeArray[1] == "Vehicle Abatement") {
			//do sth
		}
	if (appTypeArray[0] == "HazVeg")
		if (appTypeArray[1] == "Hazardous Vegetation") {
			reportName = "HV Acknowledgment Ltr";
			reportModule = "HazVeg";
			emailTemp = "HV_GENERAL_EMAIL_TEMPLATE";
			emailTo = getAppSpecific("Complainant Email");
		}
		else if (appTypeArray[1] == "Defensible Space") {
			reportName = "DEF Acknowledgment Ltr";
			reportModule = "HazVeg";
			emailTemp = "H_DEF_GENERAL_EMAIL_TEMPLATE";
			emailTo = getAppSpecific("Complainant Email");
		}

	//running & Creating report file 
	reportFile = generateReportTPS_CustomFileName(reportName, reportParams, reportModule, "Acknowledgement_Letter_Case# " + capIDString + ".pdf");

	if (!(isEmptyOrNull(emailTo)) && emailTo.indexOf('@') != -1)
		sendResults = sendNotification(emailFrom, emailTo, emailCC, emailTemp, emailParams, new Array(reportFile));
}

// functions to support auto assignment
function assignConcurrent(lkupCriteria,tprocess,vCycle)
{
	taskListArray = new Array();
	taskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
	taskListArray = taskList.split(",");
	for(tla in taskListArray)
	{
		thisTask = taskListArray[tla];
		if (matches(AInfo[thisTask],"Yes","Y","YES"))
		{
			// tCycle = getCycleNum(thisTask,tprocess);
			// if(tCycle < vCycle) { vCycle = tCycle; }
			thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
			if(vCycle <=1)
			{
				assignTask(thisTask,thisStaff,tprocess);
			}
			if(vCycle > 1)
			{
				cAssigned = getTaskAssignUser(thisTask,tprocess);
				if(!matches(cAssigned,false,"",null,undefined))
				{
					assignTask(thisTask,cAssigned,tprocess);
				} else{
					assignTask(thisTask,thisStaff,tprocess);
				}
			}				
		}
	}
}

function getCycleNum(thisTask,tprocess)
{
	useTaskSpecificGroupName = true;
	TsiInfo = new Array();
	loadTaskSpecific(TsiInfo,capId);
	var newCycle = TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
	if(matches(TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"],null,"",undefined)) { newCycle = 0;}
	newCycle = 1 * TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
	thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
	useTaskSpecificGroupName = false;
	logDebug("New cycle number from getCycleNum for task " + thisTask + " = " + newCycle);
	return newCycle;
}

function assignPreissue(pTask,tprocess)
{
	thisTask = pTask;
	thisStaff = lookup("SDL:BLD Default Preissue Assignment",thisTask);
	assignTask(thisTask,thisStaff,tprocess);
}

// New functions for due dates and staff assignment	
// SetDueDate function
function setDueDate(lkupCriteria,numDays,tprocess)
{
	taskListArray = new Array();
	taskList = lookup("PLAN REVIEW - REQUIRED REVIEWS", lkupCriteria); //requiredReviewsStdChoice ... Get Reviews Required by Record Type from Standard Choice
	taskListArray = taskList.split(",");
	for(tla in taskListArray)
	{
		thisTask = taskListArray[tla];
        if (matches(AInfo[thisTask],"Yes","Y","YES")) 
		{		
			editTaskDueDate(thisTask,dateAdd(null,numDays,"Y"),tprocess);
		}
	}
}

function getDueInDays(vtable,vcriteria,vcycle)
{
	var lkupTable = vtable;
	var lkupCrit = vcriteria;
	var dElement = vcycle;
	var dateArray = new Array();
	var numDays = 0;
	var darrayString = lookup(lkupTable,lkupCrit);
	if(!matches(darrayString,null,undefined,false,""))
	{
		dateArray = darrayString.split(",");
		numDays = dateArray[vcycle] * 1;
	}
	return numDays;
}

function assignThisTask(thisTask,tprocess)
{
	useTaskSpecificGroupName = true;
	TsiInfo = new Array();
	loadTaskSpecific(TsiInfo,capId);
	if(matches(TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"],null,"",undefined))
	{
		newCycle = 0;
	} else{		
	newCycle = 1 * TsiInfo[tprocess + "." + thisTask + "." + "Cycle Number"];
	}
	logDebug("Cycle number for task " + thisTask + " = " + newCycle);
	thisStaff = lookup("SDL:BLD Default Assignment",thisTask);
	if(newCycle <=1)
	{
		assignTask(thisTask,thisStaff,tprocess);
	}
	if(newCycle > 1)
	{
		cAssigned = getTaskAssignUser(thisTask,tprocess);
		if(!matches(cAssigned,false,"",null,undefined))
		{
			assignTask(thisTask,cAssigned,tprocess);
		} else{
			assignTask(thisTask,thisStaff,tprocess);
		}
	}
	useTaskSpecificGroupName = false;
}

function generateStormFloodNotice()
{
	var emailParameters = aa.util.newHashtable();
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters);
	var	emailResult = sendNotification("noreply@placer.ca.gov","stormwtrquality@placer.ca.gov","","NOTICE_STORMWTR_AND_FLOOD_REVIEW_ACTIVE",emailParameters,null);
	logDebug("StormFloodNotice result = " + emailResult);
	return emailResult;
}

// Requires a dateAdd() date or proper string date mm/dd/yyyy be passed in as the vWfDueDate parameter
function generateNoticeToStaff(vTemplate,vEmailTo,vWfDueDate,vWfTask)
{
	var emailParameters = aa.util.newHashtable();
	var wfTaskParam = "workflow";
	if (arguments.length >= 4 && typeof(arguments[3]) != "undefined" && arguments[3] != null && arguments[3] != "") 
	{
		wfTaskParam = arguments[3];
	}	
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters);
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
	addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", capId));	
	addParameter(emailParameters,"$$typeOfWork$$",getAppSpecific("Type of Work",capId));
	addParameter(emailParameters,"$$wfDueDateParam$$",vWfDueDate);
	addParameter(emailParameters,"$$wfTaskNameParam$$",wfTaskParam);
	getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */	
	var	emailResult = sendNotification("noreply@placer.ca.gov",vEmailTo,"",vTemplate,emailParameters,null);
	logDebug(vTemplate + " notification result is " + emailResult);
	return emailResult;
}

function createCapComment(vComment) //optional CapId, optional vDispOnInsp
{
	var vCapId = capId;
	var vDispOnInsp = "N";
	if (arguments.length >= 2 && typeof(arguments[1]) != "undefined" && arguments[1] != null && arguments[1] != "") {
		vCapId = arguments[1];
	}
	if (arguments.length >= 3 && typeof(arguments[2]) != "undefined" && arguments[2] != null && arguments[2] != "") {
		vDispOnInsp = arguments[2];
	}
	var comDate = aa.date.getCurrentDate();
	var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
	capCommentScriptModel.setCapIDModel(vCapId);
	capCommentScriptModel.setCommentType("APP LEVEL COMMENT");
	capCommentScriptModel.setSynopsis("");
	capCommentScriptModel.setText(vComment);
	capCommentScriptModel.setAuditUser(currentUserID);
	capCommentScriptModel.setAuditStatus("A");
	capCommentScriptModel.setAuditDate(comDate);
	var capCommentModel = capCommentScriptModel.getCapCommentModel();
	capCommentModel.setDisplayOnInsp(vDispOnInsp);
	aa.cap.createCapComment(capCommentModel);
	logDebug("Comment Added");
}

function getPCOasi4BuildingNotification(params,deptCrit) 
{
	/*-----------------------------------------------------------------------/
	| The function will return a list of custom field notification parameters 
	| based on the list stored in the 'SDL:ASIList' standard choice shared
	| ddl. The 'params' parameter should be the name of the parameters 
	| newHashtable created for current notification.  The 'deptCrit'
	| function parameter should be the string in 'Value' column of the
	| of the shared ddl, which will return the corresponding value desc. The
	| deptCrit could be based on module, record type or other criteria that
	| correctly identifies the list of asi fields to be returned.
	| This will be a comma delimited list composed of the asi field name
	| and the corresponding parameter name of the asi separated by the
	| '|' (bar) symbol. The parameter name should NOT have the '$'
	| (dollar) signs, the function will add those when creating the
	| parameter list. (e.g. Scope of Work|scopeOfWork). The function
	| will take an optional third capId parameter or if ommitted will
	| use the current capId.  A fourth optional parameter can be input
	| for a parent capId. If the parent capId parameter is used, the
	| optional third capId parameter must be entered. The parent parameters
	| returned will be based on the same asi field list but will have 
	| 'Parent' prepended to the template parameter name.
	\-------------------------------------------------------------------*/
	itemCapId = (arguments.length >= 3) ? arguments[2] : capId;
	pCapId = (arguments.length >= 4) ? arguments[3] : null;
	// pass in a hashtable and it will add the additional parameters to the table
	var thisItem = "";
	var pString = "";
	var asiList = lookup("SDL:ASIList",deptCrit);
	if(!matches(asiList,"",null,undefined,false))
	{	
		var asiArray = asiList.split(",");
		for(cfItem in asiArray)
		{
			thisItem = asiArray[cfItem];
			barIndex = thisItem.indexOf("|");
			bI2 = barIndex + 1;
			fieldName = thisItem.substring(0,barIndex);
			paramName = thisItem.substring(bI2);
			addParameter(params,"$$"+ paramName + "$$",getAppSpecific(fieldName,itemCapId));		
		}
		if(typeof(pCapId == "object") && pCapId != null)
		{
			var pCapIDString = pCapId.getCustomID();
			var pCap = aa.cap.getCap(pCapId).getOutput();
			var pCapName = pCap.getSpecialText();
			var pCapStatus = pCap.getCapStatus();		
			var thisItem = "";
			var pString = "";
			var asiList = lookup("SDL:ASIList",deptCrit);
			var asiArray = asiList.split(",");
			for(cfItem in asiArray)
			{
				thisItem = asiArray[cfItem];
				barIndex = thisItem.indexOf("|");
				bI2 = barIndex + 1;
				aa.print(barIndex);
				fieldName = thisItem.substring(0,barIndex);
				paramName = "Parent" + thisItem.substring(bI2);
				addParameter(params,"$$"+ paramName + "$$",getAppSpecific(fieldName,itemCapId));		
			}
			addParameter(params, "$$pAltID$$", pCapIDString);
			addParameter(params, "$$pCapName$$", pCapName);
			addParameter(params, "$$pCapStatus$$", pCapStatus);		
		}
		logDebug(params);
		return true;
	}
	return false;
}



function generateAddlPermitRequiredNotice(vTemplate,rpList)
{
	var emailParameters = aa.util.newHashtable();
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters); 
	getPrimaryAddressLineParam4Notification(emailParameters); /* returns $$addressLine$$ parameter */
	addParameter(emailParameters,"$$scopeOfWork$$",getAppSpecific("Scope of Work",capId));
	addParameter(emailParameters,"$$projectoffice$$", getAppSpecific("Project Office", capId));	
	addParameter(emailParameters,"$$typeOfWork$$",getAppSpecific("Type of Work",capId));
	addParameter(emailParameters,"$$permitList$$",rpList)
	
	/* Get To email contact types */
	var cTypeArray = ["Applicant","Owner"];

	/* Get To emails for contacts */
	var vToEmail = "";
	var conArray = new Array();
	conArray = getContactArrayWithPrimary(capId); 
	for (thisCon in conArray) {
		if (exists(conArray[thisCon]["contactType"],cTypeArray)) {
			logDebug(conArray[thisCon]["contactType"]) ;
			getContactParams4Notification(emailParameters, conArray[thisCon]);
			if(!matches(emailParameters.get("$$contactEmail$$"),"",null,undefined,false))
			{
				vToEmail = vToEmail + emailParameters.get("$$contactEmail$$") + "; ";
			}
		}
	}

	var	emailResult = sendNotification("noreply@placer.ca.gov",vToEmail,"",vTemplate,emailParameters,null);
	logDebug(vTemplate + " notification result is " + emailResult);
	return emailResult;
}

function getTaskAssignToEmail(thisTaskArg,tprocess)
{
	/* Get task assigned staff email address */
	var vStaffEmail = "";
	var assignedToEmail = ""; 
	var assignedTo = getTaskAssignUser(thisTaskArg,tprocess);
	if(!matches(assignedTo,null,undefined,"")) 
	{
		assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail(); 
		logDebug("Assigned to Staff: User= " + assignedTo + ".  Email= " + assignedToEmail); 
		if(!matches(assignedToEmail,undefined,"",null,false)) 
		{
			vStaffEmail = assignedToEmail;
		}
		else{
			return false;
		}
	}
	return vStaffEmail;
}

function getAppProcessCode(capIdItem) 
{
    var workflowResult = aa.workflow.getMasterProcess(capIdItem);
    if (workflowResult.getSuccess()) 
	{
        var wfObj = workflowResult.getOutput();
        var fTask = wfObj[0];
		taskName = fTask.getTaskDescription();
		logDebug("fTask[0] for this process is " + taskName);
        return fTask.getProcessCode();
    }
    else {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
}

function getPreIssuanceListForNotification(sdlLkup)
{
	itemCapId = (arguments.length >= 2) ? arguments[1] : capId;
	var piListParam = "No active preissuance requirements";
	var ctAlias = "";
	var found = 0;
	var preIssueListSD = lookup("PLAN REVIEW - REQUIRED REVIEWS","PREISSUE"); // Get list of preissuance tasks
	preTasksArraySD = preIssueListSD.split(",");
	for(thisPI in preTasksArraySD)
	{
		cTask = preTasksArraySD[thisPI];
		logDebug("Tesing if preissuance task " + cTask + " is active");
		if(isTaskActive(cTask))
		{	
			found++;
			logDebug("Task found is " + cTask);
			ctAlias = lookup(sdlLkup,cTask);
			if(found<=1)
			{
				piList = ctAlias + "\n";
			}
			else if(found > 1)
			{
				piList = piList + "; " + ctAlias + "\n" ;
			}
		}
		if(found > 0)
		{
			piListParam = piList;
		}
	}
	return piListParam	
}
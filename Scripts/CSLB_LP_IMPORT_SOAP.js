/*----------------------------------
|	CSLB_LP_IMPORT_SOAP
|	CSLB (Contactor State License Board) Validation
|	TruePoint Solutions - 01/2021
|	
--------------------------------------------*/
/*---------------------------------------------
|	This function is required for the new SOAP CSLB Integration
|	This needs to be included in the INCLUDES_CUSTOM
|	TruePoint Solutions - Feb 2021
|	
-----------------------------------------------*/
function XMLTagValue(xmlstring, tag) {
    var startIndex = xmlstring.indexOf("<" + String(tag) + ">");
    if (startIndex == -1)
        return "";
    //   logDebug("startIndex:" + startIndex);
    //   logDebug("");
    var endIndex = xmlstring.indexOf("</" + String(tag) + ">", startIndex + 1);
    //   logDebug("endIndex:" + endIndex);
    //   logDebug("");
    //   logDebug("");
    var substring = xmlstring.slice(startIndex + 1 + String(tag).length + 1, endIndex);
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

try{
cslbMessage1 = null;
cslbMessage = "None";
existsInCSLB = "-1";
theLicNumber = null;

capLicenseArr = aa.licenseScript.getLicenseProf(capId).getOutput();

if (capLicenseArr && capLicenseArr.length > 0) {
    theLicNumber = capLicenseArr[0].getLicenseNbr();
    comment("LicNumber = " + theLicNumber)
}
else comment("There are no LPs");

lpTypeContractor = checkCapForLicensedProfessionalType("Contractor");
comment("Contractor = " + lpTypeContractor);

if (theLicNumber != null && lpTypeContractor && theLicNumber.substr(0, 1) > 0 && theLicNumber.substr(0, 6) < 999999) {
    cslbMessage = externalLP_CA_SOAP(theLicNumber, "Contractor", false, false, null);
    comment("The CSLB Message =" + cslbMessage);
}

if (cslbMessage != null) existsInCSLB = cslbMessage.indexOf("License Number does not exist");

comment("Exisits in CSLB = " + existsInCSLB);
if (lpTypeContractor && existsInCSLB == "-1") {
    cslbMessage1 = externalLP_CA_SOAP(null, "Contractor", true, true, capId);
    comment("The CSLB Message =" + cslbMessage1);
}
}
catch(err){
	message = "An error occured in expression:"+err.message;
}
/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_REQDOCTYPESCOMPLETE_DPC.js
| Event   : ACA Page Flow 
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
if (aa.env.getValue("ScriptName") == "Test") {     // Setup parameters for Script Test.
    var CurrentUserID = "PUBLICUSER124450"; // Public User ID: rschug
    var CurrentUserID = "PUBLICUSER387358"; // Public User ID: mhelvick
    var capIDString = "21TMP-000172";            // Test Temp Record from ACA.
    var capIDString = "22TMP-000017";            // Test Temp Record from ACA.
    aa.env.setValue("ScriptCode", "Test");
    aa.env.setValue("CurrentUserID", CurrentUserID);     // Current User
    sca = capIDString.split("-");
    if (sca.length == 3 && sca[1] == "00000") { // Real capId
        var capID = aa.cap.getCapID(sca[0], sca[1], sca[2]).getOutput();
        aa.print("capID: " + capID + ", capIDString: " + sca.join("-") + " sca");
    } else { // Alt capId
        capID = aa.cap.getCapID(capIDString).getOutput();
        aa.print("capID: " + capID + ", capIDString: " + capIDString);
    }
    capModel = aa.cap.getCapViewBySingle4ACA(capID);
    aa.env.setValue("CapModel", capModel);
    aa.env.setValue("fromReviewPage", "Y"); // From Review Page?
    aa.env.setValue("fromReviewPage", "N"); // From Review Page?
    //aa.env.setValue("CAP_MODEL_INITED", "TRUE");
    aa.print("CurrentUserID:" + aa.env.getValue("CurrentUserID"));
    aa.print("capID: " + capID
        + ", capIDString: " + capIDString
        + ",capModel: " + aa.env.getValue("CapModel"));
    aa.print("fromReviewPage:" + aa.env.getValue("fromReviewPage"));
    aa.print("CAP_MODEL_INITED:" + aa.env.getValue("CAP_MODEL_INITED"));
}
var systemMailFrom = "NoReply@accela.com";
//var systemMailFrom = "NoReply@reno.gov";
var debugEmailTo = "";
var errorEmailTo = debugEmailTo;

var waitTime = 2000; // waitTime in milliseconds
if (typeof(waitTime) != "undefined") {
    var waitTimeStart = new Date();
    aa.print("Waiting, Time:" + waitTimeStart)
    if (aa.sleep) { // sleep requires 23.1.5
        aa.print("sleeping: " + waitTime);
        aa.sleep(waitTime);
    } else {
        aa.print("waiting: " + waitTime);
        wait(waitTime);
    }
    var waitTimeEnd = new Date();
    aa.print("Waited, Time:" + waitTimeEnd + ", Elapsed Time: " + ((waitTimeEnd.getTime() - waitTimeStart.getTime()) / 1000) + " Seconds")
}
function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0;
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var errorMsg = "";
var message = "";                            // Message String
var debug = "";                                // Debug String
var br = "<BR>";                            // Break Tag
var feeSeqList = new Array();                        // invoicing fee list
var paymentPeriodList = new Array();                    // invoicing pay periods

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA) {
    eval(_getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
//  eval(_getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
    eval(_getScriptText(SAScript, SA));
} else {
    eval(_getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
//  eval(_getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

eval(_getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
eval(_getScriptText("INCLUDES_PAGEFLOW", null, false));

function _getScriptText(vScriptName, servProvCode, useProductScripts) {
    // Modified version of INCLUDES_ACCELA_FUNCTION to show where script is coming from with version info if applicable.
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        var vScriptNamePrefix = ""
        if (useProductScripts) {
            var vScriptNamePrefix = "Events>Master Scripts>";
            if (vScriptName == "INCLUDES_CUSTOM") var vScriptNamePrefix = "Events>Custom Script>";
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var vScriptNamePrefix = "Events>Scripts>";
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        var scriptText = emseScript ? String(emseScript.getScriptText() + "").trim() : "";
        if (scriptText.length > 0) {
            aa.print("loading " + vScriptNamePrefix + vScriptName
                + (emseScript.scriptName ? ", Name: " + emseScript.scriptName : "")
                + (emseScript.sripteCode ? ", Code: " + emseScript.sripteCode : "")
                + (emseScript.masterScriptVersion ? ", Version: " + emseScript.masterScriptVersion : "")
                //+ (emseScript.scriptText ? ", Text: " + String(emseScript.scriptText).substring(106, 146) + " ..." : "")
            );
        }
        return scriptText;
    } catch (err) {
        if (vScriptName == "INCLUDES_ACCELA_FUNCTIONS"
            || vScriptName == "INCLUDES_ACCELA_GLOBALS"
//          || vScriptNamePrefix == "Events>Master Scripts>"
        ) {
            aa.print("Error in " + vScriptNamePrefix + vScriptName + " at line " + err.lineNumber + " : " + err.message);
            aa.print("Stack: " + err.stack);
        } else if (String(err.message).indexOf("ScriptNotFoundException") > 0) {
            aa.print("" + vScriptNamePrefix + vScriptName + " script not found.");
        } else {
            aa.print("Error in " + vScriptNamePrefix + vScriptName + " at line " + err.lineNumber + " : " + err.message);
        }
        return "";
    }
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}

/*--------------------------------------------------------------------------------/
| BEGIN Override Standard Functions
/--------------------------------------------------------------------------------*/
if (true) {
    function logDebug(dstr) {
        // Override to always include dstr.
        vLevel = 1
        if (arguments.length > 1)
            vLevel = arguments[1];
        //if ((showDebug & vLevel) == vLevel || vLevel == 1)
        debug += dstr + br;
        aa.print(dstr);
        if (dstr.indexOf("ERROR:") >= 0) {
            if (typeof (errorMsg) == "undefined") errorMsg = "";
            errorMsg += dstr + br;
        }
        //if ((showDebug & vLevel) == vLevel)
        //    aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
    }

    function editAppName(newname) {
        // 4/30/08 - DQ - Corrected Error where option parameter was ignored
        var itemCap = capId;
        if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

        capResult = aa.cap.getCap(itemCap)

        if (!capResult.getSuccess()) { logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false }

        capModel = capResult.getOutput().getCapModel()

        capModel.setSpecialText(newname)

        setNameResult = aa.cap.editCapByPK(capModel)

        if (!setNameResult.getSuccess()) { logDebug("**WARNING: error setting cap name : " + setNameResult.getErrorMessage()); return false }


        return true;
    }

    function editAppSpecific(itemName, itemValue)  // optional: itemCap
    {
        var itemCap = capId;
        var itemGroup = null;
        if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

        if (useAppSpecificGroupName) {
            if (itemName.indexOf(".") < 0) { logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false }


            itemGroup = itemName.substr(0, itemName.indexOf("."));
            itemName = itemName.substr(itemName.indexOf(".") + 1);
        }
        // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
        // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
        // and replacing with the field name

        var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
        if (asiFieldResult.getSuccess()) {
            var asiFieldArray = asiFieldResult.getOutput();
            if (asiFieldArray.length > 0) {
                var asiField = asiFieldArray[0];
                if (asiField) {
                    var origAsiValue = asiField.getChecklistComment();
                    asiField.setChecklistComment(itemValue);

                    var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                    if (updateFieldResult.getSuccess()) {
                        logDebug("Successfully updated custom field: " + itemName + " with value: " + itemValue);
                        if (arguments.length < 3) //If no capId passed update the ASI Array
                            AInfo[itemName] = itemValue;
                    }
                    else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
                }
                else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
            }
        }
        else {
            logDebug("ERROR: (editAppSpecific) " + asiFieldResult.getErrorMessage());
        }
    }

    function editAppSpecific4ACA(itemName, itemValue) {
        var i = cap.getAppSpecificInfoGroups().iterator();
        //logDebug("i: " + i);
        while (i.hasNext()) {
            var group = i.next();
            var fields = group.getFields();
            if (fields != null) {
                var iteFields = fields.iterator();
                while (iteFields.hasNext()) {
                    var field = iteFields.next();
                    //logDebug(field.getCheckboxType() + " - " + field.getCheckboxDesc() + " : " + field.getChecklistComment());
                    if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
                        field.setChecklistComment(itemValue);
                        logDebug("Set "
                            + (useAppSpecificGroupName ? field.getCheckboxType() + "." : "")
                            + field.getCheckboxDesc()
                            + ": " + field.getChecklistComment());
                    }
                }
            }
        }
    }
}

/*--------------------------------------------------------------------------------/
| BEGIN GLOBAL Specific Variables normally defined in INCLUDES_ACCELA_GLOBALS
/--------------------------------------------------------------------------------*/
var GLOBAL_VERSION = 3.22;

var cancel = false;

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date(aa.util.now());
var startTime = startDate.getTime();
var message = "";									// Message String
if (typeof debug === 'undefined') {
    var debug = "";										// Debug String, do not re-define if calling multiple
}
var br = "<BR>";									// Break Tag
var feeSeqList = new Array();						// invoicing fee list
var paymentPeriodList = new Array();				// invoicing pay periods

var currentUserID = aa.env.getValue("CurrentUserID"); // Current User
var systemUserObj = null;  							// Current User Object
var currentUserGroup = null;						// Current User Group
var publicUserID = null;
var publicUser = false;

if (currentUserID.indexOf("PUBLICUSER") == 0) {
    publicUserID = currentUserID;
    currentUserID = "ADMIN";
    publicUser = true;
}
if (currentUserID != null) {
    systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
}

var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var servProvCode = aa.getServiceProviderCode();

logDebug("EMSE Script Framework Versions");
logDebug("EVENT TRIGGERED: " + vEventName);
logDebug("SCRIPT EXECUTED: " + vScriptName);
logDebug("INCLUDE VERSION: " + (typeof (INCLUDE_VERSION) != "undefined" ? INCLUDE_VERSION: "undefined (INCLUDES_ACCELA_FUNCTIONS did not load."));
logDebug("SCRIPT VERSION : " + SCRIPT_VERSION);
logDebug("GLOBAL VERSION: " + (typeof (GLOBAL_VERSION) != "undefined" ? GLOBAL_VERSION : "undefined (INCLUDES_ACCELA_GLOBALS did not load."));

// Log All Environmental Variables
var params = aa.env.getParamValues();
var keys = params.keys();
var key = null;
logDebug("// Parameters: ");
var currentUserID = aa.env.getValue("CurrentUserID");
logDebug('aa.env.setValue("CurrentUserID", "' + currentUserID + '");');
var keyS = [];
while (keys.hasMoreElements()) {
    key = keys.nextElement();
    if (exists(key, ["CurrentUserID"])) continue;
    keyS.push(key);
}
keyS.sort();
var requiredParams = ["CurrentUserID", "CapModel", "fromReviewPage", "CAP_MODEL_INITED"];
for (var kk in requiredParams) {
    key = requiredParams[kk];
    if (exists(key, keyS)) continue;
    keyS.push(key);
}
for (var kk in keyS) {
    var key = keyS[kk];
    var keyValue = aa.env.getValue(key);
    var keyValueClass = "typeof " + typeof (keyValue);
    if (keyValue.getClass) keyValueClass = keyValue.getClass();
    //    eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
    var keyComment = "";
    if (keyValueClass != "class java.lang.String") keyComment = "// " + keyValueClass;
    if (key == "CurrentUserID") {
        var systemUserObj = aa.person.getUser(currentUserID).getOutput();      // Current User Object
        keyComment = "// UserID: " + systemUserObj.getUserID() + ", email: " + systemUserObj.getEmail();
    }
    if (keyValueClass == "class com.accela.aa.aamain.cap.CapModel") {
        logDebug('var capIDString = "' + keyValue.capID.getCustomID() + '";');
        logDebug('var capID = aa.cap.getCapID(capIDString).getOutput();');
        logDebug('var capModel = aa.cap.getCapViewBySingle4ACA(capID);');
        logDebug('aa.env.setValue("CapModel", capModel);' + keyComment);
    } else if (keyValueClass == "class java.lang.String") {
        logDebug('aa.env.setValue("' + key + '","' + keyValue + '");' + keyComment);
    } else {
        logDebug('aa.env.setValue("' + key + '","' + keyValue + '"); // ' + keyValueClass);
    }
}

var capId = null,
    cap = null,
    capIDString = "",
    appTypeResult = null,
    appTypeAlias = "",
    appTypeString = "",
    appTypeArray = new Array(),
    capName = null,
    capStatus = null,
    fileDateObj = null,
    fileDate = null,
    fileDateYYYYMMDD = null,
    parcelArea = 0,
    estValue = 0,
    calcValue = 0,
    houseCount = 0,
    feesInvoicedTotal = 0,
    balanceDue = 0,
    houseCount = 0,
    feesInvoicedTotal = 0,
    capDetail = "",
    AInfo = new Array(),
    partialCap = false,
    feeFactor = "",
    parentCapId = null;

/*--------------------------------------------------------------------------------/
| BEGIN CAP (Record) Specific Variables
/--------------------------------------------------------------------------------*/
var cap = aa.env.getValue("CapModel");
var fromReviewPage = aa.env.getValue("fromReviewPage");
var capModelInited = aa.env.getValue("CAP_MODEL_INITED");
var parentCapId = null;//(cap ? cap.getParentCapID() : null);
logDebug("// cap: " + cap
    + (cap && cap.capID && cap.capID.getCustomID ? ", altID: " + cap.capID.getCustomID() : "")
    + (cap && cap.capID ? ", capID: " + cap.capID : "")
    + (parentCapId && parentCapId.getCustomID ? ", parentCapId: " + parentCapId.getCustomID() : "")
);

var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();					// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();	// Calculated valuation
if (valobj.length) {
    estValue = valobj[0].getEstimatedValue();
    calcValue = valobj[0].getCalculatedValue();
    feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess()) {
    capDetail = capDetailObjResult.getOutput();
    var houseCount = capDetail.getHouseCount();
    var feesInvoicedTotal = capDetail.getTotalFee();
    var balanceDue = capDetail.getBalance();
}

try {
var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables();
} catch (err) {
    context = "Page Flow Script: " + aa.env.getValue("ScriptCode") + " Load CapID"
    //handleError(err, context);
    cancel = true;
    showDebug = true;
    rollBack = true;
    logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);

    if (typeof (br) == "undefined") br == "<BR>";
    if (typeof (errorMsg) == "undefined") errorMsg == ""
    errorMsg += "ERROR:" + err.message + br;
    if (typeof (systemMailFrom) == "undefined") systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
    if (typeof (errorEmailTo) == "undefined") errorEmailTo == "rschug@truepointsolutions.com";
    if (typeof (vScriptName) == "undefined") vScriptName == "Unknown";
    aa.sendMail(systemMailFrom, errorEmailTo, "", vScriptName + ", ERROR: "
        + (typeof (capIDString) != "undefined" ? capIDString + " " : "")
        + (typeof (capId) != "undefined" ? capId + " " : ""), errorMsg + "Debug: " + br + debug.replace(/\r/g, br));
}

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);
if (parentCapId) logDebug("parentCapId = " + parentCapId.getCustomID());

//eval(_getScriptText("INCLUDES_CUSTOM_GLOBALS"));
eval(_getScriptText("INCLUDES_PAGEFLOW_GLOBALS", null, false));

/*--------------------------------------------------------------------------------/
| BEGIN Environment & Debug Specific Variables
/--------------------------------------------------------------------------------*/
//var batchResultEmailTemplate = "" + aa.env.getValue("BatchEmailTemplate");

try {
if (typeof (hostName) == "undefined") var hostName = java.net.InetAddress.getLocalHost().getHostName(); // Host Name

var serverName = java.net.InetAddress.getLocalHost().getHostName(); // Host Name
if (serverName.toLowerCase().indexOf("prod") < 0) {
    systemMailFrom = systemMailFrom.toLowerCase().replace("noreply@accela.com", "NoReply-" + serverName + "@accela.com");
    logDebug("Updated systemMailFrom: " + systemMailFrom);
}
//envText = "";
//envName = getEnvironmentName();

var acaURL = lookup("ACA_CONFIGS", "ACA_SITE");
if (typeof (acaURL) == "undefined") acaURL = null;
else if (acaURL.toLowerCase().indexOf("/admin") >= 0)
    acaURL = acaURL.substr(0, acaURL.toLowerCase().indexOf("/admin"));
logDebug("acaURL: " + acaURL);

var avUrl = lookup("ACA_CONFIGS", "V360_WEB_ACTION_URL");
if (typeof (avUrl) == "undefined") avUrl = null;
else if (avUrl.toLowerCase().indexOf("/portlets") >= 0)
    avUrl = avUrl.substr(0, avUrl.toLowerCase().indexOf("/portlets"));
logDebug("avUrl: " + avUrl);

var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
if (typeof (systemMailFrom) == "undefined")
    systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
if (avUrl && avUrl.toLowerCase().indexOf("-av.accela.com") >= 0) {
    systemMailFrom = "NoReply-" + (avUrl.replace("https://", "").replace("-av.accela.com", "")).toUpperCase() + "@accela.com";
    logDebug("Using systemEmailFrom (avUrl): " + systemMailFrom);
} else if (typeof (mailFrom) != "undefined") {
    systemMailFrom = mailFrom;
    logDebug("Using systemEmailFrom (mailFrom): " + systemMailFrom);
} else {
    systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
}

if (typeof (debugEmailTo) == "undefined")
    debugEmailTo == "";
if (typeof (errorEmailTo) == "undefined")
    errorEmailTo == "";

// Get Public User Email Address
var publicUserEmail = "";
if (publicUserID) {
    var publicUserModelResult = aa.publicUser.getPublicUserByPUser(publicUserID);
    if (publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput()) {
        publicUserEmail = publicUserModelResult.getOutput().getEmail();
        logDebug("publicUserEmail: " + publicUserEmail + " for " + publicUserID)
    } else {
        publicUserEmail = null;
        logDebug("publicUserEmail: " + publicUserEmail);
    }
}
if (publicUserEmail) publicUserEmail = publicUserEmail.toLowerCase();
if (publicUserEmail && publicUserEmail.indexOf("truepointsolutions.com") >= 0) {
    publicUserEmail = publicUserEmail.replace("turned_off", "");
    debugEmailTo = publicUserEmail;
    errorEmailTo = publicUserEmail;
    logDebug("Override debugEmailTo: " + debugEmailTo);
    logDebug("Override errorEmailTo: " + errorEmailTo);
}
} catch (err) {
    context = "Page Flow Script: " + aa.env.getValue("ScriptCode") + " Load Environment"
    //handleError(err, context);
    cancel = true;
    showDebug = true;
    rollBack = true;
    logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);

    if (typeof (br) == "undefined") br == "<BR>";
    if (typeof (errorMsg) == "undefined") errorMsg == ""
    errorMsg += "ERROR:" + err.message + br;
    if (typeof (systemMailFrom) == "undefined") systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
    if (typeof (errorEmailTo) == "undefined") errorEmailTo == "rschug@truepointsolutions.com";
    if (typeof (vScriptName) == "undefined") vScriptName == "Unknown";
    aa.sendMail(systemMailFrom, errorEmailTo, "", vScriptName + ", ERROR: "
        + (typeof (capIDString) != "undefined" ? capIDString + " " : "")
        + (typeof (capId) != "undefined" ? capId + " " : ""), errorMsg + "Debug: " + br + debug.replace(/\r/g, br));
}

/*--------------------------------------------------------------------------------/
| BEGIN Page Flow custom code
/--------------------------------------------------------------------------------*/
var checkOk = false;
var recordUpdated = false;
var hidePage = false; // Used in OnLoad
var gotoPage = null, gotoStep = null; // Used in AFTER
try {
    //var showDebug = true;
    if (fromReviewPage == "Y") { // Already initialized. Editing from Review Page.
        logDebug("fromReviewPage: " + fromReviewPage);
    } else {
		if(!matches(AInfo["RequiredDocumentTypes"],null,"",undefined)) {
			// Update Fields in DB from fields in CapModel
			var fieldNamesDPC = ["RequiredDocumentTypesComplete"];
			logDebug("Checking fields: " + String(fieldNamesDPC));
			for (var ff in fieldNamesDPC) {
				var fieldName = fieldNamesDPC[ff];
				logDebug("Checking " + fieldName
					+ ": (DB) " + getAppSpecific(fieldName)
					+ ": (ACA) " + getAppSpecific4ACA(fieldName)
				);
				var fieldValueACA = getAppSpecific4ACA(fieldName);
				var fieldValueDB = getAppSpecific(fieldName);
				if(!matches(fieldValueDB,"Y","Yes")) {
					showMessage = true;
					//cancel = true;
					comment("You have not uploaded all required document types for this record. Please see remaining required documents listed below.");
				}
			}
		}
    }

    if (recordUpdated) { 
        var amendCapModel = cap;
        if (recordUpdated == "Amended") { // Warning any changes not saved to database will be lost.
            var amendCapModel = aa.cap.getCapViewBySingle4ACA(capId);
        }
        if (amendCapModel != cap) {
            amendCapModel.getCapType().setSpecInfoCode(cap.getCapType().getSpecInfoCode());
            //amendCapModel.setAppSpecificInfoGroups(capModel.getAppSpecificInfoGroups());
            logDebug("return amendCapModel: " + amendCapModel
                + (amendCapModel && amendCapModel.capID && amendCapModel.capID.getCustomID ? ", altID: " + amendCapModel.capID.getCustomID() : "")
                + (amendCapModel && amendCapModel.capID ? ", capID: " + amendCapModel.capID : "")
            );
            aa.env.setValue("CapModel", amendCapModel);
            aa.env.setValue("CAP_MODEL_INITED", "TRUE");
        } else {
            logDebug("return CapModel: " + cap
                + (cap && cap.capID && cap.capID.getCustomID ? ", altID: " + cap.capID.getCustomID() : "")
                + (cap && cap.capID ? ", capID: " + cap.capID : "")
            );
            aa.env.setValue("CapModel", cap);
        }
        aa.env.setValue("CAP_MODEL_INITED", "TRUE");
    }

    if (gotoStep && gotoPage) { // Use in After pageflow scripts to skip to a specific page
        logDebug("Goto step: " + gotoStep + ", page: " + gotoPage);
        aa.env.setValue("ReturnData", "{'PageFlow': {'StepNumber': '" + gotoStep + "', 'PageNumber':'" + gotoPage + "'}}");
    } else if (hidePage) { // Use in OnLoad pageflow scripts to skip current page
        logDebug("hide current page");
        aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
    }

    //
    // Check for invoicing of fees
    //
    if (feeSeqList.length) {
        invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
        if (invoiceResult.getSuccess())
            logMessage("Invoicing assessed fee items is successful.");
        else
            logMessage("**ERROR: Invoicing the fee items assessed to app # " + capIDString + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
    }

    // Send Debug Email
    debugEmailSubject = "";
    debugEmailSubject += (capIDString ? capIDString + " " : "")
        + (capId ? capId + " " : "") + vScriptName + ", DEBUG";

    if (debugEmailTo && debugEmailTo != "") {
        var debugEmailFrom = systemMailFrom;
        var scriptResult = aa.sendMail(debugEmailFrom, debugEmailTo, "", debugEmailSubject, "Debug: " + br + debug.replace(/\r/g, br));
        if (scriptResult.getSuccess()) {
            logDebug("Sent DEBUG Email to " + debugEmailTo + " from " + debugEmailFrom)
        } else {
            logDebug("Failed sending DEBUG Email to " + debugEmailTo + " from " + debugEmailFrom + " " + scriptResult.getErrorMessage());
        }
    }
} catch (err) {
    context = "Page Flow Script: " + aa.env.getValue("ScriptCode") + " "
    //handleError(err, context);
    cancel = true;
    showDebug = true;
    rollBack = true;
    logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);

    if (typeof (br) == "undefined") br == "<BR>";
    if (typeof (errorMsg) == "undefined") errorMsg == ""
    errorMsg += "ERROR:" + err.message + br;
    if (typeof (systemMailFrom) == "undefined") systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
    if (typeof (errorEmailTo) == "undefined") errorEmailTo == "rschug@truepointsolutions.com";
    if (typeof (vScriptName) == "undefined") vScriptName == "Unknown";
    aa.sendMail(systemMailFrom, errorEmailTo, "", vScriptName + ", ERROR: "
        + (typeof (capIDString) != "undefined" ? capIDString + " " : "")
        + (typeof (capId) != "undefined" ? capId + " " : ""), errorMsg + "Debug: " + br + debug.replace(/\r/g, br));
}

/*--------------------------------------------------------------------------------/
| END Page Flow custom code
/--------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}

if (aa.env.getValue("ScriptName") == "Test") {     // Setup parameters for Script Test.
    logDebug("ErrorCode: " + aa.env.getValue("ErrorCode"));
    //logDebug("ErrorMessage: " + aa.env.getValue("ErrorMessage"));
    //logDebug("ScriptReturnCode: " + aa.env.getValue("ScriptReturnCode"));
    //logDebug("ScriptReturnMessage: " + aa.env.getValue("ScriptReturnMessage"));
}
/*
if (message && message != "") {
    var z = message.replace(/<BR>/g, "\r"); aa.print("MESSAGE:\r" + z);
}
if (debug && debug != "") {
    var z = debug.replace(/<BR>/g, "\r"); aa.print("DEBUG:\r" + z);
}
*/

try {
    // Send Error Email
    if (debug.indexOf("**ERROR") >= 0 && errorEmailTo != "") {
        var errorEmailFrom = systemMailFrom;
        aa.sendMail(errorEmailFrom, errorEmailTo, "", "ERROR: "
            + (capIDString ? capIDString + " " : "")
            + (capId ? capId + " " : "") + vScriptName, errorMsg + "Debug: " + br + debug.replace(/\r/g, br));
        aa.print("Sent ERROR email to: " + errorEmailTo);
    }
} catch (err) {
    context = "Page Flow Script: " + aa.env.getValue("ScriptCode") + " Send Error Email"
    rollBack = true;
    showDebug = true;
    logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);
}

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ScriptReturnCode", "-1");
	aa.env.setValue("ScriptReturnMessage", debug);
	}
else
	{
	if (cancel)
		{
		aa.env.setValue("ScriptReturnCode", "-1");
		if (showMessage) aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + message);
		if (showDebug) 	aa.env.setValue("ScriptReturnMessage", "<font color=red><b>Action Cancelled</b></font><br><br>" + debug);
		}
	else
		{
		aa.env.setValue("ScriptReturnCode", "0");
		if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
		if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
		}
	}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

function getAppSpecific4ACA(itemName) {
    var itemValue = null;
    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false }
    }

    var i = cap.getAppSpecificInfoGroups().iterator();
    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." +
                    field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
                    return field.getChecklistComment();
                }
            }
        }
    }
    return itemValue;
}

function getAppSpecific4ACA(itemName) {
    var itemValue = null;
    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false }
    }

    var i = cap.getAppSpecificInfoGroups().iterator();
    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." +
                    field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
                    return field.getChecklistComment();
                }
            }
        }
    }
    return itemValue;
}

function getParent4ACA(targetCapId) {
    // returns the capId object of the parent.  Assumes only one parent!
    //
    var getCapResult = aa.cap.getProjectParents(targetCapId, 1);
    if (getCapResult.getSuccess()) {
        var parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}

function loadASITables4ACA() {
    //
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    //
    // Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
    //

    var itemCap = capId;
    if (arguments.length == 1) {
        itemCap = arguments[0]; // use cap ID specified in args
        var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    }
    else {
        var gm = cap.getAppSpecificTableGroupModel()
    }

    var ta = gm.getTablesMap();
    var tai = ta.values().iterator();

    while (tai.hasNext()) {
        var tsm = tai.next();

        if (tsm.rowIndex.isEmpty()) continue;  // empty table

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();

        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number
        logDebug("Loading Table: " + tn);

        var tsmfldi = tsm.getTableField().iterator();
        var tsmcoli = tsm.getColumns().iterator();
        var numrows = 1;

        while (tsmfldi.hasNext())  // cycle through fields
        {
            if (!tsmcoli.hasNext())  // cycle through columns
            {
                var tsmcoli = tsm.getColumns().iterator();
                tempArray.push(tempObject);  // end of record
                var tempObject = new Array();  // clear the temp obj
                numrows++;
            }
            var tcol = tsmcoli.next();
            var tval = tsmfldi.next().getInputValue();
            tempObject[tcol.getColumnName()] = tval;
        }
        tempArray.push(tempObject);  // end of record
        var copyStr = "" + tn + " = tempArray";
        logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
        eval(copyStr);  // move to table name
    }
}

function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0" + pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
		day = "0" + pDay.toString();

	if (pFormat == "YYYY-MM-DD")
		ret = pYear.toString() + "-" + mth + "-" + day;
	else
		ret = "" + mth + "/" + day + "/" + pYear.toString();

	return ret;
}

/*-----------------------------------------------------------------------------------------------------/
| Program : ACA_AFTER_POPULATE_DPC_INFO
| Event   : ACA Page Flow 
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   : Used by Page Flow: 
|         : TDunn 08/01/2024 updated required documents: replace SolarApp Spec Sheets with Equipment Spec Sheets
|         : TDunn 09/26/2024 updated required docs for SolarApp Revision, replaced SolarApp Project Revision with SolarApp Revision Approval
|         : TDunn 12/20/2024 added additional doc requirements for full review when authorized agent or owner-builder
|         : TDunn 01/16/2025 added doc requirements for Residential Master and Master Revision
|         : TDunn 01/30/2025 updated doc requirements for Full Review record types.
|
/--------------------------------------------------------------------------------------------------------------------------------------------*/
if (aa.env.getValue("ScriptName") == "Test" && aa.env.getValue("CapModel") == "") {     // Setup parameters for Script Test.
    var CurrentUserID = "PUBLICUSER1282"; // Public User ID: mhelvick, mckenzie@truepointsolutions.com
	var capIDString = "22TMP-000247";       // Test Temp Record from ACA.
    aa.env.setValue("ScriptCode", "Test");
    aa.env.setValue("CurrentUserID", CurrentUserID);     // Current User
    sca = capIDString.split("-");
    if (sca.length == 3 && sca[1] == "00000") { // Real capId
        var capID = aa.cap.getCapID(sca[0], sca[1], sca[2]).getOutput();
        var capIDType = " sca";
    } else { // Alt capId
        capID = aa.cap.getCapID(capIDString).getOutput();
        var capIDType = "";
    }
    capModel = null;
    if (capID) capModel = aa.cap.getCapViewBySingle4ACA(capID);
    aa.env.setValue("CapModel", capModel);
    aa.env.setValue("fromReviewPage", "N"); // From Review Page? Y/N
    //aa.env.setValue("CAP_MODEL_INITED", "TRUE");
	aa.print(aa.env.getValue("ScriptName")
		+ " using capID: " + capID
		+ ", capIDString: " + capIDString + capIDType 
		+ ",capModel: " + aa.env.getValue("CapModel"));
}
var systemMailFrom = "NoReply@accela.com";
var debugEmailTo = "";
var debugEmailTo = "mckenzie@truepointsolutions.com";
//var debugEmailTo = "rschug@truepointsolutions.com";
var errorEmailTo = debugEmailTo;

/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var controlString = ""; // Standard choice for control
var preExecute = "";	// Standard choice to execute first (for globals, etc)
var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps

// From INCLUDES_ACCELA_GLOBALS
var showMessage = false;		// Set to true to see results in popup window
var showDebug = false;			// Set to true to see debug messages in popup window
var disableTokens = false;		// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;	// Use Group name when populating Task Specific Info Values
var enableVariableBranching = true;	// Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;			// Maximum number of std choice entries.  Entries must be Left Zero Padded

var GLOBAL_VERSION = 3.22;
var cancel = false;

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date(aa.util.now());
var startTime = startDate.getTime();
var message = "";									// Message String
var debug = "";										// Debug String, do not re-define if calling multiple
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
if (currentUserID != null && currentUserID != "") { //!currentUserID.isEmpty()) {
	systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
}

var servProvCode = aa.getServiceProviderCode();

/*--------------------------------------------------------------------------------/
| BEGIN CAP (Record) Specific Variables
/--------------------------------------------------------------------------------*/
try {
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

var capModel = aa.env.getValue("CapModel");
var cap = capModel;
var fromReviewPage = aa.env.getValue("fromReviewPage");
var capModelInited = aa.env.getValue("CAP_MODEL_INITED");
var parentCapId = (cap ? cap.getParentCapID() : null);
logDebug("/* Script Initializer for " + aa.env.getValue("ScriptName"));
logDebug('aa.env.setValue("ScriptName", "' + aa.env.getValue("ScriptName") + '");');
logDebug('aa.env.setValue("ScriptCode", "' + aa.env.getValue("ScriptCode") + '");');
logDebug('aa.env.setValue("EventName", "' + aa.env.getValue("EventName") + '");');
logDebug('aa.env.setValue("CurrentUserID", "' + aa.env.getValue("CurrentUserID") + '");');
if (cap && cap.capID) {
    if (cap.capID.getCustomID) {
        logDebug('capID = aa.cap.getCapID("' + cap.capID.getCustomID() + '").getOutput();');
    } else {
        logDebug('capID = aa.cap.getCapID("' + cap.capID + '").getOutput();');
    }
    logDebug('capModel = aa.cap.getCapViewBySingle4ACA(capID);');
    logDebug('aa.env.setValue("CapModel", capModel);');
}
logDebug('aa.env.setValue("fromReviewPage", "' + aa.env.getValue("fromReviewPage") + '"); // From Review Page? Y/N');
logDebug('aa.env.setValue("CAP_MODEL_INITED", "' + aa.env.getValue("CAP_MODEL_INITED") + '");');
logDebug("--------------------*/");
logDebug("// cap: " + cap
	+ (cap && cap.capID && cap.capID.getCustomID ? ", altID: " + cap.capID.getCustomID() : "")
	+ (cap && cap.capID ? ", capID: " + cap.capID : "")
	+ (parentCapId && parentCapId.getCustomID ? ", parentCapId: " + parentCapId.getCustomID() : "")
);

if (cap) {
	var capId = cap.getCapID();
	if (capId != null) {
		var servProvCode = capId.getServiceProviderCode()
		var capIDString = capId.getCustomID();
	}
	appTypeResult = cap.getCapType();
	appTypeAlias = appTypeResult.getAlias();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");
	if (appTypeArray[0].substr(0, 1) != "_") {
		var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
		if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
	}
	capName = cap.getSpecialText();
	capStatus = cap.getCapStatus();
	partialCap = !cap.isCompleteCap();
	fileDateObj = cap.getFileDate();
	if (fileDateObj) {
		if (fileDateObj.getDayOfMonth) {
			fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
			fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
		} else if (fileDateObj.getDate) {
			fileDate = "" + (fileDateObj.getMonth() + 1) + "/" + fileDateObj.getDate() + "/" + (fileDateObj.getYear() + 1900);
			fileDateYYYYMMDD = dateFormatted((fileDateObj.getMonth() + 1), fileDateObj.getDate(), (fileDateObj.getYear() + 1900), "YYYY-MM-DD");
		}
	}

	// Modified to pull from capModel instead of from DB.
	valuatnModel = capModel.getBValuatnModel();
	if (valuatnModel) {
		estValue = valuatnModel.getEstimatedValue();
		calcValue = valuatnModel.getCalculatedValue();
		feeFactor = valuatnModel.getFeeFactorFlag();
	}
	capDetail = capModel.getCapDetailModel()
	if (capDetail) {
		var houseCount = capDetail.getHouseCount();
		var feesInvoicedTotal = capDetail.getTotalFee();
		var balanceDue = capDetail.getBalance();
	}
/* 	var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();
	if (valobj.length) {
		estValue = valobj[0].getEstimatedValue();
		calcValue = valobj[0].getCalculatedValue();
		feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	}
	var capDetailObjResult = aa.cap.getCapDetail(capId);
	if (capDetailObjResult.getSuccess()) {
		capDetail = capDetailObjResult.getOutput();
		var houseCount = capDetail.getHouseCount();
		var feesInvoicedTotal = capDetail.getTotalFee();
		var balanceDue = capDetail.getBalance();
	} */
}
} catch (err) {
	handleError(err, "Page Flow Script: " + aa.env.getValue("ScriptCode") + " Loading CAP Info");
}
/*--------------------------------------------------------------------------------/
| BEGIN Environment & Debug Specific Variables
/--------------------------------------------------------------------------------*/
//var batchResultEmailTemplate = "" + aa.env.getValue("BatchEmailTemplate");
try {
if (typeof (hostName) == "undefined") var hostName = java.net.InetAddress.getLocalHost().getHostName(); // Host Name

var serverName = java.net.InetAddress.getLocalHost().getHostName(); // Host Name
logDebug("serverName: " + serverName);

var acaURL = lookup("ACA_CONFIGS", "ACA_SITE");
if (typeof (acaURL) == "undefined") acaURL = null;
else if (acaURL.toLowerCase().indexOf("/admin") >= 0)
	acaURL = acaURL.substr(0, acaURL.toLowerCase().indexOf("/admin"));
logDebug("acaURL: " + acaURL);

envText = "";
//envName = getEnvironmentName();

avUrl = null;
if (acaURL && String(acaURL).indexOf(".accela.com")) {
    envText = acaURL.replace("https://aca-", "").replace(".accela.com", "").toUpperCase();
    if (envText.indexOf("/") >= 0)
        envText = envText.substr(0, envText.indexOf("/"));
    avUrl = "https://" + servProvCode + "-" + envText + "-av.accela.com";
} else {
    var avUrl = lookup("ACA_CONFIGS", "V360_WEB_ACTION_URL");
    if (typeof (avUrl) == "undefined") avUrl = null;
    else if (avUrl.toLowerCase().indexOf("/portlets") >= 0)
        avUrl = avUrl.substr(0, avUrl.toLowerCase().indexOf("/portlets"));
}
logDebug("avUrl: " + avUrl);
logDebug("envText: " + envText);

var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
if (avUrl && avUrl.toLowerCase().indexOf("-av.accela.com") >= 0) {
	systemMailFrom = "NoReply-" + (avUrl.replace("https://", "").replace("-av.accela.com", "")).toUpperCase() + "@accela.com";
	logDebug("Using systemEmailFrom (avUrl): " + systemMailFrom);
} else if (typeof (mailFrom) != "undefined") {
	systemMailFrom = mailFrom;
	logDebug("Using systemEmailFrom (mailFrom): " + systemMailFrom);
} else if (typeof (systemMailFrom) == "undefined") {
	systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
}

if (typeof (debugEmailTo) == "undefined")	debugEmailTo == "mckenzie@truepointsolutions.com";
if (typeof (errorEmailTo) == "undefined")	errorEmailTo == "mckenzie@truepointsolutions.com";

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
	debugEmailTo += (debugEmailTo == publicUserEmail ? "" : "," + publicUserEmail);
	errorEmailTo += (errorEmailTo == publicUserEmail ? "" : "," + publicUserEmail);
	logDebug("Override debugEmailTo: " + debugEmailTo);
	logDebug("Override errorEmailTo: " + errorEmailTo);
}
} catch (err) {
	_handleError(err, "Page Flow Script: " + aa.env.getValue("ScriptCode") + " Loading Environment Info");
}

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 9.0;
var useCustomScriptFile = true;  // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*

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

var sv_functions = "" + String(getScriptText) + String(logDebug);
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	// eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA,useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	// eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
}
eval(sv_functions);

// From INCLUDES_ACCELA_GLOBALS (continued)
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");

if (cap) {
	loadAppSpecific4ACA(AInfo);
	// loadTaskSpecific(AInfo);
	// loadParcelAttributes(AInfo);
	// loadASITables4ACA();
    if (typeof(INCLUDE_VERSION) == "undefined") INCLUDE_VERSION = "INCLUDES_ACCELA_FUNCTIONS not loaded";
    if (typeof(GLOBAL_VERSION) == "undefined") GLOBAL_VERSION = "INCLUDES_ACCELA_GLOBALS not loaded";
	logDebug("EMSE Script Framework Versions");
	logDebug("SCRIPT EXECUTED: " + vScriptName);
	logDebug("INCLUDE VERSION: " + INCLUDE_VERSION);
	logDebug("SCRIPT VERSION : " + SCRIPT_VERSION);
	logDebug("GLOBAL VERSION: " + GLOBAL_VERSION);

	logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
	logDebug("capId = " + capId.getClass());
	logDebug("cap = " + cap.getClass());
	logDebug("currentUserID = " + currentUserID);
	logDebug("currentUserGroup = " + currentUserGroup);
    logDebug("systemUserObj = " + (systemUserObj ? systemUserObj.getClass() + ", fullName: " + systemUserObj.fullName : "null"));
    logDebug("appTypeString = " + appTypeString + ", alias = " + appTypeAlias);
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
}

//eval(getScriptText("INCLUDES_CUSTOM_GLOBALS"));
eval(getScriptText("INCLUDES_PAGEFLOW_GLOBALS", null, false));

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
eval(getScriptText("INCLUDES_PAGEFLOW", null, false));

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	// Modified version to include script location & version if applicable
	if (!servProvCode) servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var vScriptNamePrefix = "", scriptTextMsg = "";
		if (useProductScripts) {
			var vScriptNamePrefix = "Events>Master Scripts>";
			if (vScriptName == "INCLUDES_CUSTOM") vScriptNamePrefix = "Events>Custom Script>";
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var vScriptNamePrefix = "Events>Scripts>";
            try {
                var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
            } catch (err2) {
                var emseScript = null;
            }
            if (emseScript == null && false) { // Check Master if not in Scripts
                try {
                    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
                    if (emseScript && emseScript.scriptText) var vScriptNamePrefix = "Events>Master Scripts>";
                } catch (err2) {
                    var emseScript = null;
                }
            }
		}
		var scriptText = (emseScript && emseScript.scriptText ? String(emseScript.scriptText + "").trim() : "");
        if (scriptText.length > 0) {
            if (typeof (debug) == "undefined") debug = "";
            var scriptTextMsg = "...Loading script: " + vScriptNamePrefix + vScriptName
                + (emseScript.scriptName && emseScript.sripteCode != vScriptName ? ", Name: " + emseScript.scriptName : "")
                + (emseScript.sripteCode && emseScript.sripteCode != vScriptName ? ", Code: " + emseScript.sripteCode : "")
                + (emseScript.masterScriptVersion ? ", Version: " + emseScript.masterScriptVersion : "")
                + ", length: " + scriptText.length
                // + (emseScript.auditDate ? ", auditDate: " + emseScript.auditDate : "")
                // + (emseScript.auditID ? ", auditID: " + emseScript.auditID : "")
                // + (emseScript.auditStatus ? ", auditStatus: " + emseScript.auditStatus : "")
                // + (emseScript.description ? ", description: " + emseScript.description : "")
                // + (emseScript.scriptInitializer ? ", scriptInitializer: " + emseScript.scriptInitializer : "")
                // + (emseScript.serviceProviderCode ? ", serviceProviderCode: " + emseScript.serviceProviderCode : "")
                // + (emseScript.scriptText ? ", Text: " + String(emseScript.scriptText).substring(106, 146) + " ..." : "")
                // + br + describe_TPS(emseScript)
        // } else if (emseScript) {
        //     var scriptTextMsg = "...Loading script: " + vScriptNamePrefix + vScriptName + " not found"
        }
        if (scriptTextMsg) {
			if (typeof (logDebug) == "undefined") {
				debug += scriptTextMsg + br;
			} else {
				logDebug(scriptTextMsg);
			}
        }
		return scriptText;
	} catch (err) {
		if (typeof (debug) == "undefined") debug = "";
		if (typeof (br) == "undefined") br = "<BR>";
		if (err.message.indexOf("ScriptNotFoundException") < 0) {
            var scriptErrorMsg = "ERROR: Loading script: " + vScriptNamePrefix + vScriptName + " at line " + err.lineNumber + " : " + err.message
		} else if (vScriptNamePrefix != "Events>Scripts>") {
            var scriptErrorMsg = "ERROR: Loading script: " + vScriptNamePrefix + vScriptName + ": " + err.message
        } else {
            var scriptErrorMsg = "...Loading script: " + vScriptNamePrefix + vScriptName + " not found."
		}
        if (typeof (logDebug) == "undefined") {
            // aa.print(scriptErrorMsg);
            debug += scriptErrorMsg + br;
        } else {
            // aa.print(scriptErrorMsg);
            logDebug(scriptErrorMsg);
            if (scriptErrorMsg.indexOf("not found") < 0)
                logDebug("Stack: " + err.stack);
        }
        return "";
	}
}

function getMasterScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try{
		var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
		return emseScript.getScriptText() + "";
	}
	catch (err){
		aa.print("**ERROR: Failed to load master script "+vScriptName);
		return "";
	}
}

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0);    // run Pre-execution code

//logGlobals(AInfo); 
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------/
| BEGIN Page Flow custom code
/--------------------------------------------------------------------------------*/
var checkOk = false;
var recordUpdated = false;
var hidePage = false; // Used in OnLoad
var gotoPage = null, gotoStep = null; // Used in AFTER
try {
	if (capModel != null) {

		var isElectronicSubmittal = true;
		logDebug("<font color='green'>appTypeString: " + appTypeString + "</font>");
		logDebug("<font color='green'>publicUserID: " + publicUserID + "</font>");
		logDebug("<font color='green'>isElectronicSubmittal: " + isElectronicSubmittal + "</font>");

		var recordUpdated = "Amended"; // Causes information in memory to be lost.
		var recordUpdated = "Updated";
		// ---Expression Not Setting Field Values, so Pageflow script does
		var documentGroupforDPC = "BUILDING";	
		var rDocTypes = [];
		var excludeTypes = [];

		if(appMatch("Building/Residential/Full Review/*")) 
		{
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			if(matches(AInfo["Includes Ground Disturbance"],"Yes","Y","YES")) rDocTypes.push("Grading Questionnaire");
			if(matches(AInfo["Authorized Agent"],"Yes","Y","YES")) {
			   rDocTypes.push("Agent ID");
			   rDocTypes.push("Agent Authorization Letter");
			}
			if(matches(AInfo["Owner Builder"],"Yes","Y","YES")) {
				rDocTypes.push("Owner-Builder Acknowledgement");
			}
		}
		if(appMatch("Building/Residential/Full Review/Other")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			if(matches(AInfo["Type of Work"],"Accessory","Addition","Alteration")) rDocTypes.push("Plans");		
		}
		if(appMatch("Building/Residential/Full Review/Renewal")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			//if(matches(AInfo["Type of Work"],"Addition","Alteration","Demo")) rDocTypes.push("CWM Plan");
		}
		if(appMatch("Building/Residential/Full Review/Residential<3000")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");			
			//rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Residential/Full Review/Residential>3000")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");			
			//rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Residential/Full Review/Tract < 3000")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");
			//rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Residential/Full Review/Tract > 3000")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");
			//rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Residential/Limited/NA")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";	
			if(matches(AInfo["Authorized Agent"],"Yes","Y","YES")) {
			   rDocTypes.push("Agent ID");
			   rDocTypes.push("Agent Authorization Letter");
			}
			if(matches(AInfo["Owner Builder"],"Yes","Y","YES")) {
				rDocTypes.push("Owner-Builder Acknowledgement");
			}			
		}
		if(appMatch("Building/Residential/Plan Check Only/Master < 3000")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");
			rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Residential/Plan Check Only/Master > 3000")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");
			//rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Commercial/Full Review/*")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			if(matches(AInfo["Type of Work"],"New","Shell Only","Tenant Improvement")) rDocTypes.push("Plans");
			if(matches(AInfo["Includes Ground Disturbance"],"Yes","Y","YES")) rDocTypes.push("Grading Questionnaire");
			if(matches(AInfo["Authorized Agent"],"Yes","Y","YES")) {
			   rDocTypes.push("Agent ID");
			   rDocTypes.push("Agent Authorization Letter");
			}
			if(matches(AInfo["Owner Builder"],"Yes","Y","YES")) {
				rDocTypes.push("Owner-Builder Acknowledgement");
			}			
			//if(matches(AInfo["Type of Work"],"Demo","New","Shell Only","Tenant Improvement")) rDocTypes.push("CWM Plan");		
		}
		if(appMatch("Building/Commercial/Limited/NA")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			if(matches(AInfo["Authorized Agent"],"Yes","Y","YES")) {
			   rDocTypes.push("Agent ID");
			   rDocTypes.push("Agent Authorization Letter");
			}
			if(matches(AInfo["Owner Builder"],"Yes","Y","YES")) {
				rDocTypes.push("Owner-Builder Acknowledgement");
			}			
		}

		if(appMatch("Building/Revision/*/*")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			//if(AInfo["Replacing Plan Sheets"] == "Yes") rDocTypes.push("Plans");			
		}

		if(appMatch("Building/Deferred Submittal/*/*")) {
			documentGroupforDPC = "DEFERRED";
			rDocTypes.push("Approved Deferred Submittal Form");			
		}
		
		if(appMatch("Building/Residential/PV Solar/*")) {
			documentGroupforDPC = "BLD_SOLARAPP";
			if(appMatch("Building/*/*/Solar App"))
			{
				rDocTypes.push("Equipment Spec Sheets");
				rDocTypes.push("SolarApp Approval");
			}			
			if (AInfo["Authorized Agent"] == "CHECKED") {
			   rDocTypes.push("Agent ID");
			   rDocTypes.push("Agent Authorization Letter");
			}
			if(appMatch("Building/*/*/SolarApp Revision")) 
			{
			   rDocTypes.push("SolarApp Revision Approval");
			   rDocTypes.push("Equipment Spec Sheets");
			}
		}		

		if(appMatch("Building/Residential/Master/NA")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");
			if(matches(AInfo["Authorized Agent"],"Yes","Y","YES")) {
			   rDocTypes.push("Agent ID");
			   rDocTypes.push("Agent Authorization Letter");
			}
			if(matches(AInfo["Owner Builder"],"Yes","Y","YES")) {
				rDocTypes.push("Owner-Builder Acknowledgement");
			}				
		}
		
		if(appMatch("Building/Residential/Master/Revision")) {
			documentGroupforDPC = "BLD_PLANREVIEW_DPC";
			rDocTypes.push("Plans");		
		}
				
		if(appMatch("Planning/*/*/*")) {
			documentGroupforDPC = "PLANNING";
			rDocTypes.push("Plans");
		}

		if(appMatch("TRPA/*/*/*")) {
			documentGroupforDPC = "BUILDING";
			rDocTypes.push("Plans");
			//rDocTypes.push("Site Plan");			
		}

		docTypes = selectDocConfigByGroupPermissions(documentGroupforDPC,excludeTypes);

		var aDocTypes = [];
		for (var dd in docTypes) {
			var docType = docTypes[dd];
			if (!exists(docType, aDocTypes))
				aDocTypes.push(docType);
		}
		var additionalDocumentTypes = String(aDocTypes);
		var requiredDocumentTypes = String(rDocTypes);
		logDebug("<font color='green'>Exclude Document Types: " + String(excludeTypes)+ "</font>");
		logDebug("<font color='green'>these additionalDocumentTypes: " + additionalDocumentTypes + "</font>");
		logDebug("<font color='blue'>these requiredDocumentTypes: " + requiredDocumentTypes + "</font>");
		
		if(isElectronicSubmittal){
			logDebug("<font color='green'>This is an electronic submittal</font>");
			logDebug("<font color='green'>Update DPC Fields</font>");
			editAppSpecific4ACA("DocumentGroupforDPC",documentGroupforDPC);
			editAppSpecific4ACA("RequiredDocumentTypes",requiredDocumentTypes);
			editAppSpecific4ACA("AdditionalDocumentTypes",additionalDocumentTypes);
			editAppSpecific4ACA("TMPRecordID",servProvCode + "-" + capId);
			//editAppSpecific4ACA("Activate DPC","Yes");
			//editAppSpecific4ACA("Activate FSA","Yes");
			//editAppSpecific4ACA("DigitalSigCheck","No");
			//editAppSpecific4ACA("RequiredDocumentTypesComplete","No");
		}

		//
		// Update Fields in DB from fields in CapModel
		var fieldNamesDPC = ["DocumentGroupforDPC",
			"RequiredDocumentTypes", "AdditionalDocumentTypes",
			"TMPRecordID"];
		logDebug("Checking fields: " + String(fieldNamesDPC));
        for (var ff in fieldNamesDPC) {
            var fieldName = fieldNamesDPC[ff];
            var fieldValueDB = getAppSpecific(fieldName);
            var fieldValueACA = getAppSpecific4ACA(fieldName);
            if (typeof (fieldValueDB) == "undefined") {
                var fieldValueDB = fieldValueACA + " ";
                logDebug("Checking " + fieldName
                    + ": (ACA) " + fieldValueACA
                    + ": (DB) " + fieldValueDB
                    + " [undefined]"
                );
            } else {
                logDebug("Checking " + fieldName
                    + ": (ACA) " + fieldValueACA
                    + ": (DB) " + fieldValueDB
                );
            }
            // push field values to DB.
            if (fieldValueACA != fieldValueDB) {
                var recordUpdated = "Updated";
                if(fieldName == "RequiredDocumentTypes" && !fieldValueACA) fieldValueACA = "";
		_editAppSpecific(fieldName, fieldValueACA);
                logDebug("Updated " + fieldName
                    + ": (ACA) " + fieldValueACA
                    + ": (DB) " + getAppSpecific(fieldName)
                );
            }
        }
		
		if (recordUpdated) { 
            var amendCapModel = capModel;
			if (recordUpdated == "Amended") { // Warning any changes not saved to database will be lost.
				var amendCapModel = aa.cap.getCapViewBySingle4ACA(capId);
			}
            if (amendCapModel != capModel) {
				amendCapModel.getCapType().setSpecInfoCode(cap.getCapType().getSpecInfoCode());
				//amendCapModel.setAppSpecificInfoGroups(capModel.getAppSpecificInfoGroups());
                aa.env.setValue("CapModel", amendCapModel);
				logDebug("return amendCapModel: " + amendCapModel
					+ (amendCapModel && amendCapModel.capID && amendCapModel.capID.getCustomID ? ", altID: " + amendCapModel.capID.getCustomID() : "")
					+ (amendCapModel && amendCapModel.capID ? ", capID: " + amendCapModel.capID : "")
				);
                //logDebug("capModel: " + capModel + " (amendCapModel)" + br + describe_TPS(capModel));
                AInfoAmend = [];
                loadAppSpecific4ACA(AInfoAmend);
                logGlobals(AInfoAmend); 
			} else {
                aa.env.setValue("CapModel", capModel);
				logDebug("return CapModel: " + cap
					+ (capModel && cap.capID && cap.capID.getCustomID ? ", altID: " + cap.capID.getCustomID() : "")
					+ (capModel && cap.capID ? ", capID: " + cap.capID : "")
				);
                //logDebug("capModel: " + capModel + br + describe_TPS(capModel));
                AInfoAmend = [];
                loadAppSpecific4ACA(AInfoAmend);
                logGlobals(AInfoAmend); 
			}
			aa.env.setValue("CAP_MODEL_INITED", "TRUE");
		}
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
		var scriptResult = aa.sendMail(debugEmailFrom, debugEmailTo, "", debugEmailSubject,
			"message: " + br + message.replace(/\r/g, br) + br
			+ "Debug: " + br + debug.replace(/\r/g, br)
		);
		if (scriptResult.getSuccess()) {
			logDebug("Sent DEBUG Email to " + debugEmailTo + " from " + debugEmailFrom)
		} else {
			logDebug("Failed sending DEBUG Email to " + debugEmailTo + " from " + debugEmailFrom + " " + scriptResult.getErrorMessage());
		}
	}
} catch (err) {
	_handleError(err, "Page Flow Script: " + aa.env.getValue("ScriptCode") + " ");
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
var showDebug = false;

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
	 else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
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

function _handleError(err, context) {
	cancel = true;
	var rollBack = true;
	var showError = true;

	if (showError) showDebug = true;
	logDebug((rollBack ? "**ERROR** " : "ERROR: ") + err.message + " In " + context + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);

	if (typeof (br) == "undefined") br == "<BR>";
	if (typeof (errorMsg) == "undefined") errorMsg == ""
	errorMsg += "ERROR:" + err.message + br;
	if (typeof (systemMailFrom) == "undefined") systemMailFrom == "noreply-" + aa.getServiceProviderCode() + "@accela.com";
	if (typeof (errorEmailTo) == "undefined") errorEmailTo == "mckenzie@truepointsolutions.com";
	if (typeof (vScriptName) == "undefined") vScriptName == "Unknown";
	aa.sendMail(systemMailFrom, errorEmailTo, "", vScriptName + ", ERROR: "
		+ (typeof (capIDString) != "undefined" ? capIDString + " " : "")
		+ (typeof (capId) != "undefined" ? capId + " " : ""), errorMsg + "Debug: " + br + debug.replace(/\r/g, br));
}

function logDebug(dstr) {
	// Override to always include dstr.
	if (typeof (showDebug) == "undefined") showDebug = false;	// Set to true to see debug messages in popup window
	if (typeof (debug) == "undefined") debug = "";	// Debug String, do not re-define if calling multiple
	if (typeof (br) == "undefined") br = "<BR>";	// Break Tag
	if (typeof (msgFormat) == "undefined") msgFormat = [];
	if (typeof (msgFormat["ErrorB"]) == "undefined") msgFormat["ErrorB"] = "";
	if (typeof (msgFormat["ErrorE"]) == "undefined") msgFormat["ErrorE"] = "";
	if (typeof (errorMsg) == "undefined") errorMsg = "";
	aa.print(String(dstr).replace(/<BR>/g, "\r"));
	if (String(dstr).indexOf("ERROR") >= 0) {
		dstr = msgFormat["ErrorB"] + dstr + msgFormat["ErrorE"];
		errorMsg += dstr + br;
	}

	vLevel = 1
	if (arguments.length > 1)
		vLevel = arguments[1];
	// if ((showDebug & vLevel) == vLevel || vLevel == 1)
	debug += dstr + br;
	// if ((showDebug & vLevel) == vLevel)
	// 	aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
}

/*------------------------------------------------------------------------------------------------------/
|  Custom Functions  (Start)
/------------------------------------------------------------------------------------------------------*/
function clearPageSectionData(stepIndex, pageIndex) {
    logDebug("clearPageSectionData, step: " + stepIndex + ", page: " + pageIndex);
	var capID = capModel.getCapID();
	var pageComponents = getPageComponents(capID, stepIndex, pageIndex);
	if (pageComponents != null && pageComponents.length > 0) {
        for (var i = 0; i < pageComponents.length; i++) {
            logDebug("pageComponents[" + i + "]: " + pageComponents[i].getComponentName() + br + describe_TPS(pageComponents[i]));
			clearDataByComponentName(pageComponents[i].getComponentSeqNbr(), pageComponents[i].getComponentName());
		}

		aa.acaPageFlow.hideCapPage4ACA(capID, stepIndex, pageIndex);
	}
}

function clearDataByComponentName(componentSeqNbr, componentName) {
	var componentAliasName = getComponentAliasName(componentName);
	if (componentAliasName != null) {
		var dailyComponentName = componentAliasName + "_" + componentSeqNbr;
		if (componentAliasName.indexOf("MultiLicenses") == 0 || componentAliasName.indexOf("License") == 0) {
			clearLPData(dailyComponentName);
		}
		else if (componentAliasName.indexOf("MultiContacts") == 0 || componentAliasName.indexOf("Contact1") == 0
			|| componentAliasName.indexOf("Contact2") == 0 || componentAliasName.indexOf("Contact3") == 0
			|| componentAliasName.indexOf("Applicant") == 0) {
			clearContactData(dailyComponentName);
		}
	}
}

function clearParcelData(dailyComponentName) {
	var parcel = capModel.getParcelModel();
	if (parcel.getComponentName() != null && parcel.getComponentName().indexOf(dailyComponentName) == 0) {
		capModel.setParcelModel(null);
	}
}

function clearContactData(dailyComponentName) {
	var contactList = capModel.getContactsGroup();
	if (contactList != null && contactList.size() > 0) {
		for (var i = contactList.size(); i > 0; i--) {
			var contactModel = contactList.get(i - 1);
			if (contactModel.getComponentName() != null && contactModel.getComponentName().indexOf(dailyComponentName) == 0) {
				contactList.remove(contactModel);
			}
		}
	}
}

function clearLPData(dailyComponentName) {
	var lpList = capModel.getLicenseProfessionalList();
	if (lpList != null && lpList.size() > 0) {
		for (var i = lpList.size(); i > 0; i--) {
			var lpModel = lpList.get(i - 1);
			if (lpModel.getComponentName() != null && lpModel.getComponentName().indexOf(dailyComponentName) == 0) {
				lpList.remove(lpModel);
			}
		}
	}

	var licenseProfessionalModel = capModel.getLicenseProfessionalModel();
	if (licenseProfessionalModel != null) {
		if (licenseProfessionalModel.getComponentName() != null
			&& licenseProfessionalModel.getComponentName().indexOf(dailyComponentName) == 0) {
			capModel.setLicenseProfessionalModel(null);
		}
	}
}

function getComponentAliasName(componentName) {
	if (componentNames == null) {
		return null;
	}
	else {
		for (var i = 0; i < componentNames.length; i++) {
			if (componentNames[i] == componentName) {
				return componentAliasNames[i];
			}
		}
		return null;
	}
}

function getPageComponents(capID, stepIndex, pageIndex) {
	var componentResult = aa.acaPageFlow.getPageComponents(capID, stepIndex, pageIndex);
	if (componentResult.getSuccess()) {
		return componentResult.getOutput();
	}

	return null;
}

function getFieldValue(fieldName, asiGroups) {
	if (asiGroups == null) {
		return null;
	}

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {
					return field.getChecklistComment();
				}
			}
		}
	}
	return null;
}

function currencyFormat(num) {
	return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

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

function selectDocConfigByGroupPermissions(docCode,excludeTypesArray)
{
	var conn = aa.db.getConnection(); 
	var result = new Array();
	var VALUE = "";  

	var getSQL = 	" select d.DOC_TYPE as docCat, d.UPLOAD_RESTRICT_ROLE as upRole  "
		+ " from RDOCUMENT d "

		+ " WHERE d.DOC_CODE = ? "
		+ " AND d.RESTRICT_DOC_TYP_FOR_ACA = 'Y' "
		//+ " AND d.UPLOAD_RESTRICT_ROLE <> '0000000000' "
		+ " ORDER BY docCat asc ";	
	
	var sSelect = conn.prepareStatement(getSQL);
	sSelect.setString(1, docCode);
	var rs= sSelect.executeQuery();
	
	while(rs.next())
		{
		if(!exists(rs.getString("docCat"),excludeTypesArray)) VALUE = rs.getString("docCat");
		result.push(VALUE);         
					  
		}
	rs.close();
	conn.close();
	return result ;
}


function digEplanPreCache(client, altId, thisEnv) {
	var soapresp = "";
	var preCacheURL = "";
	preCacheURL = "https://api." + thisEnv + "/api/precache/folders?product=app&client=" + client + "&originalFolderId=" + altId;
	logDebug("preCacheURL: " + preCacheURL);

	soapresp = aa.util.httpPost(preCacheURL, '').getOutput();
	if (soapresp) logDebug("<font color='green'>Calling " + thisEnv + " API: " + soapresp + "</font>");
	if (!soapresp) logDebug("<font color='red'>COULD NOT REACH DIGEPLAN API</font>");
	return soapresp;
}

/*------------------------------------------------------------------------------------------------------/
|  Custom Functions  (End) 
/------------------------------------------------------------------------------------------------------*/

function describe_TPS(obj) {
	// Modified from describe to also include typeof & class of object; seperate Properties from Functions; Sort them; additional arguments.
	var newLine = "\n";
	//	var newLine = br;
	var newLine = "<BR>";
	var ret = "";
	var oType = null;
	var oNameRegEx = /(^set.*$)/; // find set functions
	var oNameRegEx = /(^get.*$)/; // find get functions
	var oNameRegEx = null;
	var verbose = false;
	if (arguments.length > 1) oType = arguments[1];
	if (arguments.length > 2) oNameRegEx = arguments[2];
	if (arguments.length > 3) verbose = arguments[3];
	if (obj == null) {
		ret += ": null";
		return ret;
	}
	try {
		//		ret += "typeof(): " + typeof (obj) + (obj && obj.getClass ? ", class: " + obj.getClass() : "") + newLine;
		var oPropArray = new Array();
		var oFuncArray = new Array();
		if (oType == null) oType = "*";
		for (var i in obj) {
			if (oNameRegEx && !oNameRegEx.test(i)) { continue; }
			if ((oType == "*" || oType == "function") && typeof (obj[i]) == "function") {
				oFuncArray.push(i);
			} else if ((oType == "*" || oType == "property") && typeof (obj[i]) != "function") {
				oPropArray.push(i);
			}
		}
		// List Properties
		oPropArray.sort();
		for (var i in oPropArray) {
			n = oPropArray[i];
			oValue = obj[n];
			if (oValue && oValue.getClass) {
				//				logDebug(n + " " + oValue.getClass());
				if (oValue.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
				if (oValue.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
				// if (oValue.getClass().toString().equals("class java.util.Date")) oValue += " " + convertDate(oValue);
			}
			ret += "property:" + n + " = " + oValue + newLine;
		}
		// List Functions
		oFuncArray.sort();
		for (var i in oFuncArray) {
			n = oFuncArray[i];
			oDef = String(obj[n]).replace("\n", " ").replace("\r", " ").replace(String.fromCharCode(10), " ").replace(String.fromCharCode(10), " ")
			x = oDef.indexOf(n + "()", n.length + 15);
			if (x > 15) x = x + n.length + 1;
			oName = (verbose ? oDef : "function:" + n + "()");                              // Include full definition of function if verbose
			oValue = ((n.toString().indexOf("get") == 0 && x > 0) ? obj[n]() : "");  // Get function value if "Get" function and no parameters.
			if (oValue && oValue.getClass) {
				//				logDebug(n + " " + oValue.getClass());
				if (oValue.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
				if (oValue.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) oValue += " " + (new Date(oValue.getEpochMilliseconds()));
				// if (oValue.getClass().toString().equals("class java.util.Date")) oValue += " " + convertDate(oValue);
			}
			ret += oName + " = " + oValue + newLine;
		}
	} catch (err) {
		showDebug = 3;
		var context = "describe_TPS(" + obj + ")";
		logDebug("ERROR: An error occured in " + context + " Line " + err.lineNumber + " Error:  " + err.message);
		logDebug("Stack: " + err.stack);
	}
	return ret;
}

function lookup(stdChoice, stdValue) {
	// Modified INCLUDES_ACCELA_FUNCTION to return null if not found.
	var strControl = null;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
	}
	else {
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
	}
	return strControl;
}

function _editAppSpecific(itemName, itemValue)  // optional: itemCap
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
                else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated. (FAILED)"); }
            }
            else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated. asiField not found."); }
        }
    }
    else {
        logDebug("ERROR: (editAppSpecific) " + asiFieldResult.getErrorMessage());
    }
}

function editAppSpecific4ACA(itemName, itemValue) {
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
                    field.setChecklistComment(itemValue);
					//logDebug("Updating " + field.getCheckboxDesc() + "with value: " + itemValue);
                }
            }
        }
    }
}

function loadAppSpecific4ACA(thisArr) {
	//
	// Returns an associative array of App Specific Info
	// Optional second parameter, cap ID to load from
	//
	// uses capModel in this event


	var itemCap = capId;
	if (arguments.length >= 2)
		{
		itemCap = arguments[1]; // use cap ID specified in args

    		var fAppSpecInfoObj = aa.appSpecificInfo.getByCapID(itemCap).getOutput();

		for (loopk in fAppSpecInfoObj)
			{
			if (useAppSpecificGroupName)
				thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			else
				thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			}
		}
	else
		{
		var capASI = cap.getAppSpecificInfoGroups();
		if (!capASI) {
			logDebug("No ASI for the CapModel");
			}
		else {
			var i= cap.getAppSpecificInfoGroups().iterator();

			while (i.hasNext())
				{
				 var group = i.next();
				 var fields = group.getFields();
				 if (fields != null)
					{
					var iteFields = fields.iterator();
					while (iteFields.hasNext())
						{
						 var field = iteFields.next();

						if (useAppSpecificGroupName)
							thisArr[field.getCheckboxType() + "." + field.getCheckboxDesc()] = field.getChecklistComment();
						else
							thisArr[field.getCheckboxDesc()] = field.getChecklistComment();
					 }
					}
				 }
			}
		}
	}
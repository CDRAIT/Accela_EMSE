/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ContValueGreaterThanZero_REQ.js  
| Event   : ACA_Before
|
| Usage   : Validates correct selections for 'checkbox' rules on Contr/Agent and Wcomp
|
| Client  : Placer County
| Action# : N/A
|
| Notes   : TDunn 08/28/2024 updated for deployment to production
|         : TDunn 04/22/2025 modified from ACA Solar fields required for require cont value > 0
|         : TDunn 08/29/2025 copied to Non-prod1
|         : TDunn 08/30/2025 deployed to Github
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/

var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var preExecute = "PreExecuteForBeforeEvents";
var controlString = "Before Template"; // Standard choice for control
var documentOnly = false; // Document Only -- displays hierarchy of std choice steps
var disableTokens = false; // turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var enableVariableBranching = false; // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var feeSeqList = new Array(); // invoicing fee list
var paymentPeriodList = new Array(); // invoicing pay periods

if (documentOnly) {
  doStandardChoiceActions(controlString, false, 0);
  aa.env.setValue("ScriptReturnCode", "0");
  aa.env.setValue(
    "ScriptReturnMessage",
    "Documentation Successful.  No actions executed."
  );
  aa.abortScript();
}

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue(
  "MULTI_SERVICE_SETTINGS",
  "SUPER_AGENCY_FOR_EMSE"
);
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
  useSA = true;
  SA = bzr.getOutput().getDescription();
  bzr = aa.bizDomain.getBizDomainByValue(
    "MULTI_SERVICE_SETTINGS",
    "SUPER_AGENCY_INCLUDE_SCRIPT"
  );
  if (bzr.getSuccess()) {
    SAScript = bzr.getOutput().getDescription();
  }
}

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));

eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
  vScriptName = vScriptName.toUpperCase();
  var emseBiz = aa.proxyInvoker
    .newInstance("com.accela.aa.emse.emse.EMSEBusiness")
    .getOutput();
  var emseScript = emseBiz.getMasterScript(
    aa.getServiceProviderCode(),
    vScriptName
  );
  return emseScript.getScriptText() + "";
}
var capModel = aa.env.getValue("CapModel");
var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode(); // Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
  currentUserID = "ADMIN";
  publicUser = true;
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright
  .getUserRight(appTypeArray[0], currentUserID)
  .getOutput();
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(
  sysDate.getMonth(),
  sysDate.getDayOfMonth(),
  sysDate.getYear(),
  ""
);
var parcelArea = 0;

var estValue = 0;
var calcValue = 0;
var feeFactor; // Init Valuations
// var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();	// Calculated valuation
// if (valobj.length) 
// {
    // estValue = valobj[0].getEstimatedValue();
    // calcValue = valobj[0].getCalculatedValue();
    // feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
// }

// capBValuatn = cap.getBValuatnModel();
// estValue = capBValuatn.getEstimatedValue();

// Modified to pull from capModel instead of from DB.
valuatnModel = capModel.getBValuatnModel();
if (valuatnModel) {
	estValue = valuatnModel.getEstimatedValue();
	calcValue = valuatnModel.getCalculatedValue();
	feeFactor = valuatnModel.getFeeFactorFlag();
}

var balanceDue = 0;
var houseCount = 0;
feesInvoicedTotal = 0; // Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId); // Detail
if (capDetailObjResult.getSuccess()) {
  capDetail = capDetailObjResult.getOutput();
  var houseCount = capDetail.getHouseCount();
  var feesInvoicedTotal = capDetail.getTotalFee();
  var balanceDue = capDetail.getBalance();
}

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
//loadASITables();

// var errorMessage = "";

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
sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@govPath.tech", "", "Testing valuation validation pageflow script ", debug);
/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute, true, 0); // run Pre-execution code

logGlobals(AInfo);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try 
{
	var varComText = "";
	var varCancel = false;
	var varShowMessage = false;
	var capTypeResult = cap.getCapType();
	var capTypeString = capTypeResult.toString();
	var capTypeArray = capTypeString.split("/");
	var capType = capTypeArray[1];
	if (calcValue <= 1 && estValue <=1 ) 
	{
		//varCancel = true;
		varShowMessage = true;
		varComText = "You must enter a valid valuation > 1";
	}

	if (varCancel) 
	{
		// block submit
		cancel = varCancel;
		showMessage = varShowMessage;
		comment(varComText);
	}
} catch (err) 
{
	logDebug(err);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
  aa.env.setValue("ErrorCode", "1");
  aa.env.setValue("ErrorMessage", debug);
} else {
  if (cancel) {
    aa.env.setValue("ErrorCode", "-2");
    if (showMessage) aa.env.setValue("ErrorMessage", message);
    if (showDebug) aa.env.setValue("ErrorMessage", debug);
  } else {
    aa.env.setValue("ErrorCode", "0");
    if (showMessage) aa.env.setValue("ErrorMessage", message);
    if (showDebug) aa.env.setValue("ErrorMessage", debug);
  }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function getCapId() {
	var s_id1 = aa.env.getValue("PermitId1");
	var s_id2 = aa.env.getValue("PermitId2");
	var s_id3 = aa.env.getValue("PermitId3");

	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
	if (s_capResult.getSuccess()) return s_capResult.getOutput();
	else {
	logMessage("**ERROR: Failed to get capId: " + s_capResult.getErrorMessage());
	return null;
	}
}

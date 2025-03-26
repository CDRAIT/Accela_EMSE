/*------------------------------------------------------------------------------------------------------/
| Program : ACA_PageFlow_SolarApp_Docs.js
| Event   : ACA_After
|
| Usage   : PageFlow Script by TruePoint Solutions.
|
| Client  : N/A
| Action# : N/A
|
| Notes   : Created by TS 02/21/2023
|         : TDunn 08/21/2024 modified for documents required for SolarApp+ submittal
|         : TDunn 08/28/2024 added requirements for Agent applicant documents.
|         : TDunn 10/02/2024 added required documents for SolarApp revisions
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;                        // Set to true to see results in popup window
var showDebug = true;                            // Set to true to see debug messages in popup window
var preExecute = "PreExecuteForBeforeEvents"
var controlString = "ACA_BEFORE_REQUIRED_DOCS";        // Standard choice for control
var documentOnly = false;                        // Document Only -- displays hierarchy of std choice steps
var disableTokens = false;                        // turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;            // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;            // Use Group name when populating Task Specific Info Values
var enableVariableBranching = false;            // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;                            // Maximum number of std choice entries.  Entries must be Left Zero Padded
var SCRIPT_VERSION = 2.0

 
function getScriptText(vScriptName){
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
    return emseScript.getScriptText() + "";    
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
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


eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,true));
//eval(getScriptText("INCLUDES_CUSTOM",null,true));
/*
if (documentOnly) {
    doStandardChoiceActions(controlString,false,0);
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
    aa.abortScript();
    }
*/

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message =    "";                            // Message String
var debug = "";                                // Debug String
var br = "<BR>";                            // Break Tag
var feeSeqList = new Array();                        // invoicing fee list
var paymentPeriodList = new Array();                    // invoicing pay periods

if (documentOnly) {
    doStandardChoiceActions(controlString,false,0);
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
    aa.abortScript();
    }

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()               // Service Provider Code
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();                    // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();      // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();                // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");                // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();

//var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");

var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor            // Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();    // Calculated valuation
if (valobj.length) {
    estValue = valobj[0].getEstimatedValue();
    calcValue = valobj[0].getCalculatedValue();
    feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
    }

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;        // Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);            // Detail
if (capDetailObjResult.getSuccess())
    {
    capDetail = capDetailObjResult.getOutput();
    var houseCount = capDetail.getHouseCount();
    var feesInvoicedTotal = capDetail.getTotalFee();
    var balanceDue = capDetail.getBalance();
    }

var AInfo = new Array();                        // Create array for tokenized variables
loadAppSpecific4ACA(AInfo);                         // Add AppSpecific Info
//loadTaskSpecific(AInfo);                        // Add task specific info
//loadParcelAttributes(AInfo);                        // Add parcel attributes
//loadASITables4ACA();

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
//logDebug(debug);

/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables 
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0);     // run Pre-execution code

//logGlobals(AInfo);

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/


showDebug = false;
docsMissing = false;
showList = true;
addConditions = false;
addTableRows = false;
cancel = false;
showMessage = false;
capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();

r = new Array();

if(appTypeString == "Building/Residential/PV Solar/Solar App")
{
	r[0] = "SolarApp Approval"; //Document Type
	r[1] = "Equipment Spec Sheets"; //Document Type
	if(AInfo["Authorized Agent"] == "CHECKED")
	{
		r[2] = "Agent ID"; 
		r[3] = "Agent Authorization Letter";
	}
    
	submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
	uploadedDocs = new Array();
	for (var i in submittedDocList ) uploadedDocs[submittedDocList[i].getDocCategory()] = true;
}
if(appTypeString == "Building/Residential/PV Solar/SolarApp Revision")
{
	r[0] = "SolarApp Revision Approval"; //Document Type
	r[1] = "Equipment Spec Sheets"; //Document Type
	if(AInfo["Authorized Agent"] == "CHECKED")
	{
		r[2] = "Agent ID"; 
		r[3] = "Agent Authorization Letter";
	}
    
	submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
	uploadedDocs = new Array();
	for (var i in submittedDocList ) uploadedDocs[submittedDocList[i].getDocCategory()] = true;
}
if (r.length > 0 && showList) 
{
    for (x in r) { 
        if(uploadedDocs[r[x]] == undefined) 
		{    
            showMessage = true; 
            cancel=true;
            if (!docsMissing)  
			{
                comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required based on the information you have provided: </span><ol>");     
                docsMissing = true; 
            }    
            comment(r[x]);
        }    
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0)
    {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
    }
else
    {
    if (cancel)
        {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug)     aa.env.setValue("ErrorMessage", debug);
        }
    else
        {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug)     aa.env.setValue("ErrorMessage", debug);
        }
    }

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function logDebug(dstr) {
	vLevel = 1
	if (arguments.length > 1)
		vLevel = arguments[1];
	if ((showDebug & vLevel) == vLevel || vLevel == 1)
		debug += dstr + br;
	if ((showDebug & vLevel) == vLevel)
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
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
	
function loadASITables4ACA() {

 	//
 	// Loads App Specific tables into their own array of arrays.  Creates global array objects
	//
	// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	//

	var itemCap = capId;
	if (arguments.length == 1)
		{
		itemCap = arguments[0]; // use cap ID specified in args
		var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
		}
	else
		{
		var gm = cap.getAppSpecificTableGroupModel()
		}

	var ta = gm.getTablesMap();


	var tai = ta.values().iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();

	  if (tsm.rowIndex.isEmpty()) continue;  // empty table

	  var tempObject = new Array();
	  var tempArray = new Array();
	  var tn = tsm.getTableName();

	  tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

	  if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

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
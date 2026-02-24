/*------------------------------------------------------------------------------------------------------/
| Program: AQ_LATEFEES_BATCH
| Trigger: Batch
| Client : Placer Air Quality
| Description:
|   Applies late fees, invoices, generates reports, and emails 2nd notice
|   for selected facilities.
/
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;
var maxSeconds = 10 * 60;
var documentOnly = false;
/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| START: Batch specific variables
/------------------------------------------------------------------------------------------------------*/
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");

// Specify the CAP IDs you want to process

var batchStartDate = new Date();
var batchStartTime = batchStartDate.getTime();
var timeExpired = false;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var senderEmailAddr = "placercounty_noreply@accela.com";
var emailAddress = "rmoore@placer.ca.gov";
var emailAddress2 = "";
var emailText = "";
var paramsOK = true;
var today = sysDate.getMonth() + "/" + sysDate.getDayOfMonth() + "/" +sysDate.getYear();
var duedate = dateAdd(today,15); // used for when to generate report / due date below, should be set to 45 11/19/19

/*------------------------------------------------------------------------------------------------------/
| START: BATCH EXECUTION
/------------------------------------------------------------------------------------------------------*/
if (paramsOK) {
    logMessage("START", "Start of AQ_LATEFEES Batch Job.");
    var processedCount = aboutExpLics();
    logMessage("INFO", "Number of records processed: " + processedCount);
    logMessage("END", "End of AQ_LATEFEES Batch Job. Elapsed Time: " + elapsed() + " seconds.");
}

if (emailAddress.length) {
    aa.sendMail(
        senderEmailAddr,
        emailAddress,
        emailAddress2,
        batchJobName + " Results",
        emailText
    );
}

/*------------------------------------------------------------------------------------------------------/
| MAIN FUNCTION
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() {

    var capCount = 0;

    // -----------------------------
    // Specify the list of facilities (b1_alt_id / Cap Custom ID)
    // -----------------------------
var targetCapIDs = [
    "FAC-AMBC",
	"FAC-APST",
	"FAC-ARCI",
	"FAC-ARMV",
	"FAC-AUSD",
	"FAC-AVCC",
	"FAC-BOLI",
	"FAC-BRSL",
	"FAC-CHVN",
	"FAC-DSSR",
	"FAC-EDMF",
	"FAC-EURD",
	"FAC-FDXG",
	"FAC-GAPM",
	"FAC-GLBN",
	"FAC-HCVP",
	"FAC-KING",
	"FAC-MCGC",
	"FAC-MDAX",
	"FAC-NTHP",
	"FAC-NVIS",
	"FAC-OKBL",
	"FAC-OLGR",
	"FAC-PALM",
	"FAC-PARK",
	"FAC-PATT",
	"FAC-PRGL",
	"FAC-QIPR",
	"FAC-REMA",
	"FAC-RKFM",
	"FAC-RKFM",
	"FAC-ROSD",
	"FAC-SGSL",
	"FAC-SHLC",
	"FAC-SHLF",
	"FAC-SHLI",
	"FAC-SHSA",
	"FAC-SMFN",
	"FAC-SNYM",
	"FAC-SPFA",
	"FAC-VRFI"
];

    if (!targetCapIDs || targetCapIDs.length === 0) {
        logMessage("ERROR", "No targetCapIDs specified — batch aborted.");
        return 0;
    }

    logDebug("Target CapIDs to process: " + targetCapIDs.join(", "));
    // -----------------------------
    // Load Cap objects for each target ID
    // -----------------------------
    var capArray = [];
    for (var i = 0; i < targetCapIDs.length; i++) {
        var altId = targetCapIDs[i];
        var capResult = aa.cap.getCapID(altId);
        if (!capResult.getSuccess() || !capResult.getOutput()) {
            logDebug("INVALID CAP ID | " + altId);
            continue;
        }
        capArray.push(capResult.getOutput());
    }
    logDebug("Loaded " + capArray.length + " valid caps to process.");
    // -----------------------------
    // Process each cap
    // -----------------------------
    for (var x = 0; x < capArray.length; x++) {
        if (elapsed() > maxSeconds) {
            logMessage("ERROR", "Batch timed out after processing " + capCount + " records.");
            break;
        }
        var capIdModel = getCapIdModel(capArray[x]);
        if (!capIdModel) {
            logDebug("Skipping record: could not convert cap object to CapIDModel");
            continue;
        }
        var capCustomID = getCapCustomID(capIdModel);
        logDebug("Processing Cap: " + capCustomID);
        // -----------------------------
        // Check Send Late Fee ASI
        // -----------------------------
        var sendLateFees = getAppSpecific("Send Late Fees", capIdModel);
        if (!isChecked(sendLateFees)) {
            logDebug("SKIP | " + capCustomID + " | Send Late Fee NOT checked");
            continue;
        }
        // -----------------------------
        // Check First Letter Sent ASI
        // -----------------------------
        var firstLetter = getAppSpecific("First Letter Sent", capIdModel);
        if (!isChecked(firstLetter)) {
            logDebug("SKIP | " + capCustomID + " | First Letter NOT checked");
            continue;
        }
        // -----------------------------
        // Get cap detail and balance
        // -----------------------------
        var capDetail;
        var TotalBalance = 0;
        var capDetailObjResult = aa.cap.getCapDetail(capIdModel);
        if (capDetailObjResult.getSuccess()) {
            capDetail = capDetailObjResult.getOutput();
            var feesInvoicedTotal = capDetail.getTotalFee();
            TotalBalance = capDetail.getBalance(); // total remaining balance including payments
//            logDebug("Outstanding Balance: " + TotalBalance.toFixed(2));
        } else {
            logDebug("SKIP | " + capCustomID + " | Unable to get Cap Detail: " + capDetailObjResult.getErrorMessage());
            continue;
        }
        var lateFeeDue = TotalBalance * 0.5;
        var totalDueForLetter = TotalBalance + lateFeeDue;
        addFee("AQ_LATEFEES","AQ_FAC","FINAL",lateFeeDue.toFixed(2) ,"Y",capIdModel);
		var maxinvoice = getLatestInvoiceNumber(capIdModel);
	    var arrEmission = new Array(); 
 	    arrEmission["InvoiceNumber"] = String(maxinvoice);arrEmission["Notes"] = "Late Fees Applied";arrEmission["Date Created"] = String(today);arrEmission["Created By"] = "ADMIN";
		addToASITable("INVOICE COMMENTS",arrEmission,capIdModel);
        logDebug(
            "BALANCES | " + capCustomID +
            " | Total=" + TotalBalance.toFixed(2) +
            " | LateFeeDue=" + lateFeeDue.toFixed(2) +
            " | TotalDueForLetter=" + totalDueForLetter.toFixed(2)
        );
        // Continue with invoice/email logic...
        capCount++;
    }
    return capCount;
}
/*------------------------------------------------------------------------------------------------------/
| HELPER FUNCTIONS
/------------------------------------------------------------------------------------------------------*/
function safeGetCapDetailBalance(capIdModel) {
    try {
        // Get the cap detail
        var capDetailResult = aa.cap.getCapDetail(capIdModel);
        if (!capDetailResult.getSuccess()) {
            logDebug("ERROR: could not get cap detail: " + capDetailResult.getErrorMessage());
            return 0;
        }
        var capDetail = capDetailResult.getOutput();
        // Get total amount invoiced
        var totalInvoice = 0;
        if (capDetail.getTotalFee) totalInvoice = Number(capDetail.getTotalFee());
        else if (capDetail.getInvoiceFee) totalInvoice = Number(capDetail.getInvoiceFee()); // some versions
        // Get total amount paid
        var totalPaid = 0;
        if (capDetail.getFeePaid) totalPaid = Number(capDetail.getFeePaid());
	
        else if (capDetail.getFeePaymentAmount) totalPaid = Number(capDetail.getFeePaymentAmount()); // some versions
			logDebug("feepaid: " + Number(capDetail.getFeePaid()));
        var balance = totalInvoice - totalPaid;
        if (balance < 0) balance = 0;
        return balance;
    } catch (err) {
        logDebug("ERROR in safeGetCapDetailBalance: " + err);
        return 0;
    }
}
function getLateFeeBalance(capIdModel) {
    // Return any existing late fee already applied
    try {
        var feeResult = aa.finance.getFeeItemByCapID(capIdModel, null);
        if (!feeResult.getSuccess()) return 0;
        var feeItems = feeResult.getOutput();
        var total = 0;
        for (var i = 0; i < feeItems.length; i++) {
            var fee = feeItems[i];
            if (fee.getFeeCod() && fee.getFeeCod().toUpperCase() === "LATEFEE") {
                if (typeof fee.getBalance === "function") total += fee.getBalance();
                else if (typeof fee.getFeeBalance === "function") total += fee.getFeeBalance();
            }
        }
        return total;
    } catch (e) {
        return 0;
    }
}
function elapsed() {
    return (new Date().getTime() - batchStartTime) / 1000;
}
function logMessage(type, desc) {
    aa.eventLog.createEventLog(type, "Batch Process", batchJobName, sysDate, sysDate, "", desc, batchJobID);
    aa.print(type + " : " + desc);
    emailText += type + " : " + desc + "<br />";
}
function logDebug(desc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", desc, batchJobID);
        aa.print("DEBUG : " + desc);
        emailText += "DEBUG : " + desc + "<br />";
    }
}
function isChecked(val) {
    if (!val) return false;
    // Convert to string
    val = String(val);
    // Trim and remove all whitespace characters including non-breaking spaces
    val = val.replace(/[\s\u00A0]+/g, '').toLowerCase();
    //logDebug('isChecked normalized value: "' + val + '"');
    return (val === "checked" || val === "yes" || val === "y" || val === "true" || val === "1");
}
function getCapIdModel(capObj) {
    if (capObj && capObj.getID1 && capObj.getID2 && capObj.getID3 && capObj.getID1()) return capObj;
    if (capObj && capObj.getCapID && typeof capObj.getCapID === "function") return capObj.getCapID();
    if (capObj && capObj.capID && capObj.capID.getID1) return capObj.capID;
    return null;
}
function getCapCustomID(capIdModel) {
    if (!capIdModel) return "UNKNOWN";
    if (typeof capIdModel.getCustomID === "function") {
        var id = capIdModel.getCustomID();
        if (id) return id;
    }
    try {
        return capIdModel.getID1() + "-" + capIdModel.getID2() + "-" + capIdModel.getID3();
    } catch (e) {
        return "UNKNOWN";
    }
}
function getAppSpecific(itemName, itemCap) {
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (!appSpecInfoResult.getSuccess()) {
        logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
        return "";
    }
    var appspecObj = appSpecInfoResult.getOutput();
    for (var i = 0; i < appspecObj.length; i++) {
        var asiName = appspecObj[i].getCheckboxDesc(); 
        var asiValue = appspecObj[i].getChecklistComment(); // Text or comment on checkbox
        if (asiName == itemName) {
            // If checkbox is empty string but "checked" internally, return "CHECKED"
            if (!asiValue || asiValue === "") {
                return "CHECKED"; // default if the checkbox exists but has no comment
            } else {
                return asiValue;
            }
        }
    }

    return "";
}
function addFee(fcode, fsched, fperiod, fqty, finvoice, feeCap) {
    // Returns the fee sequence number if successful, null if not
    var feeSeq = null;
    var feeCapMessage = "";
    // Prepare arrays for multi-fee invoicing
    var feeSeq_L = [];
    var paymentPeriod_L = [];
    // If a CAP is passed in the arguments
    if (arguments.length > 5) {
        feeCap = arguments[5];
        feeCapMessage = " to specified CAP " + getCapCustomID(feeCap);
    }
    // Assess the fee
    var assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
    if (!assessFeeResult.getSuccess()) {
        logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
        return null;
    }
    feeSeq = assessFeeResult.getOutput();
    logDebug("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
    // Auto-invoice if requested
    if (finvoice === "Y") {
        feeSeq_L.push(feeSeq);
        paymentPeriod_L.push(fperiod);
        var invoiceResult = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
        if (invoiceResult.getSuccess()) {
            logDebug("Invoicing assessed fee(s)" + feeCapMessage + " was successful.");
        } else {
            logDebug("**ERROR: Invoicing fee(s) " + feeCapMessage + " failed. Reason: " + invoiceResult.getErrorMessage());
        }
    }
    return feeSeq;
}
function updateFeeItemInvoiceFlag(feeSeq,finvoice) {
	if(feeSeq == null)
		return;
	if(publicUser && !cap.isCompleteCap())
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
}
function addToASITable(tableName,tableValues,capId)   	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
  	itemCap = capId
	
	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)

	if (!tssmResult.getSuccess())
		{ logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var col = tsm.getColumns();
	var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
	var coli = col.iterator();

	while (coli.hasNext())
		{
		colname = coli.next();

		if (typeof(tableValues[colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
			{
			fld.add(tableValues[colname.getColumnName()].fieldValue);
			fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
			}
		else // we are passed a string
			{
			fld.add(tableValues[colname.getColumnName()]);
			fld_readonly.add(null);
			}
		}
	tsm.setTableFields(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field
	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, "Admin");
	if (!addResult .getSuccess())
		{ logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
	else
		logDebug("Successfully added record to ASI Table: " + tableName);
}
function getLatestInvoiceNumber(capid) {
	var invoices = aa.finance.getInvoiceByCapID(capid,null).getOutput();
	var invoice = [];
	for(x in invoices)
	{
	invoice.push(invoices[x].getInvNbr())
	}
	return Math.max.apply(null, invoice)
}
function dateAdd(td, amt) {
    var useWorking = false;
    if (arguments.length == 3)
        useWorking = true;

    if (!td)
        dDate = new Date();
    else
        dDate = new Date(td);
    var i = 0;
    if (useWorking)
        if (!aa.calendar.getNextWorkDay) {
        logDebug("**ERROR", "getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
        while (i < Math.abs(amt)) {
            dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
            if (dDate.getDay() > 0 && dDate.getDay() < 6)
                i++
        }
    }
    else {
        while (i < Math.abs(amt)) {
            dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
            i++;
        }
    }
    else
        dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}


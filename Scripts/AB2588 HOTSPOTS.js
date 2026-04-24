/*------------------------------------------------------------------------------------------------------/
| Program: LicenseSetAboutToExpire  Trigger: Batch
| Client : Chesterfield
|
| Version 1.0 - Base Version. 09/03/2017 - TruePoint Solutions
| Version 1.1 - Modified criteria and correct syntax errors.  09/10/2017 TJD
|
| Script is run to email permit to facilities.
|
| Batch Requirements:
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;                                                // Set to true to see debug messages in event log and email confirmation
var maxSeconds = 10 * 60;                                         // number of seconds allowed for batch processing, usually < 5*60
var documentOnly = false;                                         // Document Only -- displays hierarchy of std choice steps
/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| START: Batch specific variables
/------------------------------------------------------------------------------------------------------*/
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
//Global variables
var batchStartDate = new Date();                                                        // System Date
var batchStartTime = batchStartDate.getTime();                                          // Start timer
var timeExpired = false;                                                                // Variable to identify if batch script has timed out. Defaulted to "false".
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;                                                    // Use Group name when populating App Specific Info Values
var senderEmailAddr = "placercounty_noreply@accela.com";                                          // Email address of the sender
var emailAddress = "rmoore@placer.ca.gov";                                      // Email address of the person who will receive the batch script log information
var emailAddress2 = "";                                                                 // CC email address of the person who will receive the batch script log information
var emailText = "";                                                                     // Email body
//Parameter variables
var paramsOK = true;

/*------------------------------------------------------------------------------------------------------/
| END: Batch Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/

if (paramsOK) {
    logMessage("START", "Start of Updating ASI Batch Job.");
    var licAboutToExpCnt = aboutExpLics();
    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of Updating ASI Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}
if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for looking for fee CC_GEN_10", emailText);

function aboutExpLics() {
    var capCount = 0;
    var fiscalYear = "FY25-26";



    // --- Fee configuration (from your table) ---
    var feeMap = {
        "FAC-RALL": { district: 125.00, state: 0 },
        "FAC-CAPD": { district: 125.00, state: 0 },
        "FAC-KAIS": { district: 426.53, state: 100 },
        "FAC-SPPC": { district: 125.00, state: 0 },
        "FAC-ARCE": { district: 125.00, state: 0 },
        "FAC-ARCG": { district: 125.00, state: 0 },
        "FAC-ARCC": { district: 125.00, state: 0 },
        "FAC-ARCL": { district: 125.00, state: 0 },
        "FAC-ARCM": { district: 125.00, state: 0 },
        "FAC-ARCH": { district: 125.00, state: 0 },
        "FAC-ARCI": { district: 125.00, state: 0 },
        "FAC-ARCF": { district: 125.00, state: 0 },
        "FAC-ARCN": { district: 125.00, state: 0 },
        "FAC-ARCK": { district: 125.00, state: 0 },
        "FAC-ARCA": { district: 125.00, state: 0 },
        "FAC-AGAS": { district: 125.00, state: 0 },
        "FAC-BPRK": { district: 125.00, state: 0 },
        "FAC-CALM": { district: 426.53, state: 100 },
        "FAC-CHVJ": { district: 125.00, state: 0 },
        "FAC-CHVH": { district: 125.00, state: 0 },
        "FAC-CHVP": { district: 125.00, state: 0 },
        "FAC-CHVL": { district: 125.00, state: 0 },
        "FAC-CHVQ": { district: 125.00, state: 0 },
        "FAC-CECE": { district: 125.00, state: 0 },
        "FAC-CSTC": { district: 158.14, state: 35 },
        "FAC-DRYC": { district: 125.00, state: 0 },
        "FAC-ENER": { district: 125.00, state: 0 },
        "FAC-GPWR": { district: 125.00, state: 0 },
        "FAC-HBFC": { district: 125.00, state: 0 },
        "FAC-RIOB": { district: 390.25, state: 67 },
        "FAC-ARCJ": { district: 125.00, state: 0 },
        "FAC-SWIR": { district: 125.00, state: 0 },
        "FAC-SWYR": { district: 125.00, state: 0 },
        "FAC-SWYW": { district: 125.00, state: 0 },
        "FAC-SMCB": { district: 125.00, state: 0 },
        "FAC-SFPP": { district: 125.00, state: 0 },
        "FAC-SHLE": { district: 125.00, state: 0 },
        "FAC-SHLK": { district: 125.00, state: 0 },
        "FAC-SHLA": { district: 125.00, state: 0 },
        "FAC-SPAC": { district: 461.34, state: 134 },
        "FAC-VERO": { district: 390.25, state: 67 },
        "FAC-CFFC": { district: 390.25, state: 67 },
        "FAC-GAWF": { district: 125.00, state: 0 },
        "FAC-SWYD": { district: 125.00, state: 0 },
        "FAC-SUAF": { district: 390.25, state: 67 },
        "FAC-SUTR": { district: 390.25, state: 67 },
        "FAC-FABW": { district: 125.00, state: 0 },
        "FAC-FADI": { district: 125.00, state: 0 },
        "FAC-FLNC": { district: 125.00, state: 0 },
        "FAC-NECE": { district: 125.00, state: 0 },
        "FAC-GLAD": { district: 125.00, state: 0 },
        "FAC-PRTC": { district: 125.00, state: 0 }
    };

    // --- Loop facilities ---
    for (var facId in feeMap) {
        try {
            var capId = aa.cap.getCapID(facId).getOutput();
            if (!capId) continue;

            var cap = aa.cap.getCap(capId).getOutput();
            if (!cap) continue;

            var fstatus = cap.getCapStatus();
            var capIDString = cap.getCapModel().getAltID();

            logDebug("Processing Facility: " + capIDString);

            if (fstatus == "Active") {

                var feeConfig = feeMap[facId];

                var feeSeqList = [];

                // District fee
				logDebug("Adding district fee: " + feeConfig.district);
				var fee1 = addFee("AQ_ATHSFD", "AQ_FAC", "FINAL", feeConfig.district, "N", capId);
				if (fee1) {
					feeSeqList.push(fee1);
//					updatefeenotes(capId, fee1, fiscalYear);
				}
                // State fee (only if > 0)
				// State fee
				if (feeConfig.state > 0) {
					logDebug("Adding state fee: " + feeConfig.state);
					var fee2 = addFee("AQ_ATHSFS", "AQ_FAC", "FINAL", feeConfig.state, "N", capId);
					if (fee2) {
						feeSeqList.push(fee2);
		//				updatefeenotes(capId, fee2, fiscalYear);
					}
				}

                // Safety check
                if (feeSeqList.length === 0) {
                    logDebug("No fees to invoice");
                    continue;
                }

                // Invoice
                var facinvNbr = invoiceNewFeesWithRetry(capId, feeSeqList);
                if (!facinvNbr) {
                    logDebug("Invoice failed");
                    continue;
                }

                logDebug("Invoice created: " + facinvNbr);
            }

            capCount++;

        } catch (err) {
            logDebug("ERROR processing " + facId + " : " + err);
        }
    }

    logDebug("Processed " + capCount + " facilities");
    return capCount;
}


function getInvoiceWithRetry(capId,invDate) {
    var tries = 0;
    var maxTries = 2;
    var waitTime = 5000;
    var inv = null;
    while(tries < maxTries)
    {
        inv = getinvoicenumberbydate(capId,invDate);
        if(inv != null && inv != "")
        {
            return inv;
        }
        logDebug("Invoice not ready, retry " + (tries+1));
        java.lang.Thread.sleep(waitTime);
        tries++;
    }
    return null;
}
function getexpirationyear(itemCap) {
b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput();
expdate = b1ExpResult.getExpDate().getYear() - 1 ;
return expdate
}
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}
function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++)
        if (arguments[i] == eVal)
        return true;

}
function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
   else
        return pTestValue;
}
function logMessage(etype, edesc) {
    aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
    aa.print(etype + " : " + edesc);
    emailText += etype + " : " + edesc + "<br />";
}
function logDebug(edesc) {
    if (showDebug) {
        aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate, "", edesc, batchJobID);
        aa.print("DEBUG : " + edesc);
        emailText += "DEBUG : " + edesc + " <br />";
    }
}
function getCapId(pid1, pid2, pid3) {
    var s_capResult = aa.cap.getCapID(pid1, pid2, pid3);
    if (s_capResult.getSuccess())
        return s_capResult.getOutput();
    else {
        logDebug("**ERROR", "Failed to get capId: " + s_capResult.getErrorMessage());
        return null;
    }
}
function dateFormatted(pMonth,pDay,pYear,pFormat) {
               var mth = "";
               var day = "";
               var ret = "";
               if (pMonth > 9)
                              mth = pMonth.toString();
               else
                              mth = "0"+pMonth.toString();
               if (pDay > 9)
                              day = pDay.toString();
               else
                              day = "0"+pDay.toString();
               if (pFormat=="YYYY-MM-DD")
                              ret = pYear.toString()+"-"+mth+"-"+day;
               else
                              ret = ""+mth+"/"+day+"/"+pYear.toString();
               return ret;
}
function email(pToEmail, pFromEmail, pSubject, pText) {
               //Sends email to specified address
               //06SSP-00221
               //
               aa.sendMail(pFromEmail, pToEmail, "", pSubject, pText);
               logDebug("Email sent to "+pToEmail);
               return true;
}              
function addParameter(pamaremeters, key, value){
               if(key != null)
               {
                              if(value == null)
                              {
                                             value = "";
                              }
                              pamaremeters.put(key, value);
               }
}              
function lookup(stdChoice,stdValue) {
               var strControl;
               var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
                              if (bizDomScriptResult.getSuccess())
                              {
                              var bizDomScriptObj = bizDomScriptResult.getOutput();
                              strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
                              logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
                              }
               else
                              {
                              logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
                              }
               return strControl;
}
function editAppSpecific(itemName,itemValue,capId)  {
               var itemCap = capId;
               var itemGroup = null;
				  if (useAppSpecificGroupName) {
				  if (itemName.indexOf(".") < 0)
				  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
				  itemGroup = itemName.substr(0,itemName.indexOf("."));
				  itemName = itemName.substr(itemName.indexOf(".")+1);
               }
               var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);
               if (appSpecInfoResult.getSuccess()) {
                  if(arguments.length < 3) //If no capId passed update the ASI Array
                    AInfo[itemName] = itemValue; 
               }              
               else
                    { logDebug( "WARNING: " + itemName + " was not updated."); }
}              
function getAppSpecific(itemName,itemCap) {
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
function getParentPlacer(childcapid) {
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
function copyDetailedDescriptionTPS(srcCapId, targetCapId) {
    /*
    Fuction has been modified version of the original.
    This function is a combination of the following existing Accela functions workDescGet() and updateWorkDesc().
    */
    //1. Get work description data from source CAPID.
    var srcWrkDescResult = aa.cap.getCapWorkDesByPK(srcCapId);
    if (!srcWrkDescResult.getSuccess())
       {
       logMessage("**ERROR: Failed to get work description from source record: " + srcWrkDescResult.getErrorMessage());
       return false;
       }

    var srcWrkDescObj = srcWrkDescResult.getOutput();
    var srcWorkDesc = srcWrkDescObj.getDescription();

    //2. Get work description field for target CAPID.
    var trgtWrkDescResult = aa.cap.getCapWorkDesByPK(targetCapId);
    var trgtWrkDescObj;

    if (!trgtWrkDescResult.getSuccess())
       {
       logMessage("**ERROR: Failed to get work description for target record: " + trgtWrkDescResult.getErrorMessage());
       return false;
       }

    var trgtWrkDescScriptObj = trgtWrkDescResult.getOutput();
    if (trgtWrkDescScriptObj)
       trgtWrkDescObj = trgtWrkDescScriptObj.getCapWorkDesModel();
    else
        {
               logMessage("**ERROR: Failed to get work description Object for target record: " + trgtWrkDescScriptObj.getErrorMessage());
               return false;
               }

    //3. Copy Detailed Description from source to target.
    trgtWrkDescObj.setDescription(srcWorkDesc);
    aa.cap.editCapWorkDes(trgtWrkDescObj);
    logMessage("Successfully copied work description from source to target.");
}              
function loadASITable(tname,itemCap) {
               var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
               var ta = gm.getTablesArray()
               var tai = ta.iterator();
               while (tai.hasNext())
               {
                 var tsm = tai.next();
                 var tn = tsm.getTableName();
      if (!tn.equals(tname)) continue;
                 if (tsm.rowIndex.isEmpty())
                              {
								 aa.print("Couldn't load ASI Table " + tname + " it is empty " + itemCap);
								 return false;
                              }
                 var tempObject = new Array();
                 var tempArray = new Array();
                 var tsmfldi = tsm.getTableField().iterator();
                 var tsmcoli = tsm.getColumns().iterator();
				 var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
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
                              var tval = tsmfldi.next();
                              var readOnly = 'N';
                              if (readOnlyi.hasNext()) {
                                 readOnly = readOnlyi.next();
                              }
                              var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                              tempObject[tcol.getColumnName()] = fieldInfo;
                              }                             
                 tempArray.push(tempObject);  // end of record
               }              
               return tempArray;
}
function asiTableValObj(columnName, fieldValue, readOnly) {
               this.columnName = columnName;
               this.fieldValue = fieldValue;
               this.readOnly = readOnly;

               asiTableValObj.prototype.toString=function(){ return this.fieldValue }
};
function copyDocuments(pFromCapId, pToCapId) {

                 //Copies all attachments (documents) from pFromCapId to pToCapId
                              var vFromCapId = pFromCapId;
                              var vToCapId = pToCapId;

    var capDocResult = aa.document.getDocumentListByEntity(vFromCapId,"CAP");
    if(capDocResult.getSuccess())
    {
      if(capDocResult.getOutput().size() > 0)
      {
        for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
        {
          var documentObject = capDocResult.getOutput().get(docInx);

                                                                           // download the document content
                                                                           var useDefaultUserPassword = true;
                                                                           //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                                                                           var EMDSUsername = null;
                                                                           var EMDSPassword = null;

                                                                           var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                                                                           if(downloadResult.getSuccess())
                                                                           {
                                                                                          var path = downloadResult.getOutput();
                                                                                          aa.print("path=" + path);
                                                                           }

                                                                           var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
                                                                           documentObject.setDocumentNo(null);
                                                                           documentObject.setCapID(vToCapId)
                                                                           documentObject.setEntityID(tmpEntId);

                                                                           // Open and process file
                                                                           try
                                                                           {
                                                                                          // put together the document content - use java.io.FileInputStream
                                                                                          var newContentModel = aa.document.newDocumentContentModel().getOutput();
                                                                                          inputstream = new java.io.FileInputStream(path);
                                                                                          newContentModel.setDocInputStream(inputstream);
                                                                                          documentObject.setDocumentContent(newContentModel);

                                                                                          var newDocResult = aa.document.createDocument(documentObject);
                                                                                          if (newDocResult.getSuccess())
                                                                                          {
                                                                                                         newDocResult.getOutput();
                                                                                                         aa.print("Successfully copied document: " + documentObject.getFileName());
                                                                                          }
                                                                                          else {
                                                                                                         aa.print("Failed to copy document: " + documentObject.getFileName());
                                                                                                         aa.print(newDocResult.getErrorMessage());
                                                                                          }

                                                                           }
                                                                           catch (err)
                                                                           {
                                                                                          aa.print("Error copying document: " + err.message);
                                                                                          return false;
                                                                           }

                                                            }
      }
    }
  }
function updateAppStatus(stat, cmt,capId) {
    var itemCap = capId;
    if (arguments.length == 3)
        itemCap = arguments[2]; // use cap ID specified in args

    var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
    if (updateStatusResult.getSuccess())
        logDebug("Updated application status to " + stat + " successfully.");
    else
        logDebug("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is " + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}
function updateExpirationDate(expDate,capid) {
var b1ExpResult = aa.expiration.getLicensesByCapID(capid)
                              if (b1ExpResult.getSuccess())
                                             {
                                             this.b1Exp = b1ExpResult.getOutput();

                                             var expAADate = aa.date.parseDate(expDate);
                                             this.b1Exp.setExpDate(expAADate);
                                             aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration())
                                             
                                             }
                                             
}              
function getexpirationdate(itemCap) {
               expdate = "Blank";
b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput().getB1Expiration();
if(b1ExpResult != null)
{
expdate = jsDateToMMDDYYYY(convertDate(b1ExpResult.getExpDate()));
}
return expdate
               
}
function convertDate(thisDate) {
    if (typeof(thisDate) == "string") {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }
    if (typeof(thisDate)== "object") {
        if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
            return thisDate;
        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }                                            
        if (thisDate.getClass().toString().equals("class java.util.Date")) {
            return new Date(thisDate.getTime());
        }
        if (thisDate.getClass().toString().equals("class java.lang.String")) {
            return new Date(String(thisDate));
        }
    }
    if (typeof(thisDate) == "number") {
        return new Date(thisDate);  // assume milliseconds
    }
    logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
               //converts javascript date to string in MM/DD/YYYY format
               //
   if (pJavaScriptDate != null)
				  {
				  if (Date.prototype.isPrototypeOf(pJavaScriptDate))
   return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
				  else
								 {
								 logDebug("Parameter is not a javascript date");
								 return ("INVALID JAVASCRIPT DATE");
								 }
				  }
   else
				  {
				  logDebug("Parameter is null");
				  return ("NULL PARAMETER VALUE");
				  }
}
function feeExistsbynotes(feestr,altid) 	{
	var checkStatus = false;
	var statusArray = new Array(); 

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
		if ( feestr.equals(feeObjArr[ff].getF4FeeItem().getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getF4FeeItem().getFeeitemStatus(),statusArray) ) && altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
			return true;
			
	return false;
}
function feeAmountbynotes(capid,fcode,altid,year) 	{
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
function updatefeenotes(feeCap,fcode,altid,feeComment) {
	var feeResult=aa.finance.getFeeItemByFeeCode(feeCap,fcode,"FINAL");
	if (feeResult.getSuccess())
		{ var feeObjArr = feeResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); return false }
	
	for (ff in feeObjArr)
		if (altid.equals(feeObjArr[ff].getF4FeeItem().getFeeNotes()))
		fsm1 = feeObjArr[ff].getF4FeeItem();
	        fsm1.setFeeNotes(feeComment);
                aa.finance.editFeeItem(fsm1);
}
function getParentPlacer(childcapid) 	{
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
function invoiceAllFeesPlacer(capid) {
	var itemCap = capid;
	var targetFees = loadFeesplacer(itemCap);
	var feeSeqArray = new Array();
	var paymentPeriodArray = new Array();
	for (tFeeNum in targetFees)
		{
		targetFee = targetFees[tFeeNum];
			if (targetFee.status == "NEW")
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
			wait(2000)
}
function getinvoicenumberbydate(capid,date){
	// date format needs to be MM/DD/YYYY
	var invoicenumber = "";
	
	iListResult = aa.finance.getInvoiceByCapID(capid,null);
	iList = iListResult.getOutput();
	for (iNum in iList)
		if(dateFormatted(iList[iNum].getInvDate().getMonth(),iList[iNum].getInvDate().getDayOfMonth(),iList[iNum].getInvDate().getYear(),"").equals(date))
			invoicenumber = iList[iNum].getInvNbr();
	return 	invoicenumber
}
function addFee(fcode,fsched,fperiod,fqty,finvoice,feeCap) 	{
	// Updated Script will return feeSeq number or null if error encountered (SR5112) 
	var customId = aa.cap.getCap(feeCap).getOutput().getCapModel().getAltID();
	var feeCapMessage = "";
	var feeSeq_L = new Array();				// invoicing fee for CAP in args
	var paymentPeriod_L = new Array();			// invoicing pay periods for CAP in args
	var feeSeq = null;
	if (arguments.length > 5) 
		{
		feeCap = arguments[5]; // use cap ID specified in args
		feeCapMessage = " to facility";
		}

	assessFeeResult = aa.finance.createFeeItem(feeCap,fsched,fcode,fperiod,fqty);
	if (assessFeeResult.getSuccess())
		{
		feeSeq = assessFeeResult.getOutput();
		logDebug("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage + " " + customId);

		if (finvoice == "Y" && arguments.length == 5) // use current CAP
			{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
			}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
			{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
				logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
			}
			//updateFeeItemInvoiceFlag(feeSeq,finvoice);
		}
	else
		{
		logDebug( "**ERROR: assessing fee (" + fcode + "): to " + customId + " " + assessFeeResult.getErrorMessage());
		feeSeq = null;
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
function loadFeesplacer(capid) 	{
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
		for (ff in feeObjArr) {
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
function Fee() {
    this.sequence = null;
    this.code = null;
    this.description = null;
    this.unit = null;
    this.amount = null;
    this.amountPaid = null;
    this.applyDate = null;
    this.effectDate = null;
    this.expireDate = null;
    this.status = null;
    this.recDate = null;
    this.period = null;
    this.display = null;
    this.accCodeL1 = null;
    this.accCodeL2 = null;
    this.accCodeL3 = null;
    this.formula = null;
    this.udes = null;
    this.UDF1 = null;
    this.UDF2 = null;
    this.UDF3 = null;
    this.UDF4 = null;
}
function generateReport(aaReportName,parameters,rModule,capid) {
	var reportName = aaReportName;
	report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    report.setModule(rModule);
    report.setCapId(capid);
    report.setReportParameters(parameters);
    var permit = aa.reportManager.hasPermission(reportName,"Admin");
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
function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile,capid) {
	sca = String(capid).split("-"); 
	var id1 = sca[0];
 	var id2 = sca[1];
 	var id3 = sca[2];

	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully to " + emailTo + "!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}
function wait(ms) {
    java.lang.Thread.sleep(ms);
}
function feeExists(feeCode,capId) {
    var feeResult = aa.finance.getFeeItemByCapID(capId);

    if(!feeResult.getSuccess())
        return false;

    var feeList = feeResult.getOutput();

    if(!feeList)
        return false;

    for(var i in feeList)
    {
        if(feeList[i].getFeeCod() == feeCode &&
           feeList[i].getFeeitemStatus() != "VOIDED")
        {
            return true;
        }
    }

    return false;
}
function invoiceFeeSequenceList(capId,feeSeqList,invType) {
    if(!feeSeqList || feeSeqList.length == 0)
        return null;
    /* Verify fees are NEW */
    var validFees = [];
    var feeResult = aa.finance.getFeeItemByCapID(capId);
    if(!feeResult.getSuccess())
        return null;
    var feeItems = feeResult.getOutput();
    for(var x in feeSeqList)
    {
        var seq = feeSeqList[x];

        for(var f in feeItems)
        {
            if(feeItems[f].getFeeSeqNbr() == seq)
            {
                var status = feeItems[f].getFeeitemStatus();
                logDebug("Fee "+seq+" status: "+status);
                if(status == "NEW")
                {
                    validFees.push(seq);
                }
            }
        }
    }
    if(validFees.length == 0)
    {
        logDebug("No NEW fees to invoice");
        return null;
    }
    /* Invoice only NEW fees */
    var invoiceResult = aa.finance.createInvoice(
        capId,
        validFees,
        invType
    );
    if(!invoiceResult.getSuccess())
    {
        logDebug("Invoice error: " + invoiceResult.getErrorMessage());
        return null;
    }
    var invoiceNbr = invoiceResult.getOutput();
    if(invoiceNbr && invoiceNbr.length > 0)
    {
        return invoiceNbr[0];
    }
    return null;
}
function invoiceNewFeesWithRetry(capId, feeSeqList, maxRetries, delayMs) {
    // Set defaults manually
    maxRetries = (typeof maxRetries !== "undefined") ? maxRetries : 5;
    delayMs = (typeof delayMs !== "undefined") ? delayMs : 2000;
    if (!feeSeqList || feeSeqList.length === 0) return null;
    var validFees = [];
    var feeResult = aa.finance.getFeeItemByCapID(capId);
    if (!feeResult.getSuccess()) return null;
    var feeItems = feeResult.getOutput();
    // Filter only NEW fees
    feeSeqList.forEach(function(seq) {
        feeItems.forEach(function(fee) {
            if (fee.getFeeSeqNbr() == seq && fee.getFeeitemStatus() === "NEW") {
                validFees.push(seq);
            }
        });
    });

    if (validFees.length === 0) {
        logDebug("No NEW fees to invoice for CAP " + capId + ": " + feeSeqList.join(","));
        return null;
    }
    logDebug("Invoice fee sequences for CAP " + capId + ": " + validFees.join(","));
    var invoiceNumber = null;
    for (var attempt = 1; attempt <= maxRetries; attempt++) {
        var invoiceResult = aa.finance.createInvoice(capId, validFees, null); // pass array directly if supported
        if (invoiceResult.getSuccess()) {
            var output = invoiceResult.getOutput();
            if (output && output.length > 0) {
                invoiceNumber = output[0];
                logDebug("Invoice created successfully on attempt " + attempt + " for CAP " + capId + ": " + invoiceNumber);
                break;
            }
        } else {
            logDebug("Invoice attempt " + attempt + " failed for CAP " + capId + ": " + invoiceResult.getErrorMessage());
        }
        if (attempt < maxRetries) {
            logDebug("Waiting " + delayMs + "ms before retrying invoice for CAP " + capId + "...");
            try {
                java.lang.Thread.sleep(delayMs);
            } catch (e) {
                logDebug("Sleep interrupted: " + e);
            }
        }
    }
    if (!invoiceNumber) logDebug("Invoice creation failed after " + maxRetries + " attempts for CAP " + capId);
    return invoiceNumber;
}

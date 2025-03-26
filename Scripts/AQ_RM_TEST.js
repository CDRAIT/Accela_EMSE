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
var senderEmailAddr = "pcapcd@placer.ca.gov";                                          // Email address of the sender
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
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() {
    var capCount = 0; 
               var CAPIDS = []
               /*var CAPIDSG = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","GDF").getOutput();
               var CAPIDSP = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Prime Engine").getOutput();
               var CAPIDSE = aa.cap.getByAppType("AirQuality","Stationary Source","Throughput","Engine").getOutput();
               for (x in CAPIDSG) 
               {
                              CAPIDS.push(CAPIDSG[x])
               }
               for (x in CAPIDSP) 
               {
                              CAPIDS.push(CAPIDSP[x])
               }
               for (x in CAPIDSE) 
               {
                              CAPIDS.push(CAPIDSE[x])
               }*/
CAPIDS.push('TP21-RFCO-14-04-01');
//CAPIDS.push('TP20-ALMS-07-01-01');
//CAPIDS.push('TP20-ALMS-07-02-01');
//CAPIDS.push('TP20-ALMS-07-03-01');
//CAPIDS.push('TP20-ALPM-01-01-01');
//CAPIDS.push('TP20-ALPM-01-02-01');
//CAPIDS.push('TP20-ALPM-01-03-01');

    for (x in CAPIDS) 
    {
        var capId = aa.cap.getCapID(CAPIDS[x]).getOutput();
                              var cap = aa.cap.getCap(capId).getOutput(); // Cap Object
                              capIDString = cap.getCapModel().getAltID();

                              var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");


                              if(projIncomplete.getSuccess())
                              {
             var licenseProjects  = projIncomplete.getOutput();
             for (var pi in licenseProjects)
             {
                            parentCapId = licenseProjects[pi].getProjectID();
                            licenseProjects[pi].setStatus("Complete");
                            var updateResult = aa.cap.updateProject(licenseProjects[pi]);
                                                                                                         
             }
                                             capCount++
                              }
               }
    return capCount;
}
/*var capId = aa.cap.getCapID("TP21-ROST-01-02-01").getOutput();
licenseProjects = aa.cap.getProjectByChildCapID(capId, "Renewal", null).getOutput();
parentcapId = licenseProjects[0].getProjectID();

true ^ aa.cap.updateCapAltID(capId,"TP"+ getexpirationyear(parentcapId).toString().substr(-2) + "-" + aa.cap.getCap(parentcapId).getOutput().getCapModel().getAltID());updateAppStatus("Submitted","");updateAppStatus("Throughput Submitted","",parentcapId);*/

function getexpirationyear(itemCap)
{
b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput();

expdate = b1ExpResult.getExpDate().getYear() - 1 ;
return expdate
               
}



/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - batchStartTime) / 1000)
}

// exists:  return true if Value is in Array
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


function dateFormatted(pMonth,pDay,pYear,pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
               {
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


function email(pToEmail, pFromEmail, pSubject, pText) 
               {
               //Sends email to specified address
               //06SSP-00221
               //
               aa.sendMail(pFromEmail, pToEmail, "", pSubject, pText);
               logDebug("Email sent to "+pToEmail);
               return true;
               }              
function addParameter(pamaremeters, key, value)
{
               if(key != null)
               {
                              if(value == null)
                              {
                                             value = "";
                              }
                              pamaremeters.put(key, value);
               }
}              

function lookup(stdChoice,stdValue) 
               {
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
               
               
function editAppSpecific(itemName,itemValue,capId)  // optional: itemCap
{
               var itemCap = capId;
               var itemGroup = null;
               
               if (useAppSpecificGroupName)
               {
                              if (itemName.indexOf(".") < 0)
                                             { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
                              
                              
                              itemGroup = itemName.substr(0,itemName.indexOf("."));
                              itemName = itemName.substr(itemName.indexOf(".")+1);
               }
               
               var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);

               if (appSpecInfoResult.getSuccess())
               {
                             if(arguments.length < 3) //If no capId passed update the ASI Array
                                            AInfo[itemName] = itemValue; 
               }              
               else
                              { logDebug( "WARNING: " + itemName + " was not updated."); }
}              
               
function getAppSpecific(itemName,itemCap)  // optional: itemCap
{
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
function copyDetailedDescriptionTPS(srcCapId, targetCapId)
{
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
function loadASITable(tname,itemCap) 
{
               

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
function copyDocuments(pFromCapId, pToCapId) 
{

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
  function updateAppStatus(stat, cmt,capId) // optional cap id
{
    var itemCap = capId;
    if (arguments.length == 3)
        itemCap = arguments[2]; // use cap ID specified in args

    var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
    if (updateStatusResult.getSuccess())
        logDebug("Updated application status to " + stat + " successfully.");
    else
        logDebug("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is " + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}
function updateExpirationDate(expDate,capid)
{
var b1ExpResult = aa.expiration.getLicensesByCapID(capid)
                              if (b1ExpResult.getSuccess())
                                             {
                                             this.b1Exp = b1ExpResult.getOutput();

                                             var expAADate = aa.date.parseDate(expDate);
                                             this.b1Exp.setExpDate(expAADate);
                                             aa.expiration.editB1Expiration(this.b1Exp.getB1Expiration())
                                             
                                             }
                                             
}              
function getexpirationdate(itemCap)
{
               expdate = "Blank";
b1ExpResult = aa.expiration.getLicensesByCapID(itemCap).getOutput().getB1Expiration();
if(b1ExpResult != null)
{
expdate = jsDateToMMDDYYYY(convertDate(b1ExpResult.getExpDate()));
}
return expdate
               
}
function convertDate(thisDate)
               {

               if (typeof(thisDate) == "string")
                              {
                              var retVal = new Date(String(thisDate));
                              if (!retVal.toString().equals("Invalid Date"))
                                             return retVal;
                              }

               if (typeof(thisDate)== "object")
                              {

                              if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
                                             {
                                             return thisDate;
                                             }

                              if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
                                             {
                                             return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
                                             }
                                             
                              if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
                                             {
                                             return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
                                             }                                            

                              if (thisDate.getClass().toString().equals("class java.util.Date"))
                                             {
                                             return new Date(thisDate.getTime());
                                             }

                              if (thisDate.getClass().toString().equals("class java.lang.String"))
                                             {
                                             return new Date(String(thisDate));
                                             }
                              }

               if (typeof(thisDate) == "number")
                              {
                              return new Date(thisDate);  // assume milliseconds
                              }

               logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
               return null;

               }
               function jsDateToMMDDYYYY(pJavaScriptDate)
               {
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
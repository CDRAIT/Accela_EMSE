// BatchSetCalendarCutOffTime

// Run as ADMIN
currentUserID = "ADMIN";
aa.env.setValue("CurrentUserID", currentUserID);

var calendarName = "Building Inspection";
var calendarType = "INSPECTION"; // AGENCY HOLIDAY, INSPECTION, MEETING, USER
var calendarUser = null;
var calendarEnableForACA = null;
//var calendarCutOffTime = "03:00 PM";
var weekendCalendarCutOffTime = "00:05 AM";
var weekdayCalendarCutOffTime = "03:00 PM";
var cutOffBefore = "";
var cutOffAfter = "";

/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|	The following script code will attempt to read the associate event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/
var triggerEvent = aa.env.getValue("EventName");
var controlString = null;
var documentOnly = false; // Document Only -- displays hierarchy of std choice steps

var preExecute = "PreExecuteForAfterEvents"; //Assume after event unless before detected
var eventType = "After"; //Assume after event
if (triggerEvent != "") {
  controlString = triggerEvent; // Standard choice for control
  if (triggerEvent.indexOf("Before") > 0) {
    preExecute = "PreExecuteForBeforeEvents";
    eventType = "Before";
  }
}

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 9.0;
var useCustomScriptFile = true; // if true, use Events->Custom Script and Master Scripts, else use Events->Scripts->INCLUDES_*
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

var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";
var doStdChoices = true; // compatibility default
var doScripts = false;
var bzr =
  aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0;
if (bzr) {
  var bvr1 = aa.bizDomain.getBizDomainByValue(
    controlFlagStdChoice,
    "STD_CHOICE"
  );
  doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
  var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT");
  doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";
  var bvr3 = aa.bizDomain.getBizDomainByValue(
    controlFlagStdChoice,
    "USE_MASTER_INCLUDES"
  );
  if (bvr3.getSuccess()) {
    if (bvr3.getOutput().getDescription() == "No") useCustomScriptFile = false;
  }
}

if (SA) {
  eval(_getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
  eval(_getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useCustomScriptFile));
  eval(_getScriptText(SAScript, SA));
} else {
  eval(_getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
  eval(_getScriptText("INCLUDES_ACCELA_GLOBALS", null, useCustomScriptFile));
}

eval(_getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
if (true) {
  function logDebug(dstr) {
    vLevel = 1;
    if (arguments.length > 1) vLevel = arguments[1];
    aa.print(dstr);
    if ((showDebug & vLevel) == vLevel || vLevel == 1) debug += dstr + br;
    if ((showDebug & vLevel) == vLevel)
      aa.debug(
        aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),
        dstr
      );
  }
}

// get cutoff times for calendars
try {
  //checks to see if this is a weekend or holiday
  // if so, updates inspection calendar to 12:05 AM cut off time
  var vToday = new Date();
  // check to see if this is a weekend or holiday
  var isWeekendOrHoliday = checkHolidayCalendar(vToday);

  // get calendars
  var calendars = getCalendars(
    calendarName,
    calendarType,
    calendarUser,
    calendarEnableForACA
  );

  var CalendarBusiness = aa.proxyInvoker
    .newInstance("com.accela.calendar.business.CalendarBusiness")
    .getOutput();
  for (var cc in calendars) {
    var calendar = calendars[cc];
    cutOffBefore = calendar.calendarCutOffTime;
    logDebug("Calendar name is: " + calendar.calendarName);
    logDebug("Calendar Cutoff Time is: " + calendar.calendarCutOffTime);

    if (calendar.calendarName == "Building Inspection") {
      try {
        if (isWeekendOrHoliday) {
          calendar.setCalendarCutOffTime(weekendCalendarCutOffTime);
        } else {
          calendar.setCalendarCutOffTime(weekdayCalendarCutOffTime);
        }
        // updates the cutoff in the calendar
        CalendarBusiness.updateCalendar(calendar, currentUserID);
        cutOffAfter = calendar.calendarCutOffTime;
        logDebug(
          "Successfully updated calendar " +
            calendar.calendarName +
            " cut off time to: " +
            calendar.calendarCutOffTime
        );
      } catch (err) {
        logDebug(
          "ERROR: Updating calendar " +
            calendar.calendarName +
            " cut off time: " +
            calendar.calendarCutOffTime +
            " Reason: " +
            err.message +
            " at line " +
            err.lineNumber +
            " stack: " +
            err.stack
        );
      }
    }
  }

  // Check Calendars
  var calendars = getCalendars(
    calendarName,
    calendarType,
    calendarUser,
    calendarEnableForACA
  );
} catch (err) {
  logDebug(
    "A JavaScript Error occured: " +
      err.message +
      " at line " +
      err.lineNumber +
      " stack: " +
      err.stack
  );
  //throw (err);
}

email(
  "cdrait@placer.ca.gov;mbecker@truepointsolutions.com",
  "noreply@placer.ca.gov",
  "Building Inspection cut off is updated from " +
    cutOffBefore +
    " to " +
    cutOffAfter,
  "Building Inspection cut off is updated from " +
    cutOffBefore +
    " to " +
    cutOffAfter,
  ""
);

//var z = debug.replace(/<BR>/g, "\r"); aa.print(z);
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

function _getScriptText(vScriptName, servProvCode, useProductScripts) {
  if (!servProvCode) servProvCode = aa.getServiceProviderCode();
  vScriptName = vScriptName.toUpperCase();
  var emseBiz = aa.proxyInvoker
    .newInstance("com.accela.aa.emse.emse.EMSEBusiness")
    .getOutput();
  try {
    var vScriptNamePrefix = "";
    if (useProductScripts) {
      var vScriptNamePrefix = "Events>Master Scripts>";
      var emseScript = emseBiz.getMasterScript(
        aa.getServiceProviderCode(),
        vScriptName
      );
    } else {
      var vScriptNamePrefix = "Events>Scripts>";
      var emseScript = emseBiz.getScriptByPK(
        aa.getServiceProviderCode(),
        vScriptName,
        "ADMIN"
      );
    }
    var scriptText = emseScript
      ? String(emseScript.getScriptText() + "").trim()
      : "";
    if (scriptText.length > 0) {
      aa.print(
        "loading " +
          vScriptNamePrefix +
          vScriptName +
          (emseScript.scriptName ? ", Name: " + emseScript.scriptName : "") +
          (emseScript.sripteCode ? ", Code: " + emseScript.sripteCode : "") +
          (emseScript.masterScriptVersion
            ? ", Version: " + emseScript.masterScriptVersion
            : "")
        //+ (emseScript.scriptText ? ", Text: " + String(emseScript.scriptText).substring(106, 146) + " ..." : "")
      );
    }
    return scriptText;
  } catch (err) {
    aa.print(
      "Error in " +
        vScriptName +
        " at line " +
        err.lineNumber +
        " : " +
        err.message
    );
    aa.print("Stack: " + err.stack);
    return "";
  }
}

function getCalendars() {
  var calendarName = arguments.length > 0 && arguments[0] ? arguments[0] : null;
  var calendarType = arguments.length > 1 && arguments[1] ? arguments[1] : null; // AGENCY HOLIDAY, INSPECTION, MEETING, USER
  var calendarUser = arguments.length > 2 && arguments[2] ? arguments[2] : null;
  var calendarEnableForACA =
    arguments.length > 3 && arguments[3] ? arguments[3] : null;

  var servProvCode = aa.getServiceProviderCode();
  // Set calendar search model.
  try {
    var calendarModel = new com.accela.aa.calendar.calendar.CalendarModel();
    calendarModel.setServiceProviderCode(servProvCode);
    if (calendarName) calendarModel.setCalendarName(calendarName);
    if (calendarType) calendarModel.setCalendarType(calendarType);
    if (calendarUser) calendarModel.setCalendarUser(calendarUser);
    if (calendarEnableForACA)
      calendarModel.setCalendarEnableForACA(calendarEnableForACA);
    //logDebug("calendarModel: " + calendarModel
    //    + br + describe_TPS(calendarModel, null, null, true));
    var CalendarBusiness = aa.proxyInvoker
      .newInstance("com.accela.calendar.business.CalendarBusiness")
      .getOutput();
    //logDebug("CalendarBusiness: " + CalendarBusiness
    //  + br + describe_TPS(CalendarBusiness, null, null, true));

    var calendars = CalendarBusiness.getCalendars(calendarModel, currentUserID);
    if (calendars) var calendars = calendars.toArray();
    else var calendars = [];
    for (var cc in calendars) {
      var calendar = calendars[cc];
      logDebug(
        "calendars[" +
          cc +
          "]: " +
          calendar +
          ", ID: " +
          calendar.calendarID +
          ", Name: " +
          calendar.calendarName +
          ", Type: " +
          calendar.calendarType +
          (calendar.calendarUser ? ", User: " + calendar.calendarUser : "") +
          ", EnableForACA: " +
          calendar.calendarEnableForACA +
          ", hideInspectionTimesInACA: " +
          calendar.hideInspectionTimesInACA +
          ", calendarCutOffTime: " +
          calendar.calendarCutOffTime +
          ", daysInAdvance: " +
          calendar.daysInAdvance +
          ", acaScheduleBlock: " +
          calendar.acaScheduleBlock +
          ", acaScheduleBlockUnit: " +
          calendar.acaScheduleBlockUnit +
          ", calendarBlockSize: " +
          calendar.calendarBlockSize +
          ", calendarBlockUnit: " +
          calendar.calendarBlockUnit
        //+ (cc == 0 ? br + describe_TPS(calendar, null, null, true) : "")
      );
    }
  } catch (err) {
    logDebug(
      "A JavaScript Error occured: " +
        err.message +
        " at line " +
        err.lineNumber +
        " stack: " +
        err.stack
    );
    //throw (err);
  }
  return calendars;
}

function getHolidays() {
  var calendarName = arguments.length > 0 && arguments[0] ? arguments[0] : null;
  var calendarType = arguments.length > 1 && arguments[1] ? arguments[1] : null; // AGENCY HOLIDAY, INSPECTION, MEETING, USER
  var calendarUser = arguments.length > 2 && arguments[2] ? arguments[2] : null;
  var calendarEnableForACA =
    arguments.length > 3 && arguments[3] ? arguments[3] : null;

  var servProvCode = aa.getServiceProviderCode();
  // Set calendar search model.
  try {
    var calendarModel = new com.accela.aa.calendar.calendar.CalendarModel();
    calendarModel.setServiceProviderCode(servProvCode);
    if (calendarName) calendarModel.setCalendarName(calendarName);
    if (calendarType) calendarModel.setCalendarType(calendarType);
    if (calendarUser) calendarModel.setCalendarUser(calendarUser);
    if (calendarEnableForACA)
      calendarModel.setCalendarEnableForACA(calendarEnableForACA);
    //logDebug("calendarModel: " + calendarModel
    //    + br + describe_TPS(calendarModel, null, null, true));
    var CalendarBusiness = aa.proxyInvoker
      .newInstance("com.accela.calendar.business.CalendarBusiness")
      .getOutput();
    //logDebug("CalendarBusiness: " + CalendarBusiness
    //  + br + describe_TPS(CalendarBusiness, null, null, true));

    var calendars = CalendarBusiness.getCalendars(calendarModel, currentUserID);
    if (calendars) var calendars = calendars.toArray();
    else var calendars = [];
    for (var cc in calendars) {
      var calendar = calendars[cc];
      logDebug(
        "holidays[" +
          cc +
          "]: " +
          calendar +
          ", ID: " +
          calendar.calendarID +
          ", Name: " +
          calendar.calendarName +
          ", Type: " +
          calendar.calendarType +
          (calendar.calendarUser ? ", User: " + calendar.calendarUser : "") +
          ", EnableForACA: " +
          calendar.calendarEnableForACA +
          ", hideInspectionTimesInACA: " +
          calendar.hideInspectionTimesInACA +
          ", calendarCutOffTime: " +
          calendar.calendarCutOffTime +
          ", daysInAdvance: " +
          calendar.daysInAdvance +
          ", acaScheduleBlock: " +
          calendar.acaScheduleBlock +
          ", acaScheduleBlockUnit: " +
          calendar.acaScheduleBlockUnit +
          ", calendarBlockSize: " +
          calendar.calendarBlockSize +
          ", calendarBlockUnit: " +
          calendar.calendarBlockUnit
        //+ (cc == 0 ? br + describe_TPS(calendar, null, null, true) : "")
      );
    }
  } catch (err) {
    logDebug(
      "A JavaScript Error occured: " +
        err.message +
        " at line " +
        err.lineNumber +
        " stack: " +
        err.stack
    );
    //throw (err);
  }
  return calendar.calendarID;
}

/*
 * Checks all agency holiday calendar for an event on the specified date
 * Returns true if there is an event, else false
 * date - javascript date object
 */
function checkHolidayCalendar(date) {
  try {
    //check if this is a weekend and return true if yes
    var dayOfWeek = date.getDay();
    logDebug("Checking if it's a weekend...");
    logDebug("Day of week is: " + dayOfWeek);
    if (dayOfWeek == 0 || dayOfWeek == 6) {
      logDebug("This is a weekend!");
      return true;
    } else {
      logDebug("This is a weekday, checking to see if its a holiday...");
    }
    //now check the calendar
    var holiday = false;

    // get holiday calendar id
    var vCalendarId = getHolidays(
      "Placer County Holidays",
      "AGENCY HOLIDAY",
      calendarUser,
      calendarEnableForACA
    );

    var events = aa.calendar
      .getEventSeriesByCalendarID(
        vCalendarId,
        date.getYear() + 1900,
        date.getMonth() + 1
      )
      .getOutput();

    for (var e in events) {
      var event = events[e];
      var startDate = new Date(event.getStartDate().getTime());
      var startTime = event.getStartTime();
      var endDate = event.getEndDate();
      var allDay = event.isAllDayEvent();
      var duration = event.getEventDuration();
      if (dateDiff(startDate, date) >= 0 && dateDiff(startDate, date) < 1) {
        holiday = true;
      }
    }
    if (holiday) {
      logDebug("This is a Holiday...");
    } else {
      logDebug("This is not a holiday...");
    }
    return holiday;
  } catch (r) {
    aa.print(r);
  }
}

function logDebug(dstr) {
  vLevel = 1;
  if (arguments.length > 1) vLevel = arguments[1];
  aa.print(dstr);
  if ((showDebug & vLevel) == vLevel || vLevel == 1) debug += dstr + br;
  if ((showDebug & vLevel) == vLevel)
    aa.debug(
      aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),
      dstr
    );
}

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
      if (oNameRegEx && !oNameRegEx.test(i)) {
        continue;
      }
      if (
        (oType == "*" || oType == "function") &&
        typeof obj[i] == "function"
      ) {
        oFuncArray.push(i);
      } else if (
        (oType == "*" || oType == "property") &&
        typeof obj[i] != "function"
      ) {
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
        if (
          oValue
            .getClass()
            .toString()
            .equals("class com.accela.aa.emse.dom.ScriptDateTime")
        )
          oValue += " " + new Date(oValue.getEpochMilliseconds());
        if (
          oValue
            .getClass()
            .toString()
            .equals("class com.accela.aa.emse.util.ScriptDateTime")
        )
          oValue += " " + new Date(oValue.getEpochMilliseconds());
        // if (oValue.getClass().toString().equals("class java.util.Date")) oValue += " " + convertDate(oValue);
      }
      ret += "property:" + n + " = " + oValue + newLine;
    }
    // List Functions
    oFuncArray.sort();
    for (var i in oFuncArray) {
      n = oFuncArray[i];
      oDef = String(obj[n])
        .replace("\n", " ")
        .replace("\r", " ")
        .replace(String.fromCharCode(10), " ")
        .replace(String.fromCharCode(10), " ");
      x = oDef.indexOf(n + "()", n.length + 15);
      if (x > 15) x = x + n.length + 1;
      oName = verbose ? oDef : "function:" + n + "()"; // Include full definition of function if verbose
      oValue = n.toString().indexOf("get") == 0 && x > 0 ? obj[n]() : ""; // Get function value if "Get" function and no parameters.
      if (oValue && oValue.getClass) {
        //				logDebug(n + " " + oValue.getClass());
        if (
          oValue
            .getClass()
            .toString()
            .equals("class com.accela.aa.emse.dom.ScriptDateTime")
        )
          oValue += " " + new Date(oValue.getEpochMilliseconds());
        if (
          oValue
            .getClass()
            .toString()
            .equals("class com.accela.aa.emse.util.ScriptDateTime")
        )
          oValue += " " + new Date(oValue.getEpochMilliseconds());
        // if (oValue.getClass().toString().equals("class java.util.Date")) oValue += " " + convertDate(oValue);
      }
      ret += oName + " = " + oValue + newLine;
    }
  } catch (err) {
    showDebug = 3;
    var context = "describe_TPS(" + obj + ")";
    logDebug(
      "ERROR: An error occurred in " +
        context +
        " Line " +
        err.lineNumber +
        " Error:  " +
        err.message
    );
    logDebug("Stack: " + err.stack);
  }
  return ret;
}
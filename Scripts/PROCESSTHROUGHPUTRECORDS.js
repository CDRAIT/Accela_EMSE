/*------------------------------------------------------------------------------------------------------/
| Program: ProcessThroughputRecords  Trigger: Batch - FINAL Step - Push to Facility
| Client : Placer Air Quaility
|
| Version 1.0 - Base Version. 09/03/2017 - TruePoint Solutions
| Version 1.1 - Modified criteria and correct syntax errors.  09/10/2017 TJD
| Version 2.0 - Code cleanup/formating 3/2/2026 - RM
| Script is run to email permit to facilities.
|
| Batch Requirements:
/------------------------------------------------------------------------------------------------------*/
var showDebug = true; 				// Set to true to see debug messages in event log and email confirmation
var maxSeconds = 15 * 60; 			// number of seconds allowed for batch processing, usually < 5*60
var documentOnly = false; 			// Document Only -- displays hierarchy of std choice steps
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var batchStartDate = new Date();                                                        // System Date
var batchStartTime = batchStartDate.getTime();                                          // Start timer
var timeExpired = false;                                                                // Variable to identify if batch script has timed out. Defaulted to "false".
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;                                                    // Use Group name when populating App Specific Info Values
var senderEmailAddr = "pcapcd@placer.ca.gov";                                          // Email address of the sender
var emailAddress = "rmoore@placer.ca.gov";                                      // Email address of the person who will receive the batch script log information
var emailAddress2 = "rmoore@placer.ca.gov";                                             // CC email address of the person who will receive the batch script log information
var emailText = "";       

                                                              // Email body
//Parameter variables
var paramsOK = true;
//var TPvalue="TP24";
var TPvalue = aa.env.getValue("Throughput");
var currentUserID = "ADMIN"
var ratingCO = 0;
var ratingNOx = 0;
var ratingPM10 = 0;
var ratingSOx = 0;
var ratingVOC = 0;
var permitIds = [];
var facIds = [];
var parrEmission = new Array();
var message = "";
var debug = "";

if (paramsOK) {
    logMessage("START", "Start of Sending of Permit Batch Job.");

    var licAboutToExpCnt = aboutExpLics();

    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of Sending of Permit Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for Sending of Permit", emailText);

function aboutExpLics() {
    var capCount = 0;
var thru = [];
thru.push("TP24-AUCC-30-01-01");
thru.push("TP24-AUCC-30-01-02");
thru.push("TP24-AUCC-30-01-03");
thru.push("TP24-AUCC-30-02-01");
thru.push("TP24-AUCC-30-02-02");
thru.push("TP24-AUCC-30-02-03");
thru.push("TP24-AUCC-30-03-01");
thru.push("TP24-AUCC-30-03-02");
thru.push("TP24-AUCC-30-03-03");
thru.push("TP24-AUCC-30-04-01");
thru.push("TP24-AUCC-30-04-02");
thru.push("TP24-AUCC-30-04-03");
//var thru = getThroughputrecords(TPvalue)
	for (x in thru)
	{
		tpratingCO = 0;
		tpratingNOx = 0;
		tpratingPM10 = 0;
		tpratingSOx = 0;
		tpratingVOC = 0;
//		var year = String(TPvalue).replace("TP","");
		var year = "24";		//hard coded for testing
		var capIDString = thru[x];
		var arrEmission = new Array(); 
		var thrucapId = aa.cap.getCapID(thru[x]).getOutput();
		var process = aa.cap.getProjectByChildCapID(thrucapId,null, null).getOutput();
		var permit = getParentPlacer(process[0].getProjectID())
		if(permit != "false")
		 {
			 logDebug("Working on Throughput " + capIDString);
			 // Getting all CRITERIA POLLUTANT EMISSION entered
			var CPE = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			for (x in CPE)
			{
				emisrow = CPE[x]; 
				if(emisrow["Pollutant"].toString() == "Carbon Monoxide (CO)")
				{
					arrEmission["CO"] = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10));
					tpratingCO = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10));
					aa.print("Carbon Monoxide (CO) = " + emisrow["Annual Emissions (tons)"].toString())
				}
				if(emisrow["Pollutant"].toString() == "Particulate Matter (PM10)")
				{
					arrEmission["PM10"] = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					tpratingPM10 = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					aa.print("Particulate Matter (PM10) = " + emisrow["Annual Emissions (tons)"].toString())
				}
				if(emisrow["Pollutant"].toString() == "Sulfur Oxides (SOx)")
				{
					arrEmission["SOx"] = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					tpratingSOx = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					aa.print("Sulfur Oxides (SOx)= " + emisrow["Annual Emissions (tons)"].toString())
				}
				if(emisrow["Pollutant"].toString() == "Volatile Organic Compounds (VOC)")
				{
					arrEmission["VOC"] = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					tpratingVOC = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					aa.print("Volatile Organic Compounds (VOC) = " + emisrow["Annual Emissions (tons)"].toString())
				}
				if(emisrow["Pollutant"].toString() == "Nitrogen Oxides (NOx)")
				{
					arrEmission["NOx"] = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					tpratingNOx = String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10))
					logDebug("Start of NOx " + String(Number(emisrow["Annual Emissions (tons)"]).toFixed(10)));
					aa.print("Nitrogen Oxides (NOx) = " + emisrow["Annual Emissions (tons)"].toString())
				}
				arrEmission["Throughput record"] = capIDString;
				arrEmission["Throughput Year"] = year;
			}
			logDebug("CPE Length: " + CPE.length);
			logDebug("permit: " + aa.cap.getCap(permit).getOutput().getCapModel().getAltID());
		//if table has rows check to see if row already exists in table on permit
		if(CPE.length > 0)
		{
			var throughputcheck = checkthroughput(permit,capIDString, year);
			logDebug("throughputcheck: " + throughputcheck);
			if(throughputcheck == "No Match")				//// what is this for ?
			{
				addToASITable("THROUGHPUT ACTUAL EMISSIONS",arrEmission,permit); // add rows to throughput table on permit
					capCount++;
				if(permitIds.valueOf().toString().match(permit) == null)
				{
					permitIds.push(permit);
					logDebug("permitpush: " + permit);
				}
			}//done with no match
			if(throughputcheck == "Match")				//// Added for Match, and now pushes to facility record
			{
				tparrEmission = [];
				newRatingTable = loadASITable("THROUGHPUT ACTUAL EMISSIONS",permit); 
				removeASITable("THROUGHPUT ACTUAL EMISSIONS",permit);

			for (eachrow in newRatingTable)
			{
				if(newRatingTable[eachrow]["Throughput Year"] == year && newRatingTable[eachrow]["Throughput record"] == capIDString)
				{
					tparrEmission["CO"] = String(Number(tpratingCO).toFixed(10));
					tparrEmission["NOx"] = String(Number(tpratingNOx).toFixed(10));
					logDebug("tpratingNOx: " + String(Number(tpratingNOx).toFixed(10)));
					tparrEmission["PM10"] = String(Number(tpratingPM10).toFixed(10));
					tparrEmission["SOx"] = String(Number(tpratingSOx).toFixed(10));
					tparrEmission["VOC"] = String(Number(tpratingVOC).toFixed(10));
					tparrEmission["Throughput record"] = String(capIDString);
					tparrEmission["Throughput Year"] = String(year);
				}
				else 
				{
					tparrEmission["CO"] = newRatingTable[eachrow]["CO"];
					tparrEmission["NOx"] = newRatingTable[eachrow]["NOx"];
					tparrEmission["PM10"] = newRatingTable[eachrow]["PM10"];
					tparrEmission["SOx"] = newRatingTable[eachrow]["SOx"];
					tparrEmission["VOC"] = newRatingTable[eachrow]["VOC"];
					tparrEmission["Throughput record"] = newRatingTable[eachrow]["Throughput record"];
					tparrEmission["Throughput Year"] = newRatingTable[eachrow]["Throughput Year"];
				}
				
				addToASITable("THROUGHPUT ACTUAL EMISSIONS",tparrEmission,permit);
			}
				capCount++;
				if(permitIds.valueOf().toString().match(permit) == null)
				{
					permitIds.push(permit);
					logDebug("permitpush: " + permit);
					
				}
			}// done with match loop		
		}// done working with table rows
			if(CPE.length == 0)
			{
				logDebug("Throughput " + capIDString + " does not have any CRITERIA POLLUTANT EMISSION data");
			}
			logDebug("Stop Working on Throughput " + capIDString);
		 }
	}//done with throughput records
//start working on permits
	for (x in permitIds)
	{		ratingCO = 0;
			ratingNOx = 0;
			ratingPM10 = 0;
			ratingSOx = 0;
			ratingVOC = 0;
			var pcap = aa.cap.getCap(permitIds[x]).getOutput();
			var pstatus = pcap.getCapStatus();
			var permcustomId = pcap.getCapModel().getAltID();
			logDebug("pstatus: " + pstatus);
			logDebug("permcustomId: " + permcustomId);

		if(pstatus != "Closed")
		{
		logDebug("Working on Permit " + permcustomId);
		newRatingTable = loadASITable("THROUGHPUT ACTUAL EMISSIONS",permitIds[x]); 
		for (eachrow in newRatingTable)
		{
			if(newRatingTable[eachrow]["Throughput Year"].toString() == String(year))
			{
				ratingCO += new Number(newRatingTable[eachrow]["CO"]);
				ratingNOx += new Number(newRatingTable[eachrow]["NOx"]);
				ratingPM10 += new Number(newRatingTable[eachrow]["PM10"]);
				ratingSOx += new Number(newRatingTable[eachrow]["SOx"]);
				ratingVOC += new Number(newRatingTable[eachrow]["VOC"]);
			}
		}
		var facility = getParentPlacer(permitIds[x]);
		cEmmisionTable = loadASITable("ACTUAL PERMIT EMISSIONS (TPY)",permitIds[x]); 
		if (cEmmisionTable.length > 0)
		{
			permitarrEmission = [];	 
			removeASITable("ACTUAL PERMIT EMISSIONS (TPY)",permitIds[x]); 
			for (eachrow in cEmmisionTable) 
			{
				if(cEmmisionTable[eachrow]["PO Permit"].toString() == String(permcustomId))
					{
						permitarrEmission["CO"] = String(Number(ratingCO).toFixed(10));
						permitarrEmission["NOx"] = String(Number(ratingNOx).toFixed(10));
						logDebug("PratingNOx: " + String(Number(ratingNOx).toFixed(10)));
						permitarrEmission["PM10"] = String(Number(ratingPM10).toFixed(10));
						permitarrEmission["SOx"] = String(Number(ratingSOx).toFixed(10));
						permitarrEmission["VOC"] = String(Number(ratingVOC).toFixed(10));
						permitarrEmission["PO Permit"] = cEmmisionTable[eachrow]["PO Permit"];
						
					}
					else 
					{
						permitarrEmission["CO"] = cEmmisionTable[eachrow]["CO"];
						permitarrEmission["NOx"] = cEmmisionTable[eachrow]["NOx"];
						permitarrEmission["PM10"] = cEmmisionTable[eachrow]["PM10"];
						permitarrEmission["SOx"] = cEmmisionTable[eachrow]["SOx"];
						permitarrEmission["VOC"] = cEmmisionTable[eachrow]["VOC"];
						permitarrEmission["PO Permit"] = cEmmisionTable[eachrow]["PO Permit"];
					}
					addToASITable("ACTUAL PERMIT EMISSIONS (TPY)",permitarrEmission,permitIds[x]);
			}
			
		}
		if (cEmmisionTable.length == 0 || typeof(cEmmisionTable.length) == "undefined")
		{
				parrEmission["CO"] = String(Number(ratingCO).toFixed(10));
				parrEmission["NOx"] = String(Number(ratingNOx).toFixed(10));
				logDebug("2ndratingNOx: " + String(Number(ratingNOx).toFixed(10)));
				parrEmission["PM10"] = String(Number(ratingPM10).toFixed(10));
				parrEmission["SOx"] = String(Number(ratingSOx).toFixed(10));
				parrEmission["VOC"] = String(Number(ratingVOC).toFixed(10));
				parrEmission["PO Permit"] = String(permcustomId);
				

			addToASITable("ACTUAL PERMIT EMISSIONS (TPY)",parrEmission,permitIds[x])
		}
		logDebug("Updating Facility from permit record");
		EmmisionTable = loadASITable("ACTUAL PERMIT EMISSIONS (TPY)",permitIds[x]); 
		var permitcheck = checkpermit(facility,permcustomId);
		var pratingCO = 0;
		var pratingNOx = 0;
		var pratingPM10 = 0;
		var pratingSOx = 0;
		var pratingVOC = 0;
			//calculate new emission factors
			 for (eachrow in EmmisionTable) 
			 {
				 emisrow = EmmisionTable[eachrow]; 
				pratingCO += new Number(emisrow["CO"]);
				pratingNOx += new Number(emisrow["NOx"]);
				pratingPM10 += new Number(emisrow["PM10"]);
				pratingSOx += new Number(emisrow["SOx"]);
				pratingVOC += new Number(emisrow["VOC"]);
			}
			if(permitcheck == "No Match") //add to facility record if not already added
			{
				carrEmission = [];
				carrEmission["CO"] = String(Number(pratingCO).toFixed(10));
				carrEmission["NOx"] = String(Number(pratingNOx).toFixed(10));
				logDebug("3rdratingNOx: " + String(Number(pratingNOx).toFixed(10)));		
				carrEmission["PM10"] = String(Number(pratingPM10).toFixed(10));
				carrEmission["SOx"] = String(Number(pratingSOx).toFixed(10));
				carrEmission["VOC"] = String(Number(pratingVOC).toFixed(10));
				carrEmission["PO Permit"] = String(permcustomId);
				addToASITable("ACTUAL PERMIT EMISSIONS (TPY)",carrEmission,facility);	
			}
			
			if(permitcheck == "Match") //add to facility record if not already added
			{
				fEmmisionTable = loadASITable("ACTUAL PERMIT EMISSIONS (TPY)",facility);
				removeASITable("ACTUAL PERMIT EMISSIONS (TPY)",facility);
				 if (fEmmisionTable.length > 0)
				{
					carrEmission = [];	 
					for (eachrow in fEmmisionTable) 
					{
						if(String(fEmmisionTable[eachrow]["PO Permit"]) == permcustomId)
							{
								carrEmission["CO"] = String(Number(pratingCO).toFixed(10));
								carrEmission["NOx"] = String(Number(pratingNOx).toFixed(10));
								logDebug("4thratingNOx: " + String(Number(pratingNOx).toFixed(10)));				
								carrEmission["PM10"] = String(Number(pratingPM10).toFixed(10));
								carrEmission["SOx"] = String(Number(pratingSOx).toFixed(10));
								carrEmission["VOC"] = String(Number(pratingVOC).toFixed(10));
								carrEmission["PO Permit"] = fEmmisionTable[eachrow]["PO Permit"];
							}
							else 
							{
								carrEmission["CO"] = fEmmisionTable[eachrow]["CO"];
								carrEmission["NOx"] = fEmmisionTable[eachrow]["NOx"];
								carrEmission["PM10"] = fEmmisionTable[eachrow]["PM10"];
								carrEmission["SOx"] = fEmmisionTable[eachrow]["SOx"];
								carrEmission["VOC"] = fEmmisionTable[eachrow]["VOC"];
								carrEmission["PO Permit"] = fEmmisionTable[eachrow]["PO Permit"];
							}
						addToASITable("ACTUAL PERMIT EMISSIONS (TPY)",carrEmission,facility);	
					}
				}
			}//end of match 	
		if(facIds.valueOf().toString().match(facility) == null)
			{
				facIds.push(facility);
			}
			logDebug("Stop Working on Permit " + permcustomId);
	}
	}// done working on permit array
	for (x in facIds)
	{
		var facility = aa.cap.getCap(facIds[x]).getOutput()
		var faccustomId = aa.cap.getCap(facIds[x]).getOutput().getCapModel().getAltID();
		logDebug("Working on Facility record " + faccustomId);
		fnewRatingTable = loadASITable("ACTUAL PERMIT EMISSIONS (TPY)",facIds[x]); 
		var fratingCO = 0;
		var fratingNOx = 0;
		var fratingPM10 = 0;
		var fratingSOx = 0;
		var fratingVOC = 0;
		for (eachrow in fnewRatingTable)
		{
			fratingCO += toNumber(fnewRatingTable[eachrow]["CO"]);
			fratingNOx += toNumber(fnewRatingTable[eachrow]["NOx"]);
			fratingPM10 += toNumber(fnewRatingTable[eachrow]["PM10"]);
			fratingSOx += toNumber(fnewRatingTable[eachrow]["SOx"]);
			fratingVOC += toNumber(fnewRatingTable[eachrow]["VOC"]);
		}
		if(Number(fratingCO) > 0 && Number(fratingCO) < 0.01)
		{
			editAppSpecific("CO Total","0.01",facIds[x])
		}
		else
		{
			editAppSpecific("CO Total",String(Number(fratingCO).toFixed(2)),facIds[x]);	
		}
		if(Number(fratingNOx) > 0 && Number(fratingNOx) < 0.01)
		{
			editAppSpecific("NOx Total","0.01",facIds[x])
		}
		else
		{
			editAppSpecific("NOx Total",String(Number(fratingNOx).toFixed(2)),facIds[x]);	
		}
		
		logDebug("Fac ratingNOx for ASI-emission: " + String(Number(fratingNOx).toFixed(10)));
		
		if(Number(fratingPM10) > 0 && Number(fratingPM10) < 0.01)
		{
			editAppSpecific("PM10 Total","0.01",facIds[x])
		}
		else
		{
			editAppSpecific("PM10 Total",String(Number(fratingPM10).toFixed(2)),facIds[x]);	
		}
		if(Number(fratingSOx) > 0 && Number(fratingSOx) < 0.01)
		{
			editAppSpecific("SOx Total","0.01",facIds[x])
		}
		else
		{
			editAppSpecific("SOx Total",String(Number(fratingSOx).toFixed(2)),facIds[x]);	
		}
		if(Number(fratingVOC) > 0 && Number(fratingVOC) < 0.01)
		{
			editAppSpecific("VOC Total","0.01",facIds[x])
		}
		else
		{
			editAppSpecific("VOC Total",String(Number(fratingVOC).toFixed(2)),facIds[x]);	
		};
		var fachistorycheck = "No Match";
		newRatingTableHistory = loadASITable("ACTUAL PERMIT EMISSIONS HIST",facIds[x]);
			for (eachrow in newRatingTableHistory)
				 {
				if(newRatingTableHistory[eachrow]["YEAR"].toString() == year)
				{
					fachistorycheck = "Match";
				 }
				 }
		if(fachistorycheck == "No Match")				
			{
			 var harrEmission = new Array();
			 harrEmission["CO"] = String(Number(fratingCO).toFixed(10));
			 harrEmission["NOx"] = String(Number(fratingNOx).toFixed(10));
			logDebug("Fac ratingNOx for HIST emission: " + String(Number(fratingNOx).toFixed(10)));
			 harrEmission["PM10"] = String(Number(fratingPM10).toFixed(10));
			 harrEmission["SOx"] = String(Number(fratingSOx).toFixed(10));
			 harrEmission["VOC"] = String(Number(fratingVOC).toFixed(10));
			 harrEmission["YEAR"] = String(year);
			addToASITable("ACTUAL PERMIT EMISSIONS HIST",harrEmission,facIds[x]);
			}
		 	if(fachistorycheck == "Match")				
			{
				harrEmission = [];
				removeASITable("ACTUAL PERMIT EMISSIONS HIST",facIds[x]);
				for (eachrow in newRatingTableHistory)
				 {
				if(newRatingTableHistory[eachrow]["YEAR"].toString() == year)
					 {
						harrEmission["CO"] = String(Number(fratingCO).toFixed(10));
						harrEmission["NOx"] = String(Number(fratingNOx).toFixed(10));
						harrEmission["PM10"] = String(Number(fratingPM10).toFixed(10));
						harrEmission["SOx"] = String(Number(fratingSOx).toFixed(10));
						harrEmission["VOC"] = String(Number(fratingVOC).toFixed(10));
						harrEmission["YEAR"] = String(year);	
					 }
				else
				{
						harrEmission["CO"] = newRatingTableHistory[eachrow]["CO"];
						harrEmission["NOx"] = newRatingTableHistory[eachrow]["NOx"];
						harrEmission["PM10"] = newRatingTableHistory[eachrow]["PM10"];
						harrEmission["SOx"] = newRatingTableHistory[eachrow]["SOx"];
						harrEmission["VOC"] = newRatingTableHistory[eachrow]["VOC"];
						harrEmission["YEAR"] = newRatingTableHistory[eachrow]["YEAR"];
				}
				addToASITable("ACTUAL PERMIT EMISSIONS HIST",harrEmission,facIds[x]);
				
				 }//end of loop
			}// end if matched
			  
	logDebug("Stop Working on Facility record " + faccustomId);
	}
   return capCount;
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
function dateAdd(td, amt){

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
function lookup(stdChoice,stdValue) 	{
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
function getChildren(pCapType, pParentCapId) 	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	var vCapId = pParentCapId;

		
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
		if (isMatch)
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

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
function updateFeeItemInvoiceFlag(feeSeq,finvoice){
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
function editAppSpecific(itemName,itemValue,capId) {
	var itemCap = capId;
	var itemGroup = null;
   	var customId = aa.cap.getCap(itemCap).getOutput().getCapModel().getAltID();
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
		 logDebug(itemName + " was updated to " + itemValue + " for record " + customId);
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue; 
	} 	
	else
		{ logDebug( "WARNING: " + itemName + " was not updated."); }
}	
function getAppSpecific(itemName,itemCap)  {
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
function getChildrencount(pCapType, pParentCapId) {
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	var vCapId = pParentCapId;

		
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
function getThroughputrecords(altid) {
var conn = aa.db.getConnection(); 
 var result = new Array();
 var B1_ALT_ID = "";
 var getSQL = "SELECT B1_ALT_ID FROM B1PERMIT where SERV_PROV_CODE = 'PLACERCO' AND B1_ALT_ID LIKE ? AND REC_STATUS = 'A'";
 var sSelect = conn.prepareStatement(getSQL);
        sSelect.setString(1, altid + '%');
        var rs= sSelect.executeQuery(); 
 while(rs.next())
 {
  B1_ALT_ID = rs.getString("B1_ALT_ID");
 result.push(B1_ALT_ID); 
 }
 rs.close();
 conn.close();
 return result ;
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
			aa.print( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		aa.print( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	}
function loadASITable(tname,itemCap) {
		LASITcapID = aa.cap.getCap(itemCap).getOutput();
		LASITcapIDString = LASITcapID.getCapModel().getAltID();
 	//
 	// Returns a single ASI Table array of arrays
	// Optional parameter, cap ID to load from
	//

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
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();
logDebug("Loading ASI Table " + tname + " for record " + LASITcapIDString);
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
function addASITable(tableName, tableValueArray, itemCap) {
	ASITcapID = aa.cap.getCap(itemCap).getOutput();
		ASITcapIDString = ASITcapID.getCapModel().getAltID();
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object

		var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

		if (!tssmResult.getSuccess()) {
			logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
			return false
		}

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var fld_readonly = tsm.getReadonlyField(); // get Readonly field

	for (thisrow in tableValueArray) {

		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();

			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}
			
			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				//fld_readonly.add(null);
			} else // we are passed a string
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
				fld_readonly.add(null);
			}
		}

		tsm.setTableField(fld);

		tsm.setReadonlyField(fld_readonly);

	}

	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
	} else
		logDebug("Successfully added record to ASI Table: " + tableName + " for Record " + ASITcapIDString);

}
function addASITable4ACAPageFlow(destinationTableGroupModel, tableName, tableValueArray) {
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	//

	var itemCap = capId
		if (arguments.length > 3)
			itemCap = arguments[3]; // use cap ID specified in args

		var ta = destinationTableGroupModel.getTablesMap().values();
	var tai = ta.iterator();

	var found = false;
	while (tai.hasNext()) {
		var tsm = tai.next(); // com.accela.aa.aamain.appspectable.AppSpecificTableModel
		if (tsm.getTableName().equals(tableName)) {
			found = true;
			break;
		}
	}

	if (!found) {
		logDebug("cannot update asit for ACA, no matching table name");
		return false;
	}

	var i = -1; // row index counter
	if (tsm.getTableFields() != null) {
		i = 0 - tsm.getTableFields().size()
	}

	for (thisrow in tableValueArray) {
		var fld = aa.util.newArrayList(); // had to do this since it was coming up null.
		var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();
			
			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue ? tableValueArray[thisrow][colname.getColumnName()].fieldValue : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);

			} else // we are passed a string
			{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()] ? tableValueArray[thisrow][colname.getColumnName()] : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");

			}
		}

		i--;

		if (tsm.getTableFields() == null) {
			tsm.setTableFields(fld);
		} else {
			tsm.getTableFields().addAll(fld);
		}

		if (tsm.getReadonlyField() == null) {
			tsm.setReadonlyField(fld_readonly); // set readonly field
		} else {
			tsm.getReadonlyField().addAll(fld_readonly);
		}
	}

	tssm = tsm;
	return destinationTableGroupModel;
}	
function logGlobals(globArray) {

	for (loopGlob in globArray)
		logDebug("{" + loopGlob + "} = " + globArray[loopGlob])
	}
function logMessage(dstr) {
	message+=dstr;
	}
function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;
	this.hasValue = Boolean(fieldValue != null & fieldValue != "");

	asiTableValObj.prototype.toString=function(){ return this.hasValue ? String(this.fieldValue) : String(""); }
}; 	
function addToASITable(tableName,tableValues,itemCap) {
		ASITcapID = aa.cap.getCap(itemCap).getOutput();
		ASITcapIDString = ASITcapID.getCapModel().getAltID();
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object

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

		if (!tableValues[colname.getColumnName()]) {
			logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
			tableValues[colname.getColumnName()] = "";
			}
		
		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined")
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

	tsm.setTableField(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field

	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
	if (!addResult .getSuccess())
		{ logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
	else
		aa.print("Successfully added record to ASI Table: " + tableName + " for record " + ASITcapIDString);
	}
function removeASITable(tableName,itemCap) {
		RASITcapID = aa.cap.getCap(itemCap).getOutput();
		RASITcapIDString = RASITcapID.getCapModel().getAltID();
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements MUST be strings.

	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,itemCap,currentUserID)

	if (!tssmResult.getSuccess())
		{ aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
        else
	aa.print("Successfully removed all rows from ASI Table: " + tableName + " for record " + RASITcapIDString);

	}
function checkthroughput(permitId,trecord,tyear) {
			var result = "No Match";
			var TAE = loadASITable("THROUGHPUT ACTUAL EMISSIONS",permitId);
			for (x in TAE)
			{
				emisrow = TAE[x]
				if(emisrow["Throughput record"].toString() == String(trecord) && emisrow["Throughput Year"].toString() == String(tyear))
				{
					result = "Match"
				}
			}
			return result
		}
function checkpermit(capid,recordid) {
			var result = "No Match";
			var TAE = loadASITable("ACTUAL PERMIT EMISSIONS (TPY)",capid);
			for (x in TAE)
			{
				emisrow = TAE[x]
				if(emisrow["PO Permit"].toString() == String(recordid))
				{
					result = "Match"
				}
			}
			return result
		}	
function checkhistory(capId,year) {
			var result = "No Match";
			var TAE = loadASITable("ACTUAL PERMIT EMISSIONS HIST",capId);
			for (x in TAE)
			{
				emisrow = TAE[x]
				if(emisrow["YEAR"].toString() == String(year))
				{
					result = "Match"
				}
			}
			return result
		}		
function deleteASITrow(arr, column_name, value) {
for(var i = 0; i < arr.length; i++)
{
if (String(arr[i][column_name]) == String(value)) {
    arr.splice(i, 1);
  }
}
return arr
}
function toNumber(val) {
	if (val == null || val === "" || isNaN(val))
		return 0;
	return Number(val);
}




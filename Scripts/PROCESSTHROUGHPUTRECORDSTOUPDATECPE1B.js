/*------------------------------------------------------------------------------------------------------/
| Program: ProcessThroughputRecordstoupdateCPE  Trigger: Batch - STEP2 
| Client : Placer Air Quaility
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
var showDebug = true; 				// Set to true to see debug messages in event log and email confirmation
var maxSeconds = 15 * 60; 			// number of seconds allowed for batch processing, usually < 5*60
var documentOnly = false; 			// Document Only -- displays hierarchy of std choice steps
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
var emailAddress2 = "rmoore@placer.ca.gov";                                             // CC email address of the person who will receive the batch script log information
var emailText = "";                                                                     // Email body
//Parameter variables
var paramsOK = true;
//var TPvalue="TP22";
var TPvalue = aa.env.getValue("Throughput");
var currentUserID = "ADMIN";
var ratingCO = 0;
var ratingNOx = 0;
var ratingPM10 = 0;
var ratingSOx = 0;
var ratingVOC = 0;
var permitIds = [];
var facIds = [];
var parrEmission = [];
var message = "";
var debug = "";

/*------------------------------------------------------------------------------------------------------/
| END: Batch Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/

if (paramsOK) {
    logMessage("START", "Start of Sending of Permit Batch Job.");

    var licAboutToExpCnt = aboutExpLics();

    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of Sending of Permit Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for ProcessThroughputRecordstoupdateCPE", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() 
{
    var capCount = 0;
//var thru = [];
//thru.push("TP22-REPR-20-03-01");


	var thru = getThroughputrecords(TPvalue);

	for (x in thru)
	{
		var capIDString = thru[x];
		var thrucapId = aa.cap.getCapID(thru[x]).getOutput();
		var pcap = aa.cap.getCap(thrucapId).getOutput();
		var pcapType = pcap.getCapType().toString();
		var arrEmission = []; 
		appType = pcapType.split("/");
		var process = aa.cap.getProjectByChildCapID(thrucapId,null, null).getOutput();
		var permit = getParentPlacer(process[0].getProjectID());

		logDebug("Working on Throughput " + capIDString);

if(matches(appType[3],"Dry Cleaning"))
	{
		var arrEmissionDRY = []; 
		var PRDRY  = CalcTotalHours(thrucapId);
		var CPEDRY = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEDRY.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId)
			for (x in CPEDRY)
			{
				emisrowDRY = CPEDRY[x]; 
				var PollutantDRY = emisrowDRY["Pollutant"].toString();
				var EF1GDRY = emisrowDRY["EF (lbs./Gal Solvent)"].toString();
				//var EF1HDRY = emisrowDRY["EF Hourly Rate (lbs/hr)"].toString();
				var EFORGDRY = emisrowDRY["EF Origin Code"].toString();
				var HARPDRY = emisrowDRY["HARP EF"].toString();
				var CEDRY = emisrowDRY["Control Efficiency"].toString();
				var EFNOTEDRY = emisrowDRY["EF Note/Memo"].toString();
				var AELBSDRY = emisrowDRY["Annual Emissions (lbs)"].toString();
				var AEOLBDRY = emisrowDRY["Annual Emissions Override (lbs)"].toString();
				var AETONSDRY = emisrowDRY["Annual Emissions (tons)"].toString();
				var CALCDRY = emisrowDRY["Calculation Method"].toString();
				var EMISLIMDRY = emisrowDRY["Emissions Limit"].toString();
				//var LASTUPDATE = emisrowCOFF["Last Update"];
				//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
				
				if(PollutantDRY == "Volatile Organic Compounds (VOC)")
				{
					EF1GDRY = "6.401";
				}
				if(EF1GDRY != null && EF1GDRY != "" && EF1GDRY != " ")
				{
					AELBSDRY = String(Number(EF1GDRY *PRDRY).toFixed(2));
					HARPDRY = String(EF1GDRY);
				}
				if(AEOLBDRY != null && AEOLBDRY != "" && AEOLBDRY != " " )
				{
					AETONSDRY = Number(String(AEOLBDRY / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSDRY = Number(String(AELBSDRY/ 2000)).toFixed(10).toString();
				}

				
			arrEmissionDRY["Pollutant"] = String(PollutantDRY);
			arrEmissionDRY["EF (lbs./Gal Solvent)"] = String(EF1GDRY);
			//arrEmissionDRY["EF Hourly Rate (lb/hr)"] = String(EF1HDRY);
			arrEmissionDRY["EF Origin Code"] = String(EFORGDRY);
			arrEmissionDRY["HARP EF"] = String(HARPDRY);
			if(CEDRY != null && CEDRY != "")
			{
			arrEmissionDRY["Control Efficiency"] = String(CEDRY);
			}
			else
			{
			arrEmissionDRY["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEDRY != null && EFNOTEDRY != "")
			{
			arrEmissionDRY["EF Note/Memo"] = String(EFNOTEDRY);
			}
			else
			{
			arrEmissionDRY["EF Note/Memo"] = String(" ");	
			}
			arrEmissionDRY["Annual Emissions (lbs)"] = String(AELBSDRY);
			if(AEOLBDRY != null && AEOLBDRY != "" && AEOLBDRY != " ")
			{
			arrEmissionDRY["Annual Emissions Override (lbs)"] = String(AEOLBDRY);
			}
			else
			{
			arrEmissionDRY["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionDRY["Annual Emissions (tons)"] = String(AETONSDRY);
			arrEmissionDRY["Calculation Method"] = String(CALCDRY);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionDRY,thrucapId);
				
				
		}//end of Table loop
			; 
		}//end of table if statement
		
		
		
		if (CPEDRY.length == 0 || typeof(CPEDRY.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++
		
	}//End of DRY If statement


if(matches(appType[3],"Miscellaneous Combustion"))
	{
		var arrEmissionMISCC = [];
		var MHIRMISCC = getAppSpecific("Max Heat Input Rating (MMBtu/hr)",thrucapId);
		var HRSORFUEL = getAppSpecific("Hours or Fuel",thrucapId);
		var TAHEU = getAppSpecific("Total Annual Hours Equipment Used",thrucapId);

		var CPEMISCC = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEMISCC.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			for (x in CPEMISCC)
			{
				emisrowMISCC = CPEMISCC[x]; 
				var PollutantMISCC = emisrowMISCC["Pollutant"].toString();
				var EF1GMISCC = emisrowMISCC["EF1 (lb/MMBtu)"].toString();
				var EF1HMISCC = emisrowMISCC["EF1 Hourly Rate (lbs/hr)"].toString();
				var EFORGMISCC = emisrowMISCC["EF Origin Code"].toString();
				var HARPMISCC = emisrowMISCC["HARP EF"].toString();
				var CEMISCC = emisrowMISCC["Control Efficiency"].toString();
				var EFNOTEMISCC = emisrowMISCC["EF Note/Memo"].toString();
				var AELBSMISCC = emisrowMISCC["Annual Emissions (lbs)"].toString();
				var AEOLBMISCC = emisrowMISCC["Annual Emissions Override (lbs)"].toString();
				var AETONSMISCC = emisrowMISCC["Annual Emissions (tons)"].toString();
				var CALCMISCC = emisrowMISCC["Calculation Method"].toString();
				var EMISLIMMISCC = emisrowMISCC["Emissions Limit"].toString();
				EF1HMISCC = String(Number(EF1GMISCC * MHIRMISCC).toFixed(5));
				HARPMISCC = String(Number(EF1GMISCC).toFixed(5));
				
				
				if(HRSORFUEL == "Hours")
				{
					AELBSMISCC = String(Number(EF1HMISCC * TAHEU).toFixed(5));
				}
				else
				{
					AELBSMISCC = String(Number(EF1GMISCC * MHIRMISCC).toFixed(5));
				}
				if(AEOLBMISCC != null && AEOLBMISCC != "" && AEOLBMISCC != " " )
				{
					AETONSMISCC = Number(String(AEOLBMISCC / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSMISCC = Number(String(AELBSMISCC/ 2000)).toFixed(10).toString();
				}

				
			arrEmissionMISCC ["Pollutant"] = String(PollutantMISCC);
			arrEmissionMISCC ["EF1 (lb/MMBtu)"] = String(EF1GMISCC);
			arrEmissionMISCC ["EF1 Hourly Rate (lbs/hr)"] = String(EF1HMISCC);
			arrEmissionMISCC ["EF Origin Code"] = String(EFORGMISCC);
			arrEmissionMISCC ["HARP EF"] = String(HARPMISCC);
			if(CEMISCC != null && CEMISCC != "")
			{
			arrEmissionMISCC ["Control Efficiency"] = String(CEMISCC);
			}
			else
			{
			arrEmissionMISCC ["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEMISCC != null && EFNOTEMISCC != "")
			{
			arrEmissionMISCC ["EF Note/Memo"] = String(EFNOTEMISCC);
			}
			else
			{
			arrEmissionMISCC ["EF Note/Memo"] = String(" ");	
			}
			arrEmissionMISCC ["Annual Emissions (lbs)"] = String(AELBSMISCC);
			if(AEOLBMISCC != null && AEOLBMISCC != "" && AEOLBMISCC != " ")
			{
			arrEmissionMISCC ["Annual Emissions Override (lbs)"] = String(AEOLBMISCC);
			}
			else
			{
			arrEmissionMISCC ["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionMISCC ["Annual Emissions (tons)"] = String(AETONSMISCC);
			arrEmissionMISCC ["Calculation Method"] = String(CALCMISCC);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionMISCC,thrucapId);
				
				
		}//end of Table loop
			 
		}//end of table if statement
		
		
		
		if (CPEMISCC.length == 0 || typeof(CPEMISCC.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++
		
	}//End of MISCC If statement

if(matches(appType[3],"Miscellaneous VOCs"))
	{
		calc_total_MISCVOC1 = CalcTotalHours1(thrucapId);
		calc_total_MISCVOC = CalcTotalHours(thrucapId);

		var arrEmissionMISCVOC = [];
		var CPEMISCVOC = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEMISCVOC.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId); 
			for (x in CPEMISCVOC)
			{
				emisrowMISCVOC = CPEMISCVOC[x]; 
				var PollutantMISCVOC = emisrowMISCVOC["Pollutant"].toString();
				var EF1GMISCVOC = emisrowMISCVOC["EF (lbs/gal)"].toString();
				//var EF1HMISCVOC = emisrowMISCVOC["EF1 Hourly Rate (lbs/hr)"].toString();
				var EFORGMISCVOC = emisrowMISCVOC["EF Origin Code"].toString();
				var HARPMISCVOC = emisrowMISCVOC["HARP EF"].toString();
				var CEMISCVOC = emisrowMISCVOC["Control Efficiency"].toString();
				var EFNOTEMISCVOC = emisrowMISCVOC["EF Note/Memo"].toString();
				var AELBSMISCVOC = emisrowMISCVOC["Annual Emissions (lbs)"].toString();
				var AEOLBMISCVOC = emisrowMISCVOC["Annual Emissions Override (lbs)"].toString();
				var AETONSMISCVOC = emisrowMISCVOC["Annual Emissions (tons)"].toString();
				var CALCMISCVOC = emisrowMISCVOC["Calculation Method"].toString();
				var EMISLIMMISCVOC = emisrowMISCVOC["Emissions Limit"].toString();
				//var LASTUPDATE = emisrowMISCVOC["Last Update"];
				//var TRANSACTIONDATE = emisrowMISCVOC ["Transaction Date"];
				if(calc_total_MISCVOC == 0.0000)
				{
					EF1GMISCVOC = 0;
					HARPMISCVOC = 0;
				}
				else
				{
					EF1GMISCVOC = String(Number(calc_total_MISCVOC1 /calc_total_MISCVOC).toFixed(4));
					HARPMISCVOC = String(Number(EF1GMISCVOC).toFixed(5));
				}
					AETONSMISCVOC = String(Number(String(calc_total_MISCVOC1 /2000)).toFixed(10));
					AELBSMISCVOC = String(Number(String(calc_total_MISCVOC1)).toFixed(2));

				
				if(AEOLBMISCVOC != null && AEOLBMISCVOC != "" && AEOLBMISCVOC != " ")
				{
					AETONSMISCVOC = String(Number(AEOLBMISCVOC / 2000).toFixed(10));
				}
				
				
			arrEmissionMISCVOC["Pollutant"] = String(PollutantMISCVOC);
			arrEmissionMISCVOC["EF (lbs/gal)"] = String(EF1GMISCVOC);
			//arrEmissionMISCVOC["EF1 Hourly Rate (lbs/hr)"] = String(EF1HMISCVOC);
			arrEmissionMISCVOC["EF Origin Code"] = String(EFORGMISCVOC);
			arrEmissionMISCVOC["HARP EF"] = String(HARPMISCVOC);
			if(CEMISCVOC != null && CEMISCVOC != "")
			{
			arrEmissionMISCVOC["Control Efficiency"] = String(CEMISCVOC);
			}
			else
			{
			arrEmissionMISCVOC["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEMISCVOC != null && EFNOTEMISCVOC != "")
			{
			arrEmissionMISCVOC["EF Note/Memo"] = String(EFNOTEMISCVOC);
			}
			else
			{
			arrEmissionMISCVOC["EF Note/Memo"] = String(" ");	
			}
			arrEmissionMISCVOC["Annual Emissions (lbs)"] = String(AELBSMISCVOC);
			if(AEOLBMISCVOC != null && AEOLBMISCVOC != "" && AEOLBMISCVOC != " ")
			{
			arrEmissionMISCVOC["Annual Emissions Override (lbs)"] = String(AEOLBMISCVOC);
			}
			else
			{
			arrEmissionMISCVOC["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionMISCVOC["Annual Emissions (tons)"] = String(AETONSMISCVOC);
			arrEmissionMISCVOC["Calculation Method"] = String(CALCMISCVOC);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionMISCVOC,thrucapId);
				
				
		}//end of Table loop
			
		}//end of table if statement
		
		
		
		if (CPEMISCVOC.length == 0 || typeof(CPEMISCVOC.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++

				
	
		
		
	
		
	}//End of MISCVOC If statement

if(matches(appType[3],"Vapor Extraction"))
	{
		var Total_hours_VAPOR = CalcTotalHours(thrucapId);
		var arrEmissionVAPOR = [];
		var CPEVAPOR = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEVAPOR.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			for (x in CPEVAPOR)
			{
				emisrowVAPOR = CPEVAPOR[x]; 
				var PollutantVAPOR = emisrowVAPOR["Pollutant"].toString();
				var EF1GVAPOR = emisrowVAPOR["EF (lbs/day)"].toString();
				var EF1HVAPOR = emisrowVAPOR["EF Hourly Rate (lbs/hr)"].toString();
				var EFORGVAPOR = emisrowVAPOR["EF Origin Code"].toString();
				var HARPVAPOR = emisrowVAPOR["HARP EF"].toString();
				var CEVAPOR = emisrowVAPOR["Control Efficiency"].toString();
				var EFNOTEVAPOR = emisrowVAPOR["EF Note/Memo"].toString();
				var AELBSVAPOR = emisrowVAPOR["Annual Emissions (lbs)"].toString();
				var AEOLBVAPOR = emisrowVAPOR["Annual Emissions Override (lbs)"].toString();
				var AETONSVAPOR = emisrowVAPOR["Annual Emissions (tons)"].toString();
				var CALCVAPOR = emisrowVAPOR["Calculation Method"].toString();
				var EMISLIMVAPOR = emisrowVAPOR["Emissions Limit"].toString();
				//var LASTUPDATE = emisrowCOFF["Last Update"];
				//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
				EF1HVAPOR = String(Number(EF1GVAPOR /24 ).toFixed(5));
				if(Total_hours_VAPOR != 0.00) 
				{
					AELBSVAPOR = String(Number(Number(EF1HVAPOR) *Number(Total_hours_VAPOR).toFixed(3)));
				}
				
				if(AEOLBVAPOR != null && AEOLBVAPOR != "" && AEOLBVAPOR != " " )
				{
					AETONSVAPOR = Number(String(AEOLBVAPOR / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSVAPOR = Number(String(AELBSVAPOR/ 2000)).toFixed(10).toString();
				}
				
				
			arrEmissionVAPOR["Pollutant"] = String(PollutantVAPOR);
			arrEmissionVAPOR["EF (lbs/day)"] = String(EF1GVAPOR);
			arrEmissionVAPOR["EF Hourly Rate (lbs/hr)"] = String(EF1HVAPOR);
			arrEmissionVAPOR["EF Origin Code"] = String(EFORGVAPOR);
			arrEmissionVAPOR["HARP EF"] = String(HARPVAPOR);
			if(CEVAPOR != null && CEVAPOR != "")
			{
			arrEmissionVAPOR["Control Efficiency"] = String(CEVAPOR);
			}
			else
			{
			arrEmissionVAPOR["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEVAPOR != null && EFNOTEVAPOR != "")
			{
			arrEmissionVAPOR["EF Note/Memo"] = String(EFNOTEVAPOR);
			}
			else
			{
			arrEmissionVAPOR["EF Note/Memo"] = String(" ");	
			}
			arrEmissionVAPOR["Annual Emissions (lbs)"] = String(AELBSVAPOR);
			if(AEOLBVAPOR != null && AEOLBVAPOR != ""  && AEOLBVAPOR != " ")
			{
			arrEmissionVAPOR["Annual Emissions Override (lbs)"] = String(AEOLBVAPOR);
			}
			else
			{
			arrEmissionVAPOR["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionVAPOR["Annual Emissions (tons)"] = String(AETONSVAPOR);
			arrEmissionVAPOR["Calculation Method"] = String(CALCVAPOR);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionVAPOR,thrucapId);
				
				
		}//end of Table loop
			 
		}//end of table if statement
		
		
		
		if (CPEVAPOR.length == 0 || typeof(CPEVAPOR.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++

				
	
		
		
	
		
	}//End of VAPOR If statement


if(matches(appType[3],"Aggregate Processing","Biomass Processing"))
	{
		var Total_hours_AGG = CalcTotalHours(thrucapId);
		var STMPA = Calcqtr(thrucapId);
		var arrEmissionAGG = [];
		var CPEAGG = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEAGG.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			for (x in CPEAGG)
			{
				emisrowAGG = CPEAGG[x]; 
				var PollutantAGG = emisrowAGG["Pollutant"].toString();
				var EF1GAGG = emisrowAGG["EF1 (lbs/ton (material processed))"].toString();
				var EF1HAGG = emisrowAGG["EF1 Hourly Rate (lbs/hr)"].toString();
				var EFORGAGG = emisrowAGG["EF Origin Code"].toString();
				var HARPAGG = emisrowAGG["HARP EF"].toString();
				var CEAGG = emisrowAGG["Control Efficiency"].toString();
				var EFNOTEAGG = emisrowAGG["EF Note/Memo"].toString();
				var AELBSAGG = emisrowAGG["Annual Emissions (lbs)"].toString();
				var AEOLBAGG = emisrowAGG["Annual Emissions Override (lbs)"].toString();
				var AETONSAGG = emisrowAGG["Annual Emissions (tons)"].toString();
				var CALCAGG = emisrowAGG["Calculation Method"].toString();
				var EMISLIMAGG = emisrowAGG["Emissions Limit"].toString();
				//var LASTUPDATE = emisrowCOFF["Last Update"];
				//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
				if(Number(Total_hours_AGG) == 0)
				{
				EF1HAGG = 0;
				}
				else
				{
				EF1HAGG = String(Number(String((EF1GAGG * STMPA) /Total_hours_AGG)).toFixed(5));
				}
				
				AELBSAGG = String(Number(EF1HAGG * Total_hours_AGG).toFixed(5));
				
				
				
				if(AEOLBAGG != null && AEOLBAGG != "" && AEOLBAGG != " " )
				{
					AETONSAGG = Number(String(AEOLBAGG / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSAGG = Number(String(AELBSAGG/ 2000)).toFixed(10).toString();
				}
				
			arrEmissionAGG["Pollutant"] = String(PollutantAGG);
			arrEmissionAGG["EF1 (lbs/ton (material processed))"] = String(EF1GAGG);
			arrEmissionAGG["EF1 Hourly Rate (lbs/hr)"] = String(EF1HAGG);
			arrEmissionAGG["EF Origin Code"] = String(EFORGAGG);
			arrEmissionAGG["HARP EF"] = String(HARPAGG);
			if(CEAGG != null && CEAGG != "")
			{
			arrEmissionAGG["Control Efficiency"] = String(CEAGG);
			}
			else
			{
			arrEmissionAGG["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEAGG != null && EFNOTEAGG != "")
			{
			arrEmissionAGG["EF Note/Memo"] = String(EFNOTEAGG);
			}
			else
			{
			arrEmissionAGG["EF Note/Memo"] = String(" ");	
			}
			arrEmissionAGG["Annual Emissions (lbs)"] = String(AELBSAGG);
			if(AEOLBAGG != null && AEOLBAGG != "" && AEOLBAGG != " " && AEOLBAGG != "  ")
			{
			arrEmissionAGG["Annual Emissions Override (lbs)"] = String(AEOLBAGG);
			}
			else
			{
			arrEmissionAGG["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionAGG["Annual Emissions (tons)"] = String(AETONSAGG);
			arrEmissionAGG["Calculation Method"] = String(CALCAGG);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionAGG,thrucapId);
				
				
		}//end of Table loop
			 
		}//end of table if statement
		
		
		
		if (CPEAGG.length == 0 || typeof(CPEAGG.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++

				
	
		
		
	
		
	}//End of AGG If statement

if(matches(appType[3],"Asphalt"))
	{
		var Total_hours_ASPH = CalcTotalHours(thrucapId);
		var TACP = CalcAsphaltprod(thrucapId);
		var arrEmissionASPH = [];		
		var CPEASPH = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEASPH.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId); 
			for (x in CPEASPH)
			{
				emisrowASPH = CPEASPH[x]; 
				var PollutantASPH = emisrowASPH["Pollutant"].toString();
				var EF1GASPH = emisrowASPH["EF1 (lbs/Ton (Asphalt Production))"].toString();
				var EF1HASPH = emisrowASPH["EF1 Hourly Rate (lbs/hr)"].toString();
				var EFORGASPH = emisrowASPH["EF Origin Code"].toString();
				var HARPASPH = emisrowASPH["HARP EF"].toString();
				var CEASPH = emisrowASPH["Control Efficiency"].toString();
				var EFNOTEASPH = emisrowASPH["EF Note/Memo"].toString();
				var AELBSASPH = emisrowASPH["Annual Emissions (lbs)"].toString();
				var AEOLBASPH = emisrowASPH["Annual Emissions Override (lbs)"].toString();
				var AETONSASPH = emisrowASPH["Annual Emissions (tons)"].toString();
				var CALCASPH = emisrowASPH["Calculation Method"].toString();
				var EMISLIMASPH = emisrowASPH["Emissions Limit"].toString();
				//var LASTUPDATE = emisrowCOFF["Last Update"];
				//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
				EF1HASPH = Number(String((EF1GASPH * TACP) /Total_hours_ASPH)).toFixed(5).toString();
				
				AELBSASPH = String(Number(EF1HASPH * Total_hours_ASPH).toFixed(5));
				
				if(AEOLBASPH != null && AEOLBASPH != "" && AEOLBASPH != " " )
				{
					AETONSASPH = Number(String(AEOLBASPH / 2000)).toFixed(10).toString();
				}
				else
				{
				logDebug("TestHERE: EF1GASPH =" + Number(String(AELBSASPH/ 2000)).toFixed(10).toString() );				
					
					AETONSASPH = Number(String(AELBSASPH/ 2000)).toFixed(10).toString();
				} 
			logDebug("Test1: EF1GASPH =" + EF1GASPH );				
			arrEmissionASPH["Pollutant"] = String(PollutantASPH);
			arrEmissionASPH["EF1 (lbs/Ton (Asphalt Production))"] = String(EF1GASPH);
			arrEmissionASPH["EF1 Hourly Rate (lbs/hr)"] = String(EF1HASPH);
			arrEmissionASPH["EF Origin Code"] = String(EFORGASPH);
			arrEmissionASPH["HARP EF"] = String(HARPASPH);
			if(CEASPH != null && CEASPH != "")
			{
			arrEmissionASPH["Control Efficiency"] = String(CEASPH);
			}
			else
			{
			arrEmissionASPH["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEASPH != null && EFNOTEASPH != "")
			{
			arrEmissionASPH["EF Note/Memo"] = String(EFNOTEASPH);
			}
			else
			{
			arrEmissionASPH["EF Note/Memo"] = String(" ");	
			}
			arrEmissionASPH["Annual Emissions (lbs)"] = String(AELBSASPH);
			if(AEOLBASPH != null && AEOLBASPH != "" && AEOLBASPH != "")
			{
			arrEmissionASPH["Annual Emissions Override (lbs)"] = String(AEOLBASPH);
			}
			else
			{
			arrEmissionASPH["Annual Emissions Override (lbs)"] = String(" ");	
			}
			logDebug("Test2: AETONSASPH =" + AETONSASPH );
			arrEmissionASPH["Annual Emissions (tons)"] = String(AETONSASPH);
			arrEmissionASPH["Calculation Method"] = String(CALCASPH);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionASPH,thrucapId);
				
				
		}//end of Table loop
			
		}//end of table if statement
		
		
		
		if (CPEASPH.length == 0 || typeof(CPEASPH.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++

				
	
		
		
	
		
	}//End of ASPH If statement
	
if(matches(appType[3],"Wastewater Treatment Plant"))
	{
		var Total_hours_WAST = CalcTotalHours(thrucapId);
		var arrEmissionWAST = [];
		
		var CPEWAST = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEWAST.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			for (x in CPEWAST)
			{
				emisrowWAST = CPEWAST[x]; 
				var PollutantWAST = emisrowWAST["Pollutant"].toString();
				var EF1GWAST = emisrowWAST["EF (lbs/ton)"].toString();
				var EF1HWAST = emisrowWAST["EF Hourly Rate (lbs/hr)"].toString();
				var EFORGWAST = emisrowWAST["EF Origin Code"].toString();
				var HARPWAST = emisrowWAST["HARP EF"].toString();
				var CEWAST = emisrowWAST["Control Efficiency"].toString();
				var EFNOTEWAST = emisrowWAST["EF Note/Memo"].toString();
				var AELBSWAST = emisrowWAST["Annual Emissions (lbs)"].toString();
				var AEOLBWAST = emisrowWAST["Annual Emissions Override (lbs)"].toString();
				var AETONSWAST = emisrowWAST["Annual Emissions (tons)"].toString();
				var CALCWAST = emisrowWAST["Calculation Method"].toString();
				var EMISLIMWAST = emisrowWAST["Emissions Limit"].toString();
				//var LASTUPDATE = emisrowCOFF["Last Update"];
				//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
				EF1HWAST = String(Number(EF1GWAST / Total_hours_WAST ).toFixed(3));
				
				AELBSWAST = String(Number(EF1HWAST * Total_hours_WAST).toFixed(5));
				
				if(AEOLBWAST != null && AEOLBWAST != "" && AEOLBWAST != " " )
				{
					AETONSWAST = Number(String(AEOLBWAST / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSWAST = Number(String(AELBSWAST/ 2000)).toFixed(10).toString();
				}  
				
			arrEmissionWAST["Pollutant"] = String(PollutantWAST);
			arrEmissionWAST["EF (lbs./year)"] = String(EF1GWAST);
			arrEmissionWAST["EF Hourly Rate (lbs/hr)"] = String(EF1HWAST);
			arrEmissionWAST["EF Origin Code"] = String(EFORGWAST);
			arrEmissionWAST["HARP EF"] = String(HARPWAST);
			if(CEWAST != null && CEWAST != "")
			{
			arrEmissionWAST["Control Efficiency"] = String(CEWAST);
			}
			else
			{
			arrEmissionWAST["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEWAST != null && EFNOTEWAST != "")
			{
			arrEmissionWAST["EF Note/Memo"] = String(EFNOTEWAST);
			}
			else
			{
			arrEmissionWAST["EF Note/Memo"] = String(" ");	
			}
			arrEmissionWAST["Annual Emissions (lbs)"] = String(AELBSWAST);
			if(AEOLBWAST != null && AEOLBWAST != "" && AEOLBWAST != " ")
			{
			arrEmissionWAST["Annual Emissions Override (lbs)"] = String(AEOLBWAST);
			}
			else
			{
			arrEmissionWAST["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionWAST["Annual Emissions (tons)"] = String(AETONSWAST);
			arrEmissionWAST["Calculation Method"] = String(CALCWAST);
		addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionWAST,thrucapId);
				
				
		}//end of Table loop
			 
		}//end of table if statement
		
		
		
		if (CPEWAST.length == 0 || typeof(CPEWAST.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++

				
	
		
		
	
		
	}//End of WAST If statement	

/*
if(matches(appType[3],"Abrasive Materials"))  //RM
	{
		var arrEmissionAB = []; 
		//d
//		var PRAB  = //CalcTotalHours(thrucapId);
		var PRAB = getAppSpecific("Abrasive pounds/year",thrucapId);
		logDebug("PRAB: " + PRAB);
		var CPEAB = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
		if(CPEAB.length > 0)
		{	
			removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			for (x in CPEAB)
			{
				emisrowAB = CPEAB[x]; 
				var PollutantAB = emisrowAB["Pollutant"].toString();
				var EF1GAB = emisrowAB["EF (lb/lb processed)"].toString();
				var EF1HAB = emisrowAB["EF Hourly Rate (lb/hr)"].toString();

				var EFORGAB = emisrowAB["EF Origin Code"].toString();
				var HARPAB = emisrowAB["HARP EF"].toString();
				var CEAB = emisrowAB["Control Efficiency"].toString();
				var EFNOTEAB = emisrowAB["EF Note/Memo"].toString();
				var AELBSAB = emisrowAB["Annual Emissions (lbs)"].toString();
				var AEOLBAB = emisrowAB["Annual Emissions Override (lbs)"].toString();
				var AETONSAB = emisrowAB["Annual Emissions (tons)"].toString();
				var CALCAB = emisrowAB["Calculation Method"].toString();
				var EMISLIMAB = emisrowAB["Emissions Limit"].toString();
				

				if(EF1GAB != null && EF1GAB != "" && EF1GAB != " "&& EF1GAB != "  ")
				{
					AELBSAB = String(Number(EF1GAB *PRAB).toFixed(2));
					HARPAB = String(EF1GAB);
				}
				if(AEOLBAB != null && AEOLBAB != "" && AEOLBAB != " "&& AEOLBAB != "  " )
				{
					AETONSAB = Number(String(AEOLBAB / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSAB = Number(String(AELBSAB/ 2000)).toFixed(10).toString();
				}

				logDebug("PollutantAB: "+ PollutantAB);
				logDebug("EF1GAB: " + EF1GAB);			
				logDebug("EFORGAB: " + EFORGAB);
				logDebug("HARPAB: "+ HARPAB);
				logDebug("CEAB: "+CEAB);
				logDebug("EFNOTEAB: "+ EFNOTEAB);
				logDebug("AELBSAB: "+AELBSAB);
				logDebug("AEOLBAB: "+AEOLBAB);
				logDebug("AETONSAB: "+ AETONSAB);
				logDebug("CALCAB: "+ CALCAB);
				logDebug("EMISLIMAB: "+ EMISLIMAB);


			arrEmissionAB["Pollutant"] = String(PollutantAB);
			arrEmissionAB["EF (lb/lb processed)"]= String(EF1GAB);
			arrEmissionAB["EF Hourly Rate (lb/hr)"] = String(EF1HAB);
			arrEmissionAB["EF Origin Code"] = String(EFORGAB);
			arrEmissionAB["HARP EF"] = String(HARPAB);
			if(CEDRY != null && CEAB != "")
			{
			arrEmissionAB["Control Efficiency"] = String(CEAB);
			}
			else
			{
			arrEmissionAB["Control Efficiency"] = String(" ");	
			}
			if(EFNOTEAB != null && EFNOTEAB != "")
			{
			arrEmissionAB["EF Note/Memo"] = String(EFNOTEAB);
			}
			else
			{
			arrEmissionAB["EF Note/Memo"] = String(" ");	
			}
			arrEmissionAB["Annual Emissions (lbs)"] = String(AELBSAB);
			if(AEOLBAB != null && AEOLBAB != "" && AEOLBAB != " ")
			{
			arrEmissionAB["Annual Emissions Override (lbs)"] = String(AEOLBAB);
			}
			else
			{
			arrEmissionAB["Annual Emissions Override (lbs)"] = String(" ");	
			}
			arrEmissionAB["Annual Emissions (tons)"] = String(AETONSAB);
			arrEmissionAB["Calculation Method"] = String(CALCAB);
			addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionAB,thrucapId);
				
				
		}//end of Table loop
			; 
		}//end of table if statement
		
		
		
		if (CPEAB.length == 0 || typeof(CPEAB.length) == "undefined")
		{
			
			logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
		}

			logDebug("Stop Working on Throughput " + capIDString);
		 capCount++
		
	}//End of Abrasive Materials If statement

if(matches(appType[3],"Powder Coatings"))	//RM
                {
								var arrEmissionPOWDER = [];
//                                calc_total_VOC = CalcTotalHours1(thrucapId);
//                                calc_total_GAL = CalcTotalHours(thrucapId);
								var PRAPOWDER = getAppSpecific("Powder Coat pounds/year",thrucapId);
								logDebug("PRPOWDER: "+ PRAPOWDER);
                                var CPEPOWDER = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                if(CPEPOWDER.length > 0)
                                {              
                                                removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                                for (x in CPEPOWDER)
                                                {
                                                                emisrowPOWDER = CPEPOWDER[x]; 
                                                                var PollutantPOWDER = emisrowPOWDER["Pollutant"].toString();
                                                                var EF1GPOWDER = emisrowPOWDER["EF (lb/lb processed)"].toString();
                                                                var EF1HPOWDER = emisrowPOWDER["EF Hourly Rate (lb/hr)"].toString();
                                                                var EFORGPOWDER = emisrowPOWDER["EF Origin Code"].toString();
                                                                var HARPPOWDER = emisrowPOWDER["HARP EF"].toString();
                                                                var CEPOWDER = emisrowPOWDER["Control Efficiency"].toString();
                                                                var EFNOTEPOWDER = emisrowPOWDER["EF Note/Memo"].toString();
                                                                var AELBSPOWDER = emisrowPOWDER["Annual Emissions (lbs)"].toString();
                                                                var AEOLBPOWDER = emisrowPOWDER["Annual Emissions Override (lbs)"].toString();
                                                                var AETONSPOWDER = emisrowPOWDER["Annual Emissions (tons)"].toString();
                                                                var CALCPOWDER = emisrowPOWDER["Calculation Method"].toString();
                                                                var EMISLIMPOWDER = emisrowPOWDER["Emissions Limit"].toString();
                                                                //var LASTUPDATE = emisrowPOWDER["Last Update"];
                                                                //var TRANSACTIONDATE = emisrowPOWDER ["Transaction Date"];
				if(EF1GPOWDER != null && EF1GPOWDER != "" && EF1GPOWDER != " "&& EF1GPOWDER != "  ")
				{
					AELBSPOWDER = String(Number(EF1GPOWDER *PRAPOWDER).toFixed(2));
					HARPPOWDER = String(EF1GPOWDER);
				}
				if(AEOLBPOWDER != null && AEOLBPOWDER != "" && AEOLBPOWDER != " "&& AEOLBPOWDER != "  " )
				{
					AETONSPOWDER = Number(String(AEOLBPOWDER / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSPOWDER = Number(String(AELBSPOWDER/ 2000)).toFixed(10).toString();
				}
 
				logDebug("PollutantAB: "+ PollutantPOWDER);
				logDebug("EF1GAB: " + EF1GPOWDER);			
				logDebug("EFORGAB: " + EFORGPOWDER);
				logDebug("HARPAB: "+ HARPPOWDER);
				logDebug("CEAB: "+CEPOWDER);
				logDebug("EFNOTEAB: "+ EFNOTEPOWDER);
				logDebug("AELBSAB: "+AELBSPOWDER);
				logDebug("AEOLBAB: "+AEOLBPOWDER);
				logDebug("AETONSAB: "+ AETONSPOWDER);
				logDebug("CALCAB: "+ CALCPOWDER);
				logDebug("EMISLIMAB: "+ EMISLIMPOWDER);
 

                                                                
                                                arrEmissionPOWDER["Pollutant"] = String(PollutantPOWDER);
                                                arrEmissionPOWDER["EF (lb/lb processed)"] = String(EF1GPOWDER);
                                                arrEmissionPOWDER["EF Hourly Rate (lb/hr)"] = String(EF1HPOWDER);
                                                arrEmissionPOWDER["EF Origin Code"] = String(EFORGPOWDER);
                                                arrEmissionPOWDER["HARP EF"] = String(HARPPOWDER);
                                                if(CEPOWDER != null && CEPOWDER != "")
                                                {
                                                arrEmissionPOWDER["Control Efficiency"] = String(CEPOWDER);
                                                }
                                                else
                                                {
                                                arrEmissionPOWDER["Control Efficiency"] = String(" "); 
                                                }
                                                if(EFNOTEPOWDER != null && EFNOTEPOWDER != "")
                                                {
                                                arrEmissionPOWDER["EF Note/Memo"] = String(EFNOTEPOWDER);
                                                }
                                                else
                                                {
                                                arrEmissionPOWDER["EF Note/Memo"] = String(" ");     
                                                }
                                                arrEmissionPOWDER["Annual Emissions (lbs)"] = String(AELBSPOWDER);
                                                if(AEOLBPOWDER != null && AEOLBPOWDER != "" && AEOLBPOWDER != " ")
                                                {
                                                arrEmissionPOWDER["Annual Emissions Override (lbs)"] = String(AEOLBPOWDER);
                                                }
                                                else
                                                {
                                                arrEmissionPOWDER["Annual Emissions Override (lbs)"] = String(" ");     
                                                }
                                                arrEmissionPOWDER["Annual Emissions (tons)"] = String(AETONSPOWDER);
                                                arrEmissionPOWDER["Calculation Method"] = String(CALCPOWDER);
                                                arrEmissionPOWDER["Emissions Limit"] = String(EMISLIMPOWDER);
												
												
												

                                                addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionPOWDER,thrucapId);   
                                                                
                                }//end of Table loop
                                                 
                                }//end of table if statement
                                
                                
                                
                                if (CPEPOWDER.length == 0 || typeof(CPEPOWDER.length) == "undefined")
                                {
                                                
                                                logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
                                }

                                                logDebug("Stop Working on Throughput " + capIDString);
                                capCount++

                                                                
                
                                
                                
                
                                
                }//End of POWDER If statement
if(matches(appType[3],"Sand Loading"))	//RM
                {
								var arrEmissionSand = [];
//                                calc_total_VOC = CalcTotalHours1(thrucapId);
//                                calc_total_GAL = CalcTotalHours(thrucapId);
								var PRASandTotal = getAppSpecific("Total for the Year",thrucapId);
								var PRSAND = Calcqtr1(thrucapId);
								logDebug("PRSandQTR: "+ PRSAND);
								logDebug("PRSandTotal: "+ PRASandTotal);							
								
								
                                var CPESand = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                if(CPESand.length > 0)
                                {              
                                                removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                                for (x in CPESand)
                                                {
                                                                emisrowSand = CPESand[x]; 
                                                                var PollutantSand = emisrowSand["Pollutant"].toString();
                                                                var EF1GSand = emisrowSand["EF (lbs/Ton)"].toString();
                                                                var EF1HSand = emisrowSand["EF Hourly Rate (lbs/Hr)"].toString();
                                                                var EFORGSand = emisrowSand["EF Origin Code"].toString();
                                                                var HARPSand = emisrowSand["HARP EF"].toString();
                                                                var CESand = emisrowSand["Control Efficiency"].toString();
                                                                var EFNOTESand = emisrowSand["EF Note/Memo"].toString();
                                                                var AELBSSand = emisrowSand["Annual Emissions (lbs)"].toString();
                                                                var AEOLBSand = emisrowSand["Annual Emissions Override (lbs)"].toString();
                                                                var AETONSSand = emisrowSand["Annual Emissions (tons)"].toString();
                                                                var CALCSand = emisrowSand["Calculation Method"].toString();
                                                                var EMISLIMSand = emisrowSand["Emissions Limit"].toString();
                                                                //var LASTUPDATE = emisrowSand["Last Update"];
                                                                //var TRANSACTIONDATE = emisrowSand ["Transaction Date"];
				if(EF1GSand != null && EF1GSand != "" && EF1GSand != " "&& EF1GSand != "  ")
				{
					AELBSSand = String(Number(EF1GSand *PRSAND).toFixed(2));
					HARPSand = String(EF1GSand);
				}
				if(AEOLBSand != null && AEOLBSand != "" && AEOLBSand != " "&& AEOLBSand != "  " )
				{
					AETONSSand = Number(String(AEOLBSand / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSSand = Number(String(AELBSSand/ 2000)).toFixed(10).toString();
				}
 
				logDebug("PollutantAB: "+ PollutantSand);
				logDebug("EF1GAB: " + EF1GSand);			
				logDebug("EFORGAB: " + EFORGSand);
				logDebug("HARPAB: "+ HARPSand);
				logDebug("CEAB: "+CESand);
				logDebug("EFNOTEAB: "+ EFNOTESand);
				logDebug("AELBSAB: "+AELBSSand);
				logDebug("AEOLBAB: "+AEOLBSand);
				logDebug("AETONSAB: "+ AETONSSand);
				logDebug("CALCAB: "+ CALCSand);
				logDebug("EMISLIMAB: "+ EMISLIMSand);
 

                                                                
                                                arrEmissionSand["Pollutant"] = String(PollutantSand);
                                                arrEmissionSand["EF (lbs/Ton)"] = String(EF1GSand);
                                                arrEmissionSand["EF Hourly Rate (lbs/Hr)"] = String(EF1HSand);
                                                arrEmissionSand["EF Origin Code"] = String(EFORGSand);
                                                arrEmissionSand["HARP EF"] = String(HARPSand);
                                                if(CESand != null && CESand != "")
                                                {
                                                arrEmissionSand["Control Efficiency"] = String(CESand);
                                                }
                                                else
                                                {
                                                arrEmissionSand["Control Efficiency"] = String(" "); 
                                                }
                                                if(EFNOTESand != null && EFNOTESand != "")
                                                {
                                                arrEmissionSand["EF Note/Memo"] = String(EFNOTESand);
                                                }
                                                else
                                                {
                                                arrEmissionSand["EF Note/Memo"] = String(" ");     
                                                }
                                                arrEmissionSand["Annual Emissions (lbs)"] = String(AELBSSand);
                                                if(AEOLBSand != null && AEOLBSand != "" && AEOLBSand != " ")
                                                {
                                                arrEmissionSand["Annual Emissions Override (lbs)"] = String(AEOLBSand);
                                                }
                                                else
                                                {
                                                arrEmissionSand["Annual Emissions Override (lbs)"] = String(" ");     
                                                }
                                                arrEmissionSand["Annual Emissions (tons)"] = String(AETONSSand);
                                                arrEmissionSand["Calculation Method"] = String(CALCSand);
                                                arrEmissionSand["Emissions Limit"] = String(EMISLIMSand);
												
												
												

                                                addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionSand,thrucapId);   
                                                                
                                }//end of Table loop
                                                 
                                }//end of table if statement
                                
                                
                                
                                if (CPESand.length == 0 || typeof(CPESand.length) == "undefined")
                                {
                                                
                                                logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
                                }

                                                logDebug("Stop Working on Throughput " + capIDString);
                                capCount++

                                                                
                
                                
                                
                
                                
                }//End of Sand If statement
if(matches(appType[3],"Cooling Towers"))	//RM
                {
								var arrEmissionCool = [];
								var PRCool = Calccooling(thrucapId);
								logDebug("PRCoolQTR: "+ PRCool);
								
								
                                var CPECool = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                if(CPECool.length > 0)
                                {              
                                                removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                                for (x in CPECool)
                                                {
                                                                emisrowCool = CPECool[x]; 
                                                                var PollutantCool = emisrowCool["Pollutant"].toString();
                                                                var EF1GCool = emisrowCool["EF Hourly Rate (lbs/hr)"].toString();
																
                                                                var EFORGCool = emisrowCool["EF Origin Code"].toString();
                                                                var HARPCool = emisrowCool["HARP EF"].toString();
                                                                var CECool = emisrowCool["Control Efficiency"].toString();
                                                                var EFNOTECool = emisrowCool["EF Note/Memo"].toString();
                                                                var AELBSCool = emisrowCool["Annual Emissions (lbs)"].toString();
                                                                var AEOLBCool = emisrowCool["Annual Emissions Override (lbs)"].toString();
                                                                var AETONSCool = emisrowCool["Annual Emissions (tons)"].toString();
                                                                var CALCCool = emisrowCool["Calculation Method"].toString();
                                                                var EMISLIMCool = emisrowCool["Emissions Limit"].toString();
                                                                //var LASTUPDATE = emisrowCool["Last Update"];
                                                                //var TRANSACTIONDATE = emisrowCool ["Transaction Date"];
				if(EF1GCool != null && EF1GCool != "" && EF1GCool != " "&& EF1GCool != "  ")
				{
					AELBSCool = String(Number(EF1GCool *PRCool).toFixed(2));
					HARPCool = String(EF1GCool);
				}
				if(AEOLBCool != null && AEOLBCool != "" && AEOLBCool != " "&& AEOLBCool != "  " )
				{
					AETONSCool = Number(String(AEOLBCool / 2000)).toFixed(10).toString();
				}
				else
				{
					AETONSCool = Number(String(AELBSCool/ 2000)).toFixed(10).toString();
				}
 
				logDebug("PollutantAB: "+ PollutantCool);
				logDebug("EF1GAB: " + EF1GCool);			
				logDebug("EFORGAB: " + EFORGCool);
				logDebug("HARPAB: "+ HARPCool);
				logDebug("CEAB: "+CECool);
				logDebug("EFNOTEAB: "+ EFNOTECool);
				logDebug("AELBSAB: "+AELBSCool);
				logDebug("AEOLBAB: "+AEOLBCool);
				logDebug("AETONSAB: "+ AETONSCool);
				logDebug("CALCAB: "+ CALCCool);
				logDebug("EMISLIMAB: "+ EMISLIMCool);
 

                                                                
                                                arrEmissionCool["Pollutant"] = String(PollutantCool);
                                                arrEmissionCool["EF Hourly Rate (lbs/hr)"] = String(EF1GCool);
//                                                arrEmissionCool["EF Hourly Rate (lbs/Hr)"] = String(EF1HCool);
                                                arrEmissionCool["EF Origin Code"] = String(EFORGCool);
                                                arrEmissionCool["HARP EF"] = String(HARPCool);
                                                if(CECool != null && CECool != "")
                                                {
                                                arrEmissionCool["Control Efficiency"] = String(CECool);
                                                }
                                                else
                                                {
                                                arrEmissionCool["Control Efficiency"] = String(" "); 
                                                }
                                                if(EFNOTECool != null && EFNOTECool != "")
                                                {
                                                arrEmissionCool["EF Note/Memo"] = String(EFNOTECool);
                                                }
                                                else
                                                {
                                                arrEmissionCool["EF Note/Memo"] = String(" ");     
                                                }
                                                arrEmissionCool["Annual Emissions (lbs)"] = String(AELBSCool);
                                                if(AEOLBCool != null && AEOLBCool != "" && AEOLBCool != " ")
                                                {
                                                arrEmissionCool["Annual Emissions Override (lbs)"] = String(AEOLBCool);
                                                }
                                                else
                                                {
                                                arrEmissionCool["Annual Emissions Override (lbs)"] = String(" ");     
                                                }
                                                arrEmissionCool["Annual Emissions (tons)"] = String(AETONSCool);
                                                arrEmissionCool["Calculation Method"] = String(CALCCool);
                                                arrEmissionCool["Emissions Limit"] = String(EMISLIMCool);
												
												
												

                                                addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionCool,thrucapId);   
                                                                
                                }//end of Table loop
                                                 
                                }//end of table if statement
                                
                                
                                
                                if (CPECool.length == 0 || typeof(CPECool.length) == "undefined")
                                {
                                                
                                                logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
                                }

                                                logDebug("Stop Working on Throughput " + capIDString);
                                capCount++

                                                                
                
                                
                                
                
                                
                }//End of Cool If statement
	

	
if(matches(appType[3],"Combustion Turbine"))	//RM
                {
								var arrEmissionComTurb = [];
								//var PRComTurb = CalcComTurbing(thrucapId);
								//logDebug("PRComTurbQTR: "+ PRComTurb);
Q1CO=getAppSpecific("CO Q1",thrucapId);
Q2CO=getAppSpecific("CO Q2",thrucapId);
Q3CO=getAppSpecific("CO Q3",thrucapId);
Q4CO=getAppSpecific("CO Q4",thrucapId);
Q1NOx=getAppSpecific("NOx Q1",thrucapId);
Q2NOx=getAppSpecific("NOx Q2",thrucapId);
Q3NOx=getAppSpecific("NOx Q3",thrucapId);
Q4NOx=getAppSpecific("NOx Q4",thrucapId);
Q1PM=getAppSpecific("PM10 Q1",thrucapId);
Q2PM=getAppSpecific("PM10 Q2",thrucapId);
Q3PM=getAppSpecific("PM10 Q3",thrucapId);
Q4PM=getAppSpecific("PM10 Q4",thrucapId);
Q1SO=getAppSpecific("SO2 Q1",thrucapId);
Q2SO=getAppSpecific("SO2 Q2",thrucapId);
Q3SO=getAppSpecific("SO2 Q3",thrucapId);
Q4SO=getAppSpecific("SO2 Q4",thrucapId);
Q1VOC=getAppSpecific("VOC Q1",thrucapId);
Q2VOC=getAppSpecific("VOC Q2",thrucapId);
Q3VOC=getAppSpecific("VOC Q3",thrucapId);
Q4VOC=getAppSpecific("VOC Q4",thrucapId);
COTotal=getAppSpecific("CO Total",thrucapId);
NOXTotal=getAppSpecific("NOx Total",thrucapId);
PMTotal=getAppSpecific("PM10 Total",thrucapId);
SOTotal=getAppSpecific("SO2 Total",thrucapId);
VOCTotal=getAppSpecific("VOC Total",thrucapId);
mmbtu=getAppSpecific("Max Heat Input Rating (MMBtu/hr)",thrucapId);
TotalHours=getAppSpecific("Total Hours (Jan - Dec)",thrucapId);
var totaltmpco = Number(parseInt(Q1CO)) + Number(parseInt(Q2CO))+ Number(parseInt(Q3CO))+ Number(parseInt(Q4CO));
var totaltmpnox = Number(parseInt(Q1NOx)) + Number(parseInt(Q2NOx))+ Number(parseInt(Q3NOx))+ Number(parseInt(Q4NOx));
var totaltmppm = Number(parseInt(Q1PM)) + Number(parseInt(Q2PM))+ Number(parseInt(Q3PM))+ Number(parseInt(Q4PM));
var totaltmpso = Number(parseInt(Q1SO)) + Number(parseInt(Q2SO))+ Number(parseInt(Q3SO))+ Number(parseInt(Q4SO));
var totaltmpvoc = Number(parseInt(Q1VOC)) + Number(parseInt(Q2VOC))+ Number(parseInt(Q3VOC))+ Number(parseInt(Q4VOC));
var totalco = Number(Q1CO)+Number(Q2CO)+Number(Q3CO)+Number(Q4CO);
var totalnox = Number(Q1NOx)+Number(Q2NOx)+Number(Q3NOx)+Number(Q4NOx);
var totalpm = Number(Q1PM)+Number(Q2PM)+Number(Q3PM)+Number(Q4PM);
var totalso = Number(Q1SO)+Number(Q2SO)+Number(Q3SO)+Number(Q4SO);
var totalvoc = Number(Q1VOC)+Number(Q2VOC)+Number(Q3VOC)+Number(Q4VOC);
var ef1co = Number(Number(totalco) / Number(TotalHours));
var ef1nox = Number(Number(totalnox) / Number(TotalHours));
var ef1pm = Number(Number(totalpm) / Number(TotalHours));
var ef1so = Number(Number(totalso) / Number(TotalHours));
var ef1voc = Number(Number(totalvoc) / Number(TotalHours));
var procrate = getAppSpecific("Process Rate",thrucapId);
logDebug("mmbtu:" + Number(mmbtu));
logDebug("ef1nox:" + Number(ef1nox).toFixed(5));
logDebug("Procrate:" + Number(procrate));

                                var CPEComTurb = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                if(CPEComTurb.length > 0)
                                {              
                                                removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                                for (x in CPEComTurb)
                                                {
                                                                emisrowComTurb = CPEComTurb[x]; 
                                                                var PollutantComTurb = emisrowComTurb["Pollutant"].toString();
																var CEComTurb = emisrowComTurb["Control Efficiency"].toString();
                                                                var EF1GComTurb = emisrowComTurb["EF1 (lb/MMBtu)"].toString();
                                                                var EF1HRComTurb = emisrowComTurb["EF1 Hourly Rate (lbs/hr)"].toString();
                                                                var EFORGComTurb = emisrowComTurb["EF Origin Code"].toString();
                                                                var HARPComTurb = emisrowComTurb["HARP EF"].toString();
                                                                var EFNOTEComTurb = emisrowComTurb["EF Note/Memo"].toString();
                                                                var AELBSComTurb = emisrowComTurb["Annual Emissions (lbs)"].toString();
                                                                var AEOLBComTurb = emisrowComTurb["Annual Emissions Override (lbs)"].toString();
                                                                var AETONSComTurb = emisrowComTurb["Annual Emissions (tons)"].toString();
                                                                var CALCComTurb = emisrowComTurb["Calculation Method"].toString();
                                                                var EMISLIMComTurb = emisrowComTurb["Emissions Limit"].toString();																
																var ef1noxx = (Number(totalnox) / Number(TotalHours));
																var ef1noxx = (Number(totalnox) / Number(TotalHours));
																var ef1noxx = (Number(totalnox) / Number(TotalHours));
																var ef1noxx = (Number(totalnox) / Number(TotalHours));
																var ef1noxx = (Number(totalnox) / Number(TotalHours));
																
																	if (PollutantComTurb = "Nitrogen Oxides (NOx)")
																	{
																	arrEmissionComTurb["Pollutant"] = String(PollutantComTurb);	
																	arrEmissionComTurb["EF1 (lb/MMBtu)"] = (Number(ef1nox) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	arrEmissionComTurb["EF1 Hourly Rate (lbs/hr)"] = ((Number(totalnox) / Number(TotalHours))).toFixed(5);		
																	arrEmissionComTurb["EF Origin Code"] = String(EFORGComTurb);
																	arrEmissionComTurb["HARP EF"] = (Number(ef1nox) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	if(CEComTurb != null && CEComTurb != "")
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(CEComTurb);
																    }
																	else
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(" "); 
																	}																	
																	if(EFNOTEComTurb != null && EFNOTEComTurb != "")
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(EFNOTEComTurb);
																	}
																	else
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(" ");     
																	}																	
																	arrEmissionComTurb["Annual Emissions (lbs)"] =  Number(totalnox).toFixed(5);
																	arrEmissionComTurb["Annual Emissions (tons)"] = Number(NOXTotal).toFixed(5);
																	arrEmissionComTurb["Calculation Method"] = String(CALCComTurb);
																	arrEmissionComTurb["Emissions Limit"] = String(EMISLIMComTurb);	
//																	logDebug("EF1 Hourly: "+ ((Number(totalnox) / Number(TotalHours))).toFixed(5));		
//																	logDebug("Annual Lbs: "+ Number(totalnox).toFixed(5));		
//																	logDebug("Annual Tons: "+ Number(NOXTotal).toFixed(5));		
//																	logDebug("Hours: "+ Number(TotalHours).toFixed(5));		
//																	logDebug("EF: "+  Number(ef1noxx).toFixed(5) +" * "+ Number(TotalHours).toFixed(5) +" / "+ Number(procrate).toFixed(5));
//																	logDebug("EF=: "+  (Number(ef1nox) * Number(TotalHours) / Number(procrate)).toFixed(5) );
																	}																

																	if (PollutantComTurb = "Carbon Monoxide (CO)")
																	{
																	arrEmissionComTurb["Pollutant"] = String(PollutantComTurb);	
																	arrEmissionComTurb["EF1 (lb/MMBtu)"] = (Number(ef1co) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	arrEmissionComTurb["EF1 Hourly Rate (lbs/hr)"] = ((Number(totalco) / Number(TotalHours))).toFixed(5);		
																	arrEmissionComTurb["EF Origin Code"] = String(EFORGComTurb);
																	arrEmissionComTurb["HARP EF"] = (Number(ef1co) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	if(CEComTurb != null && CEComTurb != "")
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(CEComTurb);
																    }
																	else
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(" "); 
																	}																	
																	if(EFNOTEComTurb != null && EFNOTEComTurb != "")
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(EFNOTEComTurb);
																	}
																	else
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(" ");     
																	}																	
																	arrEmissionComTurb["Annual Emissions (lbs)"] =  Number(totalco).toFixed(5);
																	arrEmissionComTurb["Annual Emissions (tons)"] = Number(COTotal).toFixed(5);
																	arrEmissionComTurb["Calculation Method"] = String(CALCComTurb);
																	arrEmissionComTurb["Emissions Limit"] = String(EMISLIMComTurb);	
																	}												


																	if (PollutantComTurb = "Particulate Matter (PM10)")
																	{
																	arrEmissionComTurb["Pollutant"] = String(PollutantComTurb);	
																	arrEmissionComTurb["EF1 (lb/MMBtu)"] = (Number(ef1pm) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	arrEmissionComTurb["EF1 Hourly Rate (lbs/hr)"] = ((Number(totalpm) / Number(TotalHours))).toFixed(5);		
																	arrEmissionComTurb["EF Origin Code"] = String(EFORGComTurb);
																	arrEmissionComTurb["HARP EF"] = (Number(ef1pm) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	if(CEComTurb != null && CEComTurb != "")
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(CEComTurb);
																    }
																	else
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(" "); 
																	}																	
																	if(EFNOTEComTurb != null && EFNOTEComTurb != "")
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(EFNOTEComTurb);
																	}
																	else
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(" ");     
																	}																	
																	arrEmissionComTurb["Annual Emissions (lbs)"] =  Number(totalpm).toFixed(5);
																	arrEmissionComTurb["Annual Emissions (tons)"] = Number(PMTotal).toFixed(5);
																	arrEmissionComTurb["Calculation Method"] = String(CALCComTurb);
																	arrEmissionComTurb["Emissions Limit"] = String(EMISLIMComTurb);	
																	}	
																	
																	
																	if (PollutantComTurb = "Sulfur Oxides (SOx)")
																	{
																	arrEmissionComTurb["Pollutant"] = String(PollutantComTurb);	
																	arrEmissionComTurb["EF1 (lb/MMBtu)"] = (Number(ef1so) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	arrEmissionComTurb["EF1 Hourly Rate (lbs/hr)"] = ((Number(totalso) / Number(TotalHours))).toFixed(5);		
																	arrEmissionComTurb["EF Origin Code"] = String(EFORGComTurb);
																	arrEmissionComTurb["HARP EF"] = (Number(ef1so) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	if(CEComTurb != null && CEComTurb != "")
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(CEComTurb);
																    }
																	else
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(" "); 
																	}																	
																	if(EFNOTEComTurb != null && EFNOTEComTurb != "")
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(EFNOTEComTurb);
																	}
																	else
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(" ");     
																	}																	
																	arrEmissionComTurb["Annual Emissions (lbs)"] =  Number(totalso).toFixed(5);
																	arrEmissionComTurb["Annual Emissions (tons)"] = Number(SOTotal).toFixed(5);
																	arrEmissionComTurb["Calculation Method"] = String(CALCComTurb);
																	arrEmissionComTurb["Emissions Limit"] = String(EMISLIMComTurb);	
																	}	

																	
																	if (PollutantComTurb = "Volatile Organic Compounds (VOC)")
																	{
																	arrEmissionComTurb["Pollutant"] = String(PollutantComTurb);	
																	arrEmissionComTurb["EF1 (lb/MMBtu)"] = (Number(ef1voc) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	arrEmissionComTurb["EF1 Hourly Rate (lbs/hr)"] = ((Number(totalvoc) / Number(TotalHours))).toFixed(5);		
																	arrEmissionComTurb["EF Origin Code"] = String(EFORGComTurb);
																	arrEmissionComTurb["HARP EF"] = (Number(ef1voc) * Number(TotalHours) / Number(procrate)).toFixed(5) ;
																	if(CEComTurb != null && CEComTurb != "")
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(CEComTurb);
																    }
																	else
																	{
																	arrEmissionComTurb["Control Efficiency"] = String(" "); 
																	}																	
																	if(EFNOTEComTurb != null && EFNOTEComTurb != "")
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(EFNOTEComTurb);
																	}
																	else
																	{
																	arrEmissionComTurb["EF Note/Memo"] = String(" ");     
																	}																	
																	arrEmissionComTurb["Annual Emissions (lbs)"] =  Number(totalvoc).toFixed(5);
																	arrEmissionComTurb["Annual Emissions (tons)"] = Number(VOCTotal).toFixed(5);
																	arrEmissionComTurb["Calculation Method"] = String(CALCComTurb);
																	arrEmissionComTurb["Emissions Limit"] = String(EMISLIMComTurb);	
																	}	




						
												
                                                addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionComTurb,thrucapId);   
                                                                
                                }//end of Table loop
                                                 
                                }//end of table if statement
                                
                                
                                
                                if (CPEComTurb.length == 0 || typeof(CPEComTurb.length) == "undefined")
                                {
                                                
                                                logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
                                }

                                                logDebug("Stop Working on Throughput " + capIDString);
                                capCount++

                                                                
                
                                
                                
                
                                
                }//End of ComTurb If statement
	
	
*/
	
	
	
	
	
	
	
	
//AirQuality/Stationary Source/Throughput/
//AirQuality/Stationary Source/Throughput/Composting

//AirQuality/Stationary Source/Throughput/Materials Handling
//AirQuality/Stationary Source/Throughput/Materials Handling (non-wood)
//AirQuality/Stationary Source/Throughput/Wood Fired Power Plant
//AirQuality/Stationary Source/Throughput/Woodcoater Particulate Control
	
	
	
	
	
	
	
	
	
	
		
	}//end if record type match

   return capCount;
		
} // End of function

 

    


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
function dateAdd(td, amt)
{
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
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
function getAppSpecificName(itemName,itemCap)  // optional: itemCap
{
	var updated = false;
	var i=0;
	useAppSpecificGroupName = true;
   	
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
function getThroughputrecords(altid)
{
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
function addASITable(tableName, tableValueArray, itemCap) // optional capId
{
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
 function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;
	this.hasValue = Boolean(fieldValue != null & fieldValue != "");

	asiTableValObj.prototype.toString=function(){ return this.hasValue ? String(this.fieldValue) : String(""); }
}; 	
function addToASITable(tableName,tableValues,itemCap) // optional capId
  	{
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
function removeASITable(tableName,itemCap) // optional capId
  	{
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
function checkthroughput(permitId,trecord,tyear)
		{
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
function deleteASITrow(arr, column_name, value)
{
for(var i = 0; i < arr.length; i++)
{
if (String(arr[i][column_name]) == String(value)) {
    arr.splice(i, 1);
  }
}
return arr
}
function calcAMHI(itemCap)
{
var value = 0;

var fuel_hhv_other = getAppSpecific('If "Biogas/Digester Gas" or "Other" is selected as the fuel type, please include energy content of',itemCap);
var fuel_tot = getAppSpecific("Total amount of fuel used by the permitted equipment during the reporting calendar year",itemCap);
var fuel_units = getAppSpecific("Select units of reported fuel usage",itemCap);
var fuel_type = getAppSpecific("What type of fuel does the permitted equipment use",itemCap);



	if(fuel_units == "MMBtu")
	{
				value = String(fuel_tot);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot).toFixed(2)),itemCap);

	}	

	if(fuel_units == "MMscf" && fuel_type == "Natural Gas")
	{
				value = String(fuel_tot * 1020);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * 1020),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * 1020).toFixed(2)),itemCap);
	}	
	if(fuel_units == "Therms" && fuel_type == "Natural Gas")
	{
				value = String(fuel_tot * 0.1);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * 0.1),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * 0.1).toFixed(2)),itemCap);
	}
	if(fuel_units == "Gallons" && fuel_type == "LPG (Propane)")
	{
				value = String(fuel_tot * .0905);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * .0905),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * .0905).toFixed(2)),itemCap);
	}
	if(fuel_units == "Gallons" && fuel_type == "Diesel")
	{
				value = String(fuel_tot * .137);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * .137),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * .137).toFixed(2)),itemCap);
	}
	if(fuel_units != "MMBtu" && fuel_units != "" && fuel_units != null && (fuel_type == "Biogas/Digester Gas" || fuel_type == "Other"))
	{
		value = String(fuel_tot * .000001);
				editAppSpecific("Annual Max Heat Input (MMBtu)",String(fuel_tot * .000001),itemCap)
				editAppSpecific("Process Rate",String(Number(fuel_tot * .000001).toFixed(2)),itemCap);

	}
	return value;
}
function calccalendartotal(itemCap)
{
var total = 0;
var begin = getAppSpecific("Hour meter reading at the beginning of the calendar year",itemCap);
var end = getAppSpecific("Hour meter reading at the end of the calendar year",itemCap);

		if(begin != null && begin != "" && end != null && end != "")
		{
		total = String(Number(end - begin).toFixed(2));
		editAppSpecific("Total hours of operation during this calendar year",total,itemCap)
		editAppSpecific("Process Rate",total,itemCap);
		}
	return total		
	}
function calccalendartotalFlex(itemCap)
{
var total = 0;	
	
var FEEHours = getAppSpecificName("FLEX EMERGENCY ENGINE.Total hours of operation during this calendar year",itemCap);
var FEEHours2 = getAppSpecificName("FLEX EMERGENCY ENGINE 2.Total hours of operation during this calendar year",itemCap);
var FEEHours3 = getAppSpecificName("FLEX EMERGENCY ENGINE 3.Total hours of operation during this calendar year",itemCap);
var FEEHours4 = getAppSpecificName("FLEX EMERGENCY ENGINE 4.Total hours of operation during this calendar year",itemCap);
var FEEHours5 = getAppSpecificName("FLEX EMERGENCY ENGINE 5.Total hours of operation during this calendar year",itemCap);
ef=String(Number(FEEHours) + Number(FEEHours2 ) + Number(FEEHours3) + Number(FEEHours4) + Number(FEEHours5));

total = Number(ef).toFixed(2).toString();
editAppSpecific("Total Hours",total,itemCap);

return total
}
function CombinedEmissionFactor(itemCap)
{
var total = 0;

var DPEF = getAppSpecific("Dispensing/Permeation Emission Factor",itemCap);
var OVREF = getAppSpecific("Other Vapor Releases Emission Factor",itemCap);
var PLEF = getAppSpecific("Pressure Losses Emission Factor",itemCap);
var SPEF = getAppSpecific("Spillage Emission Factor",itemCap);
var TLEF = getAppSpecific("Transfer Losses Emission Factor",itemCap);


			total = String(Number(DPEF) + Number(OVREF) + Number(PLEF) + Number(SPEF) + Number(TLEF));

		
		editAppSpecific("Combined Emission Factor",total,itemCap);
	
return total
}	
function CalcTotalHours(itemCap)
{
	var total = 0;

	var APR = getAppSpecific("Apr",itemCap);
	var AUG = getAppSpecific("Aug",itemCap);
	var DEC = getAppSpecific("Dec",itemCap);
	var FEB = getAppSpecific("Feb",itemCap);
	var JAN = getAppSpecific("Jan",itemCap);
	var JUL = getAppSpecific("July",itemCap);
	var JUN = getAppSpecific("Jun",itemCap);
	var MAR = getAppSpecific("Mar",itemCap);
	var MAY = getAppSpecific("May",itemCap);
	var NOV = getAppSpecific("Nov",itemCap);
	var OCT = getAppSpecific("Oct",itemCap);
	var SEPT = getAppSpecific("Sept",itemCap);

	total = String(Number(Number(APR)+Number(AUG)+Number(DEC)+Number(FEB)+Number(JAN)+Number(JUL)+Number(JUN)+Number(MAR)+Number(MAY)+Number(NOV)+Number(OCT)+Number(SEPT)).toFixed(2));
	editAppSpecific("Total",total,itemCap);
	return total;
}
function CalcTotalHours1(itemCap)// total1
{
	var total = 0;

	var APR1 = getAppSpecific("Apr1",itemCap);
	var AUG1 = getAppSpecific("Aug1",itemCap);
	var DEC1 = getAppSpecific("Dec1",itemCap);
	var FEB1 = getAppSpecific("Feb1",itemCap);
	var JAN1 = getAppSpecific("Jan1",itemCap);
	var JUL1 = getAppSpecific("July1",itemCap);
	var JUN1 = getAppSpecific("Jun1",itemCap);
	var MAR1 = getAppSpecific("Mar1",itemCap);
	var MAY1 = getAppSpecific("May1",itemCap);
	var NOV1 = getAppSpecific("Nov1",itemCap);
	var OCT1 = getAppSpecific("Oct1",itemCap);
	var SEPT1 = getAppSpecific("Sept1",itemCap);


	total = String(Number(Number(APR1)+Number(AUG1)+Number(DEC1)+Number(FEB1)+Number(JAN1)+Number(JUL1)+Number(JUN1)+Number(MAR1)+Number(MAY1)+Number(NOV1)+Number(OCT1)+Number(SEPT1)).toFixed(2));
	editAppSpecific("Total1",total,itemCap);
	return total;
}
function Calcqtr(itemCap)// total1
{
var total = 0;
	
var qtr1st = getAppSpecific("1st Quarter Sum",itemCap);
var qtr2nd = getAppSpecific("2nd Quarter Sum",itemCap);
var qtr3rd = getAppSpecific("3rd Quarter Sum",itemCap);
var qtr4th = getAppSpecific("4th Quarter Sum",itemCap);

total = String(Number(qtr1st) + Number(qtr2nd) + Number(qtr3rd) + Number(qtr4th));
                 
editAppSpecific("Sum of Total Material Processed Annually",total,itemCap);
	return total;
}
function Calcqtr1(itemCap)// total1
{
var total = 0;
	
var qtr1st = getAppSpecific("Quarter 1",itemCap);
var qtr2nd = getAppSpecific("Quarter 2",itemCap);
var qtr3rd = getAppSpecific("Quarter 3",itemCap);
var qtr4th = getAppSpecific("Quarter 4",itemCap);

total = String(Number(qtr1st) + Number(qtr2nd) + Number(qtr3rd) + Number(qtr4th));
                 
editAppSpecific("Sum of Total Material Processed Annually",total,itemCap);
	return total;
}
function Calccooling(itemCap)// total1
{
var total = 0;
	
var qtr1st = getAppSpecific("1st Quarter - Cooling Tower Operation (hrs)",itemCap);
var qtr2nd = getAppSpecific("2nd Quarter - Cooling Tower Operation (hrs)",itemCap);
var qtr3rd = getAppSpecific("3rd Quarter - Cooling Tower Operation (hrs)",itemCap);
var qtr4th = getAppSpecific("4th Quarter - Cooling Tower Operation (hrs)",itemCap);

total = String(Number(qtr1st) + Number(qtr2nd) + Number(qtr3rd) + Number(qtr4th));
                 
editAppSpecific("Sum of Total Material Processed Annually",total,itemCap);
	return total;
}
function CalcAsphaltprod(itemCap)
{
var total = 0;
	
var TAEU = getAppSpecific("Total amount of Asphalt Emulsion used:",itemCap);
var TSAU = getAppSpecific("Total amount of Sand and Aggregate used:",itemCap);

total = String(Number(TAEU) + Number(TSAU));
                 
editAppSpecific("Total Asphalt Concrete production:",total,itemCap);
	return total;

}
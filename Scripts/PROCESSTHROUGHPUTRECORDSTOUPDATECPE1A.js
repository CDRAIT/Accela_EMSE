/*------------------------------------------------------------------------------------------------------/
| Program: ProcessThroughputRecordstoupdateCPE  Trigger: Batch - STEP1
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
var maxSeconds = 25 * 60; 			// number of seconds allowed for batch processing, usually < 5*60
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
var senderEmailAddr = "placercounty_noreply@accela.com";                                          // Email address of the sender
var emailAddress = "rmoore@placer.ca.gov";                                      // Email address of the person who will receive the batch script log information
var emailAddress2 = "rmoore@placer.ca.gov";                                             // CC email address of the person who will receive the batch script log information
var emailText = "";                                                                     // Email body
//Parameter variables
var paramsOK = true;
var TPvalue="TP24";
//var TPvalue = aa.env.getValue("Throughput");
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

var thru = [];
              var thru = getThroughputrecords(TPvalue);
                for (x in thru)
                {
			var capIDString = thru[x];
			var thrucapId = aa.cap.getCapID(thru[x]).getOutput();
			var pcap = aa.cap.getCap(thrucapId).getOutput();
			var pcapresult = aa.cap.getCap(thrucapId);
			var pcapType = pcap.getCapType().toString();
			var arrEmission = []; 
			appType = pcapType.split("/");
			logDebug(thrucapId);
			var process = aa.cap.getProjectByChildCapID(thrucapId,null, null).getOutput();
			logDebug("Working on process " + process[0].getProjectID());
			var permit = getParentPlacer(process[0].getProjectID());
			logDebug("Working on Permit " + permit);
			logDebug("Working on Throughput " + capIDString);
			if(matches(appType[3],"Boiler"))
			{              
			var CPE = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			var MHIR = getAppSpecific("Max Heat Input Rating (MMBtu/hr)",thrucapId);
			var AMHI = calcAMHI(thrucapId);
			var overwrite = false;
			if(CPE.length > 0)
			{              
				removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
				for (x in CPE)
				{
					emisrow = CPE[x]; 
					var Pollutant = emisrow["Pollutant"].toString();
					var EF1G = emisrow["EF1 (lb/MMBtu)"].toString();
					var EF1H = emisrow["EF1 Hourly Rate (lbs/hr)"].toString();
					var EFORG = emisrow["EF Origin Code"].toString();
					var HARP = emisrow["HARP EF"].toString();
					var CE = emisrow["Control Efficiency"].toString();
					var EFNOTE = emisrow["EF Note/Memo"].toString();
					var AELBS = emisrow["Annual Emissions (lbs)"].toString();
					var AEOLB = emisrow["Annual Emissions Override (lbs)"].toString();
					var AETONS = emisrow["Annual Emissions (tons)"].toString();
					var CALC = emisrow["Calculation Method"].toString();
					var EMISLIM = emisrow["Emissions Limit"].toString();
					var LASTUPDATE = emisrow["Last Update"];
					var TRANSACTIONDATE = emisrow["Transaction Date"];
					if(MHIR != null && MHIR != "" && EF1G != null && EF1G != "")
					{
						EF1H = String(Number(MHIR * EF1G).toFixed(4));
						HARP = String(Number(EF1G).toFixed(4));
					}
					
					if(AEOLB != null && AEOLB != "" && AEOLB != " ")
					{
						overwrite = true;
					}
					if(!overwrite)
					{
						AELBS = String(Number(EF1G * AMHI).toFixed(4));
						AETONS = String(Number(AELBS / 2000).toFixed(10));
					}
					if(overwrite)
					{
						AETONS = String(Number(AEOLB / 2000).toFixed(10));
					}
				arrEmission["Pollutant"] = String(Pollutant);
				arrEmission["EF1 (lb/MMBtu)"] = String(EF1G);
				arrEmission["EF1 Hourly Rate (lbs/hr)"] = String(EF1H);
				arrEmission["EF Origin Code"] = String(EFORG);
				arrEmission["HARP EF"] = String(HARP);
				if(CE == null || CE == "")
				{
					arrEmission["Control Efficiency"] = " ";
				}
				else
				{
					arrEmission["Control Efficiency"] = String(CE);
				}	
				if(EFNOTE == null || EFNOTE == "")
				{
					arrEmission["EF Note/Memo"] = " ";
				}
				else
				{
					arrEmission["EF Note/Memo"] = String(EFNOTE);
				}
				if(AEOLB == null || AEOLB == "")
				{
					arrEmission["Annual Emissions Override (lbs)"] = " ";
				}
				else
				{
					arrEmission["Annual Emissions Override (lbs)"] = String(AEOLB);
				}
				arrEmission["Annual Emissions (lbs)"] = String(AELBS);
				arrEmission["Annual Emissions (tons)"] = String(AETONS);
				arrEmission["Calculation Method"] = String(CALC);
				if(EMISLIM == null || EMISLIM == "")
				{
					arrEmission["Emissions Limit"] = " ";
				}
				else
				{
					arrEmission["Emissions Limit"] = String(EMISLIM);
				}
				arrEmission["Last Update"] = LASTUPDATE;
				arrEmission["Transaction Date"] = TRANSACTIONDATE;  
				addToASITable("CRITERIA POLLUTANT EMISSION",arrEmission,thrucapId)												

			}//end of Table loop
							capCount++
							
			}//end of table if statement
			
			if (CPE.length == 0 || typeof(CPE.length) == "undefined")
			{
							logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
			}
							logDebug("Stop Working on Throughput " + capIDString);
			}//end of throughput records loop
			if(matches(appType[3],"Engine","Prime Engine"))    {              
			var arrEmissionENG = [];
			var CPEENG = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			var MHIRENG = getAppSpecific("Max Heat Input Rating (MMBtu/hr)",thrucapId);
			var MRHENG = getAppSpecific("Max Rated Horsepower (bhp)",thrucapId);
			if(matches(appType[3],"Engine","Prime Engine"))
			{
			var cal_tot = calccalendartotal(thrucapId);
			}
			var overwrite = false
			
			if(CPEENG.length > 0)
			{      
				removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);        
					for (x in CPEENG)
					{
						emisrow = CPEENG[x]; 
						var PollutantENG = emisrow["Pollutant"].toString();
						var EF1GENG = emisrow["EF1 (g/bhp-hr)"].toString();
						var EF1HENG = emisrow["EF1 Hourly Rate (lbs/hr)"].toString();
						var EF2GENG = emisrow["EF2 (lb/MMBtu)"].toString();
						var EF2HENG = emisrow["EF2 Hourly Rate (lbs/hr)"].toString();
						var EFORGENG = emisrow["EF Origin Code"].toString();
						var HARPENG = emisrow["HARP EF"].toString();
						var CEENG = emisrow["Control Efficiency"].toString();
						var EFNOTEENG = emisrow["EF Note/Memo"].toString();
						var AELBSENG = emisrow["Annual Emissions (lbs)"].toString();
						var AEOLBENG = emisrow["Annual Emissions Override (lbs)"].toString();
						var AETONSENG = emisrow["Annual Emissions (tons)"].toString();
						var CALCENG = emisrow["Calculation Method"].toString();
						var EMISLIMENG = emisrow["Emissions Limit"].toString();
						var LASTUPDATEENG = emisrow["Last Update"];
						var TRANSACTIONDATEENG = emisrow["Transaction Date"];
						if(EF1GENG != null && EF1GENG != "")
						{
						EF1HENG = String(Number((MRHENG * EF1GENG)/453.59).toFixed(5));
						}
						if(EF2GENG != null && EF2GENG != "" && EF2GENG != " ")
						{
						EF2HENG = String(Number(MHIRENG * EF2GENG).toFixed(5))
						}
						if(Number(EF1HENG) > Number(EF2HENG) && matches(appType[3],"Engine","Prime Engine"))
						{
							AELBSENG = String(Number(EF1HENG * cal_tot).toFixed(5));
							HARPENG = String(Number(EF1HENG * cal_tot).toFixed(5));
						}
						if(Number(EF2HENG) > Number(EF1HENG) && matches(appType[3],"Engine","Prime Engine"))
						{
							AELBSENG = String(Number(EF2HENG * cal_tot).toFixed(5));
							HARPENG = String(Number(EF2HENG * cal_tot).toFixed(5));
						}
						if(Number(EF1HENG) > Number(EF2HENG) && matches(appType[3],"Flex Emergency Engine","Flex Prime Engine"))
						{
							AELBSENG = String(Number(EF1HENG * cal_tot).toFixed(5));
							HARPENG = String(Number(EF1HENG).toFixed(5));
						}
						if(Number(EF2HENG) > Number(EF1HENG) && matches(appType[3],"Flex Emergency Engine","Flex Prime Engine"))
						{
							AELBSENG = String(Number(EF2HENG * cal_tot).toFixed(5));
							HARPENG = String(Number(EF2HENG).toFixed(5));
						}
						if(AEOLBENG != null && AEOLBENG != "" && AEOLBENG != " " )
						{
							overwrite = true;
						}
						if(!overwrite)
						{
							AETONS = String(Number(AELBSENG / 2000).toFixed(10));
						}
						if(overwrite)
						{
							AETONS = String(Number(AEOLBENG / 2000).toFixed(10));
						}
		arrEmissionENG["Pollutant"] = String(PollutantENG);
		arrEmissionENG["EF1 (g/bhp-hr)"] = String(EF1GENG);
		arrEmissionENG["EF1 Hourly Rate (lbs/hr)"] = String(EF1HENG);
		if(EF2GENG != null && EF2GENG != "")
		{
		arrEmissionENG["EF2 (lb/MMBtu)"] = String(EF2GENG);
		}
		else
		{
		arrEmissionENG["EF2 (lb/MMBtu)"] = String(" ");              
		}
		arrEmissionENG["EF2 Hourly Rate (lbs/hr)"] = String(EF2HENG);
		arrEmissionENG["EF Origin Code"] = String(EFORGENG);
		arrEmissionENG["HARP EF"] = String(HARPENG);
		if(CEENG != null && CEENG != "")
		{
		arrEmissionENG["Control Efficiency"] = String(CEENG);
		}
		else
		{
		arrEmissionENG["Control Efficiency"] = String(" ");            
		}
		if(EFNOTEENG != null && EFNOTEENG != "")
		{
		arrEmissionENG["EF Note/Memo"] = String(EFNOTEENG);
		}
		else
		{
		arrEmissionENG["EF Note/Memo"] = String(" "); 
		}
		arrEmissionENG["Annual Emissions (lbs)"] = String(AELBSENG);
		if(AEOLBENG != null && AEOLBENG != "" && AEOLBENG != " ")
		{
		arrEmissionENG["Annual Emissions Override (lbs)"] = String(AEOLBENG);
		}
		else
		{
		arrEmissionENG["Annual Emissions Override (lbs)"] = String(" ");                
		}
		arrEmissionENG["Annual Emissions (tons)"] = String(AETONS);
		arrEmissionENG["Calculation Method"] = String(CALCENG);
		if(EMISLIMENG != null && EMISLIMENG != "")
		{
		arrEmissionENG["Emissions Limit"] = String(EMISLIMENG);
		}
		else
		{
		arrEmissionENG["Emissions Limit"] = String(" "); 
		}
		arrEmissionENG["Last Update"] = LASTUPDATEENG;
		arrEmissionENG["Transaction Date"] = TRANSACTIONDATEENG;    
		addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionENG,thrucapId);												
	}//end of Table loop
					capCount++
					 
	}//end of table if statement
	if (CPEENG.length == 0 || typeof(CPEENG.length) == "undefined")
	{
		logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
	}
		logDebug("Stop Working on Throughput " + capIDString);
}//End of Engine If statement
			if(matches(appType[3],"GDF"))             		   {
			var arrEmissionGDF = [];
			calc_total = String(getAppSpecific("Total amount of gasoline dispensed in calendar year (gallons)",thrucapId));
			CEF = CombinedEmissionFactor(thrucapId);
			var CPEGDF = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
			if(CPEGDF.length > 0)
			{              
				removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId); 
				for (x in CPEGDF)
				{
					emisrowGDF = CPEGDF[x]; 
					var PollutantGDF = emisrowGDF["Pollutant"].toString();
					var EF1GGDF = emisrowGDF["EF1 (lb/1,000 gallons)"].toString();
					var EF1HGDF = emisrowGDF["EF1 Hourly Rate (lbs/hr)"].toString();
					var EFORGGDF = emisrowGDF["EF Origin Code"].toString();
					var HARPGDF = emisrowGDF["HARP EF"].toString();
					var CEGDF = emisrowGDF["Control Efficiency"].toString();
					var EFNOTEGDF = emisrowGDF["EF Note/Memo"].toString();
					var AELBSGDF = emisrowGDF["Annual Emissions (lbs)"].toString();
					var AEOLBGDF = emisrowGDF["Annual Emissions Override (lbs)"].toString();
					var AETONSGDF = emisrowGDF["Annual Emissions (tons)"].toString();
					var CALCGDF = emisrowGDF["Calculation Method"].toString();
					if(PollutantGDF == "Volatile Organic Compounds (VOC)")
					{
						EF1GGDF = String(Number(CEF).toFixed(7));
						HARPGDF = String(Number(CEF).toFixed(7));
						EF1HGDF = String(Number(String((CEF * calc_total.replace(",","").replace(",",""))/8760000)).toFixed(7));
						AELBSGDF = String(Number(String((CEF * calc_total.replace(",","").replace(",",""))/1000)).toFixed(7));
						AETONSGDF = String(Number(String((CEF * calc_total.replace(",","").replace(",",""))/1000)/2000).toFixed(10));
					}
					if(AEOLBGDF != null & AEOLBGDF != "" & AEOLBGDF != " ")
					{
						AETONSGDF = String(Number(AEOLBGDF / 2000).toFixed(10));
					}
				arrEmissionGDF ["Pollutant"] = String(PollutantGDF);
				arrEmissionGDF ["EF1 (lb/1,000 gallons)"] = String(EF1GGDF);
				arrEmissionGDF ["EF1 Hourly Rate (lbs/hr)"] = String(EF1HGDF);
				arrEmissionGDF ["EF Origin Code"] = String(EFORGGDF);
				arrEmissionGDF ["HARP EF"] = String(HARPGDF);
				if(CEGDF != null && CEGDF != "")
				{
				arrEmissionGDF ["Control Efficiency"] = String(CEGDF);
				}
				else
				{
				arrEmissionGDF ["Control Efficiency"] = String(" ");   
				}
				if(EFNOTEGDF != null && EFNOTEGDF != "")
				{
				arrEmissionGDF ["EF Note/Memo"] = String(EFNOTEGDF);
				}
				else
				{
				arrEmissionGDF ["EF Note/Memo"] = String(" ");       
				}
				arrEmissionGDF ["Annual Emissions (lbs)"] = String(AELBSGDF);
				if(AEOLBGDF != null && AEOLBGDF != "" && AEOLBGDF != " ")
				{
				arrEmissionGDF ["Annual Emissions Override (lbs)"] = String(AEOLBGDF);
				}
				else
				{
				arrEmissionGDF ["Annual Emissions Override (lbs)"] = String(" ");       
				}
				arrEmissionGDF ["Annual Emissions (tons)"] = String(Number(String(AETONSGDF)).toFixed(10)); // Phil change - reduced number of sigfigs
				arrEmissionGDF ["Calculation Method"] = String(CALCGDF);
				addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionGDF ,thrucapId);            
}//end of Table loop
				capCount++
}//end of table if statement
if (CPEGDF.length == 0 || typeof(CPEGDF.length) == "undefined")
{
				logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
}
				logDebug("Stop Working on Throughput " + capIDString);
//THRU_GDF_CPE_EF1
}//End of GDF If statement
			if(matches(appType[3],"Coatings","Solvents")) 	   {
				var arrEmissionCOAT = [];
				calc_total_VOC = CalcTotalHours1(thrucapId);
				calc_total_GAL = CalcTotalHours(thrucapId);
				var CPECOAT = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
				if(CPECOAT.length > 0)
				{              
					removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
					for (x in CPECOAT)
					{
					emisrowCOAT = CPECOAT[x]; 
					var PollutantCOAT = emisrowCOAT["Pollutant"].toString();
					var EF1GCOAT = emisrowCOAT["EF (lbs/gal)"].toString();
					//var EF1HCOAT = emisrowCOAT["EF1 Hourly Rate (lbs/hr)"].toString();
					var EFORGCOAT = emisrowCOAT["EF Origin Code"].toString();
					var HARPCOAT = emisrowCOAT["HARP EF"].toString();
					var CECOAT = emisrowCOAT["Control Efficiency"].toString();
					var EFNOTECOAT = emisrowCOAT["EF Note/Memo"].toString();
					var AELBSCOAT = emisrowCOAT["Annual Emissions (lbs)"].toString();
					var AEOLBCOAT = emisrowCOAT["Annual Emissions Override (lbs)"].toString();
					var AETONSCOAT = emisrowCOAT["Annual Emissions (tons)"].toString();
					var CALCCOAT = emisrowCOAT["Calculation Method"].toString();
					var EMISLIMCOAT = emisrowCOAT["Emissions Limit"].toString();
					//var LASTUPDATE = emisrowCOAT["Last Update"];
					//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
					if(Number(calc_total_GAL) == 0)
					{
						HARPCOAT = "0";
						EF1GCOAT = "0";
					}
					else
					{
						HARPCOAT = String(Number(calc_total_VOC / calc_total_GAL).toFixed(4));
						EF1GCOAT = String(Number(calc_total_VOC / calc_total_GAL).toFixed(4));
					}
						AETONSCOAT = String(Number(calc_total_VOC / 2000).toFixed(10));
						AELBSCOAT = String(Number(calc_total_VOC).toFixed(4));
					if(AEOLBCOAT != null && AEOLBCOAT != "" && AEOLBCOAT != " ")
					{
						AETONSCOAT = String(Number(AEOLBCOAT / 2000).toFixed(10));
					}
				arrEmissionCOAT["Pollutant"] = String(PollutantCOAT);
				arrEmissionCOAT["EF (lbs/gal)"] = String(EF1GCOAT);
				//arrEmissionCOAT["EF1 Hourly Rate (lbs/hr)"] = String(EF1HCOAT);
				arrEmissionCOAT["EF Origin Code"] = String(EFORGCOAT);
				arrEmissionCOAT["HARP EF"] = String(HARPCOAT);
				if(CECOAT != null && CECOAT != "")
				{
				arrEmissionCOAT["Control Efficiency"] = String(CECOAT);
				}
				else
				{
				arrEmissionCOAT["Control Efficiency"] = String(" "); 
				}
				if(EFNOTECOAT != null && EFNOTECOAT != "")
				{
				arrEmissionCOAT["EF Note/Memo"] = String(EFNOTECOAT);
				}
				else
				{
				arrEmissionCOAT["EF Note/Memo"] = String(" ");     
				}
				arrEmissionCOAT["Annual Emissions (lbs)"] = String(AELBSCOAT);
				if(AEOLBCOAT != null && AEOLBCOAT != "" && AEOLBCOAT != " ")
				{
				arrEmissionCOAT["Annual Emissions Override (lbs)"] = String(AEOLBCOAT);
				}
				else
				{
				arrEmissionCOAT["Annual Emissions Override (lbs)"] = String(" ");     
				}
				arrEmissionCOAT["Annual Emissions (tons)"] = String(AETONSCOAT);
				arrEmissionCOAT["Calculation Method"] = String(CALCCOAT);
				addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionCOAT,thrucapId);   
				}//end of Table loop
				}//end of table if statement
				if (CPECOAT.length == 0 || typeof(CPECOAT.length) == "undefined")
				{
					logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
				}
					logDebug("Stop Working on Throughput " + capIDString);
				capCount++
}//End of COAT If statement
			if(matches(appType[3],"Coffee Roasting")) 		   {
											var arrEmissionCOFF = [];					
											var LBCOFF= getAppSpecific("The total pounds of coffee",thrucapId);
											var NGU= getAppSpecific("Natural Gas Units",thrucapId);
											var calc_total = CalcTotalHours(thrucapId);
											var CPECOFF = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
											if(CPECOFF.length > 0)
											{              
											  removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
												for (x in CPECOFF)
												{
													emisrowCOFF = CPECOFF[x]; 
													var PollutantCOFF = emisrowCOFF["Pollutant"].toString();
													var EF1GCOFF = emisrowCOFF["EF (lbs/ton)"].toString();
													var EF1HCOFF = emisrowCOFF["EF Hourly Rate (lbs/hr)"].toString();
													var EFORGCOFF = emisrowCOFF["EF Origin Code"].toString();
													var HARPCOFF = emisrowCOFF["HARP EF"].toString();
													var CECOFF = emisrowCOFF["Control Efficiency"].toString();
													var EFNOTECOFF = emisrowCOFF["EF Note/Memo"].toString();
													var AELBSCOFF = emisrowCOFF["Annual Emissions (lbs)"].toString();
													var AEOLBCOFF = emisrowCOFF["Annual Emissions Override (lbs)"].toString();
													var AETONSCOFF = emisrowCOFF["Annual Emissions (tons)"].toString();
													var CALCCOFF = emisrowCOFF["Calculation Method"].toString();
													var EMISLIMCOFF = emisrowCOFF["Emissions Limit"].toString();
													//var LASTUPDATE = emisrowCOFF["Last Update"];
													//var TRANSACTIONDATE = emisrowCOAT ["Transaction Date"];
													if(CECOFF != "" && CECOFF != null && CECOFF != " " )
													{
																	EF1HCOFF = Number(String((EF1GCOFF * LBCOFF/2000)*((100 - CECOFF)/100) /calc_total)).toFixed(5).toString();
													}
													else
													{
																	EF1HCOFF = Number((EF1GCOFF * LBCOFF/2000)/calc_total).toFixed(5).toString();
													}
													if(Number(calc_total) != 0) 
													{
																	AELBSCOFF = String(Number(Number(EF1HCOFF) * Number(calc_total)).toFixed(5));
													}
																	AETONSCOFF = Number(String(AELBSCOFF / 2000)).toFixed(10).toString(); 
													if(AEOLBCOFF != null && AEOLBCOFF != "" && AEOLBCOFF != " ")
													{
																	AETONSCOFF = Number(String(AEOLBCOFF / 2000)).toFixed(10).toString();
													}
													arrEmissionCOFF["Pollutant"] = String(PollutantCOFF);
													arrEmissionCOFF["EF (lbs/gal)"] = String(EF1GCOFF);
													arrEmissionCOFF["EF Hourly Rate (lbs/hr)"] = String(EF1HCOFF);
													arrEmissionCOFF["EF Origin Code"] = String(EFORGCOFF);
													arrEmissionCOFF["HARP EF"] = String(HARPCOFF);
													if(CECOFF != null && CECOFF != "")
													{
													arrEmissionCOFF["Control Efficiency"] = String(CECOFF);
													}
													else
													{
													arrEmissionCOFF["Control Efficiency"] = String(" ");  
													}
													if(EFNOTECOFF != null && EFNOTECOFF != "")
													{
													arrEmissionCOFF["EF Note/Memo"] = String(EFNOTECOFF);
													}
													else
													{
													arrEmissionCOFF["EF Note/Memo"] = String(" ");      
													}
													arrEmissionCOFF["Annual Emissions (lbs)"] = String(AELBSCOFF);
													if(AEOLBCOFF != null && AEOLBCOFF != "" && AEOLBCOFF != " ")
													{
													arrEmissionCOFF["Annual Emissions Override (lbs)"] = String(AEOLBCOFF);
													}
													else
													{
													arrEmissionCOFF["Annual Emissions Override (lbs)"] = String(" ");     
													}
													arrEmissionCOFF["Annual Emissions (tons)"] = String(AETONSCOFF);
													arrEmissionCOFF["Calculation Method"] = String(CALCCOFF);
													addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionCOFF,thrucapId);            
											}//end of Table loop
											}//end of table if statement
											if (CPECOFF.length == 0 || typeof(CPECOFF.length) == "undefined")
											{
												logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
											}
												logDebug("Stop Working on Throughput " + capIDString);
											capCount++

																			
							
											
											
							
											
							}//End of COFF If statement         
			if(matches(appType[3],"Concrete"))             	   {
								var arrEmissionCONC = [];
                                var TCB = String(getAppSpecific("Total Concrete batched",thrucapId)).replace(",","");
                                var Units = getAppSpecific("Units",thrucapId);
								 var capModel = pcapresult.getOutput().getCapModel();
								logDebug("Units " + Units);
								editAppSpecific("Process Rate Units", "YD3", thrucapId);
								editAppSpecific("Process Rate Unit Code", "69", thrucapId);
								var ProcessRate = getAppSpecific("Process Rate",thrucapId); 
								logDebug("ProcessRateUnits " + getAppSpecific("Process Rate Units",thrucapId));
                                var calc_total_CONC = CalcTotalHours(thrucapId);
                                var CPECONC = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
                                if(CPECONC.length > 0)
                                {          
								removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);     
								for (x in CPECONC)
								{
									emisrowCONC = CPECONC[x]; 
									var PollutantCONC = emisrowCONC["Pollutant"].toString();
									var EF1GCONC = emisrowCONC["EF (lb/CY)"].toString();
									var EF1HCONC = emisrowCONC["EF Hourly Rate (lb/hr)"].toString();
									var EFORGCONC = emisrowCONC["EF Origin Code"].toString();
									var HARPCONC = emisrowCONC["HARP EF"].toString();
									var CECONC = emisrowCONC["Control Efficiency"].toString();
									var EFNOTECONC = emisrowCONC["EF Note/Memo"].toString();
									var AELBSCONC = emisrowCONC["Annual Emissions (lbs)"].toString();
									var AEOLBCONC = emisrowCONC["Annual Emissions Override (lbs)"].toString();
									var AETONSCONC = emisrowCONC["Annual Emissions (tons)"].toString();
									var CALCCONC = emisrowCONC["Calculation Method"].toString();
									var EMISLIMCONC = emisrowCONC["Emissions Limit"].toString();
									if(Units == "Cubic Yards" && calc_total_CONC != 0.00) 
									{
										EF1HCONC = Number(String((EF1GCONC * TCB) /calc_total_CONC)).toFixed(5).toString();
										editAppSpecific("Process Rate", TCB,thrucapId);
									}
									if(Units == "Tons"&& calc_total_CONC !=0.00) 
									{
										EF1HCONC = Number(String((EF1GCONC / 2.04  * TCB) /calc_total_CONC)).toFixed(5).toString();
										editAppSpecific("Process Rate", Number(TCB/1.96).toFixed(2),thrucapId);
									}
									if(calc_total_CONC != 0.00) 
									{
										AELBSCONC = Number(EF1HCONC * calc_total_CONC).toFixed(5).toString();
									}
									if(AEOLBCONC != null && AEOLBCONC != "" && AEOLBCONC != " ")
									{
										AETONSCONC = Number(String(AEOLBCONC / 2000)).toFixed(10).toString();
									}
									else
									{
										AETONSCONC = Number(String(AELBSCONC / 2000)).toFixed(10).toString();
									}
									arrEmissionCONC["Pollutant"] = String(PollutantCONC);
									arrEmissionCONC["EF (lb/CY)"] = String(EF1GCONC);
									arrEmissionCONC["EF Hourly Rate (lb/hr)"] = String(EF1HCONC);
									arrEmissionCONC["EF Origin Code"] = String(EFORGCONC);
									arrEmissionCONC["HARP EF"] = String(HARPCONC);
									logDebug("HarpEF " + String(HARPCONC));
									if(CECONC != null && CECONC != "")
									{
									arrEmissionCONC["Control Efficiency"] = String(CECONC);
									}
									else
									{
									arrEmissionCONC["Control Efficiency"] = String(" "); 
									}
									if(EFNOTECONC != null && EFNOTECONC != "")
									{
									arrEmissionCONC["EF Note/Memo"] = String(EFNOTECONC);
									}
									else
									{
									arrEmissionCONC["EF Note/Memo"] = String(" ");    
									}
									arrEmissionCONC["Annual Emissions (lbs)"] = String(AELBSCONC);
									if(AEOLBCONC != null && AEOLBCONC != "" && AEOLBCONC != " ")
									{
									arrEmissionCONC["Annual Emissions Override (lbs)"] = String(AEOLBCONC);
									}
									else
									{
									arrEmissionCONC["Annual Emissions Override (lbs)"] = String(" ");    
									}
									arrEmissionCONC["Annual Emissions (tons)"] = String(AETONSCONC);
									arrEmissionCONC["Calculation Method"] = String(CALCCONC);
									addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionCONC,thrucapId);         
					}//end of Table loop
						logDebug("ProcessRate " + getAppSpecific("Process Rate",thrucapId));             
					}//end of table if statement
					
						 var updateResult = aa.cap.editCapByPK(capModel);
						if (updateResult.getSuccess()) {
							aa.print("Record updated successfully.");
						} else {
							aa.print("Failed to update record: " + updateResult.getErrorMessage());
						}
                                
                                if (CPECONC.length == 0 || typeof(CPECONC.length) == "undefined")
                                {
                                                
                                                logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
                                }

                                                logDebug("Stop Working on Throughput " + capIDString);
                                capCount++
                                
                }//End of CONC If statement                        
			if(matches(appType[3],"Crematory"))                {
				var arrEmissionCRM = [];
				var PR  = CalcTotalHours(thrucapId) * 150;
				var CPECRM = loadASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
				if(CPECRM.length > 0)
				{              
					removeASITable("CRITERIA POLLUTANT EMISSION",thrucapId);
					for (x in CPECRM)
					{
						emisrowCRM = CPECRM[x]; 
						var PollutantCRM = emisrowCRM["Pollutant"].toString();
						var EF1GCRM = emisrowCRM["EF (lbs/ton charged)"].toString();
						//var EF1HCRM = emisrowCRM["EF Hourly Rate (lbs/hr)"].toString();
						var EFORGCRM = emisrowCRM["EF Origin Code"].toString();
						var HARPCRM = emisrowCRM["HARP EF"].toString();
						var CECRM = emisrowCRM["Control Efficiency"].toString();
						var EFNOTECRM = emisrowCRM["EF Note/Memo"].toString();
						var AELBSCRM = emisrowCRM["Annual Emissions (lbs)"].toString();
						var AEOLBCRM = emisrowCRM["Annual Emissions Override (lbs)"].toString();
						var AETONSCRM = emisrowCRM["Annual Emissions (tons)"].toString();
						var CALCCRM = emisrowCRM["Calculation Method"].toString();
						var EMISLIMCRM = emisrowCRM["Emissions Limit"].toString();
						AELBSCRM = String((EF1GCRM/2000) * PR );
						HARPCRM = String(Number(EF1GCRM).toFixed(2));
						if(AEOLBCRM != null && AEOLBCRM != "" && AEOLBCRM != " " )
						{
							AETONSCRM = Number(String(AEOLBCRM / 2000)).toFixed(10).toString();
						}
						else
						{
							AETONSCRM = Number(String(AELBSCRM/ 2000)).toFixed(10).toString();
						}
					arrEmissionCRM["Pollutant"] = String(PollutantCRM);
					arrEmissionCRM["EF (lbs/ton charged)"] = String(EF1GCRM);
					//arrEmissionCRM["EF Hourly Rate (lb/hr)"] = String(EF1HCRM);
					arrEmissionCRM["EF Origin Code"] = String(EFORGCRM);
					arrEmissionCRM["HARP EF"] = String(HARPCRM);
					if(CECRM != null && CECRM != "")
					{
					arrEmissionCRM["Control Efficiency"] = String(CECRM);
					}
					else
					{
					arrEmissionCRM["Control Efficiency"] = String(" ");  
					}
					if(EFNOTECRM != null && EFNOTECRM != "")
					{
					arrEmissionCRM["EF Note/Memo"] = String(EFNOTECRM);
					}
					else
					{
					arrEmissionCRM["EF Note/Memo"] = String(" ");      
					}
					arrEmissionCRM["Annual Emissions (lbs)"] = String(AELBSCRM);
					if(AEOLBCRM != null && AEOLBCRM != "" && AEOLBCRM != " ")
					{
					arrEmissionCRM["Annual Emissions Override (lbs)"] = String(AEOLBCRM);
					}
					else
					{
					arrEmissionCRM["Annual Emissions Override (lbs)"] = String(" ");      
					}
					arrEmissionCRM["Annual Emissions (tons)"] = String(AETONSCRM);
					arrEmissionCRM["Calculation Method"] = String(CALCCRM);
					addToASITable("CRITERIA POLLUTANT EMISSION",arrEmissionCRM,thrucapId);    
				}//end of Table loop
				}//end of table if statement
				if (CPECRM.length == 0 || typeof(CPECRM.length) == "undefined")
				{
					logDebug("Throughput Record " + capIDString + " has no rows in CRITERIA POLLUTANT EMISSION");
				}
					logDebug("Stop Working on Throughput " + capIDString);
				capCount++
                }//End of CRM If statement          
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
// perform date arithmetic on a string
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
{

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

function CalcAsphaltprod(itemCap)
{
var total = 0;
                
var TAEU = getAppSpecific("Total amount of Asphalt Emulsion used:",itemCap);
var TSAU = getAppSpecific("Total amount of Sand and Aggregate used:",itemCap);

total = String(Number(TAEU) + Number(TSAU));
                 
editAppSpecific("Total Asphalt Concrete production:",total,itemCap);
                return total;

}

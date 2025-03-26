/*------------------------------------------------------------------------------------------------------/
| Program: Licenses_Set_About_To_Expire.0.js  Trigger: Batch
| Client : Osceola County
|
| Version 1.0 - Base Version. 6/29/2011 - Joseph Cipriano - TruePoint Solutions
|
| Script is run monthly to set the Renewal Expiration Status and Cap Status if the License is about to expire.
| Selects records by the Renewal Expiration Status and Renewal Expiration Date.
| 
| Batch Requirements:
| - Renewal Expiration Status is equal to the "Active".
| - Renewal Expiration Date is less than 62 days from batch run date. 
| - Cap Types processed by batch: Licenses/Tax Collection and Licensing/License/EMP1
|				  Licenses/Tax Collection and Licensing/License/GNB3
|                                 Licenses/Tax Collection and Licensing/License/SPB1
|				  Licenses/Tax Collection and Licensing/License/TRB1
| - Cap Status batch will not process: "Revoked", "Denied", "Suspended", "Closed", "Active - In Renewal" and "Expired".
| - Batch will update the Renewal Expiration Status to "About to Expire" and Cap Status to "Active - About to Expire"
|   when requirements are met.
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;					                                  // Set to true to see debug messages in event log and email confirmation
var maxSeconds = 480 * 60;				                                  // Number of seconds allowed for batch run, usually < 5*60
//Variables needed to log parameters below in eventLog
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
//Global variables

eval(getCustomScriptText("INCLUDES_CUSTOM"));

function getCustomScriptText(vScriptName, useProductScripts) {             
	
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		
		var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		
		return emseScript.getScriptText() + "";
		
	} catch (err) {
		return "";
	}
}

var batchStartDate = new Date();                                                         // System Date
var batchStartTime = batchStartDate.getTime();                                           // Start timer
var timeExpired = false;                                                                 // Variable to identify if batch script has timed out. Defaulted to "false".
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;                                                     // Use Group name when populating App Specific Info Values
var capId;                                                                               // Variable used to hold the Cap Id value.
var customId;                                                                            // Variable used to hold alternate Cap Id string value;
var senderEmailAddr = "Auto_Sender@Accela.com";                                           // Email address of the sender
var emailAddress = "ngraf@truepointsolutions.com;jmckenzi@placer.ca.gov";                                      // Email address of the person who will receive the batch script log information
var emailAddress2 = "";                                    // CC email address of the person who will receive the batch script log information
var emailText = "";                                                                      // Email body
//Parameter variables
var paramsOK = true;
var paramsAppGroup = "Licenses";                                                         // Group value of the Cap Type that the batch script is suppose to process.
var paramsAppType = "Contractor";                                      // Per Type value of the Cap Type that the batch script is suppose to process.
var paramsAppSubType = "Record";                                                        // Per Sub Type value of the Cap Type that the batch script is suppose to process.
var paramsAppCatArray = new Array("NA");                          // Category value of the Cap Type that the batch script is suppose to process.
// Replaced 2-9-12 McKenney: var paramsAppStatusArr = new Array("Suspended","Revoked","Denied","Expired");            // Cap Status of the the Cap.
var paramsAppStatusArr = new Array("Suspended","Revoked","Denied","Expired","Active - In Renewal","Closed");            // Cap Status of the the Cap.
var paramsRenewalExpStatus = "Active";                                                   // Renewal Expiration Status.
/*
| Note: Start Date and End Date are defaulted to use the current System Date.
|       To set the Start Date and End Date to specific values for a manual run
|       replace the following syntax dateAdd(null,-1) to a string date value
|       in the following format "MM/DD/YYYY".
*/
var paramsStartDt = dateAdd(null,0);                                                       // Start Date for the batch script to select ASI data on.
var paramsEndDt = dateAdd(null,+60);                                                     // End Date for the batch script to select ASI data on.
//New field value variables
var newCapStatus = "Active - About to Expire";						 // New Cap Status that will be applied.
var newewRenewalExpStatus = "About to Expire";						 // New Renewal Expiration Status that will be applied.

/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/

if (paramsOK)
        {
        logMessage("START","Start of Licenses_Set_About_To_Expire Batch Job.");

        var licAboutToExpCnt = aboutExpLics();

        logMessage("INFO","Number of records processed: " + licAboutToExpCnt + ".");
	logMessage("END","End of Licenses_Set_About_To_Expire Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
	}

if (emailAddress.length)
	aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for Licenses Set AboutToExpire", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics()
	{
	var capCount = 0;

	var myExp = getTOTrecords();
	

for (i in myExp) // for each b1expiration (effectively, each license app) 
		{
		if (elapsed() > maxSeconds) // Only continue if time hasn't expired
		   {
		   logMessage("**WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
		   timeExpired = true;
		   break;
		   }
capId = "";		
var issue_date = "";   
var exp_date = "";
var data =  myExp[i].split("|");		   
var PERMIT_NBR = data[0];
var PARCEL_NBR = String(data[1]);
var TOT_CERT_NBR = data[2];
var PERMIT_STATUS = data[3];
var ISSUED_DATE = String(data[4]);
if(ISSUED_DATE != "null")
{
var issue_date1 = ISSUED_DATE.split("-");
issue_date = issue_date1[1] + "/" + issue_date1[2].replace(" 00:00:00.0","") + "/" + issue_date1[0];
}
var EXPIRATION_DATE = String(data[5]);
if(EXPIRATION_DATE != "null")
{
var exp_date1 = EXPIRATION_DATE.split("-");
exp_date = exp_date1[1] + "/" + exp_date1[2].replace(" 00:00:00.0","") + "/" + exp_date1[0];
}
var PROPERTY_ADDRESS = data[6];
var PROPERTY_TYPE = data[7];
var PROPERTY_MGR_NAME = data[8];
var PROPERTY_MGR_PHONE = data[9];
var PROPERTY_MGR_EMAIL = data[10];
var PROPERTY_MGR_ADDRESS1 = data[11];
var PROPERTY_MGR_ADDRESS2 = data[12];
var OWNER_NAME = data[13];
var OWNER_PHONE = data[14];
var OWNER_EMAIL = data[15];
var OWNER_ADDRESS = data[16];
var LOCAL_CONTACT_NAME = data[17];
var LOCAL_CONTACT_PHONE = data[18];
var LOCAL_CONTACT_EMAIL = data[19];
var LOCAL_CONTACT_ADDRESS1 = data[20];
var LOCAL_CONTACT_ADDRESS2 = data[21];
var SIGNATORY = data[22];
var PRIMARY_RESIDENCE = data[23];
var ADU_DEED_RESTRICTED = data[24];
var STR_OWNERSHIP = data[25];
var DWELLING_TYPE = data[26];
var NBR_OF_BEDROOMS = data[27];
var REQUESTED_OCCUPANCY = data[28];
var MIN_BEDROOM_REQ_MET = data[29];
var ADDR_VISIBLE_STREET = data[30];
var PARKING_SPACES = data[31];
var PARKING_SPACE_LOCATIONS = data[32];
var SNOW_REMOVAL_BY = data[33];
var NBR_FIRE_EXTINGUISHERS = data[34];
var FIRE_EXTINGUISHER_LOCATION = data[35];
var FIRE_INSP_EXPIRY_DATE = data[36];
var SPRINKLER_SUPPRESSION = data[37];
var NBR_SMOKE_ALARMS = data[38];
var SMOKE_ALARMS_LOCATION = data[39];
var NBR_CO_ALARMS = data[40];
var CO_ALARMS_LOCATION = data[41];
var CELL_PHONE_AVAILABLE = data[42];
var LANDLINE_PHONE = data[43];
var VOIP_PHONE = data[44];
var MONITORED_ALARM = data[45];
var GOOD_NEIGHBOR_AGREEMENT = data[46];
var COMPLIANT_BLD_CODE = data[47];
var RES_BLD_LICENSE = data[48];
var PROPERTY_MGR = data[49];

/*logDebug("PERMIT_NBR = " + PERMIT_NBR);
logDebug("PARCEL_NBR = " + PARCEL_NBR);
logDebug("TOT_CERT_NBR = " + TOT_CERT_NBR);
logDebug("PERMIT_STATUS = " + PERMIT_STATUS );
logDebug("ISSUED_DATE = " + issue_date);
logDebug("EXPIRATION_DATE = " + exp_date);
logDebug("PROPERTY_ADDRESS = " + PROPERTY_ADDRESS);
logDebug("PROPERTY_TYPE = " + PROPERTY_TYPE);
logDebug("PROPERTY_MGR_NAME = " + PROPERTY_MGR_NAME);
logDebug("PROPERTY_MGR_PHONE = " + PROPERTY_MGR_PHONE);
logDebug("PROPERTY_MGR_EMAIL = " + PROPERTY_MGR_EMAIL);
logDebug("PROPERTY_MGR_ADDRESS1 = " + PROPERTY_MGR_ADDRESS1);
logDebug("PROPERTY_MGR_ADDRESS2 = " + PROPERTY_MGR_ADDRESS2);
logDebug("OWNER_NAME = " + OWNER_NAME);
logDebug("OWNER_PHONE = " + OWNER_PHONE);
logDebug("OWNER_EMAIL = " + OWNER_EMAIL );
logDebug("OWNER_ADDRESS = " + OWNER_ADDRESS);
logDebug("LOCAL_CONTACT_NAME = " + LOCAL_CONTACT_NAME);
logDebug("LOCAL_CONTACT_PHONE = " + LOCAL_CONTACT_PHONE);
logDebug("LOCAL_CONTACT_EMAIL = " + LOCAL_CONTACT_EMAIL);
logDebug("LOCAL_CONTACT_ADDRESS1 = " + LOCAL_CONTACT_ADDRESS1);
logDebug("LOCAL_CONTACT_ADDRESS2 = " + LOCAL_CONTACT_ADDRESS2);
logDebug("SIGNATORY = " + SIGNATORY);
logDebug("PRIMARY_RESIDENCE = " + PRIMARY_RESIDENCE);
logDebug("ADU_DEED_RESTRICTED = " + ADU_DEED_RESTRICTED);
logDebug("STR_OWNERSHIP = " + STR_OWNERSHIP);
logDebug("DWELLING_TYPE = " + DWELLING_TYPE);
logDebug("NBR_OF_BEDROOMS = " + NBR_OF_BEDROOMS);
logDebug("REQUESTED_OCCUPANCY = " + REQUESTED_OCCUPANCY);
logDebug("MIN_BEDROOM_REQ_MET = " + MIN_BEDROOM_REQ_MET);
logDebug("ADDR_VISIBLE_STREET = " + ADDR_VISIBLE_STREET);
logDebug("PARKING_SPACES = " + PARKING_SPACES );
logDebug("PARKING_SPACE_LOCATIONS = " + PARKING_SPACE_LOCATIONS);
logDebug("SNOW_REMOVAL_BY = " + SNOW_REMOVAL_BY );
logDebug("NBR_FIRE_EXTINGUISHERS = " + NBR_FIRE_EXTINGUISHERS);
logDebug("FIRE_EXTINGUISHER_LOCATION = " + FIRE_EXTINGUISHER_LOCATION);
logDebug("FIRE_INSP_EXPIRY_DATE = " + FIRE_INSP_EXPIRY_DATE);
logDebug("SPRINKLER_SUPPRESSION = " + SPRINKLER_SUPPRESSION);
logDebug("NBR_SMOKE_ALARMS = " + NBR_SMOKE_ALARMS);
logDebug("SMOKE_ALARMS_LOCATION = " + SMOKE_ALARMS_LOCATION);
logDebug("NBR_CO_ALARMS = " + NBR_CO_ALARMS);
logDebug("CO_ALARMS_LOCATION = " + CO_ALARMS_LOCATION);
logDebug("CELL_PHONE_AVAILABLE = " + CELL_PHONE_AVAILABLE);
logDebug("LANDLINE_PHONE = " + LANDLINE_PHONE);
logDebug("VOIP_PHONE = " + VOIP_PHONE);
logDebug("MONITORED_ALARM = " + MONITORED_ALARM);
logDebug("GOOD_NEIGHBOR_AGREEMENT = " + GOOD_NEIGHBOR_AGREEMENT);
logDebug("COMPLIANT_BLD_CODE = " + COMPLIANT_BLD_CODE);
logDebug("RES_BLD_LICENSE = " + RES_BLD_LICENSE);
logDebug("PROPERTY_MGR = " + PROPERTY_MGR);*/

//Creating TOT Registration records and populating data
if(String(PARCEL_NBR).length == 12)
{
	nparcel = PARCEL_NBR.substring(0,3) + "-" + PARCEL_NBR.substring(3,6) + "-" + PARCEL_NBR.substring(6,9) + "-" + PARCEL_NBR.substring(9,12); //formatting parcel to correct format
}

capidcheck = aa.cap.getCapID(PERMIT_NBR).getOutput();


if(capidcheck != "" && capidcheck != null)
{
	capId = capidcheck;
	var parcelcheck = checkparcelforcap(nparcel,PERMIT_NBR);
	if(parcelcheck == "No Match")
	{
	addParcelAndOwner(nparcel,capId) 
	var RefADDR1 = getRefAdrIDbyParcel(nparcel);
		var refaddr = String(RefADDR1).split(',');
		
		if(refaddr[0] != "")
		{
			
			var addr = aa.address.getRefAddressByPK(refaddr[0]).getOutput();
			var vewaddr = aa.address.createAddressWithRefAddressModel(capId,addr.getRefAddressModel());
		}
		else if(refaddr[0] == "")
		{
			logDebug(nparcel + " has a blank reference address.");
			
		}

		
	}
	
	if(LOCAL_CONTACT_NAME != "null")
		{
			removeContactbyContactType(capId,"Local Contact");
		}
	if(PROPERTY_MGR_NAME != "null")
		{
			removeContactbyContactType(capId,"Property Management Company");
		}	
	if(OWNER_NAME != "null")
		{
			removeContactbyContactType(capId,"Owner");
		}
		

	
}
else
{
	
	if(PERMIT_NBR != "null" && nparcel != "null" && PERMIT_STATUS == "current")
	{
		
		capId = createCap("ShortTermRental/Short Term Rental/NA/NA",TOT_CERT_NBR);
		aa.cap.updateCapAltID(capId,PERMIT_NBR); // change AltId to registation 
		addParcelAndOwner(nparcel,capId);
		var RefADDR1 = getRefAdrIDbyParcel(nparcel);
		var refaddr = String(RefADDR1).split(',');
		
		if(refaddr[0] != "")
		{
			var addr = aa.address.getRefAddressByPK(refaddr[0]).getOutput();
			var vewaddr = aa.address.createAddressWithRefAddressModel(capId,addr.getRefAddressModel());
		}
		else if(refaddr[0] == "")
		{
			logDebug(nparcel + " has a blank reference address.");
			
		}
	}
	
}

if(capId != "")
{
	cap = aa.cap.getCap(capId).getOutput();
	customId = cap.getCapModel().getAltID();
	logDebug("Start working on permit " + customId);
	
	if(PERMIT_STATUS != "null")
	{
	updateAppStatus(PERMIT_STATUS,"Updated by Script",capId);
	}
	if(PROPERTY_ADDRESS != "null")
	{
	updateShortNotes(PROPERTY_ADDRESS,capId);
	}
	if(LOCAL_CONTACT_NAME != "null")
		{
			var contactLC = aa.people.createPeopleModel().getOutput().getPeopleModel();
			contactLC.setContactType("Local Contact");
			addrLC = contactLC.getCompactAddress();
			contactLC.setFullName(LOCAL_CONTACT_NAME);
			if(LOCAL_CONTACT_PHONE != "null")
			{
			contactLC.setPhone1(LOCAL_CONTACT_PHONE);
			}
			if(LOCAL_CONTACT_EMAIL != "null")
			{
			contactLC.setEmail(LOCAL_CONTACT_EMAIL);
			}
			if(LOCAL_CONTACT_ADDRESS1 != "null")
			{
			addrLC.setAddressLine1(LOCAL_CONTACT_ADDRESS1);
			}
			if(LOCAL_CONTACT_ADDRESS2 != "null")
			{
			addrLC.setAddressLine2(LOCAL_CONTACT_ADDRESS2);
			}
			contactLC.setAuditID("ADMIN");
			contactLC.setAuditStatus("A");
			contactLC.setCompactAddress(addrLC);
			aa.people.createCapContactWithRefPeopleModel(capId,contactLC);
		}
		if(PROPERTY_MGR_NAME != "null")
		{
			var contactPMC = aa.people.createPeopleModel().getOutput().getPeopleModel();
			contactPMC.setContactType("Property Management Company");
			addrPMC = contactPMC.getCompactAddress();
			contactPMC.setFullName(PROPERTY_MGR_NAME);
			if(PROPERTY_MGR_ADDRESS1 != "null")
			{
			addrPMC.setAddressLine1(PROPERTY_MGR_ADDRESS1);
			}
			if(PROPERTY_MGR_ADDRESS2 != "null")
			{
			addrPMC.setAddressLine2(PROPERTY_MGR_ADDRESS2);
			}
			if(PROPERTY_MGR_PHONE!= "null")
			{
			contactPMC.setPhone1(PROPERTY_MGR_PHONE);
			}
			if(PROPERTY_MGR_EMAIL != "null")
			{
			contactPMC.setEmail(PROPERTY_MGR_EMAIL);
			}
			contactPMC.setAuditID("ADMIN");
			contactPMC.setAuditStatus("A");
			contactPMC.setCompactAddress(addrPMC);
			aa.people.createCapContactWithRefPeopleModel(capId,contactPMC);
		}
		if(OWNER_NAME != "null")
		{
			var contactO = aa.people.createPeopleModel().getOutput().getPeopleModel();
			contactO.setContactType("Owner");
			addrO = contactO.getCompactAddress();
			contactO.setFullName(OWNER_NAME);
			if(OWNER_ADDRESS != "null")
			{
			addrO.setAddressLine1(OWNER_ADDRESS);
			}
			if(OWNER_PHONE != "null")
			{
			contactO.setPhone1(OWNER_PHONE);
			}
			if(OWNER_EMAIL != "null")
			{
			contactO.setEmail(OWNER_EMAIL);
			}
			contactO.setAuditID("ADMIN");
			contactO.setAuditStatus("A");
			contactO.setCompactAddress(addrO);
			aa.people.createCapContactWithRefPeopleModel(capId,contactO);
		}

	//Update ASI
	if(issue_date != "")
	{
	editAppSpecific("Effective Date",issue_date,capId);
	}
	if(exp_date != "")
	{
	editAppSpecific("Expiration Date",exp_date,capId);
	}
	if(PROPERTY_TYPE!= "null" && PROPERTY_TYPE != null)
	{
	editAppSpecific("Rental Unit Type",PROPERTY_TYPE,capId);
	}
	if(PRIMARY_RESIDENCE == "True")
	{
	editAppSpecific("Primary Residence","CHECKED",capId);//checkbox
	}
	if(ADU_DEED_RESTRICTED == "True")
	{
	editAppSpecific("ADU Deed Restricted","CHECKED",capId);//checkbox
	}
	if(STR_OWNERSHIP!= "null" && STR_OWNERSHIP != null)
	{
	editAppSpecific("Type of Ownership",STR_OWNERSHIP,capId);
	}
	if(DWELLING_TYPE != "null" && DWELLING_TYPE != null)
	{
	editAppSpecific("Primary or Secondary Dwelling",DWELLING_TYPE,capId);
	}
	if(NBR_OF_BEDROOMS != "null" && NBR_OF_BEDROOMS != null)
	{
	editAppSpecific("Number of Bedrooms",Number(NBR_OF_BEDROOMS),capId);
	}
	if(REQUESTED_OCCUPANCY != "null" && REQUESTED_OCCUPANCY != null)
	{
	editAppSpecific("Maximum Occupancy",Number(REQUESTED_OCCUPANCY),capId);
	}
	if(PARKING_SPACES != "null" && PARKING_SPACES != null)
	{
	editAppSpecific("Onsite parking spaces",Number(PARKING_SPACES),capId);
	}
	if(PARKING_SPACE_LOCATIONS != "null" && PARKING_SPACE_LOCATIONS != null)
	{
	editAppSpecific("Parking Space Locations",PARKING_SPACE_LOCATIONS,capId);
	}
	if(SNOW_REMOVAL_BY!= "null" && SNOW_REMOVAL_BY != null)
	{
	editAppSpecific("Snow Removal By",SNOW_REMOVAL_BY,capId);
	}
	if(NBR_FIRE_EXTINGUISHERS != "null" && NBR_FIRE_EXTINGUISHERS != null)
	{
	editAppSpecific("Number of Fire Extinguishers",Number(NBR_FIRE_EXTINGUISHERS),capId);
	}
	if(FIRE_EXTINGUISHER_LOCATION != "null" && FIRE_EXTINGUISHER_LOCATION != null)
	{
	editAppSpecific("Fire Extinguisher Locations",FIRE_EXTINGUISHER_LOCATION,capId);
	}
	if(SPRINKLER_SUPPRESSION == "True")
	{
	editAppSpecific("Sprinkler Suppression System","CHECKED",capId);//checkbox
	}
	if(NBR_SMOKE_ALARMS != "null" && NBR_SMOKE_ALARMS != null)
	{
	editAppSpecific("Number of smoke alarms",Number(NBR_SMOKE_ALARMS),capId);
	}
	if(SMOKE_ALARMS_LOCATION != "null" && SMOKE_ALARMS_LOCATION != null)
	{
	editAppSpecific("Smoke Alarm Locations",SMOKE_ALARMS_LOCATION,capId);
	}
	if(NBR_CO_ALARMS != "null" && NBR_CO_ALARMS != null)
	{
	editAppSpecific("Number of carbon monoxide detectors",Number(NBR_CO_ALARMS),capId);
	}
	if(CO_ALARMS_LOCATION != "null" && CO_ALARMS_LOCATION != null)
	{
	editAppSpecific("Carbon Monoxide Detectors Locations",CO_ALARMS_LOCATION,capId);
	}
	if(CELL_PHONE_AVAILABLE == "True")
	{
	editAppSpecific("Cell phone Available","CHECKED",capId);//checkbox
	}
	if(LANDLINE_PHONE != "null" && LANDLINE_PHONE != null)
	{
	editAppSpecific("Landline Phone Number",LANDLINE_PHONE,capId);
	}
	if(VOIP_PHONE != "null" && VOIP_PHONE != null)
	{
	editAppSpecific("Voice Over Internet Protocol (VoIP)",VOIP_PHONE,capId);
	}
	if(MONITORED_ALARM == "True")
	{
	editAppSpecific("Monitored Alarm System","CHECKED",capId);//checkbox
	}
	if(GOOD_NEIGHBOR_AGREEMENT == "True")
	{
	editAppSpecific("Good Neighbourhood Flyer Agreement","CHECKED",capId);//checkbox
	}
	if(COMPLIANT_BLD_CODE == "True")
	{
	editAppSpecific("Compliant With CA Building Code","CHECKED",capId);//checkbox
	}
	if(RES_BLD_LICENSE != "null" && RES_BLD_LICENSE != null)
	{
	editAppSpecific("Residential Business License",RES_BLD_LICENSE,capId);
	}
	if(PROPERTY_MGR == "Yes")
	{
	editAppSpecific("Rental Management","Professional",capId);
	}
	if(PROPERTY_MGR == "No")
	{
	editAppSpecific("Rental Management","Private",capId);
	}

logDebug("Done working on permit " + customId);
}
if(capId == "")
{
	logDebug("Parcel " + nparcel + " was not updated or had a STR created");
}

capCount++;

		}	  
		   	
	return capCount;
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
function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
	}
}

function matches(eVal,argList) {
   for (var i=1; i<arguments.length;i++)
   	if (arguments[i] == eVal)
   		return true;

}

function isNull(pTestValue,pNewValue)
	{
	if (pTestValue==null || pTestValue=="")
		return pNewValue;
	else
		return pTestValue;
	}

function logMessage(etype,edesc) {
		aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
	aa.print(etype + " : " + edesc);
	emailText+=etype + " : " + edesc + "<br />";
	}

function logDebug(edesc) {
	if (showDebug) {
		aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
		aa.print("DEBUG : " + edesc);
		emailText+="DEBUG : " + edesc + " <br />"; }
	}

function dateAdd(td,amt)
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
		if (!aa.calendar.getNextWorkDay)
			{
			logDebug("**ERROR","getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt))
				{
				dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
				}
			}
		else
			{
			while (i < Math.abs(amt))
				{
				dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
				i++;
				}
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
	}
	
function getTOTrecords()
{
 //var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
 //var ds = initialContext.lookup("java:/AA"); 
 //var conn = ds.getConnection(); 
 var conn = aa.db.getConnection();
var result = new Array();
var PERMIT_NBR = '';
var PARCEL_NBR = '';
var TOT_CERT_NBR = '';
var PERMIT_STATUS = '';
var ISSUED_DATE = '';
var EXPIRATION_DATE = '';
var PROPERTY_ADDRESS = '';
var PROPERTY_TYPE = '';
var PROPERTY_MGR_NAME = '';
var PROPERTY_MGR_PHONE = '';
var PROPERTY_MGR_EMAIL = '';
var PROPERTY_MGR_ADDRESS1 = '';
var PROPERTY_MGR_ADDRESS2 = '';
var OWNER_NAME = '';
var OWNER_PHONE = '';
var OWNER_EMAIL = '';
var OWNER_ADDRESS = '';
var LOCAL_CONTACT_NAME = '';
var LOCAL_CONTACT_PHONE = '';
var LOCAL_CONTACT_EMAIL = '';
var LOCAL_CONTACT_ADDRESS1 = '';
var LOCAL_CONTACT_ADDRESS2 = '';
var SIGNATORY = '';
var PRIMARY_RESIDENCE = '';
var ADU_DEED_RESTRICTED = '';
var STR_OWNERSHIP = '';
var DWELLING_TYPE = '';
var NBR_OF_BEDROOMS = '';
var REQUESTED_OCCUPANCY = '';
var MIN_BEDROOM_REQ_MET = '';
var ADDR_VISIBLE_STREET = '';
var PARKING_SPACES = '';
var PARKING_SPACE_LOCATIONS = '';
var SNOW_REMOVAL_BY = '';
var NBR_FIRE_EXTINGUISHERS = '';
var FIRE_EXTINGUISHER_LOCATION = '';
var FIRE_INSP_EXPIRY_DATE = '';
var SPRINKLER_SUPPRESSION = '';
var NBR_SMOKE_ALARMS = '';
var SMOKE_ALARMS_LOCATION = '';
var NBR_CO_ALARMS = '';
var CO_ALARMS_LOCATION = '';
var CELL_PHONE_AVAILABLE = '';
var LANDLINE_PHONE = '';
var VOIP_PHONE = '';
var MONITORED_ALARM = '';
var GOOD_NEIGHBOR_AGREEMENT = '';
var COMPLIANT_BLD_CODE = '';
var RES_BLD_LICENSE = '';
var PROPERTY_MGR = '';

 var getSQL = "SELECT * FROM DATA_CONV.dbo.STR_PERMITS_DECKARD";
 var sSelect = conn.prepareStatement(getSQL);
 var rs= sSelect.executeQuery(); 
 while(rs.next())
 {

PERMIT_NBR = rs.getString('PERMIT_NBR');
PARCEL_NBR = rs.getString('PARCEL_NBR');
TOT_CERT_NBR = rs.getString('TOT_CERT_NBR');
PERMIT_STATUS = rs.getString('PERMIT_STATUS');
ISSUED_DATE = rs.getString('ISSUED_DATE');
EXPIRATION_DATE = rs.getString('EXPIRATION_DATE');
PROPERTY_ADDRESS = rs.getString('PROPERTY_ADDRESS');
PROPERTY_TYPE = rs.getString('PROPERTY_TYPE');
PROPERTY_MGR_NAME = rs.getString('PROPERTY_MGR_NAME');
PROPERTY_MGR_PHONE = rs.getString('PROPERTY_MGR_PHONE');
PROPERTY_MGR_EMAIL = rs.getString('PROPERTY_MGR_EMAIL');
PROPERTY_MGR_ADDRESS1 = rs.getString('PROPERTY_MGR_ADDRESS1');
PROPERTY_MGR_ADDRESS2 = rs.getString('PROPERTY_MGR_ADDRESS2');
OWNER_NAME = rs.getString('OWNER_NAME');
OWNER_PHONE = rs.getString('OWNER_PHONE');
OWNER_EMAIL = rs.getString('OWNER_EMAIL');
OWNER_ADDRESS = rs.getString('OWNER_ADDRESS');
LOCAL_CONTACT_NAME = rs.getString('LOCAL_CONTACT_NAME');
LOCAL_CONTACT_PHONE = rs.getString('LOCAL_CONTACT_PHONE');
LOCAL_CONTACT_EMAIL = rs.getString('LOCAL_CONTACT_EMAIL');
LOCAL_CONTACT_ADDRESS1 = rs.getString('LOCAL_CONTACT_ADDRESS1');
LOCAL_CONTACT_ADDRESS2 = rs.getString('LOCAL_CONTACT_ADDRESS2');
SIGNATORY = rs.getString('SIGNATORY');
PRIMARY_RESIDENCE = rs.getString('PRIMARY_RESIDENCE');
ADU_DEED_RESTRICTED = rs.getString('ADU_DEED_RESTRICTED');
STR_OWNERSHIP = rs.getString('STR_OWNERSHIP');
DWELLING_TYPE = rs.getString('DWELLING_TYPE');
NBR_OF_BEDROOMS = rs.getString('NBR_OF_BEDROOMS');
REQUESTED_OCCUPANCY = rs.getString('REQUESTED_OCCUPANCY');
MIN_BEDROOM_REQ_MET = rs.getString('MIN_BEDROOM_REQ_MET');
ADDR_VISIBLE_STREET = rs.getString('ADDR_VISIBLE_STREET');
PARKING_SPACES = rs.getString('PARKING_SPACES');
PARKING_SPACE_LOCATIONS = rs.getString('PARKING_SPACE_LOCATIONS');
SNOW_REMOVAL_BY = rs.getString('SNOW_REMOVAL_BY');
NBR_FIRE_EXTINGUISHERS = rs.getString('NBR_FIRE_EXTINGUISHERS');
FIRE_EXTINGUISHER_LOCATION = rs.getString('FIRE_EXTINGUISHER_LOCATION');
FIRE_INSP_EXPIRY_DATE = rs.getString('FIRE_INSP_EXPIRY_DATE');
SPRINKLER_SUPPRESSION = rs.getString('SPRINKLER_SUPPRESSION');
NBR_SMOKE_ALARMS = rs.getString('NBR_SMOKE_ALARMS');
SMOKE_ALARMS_LOCATION = rs.getString('SMOKE_ALARMS_LOCATION');
NBR_CO_ALARMS = rs.getString('NBR_CO_ALARMS');
CO_ALARMS_LOCATION = rs.getString('CO_ALARMS_LOCATION');
CELL_PHONE_AVAILABLE = rs.getString('CELL_PHONE_AVAILABLE');
LANDLINE_PHONE = rs.getString('LANDLINE_PHONE');
VOIP_PHONE = rs.getString('VOIP_PHONE');
MONITORED_ALARM = rs.getString('MONITORED_ALARM');
GOOD_NEIGHBOR_AGREEMENT = rs.getString('GOOD_NEIGHBOR_AGREEMENT');
COMPLIANT_BLD_CODE = rs.getString('COMPLIANT_BLD_CODE');
RES_BLD_LICENSE = rs.getString('RES_BLD_LICENSE');
PROPERTY_MGR = rs.getString('PROPERTY_MGR');

var text = PERMIT_NBR + "|" + PARCEL_NBR + "|" + TOT_CERT_NBR + "|" + PERMIT_STATUS + "|" + ISSUED_DATE + "|" + EXPIRATION_DATE + "|" + PROPERTY_ADDRESS + "|" + PROPERTY_TYPE + "|" + PROPERTY_MGR_NAME + "|" + PROPERTY_MGR_PHONE + "|" + PROPERTY_MGR_EMAIL + "|" + PROPERTY_MGR_ADDRESS1 + "|" + PROPERTY_MGR_ADDRESS2 + "|" + OWNER_NAME + "|" + OWNER_PHONE + "|" + OWNER_EMAIL + "|" + OWNER_ADDRESS + "|" + LOCAL_CONTACT_NAME + "|" + LOCAL_CONTACT_PHONE + "|" + LOCAL_CONTACT_EMAIL + "|" + LOCAL_CONTACT_ADDRESS1 + "|" + LOCAL_CONTACT_ADDRESS2 + "|" + SIGNATORY + "|" + PRIMARY_RESIDENCE + "|" + ADU_DEED_RESTRICTED + "|" + STR_OWNERSHIP + "|" + DWELLING_TYPE + "|" + NBR_OF_BEDROOMS + "|" + REQUESTED_OCCUPANCY + "|" + MIN_BEDROOM_REQ_MET + "|" + ADDR_VISIBLE_STREET + "|" + PARKING_SPACES + "|" + PARKING_SPACE_LOCATIONS + "|" + SNOW_REMOVAL_BY + "|" + NBR_FIRE_EXTINGUISHERS + "|" + FIRE_EXTINGUISHER_LOCATION + "|" + FIRE_INSP_EXPIRY_DATE + "|" + SPRINKLER_SUPPRESSION + "|" + NBR_SMOKE_ALARMS + "|" + SMOKE_ALARMS_LOCATION + "|" + NBR_CO_ALARMS + "|" + CO_ALARMS_LOCATION + "|" + CELL_PHONE_AVAILABLE + "|" + LANDLINE_PHONE + "|" + VOIP_PHONE + "|" + MONITORED_ALARM + "|" + GOOD_NEIGHBOR_AGREEMENT + "|" + COMPLIANT_BLD_CODE + "|" + RES_BLD_LICENSE + "|" + PROPERTY_MGR;
result.push(text); 

 }
 rs.close();
 conn.close();
 return result ;
}

function updateAppStatus(stat,cmt,capid)
	{

	var itemCap = capid;

	var updateStatusResult = aa.cap.updateAppStatus(itemCap,"APPLICATION",stat, sysDate, cmt ,systemUserObj);
	if (updateStatusResult.getSuccess())
		logMessage("INFO"," Updated Application Status to " + stat + " successfully.");
	else
		logMessage("**ERROR","CAP # "+ customId +" Application Status update to " + stat + " was unsuccessful. Application Status will need to be updated manually.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	}

function editAppSpecific(itemName,itemValue,capid)  // optional: itemCap
{
	var updated = false;
	var i=0;

	itemCap = capid;
	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)

			{
                          logMessage("WARNING","CAP # " + customId +", editAppSpecific requires group name prefix when useAppSpecificGroupName is true");
                          //logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ;
                          return false;
                        }

		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	
   	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "")
		{
			while (i < appspecObj.length && !updated)
			{
				if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
				{
					appspecObj[i].setChecklistComment(itemValue);
						
					var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
					if (actionResult.getSuccess()) 
					{	
                                                //logMessage("INFO","CAP # " + customId +", App spec info item " + itemName + " has been given a value of " + itemValue);
						//logDebug("app spec info item " + itemName + " has been given a value of " + itemValue + " for Record " + customId);
					}
					else 
					{
                                                logMessage("**ERROR","CAP # " + customId +", Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " +   actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
						//logDebug("**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " +   actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
					}
						
					updated = true;
					//AInfo[itemName] = itemValue;  // Update array used by this script
				}

				i++;
				
			} // while loop
		} // item name blank
	} // got app specific object	
	else
	{ 
		logDebug( "ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
	}
}

function createCap(pCapType, pAppName) 
	{
	// creates a new application and returns the capID object
	// 07SSP-00037/SP5017
	// ShortTermRental/TOT Registration/NA/NA
	var aCapType = pCapType.split("/");
	if (aCapType.length != 4)
		{
		logDebug("ERROR in createCap.  The following Application Type String is incorrectly formatted: " + pCapType);
		return ("INVALID PARAMETER");
		}
	
	var appCreateResult = aa.cap.createApp(aCapType[0],aCapType[1],aCapType[2],aCapType[3],pAppName);
	//logDebug("Creating cap " + pCapType);
	
	if (!appCreateResult.getSuccess())
		{
		logDebug( "ERROR: creating CAP " + appCreateResult.getErrorMessage());
		return false;
		}

	var newId = appCreateResult.getOutput();
	//logDebug("CAP of type " + pCapType + " created successfully ");
	var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
	//logDebug("capId " + newObj.getCapModel().getAltID() + " created successfully ");
	return newId;
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
		if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
			{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
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
function updateWorkDesc(newWorkDes,itemCap) 
{
		var workDescResult = aa.cap.getCapWorkDesByPK(itemCap);
	var workDesObj;

	if (!workDescResult.getSuccess()) {
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage());
		return false;
	}

	var workDesScriptObj = workDescResult.getOutput();
	if (workDesScriptObj) {
		workDesObj = workDesScriptObj.getCapWorkDesModel();
	} else {
		logDebug("**ERROR: Failed to get workdes Obj: " + workDescResult.getErrorMessage());
		return false;
	}

	workDesObj.setDescription(newWorkDes);
	aa.cap.editCapWorkDes(workDesObj);

	logDebug("Updated Work Description to : " + newWorkDes);

}

function updateShortNotes(newSN,itemCap)
	{

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setShortNotes(newSN);

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("updated short notes to " + newSN) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	}
function addParcelAndOwner(parcel,itemCap) 
{

var prclObj = aa.parcel.getParceListForAdmin(parcel, null, null, null, null, null, null, null, null, null);
			if (prclObj.getSuccess())
				{
				var prclArr = prclObj.getOutput();
				if (prclArr.length)
					{
					var prcl = prclArr[0].getParcelModel();
					prcl.setPrimaryParcelFlag("Y");
					var refParcelNumber = prcl.getParcelNumber();
					var capPrclObj = aa.parcel.warpCapIdParcelModel2CapParcelModel(itemCap, prcl).getOutput();
					var createPMResult = aa.parcel.createCapParcel(capPrclObj);
					}
				}

	// Now the owners
	//

	var parcelListResult = aa.parcel.getParcelDailyByCapID(itemCap, null);
	if (parcelListResult.getSuccess())
		var parcelList = parcelListResult.getOutput();
	else {
		logDebug("**ERROR: Failed to get Parcel List " + parcelListResult.getErrorMessage());
		return false;
	}

	for (var thisP in parcelList) {
		if(parcelList[thisP].getParcelModel().getPrimaryParcelFlag() == "Y")
		{
		var ownerListResult = aa.owner.getOwnersByParcel(parcelList[thisP]);
		if (ownerListResult.getSuccess())
			var ownerList = ownerListResult.getOutput();
		else {
			logDebug("**ERROR: Failed to get Owner List " + ownerListResult.getErrorMessage());
			return false;
		}

		for (var thisO in ownerList) {
			ownerList[thisO].setCapID(itemCap);
			ownerList[thisO].setPrimaryOwner("Y");
			createOResult = aa.owner.createCapOwnerWithAPOAttribute(ownerList[thisO]);

			if (createOResult.getSuccess())
			{
				//logDebug("Created CAP Owner");
			}
			else {
				logDebug("WARNING: Failed to create CAP Owner " + createOResult.getErrorMessage());
			}
		}
		}
	}//end for loop
}//end of function
function createChild(grp,typ,stype,cat,desc,capid,newcapID) 
//
// creates the new application and returns the capID object
//
	{
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(capid, newId); 
		var test = aa.cap.updateCapAltID(newId,newcapID);
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(capid,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
				}
			}
	// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(capid);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}			  

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(capid);
		if (capAddressResult.getSuccess())
			{
			Address = capAddressResult.getOutput();
			for (yy in Address)
				{
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
				}
			}

		// Copy Owners  
		capOwnerResult = aa.owner.getOwnerByCapId(capid);
		if (capOwnerResult.getSuccess())
			{
			Owner = capOwnerResult.getOutput();
			for (yy in Owner)
				{
				newOwner = Owner[yy];
				newOwner.setCapID(newId);
				aa.owner.createCapOwnerWithAPOAttribute(newOwner);
				logDebug("added owner");
				}
			}
		// Copy Work Description 
                copyDetailedDescription(capid, newId);

		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
	}
function copyDetailedDescription(srcCapId, targetCapId)
{
    //1. Get CapWorkDesModel with source CAPID.
    var srcCapWorkDesModel = getCapWorkDesModel(srcCapId);
    if (srcCapWorkDesModel == null)
    {
        return;
    }
    //2. Copy Detailed Description from source to target.
    var targetCapWorkDesModel = srcCapWorkDesModel.getCapWorkDesModel();
    targetCapWorkDesModel.setCapID(targetCapId);
    aa.cap.createCapWorkDes(targetCapWorkDesModel);
}
function getCapWorkDesModel(capid)
{
	capWorkDesModel = null;
	var s_result = aa.cap.getCapWorkDesByPK(capid);
	if(s_result.getSuccess())
	{
		capWorkDesModel = s_result.getOutput();
	}
	else
	{
		logDebug("ERROR: Failed to get CapWorkDesModel: " + s_result.getErrorMessage());
		capWorkDesModel = null;	
	}
	return capWorkDesModel;
}
function createCapComment(vComment,capid) 
{
	var vDispOnInsp = "N";
	var comDate = aa.date.getCurrentDate();
	var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
	capCommentScriptModel.setCapIDModel(capid);
	capCommentScriptModel.setCommentType("APP LEVEL COMMENT");
	capCommentScriptModel.setSynopsis("");
	capCommentScriptModel.setText(vComment);
	capCommentScriptModel.setAuditUser("ADMIN");
	capCommentScriptModel.setAuditStatus("A");
	capCommentScriptModel.setAuditDate(comDate);
	var capCommentModel = capCommentScriptModel.getCapCommentModel();
	capCommentModel.setDisplayOnInsp(vDispOnInsp);
	aa.cap.createCapComment(capCommentModel);
	logDebug("Comment Added");
} 
function updateFileDate(pfileDateStr,itemCapId)
{

if (itemCapId) 
{
                var capResult = aa.cap.getCap(itemCapId);
    var capScriptModel = capResult.getOutput();
                
    if (capScriptModel)
    {
                                //set values for CAP record
        var capModel = capScriptModel.getCapModel();
        capModel.setFileDate(new java.util.Date(pfileDateStr));
            
        var editResult = aa.cap.editCapByPK(capModel);
        if(!editResult.getSuccess())
        {
                logDebug("Failed to update filedate");
        }
                }//end capSciptModelCheck
} //end capId check
} //end function updateFileDate

function checkparcelforcap(parcel,permit)
{
	var check = "No Match";
	var capAddResult = aa.cap.getCapListByParcelID(parcel, null);
        if (capAddResult.getSuccess())
        { 
		var capIdArray = capAddResult.getOutput(); 

        for (cappy in capIdArray)
			{
			if (permit.equals(capIdArray[cappy].getCustomID()))
            check = "Match";
			}
		}
	return check;	
}

function removeContactbyContactType(capid,type)
{
	var contest = aa.people.getCapContactByCapID(capid);
	if(contest.getSuccess())
	{
	var Contacts = contest.getOutput();
	for (yy in Contacts)
	{
	if(Contacts[yy].getPeople().getContactType() == type)
		removeResult = aa.people.removeCapContact(capid, Contacts[yy].getPeople().getContactSeqNumber());
	}
						
	}
}
function getAppSpecific(itemName,itemCap)  // optional: itemCap
{
	var updated = false;
	var i=0;
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
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
		{ logDebug( "ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}


function getRefAdrIDbyParcel(parcelnumber)
{
 //var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
 //var ds = initialContext.lookup("java:/AA"); 
 //var conn = ds.getConnection(); 
var conn = aa.db.getConnection(); 
var result = new Array();
 var B1_ALT_ID = "";
 var getSQL = "SELECT L1_ADDRESS_NBR FROM XPARADDR where L1_PARCEL_NBR = ?";
 var sSelect = conn.prepareStatement(getSQL);
		sSelect.setString(1, parcelnumber);
        var rs= sSelect.executeQuery(); 
 while(rs.next())
 {
  B1_ALT_ID = rs.getString("L1_ADDRESS_NBR");
  
 result.push(B1_ALT_ID); 
 }
 rs.close();
 conn.close();
 return result ;
}
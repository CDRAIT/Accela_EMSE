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
var emailAddress = "ngraf@truepointsolutions.com";                                      // Email address of the person who will receive the batch script log information
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
var data =  myExp[i].split("|");		   
var Parcel_Number = String(data[0]);
var Registration_Number = data[1];
var Registered_Address = data[2];
var Registered_Unit_Number = data[3];
var Permit_Holder_Name_1 = data[4];
var Contact_Email = data[5];
var Registrant_Mailing_Zip_Code = data[6];
var Registrant_Mailing_City = data[7];
var Registrant_Mailing_State = data[8];
var Registrant_Mailing_Unit_Number = data[9];
var Registrant_Mailing_Address = data[10];
var Contact_Phone = data[11];
var Emergency_Contact_Name = data[12];
var Emergency_Contact_Phone = data[13];
var Property_Manager_Postal_Code = data[14];
var Property_Manager_State = data[15];
var Property_Manager_Unit_Number = data[16];
var Property_Manager_Street_Address = data[17];
var Property_Manager_City = data[18];
var Property_Manager_Number = data[19];
var Property_Manager_Email = data[20];
var Property_Manager_Name = data[21];
var Owner_Email = data[22];
var Owner_Mailing_Country = data[23];
var Owner_Mailing_Zip_Code = data[24];
var Owner_Mailing_City = data[25];
var Owner_Mailing_State = data[26];
var Owner_Mailing_Unit_Number = data[27];
var Owner_Mailing_Address = data[28];
var Owner_Phone = data[29];
var Owner_Name_1 = data[30];
var Name_of_the_Garbage_Service_Provider = data[31];	
var Permit_Number = data[32];
var Rental_Management = data[33];
var Has_Bear_Box = data[34];
var ID = data[35];
var Fire_Code = data[36];
var Has_Adequate_Cell_Service = data[37];
var Expiry_date = data[38];
var Approved_Denied_date = data[39];
var Permit_Parking_Spots = data[40];
var Max_Occupancy = data[41];
var Permit_Bedrooms = data[42];
var IS_ACTIVE = data[43];
var Status = data[44];
var Comments = data[45];
var REGISTERED_CITY = data[46];
var REGISTERED_STATE = data[47];
var REGISTERED_STREET_NAME = data[48];
var REGISTERED_STREET_NUMBER = data[49];
var REGISTERED_ZIP = data[50];

test = aa.cap.getCapID(Registration_Number);
						if(test.getSuccess())
						{
							logDebug("Record already exists for " + Registration_Number);
						}

else
{

//Creating TOT Registration records and populating data
if(String(Parcel_Number).length == 12)
{
	nparcel = Parcel_Number.substring(0,3) + "-" + Parcel_Number.substring(3,6) + "-" + Parcel_Number.substring(6,9) + "-" + Parcel_Number.substring(9,12); //formatting parcel to correct format
}
else
{
	nparcel = "No Parcel Number";
}
 var vCapId = createCap("ShortTermRental/TOT Registration/NA/NA",Registration_Number); //create TOT Registration
 aa.cap.updateCapAltID(vCapId,Registration_Number); // change AltId to registation Number
 updateAppStatus(Status,"Updated by Script",vCapId)// update status
 if (Comments != "" && Comments != null && Comments != "null")
 {
 createCapComment(Comments,vCapId);
 }
 if(String(Approved_Denied_date).length == 19)
		{
			var effdate = Approved_Denied_date.substring(5,7) + "/" + Approved_Denied_date.substring(8,10) + "/" + Approved_Denied_date.substring(0,4);
					updateFileDate(effdate,vCapId);
					
		}
  if(nparcel != "No Parcel Number")
  {
	  addParcelAndOwner(nparcel,vCapId); // add parcel and owner from reference data
  }
  if(ID != "" && ID != "null" && ID != null && Registered_Unit_Number != "" && Registered_Unit_Number != "null" && Registered_Unit_Number != null)
  {
	 var ntest =  "Unit Number " + Registered_Unit_Number + " ID Number " + ID;
	updateShortNotes(ntest,vCapId)  //update Rental Property Description with Unit and ID Number
  }
    if((ID == "" || ID == "null" || ID == null) && Registered_Unit_Number != "" && Registered_Unit_Number != "null" && Registered_Unit_Number != null)
  {
	 var ntest =  "Unit Number " + Registered_Unit_Number;
	updateShortNotes(ntest,vCapId)   //update Rental Property Description with Unit Number only
  }
   if(Registered_Address != "" && Registered_Address != "null" && Registered_Address != null) //
  {
	updateWorkDesc(Registered_Address,vCapId) // update Detailed Description
	var address1 = com.accela.aa.aamain.address.AddressModel();//create blank address model
	address1.setServiceProviderCode("PLACERCO");
	address1.setAuditID("ADMIN");
	address1.setSourceFlag("Adr");
	address1.setAuditStatus("A");
	address1.setPrimaryFlag("Y");
	address1.setAddressStatus("A");
	if(REGISTERED_STREET_NUMBER != null && REGISTERED_STREET_NUMBER != "" && REGISTERED_STREET_NUMBER != "null")
	{
	address1.setHouseNumberStart(parseFloat(REGISTERED_STREET_NUMBER));
	}
    address1.setStreetName(REGISTERED_STREET_NAME);
	if(REGISTERED_CITY == "" || REGISTERED_CITY == "null" || REGISTERED_CITY == null)
	{
    address1.setCity("");
	}
	else
	{
		address1.setCity(REGISTERED_CITY);
	}
	if(REGISTERED_STATE == "" || REGISTERED_STATE == "null" || REGISTERED_STATE == null)
	{
    address1.setState("");
	}
	else
	{
		address1.setState(REGISTERED_STATE);
	}
	if(REGISTERED_ZIP == "" || REGISTERED_ZIP == "null" || REGISTERED_ZIP == null)
	{
    address1.setZip("");
	}
	else
	{
		address1.setZip(REGISTERED_ZIP);
	}
	aa.address.createAddressWithAPOAttribute(vCapId, address1);//create cap address
  }
  if(Permit_Holder_Name_1 != "" && Permit_Holder_Name_1 != "null" && Permit_Holder_Name_1 != null)
	{
	var contact1 = aa.people.createPeopleModel().getOutput().getPeopleModel();
	contact1.setContactType("Contact");
	addr = contact1.getCompactAddress();
	contact1.setFullName(Permit_Holder_Name_1);
	if(Registrant_Mailing_Address != "null")
	{
	addr.setAddressLine1(Registrant_Mailing_Address);
	}
	if(Registrant_Mailing_City != "null")
	{
	addr.setCity(Registrant_Mailing_City);
	}
	if(Registrant_Mailing_State != "null")
	{
	addr.setState(Registrant_Mailing_State);
	}
	if(Registrant_Mailing_Zip_Code != "null")
	{
	addr.setZip(Registrant_Mailing_Zip_Code);
	}
	if(Registrant_Mailing_Unit_Number != "null")
	{
	addr.setAddressLine2(Registrant_Mailing_Unit_Number);
	}
	if(Contact_Phone != "null")
	{
	contact1.setPhone1(Contact_Phone);
	}
	if(Contact_Email != "null")
	{
	contact1.setEmail(Contact_Email);
	}
	contact1.setAuditID("ADMIN");
	contact1.setAuditStatus("A");
	contact1.setCompactAddress(addr);
	aa.people.createCapContactWithRefPeopleModel(vCapId,contact1);
	}
	editAppSpecific("Registration Number",Registration_Number,vCapId);
	// create short term rental if exists
	if(Permit_Number != "null")
	{
		var newcapID = createChild("ShortTermRental","Short Term Rental","NA","NA",Registration_Number,vCapId,Permit_Number);
		if(Comments != "" && Comments != null && Comments != "null")
		 {
		 createCapComment(Comments,newcapID);
		 }
		if(IS_ACTIVE == "Yes")
		{
			updateAppStatus("Pending Renewal","Updated by Script",newcapID)
		}
		if(IS_ACTIVE != "Yes")
		{
			updateAppStatus("Inactive","Updated by Script",newcapID)
		}
		if(Emergency_Contact_Name != "null")
		{
			var contactLC = aa.people.createPeopleModel().getOutput().getPeopleModel();
			contactLC.setContactType("Local Contact");
			addrLC = contactLC.getCompactAddress();
			contactLC.setFullName(Emergency_Contact_Name);
			if(Emergency_Contact_Phone != "null")
			{
			contactLC.setPhone1(Emergency_Contact_Phone);
			}
			contactLC.setAuditID("ADMIN");
			contactLC.setAuditStatus("A");
			contactLC.setCompactAddress(addrLC);
			aa.people.createCapContactWithRefPeopleModel(newcapID,contactLC);
		}
		if(Property_Manager_Name != "null")
		{
			var contactPMC = aa.people.createPeopleModel().getOutput().getPeopleModel();
			contactPMC.setContactType("Property Management Company");
			addrPMC = contactPMC.getCompactAddress();
			contactPMC.setFullName(Property_Manager_Name);
			if(Property_Manager_Street_Address != "null")
			{
			addrPMC.setAddressLine1(Property_Manager_Street_Address);
			}
			if(Property_Manager_City != "null")
			{
			addrPMC.setCity(Property_Manager_City);
			}
			if(Property_Manager_State != "null")
			{
			addrPMC.setState(Property_Manager_State);
			}
			if(Property_Manager_Postal_Code != "null")
			{
			addrPMC.setZip(Property_Manager_Postal_Code);
			}
			if(Property_Manager_Unit_Number != "null")
			{
			addrPMC.setAddressLine2(Property_Manager_Unit_Number);
			}
			if(Property_Manager_Number != "null")
			{
			contactPMC.setPhone1(Property_Manager_Number);
			}
			if(Property_Manager_Email != "null")
			{
			contactPMC.setEmail(Property_Manager_Email);
			}
			contactPMC.setAuditID("ADMIN");
			contactPMC.setAuditStatus("A");
			contactPMC.setCompactAddress(addrPMC);
			aa.people.createCapContactWithRefPeopleModel(newcapID,contactPMC);
		}
		if(Owner_Name_1 != "null")
		{
			var contactO = aa.people.createPeopleModel().getOutput().getPeopleModel();
			contactO.setContactType("Owner");
			addrO = contactO.getCompactAddress();
			contactO.setFullName(Owner_Name_1);
			if(Owner_Mailing_Address != "null")
			{
			addrO.setAddressLine1(Owner_Mailing_Address);
			}
			if(Owner_Mailing_City != "null")
			{
			addrO.setCity(Owner_Mailing_City);
			}
			if(Owner_Mailing_State != "null")
			{
			addrO.setState(Owner_Mailing_State);
			}
			if(Owner_Mailing_Zip_Code != "null")
			{
			addrO.setZip(Owner_Mailing_Zip_Code);
			}
			if(Owner_Mailing_Unit_Number != "null")
			{
			addrO.setAddressLine2(Owner_Mailing_Unit_Number);
			}
			if(Owner_Phone != "null")
			{
			contactO.setPhone1(Owner_Phone);
			}
			if(Owner_Email != "null")
			{
			contactO.setEmail(Owner_Email);
			}
			if(Owner_Mailing_Country != "null")
			{
			contactO.setCountry(Owner_Mailing_Country);
			}
			contactO.setAuditID("ADMIN");
			contactO.setAuditStatus("A");
			contactO.setCompactAddress(addrO);
			aa.people.createCapContactWithRefPeopleModel(newcapID,contactO);
		}
		editAppSpecific("TOT Registration Number",Registration_Number,newcapID);
		editAppSpecific("Garbage Service Provider",Name_of_the_Garbage_Service_Provider,newcapID);
		if(Rental_Management == "professionally_managed")
		{
		editAppSpecific("Rental Management","Professional",newcapID);
		}
		if(Rental_Management == "privately_managed")
		{
		editAppSpecific("Rental Management","Private",newcapID);
		}
		editAppSpecific("Has Bear Box",Has_Bear_Box,newcapID);
		editAppSpecific("ID Number",ID,newcapID);
		if(Fire_Code == "CAL FIRE/USFS")
		{
		editAppSpecific("Fire District","Cal Fire/USF",newcapID);
		}
		if(Fire_Code == "NORTH TAHOE FPD")
		{
		editAppSpecific("Fire District","North Tahoe FPD",newcapID);
		}
		if(Fire_Code == "SQUAW VALLEY PSD")
		{
		editAppSpecific("Fire District","Squaw Valley PSD",newcapID);
		}
		if(Fire_Code == "TRUCKEE FPD")
		{
		editAppSpecific("Fire District","Truckee FPD",newcapID);
		}
		if(Fire_Code == "NORTH STAR CSD")
		{
		editAppSpecific("Fire District","North Star CSD",newcapID);
		}
		if(Fire_Code == "ALPINE SPRINGS COUNTY WATER DISTRICT")
		{
		editAppSpecific("Fire District","North Tahoe FPD",newcapID);
		}
		if(!matches(Fire_Code,"NORTH STAR CSD","NORTH STAR CSD","TRUCKEE FPD","SQUAW VALLEY PSD","NORTH TAHOE FPD","CAL FIRE/USFS","ALPINE SPRINGS COUNTY WATER DISTRICT"))
		{	
		editAppSpecific("Fire District","North Tahoe FPD",newcapID);
		}
		editAppSpecific("Adequate Cell Service",Has_Adequate_Cell_Service,newcapID);
		editAppSpecific("Onsite Parking",Permit_Parking_Spots,newcapID);
		editAppSpecific("Maximum Occupancy",Max_Occupancy,newcapID);
		editAppSpecific("Number of Bedrooms",Permit_Bedrooms,newcapID);
		if(String(Approved_Denied_date).length == 19)
		{
			var effdate = Approved_Denied_date.substring(5,7) + "/" + Approved_Denied_date.substring(8,10) + "/" + Approved_Denied_date.substring(0,4);
					editAppSpecific("Effective Date",effdate,newcapID);
					updateFileDate(effdate,newcapID);
					
		}
		if(String(Expiry_date).length == 19)
		{
			var expdate = Expiry_date.substring(5,7) + "/" + Expiry_date.substring(8,10) + "/" + Expiry_date.substring(0,4);
					editAppSpecific("Expiration Date",expdate,newcapID);
		}		
		
	}
 
			   capCount++;
		}
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
var Parcel_Number = "";
var Registration_Number = "";
var Registered_Address = "";
var Registered_Unit_Number = "";
var Permit_Holder_Name_1 = "";
var Contact_Email = "";
var Registrant_Mailing_Zip_Code = "";
var Registrant_Mailing_City = "";
var Registrant_Mailing_State = "";
var Registrant_Mailing_Unit_Number = "";
var Registrant_Mailing_Address = "";
var Contact_Phone = "";
var Emergency_Contact_Name = "";
var Emergency_Contact_Phone = "";
var Property_Manager_Postal_Code = "";
var Property_Manager_State = "";
var Property_Manager_Unit_Number = "";
var Property_Manager_Street_Address = "";
var Property_Manager_City = "";
var Property_Manager_Number = "";
var Property_Manager_Email = "";
var Property_Manager_Name = "";
var Owner_Email = "";
var Owner_Mailing_Country = "";
var Owner_Mailing_Zip_Code = "";
var Owner_Mailing_City = "";
var Owner_Mailing_State = "";
var Owner_Mailing_Unit_Number = "";
var Owner_Mailing_Address = "";
var Owner_Phone = "";
var Owner_Name_1 = "";
var Name_of_the_Garbage_Service_Provider = "";	
var Permit_Number = "";
var Rental_Management = "";
var Has_Bear_Box = "";
var ID = "";
var Fire_Code = "";
var Has_Adequate_Cell_Service = "";
var Expiry_date = "";
var Approved_Denied_date = "";
var Permit_Parking_Spots = "";
var Max_Occupancy = "";
var Permit_Bedrooms = "";
var IS_ACTIVE = "";
var Status = "";
var Comments = "";
var REGISTERED_CITY = "";
var REGISTERED_STATE = "";
var REGISTERED_STREET_NAME = "";
var REGISTERED_STREET_NUMBER = "";
var REGISTERED_ZIP = "";


 var getSQL = "SELECT * FROM ACCELA.AA_CONV_STR_DATA";
 var sSelect = conn.prepareStatement(getSQL);
 var rs= sSelect.executeQuery(); 
 while(rs.next())
 {
Parcel_Number = rs.getString("PARCEL_NUMBER");
Registration_Number = rs.getString("REGISTRATION_NUMBER");
Registered_Address = rs.getString("REGISTERED_ADDRESS");
Registered_Unit_Number = rs.getString("REGISTERED_UNIT_NUMBER");
Permit_Holder_Name_1 = rs.getString("PERMIT_HOLDER_NAME_1");
Contact_Email = rs.getString("CONTACT_EMAIL");
Registrant_Mailing_Zip_Code = rs.getString("REGISTRANT_MAILING_ZIP_CODE");
Registrant_Mailing_City = rs.getString("REGISTRANT_MAILING_CITY");
Registrant_Mailing_State = rs.getString("REGISTRANT_MAILING_STATE");
Registrant_Mailing_Unit_Number = rs.getString("REGISTRANT_MAILING_UNIT_NBR");
Registrant_Mailing_Address = rs.getString("REGISTRANT_MAILING_ADDR");
Contact_Phone = rs.getString("CONTACT_PHONE");
Emergency_Contact_Name = rs.getString("EMERGENCY_CONTACT_NAME");
Emergency_Contact_Phone = rs.getString("EMERGENCY_CONTACT_PHONE");
Property_Manager_Postal_Code = rs.getString("PROPERTY_MANAGER_POSTAL_CODE");
Property_Manager_State = rs.getString("PROPERTY_MANAGER_STATE");
Property_Manager_Unit_Number = rs.getString("PROPERTY_MANAGER_UNIT_NBR");
Property_Manager_Street_Address = rs.getString("PROPERTY_MANAGER_STREET_ADDR");
Property_Manager_City = rs.getString("PROPERTY_MANAGER_CITY");
Property_Manager_Number = rs.getString("PROPERTY_MANAGER_NUMBER");
Property_Manager_Email = rs.getString("PROPERTY_MANAGER_EMAIL");
Property_Manager_Name = rs.getString("PROPERTY_MANAGER_NAME");
Owner_Email = rs.getString("OWNER_EMAIL");
Owner_Mailing_Country = rs.getString("OWNER_MAILING_COUNTRY");
Owner_Mailing_Zip_Code = rs.getString("OWNER_MAILING_ZIP_CODE");
Owner_Mailing_City = rs.getString("OWNER_MAILING_CITY");
Owner_Mailing_State = rs.getString("OWNER_MAILING_STATE");
Owner_Mailing_Unit_Number = rs.getString("OWNER_MAILING_UNIT_NUMBER");
Owner_Mailing_Address = rs.getString("OWNER_MAILING_ADDR");
Owner_Phone = rs.getString("OWNER_PHONE");
Owner_Name_1 = rs.getString("OWNER_NAME_1");
Name_of_the_Garbage_Service_Provider = rs.getString("GARBAGE_SERVICE_PROVIDER");	
Permit_Number = rs.getString("PERMIT_NUMBER");
Rental_Management = rs.getString("RENTAL_MANAGEMENT");
Has_Bear_Box = rs.getString("HAS_BEAR_BOX");
ID = rs.getString("ID");
Fire_Code = rs.getString("FIRE_CODE");
Has_Adequate_Cell_Service = rs.getString("HAS_ADEQUATE_CELL_SERVICE");
Expiry_date = rs.getString("EXPIRY_DATE");
Approved_Denied_date = rs.getString("APPROVED_DENIED_DATE");
Permit_Parking_Spots = rs.getString("PERMIT_PARKING_SPOTS");
Max_Occupancy = rs.getString("MAX_OCCUPANCY");
Permit_Bedrooms = rs.getString("PERMIT_BEDROOMS");
IS_ACTIVE = rs.getString("IS_ACTIVE");
Status = rs.getString("STATUS");
Comments = rs.getString("MOST_RECENT_COMMENT");
REGISTERED_CITY = rs.getString("REGISTERED_CITY");
REGISTERED_STATE = rs.getString("REGISTERED_STATE");
REGISTERED_STREET_NAME = rs.getString("REGISTERED_STREET_NAME");
REGISTERED_STREET_NUMBER = rs.getString("REGISTERED_STREET_NUMBER");
REGISTERED_ZIP = rs.getString("REGISTERED_ZIP");

var text = Parcel_Number + "|" + Registration_Number + "|" + Registered_Address + "|" + Registered_Unit_Number + "|" + Permit_Holder_Name_1 + "|" + Contact_Email + "|" + Registrant_Mailing_Zip_Code + "|" + Registrant_Mailing_City + "|" + Registrant_Mailing_State + "|" + Registrant_Mailing_Unit_Number + "|" + Registrant_Mailing_Address + "|" + Contact_Phone + "|" + Emergency_Contact_Name + "|" + Emergency_Contact_Phone + "|" + Property_Manager_Postal_Code + "|" + Property_Manager_State + "|" + Property_Manager_Unit_Number + "|" + Property_Manager_Street_Address + "|" + Property_Manager_City + "|" + Property_Manager_Number + "|" + Property_Manager_Email + "|" + Property_Manager_Name + "|" + Owner_Email + "|" + Owner_Mailing_Country + "|" + Owner_Mailing_Zip_Code + "|" + Owner_Mailing_City + "|" + Owner_Mailing_State + "|" + Owner_Mailing_Unit_Number + "|" + Owner_Mailing_Address + "|" + Owner_Phone + "|" + Owner_Name_1 + "|" + Name_of_the_Garbage_Service_Provider + "|" + Permit_Number + "|" + Rental_Management + "|" + Has_Bear_Box + "|" + ID + "|" + Fire_Code + "|" + Has_Adequate_Cell_Service + "|" + Expiry_date + "|" + Approved_Denied_date + "|" + Permit_Parking_Spots + "|" + Max_Occupancy + "|" + Permit_Bedrooms + "|" + IS_ACTIVE + "|" + Status + "|" + Comments + "|" + REGISTERED_CITY + "|" + REGISTERED_STATE + "|" + REGISTERED_STREET_NAME + "|" + REGISTERED_STREET_NUMBER + "|" + REGISTERED_ZIP; 
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
                          logMessage("**WARNING","CAP # " + customId +", editAppSpecific requires group name prefix when useAppSpecificGroupName is true");
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
						//logDebug("app spec info item " + itemName + " has been given a value of " + itemValue);
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
		logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
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
		logDebug("**ERROR in createCap.  The following Application Type String is incorrectly formatted: " + pCapType);
		return ("INVALID PARAMETER");
		}
	
	var appCreateResult = aa.cap.createApp(aCapType[0],aCapType[1],aCapType[2],aCapType[3],pAppName);
	//logDebug("Creating cap " + pCapType);
	
	if (!appCreateResult.getSuccess())
		{
		logDebug( "**ERROR: creating CAP " + appCreateResult.getErrorMessage());
		return false;
		}

	var newId = appCreateResult.getOutput();
	//logDebug("CAP of type " + pCapType + " created successfully ");
	var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
	logDebug("capId " + newObj.getCapModel().getAltID() + " created successfully ");
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
		aa.print("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage());
		return false;
	}

	var workDesScriptObj = workDescResult.getOutput();
	if (workDesScriptObj) {
		workDesObj = workDesScriptObj.getCapWorkDesModel();
	} else {
		aa.print("**ERROR: Failed to get workdes Obj: " + workDescResult.getErrorMessage());
		return false;
	}

	workDesObj.setDescription(newWorkDes);
	aa.cap.editCapWorkDes(workDesObj);

	aa.print("Updated Work Description to : " + newWorkDes);

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
		var ownerListResult = aa.owner.getOwnersByParcel(parcelList[thisP]);
		if (ownerListResult.getSuccess())
			var ownerList = ownerListResult.getOutput();
		else {
			logDebug("**ERROR: Failed to get Owner List " + ownerListResult.getErrorMessage());
			return false;
		}

		for (var thisO in ownerList) {
			ownerList[thisO].setCapID(itemCap);
			createOResult = aa.owner.createCapOwnerWithAPOAttribute(ownerList[thisO]);

			if (createOResult.getSuccess())
				logDebug("Created CAP Owner");
			else {
				logDebug("**WARNING: Failed to create CAP Owner " + createOResult.getErrorMessage());
			}
		}
	}
}
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
		aa.print("ERROR: Failed to get CapWorkDesModel: " + s_result.getErrorMessage());
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
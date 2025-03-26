/*------------------------------------------------------------------------------------------------------/
| Program: LicenseSetAboutToExpire  Trigger: Batch
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
var emailAddress = "ngraf@truepointsolutions.com";                                      // Email address of the person who will receive the batch script log information
var emailAddress2 = "rmoore@placer.ca.gov";                                             // CC email address of the person who will receive the batch script log information
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
    logMessage("START", "Start of Sending of Permit Batch Job.");

    var licAboutToExpCnt = aboutExpLics();

    logMessage("INFO", "Number of records processed: " + licAboutToExpCnt + ".");
    logMessage("END", "End of Sending of Permit Batch Job: Elapsed Time : " + elapsed() + " Seconds.");
}

if (emailAddress.length)
    aa.sendMail(senderEmailAddr, emailAddress, emailAddress2, batchJobName + " Results for Sending of Permit", emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function aboutExpLics() {
    var capCount = 0;
    var expResult = aa.cap.getCapIDsByAppSpecificInfoField("Quarter Billing","1st qtr");
    if (!expResult.getSuccess()) {
        logMessage("**ERROR", "Retrieving records by Renewal Licenses Expiration Date and Status. Reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage());

        return false;
    }

    var myExp = expResult.getOutput();

    for (i in myExp) // for each b1expiration (effectively, each license app) 
    {
        if (elapsed() > maxSeconds) // Only continue if time hasn't expired
        {
            logMessage("**WARNING", "A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
            timeExpired = true;
            break;
        }

        var oldcapId = myExp[i].getCapID(); // CapIDModel Object
		var fcap = aa.cap.getCap(oldcapId).getOutput();
		var fstatus = fcap.getCapStatus();
        var capchildren = getChildren("AirQuality/Stationary Source/Permit to Operate/*",oldcapId);
		var childcount = getChildrencount("AirQuality/Stationary Source/Permit to Operate/*",oldcapId);
		
		if(fstatus == "Active" )
		{
		 for(eachchild in capchildren)
		 {
			 var eachChildCapId = capchildren[eachchild];
			 var childcap = aa.cap.getCap(eachChildCapId).getOutput();
			 var pcapId = getParentPlacer(childcap.getCapID());
			 var customID = eachChildCapId.getCustomID();
			 var catergory = childcap.getCapType().getCategory();
			 var status = childcap.getCapStatus();
	
			 
		     //add boiler fee
			if (catergory == "Boilers" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
                        //add coating fee 
			if (catergory == "Coating" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Coating" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "HP")
			{
				addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
                        //add Control Equipment fee 
			if (catergory == "Control Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Control Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "HP")
			{
				addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
            if (catergory == "Control Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "KVA")
			{
				addFee("AQ_P_ELECENG","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECENG","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECENG",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Control Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "GAL")
			{
				addFee("AQ_P_STATCON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_STATCON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_STATCON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Control Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "SEMI")
			{
				addFee("AQ_P_SEMICON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_SEMICON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_SEMICON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Control Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "EXCEP")
			{
				addFee("AQ_P_PFE","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_PFE","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_PFE",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			//add Dry Cleaning fee
			if (catergory == "Dry Cleaning" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "EXCEP")
			{ 
				addFee("AQ_P_PFE","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_PFE","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_PFE",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
            //add Engine fee 
			if (catergory == "Engine" && (status == "ACTIVE" || status == "Active") && getAppSpecific("IC Engine",childcap.getCapID()) == "Yes" && Number(getAppSpecific("Power Rating",childcap.getCapID())) < 4000)
			{ 
				addFee("AQ_P_PFE","AQ_FAC","FINAL",1,"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_PFE","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_PFE",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Engine" && (status == "ACTIVE" || status == "Active") && getAppSpecific("IC Engine",childcap.getCapID()) == "Yes" && Number(getAppSpecific("Power Rating",childcap.getCapID())) >= 4000)
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Engine" && (status == "ACTIVE" || status == "Active") && getAppSpecific("IC Engine",childcap.getCapID()) != "Yes" && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "HP")
			{
				addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Engine" && (status == "ACTIVE" || status == "Active") && getAppSpecific("IC Engine",childcap.getCapID()) != "Yes" && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			//add Graphics Arts fee 
			if (catergory == "Graphics Arts" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Graphics Arts" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "HP")
			{
				addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Graphics Arts" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "KVA")
			{
				addFee("AQ_P_ELECENG","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECENG","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECENG",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			//add Miscellaneous Combustion fee 
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "HP")
			{
				addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "KVA")
			{
				addFee("AQ_P_ELECENG","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECENG","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECENG",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "GAL")
			{
				addFee("AQ_P_STATCON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_STATCON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_STATCON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "SEMI")
			{
				addFee("AQ_P_SEMICON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_SEMICON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_SEMICON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "EXCEP")
			{
				addFee("AQ_P_PFE","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_PFE","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_PFE",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Combustion" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "SQFT")
			{
				addFee("AQ_P_INCINER","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_INCINER","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_INCINER",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			//add Miscellaneous Equipment fee 
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "MMBtu/hr")
			{ 
				addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "HP")
			{
				addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "KVA")
			{
				addFee("AQ_P_ELECENG","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_ELECENG","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_ELECENG",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "GAL")
			{
				addFee("AQ_P_STATCON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_STATCON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_STATCON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "SEMI")
			{
				addFee("AQ_P_SEMICON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_SEMICON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_SEMICON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "EXCEP")
			{
				addFee("AQ_P_PFE","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_PFE","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_PFE",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if (catergory == "Miscellaneous Equipment" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "SQFT")
			{
				addFee("AQ_P_INCINER","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_INCINER","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_INCINER",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			 //add Stationary Container fee
			if (catergory == "Stationary Container" && (status == "ACTIVE" || status == "Active") && getAppSpecific("Renewal Fee Rating Type",childcap.getCapID()) == "GAL")
			{ 
				addFee("AQ_P_STATCON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
				updatefeenotes(pcapId,"AQ_P_STATCON","null",customID);
				var fee = feeAmountbynotes(pcapId,"AQ_P_STATCON",customID,sysDate.getYear());
                editAppSpecific("Current Fee Total",fee,childcap.getCapID());
			}
			if ((catergory == "Vapor Recovery AST" || catergory == "Vapor Recovery UST") && (status == "ACTIVE" || status == "Active"))
			{
				var rating = getAppSpecific("Number of Gasoline Dispensing Nozzles",childcap.getCapID());
				if (Number(rating) >= 1)
				{
					var NozValue = lookup("PO_Gas_Nozzle_Fee",Nozrating(rating));
					var value = (Number(NozValue) - Number(getAppSpecific("Last Year Nozzle Fee",childcap.getCapID())))/Number(getAppSpecific("Last Year Nozzle Fee",childcap.getCapID()));
					var LYNF = getAppSpecific("Last Year Nozzle Fee",childcap.getCapID())
					if(Number(value) > .15) 
					{
						if(LYNF != 0)
						{	
						var newfee = (Number(LYNF) + Number(LYNF) * .15);
						}
						if(LYNF == 0)
						{
						var newfee = Number(NozValue);
						}
						addFee("AQ_P_MGASFUL","AQ_FAC","FINAL",newfee.toFixed(2),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_MGASFUL","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_MGASFUL",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
						editAppSpecific("Last Year Nozzle Fee",fee,childcap.getCapID());
						addFee("AQ_GDFTRE","AQ_FAC","FINAL",1,"N",pcapId);
						updatefeenotes(pcapId,"AQ_GDFTRE","null",customID);
					}
					if(Number(value) <= .15)
					{
						addFee("AQ_P_GASFUEL","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_GASFUEL","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_GASFUEL",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
						editAppSpecific("Last Year Nozzle Fee",fee,childcap.getCapID());
						addFee("AQ_GDFTRE","AQ_FAC","FINAL",1,"N",pcapId);
						updatefeenotes(pcapId,"AQ_GDFTRE","null",customID);
					}
				}
				if (Number(rating) == 0)
				{
					var RFRT = getAppSpecific("Renewal Fee Rating Type",childcap.getCapID());
					if (RFRT == "MMBtu/hr")
					{ 
						addFee("AQ_P_BURNHTR","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_BURNHTR","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_BURNHTR",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
					if (RFRT == "HP")
					{
						addFee("AQ_P_ELECHP","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_ELECHP","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_ELECHP",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
					if (RFRT == "KVA")
					{
						addFee("AQ_P_ELECENG","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_ELECENG","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_ELECENG",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
					if (RFRT == "GAL")
					{
						addFee("AQ_P_STATCON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_STATCON","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_STATCON",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
					if (RFRT == "SEMI")
					{
						addFee("AQ_P_SEMICON","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_SEMICON","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_SEMICON",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
					if (RFRT == "EXCEP")
					{
						addFee("AQ_P_PFE","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_PFE","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_PFE",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
					if (RFRT == "SQFT")
					{
						addFee("AQ_P_INCINER","AQ_FAC","FINAL",Number(getAppSpecific("Renewal Fee Rating Total",childcap.getCapID())),"N",pcapId);
						updatefeenotes(pcapId,"AQ_P_INCINER","null",customID);
						var fee = feeAmountbynotes(pcapId,"AQ_P_INCINER",customID,sysDate.getYear());
						editAppSpecific("Current Fee Total",fee,childcap.getCapID());
					}
				}
				
			}  	
	editAppSpecific("Print Permit","UNCHECKED",childcap.getCapID());
			 
		} //end of looping through children
            editAppSpecific("Invoice Sent","UNCHECKED",oldcapId);
		    editAppSpecific("First Letter Sent","UNCHECKED",oldcapId);
			editAppSpecific("Second Letter Sent","UNCHECKED",oldcapId);
		
          if (Number(getAppSpecific("CO Total",oldcapId)) > 0) 
		{
			 addFee("AQ_APE_CO","AQ_FAC","FINAL",Math.ceil(Number(getAppSpecific("CO Total",oldcapId))),"N",oldcapId);
		} 
		 if (Number(getAppSpecific("NOx Total",oldcapId)) > 0)
		{
			 addFee("AQ_APE_NO","AQ_FAC","FINAL",Math.ceil(Number(getAppSpecific("NOx Total",oldcapId))),"N",oldcapId);
		}
		 if (Number(getAppSpecific("PM10 Total",oldcapId)) > 0)
		{
			addFee("AQ_APE_PM","AQ_FAC","FINAL",Math.ceil(Number(getAppSpecific("PM10 Total",oldcapId))),"N",oldcapId);
		}
		 if (Number(getAppSpecific("SOx Total",oldcapId)) > 0) 
		{
			addFee("AQ_APE_SO","AQ_FAC","FINAL",Math.ceil(Number(getAppSpecific("SOx Total",oldcapId))),"N",oldcapId);
		}
		 if (Number(getAppSpecific("VOC Total",oldcapId)) > 0)
		{
			addFee("AQ_APE_OG","AQ_FAC","FINAL",Math.ceil(Number(getAppSpecific("VOC Total",oldcapId))),"N",oldcapId);
		}
         if (Number(childcount) > 0 && getAppSpecific("SVAB Fee",oldcapId) == "CHECKED")
		 {
			addFee("SVAB_FEE","AQ_FAC","FINAL",Number(childcount),"N",oldcapId);
		 }	
		 if (getAppSpecific("Title V Fee",oldcapId) == "Title V Major Source With Combustion and Opacity CEMS")
		 {
			addFee("AQ_TVMSWCOC","AQ_FAC","FINAL",1,"N",oldcapId);
		 }
		 if (getAppSpecific("Title V Fee",oldcapId) == "Title V Major Source With Combustion CEMS")
		 {
			addFee("AQ_TVMSWCC","AQ_FAC","FINAL",1,"N",oldcapId);
		 }
		 if (getAppSpecific("Title V Fee",oldcapId) == "Title V Major Sources Without CEMS")
		 {
			addFee("AQ_TVMSWC","AQ_FAC","FINAL",1,"N",oldcapId);
		 }
		 if (getAppSpecific("Title V Fee",oldcapId) == "Non-Major Title V Sources Without CEMS")
		 {
			addFee("AQ_NMTVMSWC","AQ_FAC","FINAL",1,"N",oldcapId);
		 }
		 if (getAppSpecific("Title V Fee",oldcapId) == "Synthetic Minor Sources")
		 {
			addFee("AQ_SMS","AQ_FAC","FINAL",1,"N",oldcapId);
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
	
function getChildren(pCapType, pParentCapId) 
	{
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
function addFee(fcode,fsched,fperiod,fqty,finvoice,feeCap) // Adds a single fee, optional argument: fCap
	{
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

function updateFeeItemInvoiceFlag(feeSeq,finvoice)
{
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

function Nozrating (Noz)
{
if(Number(Noz) > 0 && Number(Noz) < 7)
{
	var rating = "06";
}
else if(Number(Noz) >= 7 && Number(Noz) < 13)
{
	var rating = "12";
}
else if(Number(Noz) >= 13 && Number(Noz) < 19)
{
	var rating = "18";
}
else if(Number(Noz) >= 19 && Number(Noz) < 25)
{
	var rating = "24";
}
else if(Number(Noz) >= 25 && Number(Noz) < 31)
{
	var rating = "30";
} 
else if(Number(Noz) >= 31)
{
	var rating = "31";
}
else
{
	var rating = "no rating";
}
return rating;
}

function getChildrencount(pCapType, pParentCapId) 
	{
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

function updatefeenotes(feeCap,fcode,altid,feeComment)
{
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

function invoiceAllFeesPlacer(capid) {
	var itemCap = capid;
	var targetFees = loadFees(itemCap);
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
}

function getinvoicenumberbydate(capid,date)
{
	// date format needs to be MM/DD/YYYY
	var invoicenumber = "";
	
	iListResult = aa.finance.getInvoiceByCapID(capid,null);
	iList = iListResult.getOutput();
	for (iNum in iList)
		if(dateFormatted(iList[iNum].getInvDate().getMonth(),iList[iNum].getInvDate().getDayOfMonth(),iList[iNum].getInvDate().getYear(),"").equals(date))
			invoicenumber = iList[iNum].getInvNbr();
	return 	invoicenumber
}

function feeExistsbynotes(feestr,altid) // optional statuses to check for
	{
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

function feeAmountbynotes(capid,fcode,altid,year) 
	{
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
/*=============================================================================================
| Program : ASA:Building/Residential/PV Solar/SolarApp Revision
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for all PV Solar and PV Solar revisions
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 09/15/2023 created script
|         : TDunn 09/26/2024 added fee rules for PV Solar Revisions.
|         : TDunn 10/03/2024 updated script name to full for Revisions
|         : TDunn 11/06/2024 turned of fees for online submittal to allow testing other elements.
|         : TDunn 01/07/2024 enabled addition of fees and redeployed to production
|
/=============================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:Building Residential PV Solar");
var autoInvoiceFees = "Y";

if(publicUser)
{
	if(appTypeArray[3] == "SolarApp Revision")
	{
		//Assess fees
		updateFee("0913","B_RES","FINAL",1,autoInvoiceFees);
		if(AInfo["Adding an ESS with Revision"] == "Yes" || AInfo["Adding Main Panel Upgrade"] == "Yes")
		{
			updateFee("0711","B_RES","FINAL",1,autoInvoiceFees);
		}
		if(AInfo["Adding an ESS with Revision"] == "Yes" && AInfo["Adding Main Panel Upgrade"] == "Yes")
		{
			updateFee("0711","B_RES","FINAL",2,autoInvoiceFees);
		}
	}
}
aa.sendMail(defaultFrom, "tdunn@truepointsolutions.com", "", "DEBUG: "+ "SolarApp Revision at ASA", debug);
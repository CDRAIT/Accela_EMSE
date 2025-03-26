/*=============================================================================================
| Program : ASA;Building!Residential!PV Solar!~
| Event   : ApplicationSubmitAfter
|
| Client  : Placer County, CA
| Usage   : Application Submit After for SolarApp records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 09/15/2023 created script
|
|
/=============================================================================================*/
if(currentUserID == "TDUNN") {
	showDebug = 1;
}
logDebug("Running ASA:Building Residential PV Solar");
var autoInvoiceFees = "Y";

/*
if(appTypeArray[3] == "Solar App")
{
	if(AInfo["Project Type"] == "PV Solar and Storage")
	{
		addFee("0711","B_RES","FINAL",1,autoInvoiceFees);
	}
	if(AInfo["Panel Upgrade"] == "Yes")
	{
		addFee("0711","B_RES","FINAL",1,autoInvoiceFees);
	}
	addFee("0903","B_RES","FINAL",1,autoInvoiceFees);
	addFee("0790","B_RES","FINAL",1,autoInvoiceFees);
	addFee("0731","B_RES","FINAL",1,autoInvoiceFees);
	addFee("TECH","ACCOUNTING","FINAL",1,autoInvoiceFees);
	
}
*/
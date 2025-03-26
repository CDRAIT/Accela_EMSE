/*------------------------------------------------------------------------------------------------------/
| Program : PRB:TRPA!~!~!~  (actually *s not tilde)
| 
| Event   : PaymentReceiveBefore
|
| Client  : Placer County
| Usage   : PaymentReceiveBefore for all TRPA records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes	  : TDunn 05/11/2020 Created script
|         : TDunn 07/30/2021 updated fee codes for AH and EA fees
|
|
\-------------------------------------------------------------------------------------------------------*/

if(feeExists("TF-HSG AHF","NEW","INVOICED")) {
	if(feeAmount("TF-HSG AHF","NEW","INVOICED") < 4) {
		logDebug("TF-HSG AHF amount < 4");
		showMessage = true;
		comment("<font size = 4 color=ff000><b>Affordable Housing fee sqft has not been updated.</b></font><br><br>The square footage for the Affordable Housing fee on this record has not been updated from the default. Please update the square footage quantity for this fee or if the fee does not apply, remove it prior to processing the payment");
		cancel = true;
	
	}
}

if(feeExists("TF-HSG EAF","NEW","INVOICED")) {
	if(feeAmount("TF-HSG EAF","NEW","INVOICED") < 4) {
		logDebug("TF-HSG EAF amount < 4");
		showMessage = true;
		comment("<font size = 4 color=ff000><b>Employee Accommodation fee sqft has not been updated.</b></font><br><br>The square footage for the Employee Accommodation fee on this record has not been updated from the default. Please update the square footage quantity for this fee or if the fee does not apply, remove it prior to processing the payment");
		cancel = true;
	
	}
}

/*------------------------------------------------------------------------------------------------------/
| Program : DUB:Building/star/star/star
| Event   : DocumentUploadBefore
|
| Client  : Placer County, CA
| Usage   : Document Upload Before for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|  
|   Notes : TDunn 03/31/2022 Initialize in EMSE 3.0
|           TDunn 04/22/2022 added new criteria to allow uploads.
|
/-------------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"JMCKENZIE","KHOBDAY","TDUNN")) {showDebug = 1;}

// Initialize 'global' variables
//==============================
var newDocModelArray = documentModelArray.toArray();
var docGroupArray = ["BUILDING"];
/* Replace with correct document types */
var docTypeArray = ["Application Attachement","Stormwater Quality Plan","Internal Only"];
var todayDate = dateAdd(null,0);

// Set rules for submittal file name
//-----------------------------------
if(matches(currentUserID,"TDUNN","JMCKENZIE","EAFTAHI")) {
	var fileNameLimit = 60;
	var fileLengthFail = false;
	var fileLengthFailArray = [];
	var fileLengthFailList = "";
	newDocModelArray = documentModelArray.toArray();
	if(publicUser) {
		for (x in newDocModelArray) {
		  docDetails = newDocModelArray[x];
		  //logDebug("<font color='green'>docName: " + docDetails.docName + "</font>");
		  //logDebug("<font color='green'>fileName: " + docDetails.fileName + "</font>");
		  //logDebug("<font color='green'>fileName Length: " + docDetails.fileName.length() + "</font>");
		  if(docDetails.docName.search(/[<>:"/\|?*]/) >= 0) {
			 replaceSpecialChar(docDetails);
		  }
		  if(docDetails.fileName.length() > fileNameLimit) {
			 //logDebug("<font color='red'>FILE NAME LENGTH TOO LONG: " + docDetails.fileName + "</font>");
			 fileLengthFail = true;
			 fileLengthFailArray.push(docDetails.fileName);
		  }
		}

		//logDebug("<font color='red'>fileLengthFailArray: " + fileLengthFailArray + "</font>");
		//logDebug("<font color='red'>fileLengthFailArray Count: " + fileLengthFailArray.length + "</font>");
		if(fileLengthFailArray.length > 0) {
		  for (f in fileLengthFailArray) fileLengthFailList += fileLengthFailArray[f]+"<br>";
		}
	}

	if(publicUser && fileLengthFail && fileLengthFailArray.length > 0){
		 showMessage = true;
		 comment("<font color='red'>The following files(s) failed to meet the name length criteria. <br>" + fileLengthFailList + "<br> The file name length must be fewer than " + fileNameLimit + " characters. Please rename your local copy of the file(s), then try uploading again.</font>");
		 cancel = true;
	}

}
// cancel doc upload based on capStatus
/* Allow document uploads through ACA if the record meets any these criteria:
1. Application Status = Received
2. Application Status = Corrections Required
3. Application Status = Issued and the Revisions Plan Check task is active and the Revisions Plan Check Status = Corrections Required.
*/
if(publicUser) {
//if(matches(currentUserID,"TDUNN","JMCKENZIE","EAFTAHI")) {
	var docFlag = true;
	if(capStatus == "Issued" && isTaskActive("Plan Check","BLD_20181201_REVISIONS") && isTaskStatus("Plan Check","Corrections Required","BLD_20181201_REVISIONS")) {
		docFlag = false;
	}
	if(capStatus == "Issued" && isTaskActive("Revisions","BLD_20181201_MAIN") && isTaskActive("Department Distribution","BLD_20181201_REVISIONS")) {
		docFlag = false;
	}
	logDebug("Status is : " + capStatus + " and docFlag = " + docFlag);
	if(!matches(capStatus,"Received","Corrections Required") && docFlag && capIDString.indexOf("TMP") == -1) {
		showMessage = true; 
		comment("<font size = 4 color=ff000><b>No additional documents can be uploaded to this project at this time. Please review our submittal instructions for guidance on submitting corrections, revisions, or additional documents.<br>For assistance with your submittal or resubmittal, please contact the Community Development Resource Agency. For projects in our Auburn Office please email OnlineBLDPermits@placer.ca.gov or call 530-745-3000. For projects in our Tahoe Office, please email OnlineBLDPermitsTahoe@placer.ca.gov or call 530-581-6200.</b></font><br><br>"); 
		cancel = true;
	}
}


// var sendResult = aa.sendMail("noreply@placer.ca.gov","cdrait@placer.ca.gov", "", "Testing Building DUB script ", debug);	
// sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing Building DUB script ", debug);
// External functions used by script
//=============================================================================
function replaceSpecialChar(docModel) {
                var newDocName = null;
                var docNametoChange = String(docModel.getDocName());
                newDocName = docNametoChange.replace(/[<>:"/\|?*]/g,"-");
                logDebug("<font color='blue'>---UPDATE DOC NAME TO: " + newDocName + "</font>");
                docModel.setDocName(newDocName);
                updateDocResult = aa.document.updateDocument(docModel);
                return newDocName;
}

//
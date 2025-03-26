/*------------------------------------------------------------------------------------------------------/
| Program : DUB:Planning/star/star/star
| Event   : DocumentUploadBefore
|
| Client  : Placer County, CA
| Usage   : Document Upload Before for all Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
|  
|   Notes : TDunn 03/31/2022 Initialize in EMSE 3.0
|
/-------------------------------------------------------------------------------------------------------------*/
if(matches(currentUserID,"JMCKENZIE","KHOBDAY","TDUNN", "EAFTAHI")) {showDebug = 1;}

// Initialize 'global' variables
//==============================
var newDocModelArray = documentModelArray.toArray();
var docGroupArray = ["PLANNING"];
/* Replace with correct document types */
var docTypeArray = ["Application Attachment","Project Attachment"];
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
	if(publicUser && matches(capStatus,"Project Approved","Closed","Withdrawn","Expired","Void","Denied")) {
		showMessage = true; 
		comment("<font size = 4 color=ff000><b>This project is " + capStatus + ". No additional documents can be uploaded at this time.</b></font><br><br>"); 
		cancel = true;
	}

// var sendResult = aa.sendMail("noreply@placerco.ca.gov","tdunn@truepointsolutions.com", "", "Testing DUB script ", debug);	

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

function getTaskAssignUser(wfstr) {
               // optional process name.
               var useProcess = false;
               var processName = "";
               if (arguments.length == 2) {
                              processName = arguments[1]; // subprocess
                              useProcess = true;
               }
               var workflowResult = aa.workflow.getTasks(capId);
               if (workflowResult.getSuccess()) {
                              wfObj = workflowResult.getOutput();
               } else {
                              logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); 
                              return false; 
               }
               for (i in wfObj) {
                              var fTask = wfObj[i];
                              if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*")  && (!useProcess || fTask.getProcessCode().equals(processName))) {
                                             var taskAssignUser = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
                                             if (taskAssignUser != null) {
                                                            // re-grabbing for userid.
                                                            wfUserObj = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
                                                            return wfUserObj.getUserID();
                                             }
                              }
               }
               return false;
}

//
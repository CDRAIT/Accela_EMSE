//DUA DIGEPLAN_PLACERCO
// TDunn: Updated actions for DigEplan upload on Submittal Incomplete and Corrections Required

logDebug("<font color='green'>Inside DUA DIGEPLAN</font>");

if(capIDString.indexOf("TMP") == -1) {
	digEplanPreCache(digEplanSubDomain,capIDString,digEplanEnv);
}

/*------DIGITAL PROJECTS-------*/
var sendUploadEmail = false;
var fileIsReport = false;
var newDocModelArray = documentModelArray.toArray();
for (dl in newDocModelArray) {
	logDebug("<font color='green'>File Upload By: " + newDocModelArray[dl].getFileUpLoadBy() + "</font>");
	var thisDocCategory = String(newDocModelArray[dl].getDocCategory());
	var thisDocDesc = String(newDocModelArray[dl].getDocDescription());
	if(thisDocDesc.indexOf('DigEplan Generated_') == 0) {fileIsReport = true; publicUserEDR = false;}
	if(thisDocDesc.indexOf('DigEplan Generated_') == -1) {fileIsReport = false; publicUserEDR = true;}

	logDebug("<font color='green'>fileIsReport : " + fileIsReport +  "</font>");
	logDebug("<font color='green'>publicUserEDR : " + publicUserEDR +  "</font>");
	
	if(!fileIsReport) {
		if(appMatch('Building/*/*/*')) 
		{
			//sendUploadEmail = true;
		}		
	}

	if (fileIsReport) {
			if((newDocModelArray[dl].getDocName().indexOf('Sheet Report') >= 0 || newDocModelArray[dl].getDocName().indexOf('Approved Plan Report') >= 0 || newDocModelArray[dl].getDocName().indexOf('Reviewed - Approved') >= 0)) {
				if(appMatch('Building/*/*/*')) newDocModelArray[dl].setDocGroup('BUILDING');
				//if(appMatch('Planning/*/*/*')) newDocModelArray[dl].setDocGroup('PLANNING');
				//newDocModelArray[dl].setDocCategory('Approved Report');
				updateDocResult = aa.document.updateDocument(newDocModelArray[dl]);
				logDebug("<font color='blue'>Updated Approved Report Document</font>");
			}
			if((newDocModelArray[dl].getDocName().indexOf('Merge Documents Report') >= 0 || newDocModelArray[dl].getDocName().indexOf('Approved Document Report') >= 0)) {
				if(appMatch('Building/*/*/*')) newDocModelArray[dl].setDocGroup('BUILDING');
				//if(appMatch('Planning/*/*/*')) newDocModelArray[dl].setDocGroup('PLANNING');
				//newDocModelArray[dl].setDocCategory('Approved Report');
				updateDocResult = aa.document.updateDocument(newDocModelArray[dl]);
				logDebug("<font color='blue'>Updated Merge/Approved Documents Report</font>");
			}
			if((newDocModelArray[dl].getDocName().indexOf('Interim') >= 0 || newDocModelArray[dl].getDocName().indexOf('All Open Document Comments') >= 0 || newDocModelArray[dl].getDocName().indexOf('Comment Report') >= 0)) {
				if(appMatch('Building/*/*/*')) newDocModelArray[dl].setDocGroup('BUILDING');
				//if(appMatch('Planning/*/*/*')) newDocModelArray[dl].setDocGroup('PLANNING');
				newDocModelArray[dl].setDocCategory('Comment Report');
				if(newDocModelArray[dl].getDocStatus() == 'Uploaded') newDocModelArray[dl].setDocStatus('Comments Available');
				updateDocResult = aa.document.updateDocument(newDocModelArray[dl]);
				logDebug("<font color='blue'>Updated Interim/Comment Document</font>");
			}
	}
}

logDebug("<font color='green'>sendUploadEmail: " + sendUploadEmail +  "</font>");
//sendResult = aa.sendMail(defaultFrom,"tdunn@truepointsolutions.com", "", "Testing Building DUA script " + capIDString, debug);
//if (sendUploadEmail) emailDocUploadNotification();

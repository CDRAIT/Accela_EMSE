//ADDED FOR DIGEPLAN EDR BY TRUEPOINT/MHELVICK 12/31/2025
logDebug("<font color='green'>INSIDE INCLUDES_DIGEPLAN</font>");
/*------VARIABLES-------*/
var thisEnv = "";
thisAgency = "Placer County";
stageENV = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_US-STAGE"); //logDebug("<font color='green'>stageENV : " + stageENV + "</font>");
uswENV = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_USW");  //logDebug("<font color='green'>uswENV : " + uswENV + "</font>");
thisAccelaEnv = getAccelaEnvironment();
if(thisAccelaEnv) {
	//logDebug("<font color='green'>thisAccelaEnv: " + thisAccelaEnv + "</font>");
	if(thisAccelaEnv == "PROD") thisEnv = "";
	else thisEnv = thisAccelaEnv;
}
//logDebug("<font color='green'>thisEnv : " + thisEnv + "</font>");
doDigEplan = false;
if (thisAccelaEnv && matches(thisAccelaEnv,stageENV,uswENV)) doDigEplan = true;
logDebug("<font color='green'>doDigEplan: " + doDigEplan + "</font>");

var digEplanAPIUser = ['APIUSER','DIGEPLAN','DigEplan Reviewer','SVC_AGENT'];
var digEplanEnv = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_ENV"); //logDebug("<font color='green'>digEplanEnv: " + digEplanEnv + "</font>");
var digEplanSubDomain = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_SUBDOMAIN");
if(thisAccelaEnv == uswENV && digEplanEnv.indexOf("usw") >=0) {
	digEplanPAT = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_PAT_USW");
}
if(thisAccelaEnv == stageENV && digEplanEnv.indexOf("us-stage") >=0) {
	digEplanPAT = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_PAT_STAGE");
}

/*------FUNCTIONS---------*/

/*-------GENERAL FUNCTIONS-------*/
/* SAAS returns the environment (supp, test, prod) */
function getAccelaEnvironment() {
    var tenantName = new com.accela.util.MultiDBJNDIUtil.getTenantName();
    var tenantNameArray = tenantName.split('-');
    if(tenantNameArray.length == 2) {
        return tenantNameArray[1].toUpperCase();
    }
    return false;
}

function loadCustomScript(scriptName) {

    try {
        scriptName = scriptName.toUpperCase();
        var emseBiz = aa.proxyInvoker.newInstance(
                "com.accela.aa.emse.emse.EMSEBusiness").getOutput();
        var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),
                scriptName, "ADMIN");
        eval(emseScript.getScriptText() + "");

    } catch (error) {
        showDebug = true;
        logDebug("<font color='red'><b>WARNING: Could not load script </b></font>" + scriptName + ". Verify the script in <font color='blue'>Classic Admin>Admin Tools>Events>Scripts</font>");
        logDebug("<font color='red'>ERROR: " + error.message + " In " + scriptName + " Line " + error.lineNumber + "</font>");
        logDebug("Stack: " + error.stack);
    }
}

function getAssignedToStaff() // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ 	logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
			return false;
		}
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ 	logDebug("**ERROR: No cap detail script object") ;
			return false;
		}
		
	cd = cdScriptObj.getCapDetailModel();
	
	//cd.setCompleteDept(iName.getDeptOfUser());
	var returnValue = cd.getAsgnStaff();
	//cdScriptObj.setCompleteDate(sysDate);
	
	//logDebug("Returning Assigned To Staff value: " + returnValue);
	
	return returnValue; 
}

/*------------------------------------------------------------------------------------------------------/
|  EDR Communication Template Parameter Functions 
/------------------------------------------------------------------------------------------------------*/
function getBasicRecordParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$altID$$", capIDString);
	addParameter(params, "$$capName$$", capName);
	addParameter(params, "$$capStatus$$", capStatus);
	addParameter(params, "$$fileDate$$", fileDate);
	addParameter(params, "$$workDesc$$", workDescGet(capId));
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
	addParameter(params, "$$capTypeAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());

	return params;
}

function getAPOParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table
	//Get Address Line Param
    var addressLine = "";
	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");
	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();
		addressLine = ad.getDisplayAddress();
		}
	addParameter(params, "$$addressLine$$", addressLine);
	//Get Parcel Number Param
	var parcelNumber = "";
	paResult = aa.parcel.getParcelandAttribute(capId,null);
	if (paResult.getSuccess()) {
		Parcels = paResult.getOutput().toArray();
		for (zz in Parcels) {
			if(Parcels[zz].getPrimaryParcelFlag() == "Y") {
				parcelNumber = Parcels[zz].getParcelNumber();
			}			
		}
	}
	addParameter(params,"$$parcelNumber$$",parcelNumber);
	//Get Owner Param
	capOwnerResult = aa.owner.getOwnerByCapId(capId);
	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();
		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone());
				break;	
			}
		}
	}
	return params;
}

function getDigEplanRecordUrl(digEplanUrl) {
	
	var digEplanRecordUrl = "";

   	digEplanRecordUrl = digEplanUrl;   
	digEplanRecordUrl += "" + capId.getCustomID();
	
   	return digEplanRecordUrl;
}

function getDigEplanRecordUrlParam4Notification(params,digEplanUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$digEplanRecordUrl$$", getDigEplanRecordUrl(digEplanUrl));
	
	return params;	
}

/*------------------------------------------------------------------------------------------------------/
|  EDR Document Upload Functions 
/------------------------------------------------------------------------------------------------------*/
function digEplanPreCache(client,altId)
{
	var soapresp = "";
	var preCacheURL = "";
	preCacheURL = "https://api." + digEplanEnv + "/api/precache/folders?product=app&client=" + client + "&originalFolderId=" + altId;
	logDebug("preCacheURL: " + preCacheURL);
	
	soapresp = aa.util.httpPost(preCacheURL,'').getOutput();
	if(soapresp) logDebug("<font color='green'>Calling " + digEplanEnv + " API: " + soapresp + "</font>");
	if(!soapresp) logDebug("<font color='red'>COULD NOT REACH DIGEPLAN API</font>");
	return soapresp;
}

function createEmailParametersForDUA_EDR(params) {
	//Create Environment Parameters
		addParameter(params,"$$thisEnv$$",thisEnv);
		
	//Create Record Parameters
		getBasicRecordParams4Notification(params);
	
	//Create APO Parameters
		getAPOParams4Notification(params);

	//Create Assigned To Parameters
		var assignedTo = getAssignedToStaff();
		if(matches(assignedTo,"",null,undefined)) assignedTo = "ADMIN";
		var assignedToEmail = "";
		var assignedToFullName = "";
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		
		if(appMatch("Building/*/*/*")) {
			if(isTaskActive('Planner Review')) assignedToEmail += getEmailsFromTaskAssignment('Planner Review');
		}
		
		addParameter(params,"$$assignedToFullName$$",assignedToFullName);
		addParameter(params,"$$assignedToEmail$$",assignedToEmail);
	
	
	//Create DigEplan URL Parameters
		var digEplanUrl = lookup("EXTERNAL_DOC_REVIEW","WEB_SERVICE_URL");
		getDigEplanRecordUrl(digEplanUrl);
		getDigEplanRecordUrlParam4Notification(params,digEplanUrl);
	
	return params;
}

function getEmailsFromTaskAssignment(thisTask) {
    var assignedUserEmail = "";
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    for (i in wfObj) {
        var fTask = wfObj[i];

        if (matches(fTask.getTaskDescription().toUpperCase(), thisTask.toUpperCase())) {
            var assignedUser = null;
            assignedUser = aa.person.getUser(fTask.getTaskItem().getAssignedUser().getFirstName(), fTask.getTaskItem().getAssignedUser().getMiddleName(), fTask.getTaskItem().getAssignedUser().getLastName()).getOutput();
            //logDebug("<font color='green'>" + fTask.getTaskDescription().toUpperCase()+ " Assigned to: " + assignedUser + "</font>");
			if(assignedUser != null){
				var assignedUserID = assignedUser.getUserID();
				var assignedUserObj = aa.person.getUser(assignedUserID).getOutput();
				var assignedUserFullName = assignedUserObj.getFirstName() + " " + assignedUserObj.getLastName();
				logDebug("<font color='green'>Assigned User Name: " + assignedUserFullName + "</font>");
				var assignedUserPhone = assignedUserObj.getPhoneNumber(); //logDebug("<font color='green'>Assigned User Phone: " + assignedUserPhone + "</font>");
				if(!matches(assignedUserObj.getEmail(),null,undefined,"")) assignedUserEmail = assignedUserObj.getEmail() + ";";
			}
        }
    }
    return assignedUserEmail;
}
function emailDocUploadNotification() {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailTemplate = "DUA_INTERNAL NOTIFICATION_DOCUPLOAD";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];	
	createEmailParametersForDUA_EDR(emailParameters);
	
	//if(appMatch("Building/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_DOCUPLOAD_BLD";
	//if(appMatch("Engineering/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_DOCUPLOAD_ENG";
	//if(appMatch("Planning/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_DOCUPLOAD_PLN";
	
	sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
}

/*------------------------------------------------------------------------------------------------------/
|  EDR Workflow Update Functions 
/------------------------------------------------------------------------------------------------------*/
function edrPlansExist(docGroupArray,docCategoryArray) {
	var edrPlans = false;
	
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) if(exists(docArray[d]["docGroup"],docGroupArray) && exists(docArray[d]["docCategory"],docCategoryArray)) edrPlans = true;
	}
	
	return edrPlans;
}

function digEplanReportExists(digEplanAPIUser,reportStatusArray) {

	var digEplanReportExists = false;
	var docArray = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
	if (docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("<font color='green'>*****Document Details*****</font>");
			//logDebug("<font color='green'>DocName: " + docArray[d]["docName"] + " - DocID: " + docArray[d]["documentNo"] + "</font>");
			//logDebug("<font color='green'>DocGroup / DocCategory: " + docArray[d]["docGroup"] + " / " + docArray[d]["docCategory"] + "</font>");
			//logDebug("<font color='green'>DocStatus: " + docArray[d]["docStatus"] + "</font>");
			//logDebug("<font color='green'>FileUploadBy: " + docArray[d]["fileUpLoadBy"] + "</font>");

			if (exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser) && exists(docArray[d]["docStatus"],reportStatusArray)) digEplanReportExists = true;			
		}
	}
	return digEplanReportExists;
}

function checkForPendingReviews(reviewTasksArray) //function checks for all review tasks resulted and/or completed //optional pending task status array
	{
	var usePendingStatuses = false;
	var reviewTaskStatusPendingArray = [];
	
	if (arguments.length == 2) {
		reviewTaskStatusPendingArray = arguments[1]; // pending task status list
		usePendingStatuses = true;
	}
	var tasksPending = false;
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
		var fTask = wfObj[i];
 		if (exists(fTask.getTaskDescription(),reviewTasksArray))
			{
				if(usePendingStatuses) {
					//logDebug("Workflow Task: " + fTask.getTaskDescription() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
					if(fTask.getActiveFlag() == "Y" && exists(fTask.getDisposition(),reviewTaskStatusPendingArray)) tasksPending = true;
				}
				else{
					//logDebug("Workflow Task: " + fTask.getTaskDescription() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
					if(fTask.getActiveFlag() == "Y") tasksPending = true;
				}
			}		
		}
		return tasksPending;
}

function checkForCorrectionsNeeded(reviewTasksArray,reviewTaskResubmitStatusArray) { //function checks for any review tasks revisions needed status
	var correctionsNeeded = false;
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
		var fTask = wfObj[i];
 		if (exists(fTask.getTaskDescription(),reviewTasksArray))
			{
			//logDebug("Workflow Task: " + fTask.getTaskDescription() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
			if(exists(fTask.getDisposition(),reviewTaskResubmitStatusArray)) correctionsNeeded = true;
			}		
		}
		return correctionsNeeded;
}

function synchronizeDocFileNames() {
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("*Document Name: " + docArray[d].getDocName());
			//logDebug("*File Name: " + docArray[d].getFileName());
			if(docArray[d].getDocName() != docArray[d].getFileName()) {
				var docNameExt = null;
				//logDebug("*-------------*");
				//logDebug("* Document Name: " + docArray[d].getDocName());
				//logDebug("* File Name: " + docArray[d].getFileName());
				
				var fileTypeIndex = docArray[d].getFileName().lastIndexOf(".");
				if(fileTypeIndex>1) var fileExt = docArray[d].getFileName().substring(docArray[d].getFileName().lastIndexOf("."));
				//logDebug("fileExt: " + fileExt);				
				
				var docTypeIndex = docArray[d].getDocName().lastIndexOf(".");
				if(docTypeIndex>1) {
					var docExt = docArray[d].getDocName().substring(docArray[d].getDocName().lastIndexOf("."));
					if(docExt != fileExt) {
						docNameExt = docArray[d].getDocName() + fileExt;
						docArray[d].setDocName(docArray[d].getDocName() + fileExt);
						//logDebug("---UPDATE DOCNAME TO : " + docNameExt);
					} else {
						docNameExt = docArray[d].getDocName();
						//logDebug("----DOCNAME DOESN'T CHANGE : " + docNameExt);
						}
				}
				if(docTypeIndex == -1) {
					docNameExt = docArray[d].getDocName() + fileExt;
					docArray[d].setDocName(docArray[d].getDocName() + fileExt);
					//logDebug(" ---UPDATE DOCNAME TO : " + docNameExt);
				}			

				if(docNameExt != docArray[d].getFileName()){
					logDebug("<font color='blue'>---UPDATE FILE NAME TO: " + docNameExt + "</font>");
					docArray[d].setFileName(docNameExt);
				}
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}	
			
		}
	}
}

function selectReqDocTypes4Resubmittal(recordNumber) {
    var conn = aa.db.getConnection();
    var result = new Array();
    var uniqueResult = new Array();
    var VALUE = "";

    var getSQL = " SELECT   BD.DOC_NAME, BD.DOC_CATEGORY as docCatList, BCE.COMMENT_STATUS "
        + " FROM    B1PERMIT B "
        + " JOIN    BDOCUMENT BD "
        + " ON      B.B1_PER_ID1 = BD.B1_PER_ID1 "
        + " AND     B.B1_PER_ID2 = BD.B1_PER_ID2 "
        + " AND     B.B1_PER_ID3 = BD.B1_PER_ID3 "
        + " AND     B.SERV_PROV_CODE = BD.SERV_PROV_CODE "
        + " AND     B.REC_STATUS = BD.REC_STATUS "
        + " JOIN    BDOCUMENT_COMMENT BC "
        + " ON      BC.DOC_SEQ_NBR = BD.DOC_SEQ_NBR "
        + " AND     BC.SERV_PROV_CODE = BD.SERV_PROV_CODE "
        + " JOIN    BDOCUMENT_COMMENT_ELEMENT BCE "
        + " ON      BCE.DOC_SEQ_NBR = BC.DOC_SEQ_NBR "
        + " AND     BCE.SERV_PROV_CODE = BC.SERV_PROV_CODE "
        + " AND     BCE.COMMENT_RES_ID = BC.RES_ID "
        //+ " AND     BCE.COMMENT_SUBJECT in ('Callout','Text Box') "
        + " WHERE   B.SERV_PROV_CODE = ? "
        + " AND     B.B1_ALT_ID = ? "
        + " AND     B.REC_STATUS = 'A' "
        + " AND     BCE.COMMENT_STATUS = 'Open' ";

    var sSelect = conn.prepareStatement(getSQL);
    sSelect.setString(1, aa.getServiceProviderCode());
    sSelect.setString(2, recordNumber);
    var rs = sSelect.executeQuery();

    while (rs.next()) {
        VALUE = rs.getString("docCatList");
        result.push(VALUE);

    }
    rs.close();
    conn.close();
    uniqueResult = remove_duplicates(result)
    logDebug("<font color='blue'>Unique Result: " + uniqueResult + "</font>");
    return uniqueResult;
}

function remove_duplicates(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
}

function selectDocConfigByGroupPermissions(docCode,excludeTypesArray)
{
	var conn = aa.db.getConnection(); 
	var result = new Array();
	var VALUE = "";  

	var getSQL = 	" select d.DOC_TYPE as docCat, d.UPLOAD_RESTRICT_ROLE as upRole  "
		+ " from RDOCUMENT d "

		+ " WHERE d.DOC_CODE = ? "
		+ " AND d.RESTRICT_DOC_TYP_FOR_ACA = 'Y' "
		//+ " AND d.UPLOAD_RESTRICT_ROLE <> '0000000000' "
		+ " ORDER BY docCat asc ";	
	
	var sSelect = conn.prepareStatement(getSQL);
	sSelect.setString(1, docCode);
	var rs= sSelect.executeQuery();
	
	while(rs.next())
		{
		if(!exists(rs.getString("docCat"),excludeTypesArray)) VALUE = rs.getString("docCat");
		result.push(VALUE);         
					  
		}
	rs.close();
	conn.close();
	return result ;
}

function updateAcaDocSecurity(documentModel,vAction,includeDocStatusArray){
	if(exists(documentModel["docStatus"],includeDocStatusArray)) {
												   
	//logDebug("<font color='green'>currDocCat: " + documentModel.getDocCategory() + "</font>");
	//logDebug("<font color='green'>Document Name: " + documentModel.getDocName() + "</font>");
	//logDebug("<font color='green'>Title Viewable Role: " + documentModel.getViewTitleRole() + "</font>");
	//logDebug("<font color='green'>View Role: " + documentModel.getViewRole() + "</font>");
	//logDebug("<font color='green'>Delete Role: " + documentModel.getDeleteRole() + "</font>");
   
	if (vAction == "ADD"){
		//documentModel.setViewTitleRole("0000000000"); //add document-level security, no view
		documentModel.setViewRole("0000000000"); //add document-level security, no download
		//documentModel.setDeleteRole("0000000000"); //add document-level security, no delete
	}
	if (vAction == "REMOVE"){
		documentModel.setViewTitleRole(""); //remove document-level security (defaults back to behavior of assigned document type)
		documentModel.setViewRole(""); //remove document-level security (defaults back to behavior of assigned document type)
		documentModel.setDeleteRole(""); //remove document-level security (defaults back to behavior of assigned document type)
	}
	updDocResult = aa.document.updateDocument(documentModel);
	logDebug("<font color='blue'>Update ACA " + vAction + " Permissions Successful: " + updDocResult.getSuccess() + "</font>");
	}
}

/*------------------------------------------------------------------------------------------------------/
|  EDR Workflow Communication Functions
/------------------------------------------------------------------------------------------------------*/
function createEmailParametersForWTUA_EDR(params) {
	//Create Environment Parameters
		addParameter(params,"$$thisEnv$$",thisEnv);
		
	//Create Record Parameters
		getBasicRecordParams4Notification(params);
	
	//Create APO Parameters
		getAPOParams4Notification(params);
	
	//Create Workflow Update Parameters
	addParameter(params,"$$wfTask$$",wfTask);
	addParameter(params,"$$wfStatus$$",wfStatus);
	addParameter(params,"$$wfComment$$",wfComment);
	
	//Create Applicant Parameters
		var applicantEmail = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if(typeof(contObj) == "object") {
			for (co in contObj) {
				if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
			}
		}
		
		addParameter(params,"$$applicantEmail$$",applicantEmail);
	
	//Create Assigned To Parameters
		var assignedTo = currentUserID;
		var assignedToEmail = "";
		var assignedToFullName = "";
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(params,"$$assignedToFullName$$",assignedToFullName);
		addParameter(params,"$$assignedToEmail$$",assignedToEmail);
	
	//Create ACA Record Parameters
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		getACARecordParam4Notification(params,acaSite);
	
	//Create Signature Parameters
		var department = "";
		if(appMatch("Building/*/*/*")) department = "Development Services Division";
		addParameter(params,"$$department$$",department);
	
	return params;
}

function emailAppIncompleteNotification(wfTask,wfStatus,wfComment) {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailTemplate = "WTUA_CONTACT NOTIFICATION_INCOMPLETE";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];	
	createEmailParametersForWTUA_EDR(emailParameters);

	//if(appMatch("Building/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INCOMPLET_BLD";
	//if(appMatch("Engineering/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INCOMPLETE_ENG";
	//if(appMatch("Planning/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INCOMPLETE_PLN";
		
	sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
}

function emailCorrectionsNotification(wfStatus,revisionStatus) {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTIONS";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];
	createEmailParametersForWTUA_EDR(emailParameters);
	
	//GET REVIEWER DETAILS
	var reviewerFullName = "";
	var reviewerEmail = "";
	if(currentUserID != null) {
			reviewerFullName = aa.person.getUser(currentUserID).getOutput().getFirstName() + " " + aa.person.getUser(currentUserID).getOutput().getLastName();
			if(!matches(aa.person.getUser(currentUserID).getOutput().getEmail(),undefined,"",null)) {
				reviewerEmail =  aa.person.getUser(currentUserID).getOutput().getEmail();
			}
	}
	addParameter(emailParameters,"$$reviewerFullName$$",reviewerFullName);
	addParameter(emailParameters,"$$reviewerEmail$$",reviewerEmail);

	//if(appMatch("Building/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTIONS_BLD";
	//if(appMatch("Engineering/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTIONS_ENG";
	//if(appMatch("Planning/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_CORRECTIONS_PLN";

	sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
}

function emailReadyToIssueNotification(wfTask,wfStatus,wfComment) {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailTemplate = "WTUA_CONTACT NOTIFICATION_READYTOISSUE";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];
	createEmailParametersForWTUA_EDR(emailParameters);
	
	//if(appMatch("Building/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_READYTOISSUE_BLD";
	//if(appMatch("Engineering/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_READYTOISSUE_ENG";
	//if(appMatch("Planning/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_READYTOISSUE_PLN";
		
	sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
}

function emailIssuedNotification(wfTask,wfStatus,wfComment) {
	//populate email notification parameters
	var emailSendFrom = "";
	var emailSendTo = "";
	var emailCC = "";
	var emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED";
	var emailParameters = aa.util.newHashtable();
	var fileNames = [];
	createEmailParametersForWTUA_EDR(emailParameters);

	//if(appMatch("Building/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED_BLD";
	//if(appMatch("Engineering/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED_ENG";
	//if(appMatch("Planning/*/*/*")) emailTemplate = "WTUA_CONTACT NOTIFICATION_ISSUED_PLN";
	
	sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	
}

/*------------------------------------------------------------------------------------------------------/
|  EDR CTRCA Functions
/------------------------------------------------------------------------------------------------------*/
function digEplanTmpRecordConversion(capIDStr, tmpRecordID) {
    try {
        // Get the list of Accela Record Statuses that should trigger a DigEplan pre-cache call
        //var digEplanPAT = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_PAT");
        //var digEplanSubDomain = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_SUBDOMAIN");
        //var digEplanEnv = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_ENV");
		var tmpRecordID = getAppSpecific("TMPRecordID");
        logDebug("TMPRecordID custom field: " + tmpRecordID);

        if (digEplanPAT != undefined && digEplanSubDomain != undefined && digEplanEnv != undefined && tmpRecordID != undefined) {
            var hparameters = aa.httpClient.initPostParameters();
            hparameters.put("X-CUSTOMER-NAME", digEplanSubDomain);
            hparameters.put("X-PRODUCT-NAME", "APP");
            hparameters.put("X-PAT-TOKEN", digEplanPAT);

            var dparameters = aa.httpClient.initPostParameters();
            dparameters.put("finalCaseId", capIDStr);
            dparameters.put("tmpCaseId", tmpRecordID);

            var response = aa.httpClient.post("https://api." + digEplanEnv + "/ext/submission/packages/submission",
                hparameters, dparameters).getOutput();

            if (response) logDebug("<font color='green'>Calling DigEplan TMP record conversion API: " + response + "</font>");
            if (!response) logDebug("<font color='red'>UNABLE TO CALL DIGEPLAN TMP RECORD CONVERSION API</font>");
        } else {
            logDebug("<font color='red'>STD CHOICE CONFIG MISSION, UNABLE TO CALL DIGEPLAN TMP RECORD CONVERSION API</font>");
        }
    }
    catch (err) {
        logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
    }
}

/*------------------------------------------------------------------------------------------------------/
|  EDR API Process IDs and Functions
/------------------------------------------------------------------------------------------------------*/
    envName = thisAccelaEnv;

    if (typeof (digEplan) == "undefined") {
        digEplan = new _digEplanAPI();
        // Check DigEplan API point to correct environment.
        if (typeof (envName) == "undefined" || envName == "PROD" || envName == "") {
            if (String(digEplan.env).indexOf("stage") > 0) {
                comment("ERROR: Check DigEPlan API pointing to DigEplan Stage environment" + (typeof (envName) == "undefined" ? "" : "in " + envName));
            }
        } else if (String(digEplan.env).indexOf("stage") < 0) {
            comment("ERROR: Check DigEPlan API pointing to DigEplan PROD environment in " + envName);
        }
    }

    logDebug("<font color='green'>envName : " + envName + "</font>");
    if (typeof (envName) == "undefined" || envName == "PROD" || envName == "") {
        logDebug("<font color='green'>Using " + envName + " Process/Stamp Ids</font>");
        // DigEplan Processes for PROD
        // TODO update for PROD process Ids
        var digEplan_Processes = [];
        // In DigEplan session using Developer Tools in Chrome, view document, select Network tab, search names?type=doc
        digEplan_Processes["Documents"] = [{
            "id": "6384bdd95fa8edac5e46a280",
            "name": "Batch Stamp",
            "description": ""
        }, {
            "id": "6384bdd95fa8edac5e46a27c",
            "name": "Create Approved Plans/Documents",
            "description": ""
        }, {
            "id": "6384bdd95fa8edac5e46a27d",
            "name": "Create Interim Comments",
            "description": ""
        }, {
            "id": "6384bdd95fa8edac5e46a27e",
            "name": "Create Revision Request",
            "description": ""
        }, {
            "id": "61a4db1ffba4fb620f8659e1",
            "name": "Document(s) Audit Log",
            "description": ""
        }, {
            "id": "5f759617bcf1312db3949658",
            "name": "Download Files",
            "description": ""
        }
        ];
        // In DigEplan session (view All Markups > Processes) using Developer Tools in Chrome, select Network tab, search names?type=case
        digEplan_Processes["Markups"] = [{
            id: "6384bdd95fa8edac5e46a27f",
            name: "All Open Document Comments",
            description: ""
        }
        ];
        // In DigEplan session using Developer Tools in Chrome, view plan sheet, select Network tab, names?type=sheet
        digEplan_Processes["Sheets"] = [{
            "id": "6384bdda5fa8edac5e46a281",
            "name": "Batch Stamp",
            "description": ""
        }, {
            "id": "6384bdda5fa8edac5e46a282",
            "name": "Merged Plan Report",
            "description": ""
        }
        ];
        // In DigEplan session using Developer Tools in Chrome, view document, select Network tab, search published..
        var digEplan_Stamps = [{
            "id": "xx64cc2e2754dde4002b36680b",
            "name": "QUALIFIED EXEMPT AUTO RECEIVED",
            "position": "topRight",
            "valueOffsetX": .5,
            "valueOffsetY": .5
        }
        ];
    } else {
        // DigEplan Processes & Stamps for nonPROD (STAGE) environments
        logDebug("<font color='green'>Using " + envName + " Process/Stamp Ids</font>");
        var digEplan_Processes = [];
        // In DigEplan session using Developer Tools in Chrome, view document, select Network tab, search names?type=doc
        digEplan_Processes["Documents"] = [{
            "id": "6384bdd95fa8edac5e46a280",
            "name": "Batch Stamp",
            "description": ""
        }, {
            "id": "6384bdd95fa8edac5e46a27c",
            "name": "Create Approved Plans/Documents",
            "description": ""
        }, {
            "id": "6384bdd95fa8edac5e46a27d",
            "name": "Create Interim Comments",
            "description": ""
        }, {
            "id": "6384bdd95fa8edac5e46a27e",
            "name": "Create Revision Request",
            "description": ""
        }, {
            "id": "61a4db1ffba4fb620f8659e1",
            "name": "Document(s) Audit Log",
            "description": ""
        }, {
            "id": "5f68ce838fd887c7ca7bf3d9",
            "name": "Download Files",
            "description": ""
        }
        ];
        // In DigEplan session (view All Markups > Processes) using Developer Tools in Chrome, select Network tab, search names?type=case
        digEplan_Processes["Markups"] = [{
            id: "6384bdd95fa8edac5e46a27f",
            name: "All Open Document Comments",
            description: ""
        }, {
            id: "61a4d23afba4fb620f8659cc",
            name: "Case Audit Log",
            description: ""
        }
        ];
        // In DigEplan session using Developer Tools in Chrome, view plan sheet, select Network tab, names?type=sheet
        digEplan_Processes["Sheets"] = [{
            "id": "6384bdda5fa8edac5e46a281",
            "name": "Batch Stamp",
            "description": ""
        }, {
            "id": "6384bdda5fa8edac5e46a282",
            "name": "Merged Plan Report",
            "description": ""
        }
        ];
        // In DigEplan session using Developer Tools in Chrome, view document, select Network tab, search published..
        var digEplan_Stamps = [{
            "id": "64cc2e2754dde4002b36680b",
            "name": "QUALIFIED EXEMPT AUTO RECEIVED",
            "position": "topRight",
            "valueOffsetX": .5,
            "valueOffsetY": .5
        }
        ];
    }

    // logDebug("digEplanProcesses: ")
    var msg = "";
    digEplanProcesses = [];
    for (var processType in digEplan_Processes) {
        var digEplanProcesses4Type = digEplan_Processes[processType];
        for (var pp in digEplanProcesses4Type) {
            var digEplanProcess = digEplanProcesses4Type[pp];
            if (!digEplanProcess.name)
                continue
            var name = processType + "." + digEplanProcess.name
            digEplanProcesses[name] = digEplanProcess;
            msg += "<tr><td>" + name + "</td><td>" + digEplanProcess.id + "</td></tr>";
        }
    }
    debug += "<table><caption>DigEplan Process IDs</caption><tr><th>name</th><th>id</th></tr>" + msg + "</table>" + br;

    /*
    var processName = "DOCS>Interm Report", reportType = "Approved Plan", reportDept = "Building";
    if (typeof (digEplan) == "undefined") digEplan = new digEplanAPI();
    var response = digEplan.runProcessReport(capId, docModels, processName, reportType, reportDept);
    var reportStatus = (arguments.length > 5 && arguments[5] ? arguments[5] : "OPN");
    var reportCategory = (arguments.length > 6 && arguments[6] ? arguments[6] : "PUB");
    var filterMarkups = (arguments.length > 7 && arguments[7] == false ? arguments[7] : true);
    var onlyTextualMarkups = (arguments.length > 8 && arguments[8] == false ? arguments[8] : true);
    var checkinStatus = (arguments.length > 9 && arguments[9] ? arguments[9] : "Comments Available Now");
    var coverPage = (arguments.length > 10 && arguments[10] == false ? arguments[10] : true);
    var checkin = (arguments.length > 11 && arguments[11] == false ? arguments[11] : true);
    var documentCheckinTypes = (arguments.length > 12 && arguments[12] ? arguments[12] : "NEW");
    var adobemarkups = (arguments.length > 13 && arguments[13] == true ? arguments[13] : false);
    var pdfa = (arguments.length > 14 && arguments[14] ? arguments[14] : false);
    var onlyMarkedupPages = (arguments.length > 15 && arguments[15] ? arguments[15] : true);
    var filenameSuffix = (arguments.length > 16 && arguments[16] ? arguments[16] : " - Interim - {{department}}");
    var description = (arguments.length > 17 && arguments[17] ? arguments[17] : " - Interim Report - {{department}}");
    var waitTime = (arguments.length > 18 && arguments[18] ? arguments[18] : 500);
    var maxJobChecks = (arguments.length > 19 ? arguments[19] : 10);
    this.jobId = null, this.jobStatus = null;
    var response = this.runReportProcess(itemCapId, docModels, processName, reportType, reportDept, reportStatus, reportCategory, filterMarkups, onlyTextualMarkups, checkinStatus, coverPage, checkin, documentCheckinTypes, adobemarkups, pdfa, onlyMarkedupPages, filenameSuffix, description);
    var reportStatus = (arguments.length > 5 && arguments[5] ? arguments[5] : "OPN");
    var reportCategory = (arguments.length > 6 && arguments[6] ? arguments[6] : "PUB");
    var filterMarkups = (arguments.length > 7 && arguments[7] == false ? arguments[7] : true);
    var onlyTextualMarkups = (arguments.length > 8 && arguments[8] == false ? arguments[8] : true);
    var checkinStatus = (arguments.length > 9 && arguments[9] ? arguments[9] : "Comments Available Now");
    var coverPage = (arguments.length > 10 && arguments[10] == false ? arguments[10] : true);
    var checkin = (arguments.length > 11 && arguments[11] == false ? arguments[11] : true);
    var documentCheckinTypes = (arguments.length > 12 && arguments[12] ? arguments[12] : "NEW");
    var adobemarkups = (arguments.length > 13 && arguments[13] == true ? arguments[13] : false);
    var pdfa = (arguments.length > 14 && arguments[14] ? arguments[14] : false);
    var onlyMarkedupPages = (arguments.length > 15 && arguments[15] ? arguments[15] : true);
    var filenameSuffix = (arguments.length > 16 && arguments[16] ? arguments[16] : " - Interim - {{department}}");
    var description = (arguments.length > 17 && arguments[17] ? arguments[17] : " - Interim Report - {{department}}");
    this.jobId = null, this.jobStatus = null;
    if (itemCapId == null) itemCapId = capId;
    var capIDString = itemCapId.getCustomID();
    */
	
function getCapDocumentList() {
    var itemCapId = (arguments.length > 0 && arguments[0] ? arguments[0] : capId);
    var docUserID = (arguments.length > 1 && arguments[1] ? arguments[1] : currentUserID);
    var docGroups = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
    var docCategories = (arguments.length > 3 && arguments[3] ? arguments[3] : null);
    var docNames = (arguments.length > 4 && arguments[4] ? arguments[4] : null);
    var docFileNames = (arguments.length > 5 && arguments[5] ? arguments[5] : null);
    var docStatuses = (arguments.length > 6 && arguments[6] ? arguments[6] : null);
    var docVersions = (arguments.length > 7 && arguments[7] ? arguments[7] : null);
    var docArray = [], docModels = [];
    var docResult = aa.document.getCapDocumentList(itemCapId, docUserID);
    if (docResult && docResult.getOutput()) {
        docArray = docResult.getOutput();
    }
    for (var dd in docArray) {
        docModel = docArray[dd];
        if (docGroups && !exists(docModel.docGroup, docGroups)) continue;
        if (docCategories && !exists(docModel.docCategory, docCategories)) continue;
        if (docNames && !exists(docModel.docName, docNames)) continue;
        if (docFileNames && !exists(docModel.fileName, docFileNames)) continue;
        if (docStatuses && !exists(docModel.docStatus, docStatuses)) continue;
        if (docVersions && !exists(docModel.docVersion, docVersions)) continue;
        docModels.push(docModel);
        logDebug("docModels[" + dd + "]: "
            + (docModel.documentNo ? " # " + docModel.documentNo : "")
            + (docModel.docGroup ? ", Group: " + docModel.docGroup : "")
            + (docModel.docCategory ? ", Category: " + docModel.docCategory : "")
            + (docModel.docName ? ", Name: " + docModel.docName : "")
            + (docModel.fileName ? ", fileName: " + docModel.fileName : "")
            + (docModel.docDescription ? ", Desc: " + docModel.docDescription : "")
            + (docModel.docVersion ? ", Version: " + docModel.docVersion : "")
            + (docModel.docStatus ? ", Status: " + docModel.docStatus : "")
            // + (dd == 0 ? br + describe_TPS(docModel) : "")
        );
    }
    return docModels;
}

function _digEplanAPI() {
    this.env = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_ENV"); // Product Name
    this.subDomain = lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_SUBDOMAIN"); // Customer Name
    this.PAT = digEplanPAT; //lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_PAT"); // PAT Token
    this.jobPAT = digEplanPAT;//lookup("EXTERNAL_DOC_REVIEW", "DIGEPLAN_JOB_PAT"); // PAT Token
    this.apiURL = null;
    this.apiHeader = null;
    this.apiContent = null;
    this.apiResponse = null;
    this.processID = null;
    this.stampID = null;
    this.jobId = null;
    this.jobStatus = null;
    this.version = "4.0";
    logDebug("Loading digEplanAPI Object version " + this.version);

    var msgFormat = [];
    msgFormat["Error"] = "<font color='red'>$$msg$$</font>"
    msgFormat["Info"] = "<font color='green'>$$msg$$</font>"
    msgFormat["Debug"] = "<font color='purple'>$$msg$$</font>"

    /* Current API End Points
    var apiURLSuffix = {
	"All Open Document Comments" : "/ext/v1/jobs/case/create",
    "Document Merge Report" : "/ext/v1/jobs/documents/create",
    "Sheet Merge Report": "/ext/v1/jobs/sheets/create",
    "Sheet Batch Stamp": "/ext/v1/jobs/sheets/create",
    "Approved Report": "/ext/v1/jobs/document/create",
    "Resubmittal Report": "/ext/v1/jobs/document/create",
    "Documents Batch Stamp": "/ext/v1/jobs/documents/create",
    "Document Stamp": "/ext/v1/jobs/document/create"
    "Get Job": "/ext/v1/jobs/{jobId}"
    } */

    if (this.PAT == undefined || this.subDomain == undefined || this.env == undefined) {
        logDebug("<font color='red'>CONFIG STD CHOICE: EXTERNAL_DOC_REVIEW</font>"
            + (typeof (this.env) == "undefined" ? " DIGEPLAN_ENV" : "")
            + (typeof (this.subDomain) == "undefined" ? " DIGEPLAN_SUBDOMAIN" : "")
            + (typeof (this.PAT) == "undefined" ? " DIGEPLAN_PAT" : "")
            + (typeof (this.jobPAT) == "undefined" ? " DIGEPLAN_JOB_PAT" : ""));
        this.env = null;
    }
    this.toString = function () {
        return ""
            + "ENV: " + this.env
            + ", SUBDOMAIN: " + this.subDomain
            + ", PAT: " + this.PAT
            + ", jobPAT: " + this.jobPAT
            + (this.apiURL ? ", apiURL: " + this.apiURL : "")
            + (this.apiHeader ? ", apiHeader: " + this.apiHeader : "")
            + (this.apiContent ? ", apiContent: " + this.apiContent : "")
            + (this.apiResponse ? ", apiResponse: " + this.apiResponse : "")
            + (this.processID ? ", processID: " + this.processID : "")
            + (this.stampID ? ", stampID: " + this.stampID : "")
            + (this.jobId ? ", jobId: " + this.jobId : "")
            + (this.jobStatus ? ", jobStatus: " + this.jobStatus : "");
    }

    this.preCache = function () {
        var itemCapId = (arguments.length > 0 && arguments[0] ? arguments[0] : capId);
        var client = (arguments.length > 1 && arguments[1] ? arguments[1] : "accela");
        var thisEnv = (arguments.length > 2 && arguments[2] ? arguments[2] : this.env);
        var altId = itemCapId.getCustomID();
        this.apiURL = "https://api." + this.env + "/api/precache/folders?product=app&client=" + client + "&originalFolderId=" + altId;
        this.apiHeader = null;
        this.apiContent = null;
        this.apiResponse = "";
        logDebug("preCacheURL: " + this.apiURL);

        var apiResponse = aa.util.httpPost(this.apiURL, '').getOutput();
        if (apiResponse)
            logDebug(msgFormat["Info"].replace("$$msg$$", "Calling " + thisEnv + " API, response: " + apiResponse));
        if (apiResponse)
            logDebug(msgFormat["Error"].replace("$$msg$$", "ERROR: UNABLE TO REACH DIGEPLAN API, response: " + apiResponse));
        this.apiResponse = apiResponse;
        return apiResponse;
    }

    this.tmpRecordConversion = function (capIDStr, tmpRecordID) {
        try {
            // Get the list of Accela Record Statuses that should trigger a DigEplan pre-cache call
            var tmpRecordID = getAppSpecific("TMPRecordID");
            logDebug("TMPRecordID custom field: " + tmpRecordID);

            if (this.PAT && tmpRecordID != undefined) {
                var hparameters = aa.httpClient.initPostParameters();
                hparameters.put("X-CUSTOMER-NAME", this.subDomain);
                hparameters.put("X-PRODUCT-NAME", "APP");
                hparameters.put("X-PAT-TOKEN", this.PAT);

                var dparameters = aa.httpClient.initPostParameters();
                dparameters.put("finalCaseId", capIDStr);
                dparameters.put("tmpCaseId", tmpRecordID);

                this.apiURL = "https://api." + this.env + "/ext/submission/packages/submission";
                this.apiHeader = hparameters;
                this.apiContent = dparameters;
                logDebug("DigEplan API Post URL: " + this.apiURL + br + ", Header: " + this.apiHeader + br + ", Content: " + this.apiCntent);
                var result = aa.httpClient.post(this.apiURL, this.apiHeader, this.apiContent);
                var response = (result && result.getSuccess() ? result.getOutput() : null);
                if (response)
                    logDebug("<font color='green'>Calling DigEplan TMP record conversion API: " + response + "</font>");
                if (!response)
                    logDebug("<font color='red'>ERROR: UNABLE TO CALL DIGEPLAN TMP RECORD CONVERSION API</font>");
                responseJSON = (response && response != "" ? JSON.parse(response) : null); // Convert response to Object
                this.apiResponse = responseJSON;
                return responseJSON;
            } else {
                logDebug("<font color='red'>ERROR: UNABLE TO CALL DIGEPLAN TMP RECORD CONVERSION API. CONFIG STD CHOICE: EXTERNAL_DOC_REVIEW</font>");
            }
        } catch (err) {
            logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
        }
        return null;
    }

    this.apiPost = function (apiURL, apiContent) {
        var apiName = (arguments.length > 2 && arguments[2] ? arguments[2] : "");
        var processName = (arguments.length > 3 && arguments[3] ? arguments[3] : null);

        try {
            var invalidInfo = [],
                invalidInfoSTD = [],
                invalidInfoIncludes = [];
            if (this.env == undefined) {
                invalidInfoSTD.push("DIGEPLAN_ENV");
            }
            if (this.subDomain == undefined) {
                invalidInfoSTD.push("DIGEPLAN_SUBDOMAIN");
            }
            if (this.jobPAT == undefined) {
                invalidInfoSTD.push("DIGEPLAN_JOB_PAT");
            }
            if (invalidInfoSTD.length) {
                invalidInfo.push("STD CHOICE: EXTERNAL_DOC_REVIEW > " + invalidInfoSTD.join(", "));
            }
            if (apiContent.processId == undefined) {
                invalidInfo.push("INCLUDES_DIGEPLAN digEplanProcesses for " + processName);
            }
            if (invalidInfoSTD.length) {
                logDebug("<font color='red'>ERROR: UNABLE TO CALL DIGEPLAN " + apiName + " API." + " CHECK " + invalidInfo.join("; ") + "</font>");
                return null;
            } else {
                var hparameters = aa.httpClient.initPostParameters();
                hparameters.put("X-CUSTOMER-NAME", this.subDomain);
                hparameters.put("X-PRODUCT-NAME", "APP");
                hparameters.put("X-PAT-TOKEN", this.jobPAT);
                hparameters.put("CONTENT-TYPE", "APPLICATION/JSON");

                try {
                    var dparameters = JSON.stringify(apiContent);
                } catch (err1) {
                    // var dparameters = aa.util.newHashMap();
                    // var dparameters = aa.httpClient.initPostParameters();
                    // for (var xx in apiContent) {
                    //     dparameters.put(xx, apiContent[xx]);
                    // }
                    // logDebug("dparameters: " + dparameters);
                    // var dparameters = JSON.stringify(dparameters);
                    // logDebug("dparameters: " + dparameters);
                    var dparameters = "";
                    for (var xx in apiContent) {
                        dparameters += (dparameters == "" ? "" : ",") + '"' + xx + '": ' + (isNaN(apiContent[xx]) ? '"' + apiContent[xx] + '"' : apiContent[xx])
                    }
                    logDebug("dparameters: " + dparameters);
                }
                // var dparameters = JSON.stringify(apiContent).replace(/\\"/g, '"').replace(/\[\"{/g, '[{').split('}","{').join('},{').replace(/}\"]/g, '}]');

                this.apiURL = apiURL;
                this.apiHeader = hparameters;
                this.apiContent = dparameters;
                this.apiResponse = null;
                if (processName) {
                    this.processName = processName;
                    this.processID = digEplanProcesses[processName].id;
                }
                logDebug("DigEplan API Post URL: " + this.apiURL + br + ", Header: " + this.apiHeader + br + ", Content: " + this.apiContent);
                var result = null;
                var result = aa.httpClient.post(this.apiURL, this.apiHeader, this.apiContent);
                var response = (result && result.getSuccess() ? result.getOutput() : null);
                var responseJSON = (response && response != "" ? JSON.parse(response) : null); // Convert response to Object
                if (!responseJSON)
                    responseJSON = {
                        apiName: "Get Job",
                        "jobs/job": processName,
                        jobId: null,
                        status: null
                    }
                var errorMsg = "";
                if (!response) {
                    errorMsg = result.getErrorMessage()
                } else if (responseJSON && responseJSON.errors) {
                    // response: {"errors":[{"message":"Cannot invoke \"java.lang.String.split(java.lang.String)\" because the return value of \"org.lct.clients.process.model.job.external.DocumentFilter.getField()\" is null","errorCode":null,"context":null,"details":[]}]}
                    for (var ee in responseJSON.errors)
                        errorMsg += (errorMsg == "" ? "" : br) + responseJSON.errors[ee].message;
                }
                if (errorMsg != "") {
                    logDebug(msgFormat["Error"].replace("$$msg$$", "ERROR: UNABLE TO REACH DIGEPLAN " + apiName + " API")
                        + ", response: " + response
                        + ": " + errorMsg);
                } else {
                    if (response)
                        logDebug(msgFormat["Info"].replace("$$msg$$", "Calling DigEplan " + apiName + " API") + ", response: " + response);
                }
                responseJSON.apiURL = apiURL;
                responseJSON.apiName = apiName;
                responseJSON.jobName = (apiURL.toLowerCase().indexOf("/ext/v1/") >= 0 ? apiURL.substr(apiURL.toLowerCase().indexOf("/ext/v1/")) : apiURL);
                responseJSON.processName = processName;
                this.apiResponse = responseJSON;
                if (responseJSON && !responseJSON.code) {
                    this.jobId = responseJSON.jobId
                    logDebug("response.jobId: " + responseJSON.jobId);
                }
                return responseJSON;
            }
        } catch (err) {
            logDebug("ERROR: DigEplan " + apiName + " API POST: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
        }
        return null;
    }

    this.getJob = function (jobId) {
        // Get the list of Accela Record Statuses that should trigger a DigEplan pre-cache call
        var apiName = (arguments.length > 2 && arguments[2] ? arguments[2] : "");
        var processName = (arguments.length > 3 && arguments[3] ? arguments[3] : null);

        try {
            var response = null;

            var invalidInfo = [],
                invalidInfoSTD = [],
                invalidInfoIncludes = [];
            if (this.env == undefined) {
                invalidInfoSTD.push("DIGEPLAN_ENV");
            }
            if (this.subDomain == undefined) {
                invalidInfoSTD.push("DIGEPLAN_SUBDOMAIN");
            }
            if (this.jobPAT == undefined) {
                invalidInfoSTD.push("DIGEPLAN_JOB_PAT");
            }
            if (invalidInfoSTD.length) {
                invalidInfo.push("STD CHOICE: EXTERNAL_DOC_REVIEW > " + invalidInfoSTD.join(", "));
            }
            if (invalidInfoSTD.length) {
                logDebug("<font color='red'>ERROR: UNABLE TO CALL DIGEPLAN " + apiName + " API." + " CHECK " + invalidInfo.join("; ") + "</font>");
                return null;
            } else {
                var hparameters = aa.httpClient.initPostParameters();
                hparameters.put("X-CUSTOMER-NAME", this.subDomain);
                hparameters.put("X-PRODUCT-NAME", "APP");
                hparameters.put("X-PAT-TOKEN", this.jobPAT);
                //hparameters.put("CONTENT-TYPE", "APPLICATION/JSON");

                var apiName = "getJob";
                var apiURL = "https://api." + this.env + "/ext/v1/jobs/" + jobId;
                this.apiURL = apiURL;
                this.apiHeader = hparameters;
                this.apiContent = null;
                // logDebug("DigEplan API Get URL: " + this.apiURL + br + ", Header: " + this.apiHeader);
                var result = aa.httpClient.get(this.apiURL, this.apiHeader);
                var response = (result && result.getSuccess() ? result.getOutput() : null);
                var responseJSON = (response && response != "" ? JSON.parse(response) : null); // Convert response to Object
                if (!responseJSON)
                    responseJSON = {
                        apiName: "Get Job",
                        "jobs/job": processName,
                        jobId: jobId,
                        status: null
                    }
                var errorMsg = "";
                if (!response) {
                    errorMsg = result.getErrorMessage()
                } else if (responseJSON && responseJSON.error) {
                    errorMsg = responseJSON.error
                } else if (responseJSON && responseJSON.errors) {
                    // response: {"errors":[{"message":"Cannot invoke \"java.lang.String.split(java.lang.String)\" because the return value of \"org.lct.clients.process.model.job.external.DocumentFilter.getField()\" is null","errorCode":null,"context":null,"details":[]}]}
                    for (var ee in responseJSON.errors)
                        errorMsg += (errorMsg == "" ? "" : br) + responseJSON.errors[ee].message;
                }
                if (errorMsg != "") {
                    logDebug(msgFormat["Error"].replace("$$msg$$", "ERROR: UNABLE TO REACH DIGEPLAN " + apiName + " API")
                        + ", response: " + response
                        + ": " + errorMsg);
                    // } else if (response) {
                    //     logDebug(msgFormat["Info"].replace("$$msg$$", "Calling DigEplan " + apiName + " API") + ", response: " + response);
                }
                if (response)
                    logDebug(msgFormat["Info"].replace("$$msg$$", "Calling DigEplan Jobs/Job process API: "
                        + (response && responseJSON && responseJSON.status ? " jobId: " + responseJSON.jobId + ", status: " + responseJSON.status : response)));
                responseJSON.apiURL = apiURL;
                responseJSON.apiName = apiName;
                responseJSON.jobName = (apiURL.toLowerCase().indexOf("/ext/v1/") >= 0 ? apiURL.substr(apiURL.toLowerCase().indexOf("/ext/v1/")) : apiURL);
                responseJSON.jobId = jobId;
                this.apiResponse = responseJSON;
                return responseJSON;
            }
        } catch (err) {
            logDebug("ERROR: DigEplan getJob API GET: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
        }
        if (!response)
            response = {
                apiName: "Get Job",
                "jobs/job": processName,
                jobId: jobId,
                status: null
            }
        return response;
    }

    this.jobWait = function (response, maxJobChecks, waitTime, apiName, processName) {
        var jobId = null;
        if (response && !response.code) {
            jobId = response.jobId;
        }

        // Check for Process Complete
        if (jobId && maxJobChecks) {
            for (var ii = 0; ii < maxJobChecks; ii++) {
                if (!jobId)
                    break;
                this.wait(waitTime); // in milliseconds
                var responseJob = this.getJob(jobId);
                if (!responseJob || responseJob.code)
                    break;
                response.status = responseJob.status;
                if (exists(response.status, [404, "COMPLETE"]))
                    break;
                // if (response.status != "PROCESSING") break;
            }
        }

        if (!response)
            response = {
                apiName: apiName,
                jobName: processName,
                jobId: jobId,
                status: null
            }
        // add additional info if missing.
        if (typeof (response.apiName) == undefined)
            response.apiName = apiName;
        if (typeof (response.jobName) == undefined)
            response.jobName = processName;
        if (typeof (response.jobId) == undefined)
            response.jobId = jobId;
        if (typeof (response.status) == undefined)
            response.status = null;
        return response;
    }

    this.setStampOptions = function (stampOptions) { // Used to set default stamp options.
        if (!stampOptions)
            stampOptions = [];
        if (stampOptions["name"] && !stampOptions["stamp"]) {
            if (typeof (digEplanStamps) == "undefined") {
                logDebug('Missing digEplanStamps');
            } else if (typeof (digEplanStamps[stampOptions["name"]]) == "undefined") {
                logDebug('Missing digEplanStamps["' + stampOptions["name"] + '"]');
            } else if (typeof (digEplanStamps[stampOptions["name"]].id) == "undefined") {
                logDebug('Missing digEplanStamps["' + stampOptions["name"] + '"].id');
            } else {
                var digEplanStamp = digEplanStamps[stampOptions["name"]]
                stampOptions["stamp"] = digEplanStamp.id;
                if (!stampOptions["position"] && digEplanStamp.position)
                    stampOptions["position"] = digEplanStamp.position;
                if (!stampOptions["offsetx"] && digEplanStamp.valueOffsetX)
                    stampOptions["offsetx"] = digEplanStamp.valueOffsetX;
                if (!stampOptions["offsety"] && digEplanStamp.valueOffsetY)
                    stampOptions["offsety"] = digEplanStamp.valueOffsetY;
                if (!stampOptions["height"] && digEplanStamp.height)
                    stampOptions["height"] = digEplanStamp.height;
                if (!stampOptions["width"] && digEplanStamp.width)
                    stampOptions["width"] = digEplanStamp.width;
            }
        }

        if (!stampOptions["stamp"])
            stampOptions["stamp"] = null;
        if (!stampOptions["position"])
            stampOptions["position"] = "topLeft";
        if (!stampOptions["offsetx"])
            stampOptions["offsetx"] = "";
        if (!stampOptions["offsety"])
            stampOptions["offsety"] = "";
        if (!stampOptions["status"])
            stampOptions["status"] = "OPN";
        if (!stampOptions["department"])
            stampOptions["department"] = "Building";
        if (!stampOptions["category"])
            stampOptions["category"] = "PUB";
        // if (!stampOptions["page"]) stampOptions["page"] = "ALL";
        if (!stampOptions["page"])
            stampOptions["page"] = "FIRST";
        if (!stampOptions["width"])
            stampOptions["width"] = "";
        if (!stampOptions["height"])
            stampOptions["height"] = "";
        if (!stampOptions["userName"])
            stampOptions["userName"] = "";
        var fMsg = "";
        for (var ff in stampOptions)
            fMsg += (fMsg == "" ? "" : ", ") + ff + ": " + stampOptions[ff];
        logDebug("StampOptions: {" + fMsg + "}");
        logDebug("stampOptions: " + JSON.stringify(stampOptions));

        return stampOptions;
    }

    // Various API Calls
    this.runDocumentsBatchStamp = function (itemCapId) {
        // Batch Stamp all Plan Sheets that have been Approved.
        var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : {
            "status": "Approved"
        });
        var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : {
            "custom.ReviewStatus": "Approved"
        });
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null); // not used.
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var apiName = "Documents Batch Stamp";
        var processName = "Documents.Batch Stamp";
        var apiName = "Documents Batch Stamp";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/documents/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        if (!stampOptions || !stampOptions.name) {
            invalidInfo.push("stampName");
        } else {
            stampOptions = this.setStampOptions(stampOptions);
            if (!stampOptions || !stampOptions.stamp) {
                invalidInfo.push("Stamp: " + stampOptions.name);
            } else {
                logDebug("stampOptions: " + JSON.stringify(stampOptions));
            }
        }
        // Gather document filters
        var docFilters = [];
        if (!documentFilters) {
            invalidInfo.push("documentFilters");
        } else {
            for (var dd in documentFilters) {
                logDebug(dd + ": " + documentFilters[dd]);
                docFilters.push({
                    "field": dd,
                    "value": documentFilters[dd]
                });
            }
            if (docFilters.length == 0) {
                invalidInfo.push("documentFilters (empty)");
                logDebug("No documents to process.");
            }
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(itemCapId.getCustomID()),
            documentFilters: docFilters,
            fields: {
                "stamp.stamp.stamp": stampOptions.stamp,
                "stamp.stamp.position": stampOptions.position,
                "stamp.stamp.offsetx": stampOptions.offsetx,
                "stamp.stamp.offsety": stampOptions.offsety,
                "stamp.stamp.status": stampOptions.status,
                "stamp.stamp.department": stampOptions.department,
                "stamp.stamp.category": stampOptions.category,
                "stamp.stamp.page": stampOptions.page,
                "stamp.stamp.width": stampOptions.width,
                "stamp.stamp.height": stampOptions.height
            },
            dataFields: {
                "user_displayName": stampOptions.userName
            },
            processId: processID
        };

        logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }
    this.runDocumentMergeReport = function (itemCapId) {
        // Merge all Documents that have been Approved.
        var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : {
            "custom.ReviewStatus": "Approved"
        });
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null); // not used.
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Documents.Merged Documents Report";
        var apiName = "Documents Merge Report";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/documents/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        // Gather document filters
        var docFilters = [];
        if (!documentFilters) {
            invalidInfo.push("documentFilters");
        } else {
            for (var dd in documentFilters) {
                logDebug(dd + ": " + documentFilters[dd]);
                docFilters.push({
                    "field": dd,
                    "value": documentFilters[dd]
                });
            }
            if (docFilters.length == 0) {
                invalidInfo.push("documentFilters (empty)");
                logDebug("No documents to process.");
            }
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(itemCapId.getCustomID()),
            documentFilters: docFilters,
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }
    this.runDocumentStamp = function (itemCapId, docModel) {
        // Stamp pages for a single document.
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null); // not used.
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Documents.Batch Stamp";
        var apiName = "Documents Stamp";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/document/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        if (!stampOptions || !stampOptions.name) {
            invalidInfo.push("stampName");
        } else {
            stampOptions = this.setStampOptions(stampOptions);
            if (!stampOptions || !stampOptions.stamp) {
                invalidInfo.push("Stamp: " + stampOptions.name);
            } else {
                logDebug("stampOptions: " + JSON.stringify(stampOptions));
            }
        }
        // Check document model
        if (!docModel) {
            invalidInfo.push("docModel");
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(docModel.capID.getCustomID()),
            originalDocumentId: String(docModel.documentNo),
            fields: {
                "stamp.stamp.stamp": stampOptions.stamp,
                "stamp.stamp.position": stampOptions.position,
                "stamp.stamp.offsetx": stampOptions.offsetx,
                "stamp.stamp.offsety": stampOptions.offsety,
                "stamp.stamp.status": stampOptions.status,
                "stamp.stamp.department": stampOptions.department,
                "stamp.stamp.category": stampOptions.category,
                "stamp.stamp.page": stampOptions.page,
                "stamp.stamp.width": stampOptions.width,
                "stamp.stamp.height": stampOptions.height
            },
            dataFields: {
                "user_displayName": stampOptions.userName
            },
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.runSheetMergeReport = function (itemCapId) {
        // Merge all Plans Sheets that have been Approved
        // var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : { "custom.ReviewStatus": "Approved" });
        var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : {
            "status": "Approved"
        });
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null); // not used.
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Sheets.Merged Plan Report";
        var apiName = "Sheet Merge Report";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/sheets/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        // if (!stampOptions || !stampOptions.name) {
        //     invalidInfo.push("stampName");
        // } else {
        //     stampOptions = this.setStampOptions(stampOptions);
        //     if (!stampOptions || !stampOptions.stamp) {
        //         invalidInfo.push("Stamp: " + stampOptions.name);
        //     }
        // }
        // Gather document filters
        var docFilters = [];
        if (!documentFilters) {
            invalidInfo.push("documentFilters");
        } else {
            for (var dd in documentFilters) {
                logDebug(dd + ": " + documentFilters[dd]);
                docFilters.push({
                    "field": dd,
                    "value": documentFilters[dd]
                });
            }
            if (docFilters.length == 0) {
                invalidInfo.push("documentFilters (empty)");
                logDebug("No documents to process.");
            }
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(itemCapId.getCustomID()),
            documentFilters: docFilters,
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.runSheetBatchStamp = function (itemCapId) {
        // Stamp all Plans Sheets that have been Approved
        // var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : { "custom.ReviewStatus": "Approved" });
        var documentFilters = (arguments.length > 1 && arguments[1] ? arguments[1] : {
            "status": "Approved"
        });
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Sheets.Batch Stamp";
        var apiName = "Sheet Batch Stamp";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/sheets/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        if (!stampOptions || !stampOptions.name) {
            invalidInfo.push("stampName");
        } else {
            stampOptions = this.setStampOptions(stampOptions);
            if (!stampOptions || !stampOptions.stamp) {
                invalidInfo.push("Stamp: " + stampOptions.name);
            } else {
                logDebug("stampOptions: " + JSON.stringify(stampOptions));
            }
        }
        // Gather document filters
        var docFilters = [];
        if (!documentFilters) {
            invalidInfo.push("documentFilters");
        } else {
            for (var dd in documentFilters) {
                docFilters.push({
                    "field": dd,
                    "value": documentFilters[dd]
                });
            }
            if (docFilters.length == 0) {
                invalidInfo.push("documentFilters (empty)");
                logDebug("No documents to process.");
            }
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(itemCapId.getCustomID()),
            documentFilters: docFilters,
            fields: {
                "stamp.stamp.stamp": stampOptions.stamp,
                "stamp.stamp.position": stampOptions.position,
                "stamp.stamp.offsetx": stampOptions.offsetx,
                "stamp.stamp.offsety": stampOptions.offsety,
                "stamp.stamp.status": stampOptions.status,
                "stamp.stamp.department": stampOptions.department,
                "stamp.stamp.category": stampOptions.category,
                "stamp.stamp.page": stampOptions.page,
                "stamp.stamp.width": stampOptions.width,
                "stamp.stamp.height": stampOptions.height
            },
            dataFields: {
                "user_displayName": stampOptions.userName
            },
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.runApprovedReport = function (itemCapId, docModel) {
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null); // Not Used.
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Documents.Create Approved Plans/Documents";
        var apiName = "Approved Report";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/document/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        // Check document model
        if (!docModel) {
            invalidInfo.push("docModel");
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(docModel.capID.getCustomID()),
            originalDocumentId: String(docModel.documentNo),
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.runResubmittalReport = function (itemCapId, docModel) {
        var stampOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null); // Not Used.
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Documents.Create Revision Request";
        var apiName = "Resubmittal Report";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/document/create";

        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        // Check document model
        if (!docModel) {
            invalidInfo.push("docModel");
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            folderId: String(docModel.capID.getCustomID()),
            originalDocumentId: String(docModel.documentNo),
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }


    this.runReportProcess = function (itemCapId, docModels) {
        var processOptions = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
        var waitTime = (arguments.length > 3 && arguments[3] ? arguments[3] : 500);
        var maxJobChecks = (arguments.length > 4 ? arguments[4] : 20);

        var processName = "Documents.Create " + processOptions.name; // Approved Report, Interim Report or Resubmittal Report.
        var apiName = "Report (Document Create) Process";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/document/create";

        if (!processOptions) processOptions = { status: "OPN", category: "PUB", filtermarkups: true, department: "" };
        if (!processOptions.status) processOptions.status = "OPN";
        if (!processOptions.category) processOptions.category = "PUB";
        if (!processOptions.filtermarkups) processOptions.filtermarkups = true;
        if (!processOptions.department) processOptions.department = "";
        if (!processOptions.onlytextualmarkups) processOptions.onlytextualmarkups = true;
        if (!processOptions.checkinstatus) processOptions.checkinstatus = "Comments Available Now";
        if (!processOptions.coverpage) processOptions.coverpage = true;
        if (!processOptions.checkin) processOptions.checkin = true;
        if (!processOptions.documentcheckintypes) processOptions.documentcheckintypes = "NEW";
        if (!processOptions.adobemarkups) processOptions.adobemarkups = false;
        if (!processOptions.pdfa) processOptions.pdfa = false;
        if (!processOptions.onlymarkeduppages) processOptions.onlymarkeduppages = true;
        if (!processOptions.filenamesuffix) processOptions.filenamesuffix = " - Interim - {{department}}";
        if (!processOptions.description) processOptions.description = "Interim Report - {{department}}";

        var department = processOptions.department;
        if (department == "") department = "ALL";
        // processOptions.filenamesuffix.replace("{{department}}", department);
        // processOptions.description.replace("{{department}}", department);


        this.jobId = null, this.jobStatus = null;
        if (itemCapId == null) itemCapId = capId;
        var capIDString = itemCapId.getCustomID();
        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        // Gather document models
        var jobDocuments = [];
        if (!docModels) {
            invalidInfo.push("docModels");
        } else {
            for (var dd in docModels) {
                docFilters.push({ "originalId": + + String(docModels[dd].documentNo), "folderId": + String(docModels[dd].capID.getCustomID()) });
            }
            if (jobDocuments.length == 0) {
                invalidInfo.push("docModels (empty)");
                logDebug("No documents to process.");
            }
        }

        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            jobDocuments: [jobDocuments],
            fields: {
                "convert.filtermarkups.status": processOptions.status,
                "convert.filtermarkups.category": processOptions.category,
                "convert.filtermarkups.filtermarkups": processOptions.filtermarkups,
                "convert.filtermarkups.department": processOptions.department,
                "convert.pdf.onlytextualmarkups": processOptions.onlytextualmarkups,
                "convert.checkin.checkinstatus": processOptions.checkinstatus,
                "convert.pdf.coverpage": processOptions.coverpage,
                "convert.checkin.checkin": processOptions.checkin,
                "convert.checkin.documentcheckintypes": processOptions.documentcheckintypes,
                "convert.pdfoutput.adobemarkups": processOptions.adobemarkups,
                "convert.pdfoutput.pdfa": processOptions.pdfa,
                "convert.pdfoutput.onlymarkeduppages": processOptions.onlymarkeduppages,
                "convert.checkin.filenamesuffix": processOptions.filenamesuffix,
                "convert.checkin.description": processOptions.description
            },
            processId: processID
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.runCaseProcess = function (itemCapId) {
        var processOptions = (arguments.length > 1 && arguments[1] ? arguments[1] : null);

        var processName = (processOptions ? (processOptions.processName? processOptions.processName : (processOptions.name? "Documents.Create " + processOptions.name : null)) : null) // waitTime in msec
        var waitTime = (processOptions && processOptions.waitTime? processOptions.waitTime : 500) // waitTime in msec
        var maxJobChecks = (processOptions && processOptions.maxJobChecks? processOptions.maxJobChecks : 20)

        var apiName = "Case (Create) Process";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/case/create";

        if (!processOptions)
            processOptions = {
                status: "OPN",
                category: "PUB",
                filtermarkups: true,
                department: ""
            };
        if (!processOptions.status)
            processOptions.status = "OPN";
        if (!processOptions.category)
            processOptions.category = "PUB";
        if (!processOptions.filtermarkups)
            processOptions.filtermarkups = true;
        if (!processOptions.department)
            processOptions.department = "";
        if (!processOptions.onlytextualmarkups)
            processOptions.onlytextualmarkups = true;
        if (!processOptions.checkinstatus)
            processOptions.checkinstatus = "Comments Available Now";
        if (!processOptions.coverpage)
            processOptions.coverpage = true;
        if (!processOptions.checkin)
            processOptions.checkin = true;
        if (!processOptions.documentcheckintypes)
            processOptions.documentcheckintypes = "NEW";
        if (!processOptions.adobemarkups)
            processOptions.adobemarkups = false;
        if (!processOptions.pdfa)
            processOptions.pdfa = false;
        if (!processOptions.onlymarkeduppages)
            processOptions.onlymarkeduppages = true;
        if (!processOptions.filenamesuffix)
            processOptions.filenamesuffix = " - Interim - {{department}}";
        //if (!processOptions.description)
            //processOptions.description = "Interim Report - {{department}}";

        var department = processOptions.department;
        if (department == "")
            department = "ALL";
        // processOptions.filenamesuffix.replace("{{department}}", department);
        // processOptions.description.replace("{{department}}", department);


        this.jobId = null;
        this.jobStatus = null;
        logDebug("itemCapId: " + itemCapId + ", capId: " + capId + ", " + String(itemCapId.getCustomID()));
        if (itemCapId == null)
            itemCapId = capId;
        var capIDString = itemCapId.getCustomID();
        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        logDebug("itemCapId: " + itemCapId + ", capId: " + capId + ", capIDString: " + capIDString);
        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            processId: processID,
            folderId: String(capIDString)
        };
		if (processOptions.description) {
			apiContent.fields = {
				"generatereport.checkin.description": processOptions.description
			}
		}
        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.runSheetsProcess = function (itemCapId) {
        var processOptions = (arguments.length > 1 && arguments[1] ? arguments[1] : null);

        var processName = (processOptions ? (processOptions.processName? processOptions.processName : (processOptions.name? "Documents.Create " + processOptions.name : null)) : null) // waitTime in msec
        var waitTime = (processOptions && processOptions.waitTime? processOptions.waitTime : 500) // waitTime in msec
        var maxJobChecks = (processOptions && processOptions.maxJobChecks? processOptions.maxJobChecks : 20)

        var apiName = "Sheets (Create) Process";
        var apiURL = "https://api." + this.env + "/ext/v1/jobs/sheets/create";

        if (!processOptions)
            processOptions = {
                status: "OPN",
                category: "PUB",
                filtermarkups: true,
                department: ""
            };
        if (!processOptions.status)
            processOptions.status = "OPN";
        if (!processOptions.category)
            processOptions.category = "PUB";
        if (!processOptions.filtermarkups)
            processOptions.filtermarkups = true;
        if (!processOptions.department)
            processOptions.department = "";
        if (!processOptions.onlytextualmarkups)
            processOptions.onlytextualmarkups = true;
        if (!processOptions.checkinstatus)
            processOptions.checkinstatus = "Comments Available Now";
        if (!processOptions.coverpage)
            processOptions.coverpage = true;
        if (!processOptions.checkin)
            processOptions.checkin = true;
        if (!processOptions.documentcheckintypes)
            processOptions.documentcheckintypes = "NEW";
        if (!processOptions.adobemarkups)
            processOptions.adobemarkups = false;
        if (!processOptions.pdfa)
            processOptions.pdfa = false;
        if (!processOptions.onlymarkeduppages)
            processOptions.onlymarkeduppages = true;
        if (!processOptions.filenamesuffix)
            processOptions.filenamesuffix = " - Interim - {{department}}";
        if (!processOptions.description)
            processOptions.description = "Interim Report - {{department}}";

        var department = processOptions.department;
        if (department == "")
            department = "ALL";
        // processOptions.filenamesuffix.replace("{{department}}", department);
        // processOptions.description.replace("{{department}}", department);


        this.jobId = null;
        this.jobStatus = null;
        logDebug("itemCapId: " + itemCapId + ", capId: " + capId + ", " + String(itemCapId.getCustomID()));
        if (itemCapId == null)
            itemCapId = capId;
        var capIDString = itemCapId.getCustomID();
        var invalidInfo = [];
        if (typeof (digEplanProcesses[processName]) == "undefined" || !digEplanProcesses[processName].id) {
            invalidInfo.push("Process: " + processName);
        }
        if (invalidInfo.length > 0) {
            comment("Check " + invalidInfo);
            return null;
        }

        logDebug("itemCapId: " + itemCapId + ", capId: " + capId + ", capIDString: " + capIDString);
        var processID = digEplanProcesses[processName].id;
        var apiContent = {
            processId: processID,
            folderId: String(capIDString)
        };

        // logDebug("DigEplan " + apiName + " API, process: " + processName + ", Content: " + JSON.stringify(apiContent));

        var response = this.apiPost(apiURL, apiContent, apiName, processName);
        var response = this.jobWait(response, maxJobChecks, waitTime, apiName, processName);
        return response;
    }

    this.wait = function (ms) {
        logDebug("Waiting " + ms + " ms");
        var start = new Date().getTime();
        var end = start;
        while (end < start + ms) {
            end = new Date().getTime();
        }
    }
}

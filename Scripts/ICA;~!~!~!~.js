/*------------------------------------------------------------------------------------------------------/
| Program : ICA:~/~/~/~
| Event   : InspectionCancelAfter
|
| Client  : Placer County (placerco)
| Usage   : Inspection Cancel After for all Building records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/11/2022 Created script
|         : TDunn 04/07/2022 revised script to use inspector userId instead of name.
|                
| 
/------------------------------------------------------------------------------------------------------*/

if(currentUserID == "TDUNN") { showDebug = 1;}
var	appTypeString = "";
var	appTypeArray = new Array();
var thisInspID = "";

inspectionList = aa.env.getValue("InspectionList");
inspectionObj = inspectionList.iterator();
while (inspectionObj.hasNext()) {
 
	var inspectionModel = inspectionObj.next();
	var inspType = inspectionModel["inspectionType"].toString();													 
	var inspectorObj = inspectionModel["inspector"];
	logDebug("inspector: " + inspectorObj);
	var inspector = inspectorObj.getUserID(); 

	thisInspID = inspector;
	logDebug(thisInspID);

	getUserObj = aa.person.getUser(thisInspID);							  
	logDebug("getSuccess = " + getUserObj.getSuccess());
	if(!getUserObj.getSuccess()) {
		logDebug("**ERROR retrieving  user model " + inspType + " : " + getUserObj.getErrorMessage());
	}

	if(getUserObj.getSuccess()) {
		inspUserObj = getUserObj.getOutput();
		var staffEmail = inspUserObj.getEmail();
		var staffFirst = inspUserObj.getFirstName(); 
		var staffLast = inspUserObj.getLastName(); 
		logDebug(staffFirst + " " + staffLast + " email: " + staffEmail);
		var staffName = staffFirst + " " + staffLast;											   
		capId = inspectionModel["capID"]; 
		logDebug("myString = " + capId.getCustomID());
		var capIDString = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.getCapType();
		appTypeAlias = appTypeResult.getAlias();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		var capId1 = capId.getID1();
		var capId2 = capId.getID2();
		var capId3 = capId.getID3();
		var capIdObject = getCapId(capId1, capId2, capId3); // call internal function
		// var capIDString = capIdObject.getCustomID();

		logDebug("Record Type: " + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
	

		var inspInspector = getInspector(inspectionModel["inspectionType"].toString())
		var lastInspector = getLastScheduledInspector(inspectionModel["inspectionType"]);
		
		logDebug("last inspector = " + lastInspector);
		emailTo = getUserEmail(getInspector(inspectionModel["inspectionType"].toString())) ;  
		logDebug( "email:" + emailTo + "; inspInspector: " + inspInspector + " for inspection " + inspType );  
		logDebug("AltID: " + capId + " : " + capIDString);
		capString = String(capId);
		IDArray = capString.split("-");
		// IDArray = String(inspectionModel["capID"].split("-"));  
		logDebug("Broken up internal id: " + IDArray[0] + "  " + IDArray[1] + " " + IDArray[2]);  
		var myNewID = aa.cap.getCapID(IDArray[0], IDArray[1], IDArray[2]).getOutput(); 
		capIDString = myNewID.getCustomID();
		logDebug("myNewID: " + myNewID);
		logDebug("This altID = " + capIDString);
		var TPInspObject = aa.inspection.getInspection(myNewID, inspectionModel["idNumber"]).getOutput(); 
		TPAddrObject = aa.address.getPrimaryAddressByCapID(myNewID, "Y").getOutput();
		var primeAddr = TPAddrObject.addressModel;
		logDebug("Address: " +TPAddrObject.addressModel);
		logDebug("Prim addr = " + primeAddr);
		vSchedString = inspectionModel["scheduledDateString"];
		var inspSchedDate = vSchedString.substring(0,10);
		var newDateArray = inspSchedDate.split("-");
		inspSchedDate = newDateArray[1] + "/" + newDateArray[2] + "/" + newDateArray[0];
		logDebug("Scheduled Date = " + inspSchedDate);
		// for (x in inspectionModel) {
		// logDebug("DEBUG: " + x + " : " + inspectionModel[x]);
		// }
		
		var emailParameters = aa.util.newHashtable();
		staffEmail = "";
		var inspResult = "Cancelled"
		var assignedStaff = getLastScheduledInspector(inspType);
		logDebug("Assigned to = " + assignedStaff);
		if(assignedStaff == null) {
			assignedStaff = getInspector(inspType);
			logDebug("Assigned to = " + assignedStaff);
		}
		//if(!matches(assignedStaff,"BLDG",null,"",undefined)) {
		if(!matches(thisInspID,"BLDG",null,"",undefined)) {	
			//staffResult = aa.person.getUser(assignedStaff);
			staffResult =  aa.person.getUser(thisInspID);	
			if (!staffResult.getSuccess())
				{ logDebug("**ERROR retrieving  user model " + assignId + " : " + staffResult.getErrorMessage()) }
			if (staffResult.getSuccess()) {
				staffObject = staffResult.getOutput();
				staffEmail = staffObject.getEmail();
				staffFirst = staffObject.getFirstName(); 
				staffLast = staffObject.getLastName(); 
				logDebug(staffFirst + " " + staffLast + " email: " + staffEmail);
				staffName = staffFirst + " " + staffLast;
			}

			if(!matches(staffEmail,undefined,"",null)) {
				vToEmail = staffEmail;
				vFromEmail = "";
				vCcEmail = "";
				vTemplateName = "IRSA_CANCEL_RESCHEDULE_NOTICE_TO_INSPECTOR";
				// addParameter(emailParameters,"$$assignedStaffParam$$",assignedStaff);
				addParameter(emailParameters,"$$assignedStaffParam$$",thisInspID);			
				addParameter(emailParameters,"$$staffEmailParam$$",staffEmail);
				addParameter(emailParameters,"$$staffNameParam$$",staffName);
				addParameter(emailParameters,"$$inspTypeParam$$",inspType);
				addParameter(emailParameters,"$$inspResultParam$$",inspResult);
				addParameter(emailParameters,"$$inspSchedDateParam$$",inspSchedDate);
				addParameter(emailParameters,"$$altID$$",capIDString);
				
				emailResult = sendNotification(vFromEmail,vToEmail, vCcEmail, vTemplateName, emailParameters, null);
				logDebug("Email sent is " + emailResult);
			}
		
		}

	}
}
// var sendResult = aa.sendMail("noreply@placer.ca.gov","tdunn@truepointsolutions.com", "", "Testing ICA script ", debug);	



/* Key inspection variables -/
Inspection #0
inspId 17682008
inspInspector = TDUNN
InspectorFirstName = Terry
InspectorMiddleName = null
InspectorLastName = Dunn
inspGroup = B_WHTR
inspType = 5010-Water Heater
inspSchedDate = 2/3/2020
/-------------------------*/
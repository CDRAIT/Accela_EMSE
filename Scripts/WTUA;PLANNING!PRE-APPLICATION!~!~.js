/*=================================================================================================================================/
| Program : WTUA;Planning/Pre-Application/~/~
|
| Event   : WorkflowTaskUpdateAfter
|
| Client  : Placer County, CA
| Usage   : WTUA script for all Pre-Application Planning records.
| 
|
| Requires: EMSE 3.0 and Standard Choice: "EMSE_EXECUTE_OPTIONS": "SCRIPT" to be Active.
|
| Notes   : TDunn 01/2023 converted script from EMSE 2.0 to EMSE 3.0 
|         : TDunn 02/02/2023 added code to support additional planning record types.
|         : TDunn 08/10/2023 added code to handle TRPA Res and Non-Res site assessment.
|         : TDunn 08/10/2023 converted additional EMSE 2.0 ASA:Planning and ASA:TRPA/Planning scripting and integrated into EMSE 3.0 script.
|         : TDunn 08/25/2023 Remarked out code affecting TRPA record types pending updates to specifications
|         : TDunn 08/25/2023 Removed additional code for ASA Planning
|         : TDunn 01/02/2024 added new task activation actions to manage records created prior to the addition of the Permit Initiation task
|                            for Extension of Time requests
|         : TDunn 06/07/2024 added new EOT functionality to create child project of same type as original project with EOT extension and EOT number
|         : TDunn 06/13/2024 updated multiple variable referrences, updated logic for creating altId for second EOT on original project.
|         : TDunn 09/13/2024 updated work desc updates section. Added custom createChildNoContacts to exclude copying contacts from parent proj
|         : TDunn 09/25/2024 modified custom function to exclude address and parcel copy to child
|         
/=====================================================================================================================================*/
// 
// Create child entitlement record
if(matches(currentUserID,"JMCKENZI","TDUNN", "EAFTAHI"))
{	
	showDebug = 1;
}
/* Initialize variables */;
var doExtension = false;
var haveID = false; 
var eCapId = null; 
var myCapId = null;
var isTRPA = false;
if(wfStatus == "Additional Information Required") 
{
	// preAppCorrectionsNotice
	/* Initialize parameters for notification */
	var vEmailTemplate = "NOTICE_PREAPP_CORRECTIONS"; 
	createNotificationTPS2(vEmailTemplate,"Y","Applicant","N","","N","N","N","Y","N","N","");
}

/* Initialize variables if PreApp complete*/
if(wfStatus == "Pre-Application Complete")
{
	var doExtension = true;
	if(AInfo["Record Type"] != "Extension of Time")
	{
		doExtension = false; 
		/* Initialize variables and create new record */
		var recType = AInfo["Record Type"]; 
		var pCapId = capId;
		if(!matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
		{
			var cCapId = createChild("Planning",recType,"NA","NA",capName,pCapId); 
		}
		/*
		if(matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
		{
			rIndex = recType.indexOf(" Verification");
			trpaType = recType.substring(0,rIndex);
			logDebug("TRPA type = " + trpaType);
			var cCapId = createChild("TRPA","Planning",trpaType,"NA",capName,pCapId); 
		}		
		*/
		varProjNum = cCapId.getCustomID();
		logDebug("AltId = " + varProjNum);
		if(cCapId != null)
		{
			logDebug("Parent Project ID = "+ capIDString);
			copyAppSpecific(cCapId); 
			NewSn = getShortNotes(pCapId); 
			updateShortNotes(NewSn,cCapId);
			pWorkDesc = workDescGet(pCapId);
			updateWorkDesc(pWorkDesc,cCapId);
			copyOwnerTPS(pCapId,cCapId);
			copyDocuments(pCapId, cCapId);
			if(!matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
			{
				copyASITables(pCapId,cCapId);
			}
			if(getAppSpecific("Project Office",pCapId) == "Auburn"){
				assignCap("PLNTECH_ABN",cCapId); 
			}
			if(getAppSpecific("Project Office",pCapId) == "Tahoe")
			{
				assignCap("PLNTECH_TAH",cCapId);
			}
			appTypeArray[1] = recType; 
			capId = cCapId; 
			if(!matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
			{
				loadCustomScript("PlanningActionsForPreApp");
			}
			/*
			if(matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
			{
				// need to convert: branch("ES_CONTACTUPDATEAFTER");
				if (AInfo["Permit Type"] !=null) 
				{
					updateShortNotes(AInfo['Permit Type']);

					// For non-res
					if (getAppSpecific("Permit Type") == "Signs") 
					{
						addFee("PTSASIGN","TRPA-PLANNING","FINAL",1,"N");
						addTask("TRPA Planning Review", "Planning Review", "P");
					}

					if (getAppSpecific("Permit Type") == "Use Verification") {
						addFee("PTSAUSE","TRPA-PLANNING","FINAL",1,"N");
					}

					// For Res 
					if (getAppSpecific("Permit Type") == "Complete Site Assessment") 
					{
						addFee("PTSACSA","TRPA-PLANNING","FINAL",1,"N");
					}

					if (getAppSpecific("Permit Type") == "Partial Site Assessment") 
					{
						addFee("PTSAPSA","TRPA-PLANNING","FINAL",1,"N");
					}
					// For Res and Non Res 
					if (getAppSpecific("Permit Type") == "Land Capability Verification") 
					{
						addFee("PTSALCV","TRPA-PLANNING","FINAL",1,"N");
					}
					if (getAppSpecific("Permit Type") == "Land Coverage Verification") 
					{
						addFee("PTSAGSA","TRPA-PLANNING","FINAL",1,"N");
						addFee("PTSAGCOV","TRPA-PLANNING","FINAL",1,"N");
					}

					if (appMatch("TRPA/Planning/Non-Residential/NA") && matches(AInfo['Permit Type'],"Signs")) {

					}
				}

				if (matches(appTypeArray[2],"Residential","Non-Residential")) 
				{
					updateFee("TECH","ACCOUNTING","FINAL",1,"N");
				}
			}
			*/
		}
	}
	
	if(doExtension && !matches(AInfo["Extension of Time Permit Number"],null,"",undefined))
	{
		var newProcess = true;
		var preAltId = capIDString;
		var preMajMin= AInfo["Major or Minor Project"];
		myAltId = AInfo["Extension of Time Permit Number"]; 
		eCapId = aa.cap.getCapID(myAltId).getOutput();
		if(eCapId != null)
		{
			if(newProcess)
			{
				addParent(myAltId); // add Pre-app as parent to original Planning project
				/* initialize variable for original project */
				var preCapId = capId; 
				var preCap = cap;
				capId = eCapId;
				var cap = aa.cap.getCap(capId).getOutput(); 
				var eCapGroup = cap.getCapType().getGroup(); // Cap Type Group
				var eCapPerType = cap.getCapType().getType(); // Cap Per Type Group
				//var capSubType = cap.getCapType().getSubType(); //
				//var capPerCategory = cap.getCapType().getCategory();
				var eAlias = cap.capModel.getAppTypeAlias();
				//var capStatus = cap.getCapStatus(); 
				// var eCapName = cap.getSpecialText();
				// var capId1 = capId.getID1();
				// var capId2 = capId.getID2();
				// var capId3 = capId.getID3();
				// var capIdObject = getCapIdBatch(capId1, capId2, capId3); // call internal function
				// var capIDString = capIdObject.getCustomID(); // Alternate Cap ID string
				// var capModule = cap.capModel.getModuleName();
				
				/* create child record and copy data from Pre-app */
				cCapId = createChildNoContacts("Planning",eCapPerType,"NA","NA",capName,capId); 
				
				if(cCapId != null)
				{
					varProjNum = cCapId.getCustomID();
					logDebug("AltId = " + varProjNum);					
					logDebug("Parent Project ID = "+ myAltId);
					logDebug("Pre-app AltId = " + preAltId);
					logDebug("Pre-app maj/minor = " + preMajMin);
					var pCapId = capId;
					var newAltID = "";
					var childExt = "-EOT";
					var NewSn = getShortNotes(pCapId);
					var pWorkDesc = workDescGet(pCapId);
					var parentID = myAltId;
					var eotIndex = myAltId.indexOf("-EOT");
					var eotNumber = getAppSpecific("EOT Number",eCapId)
					logDebug("eotIndex = " + eotIndex);
					// Initialize Last Rev number if null
					if(matches(getAppSpecific("EOT Number",eCapId),null,"")) 
					{
						editAppSpecific("EOT Number",0,eCapId);
						eotNumber = 0;
					}
					eotNumber = 1 * eotNumber;
					eotNumber = eotNumber + 1;
					logDebug("EOT Number is " + eotNumber);
					editAppSpecific("EOT Number",eotNumber,eCapId);
					
					logDebug("Current ParentID Number is " + parentID);
					logDebug("Child Type is :"+ childExt);
					if(eotIndex > -1)
					{
						parentID = myAltId.substring(0,eotIndex);
						logDebug("Updated parentID is " + parentID);
					}
					newAltID = parentID + childExt + formatRevNumber(eotNumber);
					
					aa.cap.updateCapAltID(cCapId, newAltID);	
					logDebug("Child AltID = " + newAltID);
					
					/* Undate original project description with EOT note */
					var eotNote = "New " + eAlias + " project " + newAltID + " created from EOT request " + preAltId + " on " + dateAdd(null,0) + " *** . " + "\n\n";
					updateWorkDesc(eotNote + pWorkDesc,pCapId);
					
					/* Copy information from preapp to new project */
					
					copyOwnerTPS(preCapId,cCapId);
					// var assignedTo = getAssignedToStaff(pCapId); 
					// if(assignedTo != null && assignedTo != "") 
					// {
						// assignCap(assignedTo,cCapId);
					// }
					copyAddresses(preCapId,cCapId);
					copyParcels(preCapId,cCapId);					
					// copyAppSpecific(cCapId); 
					editAppSpecific("EOT Number",eotNumber,cCapId);
					editAppSpecific("Major or Minor Project",preMajMin,cCapId);
					var preNewSn = getShortNotes(preCapId); 
					updateShortNotes(preNewSn,cCapId);
					var preWorkDesc = workDescGet(preCapId);
					updateWorkDesc(preWorkDesc,cCapId);
					copyContacts(preCapId,cCapId);
					copyDocumentsTPS(preCapId,cCapId);
					if(!matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
					{
						copyASITables(preCapId,cCapId);
					}
					if(getAppSpecific("Project Office",preCapId) == "Auburn"){
						assignCap("PLNTECH_ABN",cCapId);
						editAppSpecific("Project Office","Auburn",cCapId);
					}
					if(getAppSpecific("Project Office",preCapId) == "Tahoe")
					{
						assignCap("PLNTECH_TAH",cCapId);
						editAppSpecific("Project Office","Tahoe",cCapId);
					}
					appTypeArray[1] = recType; 
					capId = cCapId; 
					if(!matches(recType,"Non-Residential Verification-Site Assessment","Residential Verification-Site Assessment"))
					{
						// loadCustomScript("PlanningActionsForPreApp");
						include("PlanningActionsForPreApp");
					}
				}					
			}
			if(!newProcess)
			{
				addParent(myAltId); 
				saveCap = capId; 
				capId = eCapId; 
				activateTask("Permit Initiation");
				setTask("Submittal Review","Y","N","P_PLN1");
				updateTask("Submittal Review","Notes","Activated by an Extension of Time Pre-application request. Please ensure any fees due are paid prior to completing the Submittal Review task.","Activated in lieu of Permit Initiation","P_PLN1");
				// activateTask("Submittal Review"); 
				capId = saveCap;
			}
			cap = preCap;
			capId = preCapId;
		}
		
	}
}

//===================================================================================================================================
// Custom functions createChildNoContacts(grp,typ,stype,cat,desc) and copyDocumentsTPS(pFromCapId, pToCapId) required for this script
// added to prod Includes_Custom 09/27/2024
//===================================================================================================================================


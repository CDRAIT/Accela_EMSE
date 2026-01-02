/*******
This would be called from InspectionMultipleScheduleAfter and/or InspectionScheduleAfter
Assumes you have a standard choice called DEPARTMENT_INFORMATION that stores department spcific information for the email. ex:
Standard Choice Value: Building Department
Value Desc: $$DepartmentName$$:Building Department|$$DepartmentAddress$$:123 S Overhere St.|$$DepartmentCity$$:Salt Lake City|$$DepartmentState$$:UT|$$DepartmentContactPhone$$:999-999-9999|$$DepartmentContactEmail$$:buildingdept@ut.com
*************************/
function emailNotificationNoAttachmentRemoteInspection(contactTypesList, notificationTemplateOnsite, notificationTemplateRemote, vCapId) {
	//contact types separated by commas	

	contactTypes = new Array;
	contactTypes = contactTypesList.split(",")
	var capId = vCapId
	var acaURLDefault = lookup("ACA_CONFIGS", "ACA_SITE");
	if (!matches(acaURLDefault, null, undefined, ""))
		acaURLDefault = acaURLDefault.substr(0, acaURLDefault.toUpperCase().indexOf("/ADMIN"));
	else
		acaURLDefault = null;

	var acaURL = acaURLDefault;
	report = null;
	contactArray = new Array;
	contactArray = getContactArray(capId);
	for (iCon in contactArray) {
		if (exists(contactArray[iCon]["contactType"], contactTypes)) {
			params = aa.util.newHashtable();
			tContact = contactArray[iCon];
			getRecordParams4Notification(params);
			getACARecordParam4Notification(params, acaURL, capId);
			getInspectionScheduleParams4Notification(params)
			addParameter(params, "$$ContactName$$", tContact["fullName"]); // tContact["firstName"] + " " + tContact["lastName"]);addParameter(params, "$$ContactName$$", tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getDepartmentParams4Notification(params, "Building Department");
			if (inspSchedDate) {
				addParameter(params, "$$inspSchedDate$$", inspSchedDate);
			}

			var hasRemoteInspectorURL = false;

			if (!matches(params.get("$$inspectorURL$$"), "NOT APPLICABLE - WILL BE ONSITE", "")) {
				hasRemoteInspectorURL = true;
			}

			if (!matches(tContact["email"], null, "", undefined)) {
				if (hasRemoteInspectorURL) {
					//sendNotification("noreply@placer.ca.gov",tContact["email"],"",notificationTemplateRemote ,params,null);
					sendNotification(defaultFrom, tContact["email"], "", notificationTemplateRemote, params, null);

				}
				/*  // NO NEED FOR THIS for CDRA
				else
				{
					//sendNotification("noreply@placer.ca.gov",tContact["email"],"",notificationTemplateOnsite ,params,null);
											sendNotification(defaultFrom, tContact["email"],"",notificationTemplateOnsite ,params,null);
				}
				*/
			}
		}
	}
}

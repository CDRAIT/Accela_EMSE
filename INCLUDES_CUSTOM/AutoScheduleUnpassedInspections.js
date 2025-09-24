/**
 *  Copies all previously Failed inspections, and reschedules them when ANY inspection is scheduled.
 *  @param schedInspector - Inspector assigned to the Inspection the was explicitly scheduled.  Same inspector will be assigned to the auto-added inspections.
 *  @param schedDate - Scheduled date assigned to the Inspection the was explicitly scheduled.  Same scheduled date will be assigned to the auto-added inspections.
 *  @param myCap - capIdModel of the target record
 */
function AutoScheduleUnpassedInspections(schedInspector, schedDate, myCap) {
	
	capInspections = aa.inspection.getInspections(myCap);

	if (capInspections.getSuccess()) {
	   inspArray = capInspections.getOutput();
	} else {
	   aa.print(capInspections.getErrorMessage());
	   aa.abortScript();
	}

	if (schedInspector == "") {schedInspector = "BLDG"}
	
	i=0;
	x1=0;
	x2=0;
	x3=0;
	inspNotPassed = new Array();
	inspCompSched = new Array();
	inspToCreate = new Array();

	while(i < inspArray.length) {
	inspItem = inspArray[i];

	if (inspItem.getInspectionStatus() == "Fail"  || 
		inspItem.getInspectionStatus() == "No Access" ||
		inspItem.getInspectionStatus() == "Partial Approval" ||
		inspItem.getInspectionStatus() == "Phased fail fee charged" ||			
		inspItem.getInspectionStatus() == "Not Ready" ||
		inspItem.getInspectionStatus() == "Not ready-fee charged" ||
		inspItem.getInspectionStatus() == "Not Ready - Fee Charged") {
			inspNotPassed[x1] = inspItem.getInspectionType();
			x1 = x1 + 1;
		} 

	if (inspItem.getInspectionStatus() == "Pass" || 
		inspItem.getInspectionStatus() == "Phased pass fee charged" ||	
		inspItem.getInspectionStatus() == "Not Required" ||
		inspItem.getInspectionStatus() == "Scheduled" ||
		inspItem.getInspectionStatus() == "Final Pass") {
			inspCompSched[x2] = inspItem.getInspectionType();
			x2 = x2 + 1;
		}  	
		
	i = i + 1;
	}

	
	insp=0;
	aa.print("\n" + "INSPECTIONS NOT PASSED:");
	while(insp < inspNotPassed.length) {
	inspNotPassedItem = inspNotPassed[insp];

	if (!exists(inspNotPassedItem, inspCompSched) && !exists(inspNotPassedItem, inspToCreate)) {
		inspToCreate[x3] = inspNotPassedItem;
		x3 = x3 + 1;
	} 

	aa.print(inspNotPassedItem);
	insp = insp + 1;
	}

	insp=0;
	aa.print("\n" + "INSPECTION COMPLETED / SCHEDULED:");
	while(insp < inspCompSched.length) {
	inspCompSchedItem = inspCompSched[insp];
	aa.print(inspCompSchedItem);
	insp = insp + 1;
	}

	insp=0;
	aa.print("\n" + "INSPECTIONS TO BE RESCHEDULED:");
	while(insp < inspToCreate.length) {
	inspToCreateItem = inspToCreate[insp];
	scheduleInspectDate(inspToCreateItem,schedDate,schedInspector,null,"Automatically Added");  //This function doesn't execute in Script Tester, but does actually work in practice
	aa.print(inspToCreateItem + " / " + schedInspector + " / " + schedDate);
	insp = insp + 1;
	}
}

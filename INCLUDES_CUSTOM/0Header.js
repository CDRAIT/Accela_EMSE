/*------------------------------------------------------------------------------------------------------/
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   : Placer County Custom Functions:
|  9/8/2015 Keith add removeParcelCondition because of error in STD function
|  5/3/2016 JMcKenzie >> Added functions to support Inspection Email Notifications:
|							- getRecordParams4Notification
|							- getACARecordParam4Notification
|							- getACADeepLinkParam4Notification
|							- getACADocDownloadParam4Notification
|							- getContactParams4Notification
|							- getInspectionParams4Notification
|							- getPrimaryAddressLineParam4Notification
|							- getPrimaryOwnerParams4Notification
|							- getACADocumentDownloadUrl
|							- getACARecordURL
|							- getDeepLinkUrl
|  3/23/2017 JMcKenzie >> Updated function "getRecordParams4Notification" to include Scope and Office
|  2/21/2018 Ngraf >> Added Functions to support Air Quality module:
|							- updatefeenotes
|							- getfeeFeeSeqNbr
|							- feeBalancebynotes
|							- feeAmountbynotes
|							- cloneConditions
|							- HPrating
|							- MMBturating
|							- KVArating
|  5/9/2018 Ngraf >> Added Functions to support Air Quality module: 
|							- getContactEmailByContactType
|							- sendEmailwAttchmnt
|  6/13/2018 Ngraf >> Added Functions to support Air Quality module: 
|							- Nozrating
|							- loadFeesplacer
|							- invoiceAllFeesPlacer
|							- getinvoicenumberbydate
|							- CreateCalendarAppt
|							- getinvoicebalance
|
|	12/14/2018 TDUNN >> Added function getContactArrayWithPrimary() to support email notifications.
|  						Added function getPrimaryOwnerParams4NotificationWithEmail.  Added getting email
|  						Added function getAssignedToStaff() to support email notification to assigned staff
|						Added function getUserIDfromFullName(FullName) to support email notification to assigned staff
|    4/24/2019 GWL   >> Updated function  AutoScheduleUnpassedInspections()  
|                         to include inspection status conditions: "Phased fail fee charged", "Phased pass fee charged" 
|    4/10/2020 GWL   >> Added Functions from Accela to support Remote Inspection:
|							- emailNotificationNoAttachmentRemoteInspection
|							- getStandardChoiceArray
|							- getRecordParams4Notification
|							- getInspectionScheduleParams4Notification
|							- getPrimaryAddressLineParam4Notification
|							- getDepartmentParams4Notification
|							- getInspectorWebConferenceURL
|							- isEmptyOrNull
|							- sendAppToACA4Edit
|							- getUserObjsByDistrict
|							- getUserObjs
|							- getUserInspectorObjs
|							- userObj
|    11/05/2020 TDunn >> Added custom function createNotificationTPS2() to simplify and standardize creating new notification
|                        Added custom function loadCustomScript() to enable calling 3.0 javascript files
|    03/02/2021 TDunn >> renamed modified function getRecordParams4Notification (from 3/23/2017) to getRecordParams4NotificationJM to avoid conflicts with base version
|    03/23/2021 mbecker  added 2 new functions for new CSLB calls.
|                                                       - externalLP_CA_SOAP.js
|                                                       - XMLTagValue.js 
|   10/20/2021 TDunn >> Added custom function to add special SP fees for Commercial Full Review permits.
|   04/20/2023 EAftahi >> Added function customComment
|   07/21/2023 Ngraf >> Added function getRenewalCapByParentCapIDForReviewTPS(parentCapid) to get throughput records.
|   10/18/2023 TDunn >> Added custom functions for IRSA utility release notifications
|   10/19/2023 TDunn >> Added new function for adding a row to the Valuation table: addCalcValuation()
|   11/16/2023 TDunn >> Added new custom functions for worklfow management
|   12/19/2023 TDunn >> Added $$shortNotes$$ notification parameter to custom function: createNotificationTPS2()
|   01/10/2024 TDunn >> Added new function for creating PCCP record created notification: createPCCPNotification(emailTemplate,pccpCapIDString) 
|   01/12/2024 TDunn >> Added new function for staff assignment notification: function createStaffAssignedNotification(emailTemplate,vContactType) 
|   01/12/2024 TDunn >> Added new function to format staff phone numbers for notifications or other applications: formatStaffPhone()
|   05/14/2024 TDunn >> Corrected logic error in if statement in function setReviewWorkflowTasksByTsiFieldsTPS()
|   06/19/2024 TDunn >> updated function 'createStaffAssignedNotification(emailTemplate,vContactType)' to include staff title as a parameter
|   08/28/2024 Abe   >> Added function generateReportTPS_CustomFileName() written by TDunn
|   08/28/2024 Abe   >> Modified function getAPOParams4Notification(), added ownerEmail and address to the params
|   09/27/2024 TDunn >> Added new function copyDocumentsTPS()
|   09/27/2024 TDunn >> Added new function createChildNoContacts for creating EOT child records without copying contact or APO information
|   10/21/2024 TDunn >> Added new functions formatRevNumber and formatResubNum
|   10/25/2024 TDunn >> added status update in autoRouteReviewsTD for full review cycle activation.
|   11/05/2024 TDunn >> updated getTaskStatus to take capId as a third parameter
|   12/03/2024 Abe   >> Added TPS function generateReportTPS_CustomFileName for altering the name of the file and email attachment 
|   12/06/2024 TDunn >> updated name of custom 'generateReport' to 'generateReportPCO'
|   12/10/2024 Abe   >> Commented function getRecordParams4Notification(), it's a duplicate of main version
|   12/19/2024 Abe   >> Added function sendAcknowledgementLtr2Applicant() for sending email for Code and HazVeg modules 
|   01/01/2025 Abe   >> Added function updateAppFileDate() to update cap FileDate for PLN PREAPPs
|   01/30/2025 Abe   >> Added function sendAcknowledgementLtr2Applicant() to create and send Ack Letter for Code, and HazVeg modules
|   01/03/2025 TDunn >> added functions assignConcurrent(lkupCriteria,tprocess,vCycle) and assignPreissue(pTask,tprocess) to support auto-assignment
|   01/03/2025 TDunn >> added functions  getDueInDays(vtable,vcriteria,vcycle) and setDueDate(lkupCriteria,numDays,tprocess) to support automating due dates
|   02/12/2025 TDunn >> added functions assignThisTask() and generateStormFloodNotice()
|   03/05/2025 TDunn >> added function getCycleNum() to return current cycle number of target task.
|   03/06/2025 TDunn >> added function createCapComment()
|   03/07/2025 TDunn >> added function generateNoticeToStaff()
|   03/14/2025 TDunn >> added custom functions: getPCOasi4BuildingNotification(params,deptCrit); generateAddlPermitRequiredNotice(vTemplate,rpList); getTaskAssignToEmail(thisTaskArg,tprocess)
|   03/14/2025 TDunn >> added custom function getAppProcessCode(capIdItem) 
|   03/31/2025 TDunn >> added custom function  getPreIssuanceListForNotification  requires name of std choice lookup for list.
|   05/22/2025 Abe   >> Replaced all instances of "noreply@placer.ca.gov" email address with INCLUDES_CUSTOM_GLOBALS variable "defaultFrom" 
|   07/30/2025 Abe   >> updated formatStaffPhone() to clear any format before processing the phone number     
|   09/18/2025 RMoore >> removed functions, main function copytoxics, copies toxics table from record to another
|   02/05/2025 Abe   >> added exploreObject function to print objects' info 
/---------------------------------------------------------------------------------------------------------------------------------------------------------*/

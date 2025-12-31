/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_HIDE_BLD_DPC.js
| Event   : ACA_Onload Event
|
| Usage   : Attach this script to the onload script and it will skip the page if the record is NOT a DPC 
|           record.
|
|
| Client  : N/A
| Action# : N/A
|
| Notes   : TDunn TPS, 02/07/2024 added SolarAPP+ and SolarApp Revision to excluded
|           TDunn TPS, 05/08/2024 added  Commercial Full Review to excluded
|
/------------------------------------------------------------------------------------------------------*/
function getScriptText(scriptName) {
    scriptName = scriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), scriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}


var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

if (!matches(appTypeString,"Building/Revision/NA/NA","Building/Deferred Submittal/NA/NA","Building/Residential/PV Solar/Solar App","Building/Residential/PV Solar/SolarApp Revision","Building/Residential/Full Review/Residential<3000","Building/Residential/Full Review/Residential>3000","Building/Residential/Revision/NA","Building/Residential/Deferred/NA","TRPA/Building/Revision/NA","TRPA/Building/Deferred/NA","Building/Commercial/Full Review/NA")) {
	//Hide DPC Component in Pageflow - use Attachments
    aa.env.setValue("ReturnData", "{'PageFlow':{'HidePage':'Y'}}");
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>,
/-----------------------------------------------------------------------------------------------------*/

aa.env.setValue("ErrorCode", "0");

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function getCustomFieldPageflow(fieldLabel) {
    var capASI = cap.getAppSpecificInfoGroups();
    if (capASI) {
        var i = cap.getAppSpecificInfoGroups().iterator();
        while (i.hasNext()) {
            var group = i.next();
            var fields = group.getFields();
            if (fields) {
                var iteFields = fields.iterator();
                while (iteFields.hasNext()) {
                    var field = iteFields.next();
                    if (fieldLabel === field.getCheckboxDesc() + "") {
                        return field.getChecklistComment() + "";
                    }
                }
            }
        }
    }
}

//
// matches:  returns true if value matches any of the following arguments
//
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
}

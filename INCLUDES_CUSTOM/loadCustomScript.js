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
    }
}

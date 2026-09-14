eval(getScriptText("INCLUDES_LOGGING", null, false));

logMessage("Loading INCLUDES_FEE_CALCULATE", "INFO");





//open associated fee claculator
if (appTypeArray[0] == "Building")
    eval(getScriptText("BLD_FEE_CALCULATOR"));

if (appTypeArray[0] == "ESD")
    eval(getScriptText("ESD_FEE_CALCULATOR"));

if (appTypeArray[0] == "PCCP")
    eval(getScriptText("PCCP_FEE_CALCULATOR"));

if (appTypeArray[0] == "Planning")
    eval(getScriptText("PLN_FEE_CALCULATOR"));




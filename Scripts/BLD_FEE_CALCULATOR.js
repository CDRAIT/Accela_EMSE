logDebug("Within BLD_FEE_CALCULATOR ...");
var currEventName = aa.env.getValue("EventName");

//CTRCA
if (currEventName == "ConvertToRealCAPAfter") {
    logDebug(currEventName);
    if (appTypeArray[1] == "CalFire") {

    }

    if (appTypeArray[1] == "Commercial") {
        if (appTypeArray[2] == "Full Review") {

        }
        if (appTypeArray[2] == "Limited") {

        }
    }

    if (appTypeArray[1] == "Residential") {
        if (appTypeArray[2] == "Full Review") {

        }
        if (appTypeArray[2] == "Limited") {

        }
        if (appTypeArray[2] == "Master") {

        }

        if (appTypeArray[2] == "PV Solar") {

        }
    }
}

//ASA
if (currEventName == "ApplicationSubmitAfter") {
    logDebug(currEventName);
    if (appTypeArray[1] == "CalFire") {

    }

    if (appTypeArray[1] == "Commercial") {
        if (appTypeArray[2] == "Full Review") {

        }
        if (appTypeArray[2] == "Limited") {

        }
    }

    if (appTypeArray[1] == "Residential") {

        if (appTypeArray[2] == "Full Review") {
            

        }
        if (appTypeArray[2] == "Limited") {

        }
        if (appTypeArray[2] == "Master") {

        }

        if (appTypeArray[2] == "PV Solar") {

        }
    }
}

//ASIAU
if (currEventName == "ApplicationSpecificInfoUpdateAfter") {
    logDebug(currEventName);
    if (appTypeArray[1] == "CalFire") {

    }

    if (appTypeArray[1] == "Commercial") {
        if (appTypeArray[2] == "Full Review") {

        }
        if (appTypeArray[2] == "Limited") {

        }
    }

    if (appTypeArray[1] == "Residential") {
        if (appTypeArray[2] == "Full Review") {

        }
        if (appTypeArray[2] == "Limited") {

        }
        if (appTypeArray[2] == "Master") {

        }

        if (appTypeArray[2] == "PV Solar") {

        }
    }
}


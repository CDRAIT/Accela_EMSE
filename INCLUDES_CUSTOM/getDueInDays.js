function getDueInDays(vtable,vcriteria,vcycle)
{
	var lkupTable = vtable;
	var lkupCrit = vcriteria;
	var dElement = vcycle;
	var dateArray = new Array();
	var numDays = 0;
	var darrayString = lookup(lkupTable,lkupCrit);
	if(!matches(darrayString,null,undefined,false,""))
	{
		dateArray = darrayString.split(",");
		numDays = dateArray[vcycle] * 1;
	}
	return numDays;
}

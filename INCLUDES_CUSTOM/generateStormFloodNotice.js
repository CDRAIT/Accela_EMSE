function generateStormFloodNotice()
{
	var emailParameters = aa.util.newHashtable();
	// Parameters returned by getRecordParameters4Notification: $$altID$$; $$capName$$; $$capStatus$$; $$fileDate$$; $$workDesc$$; $$balanceDue$$; $$recordTypeAlias$$
	getRecordParams4Notification(emailParameters);
	var	emailResult = sendNotification("noreply@placer.ca.gov","stormwtrquality@placer.ca.gov","","NOTICE_STORMWTR_AND_FLOOD_REVIEW_ACTIVE",emailParameters,null);
	logDebug("StormFloodNotice result = " + emailResult);
	return emailResult;
}

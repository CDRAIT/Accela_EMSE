/**
 * 
 * This Script works with PARTIALLY_COMPLETED_CAP_PURGE_DAYS STD Choice 
 * to purge the expired incompletes. Note that removeExpiredIncompleteCAP() 
 * doesnt remove/delete records but
 * inactivates them.
 *   
 * */ 

batchJobName = "CLEAR_EXPIRED_INCOMPLETE_CAP"; 
batchJobDesc = "CLEAR_EXPIRED_INCOMPLETE_CAP"; 
batchJobResult = "CLEAR_EXPIRED_INCOMPLETE_CAP"; 

sysDate = aa.date.getCurrentDate(); 
batchJobID = aa.batchJob.getJobID().getOutput(); 
var removeResult = aa.cap.removeExpiredIncompleteCAP();
if(removeResult.getSuccess())
{
  aa.print("passed");
  aa.env.setValue("ScriptReturnCode","0");
  aa.env.setValue("ScriptReturnMessage","Remove expired incomplete CAPS successful");
  aa.eventLog.createEventLog("Cleared Incomplete CAPs successfully", "Batch Process", batchJobName, sysDate, sysDate, batchJobDesc, batchJobResult, batchJobID);
}
else
{
  aa.print("failed");
  aa.env.setValue("ScriptReturnCode","1");
  aa.env.setValue("ScriptReturnMessage","Remove expired incomplete CAPS failed");
}
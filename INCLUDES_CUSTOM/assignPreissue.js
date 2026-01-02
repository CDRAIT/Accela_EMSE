function assignPreissue(pTask,tprocess)
{
	thisTask = pTask;
	thisStaff = lookup("SDL:BLD Default Preissue Assignment",thisTask);
	assignTask(thisTask,thisStaff,tprocess);
}

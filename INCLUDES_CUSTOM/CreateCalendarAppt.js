function CreateCalendarAppt(DESCRIPTION, ENDDATE, ENDTIME, STARTDATE, STARTTIME, SUBJECT, LOCATION) {
	// ENDDATE and STARTDATE has to be in this format YYYYMMDD
	// ENDTIME and STARTTIME is miltary time and format is HHMM
	var edate = ENDDATE.split("/");
	var endate = edate[2] + edate[0] + edate[1];
	var enddate = endate.toString();
	var sdate = STARTDATE.split("/");
	var stardate = sdate[2] + sdate[0] + sdate[1];
	var startdate = stardate.toString();
	var etime = ENDTIME.replace(":", "").toString();
	var stime = STARTTIME.replace(":", "").toString();

	var e = "BEGIN:VCALENDAR\n";
	e = e + "PRODID:-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN\n";
	e = e + "VERSION:2.0\n";
	e = e + "METHOD:PUBLISH\n";
	e = e + "X-MS-OLK-FORCEINSPECTOROPEN:TRUE\n";
	e = e + "BEGIN:VTIMEZONE\n";
	e = e + "TZID:Pacific Standard Time\n";
	e = e + "BEGIN:STANDARD\n";
	e = e + "RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\n";
	e = e + "TZOFFSETFROM:-0700\n";
	e = e + "TZOFFSETTO:-0800\n";
	e = e + "END:STANDARD\n";
	e = e + "BEGIN:DAYLIGHT\n";
	e = e + "RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\n";
	e = e + "TZOFFSETFROM:-0800\n";
	e = e + "TZOFFSETTO:-0700\n";
	e = e + "END:DAYLIGHT\n";
	e = e + "END:VTIMEZONE\n";
	e = e + "BEGIN:VEVENT\n";
	e = e + "CLASS:PUBLIC\n";
	e = e + "DESCRIPTION:" + DESCRIPTION + "\n";
	e = e + "DTEND;TZID='Pacific Standard Time':" + enddate + "T" + etime + "00\n";
	e = e + "DTSTART;TZID='Pacific Standard Time':" + startdate + "T" + stime + "00\n";
	e = e + "LOCATION:" + LOCATION + "\n";
	e = e + "PRIORITY:5\n";
	e = e + "SEQUENCE:0\n";
	e = e + "SUMMARY;LANGUAGE=en-us:" + SUBJECT + "\n";
	e = e + "TRANSP:OPAQUE\n";
	e = e + "X-MICROSOFT-CDO-BUSYSTATUS:BUSY\n";
	e = e + "X-MICROSOFT-CDO-IMPORTANCE:1\n";
	e = e + "X-MICROSOFT-DISALLOW-COUNTER:FALSE\n";
	e = e + "X-MS-OLK-AUTOFILLLOCATION:FALSE\n";
	e = e + "X-MS-OLK-CONFTYPE:0\n";
	e = e + "BEGIN:VALARM\n";
	e = e + "TRIGGER:-PT2880M\n"; //controls the reminder time
	e = e + "ACTION:DISPLAY\n";
	e = e + "DESCRIPTION:Reminder\n";
	e = e + "END:VALARM\n";
	e = e + "END:VEVENT\n";
	e = e + "END:VCALENDAR\n";
	return e
}

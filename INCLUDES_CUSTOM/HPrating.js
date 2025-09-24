function HPrating (HP)
{
if(Number(HP) > 0 && Number(HP) < 50)
{
	var rating = "0.1";
}
else if(Number(HP) >= 50 && Number(HP) < 100)
{
	var rating = "50";
}
else if(Number(HP) >= 100 && Number(HP) < 200)
{
	var rating = "100";
}
else if(Number(HP) >= 200 && Number(HP) < 300)
{
	var rating = "200";
} 
else if(Number(HP) >= 300 && Number(HP) < 400)
{
	var rating = "300";
}
else if(Number(HP) >= 400 && Number(HP) < 500)
{
	var rating = "400";
}
else if(Number(HP) >= 500 && Number(HP) < 600)
{
	var rating = "500";
}
else if(Number(HP) >= 600)
{
	var rating = "600";
}	
else
{
	var rating = "no rating";
}
return rating;
}

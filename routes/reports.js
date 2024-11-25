import express from 'express';
import returnResultSet from '../utils/db.js';

const reports = express.Router();

reports.get('/', async (req, res) => {
	const today = new Date();
	const currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	const currentChecktime = "01/01/2011 "+currentTime;
	let currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
		currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1)+' 02:00:00';
	}
	
	const qryDay= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currDateTime+"' GROUP BY dailyfood.updatedby";
	const d = new Date();
  	const day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6:1);
  	const newDate = new Date(d.setDate(diff));
  	const currWeekTime = newDate.getFullYear()+'-'+(newDate.getMonth()+1)+'-'+(newDate.getDate())+' 02:00:00';
  	const qryWeek= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currWeekTime+"' GROUP BY dailyfood.updatedby";
  	const currMonthTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-1 02:00:00';
  	const qryMonth= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currMonthTime+"' GROUP BY dailyfood.updatedby";

	const qry1Res =  await returnResultSet(qryMonth);
	const qry2Res =  await returnResultSet(qryWeek);
	const qry3Res =  await returnResultSet(qryDay);
	try{
		res.header("application/json; charset=utf-8");
		res.json({qryDayRes:qry1Res, qryWeekRes:qry2Res , qryMonthRes:qry3Res});
	} catch (e){
		res.status(404).json({message: 'report not found'})
	}
});

reports.get('/:companyId', async (req, res) => {
	const companyId = req.params.companyId;

	let sqlContinue = '';
	if(companyId != 0){
		sqlContinue = " WHERE emp_Comp='"+companyId+"'";
	}
	const query = "SELECT emp_data.emp_id , emp_data.user_name , emp_data.user_name , departments.dept_name AS department , IF(emp_data.status=1,'Active','De-active') AS status, company.comp_name, emp_data.doubleFood,emp_data.ISOdata FROM `emp_data` JOIN `company` ON company.compID = emp_data.emp_Comp  JOIN `departments` ON departments.id = emp_data.department "+sqlContinue;

	try{
		res.header("application/json; charset=utf-8");
		res.json(await returnResultSet(query));
	} catch (e){
		res.status(404).json({message: 'report not found'})
	}
});

reports.get('/:startDate/:endDate/', async (req, res) => {
	const date1 = req.params.startDate;
	const date2 = req.params.endDate;
	
	const fromdate = date1+" 02:00:00";
	const startDate = new Date(date2);
	startDate.setDate(startDate.getDate() + 1);
	const todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	
	const qry1= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY dailyfood.updatedby";
	
	const qry2= "SELECT COUNT(dailyfood.id) as totalCount FROM dailyfood WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"'";
	
	const qry3= "SELECT company.comp_name AS comp, COUNT(dailyfood.id) as countFood FROM `dailyfood` JOIN `emp_data` ON emp_data.emp_id=dailyfood.empId JOIN `company` ON emp_data.emp_Comp = company.compID WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY company.compID";

	const qry4 = "SELECT concat( sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60)) , '-', sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60) + (30*60))) as timeInterval, COUNT(dailyfood.id) as countFood FROM dailyfood WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY timeInterval";

	const qry1Res =  await returnResultSet(qry1);
	const qry2Res =  await returnResultSet(qry2);
	const qry3Res =  await returnResultSet(qry3);
	const qry4Res =  await returnResultSet(qry4);

	try{
		res.header("application/json; charset=utf-8");
		res.json({qry1Res:qry1Res, qry2Res:qry2Res , qry3Res:qry3Res, qry4Res:qry4Res});
	} catch (e){
		res.status(404).json({message: 'report not found'})
	}
});

reports.get('/:startDate/:endDate/:empId', async (req, res) => {
	const date1 = req.params.startDate;
	const date2 = req.params.endDate;
	const empId = req.params.empId;
	
	
	const fromdate = date1+" 02:00:00";
	const startDate = new Date(date2);
	startDate.setDate(startDate.getDate() + 1);
	const todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	
	const query = "SELECT dailyfood.empId AS empId, emp_data.user_name AS user_name, foodtype.FoodType AS food , dailyfood.date_time as fooddate, company.comp_name as companyName FROM `dailyfood` JOIN `foodtype` ON dailyfood.FoodType = foodtype.id JOIN `emp_data` ON dailyfood.empId = emp_data.emp_id JOIN `company` ON emp_data.emp_Comp = company.compID WHERE dailyfood.empId ='"+empId+"' AND date_time >='"+fromdate+"' AND date_time <= '"+todate+"'";

	try{
		res.header("application/json; charset=utf-8");
		res.json(await returnResultSet(query));
	} catch (e){
		res.status(404).json({message: 'report not found'})
	}
});

reports.get('/:startDate/:endDate/:mealType/:vendorList', async (req, res) => {
	let fromdate;
	let todate;
	let startDate;

	if(req.params.mealType == 1){
		fromdate = req.params.startDate+" 02:00:00";
		todate = req.params.startDate+" 17:00:00";
	}else if(req.params.mealType == 2){
		fromdate = req.params.startDate+" 17:00:00";
		startDate = new Date(req.params.startDate);
		startDate.setDate(startDate.getDate() + 1);
		todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	}else{
		fromdate = req.params.startDate+" 02:00:00";
		startDate = new Date(req.params.endDate);
		startDate.setDate(startDate.getDate() + 1);
		todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	}
	let sqlContinue = '';
	if(req.params.vendorList != 0){
		sqlContinue = " AND updatedby='"+req.params.vendorList+"' ";
	}
	const query = "SELECT dailyfood.empId AS empId, emp_data.user_name AS user_name, foodtype.FoodType AS food , dailyfood.date_time as fooddate, concat( sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60)) , '-', sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60) + (30*60))) as timeInterval, company.comp_name as companyName ,  users.vendor as foodVendor FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN emp_data ON dailyfood.empId = emp_data.emp_id JOIN company ON emp_data.emp_Comp = company.compID JOIN users ON dailyfood.updatedby =users.id WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"'"+sqlContinue;

	try{
		res.header("application/json; charset=utf-8");
		res.json(await returnResultSet(query));
	} catch (e){
		res.status(404).json({message: 'report not found'})
	}
});

export default reports;
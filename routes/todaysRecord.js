import express from 'express';
import returnResultSet from '../utils/db.js';

const todaysRecords = express.Router();

todaysRecords.get('/', async (req, res) => {
	
	const today = new Date();
	const currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	const currentChecktime = "01/01/2011 "+currentTime;
	let currDateTime;

	currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 17:00:00';
	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) 
		&& Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
		currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1)+' 17:00:00';
	}else if (Date.parse('01/01/2011 17:00:00') >= Date.parse(currentChecktime) 
		&& Date.parse('01/01/2011 02:00:00') < 	Date.parse(currentChecktime)){
		currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	}
	
	let qry1 =  "SELECT dailyfood.empId,emp_data.user_name,foodtype.FoodType AS food,dailyfood.token ,dailyfood.date_time  FROM `dailyfood` JOIN `emp_data` ON emp_data.emp_id = dailyfood.empId JOIN `foodtype` ON dailyfood.FoodType = foodtype.id  WHERE dailyfood.date_time >='"+currDateTime+"' AND dailyfood.updatedby='"+req.session.Uid+"' ORDER BY dailyfood.id desc LIMIT 49";
	let qry2= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currDateTime+"' AND dailyfood.FoodType='"+req.session.foodservice+"' GROUP BY dailyfood.updatedby";
	
	
	if(req.session.foodservice == 0){
		qry1 =  "SELECT dailyfood.empId,emp_data.user_name,foodtype.FoodType AS food,dailyfood.token ,dailyfood.date_time FROM `dailyfood` JOIN `emp_data` ON emp_data.emp_id = dailyfood.empId JOIN `foodtype` ON dailyfood.FoodType = foodtype.id  WHERE dailyfood.date_time >='"+currDateTime+"' ORDER BY dailyfood.id desc LIMIT 49";
		qry2= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currDateTime+"' GROUP BY dailyfood.updatedby";
	}

	const qry1Res =  await returnResultSet(qry1);
	const qry2Res =  await returnResultSet(qry2);

	try{
		res.header("application/json; charset=utf-8");
		res.json({count:qry2Res, records:qry1Res});
	} catch (e){
		res.status(400).json({message: 'report not found'})
	}
});

export default todaysRecords;
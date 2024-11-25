import express from 'express';
import returnResultSet from '../utils/db.js';

const vendorReport = express.Router();

vendorReport.get('/:startDate/:endDate/', async (req, res) => {
	const date1 = req.params.startDate;
	const date2 = req.params.endDate;
	
	const fromdate = date1+" 02:00:00";
	const startDate = new Date(date2);
	startDate.setDate(startDate.getDate() + 1);
	const todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	
	const query = "SELECT DATE_FORMAT(date_time, '%Y-%m-%d') AS fdate , COUNT(dailyfood.id) AS fCount,  users.vendor, (CASE WHEN DATE_FORMAT(date_time, '%H:%i')>='00:00' && DATE_FORMAT(date_time, '%H:%i')<'02:00' THEN CONCAT(DATE_FORMAT(DATE_SUB(date_time, INTERVAL 1 Day), '%Y-%m-%d'),':Dinner:', users.vendor) WHEN DATE_FORMAT(date_time, '%H:%i')>='17:00' && DATE_FORMAT(date_time, '%H:%i:%s')<='23:59:59' THEN CONCAT(DATE_FORMAT(date_time, '%Y-%m-%d'),':Dinner:', users.vendor) WHEN DATE_FORMAT(date_time, '%H:%i')>='02:00' && DATE_FORMAT(date_time, '%H:%i')<'17:00' THEN CONCAT(DATE_FORMAT(date_time, '%Y-%m-%d'),':Lunch:', users.vendor) ELSE 1 END) AS foodSlot from dailyfood JOIN users ON users.id=dailyfood.updatedby WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY foodSlot";

	try{
		res.header("application/json; charset=utf-8");
		res.json(await returnResultSet(query));
	} catch (e){
		res.status(400).json({message: 'report not found'})
	}
});

export default vendorReport;
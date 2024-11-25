import express from 'express';
import returnResultSet from '../utils/db.js';

const tokenData = express.Router();

tokenData.get('/', async (req, res) => {
	try{
		const today = new Date();
		const currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		const currentChecktime = "01/01/2011 "+currentTime;
		let currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 17:00:00';

		if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
			currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1)+' 17:00:00';
		}else if (Date.parse('01/01/2011 17:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 02:00:00') < Date.parse(currentChecktime)){
			currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
		}
		
		const qry1 =  "SELECT dailyfood.id, dailyfood.empId,dailyfood.status FROM `dailyfood` WHERE dailyfood.date_time >= date_sub(now(), interval 45 minute) AND dailyfood.status!=2  AND dailyfood.updatedby='"+req.session.Uid+"'";
		
		res.json(await returnResultSet(qry1));
	} catch (e){
		res.status(404).json({message: 'tokendata not found'})
	}
});

export default tokenData;
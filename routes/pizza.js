import express from 'express';
import returnResultSet from '../utils/db.js';

const pizza = express.Router();

pizza.get('/', async (req, res) => {
	const today = new Date();
	const currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	const currentChecktime = "01/01/2011 "+currentTime;
	let currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 17:00:00';

	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
		currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1)+' 17:00:00';
	}else if (Date.parse('01/01/2011 17:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 02:00:00') < Date.parse(currentChecktime)){
		currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	}

	try{
		const qry1 =  "SELECT dailyfood.id, dailyfood.empId,dailyfood.status FROM `dailyfood` WHERE dailyfood.date_time >= date_sub(now(), interval 45 minute) AND dailyfood.status!=2  AND dailyfood.updatedby='"+req.session.Uid+"'";
	
		res.header("application/json; charset=utf-8");
		res.json(await returnResultSet(qry1));
	} catch (e){
		res.status(404).json({message: 'pizza not found'})
	}
});

pizza.put('/:srno/:status', async (req, res) => {
	try{
		const resultSet  = await returnResultSet("UPDATE dailyfood SET status =? WHERE id=?",[req.params.status, req.params.srno]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined
		});
	} catch (e){
		res.status(404).json({message: 'food status not found'})
	}
});

pizza.post('/',async(req,res) =>{
	const pizzaType = req.body.pizzaType;
	const emppizzaId = req.body.emppizzaId;
	const vendorId = req.body.vendorId;
	let pizza = "Special pizza";
	if(pizzaType == 1){
		pizza = "pizza";
	}else if(pizzaType == 2){
		pizza = "Pizza";
	}

	const today = new Date();
	const currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	const currentChecktime = "01/01/2011 "+currentTime;
	let currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime)){
		currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1)+' 17:00:00';
	}

	try{
		const qry1Res =  await returnResultSet('SELECT * FROM `emp_data` WHERE emp_id =? AND status = 1', [emppizzaId]);
		if(qry1Res.length){
			let sqlCheckDuplcte = "SELECT * FROM `dailypizza` WHERE empId =? AND pizzaType !=3 AND date_time >=?";
			if(pizzaType == 3){
				sqlCheckDuplcte = "SELECT * FROM `dailypizza` WHERE empId =? AND pizzaType =3 AND date_time >=?";
			}
			const qry2Res =  await returnResultSet(sqlCheckDuplcte , [emppizzaId , currDateTime]);
			if((qry2Res.length == 2 && qry1Res[0].doublepizza == 1) || (qry2Res.length > 0 && qry1Res[0].doublepizza == 0)) {
				res.json("Allready pizza Serve");
			}

			const sqlQuery = 'INSERT INTO `dailypizza` (empId, pizzaType , token , updatedby) VALUES (?, ?, 0, ?)';
			const qry3Res =  await returnResultSet(sqlQuery, [emppizzaId , pizzaType , vendorId]);
			if(qry3Res.affectedRows == 1){
				res.json({username:qry1Res[0].user_name, pizzaType:pizza});
			}
		} else res.send("Invalid User");
	
	} catch (e){
		res.status(400).json({message: 'Error on pizza Entry'})
	}
});



export default pizza;
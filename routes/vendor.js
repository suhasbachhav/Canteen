import express from 'express';
import returnResultSet from '../utils/db.js';
import md5 from 'md5';

const vendor = express.Router();

vendor.get('/:id', async (req, res) => {
	try{
		res.json(await returnResultSet("SELECT * FROM users WHERE id =?",[req.params.id]));
	} catch (e){
		res.status(400).json({message: 'vendor not found'})
	}
});

vendor.get('/', async (req, res) => {
	try{
		res.json(await returnResultSet("SELECT id, vendor FROM `users` WHERE foodservice != 0"));
	} catch (e){
		res.status(400).json({message: 'users not found'})
	}
});

vendor.get('/vendorwise', async (req, res) => {
	try{
		let userSql = req.session.foodservice ? "SELECT id , vendor FROM `users` WHERE id = "+req.session.Uid :
			"SELECT id , vendor FROM `users` WHERE foodservice != 0";
		res.json(await returnResultSet(userSql));
	} catch (e){
		res.status(404).json({message: 'users not found'})
	}
});

vendor.put('/:vendorId',async(req,res) => {
	const body = req.body;
	const password=md5(body.pass);
	try{
		const resultSet  = await returnResultSet("UPDATE `users` SET `vendor` = ? , `username` = ?,  `password` = ? ,  `email` = ?  ,  `foodservice` = ?,  `status` = ? WHERE `users`.`id` = ?", 
			[body.name, body.userName, password, body.email, body.type, body.status, req.params.vendorId]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined,
		});
	} catch (e){
		console.log(e)
		res.status(400).json({message: 'Error for vendor updatation'})
	}
});

vendor.post('/',async(req,res) =>{
	const body = req.body;
	const password=md5(body.pass);
	try{
		const resultSet  = await returnResultSet("INSERT INTO `users` (`vendor`, `username`, `password`, `foodservice`, `status`, `email`) VALUES (?, ?, ?, ?, ?, ?)", [body.name, body.userName, password, body.type, body.status, body.email]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined,
		});
	} catch (e){
		res.status(400).json({message: 'Error for vendor updation'})
	}
});



export default vendor;
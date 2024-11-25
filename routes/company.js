import express from 'express';
import returnResultSet from '../utils/db.js';

const company = express.Router();

company.get('/', async (req, res) => {
	try{
		res.json(await returnResultSet('SELECT compID, comp_name FROM `company` WHERE status =1 ORDER BY comp_name ASC'));
	} catch (e){
		res.status(400).json({message: 'company not found'})
	}
});

company.post('/',async(req,res) => {
	try{
		const resultSet  = await returnResultSet("INSERT INTO `company` (`comp_name`, `address`, `status`) VALUES (?, ?, ?)", [req.body.name , 'Pune' , 1]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined
		});
	} catch (e){
		res.status(400).json({message: 'Error for company creation'})
	}
});

company.put('/:name/:id',async(req,res) =>{
	try{
		const resultSet  = await returnResultSet("UPDATE `company` SET `comp_name` = ? WHERE `company`.`compID` = ?", [req.params.name, req.params.id ]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined
		});
	} catch (e){
		res.status(400).json({message: 'Error for company updation'})
	}
});


export default company;
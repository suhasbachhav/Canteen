import express from 'express';
import returnResultSet from '../utils/db.js';

const departments = express.Router();

departments.get('/', async (req, res) => {
	try{
		res.json(await returnResultSet('SELECT * FROM `departments` ORDER BY dept_name ASC'));
	} catch (e){
		res.status(400).json({message: 'Departments not found'})
	}
});

departments.post('/',async(req,res) => {
	try{
		const resultSet  = await returnResultSet( "INSERT INTO `departments` (`dept_name`) VALUES (?)", [req.body.deptName]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined
		});
	} catch (e){
		res.status(400).json({message: 'Error for Department creation'})
	}
});
departments.put('/:name/:id',async(req,res) =>{
	try{
		const resultSet  = await returnResultSet("UPDATE `departments` SET `dept_name` = ? WHERE `departments`.`id` = ?", [req.params.name, req.params.id ]);
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined
		});
	} catch (e){
		res.status(400).json({message: 'Error for Department updation'})
	}
});


export default departments;
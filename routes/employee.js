import express from 'express';
import returnResultSet from '../utils/db.js';

const employee = express.Router();

employee.get('/', async (req, res) => {
	try{
		res.json(await returnResultSet('SELECT emp_id, ISOdata, department FROM `emp_data` WHERE status =1 AND ISOdata !="" ORDER BY department'));
	} catch (e){
		res.status(404).json({message: 'employee not found'})
	}
});
employee.get('/:id', async (req, res) => {
	try{
		res.json(await returnResultSet('SELECT ISOdata, department, doubleFood, emp_Comp, emp_id, status,user_name, base64Img FROM emp_data WHERE emp_id = ?', [req.params.id]));
	} catch (e){
		res.status(404).json({message: 'employee not found'})
	}
});

employee.post('/',async(req,res) => {
	const empId = req.body.empId;
   	const empStatus = req.body.empStatus;
   	const empFoodAllow = req.body.empFoodAllow;
   	const empISOdataID = req.body.empISOdataID;
   	const empBase64Img = req.body.empBase64Img;
   	const empName = req.body.empName;
   	const empDept = req.body.empDept;
   	const empComp = req.body.empComp;

	try{
		const resultSet  = await returnResultSet("SELECT * FROM `emp_data` WHERE emp_id = ?", [empId]);
		const sqlQuery = resultSet.length ? 'UPDATE `emp_data` SET `status` = ? , `doubleFood` = ? ,  `ISOdata` = ? ,  `base64Img` = ? ,  `user_name` = ? ,  `department` = ? , `emp_Comp` = ?  WHERE `emp_data`.`emp_id` = ?' : 
		'INSERT INTO emp_data (status , doubleFood , ISOdata , base64Img , user_name , department , emp_Comp , emp_id) VALUES( ? , ?, ? , ? , ? , ? , ? , ?)';
		const resultSet2  = await returnResultSet(sqlQuery, [empStatus , empFoodAllow , empISOdataID , empBase64Img , empName , empDept , empComp , empId]);
		res.json({
			existing: resultSet.affectedRows ?? undefined,
			affectedRows: resultSet2.affectedRows ?? undefined
		});
	} catch (e){
		res.status(400).json({message: 'Error for employee registration'})
	}
});


employee.put('/:idArr', async (req, res) => {
	const deactivateEmpIdArr = req.body.deactivateEmpId;
	const empArr = deactivateEmpIdArr.split(",");
	Object.keys(empArr).map(k => empArr[k] = empArr[k].trim());
	empArr1 = empArr.filter(function(entry) { return entry.trim() != ''; });
	const textArray = empArr1.join("','");

	try{
		const resultSet  = await returnResultSet("UPDATE emp_data SET status = '0' WHERE emp_id IN ('"+textArray+"')");
		res.json({
			affectedRows: resultSet.affectedRows ?? undefined
		});
	} catch (e){
		res.status(404).json({message: 'employee not found'})
	}
});


export default employee;
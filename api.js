var mysql = require('mysql');  
var md5 = require('md5');
var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async');
const port = 8001;

var con = mysql.createConnection({  
	host: "localhost",  
	user: "suhas",  
	password: "suhas@123",  
	database: "canteen",
	timezone: 'ist'  
});  


app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));


app.get('/', function(request, response){
  response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/',function(request,response){
   	var username = request.body.uname;
	var password = md5(request.body.psw);
	if (username && password) {
		con.query('SELECT * FROM users WHERE status = 1 AND username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.Uid = results[0].id;
				request.session.foodservice = results[0].foodservice;
				request.session.username = results[0].username;
				request.session.vendor = results[0].vendor;
				var timestamp = new Date().toISOString();
				request.session.timestamp = timestamp;
				return response.redirect('/dashboard');
			} else {
				response.json({ message: 'Incorrect Username and/or Password!!' });
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/index', function(request, response){
  response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/token', function(request, response){
  response.sendFile(path.join(__dirname + '/token.html'));
});

app.get('/dashboard', function(request, response) {
	if (request.session.loggedin) {
		return response.sendFile(path.join(__dirname + '/dashboard.html'));
		response.end();
	} else {
		response.redirect('/');
	}
	response.end();
});
app.get('/logout', function(request, response) {
	request.session.destroy();
	response.redirect('/');	
});

app.get('/getcompany', function(request, response){
  	con.query('SELECT compID , comp_name FROM `company` WHERE status =1', function(error, resCom, fields) {
		if (error) throw error; 
		var resCompany = JSON.stringify(resCom);
		response.send(resCompany);
	});
});
app.get('/getusers', function(request, response){
  	con.query('SELECT id , vendor FROM `users` WHERE foodservice != 0', function(error, resUsr, fields) {
		if (error) throw error; 
		var resUsr = JSON.stringify(resUsr);
		response.send(resUsr);
	});
});
app.get('/getuserwise', function(request, response){
	if(request.session.foodservice == 0){
		var userSql = "SELECT id , vendor FROM `users` WHERE foodservice != 0";
	}else{
		var userSql = "SELECT id , vendor FROM `users` WHERE id = "+request.session.Uid;
  	}
  	con.query(userSql, function(error, resUsr, fields) {
		if (error) throw error; 
		var resUsr = JSON.stringify(resUsr);
		response.send(resUsr);
	});
});
app.get('/getsessionData', function(request, response){
	var sessionObject = {
	  vendor : request.session.vendor,
	  foodservice  : request.session.foodservice,
	  id  : request.session.Uid
	};
	response.send(sessionObject);
});

app.get('/getfoodtype', function(request, response){
  	con.query('SELECT * FROM `foodtype`', function(error, results, fields) {
		if (error) throw error; 
		var results = JSON.stringify(results);
		response.send(results);
	});
});
app.get('/getfoodtype', function(request, response){
  	con.query('SELECT * FROM `foodtype`', function(error, results, fields) {
		if (error) throw error; 
		var results = JSON.stringify(results);
		response.send(results);
	});
});
app.get('/getDepartment', function(request, response){
  	con.query('SELECT * FROM `departments` ORDER BY dept_name ASC', function(error, results, fields) {
		if (error) throw error; 
		var results = JSON.stringify(results);
		response.send(results);
	});
});
app.post('/getIsoData',function(request,response){
	con.query('SELECT emp_id, ISOdata, department FROM `emp_data` WHERE status =1 AND ISOdata !="" ORDER BY department', function(error, results, fields) {
		if (results.length > 0) {
			var results = JSON.stringify(results);
			response.send(results);
		}			
		response.end();
	});
});
app.post('/checkEmp',function(request,response){
   	var empId = request.body.empId;
	if (empId) {
		con.query('SELECT ISOdata, department, doubleFood, emp_Comp, emp_id, status,user_name, base64Img FROM emp_data WHERE emp_id = ?', [empId], function(error, results, fields) {
			if (results.length > 0) {
				if (error) throw error; 
				results[0].base64Img = Buffer.from(results[0].base64Img).toString('base64');
				var results = JSON.stringify(results[0]);
				response.send(results);
			} 		
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.post('/getlastrecords', function(req,res){
	var today = new Date();
	var currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var currentChecktime = "01/01/2011 "+currentTime;

	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.setDate(today.getDate()-1)+' 17:00:00';
	}else if (Date.parse('01/01/2011 17:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 02:00:00') < Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	}else {
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 17:00:00';
	}
	if(req.session.foodservice == 0){
		var qry2= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currDateTime+"' GROUP BY dailyfood.updatedby";
		var qry1 =  "SELECT dailyfood.empId,emp_data.user_name,foodtype.FoodType AS food,dailyfood.token ,dailyfood.date_time FROM `dailyfood` JOIN `emp_data` ON emp_data.emp_id = dailyfood.empId JOIN `foodtype` ON dailyfood.FoodType = foodtype.id  WHERE dailyfood.date_time >='"+currDateTime+"' ORDER BY dailyfood.id desc LIMIT 49";

	}else{
		var qry2= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+currDateTime+"' AND dailyfood.FoodType='"+req.session.foodservice+"' GROUP BY dailyfood.updatedby";
		var qry1 =  "SELECT dailyfood.empId,emp_data.user_name,foodtype.FoodType AS food,dailyfood.token ,dailyfood.date_time  FROM `dailyfood` JOIN `emp_data` ON emp_data.emp_id = dailyfood.empId JOIN `foodtype` ON dailyfood.FoodType = foodtype.id  WHERE dailyfood.date_time >='"+currDateTime+"' AND dailyfood.updatedby='"+req.session.Uid+"' ORDER BY dailyfood.id desc LIMIT 49";
	}
	res.header("application/json; charset=utf-8");
	con.query(qry1, function (error, result, client){
        var result1 = result;
        con.query(qry2, function (error, resF, client){
            var countRecords = resF;
            var resultFinal = JSON.stringify({count:countRecords, records:result1});
            res.send(resultFinal);
        });
    });
});


app.post('/getqueuePizza', function(req,res){
	var today = new Date();
	var currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var currentChecktime = "01/01/2011 "+currentTime;

	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.setDate(today.getDate()-1)+' 17:00:00';
	}else if (Date.parse('01/01/2011 17:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 02:00:00') < Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	}else {
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 17:00:00';
	}
	
	var qry1 =  "SELECT dailyfood.id, dailyfood.empId,dailyfood.status FROM `dailyfood` WHERE dailyfood.date_time >= date_sub(now(), interval 45 minute) AND dailyfood.status!=2  AND dailyfood.updatedby='"+req.session.Uid+"'";
	
	res.header("application/json; charset=utf-8");
	con.query(qry1, function (error, result, client){
        var resultFinal = JSON.stringify(result);
         res.send(resultFinal);
    });
});


app.post('/register',function(request,response){
	var empId = request.body.empId;
   	var empStatus = request.body.empStatus;
   	var empFoodAllow = request.body.empFoodAllow;
   	var empISOdataID = request.body.empISOdataID;
   	var empBase64Img = request.body.empBase64Img;
   	var empName = request.body.empName;
   	var empDept = request.body.empDept;
   	var empComp = request.body.empComp;
	con.query('SELECT * FROM `emp_data` WHERE emp_id = ?', [empId], function(error, results, fields) {
		if (results.length > 0) {
			var sqlQuery = 'UPDATE `emp_data` SET `status` = ? , `doubleFood` = ? ,  `ISOdata` = ? ,  `base64Img` = ? ,  `user_name` = ? ,  `department` = ? , `emp_Comp` = ?  WHERE `emp_data`.`emp_id` = ?'
		}else{
			var sqlQuery = 'INSERT INTO emp_data (status , doubleFood , ISOdata , base64Img , user_name , department , emp_Comp , emp_id) VALUES( ? , ?, ? , ? , ? , ? , ? , ?)'
		}
		con.query(sqlQuery , [empStatus , empFoodAllow , empISOdataID , empBase64Img , empName , empDept , empComp , empId], function(err, res, filds) {
			if(res.affectedRows == 1){
				response.send("Updated");
			}else{
				response.send(0);
			}
		});
	
	});
});
app.post('/foodEntry',function(request,response){
	var foodType = request.body.foodType;
   	var empFoodId = request.body.empFoodId;
   	var vendorId = request.body.vendorId;
   	var food;
   	if(foodType == 1){
    	food = "Food";
    }else if(foodType == 2){
    	food = "Pizza";
    }else{
    	food = "Special Food";
    }
  	var today = new Date();
	var currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var currentChecktime = "01/01/2011 "+currentTime;
	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.setDate(today.getDate()-1)+' 17:00:00';
	}else{
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	}
	con.query('SELECT * FROM `emp_data` WHERE emp_id =? AND status = 1', [empFoodId], function(error, results, fields) {
		if (results.length > 0) {
			if(foodType == 3){
				var sqlCheckDuplcte = "SELECT * FROM `dailyfood` WHERE empId =? AND FoodType =3 AND date_time >=?";
			}else{
				var sqlCheckDuplcte = "SELECT * FROM `dailyfood` WHERE empId =? AND FoodType !=3 AND date_time >=?";
			}
			con.query(sqlCheckDuplcte , [empFoodId , currDateTime], function(err, res, filds) {
				if((res.length == 2 && results[0].doubleFood == 1) || (res.length > 0 && results[0].doubleFood == 0)) {
					var responseData ="Allready Food Serve";
					response.send(responseData);
				}else{
					var sqlQuery = 'INSERT INTO `dailyfood` (empId, FoodType , token , updatedby) VALUES (?, ?, 0, ?)';
					con.query(sqlQuery , [empFoodId , foodType , vendorId], function(errDaily, resDaily, fieldsDaily) {
						if(resDaily.affectedRows == 1){
							//var retnArr = {};
							//retnArr.username = results[0].user_name;
						    //retnArr.foodType = food;
						    //retnArr.tokenNumber = "0";
						    var retnArr = JSON.stringify({username:results[0].user_name, foodType:food});
						    response.send(retnArr);
						}
					});
				}
			});
		}
	});
});
app.post('/downloadFoodServeReport',function(request,response){
	var date1 = request.body.date1;
	var date2 = request.body.date2;
	var mealType = request.body.mealType;
	var foodvendorList = request.body.foodvendorList;
	if(mealType == 1){
		var fromdate = date1+" 02:00:00";
		var todate = date1+" 17:00:00";
	}else if(mealType == 2){
		var fromdate = date1+" 17:00:00";
		var startDate = new Date(date1);
		startDate.setDate(startDate.getDate() + 1);
		var todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	}else{
		var fromdate = date1+" 02:00:00";
		var startDate = new Date(date2);
		startDate.setDate(startDate.getDate() + 1);
		var todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	}
	var sqlContinue = '';
	if(foodvendorList != 0){
		sqlContinue = " AND updatedby='"+foodvendorList+"' ";
	}
	response.header("application/json; charset=utf-8");
	var sqlresult = "SELECT dailyfood.empId AS empId, emp_data.user_name AS user_name, foodtype.FoodType AS food , dailyfood.date_time as fooddate, concat( sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60)) , '-', sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60) + (30*60))) as timeInterval, company.comp_name as companyName ,  users.vendor as foodVendor FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN emp_data ON dailyfood.empId = emp_data.emp_id JOIN company ON emp_data.emp_Comp = company.compID JOIN users ON dailyfood.updatedby =users.id WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"'"+sqlContinue;
	con.query(sqlresult, function (error, result, client){
        var resultFinal = JSON.stringify(result);
        response.send(resultFinal);
    });
});
app.post('/downloadDashboardReport',function(request,response){
	var date1 = request.body.date1;
	var date2 = request.body.date2;
	
	var fromdate = date1+" 02:00:00";
	var startDate = new Date(date2);
	startDate.setDate(startDate.getDate() + 1);
	var todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	
	response.header("application/json; charset=utf-8");
	var qry1= "SELECT users.vendor AS food , COUNT(dailyfood.id) as countFood FROM dailyfood JOIN foodtype ON dailyfood.FoodType = foodtype.id JOIN users ON users.id = dailyfood.updatedby WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY dailyfood.updatedby";
	var qry2= "SELECT COUNT(dailyfood.id) as totalCount FROM dailyfood WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"'";
	
	var qry3= "SELECT company.comp_name AS comp, COUNT(dailyfood.id) as countFood FROM `dailyfood` JOIN `emp_data` ON emp_data.emp_id=dailyfood.empId JOIN `company` ON emp_data.emp_Comp = company.compID WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY company.compID";

	var qry4 = "SELECT concat( sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60)) , '-', sec_to_time(time_to_sec(dailyfood.date_time)- time_to_sec(dailyfood.date_time)%(30*60) + (30*60))) as timeInterval, COUNT(dailyfood.id) as countFood FROM dailyfood WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY timeInterval";
	con.query(qry1, function (error, res, client){
        var qry1Result = res;
        con.query(qry2, function (error, result, client){
            var qry2Result = result;
            con.query(qry3, function (error, res3, client){
        		var qry3Result = res3;
        		con.query(qry4, function (error, res4, client){
        			var qry4Result = res4;
            		var resultFinal = JSON.stringify({qry1Res:qry1Result, qry2Res:qry2Result , qry3Res:qry3Result, qry4Res:qry4Result});
           			response.send(resultFinal);
           		});
        	});
        });
    });

});

app.post('/downloadEmpFoodReport',function(request,response){
	var date1 = request.body.date1;
	var date2 = request.body.date2;
	var empId = request.body.empId;
	
	var fromdate = date1+" 02:00:00";
	var startDate = new Date(date2);
	startDate.setDate(startDate.getDate() + 1);
	var todate = startDate.getFullYear()+'-'+(startDate.getMonth()+1)+'-'+startDate.getDate()+' 02:00:00';
	
	response.header("application/json; charset=utf-8");
	var sqlresult = "SELECT dailyfood.empId AS empId, emp_data.user_name AS user_name, foodtype.FoodType AS food , dailyfood.date_time as fooddate, company.comp_name as companyName FROM `dailyfood` JOIN `foodtype` ON dailyfood.FoodType = foodtype.id JOIN `emp_data` ON dailyfood.empId = emp_data.emp_id JOIN `company` ON emp_data.emp_Comp = company.compID WHERE dailyfood.empId ='"+empId+"' AND date_time >='"+fromdate+"' AND date_time <= '"+todate+"'";
	con.query(sqlresult, function (error, result, client){
        var resultFinal = JSON.stringify(result);
        response.send(resultFinal);
    });

});

app.post('/downloadEmpReport',function(request,response){
	var empCompWise = request.body.empCompWise;
	var sqlContinue = '';
	if(empCompWise != 0){
		sqlContinue = " WHERE emp_Comp='"+empCompWise+"'";
	}
	response.header("application/json; charset=utf-8");
	var sqlresult = "SELECT emp_data.emp_id , emp_data.user_name , emp_data.user_name , departments.dept_name AS department , IF(emp_data.status=1,'Active','De-active') AS status, company.comp_name, emp_data.doubleFood,emp_data.ISOdata FROM `emp_data` JOIN `company` ON company.compID = emp_data.emp_Comp  JOIN `departments` ON departments.id = emp_data.department "+sqlContinue;
	con.query(sqlresult, function (error, result, client){
        var resultFinal = JSON.stringify(result);
        response.send(resultFinal);
    });
});

app.post('/deactivateemployeelist',function(request,response){
	var deactivateEmpIdArr = request.body.deactivateEmpId;
	var empArr = deactivateEmpIdArr.split(",");
	Object.keys(empArr).map(k => empArr[k] = empArr[k].trim());
	empArr1 = empArr.filter(function(entry) { return entry.trim() != ''; });
	var textArray = empArr1.join("','");
	var sql = "UPDATE emp_data SET status = '0' WHERE emp_id IN ('"+textArray+"')";
	con.query(sql, function (error, result, client){
        if(result.affectedRows > 0){
			var fresult = "Updated";
		}else{
			var fresult = "Not Updated";
		}
		response.send(fresult);
    });
});

app.post('/updatePizzaStatus',function(request,response){
	var empId = request.body.empId;
	var srno = request.body.srno;
	con.query("UPDATE dailyfood SET status = 1 WHERE id=?",[srno], function (error, result, client){
		console.log()
        if(result.affectedRows > 0){
			var fresult = "Updated";
		}else{
			var fresult = "Not Updated";
		}
		response.send(fresult);
    });
});
app.post('/updatePizzaStatusFinal',function(request,response){
	var empId = request.body.empId;
	var srno = request.body.srno;

	con.query("UPDATE dailyfood SET status = 2 WHERE id=?",[srno], function (error, result, client){
		console.log()
        if(result.affectedRows > 0){
			var fresult = "Updated";
		}else{
			var fresult = "Not Updated";
		}
		response.send(fresult);
    });
});

app.post('/gettokenscreendata', function(req,res){
	var today = new Date();
	var currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var currentChecktime = "01/01/2011 "+currentTime;

	if (Date.parse('01/01/2011 02:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 00:00:01') <= Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.setDate(today.getDate()-1)+' 17:00:00';
	}else if (Date.parse('01/01/2011 17:00:00') >= Date.parse(currentChecktime) && Date.parse('01/01/2011 02:00:00') < Date.parse(currentChecktime)){
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 02:00:00';
	}else {
		var currDateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' 17:00:00';
	}
	
	var qry1 =  "SELECT dailyfood.id, dailyfood.empId,dailyfood.status FROM `dailyfood` WHERE dailyfood.date_time >= date_sub(now(), interval 45 minute) AND dailyfood.status!=2  AND dailyfood.updatedby='"+req.session.Uid+"'";
	
	res.header("application/json; charset=utf-8");
	con.query(qry1, function (error, result, client){
        var resultFinal = JSON.stringify(result);
         res.send(resultFinal);
    });
});


app.post('/checkVendor',function(request,response){
	var vendorId = request.body.vendorId;
	var sqlContinue = '';
	con.query("SELECT * FROM users WHERE id =?",[vendorId], function (error, result, client){
        var resultFinal = JSON.stringify(result[0]);
        response.send(resultFinal);
    });
});

app.post('/updateVendor',function(request,response){
	var updateVendorName = request.body.updateVendorName;
	var updateVendorUserName = request.body.updateVendorUserName;
	var password=md5(request.body.updateVendorNewPass);
	var updateVendorEmail = request.body.updateVendorEmail;
	var foodVendorType = request.body.foodVendorType;
	var foodVendorStatus = request.body.foodVendorStatus;
	var vendorWise = request.body.vendorWise;
	con.query( "UPDATE `users` SET `vendor` = ? , `username` = ?,  `password` = ? ,  `email` = ?  ,  `foodservice` = ?  ,  `status` = ? WHERE `users`.`id` = ?", [updateVendorName , updateVendorUserName , password , updateVendorEmail , foodVendorType , foodVendorStatus , vendorWise], function (error, result, client){
        if(result.affectedRows > 0){
			var fresult = "Updated";
		}else{
			var fresult = "Not Updated";
		}
		response.send(fresult);
    });
});

app.post('/addVendor',function(request,response){
	var updateVendorName = request.body.updateVendorName;
	var updateVendorUserName = request.body.updateVendorUserName;
	var password=md5(request.body.updateVendorNewPass);
	var updateVendorEmail = request.body.updateVendorEmail;
	var foodVendorType = request.body.foodVendorType;
	var foodVendorStatus = request.body.foodVendorStatus;
	
	con.query( "INSERT INTO `users` (`vendor`, `username`, `password`, `foodservice`, `status`, `email`) VALUES (?, ?, ?, ?, ?, ?)", [updateVendorName , updateVendorUserName , password , foodVendorType , foodVendorStatus , updateVendorEmail], function (error, result, client){
        if(result.affectedRows > 0){
			var fresult = "1";
		}else{
			var fresult = "0";
		}
		response.send(fresult);
    });
});
app.post('/downloadvendorwiseLunchDinnerReport',function(request,response){
	var date1 = request.body.date1;
	var date2 = request.body.date2;
	
	var fromdate = date1+" 02:00:00";
	var endDate = new Date(date2);
	endDate.setDate(endDate.getDate() + 1);
	var todate = endDate.getFullYear()+'-'+(endDate.getMonth()+1)+'-'+endDate.getDate()+' 02:00:00';

	response.header("application/json; charset=utf-8");
	var sqlresult = "SELECT DATE_FORMAT(date_time, '%Y-%m-%d') AS fdate , COUNT(dailyfood.id) AS fCount,  users.vendor, (CASE WHEN DATE_FORMAT(date_time, '%H:%i')>='00:00' && DATE_FORMAT(date_time, '%H:%i')<'02:00' THEN CONCAT(DATE_FORMAT(DATE_SUB(date_time, INTERVAL 1 Day), '%Y-%m-%d'),':Dinner:', users.vendor) WHEN DATE_FORMAT(date_time, '%H:%i')>='17:00' && DATE_FORMAT(date_time, '%H:%i:%s')<='23:59:59' THEN CONCAT(DATE_FORMAT(date_time, '%Y-%m-%d'),':Dinner:', users.vendor) WHEN DATE_FORMAT(date_time, '%H:%i')>='02:00' && DATE_FORMAT(date_time, '%H:%i')<'17:00' THEN CONCAT(DATE_FORMAT(date_time, '%Y-%m-%d'),':Lunch:', users.vendor) ELSE 1 END) AS foodSlot from dailyfood JOIN users ON users.id=dailyfood.updatedby WHERE date_time >='"+fromdate+"' AND date_time <= '"+todate+"' GROUP BY foodSlot";
		con.query(sqlresult, function (error, result, client){
        var resultFinal = JSON.stringify(result);
        response.send(resultFinal);
    });
});


app.listen(port);



import express from 'express';
import md5 from 'md5';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';

import sqlConn from './utils/sql.js';
import departments from './routes/departments.js';
import company from './routes/company.js';
import vendor from './routes/vendor.js';
import reports from './routes/reports.js';
import employee from './routes/employee.js';
import sessionData from './routes/sessionData.js';
import food from './routes/food.js';
import pizza from './routes/pizza.js';
import tokenData from './routes/tokenData.js';
import vendorReport from './routes/vendorReport.js';
import todaysRecords from './routes/todaysRecord.js';

const port = 8000;


const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
const __dirname = path.resolve();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.get('/', function(request, response){
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/',function(request,response){
	const username = request.body.uname;
 const password = md5(request.body.psw);
 if (username && password) {
	 sqlConn.query('SELECT * FROM users WHERE status = 1 AND username = ? AND password = ?', [username, password], function(error, results, fields) {
		 
		 if(error) throw error;

		 if (results.length > 0) {
			request.session.loggedin = true;
			request.session.Uid = results[0].id;
			request.session.foodservice = results[0].foodservice;
			request.session.username = results[0].username;
			request.session.vendor = results[0].vendor;
			const timestamp = new Date().toISOString();
			request.session.timestamp = timestamp;
			return response.redirect('/dashboard');
		 } else {
			return response.redirect('/');
			//response.json({ message: 'Incorrect Username and/or Password!!' });
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

app.use('/departments', departments);
app.use('/company', company);
app.use('/vendor', vendor);
app.use('/reports', reports);
app.use('/todaysRecords', todaysRecords);
app.use('/vendorReport', vendorReport);
app.use('/employee', employee);
app.use('/session', sessionData);
app.use('/food', food);
app.use('/pizza', pizza);
app.use('/tokenData', tokenData);

app.listen(port);



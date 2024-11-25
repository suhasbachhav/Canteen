import mysql from 'mysql';  


const connection = mysql.createConnection({
    host: "localhost",  
    user: "root",  
    password: "admin",  
    database: "canteenbkprivate",
    timezone: 'ist'  
});
connection.connect();


export default connection;

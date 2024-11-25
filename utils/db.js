import sqlConn from '../utils/sql.js'; 

async function db(query, query_var){
    return new Promise(function(resolve, reject) {
        sqlConn.query(query, query_var, (err, rows, fields) => {
            if (err) {
                sqlConn.end();
                return reject(err);
            }
            resolve(rows);
        });
    });
}

async function returnResultSet(query, query_var){
    try{
        return await db(query, query_var);
    }catch(e){
        throw new Error(e.message);
    }
}


export default returnResultSet;
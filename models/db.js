const mysql = require('mysql');
const connection = mysql.createConnection({
    host:"localhost",
    user: "root",
    password:"",
    database: "bookstore"
});

connection.connect(function(err) {
    if (err) {
        console.log('Error while connecting to MySQL', err);
        throw err;
    }
    console.log('Connected to MySQL');
});

module.exports = connection;
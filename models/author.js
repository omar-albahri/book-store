const pool = require('./pool');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 150 });

var Author = (author) => {
    this.id = author.id;
    this.name = author.name;
    
};

Author.getAllAuthor = (result) => {
    pool.query("SELECT * FROM author", (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Author.getByIdAuthor = (id, result) => {
    cacheValue = cache.get(`author${id}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM author WHERE id = ?', id, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The user is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`author${id}`, res);
                    result(null, res[0]);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

Author.getByNameAuthor = (name, result) => {
    pool.query('SELECT * FROM author WHERE name = ?', name, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            if (res.length === 0) { // The user is not found for the given userName
                result(null, {});
            } else {
                result(null, res[0]);
            }
        }
    });
};

Author.createAuthor = (name, result) => {
    pool.query("INSERT INTO author SET name = ?  ", [name], (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, Object.assign({ id: res.insertId ,name} )); // Merge 2 objects
        }
    });
      
    //});
};

Author.updateAuthor = (id,newName, result) => {
    pool.query(`UPDATE author
                SET name = "${newName}" WHERE id = ${id}`, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: id ,name:newName});
            cache.del(`author${id}`);
        }
    });
};

Author.deleteAuthor = (id, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {
            connection.query(`SELECT * FROM author WHERE id = ${id}`, (err, resGet) => {
                if (err) {
                    connection.release();
                    return result(err, null, 500);
                } else {
                    if (resGet.length === 0) { // The user is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM author WHERE id = ${id}`, (errDel, resDel) => {
                            connection.release();
                            if (errDel) {
                                result(errDel, null, 500);
                            } else {
                                result(null, resGet, 200);
                                cache.del(`author${id}`);
                            }
                        });
                    }
                }
            });
        }
    });
};

module.exports = Author;
const pool = require('./pool');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 150 });

var User = (user) => {
    this.id = user.id;
    this.userName = user.userName;
    this.email = user.email;
    this.password = user.password;
    this.roleId = user.roleId;
};

User.getAllUsers = (result) => {
    pool.query("SELECT * FROM user", (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

User.getByIdUser = (id, result) => {
    cacheValue = cache.get(`user${id}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM user WHERE id = ?', id, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The user is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`user${id}`, res);
                    result(null, res[0]);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

User.getByName = (userName, result) => {
    pool.query('SELECT * FROM user WHERE userName = ?', userName, (err, res) => {
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

User.createUser = (user, result) => {
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            result(err, null);
        } else {
            pool.query("INSERT INTO user SET userName = ? , email = ? , password = ?, roleId=? ;", [user.userName, user.email, hash,user.roleId], (err, res) => {
                if (err) {
                    result(err, null);
                } else {
                    result(null, Object.assign({ id: res.insertId }, user)); // Merge 2 objects
                }
            });
        }
    });
};

User.updateUser = (id,newuser, result) => {
    //var user=User.getSpecifiedUser(id);
    //console.log(user)
    pool.query(`UPDATE user
                SET userName = "${newuser.userName}", email="${newuser.email}" , roleId=" ${newuser.roleId} "
                WHERE id = ${id}`, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, Object.assign({ id: id }, newuser));
            cache.del(`user${id}`);
        }
    });
};
User.getSpecifiedUser=(userId,result)=>{
    console.log(userId)
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {
            connection.query(`SELECT * FROM user WHERE id = ${userId}`, (err, resGet) => {
                if (err) {
                    connection.release();
                    return result(err, null);
                } else {
                    if (resGet.length === 0) { // The user is not found for the given id
                        result({ error: 'Record not found' }, null);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        // connection.query(`DELETE FROM user WHERE id = ${userId}`, (errDel, resDel) => {
                        //     connection.release();
                        //     if (errDel) {
                        //         result(errDel, null, 500);
                        //     } else {
                        //         result(null, resGet, 200);
                        //         cache.del(`user${userId}`);
                        //     }
                        // });
                        console.log(resGet)
                        //return result(null, resGet);
                        return resGet; 
                    }
                }
            });
        }
    });
}
User.ChangePassword = (email, oldPassword, newPassword, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null);
        } else {
            connection.query('SELECT * FROM user WHERE email = ?', email, (err, res) => {
                if (err) {
                    connection.release();
                    result(err, null, 500);
                } else {
                    if (res.length === 0) { // The user is not found for the given userName
                        connection.release();
                        result({ Error: "Error in user name or password" }, null, 400);
                    } else {
                        user = res[0];
                        bcrypt.compare(oldPassword, user.password, (err, isCorrect) => {
                            if (err) {
                                connection.release();
                                result(err, null, 500);
                            } else {
                                if (!isCorrect) {
                                    connection.release();
                                    result({ Error: "Error in user name or password" }, null, 400);
                                } else {
                                    bcrypt.hash(newPassword, 10, function(err, hash) {
                                        if (err) {
                                            connection.release();
                                            result(err, null, 500);
                                        } else {
                                            connection.query("UPDATE user SET password = ? WHERE id = ?", [hash, user.id], (err, res) => {
                                                connection.release();
                                                if (err) {
                                                    result(err, null, 500);
                                                } else {
                                                    result(null, true, 204);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }); // end bcrypt.compare
                    }
                }
            });
        }
    });
};

User.deleteUser = (userId, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {
            connection.query(`SELECT * FROM user WHERE id = ${userId}`, (err, resGet) => {
                if (err) {
                    connection.release();
                    return result(err, null, 500);
                } else {
                    if (resGet.length === 0) { // The user is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM user WHERE id = ${userId}`, (errDel, resDel) => {
                            connection.release();
                            if (errDel) {
                                result(errDel, null, 500);
                            } else {
                                result(null, resGet, 200);
                                cache.del(`user${userId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};

User.login = (email, password, result) => {
    pool.query('SELECT * FROM user WHERE email = ?', email, (err, res) => {
        if (err) {
            connection.release();
            result(err, null, 500);
        } else {
            if (res.length === 0) { // The user is not found for the given userName
                result({ Error: "Error in user name or password" }, null, 400);
            } else {
                const user = res[0];
                bcrypt.compare(password, user.password, (err, isCorrect) => {
                    if (err) {
                        result(err, null, 500);
                    } else {
                        if (!isCorrect) {
                            result({ Error: "Error in user name or password" }, null, 400);
                        } else {
                            // The user name and the password are correct
                            result(null, user, 200);
                        }
                    }
                }); // end bcrypt.compare
            }
        }
    });
};

User.hasRole = (userId, result) => {
    const strQuery = `SELECT r.roleName
                      FROM user ur INNER JOIN role r ON ur.roleId = r.id
                      WHERE ur.id = ${userId} `;
    pool.query(strQuery, (err, res) => {
        console.log('rolename: '+res[0].roleName)
        if (err) {
            result(err, null, 500);
        } else {
            if (res.length === 0) { // the user hasn't the given role
                result(null, false, 200);
            } else {
                result(null, res[0].roleName, 200);
            }
        }
    });
};

module.exports = User;
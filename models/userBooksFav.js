//const db = require('./db');
const pool = require('./pool');
const Books = require('../models/book');

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 30, checkperiod: 600 });

class UserBooksFav {
    constructor(userBooksFav) {
        this.id = userBooksFav.id;
        this.userId = userBooksFav.userId;
        this.bookId = userBooksFav.bookId;
        this.favOrder = userBooksFav.favOrder;
        this.isRead = userBooksFav.isRead;
    }
}

class Object {
    constructor(obj) {
        this.image = obj.image;
        this.ISBN = obj.ISBN;
        this.title = obj.title;
        this.favOrder = obj.favOrder;
        this.isRead = obj.isRead;
    }
}
class UserBooksFav2 {
    constructor(userBooksFav) {
        this.id = userBooksFav.id;
        this.userId = userBooksFav.userId;
        this.bookId = userBooksFav.bookId;
        this.favOrder = userBooksFav.favOrder;
        this.isRead = userBooksFav.isRead;
    }
}
UserBooksFav.getAllUserBooksFav = (result) => {
    pool.query('SELECT * FROM userbooksfav  ORDER BY id', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

UserBooksFav.getByIdUserBooksFav = (userId, result) => {
    cacheValue = cache.get(`user${userId}`);
    if (cacheValue == undefined) {
        pool.query(`SELECT * FROM userbooksfav inner join book on book.id=userbooksfav.bookId where userId=${userId} order by favOrder desc  `, (err, res) => {
            var arr=[];
            Object={}
            //console.log('thisobg: '+Object.title)
            for(let x=0;x <res.length;x++)
            {
                Object={title:res[x].title,ISBN:res[x].ISBN,isRead:res[x].isRead,image:res[x].image,favOrder:res[x].favOrder}
               // console.log("fff"+res[x].bookId)
                arr.push(Object);
            }
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The book is not found for the givent id
                    result(null, {});
                } else {
                    console.log("Out Of Cache User")
                    cache.set(`user${userId}`, arr);
                    result(null,arr);
                }
            }
        });
    } else {
        console.log("From Cache User")
        result(null, cacheValue);
    }
};

UserBooksFav.favOrder = (userId,bookId, result) => {
    // cacheValue = cache.get(`book${userId}`);
    // if (cacheValue == undefined) {
    //     pool.query('SELECT * FROM userbooksfav ', (err, res) => {
    //         console.log(res.length);

    //         if (err) {
    //             result(err, null);
    //         } else {
    //             if (res.length === 0) { // The book is not found for the givent id
    //                 result(null, {});
    //             } else {
    //                 cache.set(`favNumber${favNumber}`, res);
    //                 result(null, res);
    //             }
    //         }
    //     });
    // } else {
    //     result(null, cacheValue);
    // }
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {       

            connection.query(`SELECT * FROM userbooksfav where userId=${userId} `, (err, resGet) => {
                console.log('resGet length: '+resGet.length);
                const num=resGet.length;
                console.log('num:'+num)
                if (err) {
                    connection.release();
                    return result(err, null, 500);
                } else {
                    if (resGet.length === 0) { // The Book is not found for the givent id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        connection.query(` SELECT max(favOrder) as maxOrder FROM userbooksfav where userId=${userId}  `, (err, resGetMax) => {
                       console.log("Max "+resGetMax[0].maxOrder)
                       console.log("count "+resGet.length)
                       console.log(userId)
                            if(resGetMax[0].maxOrder==0)
                            {

                            
                        // Use one connection to DB for the 2 queries
                        connection.query(` UPDATE userbooksfav SET favOrder=${num+1}  where userId=${userId} and bookId=${bookId} `,  (errDel, resDel) => {
                            connection.release();
                            if (errDel) {
                                result(errDel, null, 500);
                            } else {
                                result(null, num, 200);
                               // cache.del(`book${bookId}`);
                            }
                        });
                    }
                        else
                        {
                            connection.query(`UPDATE userbooksfav SET favOrder=${resGetMax[0].maxOrder+1} where userId=${userId} and bookId=${bookId} `, (errDel, resDel) => {
                                connection.release();
                                console.log(resGetMax+1);
                                if (errDel) {
                                    result(errDel, null, 500);
                                } else {
                                    result(null,resGetMax[0].maxOrder, 200);
                                   // cache.del(`book${bookId}`);
                                }
                            });

                        }
                    });
                }
                }
            });
        }
    });
};

UserBooksFav.getByIdSpecificUserBooksFav = (userId, result) => {
    cacheValue = cache.get(`user${userId}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM userbooksfav inner join book WHERE book.id=userbooksfav.BookId and userId = ?', userId, (err, res) => {
            console.log(res)
            var arr=[];
            for(let x=0;x <res.length;x++)
            {
                console.log("fff"+res[x].bookId)
                arr.push(res[x].title);
            }
            
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The book is not found for the givent id
                    result(null, {});
                } else {
                    cache.set(`user${userId}`, res.title);
                    result(null, arr);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

// UserBooksFav.createUserBooksFav = (UserBooksFav, result) => {
//     console.log(UserBooksFav)
//     //pool.query("INSERT INTO book SET title = ? ", book.title, (err, res) => {
//     pool.query("INSERT INTO userbooksfav (userId , bookId , favOrder , isRead) VALUES ( ? ,? ,? ,? )", [UserBooksFav.userId ,UserBooksFav.bookId ,UserBooksFav.favOrder ,UserBooksFav.isRead], (err, res) => {
//         if (err) {
//             result(err, null);
//         } else {
//             result(null, { id: res.insertId, userId:UserBooksFav.userId ,bookId:UserBooksFav.bookId ,favOrder:UserBooksFav.favOrder ,isRead:UserBooksFav.isRead});
//         }
//     });
// };

UserBooksFav.updateUserBooksFav = (id, UserBooksFav, result) => {
    //console.log('book = ', book);
    pool.query(`UPDATE userbooksfav
                SET userId = "${UserBooksFav.userId}",bookId="${UserBooksFav.bookId}",favOrder="${UserBooksFav.favOrder}",isRead="${UserBooksFav.isRead} "  
                WHERE id = ${id}`, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: id,  userId:UserBooksFav.userId ,bookId:UserBooksFav.bookId ,favOrder:UserBooksFav.favOrder ,isRead:UserBooksFav.isRead });
            cache.del(`book${id}`);
        }
    });
};

UserBooksFav.createUserBooksFav = (UserBooksFav, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {            
            connection.query(`SELECT * FROM userbooksfav where userId=? `,UserBooksFav.userId, (err, resGet) => {
                console.log('resGet length: '+resGet.length);
                const num=resGet.length;
                if (err) {
                    connection.release();
                    return result(err, null, 500);
                } else {
                    if (resGet.length === 0) { // The Book is not found for the givent id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query("INSERT INTO userbooksfav (userId , bookId ) VALUES ( ?,?  )", [UserBooksFav.userId ,UserBooksFav.bookId], (errDel, resDel) => {
                            connection.release();
                            if (errDel) {
                                result(errDel, null, 500);
                            } else {
                                result(null, {'userid':UserBooksFav.userId,'bookid':UserBooksFav.bookId}, 200);
                               // cache.del(`book${bookId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};

UserBooksFav.deleteUserBooksFav = (bookId, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {            
            connection.query(`SELECT * FROM userbooksfav WHERE id = ${bookId}`, (err, resGet) => {
                if (err) {
                    connection.release();
                    return result(err, null, 500);
                } else {
                    if (resGet.length === 0) { // The Book is not found for the givent id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM userbooksfav WHERE id = ${bookId}`, (errDel, resDel) => {
                            connection.release();
                            if (errDel) {
                                result(errDel, null, 500);
                            } else {
                                result(null, resGet, 200);
                                cache.del(`book${bookId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};


UserBooksFav.OrderMyFavoritesData = (userId,result) => {
    pool.query(`SELECT * FROM userbooksfav inner join book on book.id=userbooksfav.bookId where userId=${userId} order by favOrder desc`, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            var arr=[];
            for(let x=0;x <res.length;x++)
            {
                console.log("fff"+res[x].bookId)
                arr.push(res[x].title);
            }
            result(null, arr);
        }
    });
};



UserBooksFav.MarkRead = (userId,bookId,isRead,result) => {
    
    console.log("inside Read")
    pool.query(`UPDATE userbooksfav SET isRead=${isRead}  WHERE userId = ${userId} and bookId=${bookId}`, (err, res) => {
        if (err) {
        result(err, null);
        } else {
            
        //return result(null,'isRead:Updated' );
        //result(null,'isRead :Updated');
         result(null,{isRead:'Updated'});
        //cache.del(`book${id}`);
        }
        });


};




UserBooksFav.GetUserBook = (userId,bookId, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {            
            connection.query(`SELECT * FROM userbooksfav WHERE userId = ${userId} and bookId=${bookId}`, (err, resGet) => {
                connection.release()
                console.log(resGet)
             
                // if(resGet[0].isRead==0)
                // {
                let value;
                //let one;
                if(resGet[0].isRead==0)
                {
                    value=1;

                }
                if(resGet[0].isRead==1)
                {
                    value=0;

                }
                UserBooksFav.MarkRead(userId,bookId,value, (err, userBook) => {
                    console.log('userBook '+userBook)
                    result(null,userBook);
                 
                 });

               // }
                // else
                // {
                
                //     UserBooksFav.MarkUnRead(userId,bookId, (err, userBook) => {
                //         console.log('userBook '+userBook)
                //         result(null,userBook);
                
                //     });
                // }
             
            });
        }
    });
};


UserBooksFav.MarkUnRead = (userId,bookId,result) => {
    console.log("inside UnRead")
    pool.query(`UPDATE userbooksfav SET isRead=0  WHERE userId = ${userId} and bookId=${bookId}`, (err, res) => {
    if (err) {
    result(err, null);
    } else {
     //result(null,'isRead:Updated' );
      result(null,{isRead:'Updated'});
     //result(null,);
    //cache.del(`book${id}`);
    }
    });
};

module.exports = UserBooksFav;
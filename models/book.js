//const db = require('./db');
const pool = require('./pool');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 600 });

class Book {
    constructor(book) {
        this.id = book.id;
        this.title = book.title;
        this.authorId = book.authorId;
        this.ISBN = book.ISBN;
        this.image = book.image;
    }
}

Book.getAllBooks = (result) => {
    cacheValue = cache.get(`books`);
    if (cacheValue == undefined) {
    pool.query('SELECT * FROM book ORDER BY id', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            console.log("Out OF Cache")
            cache.set(`books`, res);
            result(null, res);
        }
    });
    }
    else {
        console.log("From Cache")
        result(null, cacheValue);
    }

};

Book.getByIdBook = (bookId, result) => {
    cacheValue = cache.get(`book${bookId}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM Book WHERE id = ?', bookId, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The book is not found for the givent id
                    result(null, {});
                } else {
                    cache.set(`book${bookId}`, res);
                    result(null, res);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

Book.createBookInfo = (book, result) => {
    console.log(book)
    //pool.query("INSERT INTO book SET title = ? ", book.title, (err, res) => {
    pool.query("INSERT INTO book (title , authorId , ISBN , image) VALUES ( ? ,? ,? ,? )", [book.title ,book.authorId ,book.ISBN ,book.image], (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: res.insertId, title: book.title  ,authorId :book.authorId ,ISBN :book.ISBN ,image :book.image});
        }
    });
};

Book.updateBookInfo = (id, book, result) => {
    console.log('book = ', book);
    pool.query(`UPDATE book
                SET image = "${book.image}" 
                WHERE id = ${id}`, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: id, image: book.image });
            cache.del(`book${id}`);
        }
    });
};

Book.deleteBook = (bookId, result) => {
    pool.getConnection((err, connection) => {
        if (err) {
            result(err, null, 500);
        } else {            
            connection.query(`SELECT * FROM book WHERE id = ${bookId}`, (err, resGet) => {
                if (err) {
                    connection.release();
                    return result(err, null, 500);
                } else {
                    if (resGet.length === 0) { // The Book is not found for the givent id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM book WHERE id = ${bookId}`, (errDel, resDel) => {
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

module.exports = Book;
const Books = require('../models/book');
const Joi = require('joi');
const express = require('express');
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
    Books.getAllBooks((err, books) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
           // res.status(200).json(books);
		    res.render('books',{'book' : books} );
        }
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Books.getByIdBook(id, (err, book) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(book).length === 0) { // here spec = {}
                res.status(404).json(book);
            } else {
                res.status(200).json(book);
            }
        }
    });
});

router.post('/', (req, res) => {
    const book = { title: req.body.title
        ,image:req.body.image
        ,authorId:req.body.authorId
        ,ISBN:req.body.ISBN };
    console.log(book)
  
    // const { error } = ValidateModel(book);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    Books.createBookInfo(book, (err, book) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(book);
        }
    });
});

router.put('/:id', (req, res) => {
    const book = { image: req.body.image };
    const bookId = req.params.id;

    if (isNaN(bookId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    // const { error } = ValidateModel(book);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    Books.updateBookInfo(bookId, book, (err, book) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(book);
        }
    });
});

router.delete('/:id', (req, res) => {
    const bookId = req.params.id;
    if (isNaN(bookId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Books.deleteBook(bookId, (err, book, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(book);
        }
    });
});

function ValidateModel(data) {
    const schema = Joi.object({
        title: Joi.string().max(50).required()
    });

    return schema.validate(data);
}

module.exports = router;
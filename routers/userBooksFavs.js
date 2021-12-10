const UserBooksFav = require('../models/userBooksFav');
const Joi = require('joi');
const express = require('express');
const app = express();
const router = express.Router();

router.post('/getMyFavs' , (req, res) => {
    const userId = req.body.userId;
    //console.log('inside:'+userId)
    UserBooksFav.getByIdUserBooksFav(userId,(err, books) => {
        //console.log(books)
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(books);
        }
    });
});

router.post('/getOrder' , (req, res) => {
    const userId = req.body.userId;
    console.log('inside:'+userId)
    UserBooksFav.OrderMyFavoritesData(userId,(err, books) => {
        console.log(books)
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json({books});
        }
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

        UserBooksFav.getByIdUserBooksFav(id, (err, book) => {
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
router.post('/userId', (req, res) => {
    const userId = req.body.userId;
    console.log(userId)
    if (isNaN(userId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

        UserBooksFav.getByIdSpecificUserBooksFav(userId, (err, book) => {
            console.log("dd"+book)
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
    const userBooksFav = {
        bookId:req.body.bookId,
        userId: req.body.userId
        //,favOrder:req.body.favOrder
         };
         
        //const id=req.params.id
    //console.log(book)
  
    // const { error } = ValidateModel(book);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    UserBooksFav.createUserBooksFav(userBooksFav, (err, userBooksFav) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(userBooksFav);
        }
    });
});

router.put('/:id', (req, res) => {
    //const book = { image: req.body.image };
    const bookId = req.params.id;
    const userBooksFav = { userId: req.body.userId
        ,bookId:req.body.bookId
        ,favOrder:req.body.favOrder
        ,isRead:req.body.isRead };
    
    if (isNaN(bookId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    // const { error } = ValidateModel(book);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    UserBooksFav.updateUserBooksFav(bookId, userBooksFav, (err, userBooksFav) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(userBooksFav);
        }
    });
});

router.patch('/FavOrder', (req, res) => {
    //const book = { image: req.body.image };
    //const bookId = req.params.id;
    const userId = req.body.userId;
    const bookId = req.body.bookId;
    // if (isNaN(userId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
    //     return res.status(400).send('id should be a number!');
    // }
    // const { error } = ValidateModel(book);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }
    console.log('fff :'+userId)

    UserBooksFav.favOrder(userId,bookId, (err, userBooksFav) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            console.log("ggg "+userBooksFav)
            ///res.status(200).json(userBooksFav);
        }
    });
});

router.patch('/mark', (req, res) => {
    //const book = { image: req.body.image };
    //const bookId = req.params.id;
    const userId = req.body.userId;
    const bookId = req.body.bookId;
    //const isRead=req.body.isRead;
    // if (isNaN(userId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
    //     return res.status(400).send('id should be a number!');
    // }
    // const { error } = ValidateModel(book);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }
    console.log('fff :'+userId)
    
    console.log('fff :'+bookId)
    UserBooksFav.GetUserBook(userId,bookId, (err, resGet) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            console.log('this is ubf: ',resGet)
             res.status(200).json(resGet);
            
        }
    });
});

router.delete('/:id', (req, res) => {
    const bookId = req.params.id;
    if (isNaN(bookId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

        UserBooksFav.deleteUserBooksFav(bookId, (err, userBooksFav, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(userBooksFav);
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
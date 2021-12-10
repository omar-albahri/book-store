const Authors = require('../models/author');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const express = require('express');
const secretKey = require('../shared/secretKey');
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
    Authors.getAllAuthor((err, authors) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(authors);
        }
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Authors.getByIdAuthor(id, (err, author) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(author).length === 0) { // here user = {}
                res.status(404).json(author);
            } else {
                res.status(200).json(author);
            }
        }
    });
});

router.post('/CreateAuthor', (req, res) => {
    // const user = {
    //     userName: req.body.userName,
    //     email: req.body.email,
    //     password: req.body.password
    // };
    const name=req.body.name;
    const obj={name:req.body.name}
    ValidateModel(obj)
    const {error} = ValidateModel(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    console.log(name)
  //  const { error } = ValidateModel(user);
    
    Authors.createAuthor(name, (err, author) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.status(201).json(author);
            }
    });
});

router.put('/:id', (req, res) => {
    //const user = { name: req.body.name };
    const authorId = req.params.id;
    const newName= req.body.name; 
    const {error} = ValidateModel(req.body);
    if(error) return res.status(400).send(error.details[0].message);
   // ValidateModel({newName})
    // if (isNaN(userId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
    //     return res.status(400).send('id should be a number!');
    // }
    // const { error } = ValidateModel(user);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    Authors.updateAuthor(authorId, newName, (err, author) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(author);
        }
    });
});

router.delete('/:id', (req, res) => {
    const authorId = req.params.id;
    // if (isNaN(userId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
    //     return res.status(400).send('id should be a number!');

    Authors.deleteAuthor(authorId, (err, author, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(author);
        }
    });
});


function ValidateModel(data) {
    const schema = Joi.object({
        name: Joi.string().max(5).required(),
    });
    console.log(schema.validate(data))
    console.log(schema.error)
    if(schema.error)
    {
        console.log("validated")
        return schema.validate(data);


    }
    else
    {
        console.log("please validate")
    }
    
}

function ValidateLogin(data) {
    const schema = Joi.object({
        email: Joi.string().max(50).email().required(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
}
module.exports = router;
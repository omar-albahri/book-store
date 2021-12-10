const Users = require('../models/user');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const express = require('express');
const secretKey = require('../shared/secretKey');
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
    Users.getAllUsers((err, users) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(users);
        }
    });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Users.getByIdUser(id, (err, user) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(user).length === 0) { // here user = {}
                res.status(404).json(user);
            } else {
                res.status(200).json(user);
            }
        }
    });
});

router.post('/Register', (req, res) => {
    const user = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        roleId:req.body.roleId
    };

    // const { error } = ValidateModel(user);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    Users.createUser(user, (err, user) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.status(201).json(user);
            }
    });
});

router.post('/Login', (req, res) => {
        const email= req.body.email;
        const password= req.body.password;

    // const { error } = ValidateLogin({userName, password});
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    Users.login(email, password, (err, user) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            jwt.sign({ user }, secretKey, { expiresIn: '100000s' }, (err, token) => {
                res.status(201).json(token);
            });
        }
    });
});
router.put('/ChangePassword', (req, res) => {
    const email= req.body.email;
    const oldpassword= req.body.oldpassword;
    const newpassword= req.body.newpassword;

// const { error } = ValidateLogin({userName, password});
// if (error) {
//     return res.status(400).send({ error: error });
// }

Users.ChangePassword(email, oldpassword,newpassword, (err, user) => {
    if (err) {
        res.status(500).json({ error: err });
    } else {
      //  jwt.sign({ user }, secretKey, { expiresIn: '60s' }, (err, token) => {
            res.status(201).json(user);
        //});
    }
});
});

router.put('/UpdateUser/:id', (req, res) => {
    const user = { email: req.body.email,userName:req.body.userName,roleId:req.body.roleId };
    const userId = req.params.id;

    // if (isNaN(userId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
    //     return res.status(400).send('id should be a number!');
    // }
    // const { error } = ValidateModel(user);
    // if (error) {
    //     return res.status(400).send({ error: error });
    // }

    Users.updateUser(userId,user, (err, user) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(user);
        }
    });
});

router.delete('/DeleteUser/:id', (req, res) => {
    const userId = req.params.id;
    if (isNaN(userId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Users.deleteUser(userId, (err, user, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(user);
        }
    });
});

function ValidateModel(data) {
    const schema = Joi.object({
        userName: Joi.string().max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
}

function ValidateLogin(data) {
    const schema = Joi.object({
        userName: Joi.string().max(50).required(),
        password: Joi.string().email().required(),
    });

    return schema.validate(data);
}

module.exports = router;
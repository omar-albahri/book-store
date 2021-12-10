
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey  =  require('../shared/secretKey');

const authenticate = (req, res, next) => {
    //console.log(isAllowedRoute(req))
    if (isAllowedRoute(req)) {
        if(req.path=='/api/books'&&req.method=="GET")
        {
            return next();

        }
        if(req.path!='/api/books')
        {
            return next();

        }
        if((req.path=='/api/users/Register'||req.path=='/api/users/Login')&&req.method=="POST")
        {
            next();
        }
        
    }

    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        // req.token = bearerToken;

        jwt.verify(bearerToken, secretKey, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                console.log("authData.user.id: "+authData.user.id)
                requestVerifiesRules(req, authData.user.id, (err, rulesAreVerified) => {
                    let requestMethod = req.method;
                    console.log("rulesAreVerified: "+rulesAreVerified)
                    console.log("requestMethod: "+requestMethod)
                    if (err) {
                        res.status(403).send('Error while verifying rules'); // Forbidden
                    } else {
                        // if(rulesAreVerified==true&&req.path=="/api/books")
                        // {
                        //     next()

                        // }
                        if (rulesAreVerified=="admin") {
                            if(isAllowedRouteAdmin(req))
                            {
                                next();
                            }
                            else
                            {
                                res.status(403).send('Forbidden this rule to Admin');
                            }
                           
                        }
                        else if(rulesAreVerified=="user"  )
                        {
                            console.log('this is path:'+req.path)
                            console.log(isAllowedRouteUser(req))
                            //(req.path=="/api/userBooksFavs/mark"||req.path=="/api/userBooksFavs/FavOrder")
                            if(isAllowedRouteUser(req)&&requestMethod=="PATCH"){
                                next();
                                return;
                            }
                            
                            // if(isAllowedRouteUser(req)&&req.path=="/api/userBooksFavs/FavOrder"&&requestMethod=="PATCH"){
                            //     next();
                            // }
                            // if(isAllowedRouteUser(req)&&req.path=="/api/books"&&requestMethod=="GET")
                            // {
                            //     next();

                            // }
                            //(req.path=="/api/books"||req.path=="/api/userBooksFavs/getMyFavs"||req.path=="/api/userBooksFavs/getOrder")
                            if(isAllowedRouteUser(req)&&(requestMethod=="POST"||requestMethod=="GET")){
                                next();
                            }
                            // else if(isAllowedRouteUser(req)&&req.path=="/api/userBooksFavs"&&requestMethod=="GET"){
                            //     next();
                            // }
                            else
                            {
                                res.status(403).send('Forbidden this rule to User');
                                console.log("sheikho")
                            }
                        



                        }
                         else {
                            res.sendStatus(403).send("Forbidden To this Rule"); // Forbidden
                        }
                    }
                });
            }
        });
    } else {
        res.status(403).send('Invalid authorization header'); // Forbidden
    }
};

function isAllowedRoute(req) {
    // Allowed Routes:
    return ([
        '/api/users/Register',
        '/api/users/Login',
        '/api/books'
    ].indexOf(req.path) >= 0);
}

function isAllowedRouteUser(req) {
    // Allowed Routes:

    return ([
        //'/api/userBooksFavs',
        '/api/userBooksFavs/getMyFavs',
        // '/api/userBooksFavs/getOrder',
        // '/api/userBooksFavs/FavOrder',
        '/api/userBooksFavs/mark',
        '/api/books'
    ].indexOf(req.path) >= 0);
}


function isAllowedRouteAdmin(req) {
    // Allowed Routes:

    return ([
        '/api/users',
        '/api/books',
        '/api/authors/CreateAuthor',
        '/api/authors'
    ].indexOf(req.path) >= 0);
}

requestVerifiesRules = (req, userId, result) => {
    // Allowed Methods for all authenticated users:
    // if (req.method == 'GET') {
    //     result(null, true);
    // } else {
    //     // Allowed Roles:
        
    // }
    User.hasRole(userId, (err, res) => {
        if (err) {
            result(err, false);
        } else {

            result(null, res);
        }
    });
};

module.exports = authenticate;
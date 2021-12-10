const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({
    extended:true
}))
app.use(express.json());

app.use((err, req, res, next) => {
    console.log('Unhandled error: ' + err);
    res.status(500).send("Internal Server Error");
});

app.use(express.static(path.join(__dirname ,'assets')));
app.set('view engine' ,'ejs');
app.set('views' ,'views');
app.get('/' ,(req ,res) =>{
    res.render('index');
});
app.get('/contact' ,(req ,res ,next) =>{
    res.render('contact');
});

app.get('/about' ,(req ,res ,next) =>{
    res.render('about');
});

app.get('/books' ,(req ,res ,next) =>{
    res.render('books');
});
app.get('admin/books' ,(req ,res ,next) =>{
    res.render('admin');
});

app.get('/login' ,(req ,res ,next) =>{
    res.render('login');
});
app.get('/signup' ,(req ,res ,next) =>{
    res.render('signup');
});

app.get('/detail' ,(req ,res,next) =>{
    res.render('details');
})

app.get('/admin' ,(req ,res ,next)=>{
    res.render('admin');
})

app.get('/addbook' ,(req ,res ,next)=>{
    res.render('addbook');
})

app.get('/addauthor' ,(req ,res ,next)=>{
    res.render('addauthor');
})



const auth = require('./middleware/authenticate');

const https=require('https');
const http=require('http');
const fs = require('fs');
//const option={key:fs.readFileSync('./configs/key.pem','utf8')
//,cert:fs.readFileSync('./configs/cert.pem','utf8')}
//const { urlencoded } = require('express');

app.use(express.urlencoded({
    extended:true
}))
app.use(express.json());

// app.use((err, req, res, next) => {
//     console.log('Unhandled error: ' + err);
//     res.status(500).send("Internal Server Error");
// });

app.use(auth);

app.use('/api/userBooksFavs', require('./routers/userBooksFavs'));

app.use('/api/authors', require('./routers/authors'));
app.use('/api/books', require('./routers/books'));

app.use('/api/users', require('./routers/users'));
app.use('/', (req, res) => {
    res.status(404).send('Incorrect URL!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, _ => console.log('Listening to port ' + PORT));
module.exports = app;
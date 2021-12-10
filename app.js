
const express = require('express');

const multer = require('multer');

const path =require('path');

const app = express();

//set storage engine
const storage =multer.diskStorage({
destination :'./public/upload/',
filename:function(req ,file  ,cb){
    cb(null ,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
}
});

//init upload
const upload =multer({
    storage: storage,
    limits:{filesize :100000},
    fileFilter :function(req ,res ,cb){
        checkTypeFile(file ,cb)
    }
}).single('myimage');



app.use(express.static('./public'));

app.use(express.static(path.join(__dirname ,'view')));
// app.get('/' ,(req ,res) =>{
//     res.require
// });

app.post('/upload' ,(req ,res) =>{
  upload(req ,res  ,err => {
 if(err) {
     res.send(err);
 }
 else{
     console.log(req.file);
     res.send('test');
 }
  });
});
app.listen(3000 ,() => console.log("listen  on port 3000"));
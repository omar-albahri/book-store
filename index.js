const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const app = express();
  
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
  
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
  
var upload = multer({ storage: storage })
  
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
  
app.post('/', upload.single('image'),async (req, res) => {
       const { filename: image } = req.file;
      
       await sharp(req.file.path)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(
            path.resolve(req.file.destination,'resized',image)
        )
        fs.unlinkSync(req.file.path)
      
       res.redirect('/');
});
  
app.listen(3000 ,() =>console.log("listen on port 3000"));

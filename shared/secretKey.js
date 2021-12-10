const path = require('path');
const fs = require('fs');

const secretKey  =  fs.readFileSync(__dirname + path.sep + 'sKey.txt', 'utf8');

module.exports = secretKey;
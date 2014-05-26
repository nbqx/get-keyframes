var fs = require('fs');
var getKeyframes = require(__dirname);

var keyframes = getKeyframes(__dirname+'/test.avi');
console.log(keyframes);

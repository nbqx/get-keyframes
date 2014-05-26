## get-keyframes

get keyframes in avi file(not tested yet + very experimental)

## usage

```js
var fs = require('fs');
var getKeyframes = require(__dirname);

var keyframes = getKeyframes(__dirname+'/test.avi');
console.log(keyframes);
```

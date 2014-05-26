var fs = require('fs');

var pos = 0;
var next = 12;
var ret = null;

var movi_pos = null;
var idx1_pos = null;
var idx1_size = null;
var frames = [];

function parser(bf){
  if(bf.length<next) return;

  var c = bf.slice(0,next);
  if(c.toString()==='LIST' || c.toString()==='JUNK'){
    var size = bf.slice(4,8);
    var type = bf.slice(8,12);

    if(type.toString()==='movi') movi_pos = pos+8;

    pos = pos + size.readUInt32LE(0);
    var data = bf.slice(12,12+size.readUInt32LE(0));
    parser(bf.slice(size.readUInt32LE(0)));
    next = 4;
  }
  else{
    if(c.toString()==='idx1'){
      idx1_pos = pos;
      idx1_size = bf.slice(4,8).readUInt32LE(0);

      next = 4;
      pos = pos + 4;
      parser(bf.slice(next));
    }
    else{
      if(idx1_pos===null){
        // do nothing
        next = 4;
        pos = pos + 4;
        parser(bf.slice(next));
      }else{
        if(bf.length>=16){
          var id = bf.slice(0,4).toString();
          // console.log(id);
          var flag = bf.slice(4,8).readUInt32LE(0);
          // console.log(flag);
          var offset = bf.slice(8,12).readUInt32LE(0);
          // console.log(offset);
          var size = bf.slice(12,16).readUInt32LE(0);
          // console.log(size);
          
          var cc = id.toString().substr(2,2);
          if(cc==='db' || cc==='dc' || cc==='pc' || cc==='wb'){
            frames.push({
              id: id,
              flag: flag,
              offset: offset,
              size: size
            });
          }

          next = 4;
          pos = pos + 16;
          parser(bf.slice(next));
        }
        else{
          next = 4;
          pos = pos + 4;
          parser(bf.slice(next));
        }
      }
    }
  }
};

function isKeyFrame(id,flag){
  var cc = id.substr(2,2);
  if(cc==='db' || cc==='dc'){
    if((flag & 0x00000010)!==0){
      return true
    }else{
      return false
    }
  }else{
    return false
  }
}

module.exports = function(path){
  var buf = fs.readFileSync(path);
  parser(buf);

  var ret = [];
  for(var i=0; i<frames.length; i++){
    var f = frames[i];
    if(isKeyFrame(f.id,f.flag)){
      // `+ 8` => https://github.com/ucnv/aviglitch/blob/master/lib/aviglitch/frames.rb#L91
      var _start = movi_pos + f.offset + 8;
      var b = buf.slice(_start,_start+f.size);
      f.data = b;
      ret.push(f);
    }
  }
  return ret;
};

/**
 * 图片工具类
 */
const request = require('request');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');
const {UA} = require('./const')

let option = {
  jar: true,
  headers: {
    'User-Agent': UA,
  }
}
 // 下载图片
exports.downloadImg = function(src, dist){
  option.url = src;
  option.headers.referer = src;
  return new Promise((resolve,reject)=>{
    let filename = path.parse(src).base;
    const FILEREG = /\.(jpeg|jpg|webp|png|bmp|gif|ico)$/;
    // 如果图片不是正常的后缀名，重命名
    if (!FILEREG.test(filename)) {
      filename = uuidv4() + '.png';
    }
    const writeStream = fs.createWriteStream(dist + '/'+ filename, {autoClose:true});
    const rq = request(option);
    rq.pipe(writeStream);
    rq.on('error',(e)=>{
      reject(e)
    });
    writeStream.on('finish',()=>{
      resolve()
    })
  });
}


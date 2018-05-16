/**
 * 图片工具类
 */
const request = require('request');
const fs = require('fs');
const path = require('path');
 // 下载图片
exports.downloadImg = function(src, dist){
  return new Promise((resolve,reject)=>{
    const filename = path.parse(src).base;
    const writeStream = fs.createWriteStream(dist + '/'+ filename, {autoClose:true});
    const rq = request(src);
    rq.pipe(writeStream);
    rq.on('error',(e)=>{
      reject(e)
    });
    writeStream.on('finish',()=>{
      resolve()
    })
  });
}


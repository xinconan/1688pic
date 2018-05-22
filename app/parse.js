const request = require('request')
const cheerio = require('cheerio')
const {downloadImg} = require('./utils')
let retryCount = 0;

let option = {
  maxRedirects: 15,
  jar:true, // 记住cookie
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
  }
}


/**
 * 获取网页的HTML
 * @param {*} url 
 */
function getHtml(url,win) {
  option.url = url;
  option.headers.referer = url;
  return new Promise((resolve,reject) => {
    request(option,(error,resp,body)=>{
      if (!error && resp.statusCode == 200) {
        let $ = cheerio.load(body);
        if ($('#loginchina').length) {
          // TODO: 有登录，可能存在一直重定向到登录页面，需要改造
          if(retryCount<20){
            retryCount++;
            win.send('logger',`第${retryCount}重试请求目标网页`);
            getHtml(url,win);
          }else{
            win.send('logger','重试请求目标网页达到上限值：20。终止请求');
            reject('重定向次数过多');
          }
        }else{
          resolve(body);
        }
      }else {
        reject(error)
      }
    })
  })

}

/**
 * 获取详情图片原始链接
 * 传入的url，类似：https://img.alicdn.com/tfscom/TB1cUizhgvD8KJjSsplXXaIEFXa
 * @param {*} url 
 */
function getDetailImages(url,win){
  win.send('logger','正在请求解析详情图地址');
  option.url = url;
  let imgList = [];
  return new Promise((resolve, reject)=>{
    request(option, (error,resp,body)=>{
      if (!error) {
        try{
          // body的格式：var offer_details={"content":"<div id=\"offer-template-0\">..."}
          eval(body); // 将返回的字符串转成可执行文件
          const $ = cheerio.load(offer_details.content); // htmlParse
          const imgDom = $('img');
          for(let i=0;i<imgDom.length;i++){
            imgList[i] = $(imgDom[i]).attr('src');
          }
          resolve(imgList);
        }catch (e){
          reject(e)
        }
      } else{
        reject(error);
      }
    })
  })
}

/**
 * 解析获取图片链接，分两种页面
 * 一个是商品详情页(商品主图+内容图)，如：https://detail.1688.com/offer/563717771129.html
 * 另一个是商品详情页的主图页面，如：https://detail.1688.com/pic/563717771129.html
 * 其中如果传递的参数是商品详情页，那么也会下载主图页面里的图片
 * @param {*} link 
 */
exports.getImageList = async function(link,path,win){
  retryCount = 0;
  win.send('logger','正在请求目标网页');  
  getHtml(link,win).then((html)=>{
    const $ = cheerio.load(html)
    // 商品详情页
    if (/detail.1688.com\/offer/.test(link)) {
      // 获取详情图片的下载链接
      // 需要从服务器获取，链接是data-tfs-url
      // <div id="desc-lazyload-container" class="desc-lazyload-container" data-url="https://laputa.1688.com/offer/ajax/OfferDesc.do" data-tfs-url="https://img.alicdn.com/tfscom/TB1cUizhgvD8KJjSsplXXaIEFXa" data-enable="true">加载中...</div>
      const tfsUrl = $("#desc-lazyload-container").attr('data-tfs-url');
      // console.log(tfsUrl)
      if (tfsUrl) {
        // 拿到图片请求的链接，继续请求
        getDetailImages(tfsUrl,win).then((imgs)=>{
          imgs.forEach((item)=>{
            download(item, path, win);
          })
        }).catch((e)=>{
          win.send('logger', '获取详情图片出错：'+ e)
          console.log(e)
        });
      } else {
        win.send('logger','没有获取到详情图片链接')
        console.log('没有获取到详情图片链接')
      }

      // 获取主图的链接地址
      const mainDom = $("li.tab-trigger");
      let mainImgs = [];
      for(let i=0;i<mainDom.length;i++){
        mainImgs[i] = JSON.parse($(mainDom[i]).attr('data-imgs')).original;
      }
      // 下载主图
      // mainImgs.forEach((img)=>{
      //   download(img, path, win);
      // });
      win.send('logger', '开始下载详情页主图');
      downInOrder(mainImgs, path, win).then(()=>{
        win.send('logger', '详情页主图下载完成');
      });
    } else if(/detail.1688.com\/pic/.test(link)) {
      // 商品主图
      const mainDom = $(".nav-tabs li.tab-trigger");
      let mainImgs = [];
      for(let i=0;i<mainDom.length;i++){
        mainImgs[i] = $(mainDom[i]).attr('data-img');
      }
      win.send('logger', '开始下载主图');
      downInOrder(mainImgs, path, win).then(()=>{
        win.send('logger', '主图下载完成');
      });
      // 下载主图
      // mainImgs.forEach((img)=>{
      //   download(img, path, win);
      //   });
      // });

    }
        
  }).catch((err)=>{
    win.send('logger', `请求获取HTML出错，原因：${JSON.stringify(err)}`);
  })
}

function download(url, path, win) {
  win.send('logger', `开始下载图片 ${url}`)
  downloadImg(url,path)
    .then(()=>{
      win.send('logger', `图片 ${url} 下载完成`)
    })
    .catch(()=>{
      win.send('logger', `图片 ${url} 下载出错`)
    })
}

/**
 * 并发按顺序下载图片
 * @param {*} urls 要下载的链接数组
 * @param {*} path 要下载到本地的地址
 * @param {*} win win对象
 */
async function downInOrder(urls, path, win) {
  // 并发执行
  const imgPromises = urls.map(async url => {
    try {
      const resp = await downloadImg(url, path);
      return `图片 ${url} 下载完成`;
    } catch (error) {
      return `图片 ${url} 下载出错`;
    }
  })
  // 按顺序输出
  for (const imgPromise of imgPromises) {
    win.send('logger', await imgPromise);
  }
  // win.send('logger', '主图下载完成');
}
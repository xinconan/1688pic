const request = require('request')
const cheerio = require('cheerio')
let url ='https://detail.1688.com/offer/559913701941.html?spm=a2615.2177701.0.0.6b7042765fhpVW'


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
function getHtml(url) {
  option.url = url;
  option.headers.referer = url;
  return new Promise((resolve,reject) => {
    request(option,(error,resp,body)=>{
      if (!error && resp.statusCode == 200) {
        let $ = cheerio.load(body);
        if ($('#loginchina').length) {
          // TODO: 有登录，可能存在一直重定向到登录页面，需要改造
          getHtml(url);
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
function getDetailImages(url){
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
exports.getImageList = function(link){
  getHtml(link).then((html)=>{
    // console.log(html)
    const $ = cheerio.load(html)
    // 商品详情页
    if (/detail.1688.com\/offer/.test(link)) {
      // 获取详情图片的下载链接
      // 需要从服务器获取，链接是data-tfs-url
      // <div id="desc-lazyload-container" class="desc-lazyload-container" data-url="https://laputa.1688.com/offer/ajax/OfferDesc.do" data-tfs-url="https://img.alicdn.com/tfscom/TB1cUizhgvD8KJjSsplXXaIEFXa" data-enable="true">加载中...</div>
      const tfsUrl = $("#desc-lazyload-container").attr('data-tfs-url');
      console.log(tfsUrl)
      if (tfsUrl) {
        // 拿到图片请求的链接，继续请求
        getDetailImages(tfsUrl).then((imgs)=>{
          console.log(imgs)
        }).catch((e)=>{
          console.log(e)
        });
      } else {
        console.log('没有获取到详情图片链接')
      }

      // 获取主图的链接地址
      const mainDom = $("li.tab-trigger");
      let mainImgs = [];
      for(let i=0;i<mainDom.length;i++){
        mainImgs[i] = JSON.parse($(mainDom[i]).attr('data-imgs')).origin;
      }
      console.log('main....')
      console.log(mainImgs)
    } else if(/detail.1688.com\/pic/.test(link)) {
      // 商品主图
      getMainImages(link);
    }
        
  }).catch((err)=>{
    console.log(err)
  })
}

function getMainImages(link) {

}
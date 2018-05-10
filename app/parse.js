const request = require('request')
const cheerio = request('cheerio')
let url ='https://detail.1688.com/offer/559913701941.html?spm=a2615.2177701.0.0.6b7042765fhpVW'


var option = {
  url: url,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
  }
}

request(option,(error,resp,body)=>{
  // console.log(resp)
  if (!error && resp.statusCode == 200) {
    const $ = cheerio.load(body)

    // 获取详情图片的下载链接
    // 需要从服务器获取，链接是data-tfs-url
    // <div id="desc-lazyload-container" class="desc-lazyload-container" data-url="https://laputa.1688.com/offer/ajax/OfferDesc.do" data-tfs-url="https://img.alicdn.com/tfscom/TB1cUizhgvD8KJjSsplXXaIEFXa" data-enable="true">加载中...</div>
    
  }
})


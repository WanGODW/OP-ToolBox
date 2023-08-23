const DELAY_TIME = 200
const REMOVE_TIME = 450

opeationBind('adRemove',(open)=>{
    if(!open){
        return
    }
    log('广告过滤已开启')
    removeDoms(getDoms())
    window.location.host === 'www.baidu.com' && watchAndRemove('baidu')
})

opeationBind('zhihu',(open)=>{
    if(!open){
        return
    }
    log('知乎优化已开启')
    removeDoms(getZhihuDoms(),false)
    watchAndRemove('zhihu',2000, 0)
})

// 监听固定时间，不断清除
function watchAndRemove (type, intervalTime = 1000, times = 10000) {
    var interVal = setInterval(()=>{
        removeDoms(type === 'baidu' ? getDoms(): getZhihuDoms())
    },intervalTime)
    if(times){
        // 监控，清除监控
        setTimeout(()=>{
            window.clearInterval(interVal)
        },times)
    }
}

// 获取想要删除的dom
function getDoms () {
    // bing
    var bingAdDoms = document.getElementsByClassName('b_ad b_adTop')
    var bingDeeplinkDoms = document.getElementsByClassName('b_algo b_vtl_deeplinks')

    // baidu
    var baiduAdDoms = document.querySelectorAll('div[data-appinfo]')
    var baiduAdSmall = document.getElementsByClassName('f13 c-gap-top-xsmall')
    let baiduAdSmallParent = []
    for (let i = 0; i < baiduAdSmall.length; i++) {
        baiduAdSmallParent.push(baiduAdSmall[i].parentElement)
    }
    return [...bingAdDoms, ...baiduAdDoms, ...baiduAdSmallParent, ...bingDeeplinkDoms]
}
function getZhihuDoms(){
    // zhihu
    document.title = '学习'
    var zhihuTitleDom = document.getElementsByClassName('QuestionHeader-title')
    var zhuhuPcCard = document.getElementsByClassName('Pc-card')
    var zhuhuHead = document.querySelectorAll("a[aria-label='知乎']")
    var zhuhiHeadWrap = document.getElementsByClassName('css-nxq4uo')
    var zhuhuHeadButton = document.querySelectorAll('.SearchBar-tool~button')
    var zhuhuHeadButton2 = document.querySelectorAll('.SimpleSearchBar-wrapper~button')
    var QuestionButtonGroup = document.getElementsByClassName('QuestionButtonGroup')

    var zhuhuRight = document.getElementsByClassName('css-1qyytj7')
    var zhuhuRight2 = document.getElementsByClassName('Question-sideColumn')
    var zhihuCenter = document.getElementsByClassName('Topstory-mainColumn')
    var zhihuCenter2 = document.getElementsByClassName('Question-mainColumn')
    var zhihuDetailBottom = document.getElementsByClassName('ContentItem-actions')
    zhihuCenter.length && (zhihuCenter[0].style.width = '100%')
    zhihuCenter2.length && (zhihuCenter2[0].style.width = '100%')
    zhihuDetailBottom.length && (zhihuDetailBottom[0].style.width = '1000px')
    var zhihuButton = document.querySelectorAll('.ContentItem-actions>span')
    var zhihuCenterImg = document.getElementsByClassName('RichContent-cover')
    return [...zhihuTitleDom, ...zhuhuPcCard, ...zhuhuHead, ...zhuhuRight,...zhuhuRight2,...zhihuButton, ...zhihuCenterImg, ...zhuhuHeadButton,...zhuhuHeadButton2,...QuestionButtonGroup,...zhuhiHeadWrap]
}

function removeDoms(all,animate = true){
    if(animate){
        for (let i = 0; i < all.length; i++){
            setTimeout(()=>{
                all[i].style.height = all[i].clientHeight + 'px'
                let className = all[i].getAttribute("class")
                className && all[i].setAttribute("class", className.concat(" go-out"));
                setTimeout(()=>{
                    all[i].remove()
                }, REMOVE_TIME)
            },i * DELAY_TIME)
        }
    }else{
        for (let i = 0; i < all.length; i++){
            all[i].remove()
        }
    }

}

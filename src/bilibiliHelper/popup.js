

console.log('bilibili.js run')
// bind-view
const $bindBottom = $('bind')
const $needBind = $('need-bind')
// user-view
const $userBox = $('user-box')
const $exitBottom = $('exit')
const $level = $('level')
const $name = $('name')
const $avatar = $('avatar')
const $fansCount = $('fans-count')
const $fansCountReal = $('fans-count-real')
const $likeCount = $('like-count')
const $likeCountReal = $('like-count-real')
const $viewCount = $('view-count')
const $viewCountReal = $('view-count-real')
const $bindVideoView = $('bind-video-view')
const $bindVideo = $('bind-video')
const $videoBoxView = $('video-box-view')
const $videoBoxList = $('video-box-list')
const $bindAgain = $('bind-video-box-small')


const $goLink = $('golink')
const $goLink2 = $('golink2')

const $errTipBox = $('error-tip-box')
const $errTip = $('error-tip')

const ERR1 = '绑定失败，请尝试刷新页面或重新打开插件'

init()

function init() {
    goLinkHandle()
    chrome.storage.sync.get(["upUid"], (result) => {
        const uid = result.upUid
        viewUpdate(uid)
        uid ? userViewInit(uid) : bindViewInit()
    })
}

function bindViewInit() {
    bindClickHandle()
}
function userViewInit(uid) {
    getBaseInfo(uid)
    getFansInfo(uid)
    getUserInfo(uid)

    exitClickHandle()
    avatarUpdateHandle(uid)
    chrome.storage.sync.get('videoList', (result) => {
        videoViewInit(result.videoList)
    })
}
function videoViewInit(videoList) {
    videoViewUpdate(videoList && videoList.length)
    setTimeout(() => {
        bindVideoHandle()
    }, 0);
    if (videoList) {
        $bindAgain.style.display = videoList.length === 2 ? 'none' : 'block'
        $videoBoxList.innerText = ''
        videoList.forEach(bv => {
            getVideoInfo(bv)
        });
    }
}

function viewUpdate(uid) {
    $needBind.style.display = uid ? 'none' : 'block'
    $userBox.style.display = uid ? 'block' : 'none'
}
function videoViewUpdate(videoShow) {
    $bindVideoView.style.display = videoShow ? 'none' : 'block'
    $videoBoxView.style.display = videoShow ? 'block' : 'none'
}
function sendMessageToContent(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (callback) callback(response)
        })
    })
}
function $(id) {
    return document.getElementById(id)
}

function bindClickHandle() {
    $bindBottom.addEventListener('click', function () {
        $errTipBox.style.display = 'none'
        sendMessageToContent({ action: 'bindUid' }, (response) => {
            if (response && response.success) {
                chrome.storage.sync.set({ 'upUid': response.data })
                init()
            } else {
                $errTipBox.style.display = 'block'
                $errTip.innerHTML = (response && response.message) ? response.message : ERR1
            }
        })
    })
}
function exitClickHandle() {
    $exitBottom.addEventListener('click', function () {
        chrome.storage.sync.remove(['upUid','userInfo','videoList'])
        init()
    })
}
function avatarUpdateHandle(uid){
    $('avatar-update').addEventListener('click', () => {
        getUserInfo(uid, true)
    })
}
function goLinkHandle() {
    $goLink && $goLink.addEventListener('click', function () {
        window.open('https://www.bilibili.com/')
    })
    $goLink2 && $goLink2.addEventListener('click', function () {
        window.open('https://www.bilibili.com/')
    })
}
function bindVideoHandle() {
    document.querySelectorAll('#bind-video').forEach(node => {
        node.addEventListener('click', function () {
            console.log('bindVideo!!!!!');
            $errTipBox.style.display = 'none'
            sendMessageToContent({ action: 'bindVideo' }, (response) => {
                console.log('response!!!', response);
                if (response && response.success) {
                    const bv = response.data
                    console.log('当前所绑定视频的bv', bv);
                    chrome.storage.sync.get('videoList', (result) => {
                        console.log('已经存在的bvList', result.videoList);
                        if (!result.videoList) {
                            let videoList = []
                            videoList.push(bv)
                            chrome.storage.sync.set({ 'videoList': videoList })
                            getVideoInfo(bv)
                        } else {
                            let videoList = result.videoList
                            if (videoList.includes(bv)) {
                                $errTipBox.style.display = 'block'
                                $errTip.innerHTML = '该视频已经绑定过啦！'
                                return
                            } else {
                                videoList.push(bv)
                                $bindAgain.style.display = videoList.length === 2 ? 'none' : 'block'
                                chrome.storage.sync.set({ 'videoList': videoList })
                                getVideoInfo(bv)
                            }
                        }
                    })

                } else {
                    $errTipBox.style.display = 'block'
                    $errTip.innerHTML = (response && response.message) ? response.message : ERR1
                }
            })
        })
    });
}

function drawVideoInfo(res) {
    const videDom = `<div class="video-item">
<div id="from">
  <img id="from-avatar" src=${res.owner.face} alt="">
  <span id="from-name">${res.owner.name}</span>
</div>
<div id="video-name">${res.title}</div>
<div id="del-video" bv=${res.bvid}>+</div>
<div class="video-info">
  <div class="src-box">
    <img id="video-src" src=${res.pic} bv=${res.bvid}
      alt="">    
  </div>
  <div class="stat-box">
    <div class="stat-item">
      <span class="stat-item-title">播放:</span>
      <span class="stat-item-content">
        <span class="content-handel" id="stat-view-handel">${numHandle(res.stat.view)}</span>
        <span class="content-real" id="stat-view-real">${res.stat.view}</span>
        <span class="change-num-for-video" id="stat-view-change-${res.bvid}"></span>
      </span>
    </div>
    <div class="stat-item">
      <span class="stat-item-title">点赞:</span>
      <span class="stat-item-content">
        <span class="content-handel" id="stat-view-handel">${numHandle(res.stat.like)}</span>
        <span class="content-real" id="stat-view-real">${res.stat.like}</span>
        <span class="change-num-for-video" id="stat-like-change-${res.bvid}"></span>

      </span>
    </div>
    <div class="stat-item">
      <span class="stat-item-title">评论:</span>
      <span class="stat-item-content">
        <span class="content-handel" id="stat-view-handel">${numHandle(res.stat.reply)}</span>
        <span class="content-real" id="stat-view-real">${res.stat.reply}</span>
        <span class="change-num-for-video" id="stat-reply-change-${res.bvid}"></span>

      </span>
    </div>
    <div class="stat-item">
      <span class="stat-item-title">硬币:</span>
      <span class="stat-item-content">
        <span class="content-handel" id="stat-view-handel">${numHandle(res.stat.coin)}</span>
        <span class="content-real" id="stat-view-real">${res.stat.coin}</span>
        <span class="change-num-for-video" id="stat-coin-change-${res.bvid}"></span>
      </span>
    </div>
    <div class="stat-item">
      <span class="stat-item-title">收藏:</span>
      <span class="stat-item-content">
        <span class="content-handel" id="stat-favorite-handel">${numHandle(res.stat.favorite)}</span>
        <span class="content-real" id="stat-favorite-real">${res.stat.favorite}</span>
        <span class="change-num-for-video" id="stat-favorite-change-${res.bvid}"></span>
      </span>
    </div>
    <div class="stat-item">
      <span class="stat-item-title">分享:</span>
      <span class="stat-item-content">
        <span class="content-handel" id="stat-view-handel">${numHandle(res.stat.share)}</span>
        <span class="content-real" id="stat-share-real">${res.stat.share}</span>
        <span class="change-num-for-video" id="stat-share-change-${res.bvid}"></span>
      </span>
    </div>
  </div>
</div>
</div>`
    // <div className="stat-item">
    //       <span className="stat-item-title">弹幕:</span>
    //       <span className="stat-item-content">
    //         <span className="content-handel" id="stat-view-handel">${numHandle(res.stat.danmaku)}</span>
    //         <span className="content-real" id="stat-danmaku-real">${res.stat.danmaku}</span>
    //         <span className="change-num-for-video" id="stat-danmaku-change-${res.bvid}"></span>
    //       </span>
    //     </div>
    const videoItem = document.createElement('div')
    videoItem.id = res.bvid
    videoItem.innerHTML = videDom
    $videoBoxList.appendChild(videoItem)
    videoViewUpdate(true)
    setTimeout(() => {
        delVideoHandle()
        videoItemHandle()
        computeChange(`stat-view-change-${res.bvid}`, `stat-view-change-${res.bvid}`, res.stat.view)
        computeChange(`stat-like-change-${res.bvid}`, `stat-like-change-${res.bvid}`, res.stat.like)
        computeChange(`stat-reply-change-${res.bvid}`, `stat-reply-change-${res.bvid}`, res.stat.reply)
        computeChange(`stat-coin-change-${res.bvid}`, `stat-coin-change-${res.bvid}`, res.stat.coin)
        computeChange(`stat-favorite-change-${res.bvid}`, `stat-favorite-change-${res.bvid}`, res.stat.favorite)
        computeChange(`stat-danmaku-change-${res.bvid}`, `stat-danmaku-change-${res.bvid}`, res.stat.danmaku)
        computeChange(`stat-share-change-${res.bvid}`, `stat-share-change-${res.bvid}`, res.stat.share)
    }, 0);
}

function videoItemHandle() {
    document.querySelectorAll('#video-src').forEach(node => {
        node.addEventListener('click', function (e) {
            const bv = e.target.attributes.bv.nodeValue
            window.open(`https://www.bilibili.com/video/${bv}`)
        })
    });
}

function delVideoHandle() {
    document.querySelectorAll('#del-video').forEach(node => {
        node.addEventListener('click', function (e) {
            const bv = e.target.attributes.bv.nodeValue
            chrome.storage.sync.get('videoList', (result) => {
                let videoList = result.videoList
                $bindAgain.style.display = videoList.length === 2 ? 'none' : 'block'
                videoList = videoList.filter((video) => {
                    return video !== bv
                })
                chrome.storage.sync.set({ 'videoList': videoList })
                $(bv).remove()
                videoViewUpdate(videoList && videoList.length)
            })

        })
    });
}

function computeChange(name, domName, newValue) {
    // 默认domName作为storage的key
    chrome.storage.sync.get([name], (result) => {
        if (result[name]) {
            let oldValue = result[name]
            let change = newValue - oldValue
            if ($(domName) && change !== 0) {
                $errTipBox.style.display = 'none'
                $(domName).innerHTML = change > 0 ? `+${change}` : change
                $(domName).classList.add(change > 0 ? 'change-up' : 'change-down')
                $errTipBox.style.display = 'block'
                $errTip.innerHTML = '数据有更新哦~'
            }

        }
        chrome.storage.sync.set({ [name]: newValue })
    })
}

function getBaseInfo(mid) {
    $fetch(`https://api.bilibili.com/x/space/upstat?mid=${mid}&jsonp=jsonp`).then((res) => {
        $viewCount.innerHTML = numHandle(res.archive.view)
        $viewCountReal.innerHTML = res.archive.view
        $likeCount.innerHTML = numHandle(res.likes)
        $likeCountReal.innerHTML = res.likes
        computeChange(`view-count-change-${mid}`, 'view-count-change', res.archive.view)
        computeChange(`like-count-change-${mid}`, 'like-count-change', res.likes)
    }).catch((err) => {
        console.log('getBaseInfo ERR', err);
    })
}

function getFansInfo(mid) {
    $fetch(`https://api.bilibili.com/x/relation/stat?vmid=${mid}&jsonp=jsonp`).then((res) => {
        $fansCount.innerHTML = numHandle(res.follower)
        $fansCountReal.innerHTML = res.follower
        computeChange(`fans-count-change-${mid}`, 'fans-count-change', res.follower)
    }).catch((err) => {
        console.log('getFansInfo ERR', err);
    })
}

function getUserInfo(mid, updateForce = false) {
    chrome.storage.sync.get('userInfo',(result)=>{
        let userInfo = null
        if(result.userInfo && !updateForce){
            userInfo = result.userInfo
            $level.innerHTML = `LV${userInfo.level}`
            $name.innerHTML = userInfo.name
            $avatar.src = userInfo.avatar
            // if(userInfo.pendant){
            //     $('avatar-border').src = userInfo.pendant
            //     $('avatar-border').style.visibility = 'visible'
            // }
            if(userInfo.vipUrl){
                $('vip-show').src = userInfo.vipUrl
                $('vip-show-box').style.visibility = 'visible'
            }
            // if(userInfo.topPhoto){
            //     $('base-info-flex').style.backgroundImage = `url(${userInfo.topPhoto})`
            // }

        }else{
            updateForce && sendMessage('更新中...')
            $fetch(`https://api.bilibili.com/x/space/acc/info?mid=${mid}&jsonp=jsonp`).then((res, result) => {
                if(res){
                    $level.innerHTML = `LV${res.level}`
                    $name.innerHTML = res.name
                    $avatar.src = res.face
                    // if(res.pendant.image_enhance){
                    //     $('avatar-border').src = res.pendant.image_enhance
                    //     $('avatar-border').style.visibility = 'visible'
                    // }
                    if(res.vip.label.img_label_uri_hans_static){
                        $('vip-show').src = res.vip.label.img_label_uri_hans_static
                        $('vip-show-box').style.visibility = 'visible'
                    }
                    // if(res.top_photo){
                    //     $('base-info-flex').style.backgroundImage = `url(${res.top_photo})`
                    // }
                    userInfo = {
                        level: res.level,
                        name: res.name,
                        avatar: res.face,
                        vipUrl: res.vip.label.img_label_uri_hans_static,
                        pendant: res.pendant.image_enhance,
                        topPhoto: res.top_photo,
                    }
                    chrome.storage.sync.set({ userInfo : userInfo })
                    updateForce && sendMessage('更新成功')
                }else {
                    if(updateForce){
                        updateForce && sendMessage('更新失败，请稍后再试')
                    }
                }
            }).catch((err) => {
                console.log('getUserInfo ERR', err);
            })
        }

    })

}

function getVideoInfo(bv) {
    $fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`).then((res) => {
        drawVideoInfo(res)
    }).catch((err) => {
        console.log('getVideoInfo ERR', err);
    })
}

function $fetch(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                "Content-type": "application/json;charset=UTF-8"
            },
            referrerPolicy: 'no-referrer',
            method: "GET"
        })
            .then(data => {
                return data.json()
            })
            .then(res => {
                resolve(res.data, res)
            })
            .catch(error => {
                reject(error)
            })
    })
}


function numHandle(n) {
    let num = +n
    if (num > 10000) {
        return (num / 10000).toFixed(1) + 'w'
    }
    return num

}

function sendMessage(msg){
    $errTipBox.style.display = 'none'
    setTimeout(()=>{
        $errTip.innerHTML = msg
        $errTipBox.style.display = 'block'
    },0)
}

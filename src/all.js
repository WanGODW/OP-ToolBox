load()
function load() {
    fontFamilyHandle()

    opeationBind('opStart',(open)=>{
        if(!open){
            return
        }
        window.location.href = 'https://www.yuanshen.com/#/'
    })

    opeationBind('imageMagic',(open)=>{
        if(!open){
            return
        }
        imageMagic()
        setInterval(()=>{
            imageMagic()
        },2000)
    })

    opeationBind('countdown',(open)=>{
        const countDownTime = {}
        open && log('倒计时已开启')
        open && countDownInit(countDownTime)
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                // 内容变更
                if(request.countTime){
                    createTimeDom(request.countTime,countDownTime)
                }
                if(request.countdownSwitch === true){
                    countDownInit(countDownTime)
                }
                if(request.countdownSwitch === false){
                    countDownDestory(countDownTime)
                }
                if(request.needUpdate){
                    opeationBind('countdown',(open)=>{
                        countDownDestory(countDownTime)
                        if(open){
                            countDownInit(countDownTime)
                        }
                    })
                }
            })
    })

    opeationBind('noteBook',(open)=>{
        open && log('记事本已开启')
        open && noteBookInit()
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                const dom = document.getElementById('opNoteBook')
                const textDom = document.getElementById('noteBookTextarea')
                if(request.noteBookValue){
                    textDom.value = request.noteBookValue
                    dom.style.animation = 'blink 3s'
                }
                if(request.noteBookColor){
                    dom.style.color = request.noteBookColor
                }
                if(request.noteBookShadowColor){
                    dom.style.textShadow = `0 1px ${request.noteBookShadowColor}`
                }
                if(request.noteBookFontSize){
                    dom.style.fontSize = request.noteBookFontSize + 'px'
                    dom.style.lineHeight = (Number(request.noteBookFontSize) + 6) + 'px'
                }
                if(request.noteBookInit){
                    dom.style.width = '100px'
                    dom.style.height = '80px'
                    dom.style.left = '10px'
                    dom.style.top = '10px'
                    dom.className += ' blink-active'
                    chrome.storage.sync.set({
                        noteBookPosition : {
                            x: Number(dom.style.left.split('px')[0]),
                            y: Number(dom.style.top.split('px')[0])
                        }
                    })
                    chrome.storage.sync.set({
                        noteBookSize :{
                            width: dom.clientWidth,
                            height: dom.clientHeight
                        }
                    })
                }
                if(request.noteBookSwitch === true){
                    noteBookInit()
                }
                if(request.noteBookSwitch === false){
                    noteBookDestory()
                }
                if(request.needUpdate){
                    opeationBind('noteBook',(open)=>{
                        noteBookDestory()
                        if(open){
                            noteBookInit()
                        }
                    })
                }
                if(request.noteBookBackGroundBlur !== undefined){
                    dom.style.backgroundColor = request.noteBookBackGroundBlur ? '#23232378' : 'transparent'
                    dom.style.backdropFilter = request.noteBookBackGroundBlur ? 'blur(1.5px)' : 'blur(0)'
                }
            }
        );
    })

    const opOberserver = document.createElement('span')
    opOberserver.style.display = 'none'
    opOberserver.id = 'opOberserver'
    document.body.appendChild(opOberserver)
    opOberserver.addEventListener('DOMNodeRemoved',function(e) {
        load()
    });
}

function noteBookInit(){
    if(document.getElementById('opNoteBook')){
        return
    }
    chrome.storage.sync.get(['noteBookValue','noteBookColor', 'noteBookShadowColor', 'noteBookPosition', 'noteBookSize' , 'noteBookFontSize', 'noteBookBackGroundBlur'],function (result){
        var dom = document.createElement('div')
        dom.className = 'note-book-box'
        dom.id = 'opNoteBook'
        dom.style.color = result.noteBookColor
        dom.style.textShadow = `0 1px ${result.noteBookShadowColor}`
        var textDom = document.createElement('textarea')
        textDom.id = 'noteBookTextarea'
        textDom.className = 'note-book-textarea'
        textDom.value = result.noteBookValue || '请编辑内容'
        dom.appendChild(textDom)
        const dragDom = dragSizeHandle(dom)
        noteBookMouseHandle(dom, dragDom, textDom)
        if (result.noteBookSize) {
            dom.style.width = result.noteBookSize.width + 'px'
            dom.style.height = result.noteBookSize.height + 'px'
            dom.style.fontSize = (result.noteBookFontSize || 14) + 'px'
            dom.style.lineHeight = (result.noteBookFontSize ? (Number(result.noteBookFontSize) + 6) : 14) + 'px'
        }
        if (result.noteBookPosition) {
            dom.style.left = result.noteBookPosition.x + 'px'
            dom.style.top = result.noteBookPosition.y + 'px'
        }
        if(result.noteBookBackGroundBlur !== undefined){
            dom.style.backgroundColor = result.noteBookBackGroundBlur ? '#23232378' : 'transparent'
            dom.style.backdropFilter = result.noteBookBackGroundBlur ? 'blur(1.5px)' : 'blur(0)'
        }
        document.body.appendChild(dom)
    })
}
function noteBookDestory(){
    document.getElementById('opNoteBook') && document.getElementById('opNoteBook').remove()
}
function noteBookMouseHandle(dom, dargDom, textDom){
    let boxMouseDown = false
    let dragMouseDown = false
    let domStartPos = {
        x:0,
        y:0
    }
    let domStartSize = {
        width: 0,
        height: 0
    }
    let mouseStart = {
        x: 0,
        y:0
    }
    let mouseOffset = {
        x: 0,
        y: 0
    }
    dom.addEventListener('mousedown',(e)=>{
        if(dragMouseDown){
            return
        }
        boxMouseDown = true
        domStartPos.x = Number(dom.style.left.split('px')[0])
        domStartPos.y = Number(dom.style.top.split('px')[0])
    })
    document.body.addEventListener('mousedown',(e)=>{
        mouseStart.x = e.clientX
        mouseStart.y = e.clientY
    })
    document.body.addEventListener('mouseup',()=>{
        if(boxMouseDown){
            chrome.storage.sync.set({
                noteBookPosition : {
                    x: Number(dom.style.left.split('px')[0]),
                    y: Number(dom.style.top.split('px')[0])
                }
            })
        }
        if(dragMouseDown){
            chrome.storage.sync.set({
                noteBookSize :{
                    width: dom.clientWidth,
                    height: dom.clientHeight
                }
            })
        }
        boxMouseDown = false
        dragMouseDown = false
    })
    document.body.addEventListener('mousemove',(e)=>{
        if(boxMouseDown){
            mouseOffset.x = e.clientX - mouseStart.x
            mouseOffset.y = e.clientY - mouseStart.y
            dom.style.left = domStartPos.x + mouseOffset.x + 'px'
            dom.style.top = domStartPos.y + mouseOffset.y + 'px'
        }
        if(dragMouseDown){
            mouseOffset.x = e.clientX - mouseStart.x
            mouseOffset.y = e.clientY - mouseStart.y
            dom.style.width = domStartSize.width + mouseOffset.x + 'px'
            dom.style.height = domStartSize.height + mouseOffset.y + 'px'
        }
    })
    dargDom.addEventListener('mousedown',() => {
        dragMouseDown = true
        domStartSize.width = dom.clientWidth
        domStartSize.height = dom.clientHeight
    })
    textDom.addEventListener('input',(e)=>{
        chrome.storage.sync.set({
            noteBookValue : e.target.value
        })
    })
    dom.addEventListener("animationend",function(){
        dom.style.animation = ''
    });
}

function dragSizeHandle(dom){
    const dragDom = document.createElement('div')
    dragDom.className = 'note-book-drag'
    dom.appendChild(dragDom)
    return dragDom
}

function countDownInit(timer){
    if(document.getElementById('timeWarp')){
        return
    }
    chrome.storage.sync.get('countTime',function (result){
        if(result.countTime){
            const timeWarpDom = document.createElement('div')
            timeWarpDom.id = 'timeWarp'
            timeWarpDom.className = 'time-warp'
            document.body.appendChild(timeWarpDom)
            for (const key in result.countTime) {
                createTimeDom(result.countTime[key],timer)
            }
        }
    })
}
function countDownDestory(timer){
    clearInterval(timer)
    document.getElementById('timeWarp') && document.getElementById('timeWarp').remove()
}
function createTimeDom(timeObj,timer){
    const timeBoxDom = document.getElementById('countdown-box' + timeObj.key)
    if(timeBoxDom && timeObj.time === ''){
        timeBoxDom.remove()
        clearInterval(timer[timeObj.key])
    }
    const splitTime = timeObj.time.split(':')
    if(splitTime.length > 1 && splitTime.every(time=> !Number.isNaN(Number(time)))){
        if(timeBoxDom){
            document.getElementById('countdown-box-title' + timeObj.key).innerText = timeObj.title
        }else{
            var timeBox = document.createElement('div')
            timeBox.className = 'countdown-box akrobat-black'
            timeBox.id = 'countdown-box' + timeObj.key
            var titleDom = document.createElement('span')
            titleDom.innerText = timeObj.title
            titleDom.id = 'countdown-box-title' + timeObj.key
            titleDom.className = 'countdown-box-title'
            timeBox.appendChild(titleDom)
            var textDom = document.createElement('span')
            textDom.className = 'countdown-box-text'
            textDom.id = 'countdown-box-text' + timeObj.key
            timeBox.appendChild(textDom)
            document.getElementById('timeWarp').appendChild(timeBox)
        }
        clearInterval(timer[timeObj.key])
        timer[timeObj.key] = setInterval(() => {
            var endH = 0
            var endM = 0
            var endS = 0
            splitTime[0] && (endH = splitTime[0])
            splitTime[1] && (endM = splitTime[1])
            splitTime[2] && (endS = splitTime[2])
            refreshCountTime(document.getElementById('countdown-box-text' + timeObj.key), getCountTime(endH,endM,endS,timeObj.title))

        },1000)
    }

}
function refreshCountTime(dom, timeObj) {
    if(!dom){
        return
    }
    dom.innerText = timeObj.h +':'+ timeObj.m +':'+ timeObj.s
    if(!timeObj.overTime && Number(timeObj.h) <= 1){
        dom.style.color = '#82c482'
    } else if(timeObj.overTime){
        dom.style.color = '#b03030'
        dom.innerText = '+' + dom.innerText
    } else {
        dom.style.color = 'beige'
    }
}
function getCountTime(endH,endM,endS,title) {
    var todayEnd = new Date().setHours(endH,endM,endS)
    var now = new Date().getTime()
    var x = todayEnd - now
    var overTime = x <= 0
    var allSeconds = Math.floor(Math.abs(x) / 1000);
    var h = Math.floor(allSeconds / 60 / 60 % 24);
    var m = Math.floor(allSeconds / 60 % 60);
    var s = Math.floor(allSeconds % 60);
    if(h === 0 && m === 0 && s === 0){
        chrome.storage.sync.get('countDownDeskTopNotifi',(result)=>{
            if(result.countDownDeskTopNotifi){
                chrome.runtime.sendMessage({countDownComplete: {
                    time: `${endH}:${endM}:${endS}`,
                    title: title,
                }});
            }
        })

    }
    return {
        overTime: overTime,
        h: h < 10 ? '0' + h : h,
        m: m < 10 ? '0' + m : m,
        s: s < 10 ? '0' + s : s
    }
}

function imageMagic () {
    const allDom = document.getElementsByTagName('img')
    for (let i = 0; i < allDom.length; i++) {
        var className = allDom[i].getAttribute("class")
        if(className && className.includes('image-magic')){
            continue
        }
        allDom[i].setAttribute("class",className ? className.concat(" image-magic") : 'image-magic');
    }
}

function fontFamilyHandle(){
    var fontUrl = chrome.runtime.getURL("/fonts/Akrobat-Black.otf");
    var prefont = new FontFace('Akrobat-Black', 'url('+fontUrl+')');
    prefont.load().then(function (loadFace){
        document.fonts.add(loadFace);
    }).catch(function (e){
        console.log('数字字体加载失败',e)
    })
    var fontUrl2 = chrome.runtime.getURL("/fonts/SmileySans-Oblique.otf");
    var prefont2 = new FontFace('smiley-sans', 'url('+fontUrl2+')');
    prefont2.load().then(function (loadFace){
        document.fonts.add(loadFace);
    }).catch(function (e){
        console.log('汉字字体加载失败',e)
    })
}

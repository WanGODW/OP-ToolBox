onload = function (){
    initValue()
    importBHelper()
    if(Number(new Date().getTime().toString().slice(-1)) < 3){
        $('openBox').style.display = 'flex'
        setTimeout(()=>{
            $('openBox').innerHTML = ''
            $('openBox').className = ''
        },3000)
    }


    // 初始化回显checkbox勾选，并绑定checkbox点击事件
    function initValue(){
        const idList = []
        const inputDom = document.getElementsByTagName('input')
        for (let i = 0; i < inputDom.length; i++) {
            const dom = inputDom[i]
            if(dom.type === 'checkbox' && dom.parentNode.className === 'op-ck'){
                idList.push(dom.id)
                // 绑定
                addCheckBoxWatch(dom.id)
            }
        }
        // 回显
        idList.length && chrome.storage.sync.get(idList,function (result){
            for (const domId in result) {
                $(domId) && ($(domId).checked = result[domId])
                $(domId).checked && ($(domId).parentNode.parentNode.className += ' selected')
                if($(domId).checked){
                    checkBoxTrueHandle(domId)
                }
            }
        })
    }

    // 绑定勾选框点击事件
    function addCheckBoxWatch (bindName) {
        $(bindName).addEventListener('change', async (e) => {
            chrome.storage.sync.set({ [bindName]: e.target.checked })
            $(bindName).parentNode.parentNode.className = 'op-item' + (e.target.checked ? ' selected' : '')
            if(e.target.checked){
                checkBoxTrueHandle(bindName)
            }else{
                checkedFalseHandle(bindName)
            }
        })
    }

    function $(id) {
        return document.getElementById(id)
    }

    // 回显隐藏菜单内的内容
    function checkBoxTrueHandle(domId) {
         switch (domId){
             case 'countdown':
                 sendMessage('countdownSwitch', true)
                 countTimeHandle()
                 break
             case 'noteBook':
                 sendMessage('noteBookSwitch', true)
                 noteBookHandle()
                 break
             case 'popupBackGround':
                 popupBackGroundHandle()
             default:
                 break
         }
     }

     function checkedFalseHandle(domId) {
         switch (domId){
             case 'countdown':
                 sendMessage('countdownSwitch', false)
                 break
             case 'noteBook':
                 sendMessage('noteBookSwitch', false)
                 break
             case 'popupBackGround':
                 $('bk-video').style.display = 'none'
                 break
             default:
                 break
         }
     }

    function countTimeHandle(){
        const inputDoms = document.getElementsByClassName('custom-time-input')
        const titleDoms = document.getElementsByClassName('custom-time-title')
        // get
        chrome.storage.sync.get(['countTime', 'countDownDeskTopNotifi'],(result)=>{
            if(result.countTime){
                for (const countTimeKey in result.countTime) {
                    const data = result.countTime[countTimeKey]
                    document.body.querySelector(".custom-time-input[key='" + data.key + "']").value = data.time
                    document.body.querySelector(".custom-time-title[key='" + data.key + "']").value = data.title
                }
            } else{
                let newCountTime = {}
                for (let i = 0; i < inputDoms.length; i++) {
                    if(inputDoms[i].value){
                        const domKey = inputDoms[i].getAttribute('key')
                        newCountTime[domKey] = {
                            key: domKey,
                            title: titleDoms[i].value,
                            time: inputDoms[i].value
                        }
                    }
                }
                chrome.storage.sync.set({ countTime : newCountTime })
            }

            if(result.countDownDeskTopNotifi !== undefined){
                $('countDownDeskTopNotifi').checked = result.countDownDeskTopNotifi
            }else{
                $('countDownDeskTopNotifi').checked = true
            }
        })

        // watch
        for (let i = 0; i < inputDoms.length; i++) {
            const domKey = inputDoms[i].getAttribute('key')
            inputDoms[i].addEventListener('input', function (e){
                const data = {
                    key: domKey,
                    title: titleDoms[i].value,
                    time: e.target.value
                }
                chrome.storage.sync.get('countTime',(result)=>{
                    let countTimeObj = {}
                    if(result.countTime){
                        countTimeObj = result.countTime
                    }
                    countTimeObj[domKey] = data
                    chrome.storage.sync.set({ countTime : countTimeObj })
                    sendMessage('countTime', data)
                })
            })
        }

        // watch
        for (let i = 0; i < titleDoms.length; i++) {
            const domKey = titleDoms[i].getAttribute('key')
            titleDoms[i].addEventListener('input', function (e){
                const data = {
                    key: domKey,
                    title: e.target.value,
                    time: inputDoms[i].value,
                }
                chrome.storage.sync.get('countTime',(result)=>{
                    let countTimeObj = {}
                    if(result.countTime){
                        countTimeObj = result.countTime
                    }
                    countTimeObj[domKey] = data
                    chrome.storage.sync.set({ countTime : countTimeObj })
                    sendMessage('countTime', data)
                })
            })
        }

        $('countDownDeskTopNotifi').addEventListener('change', async (e) =>{
            sendMessage('countDownDeskTopNotifi',e.target.checked)
            chrome.storage.sync.set({ countDownDeskTopNotifi : e.target.checked })
        })
    }
    function noteBookHandle(){
        $('noteBookValue').addEventListener('input', async (e) => {
            chrome.storage.sync.set({ noteBookValue : e.target.value })
            sendMessage('noteBookValue',e.target.value)
        })
        $('noteBookColor').addEventListener('input', async (e) => {
            chrome.storage.sync.set({ noteBookColor : e.target.value })
            noteBookHistorySave(e.target.value)
            sendMessage('noteBookColor',e.target.value)
        })
        $('noteBookShadowColor').addEventListener('input', async (e) => {
            chrome.storage.sync.set({ noteBookShadowColor : e.target.value })
            noteBookHistorySave(e.target.value)
            sendMessage('noteBookShadowColor',e.target.value)
        })
        $('noteBookShadowColorClear').addEventListener('click', async (e) => {
            chrome.storage.sync.set({ noteBookShadowColor : 'transparent' })
            sendMessage('noteBookShadowColor', 'transparent')
        })

        $('noteBookFontSize').addEventListener('input', async (e)=> {
            chrome.storage.sync.set({ noteBookFontSize : e.target.value })
            sendMessage('noteBookFontSize',e.target.value)
        })
        $('noteBookInit').addEventListener('click', async (e) =>{
            sendMessage('noteBookInit',true)
        })

        $('colorHistory').addEventListener('click',  (e) =>{
            if( e.target.className === 'color-history-item' ){
                const selectedColor = e.target.getAttribute('color')
                $('noteBookColor').value = selectedColor
                chrome.storage.sync.set({ noteBookColor : selectedColor })
                $('noteBookShadowColor').value = selectedColor
                chrome.storage.sync.set({ noteBookShadowColor : selectedColor })
                sendMessage('noteBookColor', selectedColor)
                sendMessage('noteBookShadowColor',selectedColor)
            }
        })

        $('noteBookBackGroundBlur').addEventListener('change', async (e) =>{
            sendMessage('noteBookBackGroundBlur',e.target.checked)
            chrome.storage.sync.set({ noteBookBackGroundBlur : e.target.checked })
        })

        chrome.storage.sync.get(['noteBookValue','noteBookColor', 'noteBookFontSize', 'noteBookShadowColor', 'noteBookHistoryColor', 'noteBookBackGroundBlur'],function (result){
            if(result.noteBookValue){
                $('noteBookValue').value = result.noteBookValue
            }
            if(result.noteBookColor){
                $('noteBookColor').value = result.noteBookColor
            }
            if(result.noteBookFontSize){
                $('noteBookFontSize').value = result.noteBookFontSize
            }
            if(result.noteBookShadowColor){
                $('noteBookShadowColor').value = result.noteBookShadowColor
            }
            if(result.noteBookHistoryColor){
                noteBookHistoryUpdate(result.noteBookHistoryColor)
            }
            if(result.noteBookBackGroundBlur !== undefined){
                $('noteBookBackGroundBlur').checked = result.noteBookBackGroundBlur
            }
        })
    }
    function popupBackGroundHandle(){
        function videoPlayHandle(radiovalue) {
            const videoMap = {
                1: 'keqing.mp4',
                2: 'youla.mp4'
            }
            if(radiovalue === 0){
                $('bk-video').style.display = 'none'
            }else{
                $('bk-video').style.display = 'block'
                $('bk-video').setAttribute('src','../movie/' + videoMap[radiovalue])
            }
        }
        $('popupBackGroundRadioBox').addEventListener('click', (e) => {
            if(e.target.tagName === 'INPUT'){
                const radiovalue = Number(e.target.value)
                chrome.storage.sync.set({ popupBackGroundRadio : radiovalue })
                videoPlayHandle(radiovalue)
            }
        })
        chrome.storage.sync.get('popupBackGroundRadio',function (result){
            if(result.popupBackGroundRadio !== undefined){
                const radiovalue = Number(result.popupBackGroundRadio)
                const radios = document.querySelectorAll('input[name=popupBackGroundRadio]')
                for (let i = 0; i < radios.length; i++) {
                    if(Number(radios[i].value) === radiovalue){
                        radios[i].checked = true
                    }
                }
                videoPlayHandle(radiovalue)
            }
        })
    }
    async function sendMessage(key,value){
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        try {
            await chrome.tabs.sendMessage(tab.id, {[key]: value});
        }catch (e) {
            console.log(e)
        }
    }

    function noteBookHistorySave(color){
        chrome.storage.sync.get('noteBookHistoryColor', (result)=>{
            let noteBookHistoryColor = []
            if(result.noteBookHistoryColor){
                noteBookHistoryColor = result.noteBookHistoryColor
            }
            if(noteBookHistoryColor.length >= 7){
                noteBookHistoryColor = noteBookHistoryColor.slice(0, 6)
            }
            noteBookHistoryColor.unshift(color)
            chrome.storage.sync.set({ noteBookHistoryColor : noteBookHistoryColor})
            noteBookHistoryUpdate(noteBookHistoryColor)
        })
    }

    function noteBookHistoryUpdate(colorList){
        $('colorHistory').innerHTML = ''
        let html = ''
        for (let i = 0; i < colorList.length; i++) {
            html += `<div class="color-history-item" color="${colorList[i]}" style="background-color: ${colorList[i]}"></div>`
        }
        $('colorHistory').innerHTML = html
    }

    function importBHelper(){
        var JSElement=document.createElement("script");
        JSElement.setAttribute("type","text/javascript");
        JSElement.setAttribute("src","./bilibiliHelper/popup.js");
        document.body.appendChild(JSElement);
    }
}

chrome.tabs.onActivated.addListener( async function(activeInfo) {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        if(tab.id === activeInfo.tabId && tab.url !== 'chrome://extensions/'){
            try {
                await chrome.tabs.sendMessage(tab.id, {needUpdate: true});
            } catch (e) {
                console.log(e)
            }
        }
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.countDownComplete){
        chrome.notifications.clear('countDownNotifi',()=>{
            chrome.notifications.create('countDownNotifi', {
                contextMessage: request.countDownComplete.title,
                iconUrl:'../img/new-logo.png',
                title:'OP-ToolBox',
                type:'basic',
                message: request.countDownComplete.time,
            })
        })
    }
})

chrome.runtime.onMessage.addListener((request, sender, senderResponse) => {
    const action = request.action
    if (action === 'bindUid') {
        bindUid(senderResponse)
    } else if (action === 'bindVideo') {
        bindVideo(senderResponse)

    }
})
function bindUid(senderResponse) {
    if (window.location.href.includes('bilibili.')) {
        let find = ''
        for (const key in localStorage) {
            if (key.indexOf('im_floatmsg') !== -1) {
                find = localStorage[key]
            }
        }
        senderResponse({ data: find ? JSON.parse(find).uid : 0, success: !!find, message: '' })
    } else {
        senderResponse({ data: 0, success: false, message: '绑定失败，请确保已经打开bilibili哦' })
    }
}
function bindVideo(senderResponse) {
    const url = window.location.href
    if (!url.includes('bilibili.')) {
        senderResponse({ data: 0, success: false, message: '绑定失败，请确保已经打开bilibili哦' })
    } else if (!url.includes('video/BV')) {
        senderResponse({ data: 0, success: false, message: '绑定失败，目前只支持BV号视频的绑定' })
    } else {
        const rule = /(video\/BV)\S+\//gm
        let match = url.match(rule)
        let bv = match[0].split('/')[1]
        senderResponse({ data: bv, success: true, message: '' })
    }
}

// 绑定对应功能的后续执行操作
function opeationBind (bindName,callback) {
    chrome.storage.sync.get(bindName,function (result){
        callback(result[bindName])
    })
}

function log (string){
    console.log('%c'+ string, 'color: #5d67ff; font-size: 16px; background: #ffe514')
}

function mCallback(mutationsList, observer) {
    console.log(mutationsList);
    console.log(observer);
    console.log(111111111);
}

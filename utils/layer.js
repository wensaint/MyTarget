//#region tips
function showModal(title, content, isCanCancle, doSuccess) {
  wx.showModal({
    title: title || '加载失败',
    content: content || '未知错误',
    showCancel: isCanCancle || false,
    success: function (res) {      
      if (res.cancel){return}
      else if (typeof doSuccess == "function") {        
        doSuccess(res);
      }
      wx.hideToast()
    }
  });
}

function showLoadToast(title, duration) {
  wx.showToast({
    title: title || '加载中',
    icon: 'loading',
    mask: true,
    duration: duration || 10000
  });
}
//#endregion

module.exports = {
  showModal: showModal,
  showLoadToast: showLoadToast
}
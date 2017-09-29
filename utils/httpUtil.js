//#region  http
//get
function ajaxGet(url, postData, doSuccess, doFail, doComplete) {
  var opts = {
    url: url,
    method: 'GET',
    header: { Authorization: 'Basic ' + wx.getStorageSync('_apiToken') },
    success: function (res) {
      if (typeof doSuccess == "function") {
        doSuccess(res);
      }
    },
    fail: function () {
      if (typeof doFail == "function") {
        doFail();
      }
    },
    complete: function () {
      wx.hideToast();
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      if (typeof doComplete == "function") {
        doComplete();
      }
    }
  };
  if (postData != null && postData != undefined) {
    opts.data = { query: JSON.stringify(postData) };
  }
  wx.request(opts);
}

//post
function ajaxPost(url, postData, doSuccess, doFail, doComplete) {
  wx.request({
    url: url,
    data: JSON.stringify(postData),
    method: 'POST',
    header: { Authorization: 'Basic ' + wx.getStorageSync('_apiToken') },
    success: function (res) {
      if (typeof doSuccess == "function") {
        doSuccess(res);
      }
    },
    fail: function () {
      if (typeof doFail == "function") {
        doFail();
      }
    },
    complete: function () {
      wx.hideToast();
      if (typeof doComplete == "function") {
        doComplete();
      }
    }
  });
}

//delete
function ajaxDelete(url, doSuccess, doFail, doComplete) {
  wx.request({
    url: url,
    method: 'DELETE',
    header: { Authorization: 'Basic ' + wx.getStorageSync('_apiToken') },
    success: function (res) {
      if (typeof doSuccess == "function") {
        doSuccess(res);
      }
    },
    fail: function () {
      if (typeof doFail == "function") {
        doFail();
      }
    },
    complete: function () {
      wx.hideToast();
      if (typeof doComplete == "function") {
        doComplete();
      }
    }
  });
}
//#endregion

module.exports = {
  ajaxGet: ajaxGet,
  ajaxPost: ajaxPost,
  ajaxDelete: ajaxDelete
}
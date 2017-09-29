//index.js
//获取应用实例
var app = getApp(), page = 1, num = 10, allload = false
Page({
  data: {
    userID: null,
    count:0,
    list: [],
    base: {
      copyright: app.conf._copyright,
      emptyTip: '暂无已完成目标'
    }
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    if (wx.getStorageSync('_userdata')) {
      that.setData({ userID: wx.getStorageSync('_userdata').id })
    }
    else {
      wx.redirectTo({
        url: '../welcome/welcome'
      })
    }  
  },
  onShow: function () {
    var that = this
    if (wx.getStorageSync('_userdata')) {
      that.loadList()
    }
  },

  onPullDownRefresh: function () {
    this.loadList()
  },

  onReachBottom: function () {
    if (!allload) { this.loadList() }
  },

  onShareAppMessage: function () {
    return {
      title: '小目标',
      desc: "从今天开始，每天给自己树立一个小目标",
      path: 'pages/index/index'
    }
  },

  loadList: function () {
    var that = this
    wx.showNavigationBarLoading()
    app.util.http.ajaxGet(
      app.conf._serverUrl + 'api/activities/',
      { page: page, size: num, Status: 'int+1', ParentID: 0, CustomerID: app.util.toInt64(that.data.userID) },
      function (res) {
        if (res.statusCode == 200) {
          var obj = JSON.parse(res.data)
          that.setData({ count:obj.num})
          if (obj.num <= page * num) {
            allload = true
          }
          else { page++ }
          if (page == 1) {
            that.setData({ list: obj.datas })
          }
          else {
            that.setData({ list: that.data.list.concat(obj.datas) })
          }
        }
      }
    )
  },

  //事件处理函数
  bindViewTap: function (e) {
    app.saveFormID(e.detail.formId)  //save formid
    wx.navigateTo({
      url: '../detail/detail?id=' + e.target.dataset.id
    })
  },    
})
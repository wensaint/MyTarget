// pages/welcome/welcome.js
var app = getApp(), backurl = '../index/index'
Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    if (options.backurl) { backurl = options.backurl }

    if (wx.getStorageSync('_userdata')) {
      that.redirectPage()      
    }
    else{
      app.getUser(function (status) {
        console.log(status)
        if(status=="OK")
        {
          that.redirectPage()
        }
      })
    }
  },

  redirectPage:function()
  {
    if (backurl == '../index/index') {
      wx.switchTab({
        url: backurl
      })
    }
    else
    {
      wx.redirectTo({
        url: backurl
      })
    }
  }
})
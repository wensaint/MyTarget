//app.js
App({
  onLaunch: function () {
    //设置全局缓存    
    wx.setStorageSync('_apiToken', this.conf._token)
  },
  
  onHide:function(){
    //保存formId到数据库
    this.postFormID()
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: true,
        lang: "zh_CN",
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(res)
        },
        fail: function (res) {
          wx.showModal({
            title: '未授权',
            content: '本小程序功能在未获得您本人授权前寸步难行，请授权！',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    console.log(res.authSetting)
                    if (res.authSetting["scope.userInfo"])
                    {
                      wx.getUserInfo({
                        withCredentials: true,
                        lang: "zh_CN",
                        success: function (res) {
                          that.globalData.userInfo = res.userInfo
                          typeof cb == "function" && cb(res)
                        }
                      })
                    }            
                  }
                })
              }
            }
          });
        }
      })
    }
  },

  //getUser函数，在index中调用
  getUser: function (response) {
    var that = this
    var status = ''
    if (wx.getStorageSync('_userdata')) {
      status="OK"
      that.globalData.status = status
      typeof response == "function" && response(status)
      return
    }
    wx.login({
      success: function (res) {
        if (res.code) {
          //调用函数获取微信用户信息
          that.getUserInfo(function (info) {
            if (!info.encryptedData || !info.iv) {
              status = "未关联AppID"
              that.globalData.status = status
              typeof response == "function" && response(status)
              return
            }
            that.util.http.ajaxPost(that.conf._serverUrl + 'api/customers/', { code: res.code, data: info.encryptedData, iv: info.iv },
              function (res) {
                if (res.data && res.statusCode == 200) {
                  status = "OK"
                  var data = JSON.parse(res.data)
                  wx.setStorageSync('_userdata', data)
                } else {
                  //清除缓存
                  wx.clearStorage()
                  status = '加载失败'
                }
              },
              function (res) {
                //清除缓存
                wx.clearStorage()
                status = '加载失败'
              },
              function (res) {
                that.globalData.status = status
                typeof response == "function" && response(status)
              }
            );
          });
        }
      }
    });
  },
  
  saveFormID: function (formId){
    var that = this
    if (formId =="the formId is a mock one"){return}
    var d = new Date()
    d.setDate(d.getDate() + 7)  //设置7天后过期

    let formIds = that.globalData.gloabalFomIds//获取全局数据中的推送码gloabalFomIds数组
    if (!formIds) formIds = []
    let data = {
      Name: formId,
      ExpireTime: d.toUTCString()
    }
    formIds.push(data) //将data添加到数组的末尾
    that.globalData.gloabalFomIds = formIds
    //用户未退出时,10个保存一次
    if (that.globalData.gloabalFomIds.length>=10)
    {
      that.postFormID()
    }    
  },

  postFormID:function()
  {
    var that = this
    var formIds = that.globalData.gloabalFomIds
    if (formIds.lenght==0){return}
    //批量post
    that.util.http.ajaxPost(
      that.conf._serverUrl + 'api/idstocks/',
      {
        OpenID: wx.getStorageSync('_userdata').openId,
        FormID: formIds
      },
      function(res){
        if (res.statusCode == 200) { that.globalData.gloabalFomIds = []}
      }
    )
  },

  util: require('./utils/util'),
  globalData: {
    userInfo: null,
    status: '',
    gloabalFomIds:[]
  },
  conf: {
    _version: 'Beta',
    _copyright: '© 青朴科技',
    _token: '4A60B699EEFC1F3833749255E1B3FD08',
    _serverUrl: "https://greenhoper.com/target/"
  },
})
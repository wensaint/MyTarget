//index.js
//获取应用实例
var app = getApp(), page = 1, num = 10, allload = false, init = false, targetID = 0
Page({
  data: {
    userID: null,
    popHeight: 165,
    boxVal:'',
    boxClass: 'new_target',
    swithChecked: false,
    list: [],
    base: {
      copyright: app.conf._copyright,
      emptyTip: '暂无未完成目标',
      popHidden: true,
      pickerShow: false
    }
  },
  onLoad: function () {
    var that = this
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
      { page: page, size: num, Status: 'int+0', ParentID: 0, CustomerID: app.util.toInt64(that.data.userID) },
      function (res) {
        if (res.statusCode == 200) {
          var obj = JSON.parse(res.data)
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
  /***添加新任务***/
  bindTargetFocus: function (e) {
    this.setData({ boxClass: 'new_target_hover' })
  },
  bindTargetBlur: function (e) {
    this.setData({ boxClass: 'new_target' })
  },
  bindTargetConfirm: function (e) {
    var that = this
    var title = e.detail.value
    //保存到数据库
    app.util.http.ajaxPost(
      app.conf._serverUrl + 'api/activities/',
      { Name: title, Creator: that.data.userID },
      function (res) {
        if (res.statusCode == 200) {
          var data = JSON.parse(res.data)
          wx.navigateTo({
            url: '../detail/detail?id=' + data.id
          })  
          that.setData({ boxVal: "" })        
        }
      })
  },

  /****长按事件******/
  longP: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var entity=that.data.list[index]
    if (!entity || entity.userid != that.data.userID)
    {
      app.util.layer.showModal('权限错误', '您没有修改此任务的权限')
      return;
    }
    var res = wx.getSystemInfoSync()
    var screenH = res.windowHeight
    var top = e.touches[0].clientY
    targetID = entity.id
    var topStyle = "top:" + top + "px"
    if ((top + that.data.popHeight) > screenH) {
      topStyle = "bottom:" + (screenH - top) + "px"
    }
    that.setData({
      'base.topStyle': topStyle,
      'base.popHidden': false
    })
  },
  modalChange: function (e) {
    app.saveFormID(e.detail.formId)  //save formid
    if (targetID == 0) { return }
    var that = this
    var action = e.currentTarget.dataset.index
    if (action == 0) {

    }
    else if (action == 1) {   //提醒时间
      app.util.initPickerData(that)
      that.setData({
        'base.pickerShow': true
      })
    }
    else if (action == 2) {   //优先级
      wx.showActionSheet({
        itemList: ['普通', '优先', '紧急'],
        success: function (res) {
          //save to db
          app.util.http.ajaxPost(
            app.conf._serverUrl + 'api/activities/',
            { ID: targetID, Level: res.tapIndex},
            function (res) {
              if (res.statusCode == 200) {
                that.loadList()
              }
            })
        }
      })
    }
    else {    //删除
      wx.showModal({
        title: '删除目标',
        content: '确认删除当前目标？',
        success: function (res) {
          if (res.confirm) {
            //保存到数据库
            app.util.http.ajaxDelete(
              app.conf._serverUrl + 'api/activities/' + targetID,
              function (res) {
                if (res.statusCode == 200) {
                  that.loadList()
                }
              })
          }
        }
      })
    }
    that.setData({
      'base.popHidden': true
    })
  },
  pageTap: function (e) {
    this.setData({
      'base.popHidden': true
    })
  },

  bindMaskTap: function (e) {
    this.setData({
      'base.pickerShow': false
    })
  },

  bindPickerChange: function (e) {
    var that = this
    var action = e.currentTarget.dataset.index
    if (action == 1) {
      that.setData({
        'base.pickerShow': false
      })
    }
    else if (action == 2) {
      var val = that.data.base.datevalue
      var selDay = that.data.base.days[val[0]].value
      var selHour = that.data.base.hours[val[1]]
      var selminute = that.data.base.minutes[val[2]]
      var selVal = selDay + ' ' + selHour + ':' + selminute
      //save to db
      app.util.http.ajaxPost(
        app.conf._serverUrl + 'api/reminds/',
        { TargetID: targetID, RemindTime: selVal, OpenID: wx.getStorageSync('_userdata').openId, Type: 0 },
        function (res) {
          if (res.statusCode == 200) {
            that.setData({
              'base.pickerShow': false
            })
          }
        })
    }
    else {
      that.setData({
        'base.datevalue': e.detail.value
      })
    }
  },

  //设置任务完成
  switchChange: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    if (!id) { return }
    var index = e.currentTarget.dataset.index
    var entity = that.data.list[index]
    if (!entity || entity.userid != that.data.userID) {
      app.util.layer.showModal('权限错误', '您没有修改此任务的权限')
      return;
    }
    var date = new Date();    
    //修改状态
    app.util.http.ajaxPost(
      app.conf._serverUrl + 'api/activities/',
      { ID: id, Status: 1, FinishTime: app.util.formatTime(date) },
      function (res) {
        if (res.statusCode == 200) {
          that.data.list.splice(index, 1)  //直接从list中删除对应元素
          that.setData({ list: that.data.list })
          that.setData({ swithChecked: false })

          //设置提醒
          app.util.http.ajaxPost(
            app.conf._serverUrl + 'api/reminds/',
            { TargetID: id, RemindTime: app.util.formatTime(date), OpenID: wx.getStorageSync('_userdata').openId, Type: 1 }            
          )
        }
      })
  },
})
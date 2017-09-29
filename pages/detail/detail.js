// detail.js
var app = getApp(), detailId,shareUserId
Page({
  /**页面的初始数据 */
  data: {
    entity: {},
    childval: '',
    disableSubmit: false
  },

  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    var that = this
    if (!options.id) { return; }
    detailId = options.id
    if (options.userid) { shareUserId = options.userid }

    if (!wx.getStorageSync('_userdata')) { 
      wx.redirectTo({
        url: '../welcome/welcome?backurl=../detail/detail?id=' + detailId + '&userid=' + shareUserId
      })
    }  
  },

  onPullDownRefresh: function () {
    this.initData()
  },

  initData: function () {
    var that = this
    //ajax请求数据
    wx.showNavigationBarLoading()
    app.util.http.ajaxGet(
      app.conf._serverUrl + 'api/activities/' + detailId,
      null,
      function (res) {
        if (res.statusCode == 200) {
          that.setData({ entity: JSON.parse(res.data) })
          wx.setNavigationBarTitle({
            title: that.data.entity.name
          })
        }
      }
    )
  },

  /*生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*生命周期函数--监听页面显示 */
  onShow: function () {
    var that = this
    that.initData()
    if (shareUserId && shareUserId != wx.getStorageSync('_userdata').id){  //成为项目组成员
      //保存到数据库        
      app.util.http.ajaxPost(
        app.conf._serverUrl + 'api/divisions/',
        { ActivityID: detailId, CustomerID: wx.getStorageSync('_userdata').id, Division:0},  //0表示正式成员
        function (res) {
          if (res.statusCode == 200) {
            
          }
        })
    }
  },

  /****share****/
  onShareAppMessage: function () {
    var that = this
    if (that.data.entity.userid == wx.getStorageSync('_userdata').id) {
      return {
        title: that.data.entity.name,
        desc: "邀请您一起达成目标",
        path: 'pages/detail/detail?id=' + detailId + '&userid=' + that.data.entity.userid
      }
    }
    else {
      return {
        title: '小目标',
        desc: "从今天开始，每天给自己树立一个小目标",
        path: 'pages/index/index'
      }
    }
  },

  /**标题改变**/
  bindTargetBlur: function (e) {
    //输入判断
    var disable = false;
    if (e.detail.value == '') {
      disable = true;
    }
    this.setData({ disableSubmit: disable })
  },

  /*日期选择**/
  bindPickerChange: function (e) {
    var that = this
    that.setData({ 'entity.duetime': e.detail.value })
  },

  /*提交保存 */
  bindTargetSubmit: function (e) {
    var that = this
    app.saveFormID(e.detail.formId)  //save formid
    if (that.data.disableSubmit) {
      app.util.layer.showModal('验证失败', '当前输入有误，请修复后再提交')
      return
    }
    var pars = e.detail.value
    pars.ID = detailId  //加上ID限制
    //保存到数据库        
    app.util.http.ajaxPost(
      app.conf._serverUrl + 'api/activities/',
      pars,
      function (res) {
        if (res.statusCode == 200) {
          wx.navigateBack()
        }
      })
  },

  /**添加子目标**/
  bindChildConfirm: function (e) {
    var that = this
    if (that.entity && that.entity.status == 1) { return }
    if (e.detail.value == '') {
      app.util.layer.showErrorModal('验证失败', '请输入子目标名称')
      return
    }
    //保存到数据库
    app.util.http.ajaxPost(
      app.conf._serverUrl + 'api/activities/',
      { Name: e.detail.value, ParentID: detailId, Creator: wx.getStorageSync('_userdata').id },
      function (res) {
        if (res.statusCode == 200) {
          that.initData()
          that.setData({ childval: '' })
        }
      })
  },

  bindDeleteTap: function (e) {
    var that = this
    console.log(e)
    var id = e.currentTarget.dataset.id
    if (!id) { return; }
    wx.showModal({
      title: '删除子目标',
      content: '确认删除当前子目标？',
      success: function (res) {
        if (res.confirm) {
          //保存到数据库
          app.util.http.ajaxDelete(
            app.conf._serverUrl + 'api/activities/' + id,
            function (res) {
              if (res.statusCode == 200) {
                that.initData()
              }
            })
        }
      }
    });
  },

  //设置任务完成
  switchChildChange: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    var oldStatus = that.data.entity.list[index].status
    var value = oldStatus == 0 ? 1 : 0
    if (!id) { return }
    //修改状态
    app.util.http.ajaxPost(
      app.conf._serverUrl + 'api/activities/',
      { ID: id, Status: value },
      function (res) {
        if (res.statusCode == 200) {
          that.data.entity.list[index].status = value  //直接从list中删除对应元素
          that.setData({ 'entity.list': that.data.entity.list })
        }
      })
  }
})
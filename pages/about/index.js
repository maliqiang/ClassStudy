const app = getApp()
var inputValue = ''

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showIt:'false',
    bindNameShow:'',
    isBinded:false,
    inputFocus:false,
    inputPlace:'请绑定姓名后使用',
    buttonShow:'block',
    stuName:'加载中'
  },
  //事件处理函数
  onLoad: function () {
    var that = this
    //判断用户是否已经绑定用户名
    if (getApp().globalData.userInfo!=null) {
      var that = this
      that.setData({
        inputPlace: '正在加载用户信息...',
        buttonShow:'none'
      })
      getName(that)
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  //绑定姓名按钮
  bindName: function () {
    var that = this
    if (inputValue == '') {
      wx.showActionSheet({
        itemList: ['请先输入姓名再登录!'],
      })
    } else {
      wxLogin(that)
      this.setData({
        bindNameShow: 'none',
        isBinded: true,
        userInfo: getApp().globalData.userInfo
      })
      getName(that) //获取用户姓名
    }
  },
  versionInfo: function () {
    wx.showActionSheet({
      itemList: ['当前版本：1.3.0'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
        }
      }
    })
  },
  updateLog: function () {
    wx.navigateTo({
      url: 'updateLog'
    })
  },
  inputChange: function(e){
    inputValue = e.detail.value
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
      inputFocus: true
    })
  },
  buttonUpdate: function(){
    this.setData({
      checkUpdate:true
    })
  },
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
    this.bugToDialog = this.selectComponent('#bugToDialog')
  },
  aboutUs:function() {
    this.dialog.showDialog();   
  },
  questions: function(){
    wx.navigateTo({
      url: 'Questions',
    })
  },
  clearCache:function(){//清除缓存
    wx.showModal({
      title: '警告',
      content: '在确认前请确信你很清楚你正在做什么！！！清除缓存意味着你将丢失你的班级信息、登录信息以及其它重要数据。',
      confirmColor:'#61e402',
      cancelColor:'red',
      confirmText:'返回',
      cancelText:'确认',
      success: function (res) {
        if(!res.confirm) {
          getApp().globalData.userInfo = null
          wx.setStorageSync('stuclass', null)
          wx.setStorageSync('firstTime', null)
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/others/welcome',
            })
          }, 1000)
        }
      }
    })
  }
})

/**
 * 与服务器交互
 */
function wxLogin(that) {
  wx.login({
    success: function (res) {
      var code = res.code;//发送给服务器的code  
      wx.getUserInfo({
        success: function (res) { //如果登陆成功则开始注册
          if (code) {
            wx.request({
              url: 'https://app.lolimay.cn/test/qd.php',//用于注册的php
              data: {
                name: inputValue,
                code: code, //openid
                stuclass: getApp().globalData.stuclass //注册班级
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.log(res) //注册php的回调消息
              }
            })
          }
          else {
            console.log("获取用户登录态失败！");
          }
        }
      })
    },
    fail: function (error) {
      console.log('login failed ' + error);
    }
  })
}

/**
 * 获取用户名字
 */
function getName(that) {
  wx.login({
    success: function (res) {
      var code = res.code; //发送给服务器的code  
      wx.getUserInfo({
        success: function (res) {
          if (code) {
            wx.request({
              url: 'https://app.lolimay.cn/test/name.php',
              data: {
                code: code,
                stuclass: getApp().globalData.stuclass
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.log(res.data) //获取用户姓名回调消息
                that.setData({
                  stuName:res.data
                })
                getApp().globalData.userName = res.data
                if (res.data != '') {
                  that.setData({
                    isBinded: true,
                    inputFocus: false
                  })
                }
              }
            })
          }
          else {
            console.log("获取用户登录态失败！");
          }
        }
      })
    },
    fail: function (error) {
      console.log('login failed ' + error);
    }
  })
}
function initPickerData(that, days_count, minutes_step) {
  days_count = days_count || 30
  minutes_step = minutes_step || 5
  var date = new Date();
  var cur = [1, date.getHours(), Math.round(date.getMinutes() / 5)]
  var dates = [];
  for (var i = 0; i <= days_count; i++) {
    var d = date.Format("MM月dd日 ");
    if (i == 0) { d += '今天' }
    else if (i == 1) { d += '明天' }
    else { d += getWeek(date) }
    var obj = {
      name: d,
      value: date.Format("yyyy-MM-dd")
    }
    dates.push(obj);
    date.setDate(date.getDate() + 1);
  }

  var hours = []
  for (let i = 0; i < 24; i++) { hours.push(i.toString().padStart(2, '0')); }

  var minus = []
  for (let i = 0; i < 60; i += minutes_step) { minus.push(i.toString().padStart(2, '0')); }
  that.setData({
    'base.days': dates,
    'base.hours': hours,
    'base.minutes': minus
  })
  that.setData({
    'base.datevalue': cur
  })
}

if (!String.prototype.padStart){
  String.prototype.padStart =
    // 为了方便表示这里 fillString 用了ES6 的默认参数，不影响理解
    function (maxLength, fillString = ' ') {
      if (Object.prototype.toString.call(fillString) !== "[object String]") throw new TypeError('fillString must be String')
      let str = this
      // 返回 String(str) 这里是为了使返回的值是字符串字面量，在控制台中更符合直觉
      if (str.length >= maxLength) return String(str)

      let fillLength = maxLength - str.length,
        times = Math.ceil(fillLength / fillString.length)

      // 这个算法叫啥？
      // SICP 的中文版第 30页 有用到同种算法计算乘幂计算
      while (times >>= 1) {
        fillString += fillString
        if (times === 1) {
          fillString += fillString
        }
      }
      return fillString.slice(0, fillLength) + str
    }
}

Date.prototype.Format = function (fmt) { //author: meizz 
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function getWeek(date) {
  if (typeof date == "string") {
    date = new Date(date);
  }
  var day = date.getDay();
  switch (day) {
    case 1:
      return "周一";
      break;
    case 2:
      return "周二";
      break;
    case 3:
      return "周三";
      break;
    case 4:
      return "周四";
      break;
    case 5:
      return "周五";
      break;
    case 6:
      return "周六";
      break;
    case 0:
      return "周日";
      break;
    default:
      return "";
  }
}

module.exports = {
  initPickerData: initPickerData,
  getWeek: getWeek
}
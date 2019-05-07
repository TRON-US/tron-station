const Util = {

  hexstring2btye: function(str) {
    let pos = 0;
    let len = str.length;
    if (len % 2 !== 0) {
      return null;
    }
    len /= 2;
    let hexA = [];
    for (let i = 0; i < len; i++) {
      let s = str.substr(pos, 2);
      let v = parseInt(s, 16);
      hexA.push(v);
      pos += 2;
    }
    return hexA;
  },

  byteToString: function(arr) {
    if (typeof arr === "string") {
      return arr;
    }
    var str = "",
      _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
      var one = _arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);
      if (v && one.length === 8) {
        var bytesLength = v[0].length;
        var store = _arr[i].toString(2).slice(7 - bytesLength);
        for (var st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(_arr[i]);
      }
    }
    return str;
  },

  toNoExp: function(num) {
    if (parseFloat(num).toString() === 'NaN') {
      return;
    }
    if (num > 1) {
      return num.toLocaleString();
    }
    var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || "").length - m[2]));
  },

  getCurrentDateTime() {
    var now = new Date().toString();
    var nowArray = now.split(' ');
    var month = nowArray[1];
    var day = nowArray[2];
    var year = nowArray[3];
    var time = nowArray[4];
    return  month + ' ' + day + ', ' + year + ' ' + time + ' (PST)'; 
  },

  formatDateTime(d) {
    if (d === undefined || d === null || d === '') {
      return '';
    }
    var date = new Date(d).toString();
    var dateArray = date.split(' ');
    var month = dateArray[1];
    var day = dateArray[2];
    // var year = dateArray[3];
    var time = dateArray[4];
    var timeArray = time.split(':');

    return  month + ' ' + day + ' ' + timeArray[0] + ':' + timeArray[1] + ' (PST)'; 
  }
};

export default Util;

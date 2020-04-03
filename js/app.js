"use strict";
import * as drop from './app/drop.js';

const routes = {
  '': 'componentDrop',
}

let param={};
const param_pair=location.search.substring(1).split('&');
for(var i=0;param_pair[i];i++) {
  var kv = param_pair[i].split('=');
  param[kv[0]] = decodeURIComponent(kv[1]);
}
//let route = routes[window.location.search.substr(1,4)];
let route = routes[param['a'] ? param['a'] : ''];

var app = new Vue({
  el: '#app',
  data: {
    device: "",
    param: {
     f:"",
    },
  },
  computed: {
    getDevice () {
        var ua = navigator.userAgent;
        if((ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 )/*&& ua.indexOf('Mobile') > 0*/){
          return 'iPhone';
        }else if(ua.indexOf('Android') > 0 /*&& ua.indexOf('Mobile') > 0*/){
          return 'Android';
        }else{
          return 'other';
        }
    }
  },
  
  created: function () {
    this.device = this.getDevice;
    console.log('device is: ' + this.device)
    this.param = param;
    console.log('param: ' + this.param)
  },
  
  components: {
    componentDrop:drop.Drop,
  },
  template:`<component is="${route}" :device="this.device" :param="this.param"></component>`
  
})


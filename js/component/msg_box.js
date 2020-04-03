"use strict";

let pointer_event = ('onpointermove' in document) ? '@pointerdown' : '@touchstart';

export default {
  name:'MsgBox',
  data:function(){return {
    view:false,
    msg:"メッセージ",
    btn_a:"はい",
    btn_b:"いいえ",
  }},
  inject: ["providedData"],
  
  mounted: function () {
    this.providedData.msg_box_set = this.set;
    //console.log(this.providedState.msg);
  },
  methods: {
    set:function(msg,callback_a,callback_b,btn_a,btn_b){
      this.view = true;
      this.msg = msg;
      this.callback_a = callback_a;
      this.callback_b = callback_b;
      if(btn_a) this.btn_a = btn_a;
      if(btn_b) this.btn_b = btn_b;
    },
    btn_a_down:function(){
      this.view = false;
      this.callback_a();
    },
    btn_b_down:function(){
      this.view = false;
      this.callback_b();
    },
  },
  template: `
  <div>
    <div v-show="view" class="bg-filter"></div>
    <div id="msg_box" v-show="view" style="z-index: 99999;position: fixed; top: 50%;left: 50%;transform: translate(-50%, -50%);">
      <div style="color:#ffffff;">{{ msg }}</div>
      <button style="" ${pointer_event}="btn_a_down">{{ btn_a }}</button><button style="" ${pointer_event}="btn_b_down">{{ btn_b }}</button>
    </div>
  </div>
`,
}

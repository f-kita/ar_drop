"use strict";

let pointer_event = ('onpointermove' in document) ? '@pointerdown' : '@touchstart';

export default {
  name:'MultiBox',
  data:function(){return {
    view:false,
    is_loading:true,
    msgs:[{
      msg:'',
      disabled:0,
      callback_a:null,
      callback_b:null,
      btn_a:'',
      btn_b:''
    }],
    page:0,
  }},
  inject: ["providedData"],
  
  mounted: function () {
    this.msgs.length=0;
    this.providedData.msg_box_set = this.set;
    this.providedData.msg_box_set_loading = this.set_loading;
    //console.log(this.providedState.msg);
  },
  methods: {
    set_loading:function(is_loading){
      this.is_loading=is_loading;
      console.log('set_loading'+is_loading);
    },
    set:function(msg,callback_a,callback_b,btn_a,btn_b,update_ct){
      this.view = true;
      //指定があれ更新マイナスは最後から
      const ct = (update_ct == undefined) ? this.msgs.length : (update_ct==-1 ? this.msgs.length+update_ct: update_ct);
      let msg_tmp={};
      msg_tmp.msg = msg;
      msg_tmp.callback_a = callback_a || (()=>{if(this.page > 0)this.page--;});
      msg_tmp.callback_b = callback_b || (()=>{if(this.page < this.msgs.length-1)this.page++;});
      msg_tmp.disabled = (btn_a==undefined) ? 0 : 1;
      msg_tmp.btn_a = btn_a || "＜前へ";
      msg_tmp.btn_b = btn_b || "次へ＞";
      this.$set(this.msgs, ct, msg_tmp);
    },
    btn_a_down:function(){
      if(this.msgs[this.page].disabled == 1 && this.page == this.msgs.length - 1)this.view = false;
      this.msgs[this.page].callback_a();
    },
    btn_b_down:function(){
      if(this.msgs[this.page].disabled == 1 && this.page >= this.msgs.length - 1)this.view = false;
      this.msgs[this.page].callback_b();
     
    },
  },
  template: `
  <div>
    <div v-show="is_loading" class="bg-filter" v-bind:class="{ 'bg-filter-loading': is_loading }"></div>
    <div id="msg_box" v-show="view" style="z-index: 99999;position: fixed; top: 50%;left: 50%;transform: translate(-50%, -50%);">
      <div style="color:#ffffff;"><span v-html="msgs[page].msg"></span></div>
      <button style="" :disabled="msgs[page].disabled==0&&page==0" ${pointer_event}="btn_a_down">{{ msgs[page].btn_a }}</button><button style="" :disabled="msgs[page].disabled==0&&page==(msgs.length-1)" ${pointer_event}="btn_b_down">{{ msgs[page].btn_b }}</button>
    </div>
  </div>
`,
}

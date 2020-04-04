"use strict";

let pointer_event = ('onpointermove' in document) ? '@pointerdown' : '@touchstart';

export default {
  name:'MultiBox',
  data:function(){return {
    view:false,
    is_loading:true,
    msg:[],
    page:0,
    type:[],
    callback_a:[],
    callback_b:[],
    btn_a:[],
    btn_b:[],
  }},
  inject: ["providedData"],
  
  mounted: function () {
    this.providedData.msg_box_set = this.set;
    this.providedData.msg_box_set_loading = this.set_loading;
    //console.log(this.providedState.msg);
  },
  methods: {
    set_loading:function(is_loading){
      this.is_loading=is_loading;
      console.log('set_loading'+is_loading);
    },
    set:function(msg,callback_a,callback_b,btn_a,btn_b,last,end_text){
      this.view = true;
      const ct = (last == undefined) ? this.msg.length : this.msg.length -1
      this.$set(this.msg, ct, msg);
      this.$set(this.callback_a, ct, callback_a || (()=>{if(this.page > 0)this.page--;}));
      this.$set(this.callback_b, ct, callback_b || (()=>{if(this.page < this.msg.length - 1)this.page++;}));
      this.$set(this.type, ct, (btn_a==undefined) ? 0 : 1);
      this.$set(this.btn_a, ct, btn_a || "＜前へ");
      this.$set(this.btn_b, ct, btn_b || "次へ＞");

      if(end_text){
        //this.is_loading=false;
        this.$set(this.type, 0, 1);
        this.$set(this.msg, 0, end_text);
        this.$set(this.btn_a, 0, "飛ばす");
        this.$set(this.callback_a, 0, ()=>{this.page = this.msg.length - 1;});
      }
    },
    btn_a_down:function(){
      if(this.type[this.page] == 1 && this.page == this.msg.length - 1)this.view = false;
      this.callback_a[this.page]();
    },
    btn_b_down:function(){
      if(this.type[this.page] == 1 && this.page >= this.msg.length - 1)this.view = false;
      this.callback_b[this.page]();
     
    },
  },
  template: `
  <div>
    <div v-show="view" class="bg-filter" v-bind:class="{ 'bg-filter-loading': is_loading }"></div>
    <div id="msg_box" v-show="view" style="z-index: 99999;position: fixed; top: 50%;left: 50%;transform: translate(-50%, -50%);">
      <div style="color:#ffffff;"><span v-html="msg[page]"></span></div>
      <button style="" :disabled="type[page]==0&&page==0" ${pointer_event}="btn_a_down">{{ btn_a[page] }}</button><button style="" :disabled="type[page]==0&&page==(msg.length-1)" ${pointer_event}="btn_b_down">{{ btn_b[page] }}</button>
    </div>
  </div>
`,
}

"use strict";
export default class MyVideo {
  constructor(device) {
    this.get_sources=false;
    this.local_stream=null;
    this.cb = null;
    this.err_cb = null;
    this.cams = {};
    this.device = device;
  }
  get_cb(){
    return this.cb;
  }
  set(video, cb,err_cb){
    this.stop(video);
    this.cb = cb;
    this.err_cb = err_cb;
  }
  stop(video){
    if(this.cb){
      console.log(this.cb);
      video.removeEventListener("play",this.cb);
    }
    if(this.local_stream){
      this.local_stream.getTracks().forEach(track => track.stop());
    }
  }
  get_front(video, cb, err_cb){
    this.set(video, cb,err_cb);
    this.get(video, 'front',cb);
  }
  get_back(video, cb,err_cb){
    this.set(video, cb,err_cb);
    this.get(video, 'back',cb);
  }
  async get(video, type){
  //get(video, type){
    await new Promise(resolve =>{
    //const p = new Promise(resolve =>{
      if(!this.get_sources){
        this.get_sources = true;
        this.get_video_sources(resolve);
      }else{
        resolve();
      }
    });
    //p.then(()=>{
    if(type in this.cams){
      this.get_by_id(video,this.cams[type].cam_id);
    }else{
      const mode = {'front': 'user', 'back':'environment'}
      this.get_by_mode(video, mode[type]);
    }
    //});
  }
  get_by_mode(video, mode,){
    const width = 
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: mode,
        width: this.device == 'iPhone' ? video.height : video.width,
        height:this.device == 'iPhone' ? video.width : video.height,
      },
      audio: false,
    })
    .then(this.set_stream.bind(this))
    .catch(this.err_get_stream.bind(this));
  }
  get_by_id(video,cam_id){
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          //maxWidth: video.height,
          //maxHeight:video.width
          maxWidth: video.width,
          maxHeight:video.height
        },
        optional: [
          {sourceId: cam_id}
        ]
      }
    },this.set_stream.bind(this),this.err_get_stream.bind(this));
  }
  set_stream(stream){
    if('srcObject' in video){
      video.srcObject = stream;
    }else{
      window.URL = window.URL || window.webkitURL;
      video.src = window.URL.createObjectURL(stream);
    }
    video.my_stream = stream;
    this.local_stream = stream;
    video.play();
    video.volume = 0;
    video.addEventListener("play",this.cb);
  }
  err_get_stream(e){
    console.error("Error on start video: " + e);
    this.err_cb(this.cb);
  }

  get_video_sources(resolve) {
    if (navigator.mediaDevices) {
      if("getUserMedia" in navigator.mediaDevices){
        //alert("getUserMedia");
        console.log("getUserMedia");
        resolve();
      }else{
        //alert("enumerateDevices");
        console.log("enumerateDevices");
        navigator.mediaDevices.enumerateDevices().then((cams)=> {
          cams.forEach((c, i, a)=> {
            console.log("enumerateDevices", c);
            if (c.kind != 'videoinput') return;
            const name = this.get_name(c.label);
            this.cams={[`${name}`]:{
              name: c.label,
              id: c.deviceId
            }};
          });
          resolve();
        });
      }
    }else{
      if (MediaStreamTrack.getSources) {
        //alert("MediaStreamTrack");
        console.log("MediaStreamTrack");
        MediaStreamTrack.getSources((cams) => {
          cams.forEach((c, i, a) => {
            console.log("MediaStreamTrack", c);
            if (c.kind != 'video') return;
            const name = this.get_name(c.facing);
            this.cams={[`${name}`]:{
              name: c.facing,
              id: c.id
            }};
          });
          resolve();
        });
      }else{
        //alert("none mediastream");
        console.log("none mediastream");
        resolve();
      }
    }
  }
  get_name(label){
    if(label.indexOf('back') >= 0){
      return 'back';
    }
    return 'front';
  }
}
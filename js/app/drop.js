"use strict";
import MultiBox from '../component/multi_box.js';
import drop_three from './drop_three.js';
import MyVideo from '../component/video.js';

var draw;
export const Drop = {
  data:function(){return {
    cam_button:[],
    get_img_start:false,
    is_get_img:false,
    ok_get_img:false,
    sharedState: {
      msg_box_set:null,
      msg_box_set_loading:null,
    },
    ct:2,
  }},
  props: ["device","param"],
  provide() {
    return {
      providedData: this.sharedState
    };
  },
  created: function() {
  
  },
  mounted: function () {
    this.sharedState.msg_box_set("『ARだるまおとし』<br><br><img src='img/draw.png'>矢印の所を落します。<br><br>対応ブラウザ<br>・Android Chrome<br>・iPhone Safari<br><br>使用機能<br>・カメラ機能<br>");
//  this.sharedState.msg_box_set("対応ブラウザ<br>・Android Chrome<br>・iPhone Safari<br><br>使用機能<br>・カメラ機能<br>・傾きセンサー(あれば)<br>　※Safariは設定から許可する必要あり");
    this.sharedState.msg_box_set("準備中です。<br><br>しばらくお待ちください。<br>");
    //console.log(this.device);
    //console.log(this.param['f']);
//alert(this.device);


    let utils = new Utils('top');
    utils.loadOpenCv(()=> {});
    
      const camera = new MyVideo(this.device);
      const err_cb = (cb)=>{
        // デバイスが無い場合はファイルを読み込む
        //if(this.$refs.video.src == "")
        if(ENV_LOCAL){
          
          //ビデオのメタデータが読み込まれるまで待つ
          this.$refs.video.addEventListener("play",cb);
          //this.$refs.video.src="img/pinch.mp4";
          this.$refs.video.src="img/test.mp4";
          this.$refs.video.muted = true;
          this.$refs.video.playsinline = true;
          this.$refs.video.autoplay = true;
          this.$refs.video.playbackRate = 0.5;
          this.$refs.video.play();
        }else{
          this.set_msg_box("カメラが検出できませんでした。<br>別のカメラ、又は別のブラウザでお試しください。");
          this.sharedState.msg_box_set_loading(false);
        }
      };
      this.add_button('前カメラ',()=>{
        camera.get_front(this.$refs.video,this.callback_get_img_model,err_cb);
        this.$refs.video.isfront=1;
      });
      this.add_button('後カメラ',()=>{
        camera.get_back(this.$refs.video,this.callback_get_img_model,err_cb);
        this.$refs.video.isfront=0;
      });
      this.set_msg_box("だるまの顔を撮ります。<br><br>※前カメラ推奨<br><br>顔に赤枠が出たら画面をタップ。");
      this.sharedState.msg_box_set_loading(false);

      Helper.check_progress(()=>this.ok_get_img).then(()=>{
        
        Helper.check_progress(()=>(typeof cv !== 'undefined'&& typeof cv.Mat !== 'undefined')).then(()=>{
        draw = new drop_three(this.ct,this.$refs.get_img_canvas, this.param['f']/10);
        draw.start('container', 'video');
        for (let i = 0; i < this.ct; ++i) {
          draw.add_box(null,i,this.$refs.get_img_canvas);
        }
        //setTimeout(()=>{draw.add_ball({x:50,y:5,z:46})},3000);

        //this.$refs.video.src =false;
        console.log(this.cam_button);
        this.cam_button.length = 0;
        this.add_button('前カメラ',()=>{
          if(this.$refs.video.isfront == 1){
            this.$refs.canvas.style.transform='scale(1, 1)';
          }
          camera.get_front(this.$refs.video,this.callback_play,err_cb);
          this.$refs.video.isfront=1;
        });
        this.add_button('後カメラ',()=>{
          if(this.$refs.video.isfront == 1){
            this.$refs.canvas.style.transform='scale(1, 1)';
          }
          camera.get_back(this.$refs.video,this.callback_play,err_cb);
          this.$refs.video.isfront=0;
        });
        console.log(this.cam_button);
        this.set_msg_box("指でだるまの体を落してください。<br>※後カメラ推奨<br><br>認識すると黄色いブロックが出ます。");
        this.sharedState.msg_box_set_loading(false);
        });
      });
    console.log('end')
  },
  methods: {
    
    add_button: function(title,cb){
      this.cam_button.push({title:title,cb:cb});
    },
    set_msg_box: function(msg){
      if(this.cam_button.length == 0){
        this.sharedState.msg_box_set("カメラが検出できませんでした。<br>別のブラウザでお試しください。",()=>{},()=>{});
        return;
      }
      if(this.cam_button.length == 1){
        this.cam_button.push(this.cam_button[0]);
      }
      this.sharedState.msg_box_set(msg,this.cam_button[0].cb,this.cam_button[1].cb,this.cam_button[0].title,this.cam_button[1].title,-1);
    },
    get_img: function(){
      if(this.get_img_start){
        this.is_get_img = true;
        this.sharedState.msg_box_set_loading(true);
      }
    },
    callback_get_img_model: function (e) {
      console.log('callback_get_img_model*********** ');
      const video = e.target;
      const canvas = this.$refs.canvas;
      
      const ctx_in=canvas.getContext("2d");
      canvas.width = video.width;
      canvas.height = video.height;
      if(video.isfront == 1){
        canvas.style.transform='scale(-1, 1)';
      }
      

      var rect = {x:0, y:0, width:0, height:0};
      var tracker = new tracking.ObjectTracker('face');
      tracker.setInitialScale(4);
      tracker.setStepSize(2);
      tracker.setEdgesDensity(0.1);
      var trackerTask;//=tracking.track("#video", tracker, { camera: false });
      tracker.on('track', function(event) {
        if(event.data.length > 0){
          rect = event.data[0];
//          console.log(rect);
        }
      });
 
      const processVideo = () => {
        
        try {
          if(video.videoWidth > 0){
            this.get_img_start=true;
            ctx_in.drawImage(video,0,0,video.width,video.height);
            trackerTask=tracking.track("#canvas", tracker);

            if(rect.width+rect.height>0){
              ctx_in.beginPath();
              ctx_in.strokeStyle = 'red';
              ctx_in.lineWidth = 3;
              ctx_in.rect(rect.x, rect.y, rect.width, rect.height);
              ctx_in.stroke();
            }
            
            if(this.is_get_img){
             // trackerTask.stop();
            //  console.log(rect);
              const ctx_out=this.$refs.get_img_canvas.getContext("2d");
              if(rect.width+rect.height>0){
                rect.x+=ctx_in.lineWidth;
                rect.y+=ctx_in.lineWidth;
                rect.width-=ctx_in.lineWidth;
                rect.height-=ctx_in.lineWidth;
                if(rect.x < 0)rect.x=0;
                if(rect.y < 0)rect.y=0;
                if(rect.width > canvas.width-rect.x)rect.width=canvas.width-rect.x;
                if(rect.height > canvas.height-rect.y)rect.height=canvas.height-rect.y;
                //console.log(rect);
                ctx_out.drawImage(canvas,rect.x, rect.y, rect.width, rect.height,0,0,128,128);
              }else{
                ctx_out.drawImage(canvas,50, 50, 128, 128,0,0,128,128);
              }
              this.ok_get_img = true;
              
              return;
            }
          }
          setTimeout(processVideo, 1000/5);
        } catch (err) {
          console.error(err);
        }
      };
      
      setTimeout(processVideo, 1000/5);
      //////////////////////////////////////////////////
      //////////////////////////////////////////////////
    },
    callback_play: function (e) {
      console.log('callback_play @@@@@@@@@@@@@@@@@@');

      //ジャイロ対応
      //draw.set_control_ori();
      const video = e.target;
      video.style.display="none";
      const canvas = this.$refs.canvas;
      
      canvas.width = video.width;
      canvas.height = video.height;

      
      // cv
      const cap = new cv.VideoCapture(video);
      const gray = new cv.Mat();
      
      const avg  = new cv.Mat();
      //let abs  = new cv.Mat();
      const diff  = new cv.Mat();
      const put  = new cv.Mat();
      //let contours  = new cv.MatVector();
      const hierarchy  = new cv.Mat();
      
      // 対象矩形サイズ
      const size_x = canvas.width;
      const size_y = canvas.height;
      const origin_center_x = size_x / 2;
      const origin_center_y = size_y / 2;
      let center_x = origin_center_x;
      let center_y = origin_center_y;
const w = 192;
const h = 192;
      const offset_x = origin_center_x - w / 2;
      const offset_y = origin_center_y - h / 2;
      const rect = new cv.Rect(offset_x, offset_y, w, h);

      //var ctx = canvas.getContext("2d");
      //let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
      //let dst = cv.matFromImageData(imageData);
      //const dst = cv.imread('canvas', cv.IMREAD_COLOR);
      const dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      let dst_rect = new cv.Mat();
      let dst_rect_old = new cv.Mat();
      const dst_rect_gray = new cv.Mat();
      const dst_rect_old_gray = new cv.Mat();
      const red = new cv.Scalar(255, 0, 0);
      const green = new cv.Scalar(0, 255, 0);
      
      const low_scalar = new cv.Scalar(0, 80, 100);
      const high_scalar = new cv.Scalar(30, 150, 255);
//      const low = new cv.Mat(dst.rows, dst.cols, cv.CV_8UC3, low_scalar);
//      const high = new cv.Mat(dst.rows, dst.cols, cv.CV_8UC3, high_scalar);
const low = new cv.Mat(w, h, cv.CV_8UC3, low_scalar);
const high = new cv.Mat(w, h, cv.CV_8UC3, high_scalar);
      const hsv  = new cv.Mat();

//      const pre_ellipse_list=[];
//      const pre_contours = new cv.MatVector();
//      let dstdst = cv.Mat.zeros(dst.rows, dst.cols, cv.CV_8UC3);
      
const HIT_NUM = 5;

      const p0 = new cv.Mat(HIT_NUM, 1, cv.CV_32FC2);
      const p1 = new cv.Mat(HIT_NUM, 1, cv.CV_32FC2);
//      let p1 = new cv.Mat();
      const st = new cv.Mat();
      const err = new cv.Mat();


let ellipse_list = [];
for(let e=0; e<HIT_NUM; e++) {
  ellipse_list[e] = {};
  ellipse_list[e].distance = Infinity;
  ellipse_list[e].not_count = 0;
}
      function processVideo() {
        const contours  = new cv.MatVector();

        
        const center_diff = draw.get_distance_ball();
        center_x = origin_center_x + center_diff.x;
        center_y = origin_center_y + center_diff.y;
        
/*
        let offset_x = center_x - w/2;
        let offset_y = center_y - h/2;
        if(offset_x < 0) offset_x = 0;
        else if(offset_x > size_x-w) offset_x = size_x-w;
        if(offset_y < 0) offset_y = 0;
        else if(offset_y > size_y-h) offset_y = size_y-h;
        rect.x = offset_x;
        rect.y = offset_y;
*/
//console.log(box.pos);

        try {
//          const dstdst = cv.Mat.zeros(dst.rows, dst.cols, cv.CV_8UC3);
          cap.read(dst);
          if(video.isfront == 1){
            cv.flip(dst,dst,1);
          }
          
          dst_rect = dst.roi(rect);
          //dst.roi(rect).copyTo(dst_rect);
          
          cv.cvtColor(dst_rect, hsv, cv.COLOR_RGB2HSV, 0);
          cv.inRange(hsv, low, high, gray);
          
          //gray.copyTo(dst_rect_gray);
          cv.cvtColor(dst_rect, dst_rect_gray, cv.COLOR_RGBA2GRAY, 0);
          
//          dst_rect_gray.copyTo(gray);
            
            let count = 0;
            for(let e=0; e<ellipse_list.length; e++) {
              if(ellipse_list[e].e != undefined){
                p0.data32F[e*2] = ellipse_list[e].e.center.x;
                p0.data32F[e*2+1] = ellipse_list[e].e.center.y;
                count++;
              }else{
                p0.data32F[e*2] = 0;
                p0.data32F[e*2+1] = 0;
              }
            }
           if(count > 0){

//            p0.data32F[0] = ellipse_top.center.x;
//            p0.data32F[1] = ellipse_top.center.y;
            cv.calcOpticalFlowPyrLK(dst_rect_old_gray, dst_rect_gray, p0, p1, st, err);//, winSize, maxLevel, criteria);
            
            for(let e=0; e<ellipse_list.length; e++) {
              if(ellipse_list[e].e != undefined){
                const move = (p0.data32F[e*2] - p1.data32F[e*2])**2 + (p0.data32F[e*2+1] - p1.data32F[e*2+1])**2;
//            console.log(move_x);
//            console.log(move_y);
            const diff_min = 4
            const diff_max = 40000;
//            console.log('pre move');
//            console.log(move);
            if(move > diff_min && move < diff_max){
//              console.log('move');
              
             //   console.log(p0.data32F);
              //  console.log(p1.data32F);

           //cv.ellipse1(dst,ellipse_top,red,2);
                  const new_x = p1.data32F[e*2];
                  const new_y = p1.data32F[e*2+1];
	            const now = {x: new_x+offset_x, y: new_y+offset_y};
              
              
                  ellipse_list[e].e.center.x += offset_x;
                  ellipse_list[e].e.center.y += offset_y;
//cv.line(dst, ellipse_list[e].e.center, now, green,2);
            
           
                  draw.add_move(ellipse_list[e].e, now);
              
/*
ellipse_list[e].e.center.x = now.x;
ellipse_list[e].e.center.y = now.y;
cv.ellipse1(dst,ellipse_list[e].e,red,2);
*/
            
//	            console.log(ellipse_top.center);
//	            console.log(now);
	            //console.log(p1);
              // 次回の基点
                  ellipse_list[e].e.center.x = new_x;
                  ellipse_list[e].e.center.y = new_y;

                  ellipse_list[e].distance = (new_x-center_x)**2 + (new_y-center_y)**2;
                  if(ellipse_list[e].distance > draw.get_distance_out() )
              {
                    ellipse_list[e].not_count = 0;
                    ellipse_list[e].e = null;
                    ellipse_list[e].distance = Infinity;
              }
            }else{
                  ellipse_list[e].not_count++;
                  if(ellipse_list[e].not_count > 5){
                    ellipse_list[e].not_count = 0;
                    ellipse_list[e].e = null;
                    ellipse_list[e].distance = Infinity;
            	}
//            	console.log(not_count);
            }
          }
            }
          }
          
          
          cv.addWeighted(gray, 0.9, avg, 0.1, 0, avg);
//          cv.convertScaleAbs(avg, abs);//8bitに 不要？
//            cv.absdiff(gray, abs, diff);

if(count < HIT_NUM)
{
          cv.absdiff(gray, avg, diff);
          cv.threshold(diff, put, 10, 255, cv.THRESH_BINARY);
          cv.findContours(put, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
          
          const min_size = 128;
          const max_size = 8000;
          
          
          for(let i=0; i<contours.size(); i++) {
            const cnt = contours.get(i);
            
            const cnt_size = cv.contourArea(cnt);
            
//            console.log('size',cnt_size);
            if(cnt_size > min_size && cnt_size < max_size){
            
              const ellipse = cv.fitEllipse(cnt);
/*
ellipse.center.x += offset_x;
ellipse.center.y += offset_y;
cv.ellipse1(dst,ellipse,red,1);
ellipse.center.x -= offset_x;
ellipse.center.y -= offset_y;
*/
              const distance = (ellipse.center.x-center_x)**2 + (ellipse.center.y-center_y)**2;
              /*
              let add_distance = ellipse.size.height;
              if(ellipse.size.width < ellipse.size.height){
                add_distance =  ellipse.size.width;
              }*/
              if (distance > draw.get_distance() /*+ (add_distance/2)**2*/){

                for(let e=0; e<ellipse_list.length; e++) {
                  if(ellipse_list[e].e != undefined){
                    ellipse_list[e].distance = (ellipse_list[e].e.center.x-center_x)**2 + (ellipse_list[e].e.center.y-center_y)**2;
                }
                  if( distance < ellipse_list[e].distance){
//                  console.log('new');
                    ellipse_list[e].e = ellipse;
               //cv.ellipse1(dst,ellipse,red,1);
//                cv.drawContours(dst, contours, i, green,1);
                  //ellipse_list.push({cnt:i,ellipse:ellipse,size:cnt_size});
                    break;
                  }
                }
              }
            }
          }
}
          
          dst_rect_gray.copyTo(dst_rect_old_gray);
          contours.delete()
          cv.imshow('canvas', dst);
 

          setTimeout(processVideo, 1000/30);
        } catch (err) {
          console.error(err);
        }
      };
      
      function processVideoStart() {
        cap.read(dst);
        if(video.isfront == 1){
          cv.flip(dst,dst,1);
        }
        dst_rect_old = dst.roi(rect);
        
        
        cv.cvtColor(dst_rect_old, hsv, cv.COLOR_RGB2HSV, 0);
        cv.inRange(hsv, low, high, gray);
        gray.copyTo(avg);
        
        //gray.copyTo(dst_rect_old_gray);
        cv.cvtColor(dst_rect_old, dst_rect_old_gray, cv.COLOR_RGBA2GRAY, 0);
        
        setTimeout(processVideo, 1);
      }
      setTimeout(processVideoStart, 300);
      //////////////////////////////////////////////////
      //////////////////////////////////////////////////
    },
  },
  components: {
    MultiBox,
  },
  template:`
<div ref="top" id="top" styel="text-align: center;">
<multi-box></multi-box>
<canvas ref="get_img_canvas" id="get_img_canvas" width = 128 height = 128 style="width:100%; height:100%; display:none"></canvas>
  
  <div style="">
    <canvas @click="get_img" ref="canvas" id="canvas" style="position:absolute; width:100%; height:100%;"></canvas>
    <div id="container" style="position:absolute; left: 0px; top: 0px;"></div>
  </div>
  <video ref="video" id="video" width=240 height=320 autoplay playsinline style="display:none;"></video>
  
  
</div>
`,
}

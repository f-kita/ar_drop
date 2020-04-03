"use strict";
import '../three/three.min.js';
import '../three/controls/TrackballControls.js';
import '../three/controls/DeviceOrientationControls.js';
import '../three/controls/OrbitControls.js';

export default class three_base {
  constructor() {
    this.camera_pos={x:0, y:10, z:-10};
    this.camera_look=new THREE.Vector3(0, 0, 0);
    this.controls = null;
    this.controls_ori = null;
    this.ori_init = null;
  }

  init(id){
    // renderer
    const container = document.getElementById( id );
    this.renderer = new THREE.WebGLRenderer({ alpha: true ,antialias:true});
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor( new THREE.Color(0xffffff),0.0);//背景色
    container.appendChild( this.renderer.domElement );

    // camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    this.camera.position.copy(this.camera_pos);
    this.camera.lookAt(this.camera_look);

    // scene
    this.scene = new THREE.Scene();
    this.scene.add( this.camera );

    // light
    const light = new THREE.DirectionalLight( 0xffffff, 1.0 );
    //var light = new THREE.PointLight( 0xffffff, 1, 0,1,2 );
    //var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light.position.set( 10, 40, 40 );
    //	light.castShadow = true;
    this.scene.add( light );

    this.clock = new THREE.Clock();
    //var stats = new Stats();
    //stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    //container.appendChild( stats.dom );

    this.anime_list = [];
    window.addEventListener('resize', this.resize.bind(this), false);
  }

  start(){
    this.animate();
  }

  resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  set_control()
  {
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target = this.camera_look.clone();
  }

  set_control_ori()
  {
    this.camera_ori = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    this.controls_ori = new THREE.DeviceOrientationControls(this.camera_ori);//,this.renderer.domElement);

  }

  //フルスクリーン表示へ切り替えます。
  fullscreen() {
    var rootElement = document.documentElement ;
    if (rootElement.requestFullscreen) {
      rootElement.requestFullscreen();
    } else if (rootElement.msRequestFullscreen) {
      rootElement.msRequestFullscreen();
    } else if (rootElement.mozRequestFullScreen) {
      rootElement.mozRequestFullScreen();
    } else if (rootElement.webkitRequestFullscreen) {
      rootElement.webkitRequestFullscreen();
    }
  }

  set_control_track()
  {
    // TrackballControlを作成
    this.controls = new THREE.TrackballControls( this.camera );
    this.controls.noZoom = false;
    this.controls.noPan = true;
    this.controls.staticMoving = true;

  }
  animate() {
    var delta = this.clock.getDelta();
    for(let anime of this.anime_list) {
      if(anime.update !== null)	anime.update(delta);
    }
    if(this.controls){
      this.controls.update();
      if(this.controls_ori){
        this.controls_ori.update();
        if(this.controls_ori.deviceOrientation.alpha){
          if(this.ori_init == null){
            this.ori_init = new THREE.Quaternion();
            this.ori_init.copy(this.camera_ori.quaternion.inverse());
          }
          //this.camera.quaternion.multiply(this.camera_ori.quaternion.multiply(this.ori_init));
          this.camera.quaternion.multiply(this.camera_ori.quaternion.premultiply(this.ori_init));
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame( this.animate.bind(this) );
  }
}
"use strict";

import three_base from './three_base.js';

export default class drop_three extends three_base {

  constructor(ct,img_canvas,friction) {
    super();
    this.CENTER_X = 50;
    this.CENTER_Z = 50;
    this.START_Y = 0.0;
    this.y_ct = 0;
    this.y_ct_max = 100;
    //this.BALL_SIZE = 1;
    this.BOX_SIZE = 3;
    
    //this.FRICTION = 0.3;
    this.FRICTION = friction ? friction : 0.3;

    this.camera_pos={x:this.CENTER_X, y:30, z:this.CENTER_Z+30};
    this.camera_look=new THREE.Vector3(this.CENTER_X, 0, this.CENTER_Z);
    this.look_obj = false;
    this.list_obj = [];

    this.ct = ct;
    this.img_canvas = img_canvas;
    let loader = new THREE.FontLoader();
    loader.load('js/three/font/helvetiker_bold.typeface.json', (font)=>{
        this.font = font;
    });
  }

  init(id){
    super.init(id);
/*
    // hole
    const hole_size=5;
    const hole = {x:50, z:10};// 1～99(0～100)
    //var hole = {x:-35, z:35};// -49～49(-50～50)
    this.hole = new THREE.Mesh(
      new THREE.RingGeometry( 0.2, hole_size, 32 ),
      new THREE.MeshBasicMaterial({
      color: 0x008800,
      opacity: 0.5,
    //transparent: true
      })
    );
    this.hole.rotateX ( -Math.PI/2 );
    this.hole.position.set(hole.x,-2,hole.z);
    this.scene.add( this.hole );

    // arrow
    const dir = new THREE.Vector3( 0, 1, 0 );
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();
    //var origin = new THREE.Vector3( 0, 0, 0 );
    const origin = new THREE.Vector3( hole.x, 0, hole.z );
    const length = 5;
    const hex = 0xff0000;
    const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    this.scene.add( arrowHelper );

*/
    // oimo
    this.world = new OIMO.World({ 
        timestep: 1/60, 
        iterations: 8, 
        broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
        worldscale: 1, // scale full world 
        random: true,  // randomize sample
        info: false,   // calculate statistic or not
    //    gravity: [0,-9.8,0]
        gravity: [0,-50,0] 
    });

    // グリッド
    const size = 100;
    const divisions = 100;
    this.gridHelper = new THREE.GridHelper( size, divisions, 0x008800 );
    this.gridHelper.position.set( this.CENTER_X, -1, this.CENTER_Z );
    //this.gridHelper.position.set( 0, 0, 0 );
    //gridHelper.rotateX ( Math.PI/1 );
    //gridHelper.rotateZ ( Math.PI/2/9  );
    this.scene.add( this.gridHelper );

    //this.world.add({size:[size, 1, divisions], pos:[this.CENTER_X,-4,this.CENTER_Z]});

    const geometry = new THREE.BoxGeometry( this.BOX_SIZE,  this.BOX_SIZE,  this.BOX_SIZE );
    let material = new THREE.MeshBasicMaterial( { color: 0x008800, overdraw: 0.5 } );
      //material = new THREE.MeshStandardMaterial({color:0xffffff} );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set( this.CENTER_X, -1.5, this.CENTER_Z );
    this.scene.add( cube );

    this.world.add({size:[this.BOX_SIZE,  this.BOX_SIZE,  this.BOX_SIZE], pos:[this.CENTER_X,-1.5,this.CENTER_Z]});
    this.world.add({size:[size, 2, divisions], pos:[this.CENTER_X,-4,this.CENTER_Z]});
    /*
    const py = -2;

    const sx1 = size;
    const sz1 = hole.z - hole_size;
    const px1 = this.CENTER_X;
    const pz1 = -(size - sz1) / 2+this.CENTER_Z;
    console.log({size:[sx1, 4, sz1], pos:[px1,py,pz1]})
    this.world.add({size:[sx1, 4, sz1], pos:[px1,py,pz1]});
    const sx2 = hole.x - hole_size;
    const sz2 = size - hole.z + hole_size;
    const px2 = (size - sx2) / 2+this.CENTER_X;
    const pz2 = (size - sz2) / 2+this.CENTER_Z;
    console.log({size:[sx2, 4, sz2], pos:[px2,py,pz2]})
    this.world.add({size:[sx2, 4, sz2], pos:[px2,py,pz2]});
    const sx3 = size - hole.x + hole_size;
    const sz3 = size - hole.z - hole_size;
    const px3 = -(size - sx3) / 2+this.CENTER_X;
    const pz3 = (size - sz3) / 2+this.CENTER_Z;
    console.log({size:[sx3, 4, sz3], pos:[px3,py,pz3]})
    this.world.add({size:[sx3, 4, sz3], pos:[px3,py,pz3]});
    const sx4 = size - hole.x - hole_size;
    const sz4 = hole_size * 2;
    const px4 = sx4 / 2;
    const pz4 = (hole.z + sz4) / 2;
    console.log({size:[sx4, 4, sz4], pos:[px4,py,pz4]})
    this.world.add({size:[sx4, 4, sz4], pos:[px4,py,pz4]});
    */

   this.set_control();
  }

  start(id, input_id){
    this.init(id)

    this.move_list= [];// 動きリスト
    this.anime_list.push({update:this.update.bind(this)});


    if(this.stats){
      this.anime_list.push({update:this.stats.update});
    }

    super.start();

    // 画面サイズ設定、縮尺用
    const input = document.getElementById( input_id );
    this.win_size = {x: input.width, y: input.height};
    //alert(this.win_size.x);
    //alert(this.win_size.y);
      
    this.set_size();
  }
  resize() {
    super.resize();
    this.set_size();
  }

  update(delta) {
    /*
    for(let move of this.move_list) {
      if(move.move !== null)	move.move(delta);
    }
    */
//   console.log(this.move_list.length);
    for (let i = this.move_list.length - 1; i >= 0; i--) {
      let move = this.move_list[i];

//console.log(move.position);
      if(move.move !== null)	move.move(delta);
    }
    this.world.step();
    
    if(this.look_obj){
  //console.log(this.camera.look_obj);
//      this.follow(this.camera,this.look_obj);
      let ok = false;
      if(this.look_obj.position.y < 1){
        this.y_ct++;
      }else if(this.look_obj.position.y < 2){
        this.y_ct++;
        ok = true;

        
      }
      if(this.y_ct > this.y_ct_max){
        this.y_ct = 0;
        
        //clear contacts
        while(this.world.contacts!==null){
          this.world.removeContact( this.world.contacts );
        }
        //this.look_obj.body.resetPosition( this.CENTER_X,this.START_Y,this.CENTER_Z);
        for (let i = 0; this.list_obj.length > i ; i++) {
          this.list_obj[i].body.resetRotation( 0, 0, 0 );
          this.list_obj[i].body.resetPosition( this.CENTER_X,this.START_Y+(this.ct-i-1)*this.BOX_SIZE,this.CENTER_Z);
        }
        if(ok){
          
          this.ct++;
          this.add_box(null,this.ct-1,this.img_canvas);
          alert('成功　'+ this.ct +'段に増やします');
        }else if(this.ct > 2){
          //this.delete_obj(this.ct-1);
          //this.ct--;
          alert('失敗');
        }else{
          alert('失敗');
        }
      }
    }
  }

  delete_obj(i)
  {
    const obj = this.list_obj[i];
    obj.body.remove();
    this.scene.remove(obj);
    this.list_obj = this.list_obj.filter(n => n != obj);
  }

  follow(object, target)
  {
    const alpa = 0.7;
    const now_pos = object.position;
    const pos = target.position;
    object.lookAt(pos);
    const diff_x = pos.x-now_pos.x;
    const diff_z = pos.z-now_pos.z;
    
    let add_x = 0;
    if(diff_x > 0){
      if(this.range_x < diff_x){
        add_x = diff_x - this.range_x;
      }
    }else{
      if(this.range_x < -diff_x){
        add_x = diff_x + this.range_x;
      }
    }
    let add_z = 0;
    if(diff_z > 0){
      if(this.range_z < diff_z){
        add_z = diff_z - this.range_z;
      }
    }else{
      if(this.range_z < -diff_z){
        add_z = diff_z + this.range_z;
      }
    }
    const new_pos = {
      x:now_pos.x+add_x+(diff_x-add_x)*alpa,
      y:now_pos.y,
      z:now_pos.z+add_z+(diff_z-add_z)*alpa+4
    };
    object.matrix.setPosition({x:new_pos.x,y:new_pos.y,z:new_pos.z});
    object.matrixAutoUpdate = false;
  }
  add_text(str)
  {
    var textGeometry = new THREE.TextGeometry( str, {
      size: 3, height: 4, //curveSegments: 3,
      font: this.font, weight: "bold", style: "normal",
      bevelThickness: 1, bevelSize: 2, bevelEnabled: false
    });
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
    var text = new THREE.Mesh( textGeometry, material );
//console.log(this.look_obj.position);
    
    //text.setRotationFromMatrix(this.camera.projectionMatrix);
    //text.lookAt(this.camera.position);
    text.matrix.setPosition(this.look_obj.position);
    //
    text.matrixAutoUpdate = false;
    this.scene.add( text );
    return text;
  }
  add_box(pos,num,image)
  {
    const geometry = new THREE.BoxGeometry( this.BOX_SIZE,  this.BOX_SIZE,  this.BOX_SIZE );
    //const geometry = new THREE.SphereGeometry( this.BALL_SIZE, 5, 5 );
    let material = null;
    if(num==0 && image !== undefined){
      console.log('texture');
      const texture = new THREE.CanvasTexture(image, THREE.CubeReflectionMapping);
    //var material = new THREE.MeshBasicMaterial({ map: texture });
      material = new THREE.MeshLambertMaterial( {map: texture} );
    }else{
      console.log('no texture');
      //var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );
      material = new THREE.MeshStandardMaterial({color:0xffffff} );
    }
    const cube = new THREE.Mesh( geometry, material );
    this.scene.add( cube );
    
  //console.log(this.camera)
  //var pos = this.crosshair.getWorldPosition();
    let belongsTo = 3;
    let collidesWith = 0x00000001;
    if(!pos){
      if(num == 0)this.look_obj=cube;
      pos ={x:this.CENTER_X,y:this.START_Y+(this.ct-num-1)*this.BOX_SIZE,z:this.CENTER_Z};
      
      belongsTo = 1;
      collidesWith = 0xffffffff;
    }
    cube.body = this.world.add({ 
      type:'box', // type of shape : sphere, box, cylinder 
      size:[this.BOX_SIZE,this.BOX_SIZE,this.BOX_SIZE], // size of shape
      pos:[pos.x,pos.y,pos.z],
      rot:[0,0,0], // start rotation in degree
      move:true, // dynamic or statique
      density: 3,
      friction: this.FRICTION,
      restitution: 0.01,
      belongsTo: belongsTo, // The bits of the collision groups to which the shape belongs.
      collidesWith: collidesWith // The bits of the collision groups with which the shape collides.
    });
    cube.body.connectMesh(cube);
    
    this.list_obj.push(cube)
    return cube.body;
  }
/*
  add_move_(pre,now)
  {
    let pre_pos = this.hit_pos(pre.center);
    if(pre_pos !== null){
      let now_pos = this.hit_pos(now);
      if(now_pos !== null){
        let pos = new THREE.Vector3();
        pos.subVectors(now_pos, pre_pos);
        this.camera.look_obj.body.linearVelocity.set(pos.x, pos.y, pos.z);
      }
    }
  }
  */
  add_move(pre,now)
  {
    const scale =1/this.world.timeStep;
    const pre_pos = this.hit_pos(pre.center);
    if(pre_pos !== null){
      const now_pos = this.hit_pos(now);
      if(now_pos !== null){
        const size_x = pre.size.width*this.scale_x;
        const size_z = pre.size.height*this.scale_z;
//        console.log("**move add**");

        let adjust_v2 = new THREE.Vector2(0,0);
        const look_obj_size=this.BOX_SIZE / 2;
        const size_xh = size_x/2;
        const size_zh = size_z/2;
        const size = (size_xh)**2 + (size_zh)**2 + look_obj_size;
        const distance = (this.look_obj.position.x-pre_pos.x)**2 + (this.look_obj.position.z-pre_pos.z)**2;

//        console.log('size',size);
//        console.log('distance',distance);
        if(size > distance){
          const p1 = new THREE.Vector2(pre_pos.x + size_xh, pre_pos.z + size_zh);
          p1.rotateAround({x:pre_pos.x, y:pre_pos.z}, pre.angle);
          let hit = (this.look_obj.position.x-p1.x)**2 + (this.look_obj.position.z-p1.y)**2 < look_obj_size;
//          console.log('hit',hit);
          if(!hit){
            const p2 = new THREE.Vector2(pre_pos.x - size_xh, pre_pos.z + size_zh);
            p2.rotateAround({x:pre_pos.x, y:pre_pos.z}, pre.angle);
            hit = (this.look_obj.position.x-p2.x)**2 + (this.look_obj.position.z-p2.y)**2 < look_obj_size;
          }
//          console.log('hit',hit);
          if(!hit){
            const p3 = new THREE.Vector2(pre_pos.x + size_xh, pre_pos.z - size_zh);
            p3.rotateAround({x:pre_pos.x, y:pre_pos.z}, pre.angle);
            hit = (this.look_obj.position.x-p3.x)**2 + (this.look_obj.position.z-p3.y)**2 < look_obj_size;
          }
//          console.log('hit',hit);
          if(!hit){
            const p4 = new THREE.Vector2(pre_pos.x - size_xh, pre_pos.z - size_zh);
            p4.rotateAround({x:pre_pos.x, y:pre_pos.z}, pre.angle);
            hit = (this.look_obj.position.x-p4.x)**2 + (this.look_obj.position.z-p4.y)**2 < look_obj_size;
          }
//          console.log('hit',hit);
          if(hit){
            adjust_v2 = new THREE.Vector2( now_pos.x-pre_pos.x,now_pos.z-pre_pos.z).setLength(size);
          }
        }

        const move_x = now_pos.x-pre_pos.x + adjust_v2.x;
        const move_z = now_pos.z-pre_pos.z + adjust_v2.y;
        const obj = this.add_obj(
          //{x:pre_pos.x-move_x,y:2.1,z:pre_pos.z-move_z},
          {x:pre_pos.x - adjust_v2.x,y:2.1,z:pre_pos.z - adjust_v2.y},
          {x:size_x,y:2,z:size_z},
          {x:0,y:-pre.angle,z:0},
          true);

        obj.move= (delta) => {
          if(obj.phase==1){
            //obj.body.position.copy( {x:now_pos.x,y:2.1,z:now_pos.z} );
            obj.body.linearVelocity.set(move_x*scale,0,move_z*scale);
            //obj.body.linearVelocity.set(move_x*2,0,move_z*2);
            //obj.body.linearVelocity.set(move_x,0,move_z);
            //obj.body.rotation.set( 0, now.angle, 0 );
            obj.body.controlPos = false;
            obj.body.isKinematic = false;
          }else if (obj.phase == 2){
            for (let i = 0; this.list_obj.length > i ; i++) {
              let contact = this.world.getContact(obj.body, this.list_obj[i].body);
              if(contact !== null){
                this.world.removeContact(contact);
              }
            }
            /*
            let contact = this.world.getContact(obj.body, this.look_obj.body);
            if(contact !== null){
              this.world.removeContact(contact);
            }*/
            obj.body.remove();
            
          }else if(obj.phase >= 3){
            this.scene.remove(obj);
            this.move_list = this.move_list.filter(n => n != obj);
          }
          obj.phase++;
        };
        obj.phase=0;
        obj.mixer=null;
        this.move_list.push(obj);
      }
    }
  }
  add_obj(pos,size,rot,visible=true)
  {
  //  console.log(pos);
  //  console.log(size);
  /*
  const SHAPE = true;
  if(SHAPE){
    var path = new THREE.Shape(); 
    path.absellipse(0,0,size.x/2,size.z/2,0, Math.PI*2, false,0);
    var extrudeSettings = {
  //  steps: 2,
      depth: 1,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1
    };
  //  var geometry = new THREE.ShapeGeometry( path  );
    var geometry = new THREE.ExtrudeGeometry( path, extrudeSettings );
  }else{
  */
//  console.log("size");
//  console.log(size);
    //var geometry = new THREE.SphereGeometry( size.z/2, 5, 5 );
    const geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
  //}
  const material = new THREE.MeshBasicMaterial( {color: 0xffE2C4} );
  const sphere = new THREE.Mesh( geometry, material );
    sphere.visible = visible;
  /*
  if(SHAPE){
    //　Shapeを上から見るため倒す
    var sphere_parent = new THREE.Object3D();
    sphere_parent.rotateX(Math.PI/2); 
    sphere_parent.add(sphere);
    this.scene.add( sphere_parent );
  }
  */
    this.scene.add( sphere );
    sphere.body = this.world.add({ 
    // type:'sphere', // type of shape : sphere, box, cylinder 
      type:'box', 
      size:[size.x,size.y,size.z], // size of shape
      pos:[pos.x,pos.y,pos.z],
      rot:[rot.x,rot.y,rot.z], // start rotation in degree
      move:true, // dynamic or statique
      density: 1,
      friction: 0.5,
      restitution: 0.2,
      belongsTo: 2, // The bits of the collision groups to which the shape belongs.
      collidesWith: 0x00000001 // The bits of the collision groups with which the shape collides.
    });
    if(visible){
      sphere.body.connectMesh(sphere);
    }
    
    return sphere;
  }

  hit_pos(win_pos){
    const pos = new THREE.Vector2();
    pos.x =  ( win_pos.x / this.win_size.x ) * 2 - 1;
    pos.y = -( win_pos.y / this.win_size.y ) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( pos, this.camera );
    // sceneを渡せば全オブジェクト対象
    const intersects = raycaster.intersectObjects( [this.gridHelper]);
  //  console.log(intersects);
    for(let intersect of intersects) {
      return intersect.point;
    }
    return null;
  };
  set_size(){
    // 画面右下で座標変換してスケールを計算
    const start_pos = this.hit_pos({x:0,y:0});
    const end_pos = this.hit_pos(this.win_size);
    
    this.scale_x = (end_pos.x-start_pos.x)/this.win_size.x;
    this.scale_z = (end_pos.z-start_pos.z)/this.win_size.y;
    
    this.range_x = (this.scale_x*this.win_size.x)/2;
    this.range_z = (this.scale_z*this.win_size.y)/2;
    
    const ballx = (this.BOX_SIZE*0.6)/this.scale_x;
    const bally = (this.BOX_SIZE*0.6)/this.scale_z;
    this.distance = ballx**2 + bally**2;

    const outx = 3/this.scale_x;
    const outy = 3/this.scale_z;
    this.distance_out = outx**2 + outy**2;
    
    console.log("this.distance");
    console.log(this.distance);
    console.log(ballx);
    console.log(bally);
  }

  get_distance(){
    return this.distance;
  }
  get_distance_out(){
    return this.distance_out;
  }
  get_distance_ball(){
    const x = this.look_obj.position.x - this.camera.matrix.elements[12];
    const z = this.look_obj.position.z - this.camera.matrix.elements[14];
    return {x:x/this.scale_x, y:z/this.scale_z};
  }
  
}
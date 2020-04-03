"use strict";
export class draw {

static draw(el, start, end, color='red'){
  let ctx = el.getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
 // ctx.miterLimit = 30.0;
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
//  ctx.closePath();
  ctx.stroke();
}

static draw_text(el, point, text, color='blue', font="bold 10px''"){
  let ctx = el.getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.font = font;
  var metrics = ctx.measureText(text);
  var metrics_1 = ctx.measureText("あ");
  let num = metrics.width / metrics_1.width;
  let size = 1;
  if(num > 1) size = 2;
  if(num > 4) size = 3;
  if(num > 9) size = 4;
  if(num > 16)size = 5;
  if(num > 25)size = 6;
  
  let min_size = el.width;
  if(min_size > el.height)min_size = el.height;
  let font_size = min_size/size;
  
//  console.log(metrics)
//  console.log(size)
  
  
  ctx.font = `bold ${font_size}px''`;
  point = {x:(el.width-min_size)/2,y:font_size-font_size/10};
  console.log(point)
  for(let i=0; i<size; i++){
    let str= text.substring(i*size);
    if(str.length > size) str= str.substring(0, size);
    ctx.strokeText(str, point.x, point.y*(i+1) );
  }
//  ctx.fillText(text, point.x, point.y );
  //ctx.strokeText(text, point.x, point.y );
//  ctx.closePath();
//  ctx.stroke();
}

static draw_reset(el){
  let ctx = el.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
}

static grayscale(el){
  let ctx = el.getContext('2d');
  var imgd = ctx.getImageData(0, 0, el.width, el.height);
  var pix = imgd.data;

  for (var i = 0, n = pix.length; i < n; i += 4) {
    var grayscale = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
    pix[i  ] = grayscale; // 赤
    pix[i+1] = grayscale; // 緑
    pix[i+2] = grayscale; // 青
    // アルファ
  }
/* 平均
   for (var y = 0; y < imgd.height; y++) {
     for (var x = 0; x < imgd.width; x++) {
         var i = (y * 4) * imgd.width + x * 4;
         var rgb = parseInt((imgd.data[i] + imgd.data[i + 1] + imgd.data[i + 2]) / 3, 10);
         imgd.data[i] = rgb;
         imgd.data[i + 1] = rgb;
         imgd.data[i + 2] = rgb;
     }
  }
*/
//  ctx.putImageData(imgd, 0, 0);

  return imgd;
  
}

}
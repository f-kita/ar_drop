"use strict";
class Helper {
  static load_js(url ,onloadCallback, errorCallback,type) {
    let script = document.createElement('script');
    script.setAttribute('async', '');
    if(type === undefined){
      type = 'text/javascript';
    }
    script.setAttribute('type', type);

    script.addEventListener('load', () => {
      onloadCallback();
    });
    script.addEventListener('error', ()=>{errorCallback(url)});
    script.src = url;
    let node = document.getElementsByTagName('script')[0];
    node.parentNode.insertBefore(script, node);
  }

  static load_js_async(url ,onloadCallback, errorCallback,type) {
    return new Promise(resolve =>{
      this.load_js(url ,()=>{
        onloadCallback();
        resolve();
      }, errorCallback,type);
    });
  }
  
}
var CACHE_NAME = 'ar-drop';
var urlsToCache = [
    'index.html',
    'manifest.json',
    'css/style.css',
    'img/bars.svg',
    'img/draw.png',
    'img/favicon.ico',
    'img/icon.png',
    'img/loading.svg',
    'js/oimo.min.js',

    'js/app.js',
    'js/app/drop.js',
    'js/app/drop_three.js',
    'js/app/three_base.js',
    'js/component/draw.js',
    'js/component/helper.js',
    'js/component/msg_box.js',
    'js/component/multi_box.js',
    'js/component/video.js',
    'js/opencv/utils.js',
    'js/opencv/opencv.js',
    'js/three/controls/DeviceOrientationControls.js',
    'js/three/controls/OrbitControls.js',
    'js/three/controls/TrackballControls.js',
    'js/three/stats.min.js',
    'js/three/three.min.js',
    'js/vue.min.js',
    'js/tracking-min.js',
    'js/data/face-min.js'
];

// インストール処理
self.addEventListener('install', function(event) {
console.log('install');
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        
        return cache.addAll(urlsToCache.map(function(url){
          console.log('install ' + url);
          return new Request(url, {mode: 'no-cors'});
        })).then(function() {
          console.log('All resources have been fetched and cached.');
        });
      }).catch(function(error) {
        console.error('Pre-fetching failed:', error);
      })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
              console.log('fetch' + event.request.url);
              console.log(response ? 'hit' : 'miss');
                return response ? response : fetch(event.request);
            })
    );
});

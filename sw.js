var C="trati-v4",F=["./","index.html","app.js","manifest.webmanifest","icon-180.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;e.respondWith(caches.open(C).then(function(c){return c.match(e.request).then(function(r){var n=fetch(e.request).then(function(x){if(x&&x.ok)c.put(e.request,x.clone());return x}).catch(function(){return r});return r||n})}))});

!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["alanngai-oss-web-uploader"]=t():e["alanngai-oss-web-uploader"]=t()}(this,(()=>(()=>{"use strict";var e={d:(t,n)=>{for(var i in n)e.o(n,i)&&!e.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:n[i]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};function n(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}e.r(t),e.d(t,{default:()=>u});var i=i||function(e,t){var n={},i=n.lib={},r=function(){},u=i.Base={extend:function(e){r.prototype=this;var t=new r;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},o=i.WordArray=u.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=null!=t?t:4*e.length},toString:function(e){return(e||a).stringify(this)},concat:function(e){var t=this.words,n=e.words,i=this.sigBytes;if(e=e.sigBytes,this.clamp(),i%4)for(var r=0;r<e;r++)t[i+r>>>2]|=(n[r>>>2]>>>24-r%4*8&255)<<24-(i+r)%4*8;else if(65535<n.length)for(r=0;r<e;r+=4)t[i+r>>>2]=n[r>>>2];else t.push.apply(t,n);return this.sigBytes+=e,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4)},clone:function(){var e=u.clone.call(this);return e.words=this.words.slice(0),e},random:function(t){for(var n=[],i=0;i<t;i+=4)n.push(4294967296*e.random()|0);return new o.init(n,t)}}),s=n.enc={},a=s.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],i=0;i<e;i++){var r=t[i>>>2]>>>24-i%4*8&255;n.push((r>>>4).toString(16)),n.push((15&r).toString(16))}return n.join("")},parse:function(e){for(var t=e.length,n=[],i=0;i<t;i+=2)n[i>>>3]|=parseInt(e.substr(i,2),16)<<24-i%8*4;return new o.init(n,t/2)}},c=s.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],i=0;i<e;i++)n.push(String.fromCharCode(t[i>>>2]>>>24-i%4*8&255));return n.join("")},parse:function(e){for(var t=e.length,n=[],i=0;i<t;i++)n[i>>>2]|=(255&e.charCodeAt(i))<<24-i%4*8;return new o.init(n,t)}},f=s.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},l=i.BufferedBlockAlgorithm=u.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=f.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(t){var n=this._data,i=n.words,r=n.sigBytes,u=this.blockSize,s=r/(4*u);if(t=(s=t?e.ceil(s):e.max((0|s)-this._minBufferSize,0))*u,r=e.min(4*t,r),t){for(var a=0;a<t;a+=u)this._doProcessBlock(i,a);a=i.splice(0,t),n.sigBytes-=r}return new o.init(a,r)},clone:function(){var e=u.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});i.Hasher=l.extend({cfg:u.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){l.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new d.HMAC.init(e,n).finalize(t)}}});var d=n.algo={};return n}(Math);!function(e){function t(e,t,n,i,r,u,o){return((e=e+(t&n|~t&i)+r+o)<<u|e>>>32-u)+t}function n(e,t,n,i,r,u,o){return((e=e+(t&i|n&~i)+r+o)<<u|e>>>32-u)+t}function r(e,t,n,i,r,u,o){return((e=e+(t^n^i)+r+o)<<u|e>>>32-u)+t}function u(e,t,n,i,r,u,o){return((e=e+(n^(t|~i))+r+o)<<u|e>>>32-u)+t}for(var o=i,s=(c=o.lib).WordArray,a=c.Hasher,c=o.algo,f=[],l=0;64>l;l++)f[l]=4294967296*e.abs(e.sin(l+1))|0;c=c.MD5=a.extend({_doReset:function(){this._hash=new s.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,i){for(var o=0;16>o;o++){var s=e[a=i+o];e[a]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8)}o=this._hash.words;var a=e[i+0],c=(s=e[i+1],e[i+2]),l=e[i+3],d=e[i+4],h=e[i+5],p=e[i+6],g=e[i+7],y=e[i+8],v=e[i+9],m=e[i+10],b=e[i+11],w=e[i+12],k=e[i+13],Q=e[i+14],S=e[i+15],O=t(O=o[0],x=o[1],B=o[2],_=o[3],a,7,f[0]),_=t(_,O,x,B,s,12,f[1]),B=t(B,_,O,x,c,17,f[2]),x=t(x,B,_,O,l,22,f[3]);O=t(O,x,B,_,d,7,f[4]),_=t(_,O,x,B,h,12,f[5]),B=t(B,_,O,x,p,17,f[6]),x=t(x,B,_,O,g,22,f[7]),O=t(O,x,B,_,y,7,f[8]),_=t(_,O,x,B,v,12,f[9]),B=t(B,_,O,x,m,17,f[10]),x=t(x,B,_,O,b,22,f[11]),O=t(O,x,B,_,w,7,f[12]),_=t(_,O,x,B,k,12,f[13]),B=t(B,_,O,x,Q,17,f[14]),O=n(O,x=t(x,B,_,O,S,22,f[15]),B,_,s,5,f[16]),_=n(_,O,x,B,p,9,f[17]),B=n(B,_,O,x,b,14,f[18]),x=n(x,B,_,O,a,20,f[19]),O=n(O,x,B,_,h,5,f[20]),_=n(_,O,x,B,m,9,f[21]),B=n(B,_,O,x,S,14,f[22]),x=n(x,B,_,O,d,20,f[23]),O=n(O,x,B,_,v,5,f[24]),_=n(_,O,x,B,Q,9,f[25]),B=n(B,_,O,x,l,14,f[26]),x=n(x,B,_,O,y,20,f[27]),O=n(O,x,B,_,k,5,f[28]),_=n(_,O,x,B,c,9,f[29]),B=n(B,_,O,x,g,14,f[30]),O=r(O,x=n(x,B,_,O,w,20,f[31]),B,_,h,4,f[32]),_=r(_,O,x,B,y,11,f[33]),B=r(B,_,O,x,b,16,f[34]),x=r(x,B,_,O,Q,23,f[35]),O=r(O,x,B,_,s,4,f[36]),_=r(_,O,x,B,d,11,f[37]),B=r(B,_,O,x,g,16,f[38]),x=r(x,B,_,O,m,23,f[39]),O=r(O,x,B,_,k,4,f[40]),_=r(_,O,x,B,a,11,f[41]),B=r(B,_,O,x,l,16,f[42]),x=r(x,B,_,O,p,23,f[43]),O=r(O,x,B,_,v,4,f[44]),_=r(_,O,x,B,w,11,f[45]),B=r(B,_,O,x,S,16,f[46]),O=u(O,x=r(x,B,_,O,c,23,f[47]),B,_,a,6,f[48]),_=u(_,O,x,B,g,10,f[49]),B=u(B,_,O,x,Q,15,f[50]),x=u(x,B,_,O,h,21,f[51]),O=u(O,x,B,_,w,6,f[52]),_=u(_,O,x,B,l,10,f[53]),B=u(B,_,O,x,m,15,f[54]),x=u(x,B,_,O,s,21,f[55]),O=u(O,x,B,_,y,6,f[56]),_=u(_,O,x,B,S,10,f[57]),B=u(B,_,O,x,p,15,f[58]),x=u(x,B,_,O,k,21,f[59]),O=u(O,x,B,_,d,6,f[60]),_=u(_,O,x,B,b,10,f[61]),B=u(B,_,O,x,c,15,f[62]),x=u(x,B,_,O,v,21,f[63]),o[0]=o[0]+O|0,o[1]=o[1]+x|0,o[2]=o[2]+B|0,o[3]=o[3]+_|0},_doFinalize:function(){var t=this._data,n=t.words,i=8*this._nDataBytes,r=8*t.sigBytes;n[r>>>5]|=128<<24-r%32;var u=e.floor(i/4294967296);for(n[15+(r+64>>>9<<4)]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8),n[14+(r+64>>>9<<4)]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8),t.sigBytes=4*(n.length+1),this._process(),n=(t=this._hash).words,i=0;4>i;i++)r=n[i],n[i]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8);return t},clone:function(){var e=a.clone.call(this);return e._hash=this._hash.clone(),e}}),o.MD5=a._createHelper(c),o.HmacMD5=a._createHmacHelper(c)}(Math);const r=i,u=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.countTask=0,this.concurrencyCount=1,this.waitingQueue=[],this.uploadingQueue=[],this.errorQueue=[],this.uploadedQueue=[],this.choosing=!1,this.uploading=!1,this.isCheckingQueue=!1,this.taskId=0,this.loadedBuffer=0,this.bufferSpeed=0,this.checkQueueList=null,this.debug=!1,this.signatureApi=t,this.signatureInfo=null,this.onComputedId=null,this.onSuccess=null,this.onError=null,this.onAllFinish=null,this.onAllSuccess=null,this.onProgress=null,this.eventType=null}var t,i,u;return t=e,i=[{key:"uploadFiles",value:function(t,n){var i=t.files,r=t.onComputedId,u=t.onComputedMd5,o=t.onProgress,s=t.onSuccess,a=t.onAllSuccess,c=t.onError,f=this;f.countTask+=i.length,f.uploading=!0,f.loadedBuffer=0,f.bufferSpeed=0,f.onComputedId=r,f.onComputedMd5=u,f.onSuccess=s,f.onError=c,f.onAllSuccess=a,f.onProgress=o,f.eventType=n;var l=0;function d(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;e.status=t,e.progress=n,"function"==typeof f.onProgress&&f.onProgress(Object.assign({},e))}function h(e){d(e,"fail"),f.errorQueue.push(e),"function"==typeof f.onError&&f.onError(Object.assign({},e))}f.checkQueueList=function(){if(0!==f.waitingQueue.length&&f.uploadingQueue.length<f.concurrencyCount){f.isCheckingQueue=!0;var t=f.waitingQueue.shift();f.uploadingQueue.push(t),new Promise((function(e,t){f.signatureInfo?e():f.signatureApi().then((function(t){f.signatureInfo=t,e()})).catch((function(){t()}))})).then((function(){return function(t){var n=new XMLHttpRequest;function i(){e.removeOutOf(f.uploadingQueue,t),h(t),f.checkQueueList()}n.open("POST",f.debug?f.signatureInfo.host+"123":f.signatureInfo.host,!0),n.onload=function(n){if(4==n.target.readyState&&200==n.target.status){var r=JSON.parse(n.target.responseText).data;"Ok"===r.Status?(e.removeOutOf(f.uploadingQueue,t),t.uploadedUrl=r.url,f.uploadedQueue.push(t),function(e){if(d(e,"success"),"function"==typeof f.onSuccess){var t=f.waitingQueue.length+f.uploadingQueue.length+f.errorQueue.length;f.onSuccess(Object.assign({},e),t)}}(t),f.checkQueueList()):i()}else i()},n.upload.onprogress=function(e){var n=e.loaded/e.total;f.bufferSpeed+=e.loaded-f.loadedBuffer,f.loadedBuffer=e.loaded,d(t,"loading",n)},n.onerror=function(){i()};var r=new FormData;r.append("name","".concat(t.md5,".").concat(t.suffix)),r.append("key","".concat(f.signatureInfo.dir).concat(t.md5,".").concat(t.suffix)),r.append("policy",f.signatureInfo.policy),r.append("OSSAccessKeyId",f.signatureInfo.accessid),r.append("success_action_status","200"),r.append("signature",f.signatureInfo.signature),r.append("callback",f.signatureInfo.callback),r.append("file",t.file),n.send(r),t.xhr=n}(t)})).catch((function(){e.removeOutOf(f.uploadingQueue,t),h(t),f.checkQueueList()}))}else 0===f.waitingQueue.length&&0===f.uploadingQueue.length&&(f.isCheckingQueue=!1,f.uploading=!1,f.bufferSpeed=0,f.loadedBuffer=0,"function"==typeof f.onAllFinish&&f.onAllFinish(),0===f.errorQueue.length&&"function"==typeof f.onAllSuccess&&f.onAllSuccess())},function t(){l<i.length?function(){var n=i[l],r={id:f.taskId,url:window.URL.createObjectURL(n),suffix:e.getFileSuffix(n.name),status:"wait",file:n};f.waitingQueue.push(r),function(e){d(e,"inited"),"function"==typeof f.onComputedId&&f.onComputedId(Object.assign({},e))}(r),f.taskId++;var u=e.chunckFileToBlob(n),o=new FileReader;o.onload=function(){r.md5=e.getFileMd5(o.result,n),function(e){d(e,"md5"),"function"==typeof f.onComputedMd5&&f.onComputedMd5(Object.assign({},e))}(r)},o.readAsDataURL(u),l++,t()}():f.checkQueueList()}()}},{key:"toggleDebug",value:function(){this.debug=!this.debug}},{key:"retryErrorQueue",value:function(){for(;this.errorQueue.length;){var e=this.errorQueue.shift(),t={id:e.id,url:e.url,suffix:e.suffix,file:e.file,md5:e.md5,status:"md5"};this.waitingQueue.push(t)}this.isCheckingQueue||this.checkQueueList&&this.checkQueueList()}},{key:"retryErrorTaskById",value:function(e){var t=this.errorQueue.findIndex((function(t){return t.id===Number(e)}));if(t>-1){var n=this.errorQueue.splice(t,1)[0],i={id:n.id,url:n.url,suffix:n.suffix,file:n.file,md5:n.md5,status:"md5"};this.waitingQueue.push(i),this.isCheckingQueue||this.checkQueueList&&this.checkQueueList()}}},{key:"delTaskById",value:function(t){var n={id:Number(t)};e.removeOutOf(this.waitingQueue,n),e.removeOutOf(this.uploadingQueue,n),e.removeOutOf(this.uploadedQueue,n),e.removeOutOf(this.errorQueue,n),this.countTask-=1}}],u=[{key:"removeOutOf",value:function(e,t){for(var n=0;n<e.length;n++)e[n].id==t.id&&e.splice(n,1)}},{key:"getFileMd5",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"",i=r.MD5(e+t.lastModified+n).toString();return[i.substring(0,8),i.substring(8,12),i.substring(12,16),i.substring(16,20),i.substring(20,32)].join("-")}},{key:"chunckFileToBlob",value:function(e){e.slice=e.slice||e.webkitSlice;var t=e.slice(0,100),n=e.slice(e.size/2-50,e.size/2+50),i=e.slice(e.size-100,e.size);return new Blob([t,n,i])}},{key:"getFileSuffix",value:function(e){var t=e.lastIndexOf("."),n="";return-1!=t&&(n=e.substring(t+1)),n}},{key:"parseBufferSpeed",value:function(e){return e>1048576?(e/1048576).toFixed(1)+"MB/s":Math.round(e/1024)+"KB/s"}}],i&&n(t.prototype,i),u&&n(t,u),Object.defineProperty(t,"prototype",{writable:!1}),e}();return t})()));
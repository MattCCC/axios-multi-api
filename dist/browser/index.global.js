(()=>{async function g(o,e){if(!e)return o;let s=Array.isArray(e)?e:[e],t={...o};for(let r of s)t=await r(t);return t}async function C(o,e){if(!e)return o;let s=Array.isArray(e)?e:[e],t=o;for(let r of s)t=await r(t);return t}var m=class extends Error{response;request;config;status;statusText;constructor(e,s,t){super(e),this.name="ResponseError",this.message=e,this.status=t.status,this.statusText=t.statusText,this.request=s,this.config=s,this.response=t}};function F(o,e){if(!e)return o;let s=[],t=function(a,n){n=typeof n=="function"?n():n,n=n===null||n===void 0?"":n,s[s.length]=encodeURIComponent(a)+"="+encodeURIComponent(n)},r=(a,n)=>{let i,p,c;if(a)if(Array.isArray(n))for(i=0,p=n.length;i<p;i++)r(a+"["+(typeof n[i]=="object"&&n[i]?i:"")+"]",n[i]);else if(typeof n=="object"&&n!==null)for(c in n)r(a+"["+c+"]",n[c]);else t(a,n);else if(Array.isArray(n))for(i=0,p=n.length;i<p;i++)t(n[i].name,n[i].value);else for(c in n)r(c,n[c]);return s},u=r("",e).join("&").replace(/%5B%5D/g,"[]");return o.includes("?")?`${o}&${u}`:u?`${o}?${u}`:o}function A(o,e){return e?o.replace(/:[a-zA-Z]+/gi,s=>{let t=s.substring(1);return String(e[t]?e[t]:s)}):o}function D(o){if(o==null)return!1;let e=typeof o;if(e==="string"||e==="number"||e==="boolean")return!0;if(e!=="object")return!1;if(Array.isArray(o))return!0;if(Buffer.isBuffer(o)||o instanceof Date)return!1;let s=Object.getPrototypeOf(o);return s===Object.prototype||s===null||typeof o.toJSON=="function"}async function I(o){return new Promise(e=>setTimeout(()=>e(!0),o))}var P="application/json",R=class{requestInstance;baseURL="";timeout=3e4;cancellable=!1;rejectCancelled=!1;strategy="reject";method="get";flattenResponse=!1;defaultResponse=null;fetcher;logger;onError;requestsQueue;retry={retries:0,delay:1e3,maxDelay:3e4,backoff:1.5,retryOn:[408,409,425,429,500,502,503,504],shouldRetry:async()=>!0};config;constructor({fetcher:e=null,timeout:s=null,rejectCancelled:t=!1,strategy:r=null,flattenResponse:l=null,defaultResponse:u={},logger:a=null,onError:n=null,...i}){this.fetcher=e,this.timeout=s??this.timeout,this.strategy=r||this.strategy,this.cancellable=i.cancellable||this.cancellable,this.rejectCancelled=t||this.rejectCancelled,this.flattenResponse=l||this.flattenResponse,this.defaultResponse=u,this.logger=a||(globalThis?globalThis.console:null)||null,this.onError=n,this.requestsQueue=new WeakMap,this.baseURL=i.baseURL||i.apiUrl||"",this.method=i.method||this.method,this.config=i,this.retry={...this.retry,...i.retry||{}},this.requestInstance=this.isCustomFetcher()?e.create({...i,baseURL:this.baseURL,timeout:this.timeout}):null}getInstance(){return this.requestInstance}buildConfig(e,s,t){let r=t.method||this.method,l=r.toLowerCase(),u=l==="get"||l==="head",a=A(e,t.urlPathParams||this.config.urlPathParams),n=t.body||t.data||this.config.body||this.config.data;if(this.isCustomFetcher())return{...t,url:a,method:l,...u?{params:s}:{},...!u&&s&&n?{params:s}:{},...!u&&s&&!n?{data:s}:{},...!u&&n?{data:n}:{}};let i=n||s,p=t.withCredentials||this.config.withCredentials?"include":t.credentials;delete t.data,delete t.withCredentials;let c=!u&&s&&!t.body||!s?a:F(a,s),f=c.includes("://")?"":typeof t.baseURL<"u"?t.baseURL:this.baseURL;return{...t,credentials:p,url:f+c,method:r.toUpperCase(),headers:{Accept:P+", text/plain, */*","Content-Type":P+";charset=utf-8",...t.headers||this.config.headers||{}},...u?{}:{body:!(i instanceof URLSearchParams)&&D(i)?typeof i=="string"?i:JSON.stringify(i):i}}}processError(e,s){var t;this.isRequestCancelled(e)||((t=this.logger)!=null&&t.warn&&this.logger.warn("API ERROR",e),s.onError&&typeof s.onError=="function"&&s.onError(e),this.onError&&typeof this.onError=="function"&&this.onError(e))}async outputErrorResponse(e,s){let t=this.isRequestCancelled(e),r=s.strategy||this.strategy,l=typeof s.rejectCancelled<"u"?s.rejectCancelled:this.rejectCancelled,u=typeof s.defaultResponse<"u"?s.defaultResponse:this.defaultResponse;return r==="softFail"?this.outputResponse(e.response,s,e):t&&!l?u:r==="silent"?(await new Promise(()=>null),u):r==="reject"?Promise.reject(e):u}isRequestCancelled(e){return e.name==="AbortError"||e.name==="CanceledError"}isCustomFetcher(){return this.fetcher!==null}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable."),{};let s=this.requestsQueue.get(e);s&&s.abort();let t=new AbortController;if(!this.isCustomFetcher()&&this.timeout>0){let r=setTimeout(()=>{let l=new Error(`[TimeoutError]: The ${e.url} request was aborted due to timeout`);throw l.name="TimeoutError",l.code=23,t.abort(l),clearTimeout(r),l},e.timeout||this.timeout)}return this.requestsQueue.set(e,t),{signal:t.signal}}async request(e,s=null,t=null){var w,q;let r=null,l=t||{},u=this.buildConfig(e,s,l),a={...this.addCancellationToken(u),...u},{retries:n,delay:i,backoff:p,retryOn:c,shouldRetry:b,maxDelay:f}={...this.retry,...(a==null?void 0:a.retry)||{}},h=0,y=i;for(;h<=n;)try{if(a=await g(a,a.onRequest),a=await g(a,this.config.onRequest),this.isCustomFetcher())r=await this.requestInstance.request(a);else if(r=await globalThis.fetch(a.url,a),r.config=a,r.data=await this.parseData(r),!r.ok)throw new m(`${a.url} failed! Status: ${r.status||null}`,a,r);return r=await C(r,a.onResponse),r=await C(r,this.config.onResponse),this.outputResponse(r,a)}catch(d){if(h===n||!await b(d,h)||!(c!=null&&c.includes(((w=d==null?void 0:d.response)==null?void 0:w.status)||(d==null?void 0:d.status))))return this.processError(d,a),this.outputErrorResponse(d,a);(q=this.logger)!=null&&q.warn&&this.logger.warn(`Attempt ${h+1} failed. Retrying in ${y}ms...`),await I(y),y*=p,y=Math.min(y,f),h++}return this.outputResponse(r,a)}async parseData(e){var r;let s=String(((r=e.headers)==null?void 0:r.get("Content-Type"))||""),t;if(!s){let l=e.clone();try{t=await l.json()}catch{t=null}}if(typeof t>"u")try{s.includes(P)||s.includes("+json")?t=await e.json():s.includes("multipart/form-data")?t=await e.formData():s.includes("application/octet-stream")?t=await e.blob():s.includes("application/x-www-form-urlencoded")?t=await e.formData():typeof e.text=="function"?t=await e.text():t=e.body||e.data||null}catch{t=null}return t}processHeaders(e){if(!e.headers)return{};let s={},t=e.headers;if(t instanceof Headers)for(let[r,l]of t.entries())s[r]=l;else s={...t};return s}outputResponse(e,s,t=null){let r=typeof s.defaultResponse<"u"?s.defaultResponse:this.defaultResponse;return e?(s.flattenResponse||this.flattenResponse)&&typeof e.data<"u"?e.data!==null&&typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e!==null&&typeof e=="object"&&e.constructor===Object&&Object.keys(e).length===0?r:this.isCustomFetcher()?e:(t!==null&&(t==null||delete t.response,t==null||delete t.request,t==null||delete t.config),{body:e.body,blob:e.blob,json:e.json,text:e.text,clone:e.clone,bodyUsed:e.bodyUsed,arrayBuffer:e.arrayBuffer,formData:e.formData,ok:e.ok,redirected:e.redirected,type:e.type,url:e.url,status:e.status,statusText:e.statusText,error:t,data:e.data,headers:this.processHeaders(e),config:s}):r}};function Q(o){let e=o.endpoints,s=new R(o);function t(){return s.getInstance()}function r(n){return console.error(`${n} endpoint must be added to 'endpoints'.`),Promise.resolve(null)}async function l(n,i={},p={},c={}){let f={...e[n]};return await s.request(f.url,i,{...f,...c,urlPathParams:p})}function u(n){return n in a?a[n]:e[n]?a.request.bind(null,n):r.bind(null,n)}let a={config:o,endpoints:e,requestHandler:s,getInstance:t,request:l};return new Proxy(a,{get:(n,i)=>u(i)})}async function B(o,e={}){return new R(e).request(o,e.body||e.data||e.params,e)}})();
//# sourceMappingURL=index.global.js.map
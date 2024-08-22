var g=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var U=Object.prototype.hasOwnProperty;var T=(a,e)=>{for(var s in e)g(a,s,{get:e[s],enumerable:!0})},O=(a,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of H(e))!U.call(a,n)&&n!==s&&g(a,n,{get:()=>e[n],enumerable:!(t=x(e,n))||t.enumerable});return a};var j=a=>O(g({},"__esModule",{value:!0}),a);var L={};T(L,{createApiFetcher:()=>S,fetchf:()=>k});module.exports=j(L);async function C(a,e){if(!e)return a;let s=Array.isArray(e)?e:[e],t={...a};for(let n of s)t=await n(t);return t}async function P(a,e){if(!e)return a;let s=Array.isArray(e)?e:[e],t=a;for(let n of s)t=await n(t);return t}var m=class extends Error{response;request;config;status;statusText;constructor(e,s,t){super(e),this.name="ResponseError",this.message=e,this.status=t.status,this.statusText=t.statusText,this.request=s,this.config=s,this.response=t}};function A(a,e){if(!e)return a;let s=[],t=function(o,r){r=typeof r=="function"?r():r,r=r===null||r===void 0?"":r,s[s.length]=encodeURIComponent(o)+"="+encodeURIComponent(r)},n=(o,r)=>{let i,p,c;if(o)if(Array.isArray(r))for(i=0,p=r.length;i<p;i++)n(o+"["+(typeof r[i]=="object"&&r[i]?i:"")+"]",r[i]);else if(typeof r=="object"&&r!==null)for(c in r)n(o+"["+c+"]",r[c]);else t(o,r);else if(Array.isArray(r))for(i=0,p=r.length;i<p;i++)t(r[i].name,r[i].value);else for(c in r)n(c,r[c]);return s},u=n("",e).join("&").replace(/%5B%5D/g,"[]");return a.includes("?")?`${a}&${u}`:u?`${a}?${u}`:a}function D(a,e){return e?a.replace(/:[a-zA-Z]+/gi,s=>{let t=s.substring(1);return String(e[t]?e[t]:s)}):a}function I(a){if(a==null)return!1;let e=typeof a;if(e==="string"||e==="number"||e==="boolean")return!0;if(e!=="object")return!1;if(Array.isArray(a))return!0;if(Buffer.isBuffer(a)||a instanceof Date)return!1;let s=Object.getPrototypeOf(a);return s===Object.prototype||s===null||typeof a.toJSON=="function"}async function E(a){return new Promise(e=>setTimeout(()=>e(!0),a))}var w="application/json",R=class{requestInstance;baseURL="";timeout=3e4;cancellable=!1;rejectCancelled=!1;strategy="reject";method="get";flattenResponse=!1;defaultResponse=null;fetcher;logger;onError;requestsQueue;retry={retries:0,delay:1e3,maxDelay:3e4,backoff:1.5,retryOn:[408,409,425,429,500,502,503,504],shouldRetry:async()=>!0};config;constructor({fetcher:e=null,timeout:s=null,rejectCancelled:t=!1,strategy:n=null,flattenResponse:l=null,defaultResponse:u={},logger:o=null,onError:r=null,...i}){this.fetcher=e,this.timeout=s??this.timeout,this.strategy=n||this.strategy,this.cancellable=i.cancellable||this.cancellable,this.rejectCancelled=t||this.rejectCancelled,this.flattenResponse=l||this.flattenResponse,this.defaultResponse=u,this.logger=o||(globalThis?globalThis.console:null)||null,this.onError=r,this.requestsQueue=new WeakMap,this.baseURL=i.baseURL||i.apiUrl||"",this.method=i.method||this.method,this.config=i,this.retry={...this.retry,...i.retry||{}},this.requestInstance=this.isCustomFetcher()?e.create({...i,baseURL:this.baseURL,timeout:this.timeout}):null}getInstance(){return this.requestInstance}buildConfig(e,s,t){let n=t.method||this.method,l=n.toLowerCase(),u=l==="get"||l==="head",o=D(e,t.urlPathParams||this.config.urlPathParams),r=t.body||t.data||this.config.body||this.config.data;if(this.isCustomFetcher())return{...t,url:o,method:l,...u?{params:s}:{},...!u&&s&&r?{params:s}:{},...!u&&s&&!r?{data:s}:{},...!u&&r?{data:r}:{}};let i=r||s,p=t.withCredentials||this.config.withCredentials?"include":t.credentials;delete t.data,delete t.withCredentials;let c=!u&&s&&!t.body||!s?o:A(o,s),f=c.includes("://")?"":typeof t.baseURL<"u"?t.baseURL:this.baseURL;return{...t,credentials:p,url:f+c,method:n.toUpperCase(),headers:{Accept:w+", text/plain, */*","Content-Type":w+";charset=utf-8",...t.headers||this.config.headers||{}},...u?{}:{body:!(i instanceof URLSearchParams)&&I(i)?typeof i=="string"?i:JSON.stringify(i):i}}}processError(e,s){var t;this.isRequestCancelled(e)||((t=this.logger)!=null&&t.warn&&this.logger.warn("API ERROR",e),s.onError&&typeof s.onError=="function"&&s.onError(e),this.onError&&typeof this.onError=="function"&&this.onError(e))}async outputErrorResponse(e,s){let t=this.isRequestCancelled(e),n=s.strategy||this.strategy,l=typeof s.rejectCancelled<"u"?s.rejectCancelled:this.rejectCancelled,u=typeof s.defaultResponse<"u"?s.defaultResponse:this.defaultResponse;return n==="softFail"?this.outputResponse(e.response,s,e):t&&!l?u:n==="silent"?(await new Promise(()=>null),u):n==="reject"?Promise.reject(e):u}isRequestCancelled(e){return e.name==="AbortError"||e.name==="CanceledError"}isCustomFetcher(){return this.fetcher!==null}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable."),{};let s=this.requestsQueue.get(e);s&&s.abort();let t=new AbortController;if(!this.isCustomFetcher()&&this.timeout>0){let n=setTimeout(()=>{let l=new Error(`[TimeoutError]: The ${e.url} request was aborted due to timeout`);throw l.name="TimeoutError",l.code=23,t.abort(l),clearTimeout(n),l},e.timeout||this.timeout)}return this.requestsQueue.set(e,t),{signal:t.signal}}async request(e,s=null,t=null){var q,F;let n=null,l=t||{},u=this.buildConfig(e,s,l),o={...this.addCancellationToken(u),...u},{retries:r,delay:i,backoff:p,retryOn:c,shouldRetry:b,maxDelay:f}={...this.retry,...(o==null?void 0:o.retry)||{}},h=0,y=i;for(;h<=r;)try{if(o=await C(o,o.onRequest),o=await C(o,this.config.onRequest),this.isCustomFetcher())n=await this.requestInstance.request(o);else if(n=await globalThis.fetch(o.url,o),n.config=o,n.data=await this.parseData(n),!n.ok)throw new m(`${o.url} failed! Status: ${n.status||null}`,o,n);return n=await P(n,o.onResponse),n=await P(n,this.config.onResponse),this.outputResponse(n,o)}catch(d){if(h===r||!await b(d,h)||!(c!=null&&c.includes(((q=d==null?void 0:d.response)==null?void 0:q.status)||(d==null?void 0:d.status))))return this.processError(d,o),this.outputErrorResponse(d,o);(F=this.logger)!=null&&F.warn&&this.logger.warn(`Attempt ${h+1} failed. Retrying in ${y}ms...`),await E(y),y*=p,y=Math.min(y,f),h++}return this.outputResponse(n,o)}async parseData(e){var n;let s=String(((n=e.headers)==null?void 0:n.get("Content-Type"))||""),t;if(!s){let l=e.clone();try{t=await l.json()}catch{t=null}}if(typeof t>"u")try{s.includes(w)||s.includes("+json")?t=await e.json():s.includes("multipart/form-data")?t=await e.formData():s.includes("application/octet-stream")?t=await e.blob():s.includes("application/x-www-form-urlencoded")?t=await e.formData():typeof e.text=="function"?t=await e.text():t=e.body||e.data||null}catch{t=null}return t}processHeaders(e){if(!e.headers)return{};let s={},t=e.headers;if(t instanceof Headers)for(let[n,l]of t.entries())s[n]=l;else s={...t};return s}outputResponse(e,s,t=null){let n=typeof s.defaultResponse<"u"?s.defaultResponse:this.defaultResponse;return e?(s.flattenResponse||this.flattenResponse)&&typeof e.data<"u"?e.data!==null&&typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e!==null&&typeof e=="object"&&e.constructor===Object&&Object.keys(e).length===0?n:this.isCustomFetcher()?e:(t!==null&&(t==null||delete t.response,t==null||delete t.request,t==null||delete t.config),{body:e.body,blob:e.blob,json:e.json,text:e.text,clone:e.clone,bodyUsed:e.bodyUsed,arrayBuffer:e.arrayBuffer,formData:e.formData,ok:e.ok,redirected:e.redirected,type:e.type,url:e.url,status:e.status,statusText:e.statusText,error:t,data:e.data,headers:this.processHeaders(e),config:s}):n}};function S(a){let e=a.endpoints,s=new R(a);function t(){return s.getInstance()}function n(r){return console.error(`${r} endpoint must be added to 'endpoints'.`),Promise.resolve(null)}async function l(r,i={},p={},c={}){let f={...e[r]};return await s.request(f.url,i,{...f,...c,urlPathParams:p})}function u(r){return r in o?o[r]:e[r]?o.request.bind(null,r):n.bind(null,r)}let o={config:a,endpoints:e,requestHandler:s,getInstance:t,request:l};return new Proxy(o,{get:(r,i)=>u(i)})}async function k(a,e={}){return new R(e).request(a,e.body||e.data||e.params,e)}0&&(module.exports={createApiFetcher,fetchf});
//# sourceMappingURL=index.js.map
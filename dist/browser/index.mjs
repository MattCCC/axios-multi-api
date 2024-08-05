var g=class{logger;requestErrorService;constructor(e,t){this.logger=e,this.requestErrorService=t}process(e){var s;(s=this.logger)!=null&&s.warn&&this.logger.warn("API ERROR",e);let t=e;typeof e=="string"&&(t=new Error(e)),this.requestErrorService&&(typeof this.requestErrorService.process<"u"?this.requestErrorService.process(t):typeof this.requestErrorService=="function"&&this.requestErrorService(t))}};var q=class u extends Error{response;request;constructor(e,t,s){super(e),this.name="RequestError",this.message=e,this.request=t,this.response=s,Error.captureStackTrace(this,u)}};async function C(u,e){if(!e)return u;let t=Array.isArray(e)?e:[e],s={...u};for(let r of t)s=await r(s);return s}async function E(u,e){if(!e)return u;let t=Array.isArray(e)?e:[e],s=u;for(let r of t)s=await r(s);return s}var R=class{requestInstance;baseURL="";timeout=3e4;cancellable=!1;rejectCancelled=!1;strategy="reject";method="get";flattenResponse=!1;defaultResponse=null;fetcher;logger;onError;requestsQueue;retry={retries:0,delay:1e3,maxDelay:3e4,backoff:1.5,retryOn:[408,409,425,429,500,502,503,504],shouldRetry:async()=>!0};config;constructor({fetcher:e=null,timeout:t=null,rejectCancelled:s=!1,strategy:r=null,flattenResponse:o=null,defaultResponse:a={},logger:n=null,onError:i=null,...l}){this.fetcher=e,this.timeout=t??this.timeout,this.strategy=r??this.strategy,this.cancellable=l.cancellable||this.cancellable,this.rejectCancelled=s||this.rejectCancelled,this.flattenResponse=o??this.flattenResponse,this.defaultResponse=a,this.logger=n||(globalThis?globalThis.console:null)||null,this.onError=i,this.requestsQueue=new WeakMap,this.baseURL=l.baseURL||l.apiUrl||"",this.method=l.method||this.method,this.config=l,this.retry={...this.retry,...l.retry||{}},this.requestInstance=this.isCustomFetcher()?e.create({...l,baseURL:this.baseURL,timeout:this.timeout}):null}getInstance(){return this.requestInstance}replaceUrlPathParams(e,t){return t?e.replace(/:[a-zA-Z]+/gi,s=>{let r=s.substring(1);return String(t[r]?t[r]:s)}):e}appendQueryParams(e,t){if(!t)return e;let s=Object.entries(t).flatMap(([r,o])=>Array.isArray(o)?o.map(a=>`${encodeURIComponent(r)}[]=${encodeURIComponent(a)}`):`${encodeURIComponent(r)}=${encodeURIComponent(String(o))}`).join("&");return e.includes("?")?`${e}&${s}`:s?`${e}?${s}`:e}isJSONSerializable(e){if(e==null)return!1;let t=typeof e;if(t==="string"||t==="number"||t==="boolean")return!0;if(t!=="object")return!1;if(Array.isArray(e))return!0;if(Buffer.isBuffer(e)||e instanceof Date)return!1;let s=Object.getPrototypeOf(e);return s===Object.prototype||s===null||typeof e.toJSON=="function"}buildConfig(e,t,s){let r=s.method||this.method,o=r.toLowerCase(),a=o==="get"||o==="head",n=this.replaceUrlPathParams(e,s.urlPathParams||this.config.urlPathParams),i=s.body||s.data||this.config.body||this.config.data;if(this.isCustomFetcher())return{...s,url:n,method:o,...a?{params:t}:{},...!a&&t&&i?{params:t}:{},...!a&&t&&!i?{data:t}:{},...!a&&i?{data:i}:{}};let l=i||t;delete s.data;let d=!a&&t&&!s.body||!t?n:this.appendQueryParams(n,t),m=d.includes("://")?"":typeof s.baseURL<"u"?s.baseURL:this.baseURL;return{...s,url:m+d,method:r.toUpperCase(),headers:{Accept:"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8",...s.headers||this.config.headers||{}},...a?{}:{body:this.isJSONSerializable(l)?typeof l=="string"?l:JSON.stringify(l):l}}}processError(e,t){if(this.isRequestCancelled(e))return;t.onError&&typeof t.onError=="function"&&t.onError(e),new g(this.logger,this.onError).process(e)}async outputErrorResponse(e,t){let s=this.isRequestCancelled(e),r=t.strategy||this.strategy,o=typeof t.rejectCancelled<"u"?t.rejectCancelled:this.rejectCancelled,a=typeof t.defaultResponse<"u"?t.defaultResponse:this.defaultResponse;return s&&!o?a:r==="silent"?(await new Promise(()=>null),a):r==="reject"?Promise.reject(e):a}isRequestCancelled(e){return e.name==="AbortError"||e.name==="CanceledError"}isCustomFetcher(){return this.fetcher!==null}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable."),{};let t=this.requestsQueue.get(e);t&&t.abort();let s=new AbortController;if(!this.isCustomFetcher()){let r=setTimeout(()=>{let o=new Error(`[TimeoutError]: The ${e.url} request was aborted due to timeout`);throw o.name="TimeoutError",o.code=23,s.abort(o),clearTimeout(r),o},e.timeout||this.timeout)}return this.requestsQueue.set(e,s),{signal:s.signal}}async request(e,t=null,s=null){var P,w,A;let r=null,o=s||{},a=this.buildConfig(e,t,o),n={...this.addCancellationToken(a),...a},{retries:i,delay:l,backoff:d,retryOn:h,shouldRetry:m,maxDelay:b}={...this.retry,...(n==null?void 0:n.retry)||{}},f=0,y=l;for(;f<=i;)try{if(n=await C(n,n.onRequest),n=await C(n,this.config.onRequest),this.isCustomFetcher())r=await this.requestInstance.request(n);else if(r=await globalThis.fetch(n.url,n),r.config=n,r.ok){let c=String(((P=r==null?void 0:r.headers)==null?void 0:P.get("Content-Type"))||""),p=null;if(!c)try{p=await r.json()}catch{}p||(c&&c.includes("application/json")?p=await r.json():typeof r.text<"u"?p=await r.text():typeof r.blob<"u"?p=await r.blob():p=r.body||r.data||null),r.data=p}else throw r.data=null,new q(`fetchf() Request Failed! Status: ${r.status||null}`,n,r);return r=await E(r,n.onResponse),r=await E(r,this.config.onResponse),this.processResponseData(r,n)}catch(c){if(f===i||!await m(c,f)||!(h!=null&&h.includes((r==null?void 0:r.status)||((w=c==null?void 0:c.response)==null?void 0:w.status)||(c==null?void 0:c.status))))return this.processError(c,n),this.outputErrorResponse(c,n);(A=this.logger)!=null&&A.warn&&this.logger.warn(`Attempt ${f+1} failed. Retrying in ${y}ms...`),await this.delay(y),y*=d,y=Math.min(y,b),f++}return this.processResponseData(r,n)}async delay(e){return new Promise(t=>setTimeout(()=>t(!0),e))}processResponseData(e,t){var o;let s=typeof t.defaultResponse<"u"?t.defaultResponse:this.defaultResponse;return e?(t.flattenResponse||this.flattenResponse)&&typeof e.data<"u"?typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:typeof e=="object"&&e.constructor===Object&&Object.keys(e).length===0?s:this.isCustomFetcher()?e:{...e,headers:Array.from(((o=e==null?void 0:e.headers)==null?void 0:o.entries())||{}).reduce((a,[n,i])=>(a[n]=i,a),{}),config:t}:s}};function Q(u){let e=u.endpoints,t=new R(u);function s(){return t.getInstance()}function r(i){return console.error(`${i} endpoint must be added to 'endpoints'.`),Promise.resolve(null)}async function o(i,l={},d={},h={}){let b={...e[i]};return await t.request(b.url,l,{...b,...h,urlPathParams:d})}function a(i){return i in n?n[i]:e[i]?n.request.bind(null,i):r.bind(null,i)}let n={config:u,endpoints:e,requestHandler:t,getInstance:s,request:o};return new Proxy(n,{get:(i,l)=>a(l)})}async function D(u,e={}){return new R(e).request(u,e.body||e.data||e.params,e)}export{Q as createApiFetcher,D as fetchf};
//# sourceMappingURL=index.mjs.map
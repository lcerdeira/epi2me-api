/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2019
 */

"use strict";function _interopDefault(e){return e&&"object"===typeof e&&"default"in e?e.default:e}var os=_interopDefault(require("os")),lodash=require("lodash"),axios=_interopDefault(require("axios")),crypto=_interopDefault(require("crypto")),tunnel=require("tunnel"),version="2019.4.30-1617";axios.defaults.validateStatus=(e=>e<=504);const UNITS=["","K","M","G","T","P","E","Z"],DIV=1e3,utils=function(){const e=(e,t)=>{e.headers||(e.headers={});let r=t;if(r||(r={}),!r.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=r.apikey,!r.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const s=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n")].join("\n"),o=crypto.createHmac("sha1",r.apisecret).update(s).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=o},t=async e=>{const t=e?e.data:null;if(!t)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let r=`Network error ${e.status}`;return t.error&&(r=t.error),504===e.status&&(r="Please check your network connection and try again."),Promise.reject(new Error(r))}return t.error?Promise.reject(new Error(t.error)):Promise.resolve(t)};return{version:version,headers:(t,r)=>{const{log:s}=lodash.merge({log:{debug:()=>{}}},r);let o=r;if(o||(o={}),t.headers=lodash.merge({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":o.user_agent||"api","X-EPI2ME-Version":o.agent_version||utils.version},t.headers),"signing"in o&&!o.signing||e(t,o),o.proxy){const e=o.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),r=e[2],n=e[3],i={host:e[4],port:e[5]};r&&n&&(i.proxyAuth=`${r}:${n}`),o.proxy.match(/^https/)?(s.debug("using HTTPS over HTTPS proxy",JSON.stringify(i)),t.httpsAgent=tunnel.httpsOverHttps({proxy:i})):(s.debug("using HTTPS over HTTP proxy",JSON.stringify(i)),t.httpsAgent=tunnel.httpsOverHttp({proxy:i})),t.proxy=!1}},get:async(e,r)=>{const{log:s}=lodash.merge({log:{debug:()=>{}}},r);let o,n=r.url,i=e;r.skip_url_mangle?o=i:(i=`/${i}`,o=(n=n.replace(/\/+$/,""))+(i=i.replace(/\/+/g,"/")));const a={url:o,gzip:!0};let c;utils.headers(a,r);try{s.debug(`GET ${a.url}`),c=await axios.get(a.url,a)}catch(l){return Promise.reject(l)}return t(c,r)},post:async(e,r,s)=>{const{log:o}=lodash.merge({log:{debug:()=>{}}},s);let n=s.url;const i={url:`${n=n.replace(/\/+$/,"")}/${e.replace(/\/+/g,"/")}`,gzip:!0,data:r,headers:{}};if(s.legacy_form){const e=[],t=lodash.merge({json:JSON.stringify(r)},r);Object.keys(t).sort().forEach(r=>{e.push(`${r}=${escape(t[r])}`)}),i.data=e.join("&"),i.headers["Content-Type"]="application/x-www-form-urlencoded"}utils.headers(i,s);const{data:a}=i;let c;delete i.data;try{o.debug(`POST ${i.url}`),c=await axios.post(i.url,a,i)}catch(l){return Promise.reject(l)}return t(c,s)},put:async(e,r,s,o)=>{const{log:n}=lodash.merge({log:{debug:()=>{}}},o);let i=o.url;const a={url:`${i=i.replace(/\/+$/,"")}/${e.replace(/\/+/g,"/")}/${r}`,gzip:!0,data:s,headers:{}};if(o.legacy_form){const e=[],t=lodash.merge({json:JSON.stringify(s)},s);Object.keys(t).sort().forEach(r=>{e.push(`${r}=${escape(t[r])}`)}),a.data=e.join("&"),a.headers["Content-Type"]="application/x-www-form-urlencoded"}utils.headers(a,o);const{data:c}=a;let l;delete a.data;try{n.debug(`PUT ${a.url}`),l=await axios.put(a.url,c,a)}catch(u){return Promise.reject(u)}return t(l,o)},niceSize(e,t){let r=t||0,s=e||0;return s>1e3?(s/=1e3,(r+=1)>=UNITS.length?"???":this.niceSize(s,r)):0===r?`${s}${UNITS[r]}`:`${s.toFixed(1)}${UNITS[r]}`}}}();var local=!1,url="https://epi2me.nanoporetech.com",user_agent="EPI2ME API",signing=!0;class REST{constructor(e){this.options=lodash.assign({agent_version:utils.version,local:local,url:url,user_agent:user_agent,signing:signing},e),this.log=this.options.log}async list(e){try{const r=await utils.get(e,this.options),s=e.match(/^[a-z_]+/i)[0];return Promise.resolve(r[`${s}s`])}catch(t){return this.log.error(`list error ${String(t)}`),Promise.reject(t)}}async read(e,t){try{const s=await utils.get(`${e}/${t}`,this.options);return Promise.resolve(s)}catch(r){return this.log.error("read",r),Promise.reject(r)}}async user(e){let t;if(this.options.local)t={accounts:[{id_user_account:"none",number:"NONE",name:"None"}]};else try{t=await utils.get("user",this.options)}catch(r){return e?e(r):Promise.reject(r)}return e?e(null,t):Promise.resolve(t)}async instanceToken(e,t){try{const s=await utils.post("token",{id_workflow_instance:e},lodash.assign({},this.options,{legacy_form:!0}));return t?t(null,s):Promise.resolve(s)}catch(r){return t?t(r):Promise.reject(r)}}async installToken(e,t){try{const s=await utils.post("token/install",{id_workflow:e},lodash.assign({},this.options,{legacy_form:!0}));return t?t(null,s):Promise.resolve(s)}catch(r){return t?t(r):Promise.reject(r)}}async attributes(e){try{const r=await this.list("attribute");return e?e(null,r):Promise.resolve(r)}catch(t){return e?e(t):Promise.reject(t)}}async workflows(e){try{const r=await this.list("workflow");return e?e(null,r):Promise.resolve(r)}catch(t){return e?e(t):Promise.reject(t)}}async amiImages(e){if(this.options.local){const t=new Error("amiImages unsupported in local mode");return e?e(t):Promise.reject(t)}try{const r=this.list("ami_image");return e?e(null,r):Promise.resolve(r)}catch(t){return e?e(t):Promise.reject(t)}}async amiImage(e,t,r){let s,o,n,i;if(e&&t&&r instanceof Function?(s=e,o=t,n=r,i="update"):e&&t instanceof Object&&!(t instanceof Function)?(s=e,o=t,i="update"):e instanceof Object&&t instanceof Function?(o=e,n=t,i="create"):e instanceof Object&&!t?(o=e,i="create"):(i="read",s=e,n=t instanceof Function?t:null),this.options.local){const e=new Error("ami_image unsupported in local mode");return n?n(e):Promise.reject(e)}if("update"===i)try{const e=await utils.put("ami_image",s,o,this.options);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}if("create"===i)try{const e=await utils.post("ami_image",o,this.options);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}if(!s){const e=new Error("no id_ami_image specified");return n?n(e):Promise.reject(e)}try{const e=await this.read("ami_image",s);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}}async workflow(e,t,r){let s,o,n,i;if(e&&t&&r instanceof Function?(s=e,o=t,n=r,i="update"):e&&t instanceof Object&&!(t instanceof Function)?(s=e,o=t,i="update"):e instanceof Object&&t instanceof Function?(o=e,n=t,i="create"):e instanceof Object&&!t?(o=e,i="create"):(i="read",s=e,n=t instanceof Function?t:null),"update"===i)try{const e=await utils.put("workflow",s,o,this.options);return n?n(null,e):Promise.resolve(e)}catch(u){return n?n(u):Promise.reject(u)}if("create"===i)try{const e=await utils.post("workflow",o,this.options);return n?n(null,e):Promise.resolve(e)}catch(u){return n?n(u):Promise.reject(u)}if(!s){const e=new Error("no workflow id specified");return n?n(e):Promise.reject(e)}const a={};try{const e=await this.read("workflow",s);if(e.error)throw new Error(e.error);lodash.merge(a,e)}catch(u){return this.log.error(`${s}: error fetching workflow ${String(u)}`),n?n(u):Promise.reject(u)}lodash.merge(a,{params:{}});try{const e=await utils.get(`workflow/config/${s}`,this.options);if(e.error)throw new Error(e.error);lodash.merge(a,e)}catch(u){return this.log.error(`${s}: error fetching workflow config ${String(u)}`),n?n(u):Promise.reject(u)}const c=lodash.filter(a.params,{widget:"ajax_dropdown"}),l=[...c.map((e,t)=>{const r=c[t];return new Promise(async(e,t)=>{const s=r.values.source.replace("{{EPI2ME_HOST}}","").replace(/&?apikey=\{\{EPI2ME_API_KEY\}\}/,"");try{const o=(await utils.get(s,this.options))[r.values.data_root];return o&&(r.values=o.map(e=>({label:e[r.values.items.label_key],value:e[r.values.items.value_key]}))),e()}catch(u){return this.log.error(`failed to fetch ${s}`),t(u)}})})];try{return await Promise.all(l),n?n(null,a):Promise.resolve(a)}catch(u){return this.log.error(`${s}: error fetching config and parameters ${String(u)}`),n?n(u):Promise.reject(u)}}async startWorkflow(e,t){return utils.post("workflow_instance",e,lodash.assign({},this.options,{legacy_form:!0}),t)}stopWorkflow(e,t){return utils.put("workflow_instance/stop",e,null,lodash.assign({},this.options,{legacy_form:!0}),t)}async workflowInstances(e,t){let r,s;if(!e||e instanceof Function||void 0!==t?(r=e,s=t):s=e,s&&s.run_id)try{const e=(await utils.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${s.run_id};`,this.options)).data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}));return r?r(null,e):Promise.resolve(e)}catch(o){return r?r(o):Promise.reject(o)}try{const e=await this.list("workflow_instance");return r?r(null,e):Promise.resolve(e)}catch(o){return r?r(o):Promise.reject(o)}}async workflowInstance(e,t){try{const s=await this.read("workflow_instance",e);return t?t(null,s):Promise.resolve(s)}catch(r){return t?t(r):Promise.reject(r)}}workflowConfig(e,t){return utils.get(`workflow/config/${e}`,this.options,t)}async register(e,t,r){let s,o;t&&t instanceof Function?o=t:(s=t,o=r);try{const t=await utils.put("reg",e,{description:s||`${os.userInfo().username}@${os.hostname()}`},lodash.assign({},this.options,{signing:!1}));return o?o(null,t):Promise.resolve(t)}catch(n){return o?o(n):Promise.reject(n)}}async datasets(e,t){let r,s;!e||e instanceof Function||void 0!==t?(r=e,s=t):s=e,s||(s={}),s.show||(s.show="mine");try{const e=await this.list(`dataset?show=${s.show}`);return r?r(null,e):Promise.resolve(e)}catch(o){return r?r(o):Promise.reject(o)}}async dataset(e,t){if(!this.options.local)try{const s=await this.read("dataset",e);return t?t(null,s):Promise.resolve(s)}catch(r){return t?t(r):Promise.reject(r)}try{const s=(await this.datasets()).find(t=>t.id_dataset===e);return t?t(null,s):Promise.resolve(s)}catch(r){return t?t(r):Promise.reject(r)}}async fetchContent(e,t){const r=lodash.assign({},this.options,{skip_url_mangle:!0});try{const o=await utils.get(e,r);return t?t(null,o):Promise.resolve(o)}catch(s){return t?t(s):Promise.reject(s)}}}module.exports=REST;

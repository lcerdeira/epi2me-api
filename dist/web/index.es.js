/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2019
 */

import e from"os";import{merge as r,assign as t,filter as o}from"lodash";import n from"axios";import s from"crypto";import{httpsOverHttps as i,httpsOverHttp as a}from"tunnel";n.defaults.validateStatus=(e=>e<=504);const c=["B","KB","MB","GB","TB","PB","EB","ZB"],l=function(){const e=(e,r)=>{e.headers||(e.headers={});let t=r;if(t||(t={}),!t.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=t.apikey,!t.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const o=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(r=>`${r}:${e.headers[r]}`).join("\n")].join("\n"),n=s.createHmac("sha1",t.apisecret).update(o).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=n},t=async e=>{const r=e?e.data:null;if(!r)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let t=`Network error ${e.status}`;return r.error&&(t=r.error),504===e.status&&(t="Please check your network connection and try again."),Promise.reject(new Error(t))}return r.error?Promise.reject(new Error(r.error)):Promise.resolve(r)};return{version:"3.0.0",headers:(t,o)=>{const{log:n}=r({log:{debug:()=>{}}},o);let s=o;if(s||(s={}),t.headers=r({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":s.user_agent||"api","X-EPI2ME-Version":s.agent_version||l.version},t.headers),"signing"in s&&!s.signing||e(t,s),s.proxy){const e=s.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),r=e[2],o=e[3],c={host:e[4],port:e[5]};r&&o&&(c.proxyAuth=`${r}:${o}`),s.proxy.match(/^https/)?(n.debug("using HTTPS over HTTPS proxy",JSON.stringify(c)),t.httpsAgent=i({proxy:c})):(n.debug("using HTTPS over HTTP proxy",JSON.stringify(c)),t.httpsAgent=a({proxy:c})),t.proxy=!1}},get:async(e,o)=>{const{log:s}=r({log:{debug:()=>{}}},o);let i,a=o.url,c=e;o.skip_url_mangle?i=c:(c=`/${c}`,i=(a=a.replace(/\/+$/,""))+(c=c.replace(/\/+/g,"/")));const u={url:i,gzip:!0};let m;l.headers(u,o);try{s.debug(`GET ${u.url}`),m=await n.get(u.url,u)}catch(p){return Promise.reject(p)}return t(m,o)},post:async(e,o,s)=>{const{log:i}=r({log:{debug:()=>{}}},s);let a=s.url;const c={url:`${a=a.replace(/\/+$/,"")}/${e.replace(/\/+/g,"/")}`,gzip:!0,data:o,headers:{}};if(s.legacy_form){const e=[],t=r({json:JSON.stringify(o)},o);Object.keys(t).sort().forEach(r=>{e.push(`${r}=${escape(t[r])}`)}),c.data=e.join("&"),c.headers["Content-Type"]="application/x-www-form-urlencoded"}l.headers(c,s);const{data:u}=c;let m;delete c.data;try{i.debug(`POST ${c.url}`),m=await n.post(c.url,u,c)}catch(p){return Promise.reject(p)}return t(m,s)},put:async(e,o,s,i)=>{const{log:a}=r({log:{debug:()=>{}}},i);let c=i.url;const u={url:`${c=c.replace(/\/+$/,"")}/${e.replace(/\/+/g,"/")}/${o}`,gzip:!0,data:s,headers:{}};if(i.legacy_form){const e=[],t=r({json:JSON.stringify(s)},s);Object.keys(t).sort().forEach(r=>{e.push(`${r}=${escape(t[r])}`)}),u.data=e.join("&"),u.headers["Content-Type"]="application/x-www-form-urlencoded"}l.headers(u,i);const{data:m}=u;let p;delete u.data;try{a.debug(`PUT ${u.url}`),p=await n.put(u.url,m,u)}catch(h){return Promise.reject(h)}return t(p,i)},niceSize(e,r){let t=r||0,o=e||0;return o>1e3?(o/=1e3,(t+=1)>=c.length?"???":this.niceSize(o,t)):0===t?`${o} ${c[t]}`:`${o.toFixed(2)} ${c[t]}`}}}();var u=!1,m="https://epi2me.nanoporetech.com",p="EPI2ME API",h=!0;export default class{constructor(e){this.options=t({agent_version:l.version,local:u,url:m,user_agent:p,signing:h},e),this.log=this.options.log}async list(e){try{const t=await l.get(e,this.options),o=e.match(/^[a-z_]+/i)[0];return Promise.resolve(t[`${o}s`])}catch(r){return this.log.error(`list error ${String(r)}`),Promise.reject(r)}}async read(e,r){try{const o=await l.get(`${e}/${r}`,this.options);return Promise.resolve(o)}catch(t){return this.log.error("read",t),Promise.reject(t)}}async user(e){let r;if(this.options.local)r={accounts:[{id_user_account:"none",number:"NONE",name:"None"}]};else try{r=await l.get("user",this.options)}catch(t){return e?e(t):Promise.reject(t)}return e?e(null,r):Promise.resolve(r)}async instanceToken(e,r){try{const n=await l.post("token",{id_workflow_instance:e},t({},this.options,{legacy_form:!0}));return r?r(null,n):Promise.resolve(n)}catch(o){return r?r(o):Promise.reject(o)}}async installToken(e,r){try{const n=await l.post("token/install",{id_workflow:e},t({},this.options,{legacy_form:!0}));return r?r(null,n):Promise.resolve(n)}catch(o){return r?r(o):Promise.reject(o)}}async attributes(e){try{const t=await this.list("attribute");return e?e(null,t):Promise.resolve(t)}catch(r){return e?e(r):Promise.reject(r)}}async workflows(e){try{const t=await this.list("workflow");return e?e(null,t):Promise.resolve(t)}catch(r){return e?e(r):Promise.reject(r)}}async amiImages(e){if(this.options.local){const r=new Error("amiImages unsupported in local mode");return e?e(r):Promise.reject(r)}try{const t=this.list("ami_image");return e?e(null,t):Promise.resolve(t)}catch(r){return e?e(r):Promise.reject(r)}}async amiImage(e,r,t){let o,n,s,i;if(e&&r&&t instanceof Function?(o=e,n=r,s=t,i="update"):e&&r instanceof Object&&!(r instanceof Function)?(o=e,n=r,i="update"):e instanceof Object&&r instanceof Function?(n=e,s=r,i="create"):e instanceof Object&&!r?(n=e,i="create"):(i="read",o=e,s=r instanceof Function?r:null),this.options.local){const e=new Error("ami_image unsupported in local mode");return s?s(e):Promise.reject(e)}if("update"===i)try{const e=await l.put("ami_image",o,n,this.options);return s?s(null,e):Promise.resolve(e)}catch(a){return s?s(a):Promise.reject(a)}if("create"===i)try{const e=await l.post("ami_image",n,this.options);return s?s(null,e):Promise.resolve(e)}catch(a){return s?s(a):Promise.reject(a)}if(!o){const e=new Error("no id_ami_image specified");return s?s(e):Promise.reject(e)}try{const e=await this.read("ami_image",o);return s?s(null,e):Promise.resolve(e)}catch(a){return s?s(a):Promise.reject(a)}}async workflow(e,n,s){let i,a,c,u;if(e&&n&&s instanceof Function?(i=e,a=n,c=s,u="update"):e&&n instanceof Object&&!(n instanceof Function)?(i=e,a=n,u="update"):e instanceof Object&&n instanceof Function?(a=e,c=n,u="create"):e instanceof Object&&!n?(a=e,u="create"):(u="read",i=e,c=n instanceof Function?n:null),"update"===u)try{const e=await l.put("workflow",i,a,t({},this.options,{legacy_form:!0}));return c?c(null,e):Promise.resolve(e)}catch(d){return c?c(d):Promise.reject(d)}if("create"===u)try{const e=await l.post("workflow",a,t({},this.options,{legacy_form:!0}));return c?c(null,e):Promise.resolve(e)}catch(d){return c?c(d):Promise.reject(d)}if(!i){const e=new Error("no workflow id specified");return c?c(e):Promise.reject(e)}const m={};try{const e=await this.read("workflow",i);if(e.error)throw new Error(e.error);r(m,e)}catch(d){return this.log.error(`${i}: error fetching workflow ${String(d)}`),c?c(d):Promise.reject(d)}r(m,{params:{}});try{const e=await l.get(`workflow/config/${i}`,this.options);if(e.error)throw new Error(e.error);r(m,e)}catch(d){return this.log.error(`${i}: error fetching workflow config ${String(d)}`),c?c(d):Promise.reject(d)}const p=o(m.params,{widget:"ajax_dropdown"}),h=[...p.map((e,r)=>{const t=p[r];return new Promise(async(e,r)=>{const o=t.values.source.replace("{{EPI2ME_HOST}}","").replace(/&?apikey=\{\{EPI2ME_API_KEY\}\}/,"");try{const n=(await l.get(o,this.options))[t.values.data_root];return n&&(t.values=n.map(e=>({label:e[t.values.items.label_key],value:e[t.values.items.value_key]}))),e()}catch(d){return this.log.error(`failed to fetch ${o}`),r(d)}})})];try{return await Promise.all(h),c?c(null,m):Promise.resolve(m)}catch(d){return this.log.error(`${i}: error fetching config and parameters ${String(d)}`),c?c(d):Promise.reject(d)}}async startWorkflow(e,r){return l.post("workflow_instance",e,t({},this.options,{legacy_form:!0}),r)}stopWorkflow(e,r){return l.put("workflow_instance/stop",e,null,t({},this.options,{legacy_form:!0}),r)}async workflowInstances(e,r){let t,o;if(!e||e instanceof Function||void 0!==r?(t=e,o=r):o=e,o&&o.run_id)try{const e=(await l.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${o.run_id};`,this.options)).data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}));return t?t(null,e):Promise.resolve(e)}catch(n){return t?t(n):Promise.reject(n)}try{const e=await this.list("workflow_instance");return t?t(null,e):Promise.resolve(e)}catch(n){return t?t(n):Promise.reject(n)}}async workflowInstance(e,r){try{const o=await this.read("workflow_instance",e);return r?r(null,o):Promise.resolve(o)}catch(t){return r?r(t):Promise.reject(t)}}workflowConfig(e,r){return l.get(`workflow/config/${e}`,this.options,r)}async register(r,o,n){let s,i;o&&o instanceof Function?i=o:(s=o,i=n);try{const o=await l.put("reg",r,{description:s||`${e.userInfo().username}@${e.hostname()}`},t({},this.options,{signing:!1}));return i?i(null,o):Promise.resolve(o)}catch(a){return i?i(a):Promise.reject(a)}}async datasets(e,r){let t,o;!e||e instanceof Function||void 0!==r?(t=e,o=r):o=e,o||(o={}),o.show||(o.show="mine");try{const e=await this.list(`dataset?show=${o.show}`);return t?t(null,e):Promise.resolve(e)}catch(n){return t?t(n):Promise.reject(n)}}async dataset(e,r){if(!this.options.local)try{const o=await this.read("dataset",e);return r?r(null,o):Promise.resolve(o)}catch(t){return r?r(t):Promise.reject(t)}try{const o=(await this.datasets()).find(r=>r.id_dataset===e);return r?r(null,o):Promise.resolve(o)}catch(t){return r?r(t):Promise.reject(t)}}async fetchContent(e,r){const o=t({},this.options,{skip_url_mangle:!0});try{const t=await l.get(e,o);return r?r(null,t):Promise.resolve(t)}catch(n){return r?r(n):Promise.reject(n)}}}
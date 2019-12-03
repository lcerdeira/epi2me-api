/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2019
 */

import{merge as e,assign as t,filter as r,every as s,isFunction as o,defaults as n}from"lodash";import i from"aws-sdk";import a from"proxy-agent";import c from"core-js/features/promise";import l from"axios";import u from"crypto";import{httpsOverHttps as h,httpsOverHttp as g}from"tunnel";import p from"os";l.defaults.validateStatus=e=>e<=504;const d=function(){const t=(e,t)=>{e.headers||(e.headers={});let r=t;if(r||(r={}),!r.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=r.apikey,!r.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const s=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n")].join("\n"),o=u.createHmac("sha1",r.apisecret).update(s).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=o},r=async e=>{const t=e?e.data:null;if(!t)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let r=`Network error ${e.status}`;return t.error&&(r=t.error),504===e.status&&(r="Please check your network connection and try again."),Promise.reject(new Error(r))}return t.error?Promise.reject(new Error(t.error)):Promise.resolve(t)};return{version:"3.0.1355",headers:(r,s)=>{const{log:o}=e({log:{debug:()=>{}}},s);let n=s;if(n||(n={}),r.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":n.user_agent||"api","X-EPI2ME-Version":n.agent_version||d.version},r.headers,n.headers),"signing"in n&&!n.signing||t(r,n),n.proxy){const e=n.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),t=e[2],s=e[3],i={host:e[4],port:e[5]};t&&s&&(i.proxyAuth=`${t}:${s}`),n.proxy.match(/^https/)?(o.debug("using HTTPS over HTTPS proxy",JSON.stringify(i)),r.httpsAgent=h({proxy:i})):(o.debug("using HTTPS over HTTP proxy",JSON.stringify(i)),r.httpsAgent=g({proxy:i})),r.proxy=!1}},get:async(t,s)=>{const{log:o}=e({log:{debug:()=>{}}},s);let n,i=s.url,a=t;s.skip_url_mangle?n=a:(a=`/${a}`,n=(i=i.replace(/\/+$/,""))+(a=a.replace(/\/+/g,"/")));const c={url:n,gzip:!0};let u;d.headers(c,s);try{o.debug(`GET ${c.url}`),u=await l.get(c.url,c)}catch(h){return Promise.reject(h)}return r(u,s)},post:async(t,s,o)=>{const{log:n}=e({log:{debug:()=>{}}},o);let i=o.url;const a={url:`${i=i.replace(/\/+$/,"")}/${t.replace(/\/+/g,"/")}`,gzip:!0,data:s,headers:{}};if(o.legacy_form){const t=[],r=e({json:JSON.stringify(s)},s);Object.keys(r).sort().forEach(e=>{t.push(`${e}=${escape(r[e])}`)}),a.data=t.join("&"),a.headers["Content-Type"]="application/x-www-form-urlencoded"}d.headers(a,o);const{data:c}=a;let u;delete a.data;try{n.debug(`POST ${a.url}`),u=await l.post(a.url,c,a)}catch(h){return Promise.reject(h)}return r(u,o)},put:async(t,s,o,n)=>{const{log:i}=e({log:{debug:()=>{}}},n);let a=n.url;const c={url:`${a=a.replace(/\/+$/,"")}/${t.replace(/\/+/g,"/")}/${s}`,gzip:!0,data:o,headers:{}};if(n.legacy_form){const t=[],r=e({json:JSON.stringify(o)},o);Object.keys(r).sort().forEach(e=>{t.push(`${e}=${escape(r[e])}`)}),c.data=t.join("&"),c.headers["Content-Type"]="application/x-www-form-urlencoded"}d.headers(c,n);const{data:u}=c;let h;delete c.data;try{i.debug(`PUT ${c.url}`),h=await l.put(c.url,u,c)}catch(g){return Promise.reject(g)}return r(h,n)}}}(),f=(e,t)=>{const r=["","K","M","G","T","P","E","Z"];let s=t||0,o=e||0;return o>=1e3?(o/=1e3,(s+=1)>=r.length?"???":f(o,s)):0===s?`${o}${r[s]}`:`${o.toFixed(1)}${r[s]}`};var m=!1,w="https://epi2me.nanoporetech.com",y="EPI2ME API",v=!0,P={local:m,url:w,gqlUrl:"https://graphql.epi2me-dev.nanoporetech.com",user_agent:y,region:"eu-west-1",sessionGrace:5,uploadTimeout:1200,downloadTimeout:1200,fileCheckInterval:5,downloadCheckInterval:3,stateCheckInterval:60,inFlightDelay:600,waitTimeSeconds:20,waitTokenError:30,transferPoolSize:3,downloadMode:"data+telemetry",filetype:[".fastq",".fq",".fastq.gz",".fq.gz"],signing:v};class k{constructor(e){this.options=t({agent_version:d.version,local:m,url:w,user_agent:y,signing:v},e),this.log=this.options.log}async list(e){try{const t=await d.get(e,this.options),r=e.match(/^[a-z_]+/i)[0];return Promise.resolve(t[`${r}s`])}catch(t){return this.log.error(`list error ${String(t)}`),Promise.reject(t)}}async read(e,t){try{const r=await d.get(`${e}/${t}`,this.options);return Promise.resolve(r)}catch(r){return this.log.error("read",r),Promise.reject(r)}}async user(e){let t;if(this.options.local)t={accounts:[{id_user_account:"none",number:"NONE",name:"None"}]};else try{t=await d.get("user",this.options)}catch(r){return e?e(r):Promise.reject(r)}return e?e(null,t):Promise.resolve(t)}async status(){try{const e=await d.get("status",this.options);return Promise.resolve(e)}catch(e){return Promise.reject(e)}}async instanceToken(r,s){try{const o=await d.post("token",e(s,{id_workflow_instance:r}),t({},this.options,{legacy_form:!0}));return Promise.resolve(o)}catch(o){return Promise.reject(o)}}async installToken(e,r){try{const s=await d.post("token/install",{id_workflow:e},t({},this.options,{legacy_form:!0}));return r?r(null,s):Promise.resolve(s)}catch(s){return r?r(s):Promise.reject(s)}}async attributes(e){try{const t=await this.list("attribute");return e?e(null,t):Promise.resolve(t)}catch(t){return e?e(t):Promise.reject(t)}}async workflows(e){try{const t=await this.list("workflow");return e?e(null,t):Promise.resolve(t)}catch(t){return e?e(t):Promise.reject(t)}}async amiImages(e){if(this.options.local){const t=new Error("amiImages unsupported in local mode");return e?e(t):Promise.reject(t)}try{const t=this.list("ami_image");return e?e(null,t):Promise.resolve(t)}catch(t){return e?e(t):Promise.reject(t)}}async amiImage(e,t,r){let s,o,n,i;if(e&&t&&r instanceof Function?(s=e,o=t,n=r,i="update"):e&&t instanceof Object&&!(t instanceof Function)?(s=e,o=t,i="update"):e instanceof Object&&t instanceof Function?(o=e,n=t,i="create"):e instanceof Object&&!t?(o=e,i="create"):(i="read",s=e,n=t instanceof Function?t:null),this.options.local){const e=new Error("ami_image unsupported in local mode");return n?n(e):Promise.reject(e)}if("update"===i)try{const e=await d.put("ami_image",s,o,this.options);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}if("create"===i)try{const e=await d.post("ami_image",o,this.options);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}if(!s){const e=new Error("no id_ami_image specified");return n?n(e):Promise.reject(e)}try{const e=await this.read("ami_image",s);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}}async workflow(t,s,o){let n,i,a,c;if(t&&s&&o instanceof Function?(n=t,i=s,a=o,c="update"):t&&s instanceof Object&&!(s instanceof Function)?(n=t,i=s,c="update"):t instanceof Object&&s instanceof Function?(i=t,a=s,c="create"):t instanceof Object&&!s?(i=t,c="create"):(c="read",n=t,a=s instanceof Function?s:null),"update"===c)try{const e=await d.put("workflow",n,i,this.options);return a?a(null,e):Promise.resolve(e)}catch(g){return a?a(g):Promise.reject(g)}if("create"===c)try{const e=await d.post("workflow",i,this.options);return a?a(null,e):Promise.resolve(e)}catch(g){return a?a(g):Promise.reject(g)}if(!n){const e=new Error("no workflow id specified");return a?a(e):Promise.reject(e)}const l={};try{const t=await this.read("workflow",n);if(t.error)throw new Error(t.error);e(l,t)}catch(g){return this.log.error(`${n}: error fetching workflow ${String(g)}`),a?a(g):Promise.reject(g)}e(l,{params:{}});try{const t=await d.get(`workflow/config/${n}`,this.options);if(t.error)throw new Error(t.error);e(l,t)}catch(g){return this.log.error(`${n}: error fetching workflow config ${String(g)}`),a?a(g):Promise.reject(g)}const u=r(l.params,{widget:"ajax_dropdown"}),h=[...u.map((e,t)=>{const r=u[t];return new Promise((e,t)=>{const s=r.values.source.replace("{{EPI2ME_HOST}}","").replace(/&?apikey=\{\{EPI2ME_API_KEY\}\}/,"");d.get(s,this.options).then(t=>{const s=t[r.values.data_root];return s&&(r.values=s.map(e=>({label:e[r.values.items.label_key],value:e[r.values.items.value_key]}))),e()}).catch(e=>(this.log.error(`failed to fetch ${s}`),t(e)))})})];try{return await Promise.all(h),a?a(null,l):Promise.resolve(l)}catch(g){return this.log.error(`${n}: error fetching config and parameters ${String(g)}`),a?a(g):Promise.reject(g)}}async startWorkflow(e,r){return d.post("workflow_instance",e,t({},this.options,{legacy_form:!0}),r)}stopWorkflow(e,r){return d.put("workflow_instance/stop",e,null,t({},this.options,{legacy_form:!0}),r)}async workflowInstances(e,t){let r,s;if(!e||e instanceof Function||void 0!==t?(r=e,s=t):s=e,s&&s.run_id)try{const e=(await d.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${s.run_id};`,this.options)).data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}));return r?r(null,e):Promise.resolve(e)}catch(o){return r?r(o):Promise.reject(o)}try{const e=await this.list("workflow_instance");return r?r(null,e):Promise.resolve(e)}catch(o){return r?r(o):Promise.reject(o)}}async workflowInstance(e,t){try{const r=await this.read("workflow_instance",e);return t?t(null,r):Promise.resolve(r)}catch(r){return t?t(r):Promise.reject(r)}}workflowConfig(e,t){return d.get(`workflow/config/${e}`,this.options,t)}async register(e,r,s){let o,n;r&&r instanceof Function?n=r:(o=r,n=s);try{const r=await d.put("reg",e,{description:o||`${p.userInfo().username}@${p.hostname()}`},t({},this.options,{signing:!1}));return n?n(null,r):Promise.resolve(r)}catch(i){return n?n(i):Promise.reject(i)}}async datasets(e,t){let r,s;!e||e instanceof Function||void 0!==t?(r=e,s=t):s=e,s||(s={}),s.show||(s.show="mine");try{const e=await this.list(`dataset?show=${s.show}`);return r?r(null,e):Promise.resolve(e)}catch(o){return r?r(o):Promise.reject(o)}}async dataset(e,t){if(!this.options.local)try{const r=await this.read("dataset",e);return t?t(null,r):Promise.resolve(r)}catch(r){return t?t(r):Promise.reject(r)}try{const r=(await this.datasets()).find(t=>t.id_dataset===e);return t?t(null,r):Promise.resolve(r)}catch(r){return t?t(r):Promise.reject(r)}}async fetchContent(e,r){const s=t({},this.options,{skip_url_mangle:!0,headers:{"Content-Type":""}});try{const t=await d.get(e,s);return r?r(null,t):Promise.resolve(t)}catch(o){return r?r(o):Promise.reject(o)}}}class j{constructor(t){let r;if((r="string"===typeof t||"object"===typeof t&&t.constructor===String?JSON.parse(t):t||{}).log){if(!s([r.log.info,r.log.warn,r.log.error,r.log.debug,r.log.json],o))throw new Error("expected log object to have error, debug, info, warn and json methods");this.log=r.log}else this.log={info:e=>{console.info(`[${(new Date).toISOString()}] INFO: ${e}`)},debug:e=>{console.debug(`[${(new Date).toISOString()}] DEBUG: ${e}`)},warn:e=>{console.warn(`[${(new Date).toISOString()}] WARN: ${e}`)},error:e=>{console.error(`[${(new Date).toISOString()}] ERROR: ${e}`)},json:e=>{console.log(JSON.stringify(e))}};this.stopped=!0,this.states={upload:{filesCount:0,success:{files:0,bytes:0,reads:0},types:{},niceTypes:"",progress:{bytes:0,total:0}},download:{progress:{},success:{files:0,reads:0,bytes:0},fail:0,types:{},niceTypes:""},warnings:[]},this.config={options:n(r,P),instance:{id_workflow_instance:r.id_workflow_instance,inputQueueName:null,outputQueueName:null,outputQueueURL:null,discoverQueueCache:{},bucket:null,bucketFolder:null,remote_addr:null,chain:null,key_id:null}},this.config.instance.awssettings={region:this.config.options.region},this.REST=new k(e({},{log:this.log},this.config.options)),this.timers={downloadCheckInterval:null,stateCheckInterval:null,fileCheckInterval:null,transferTimeouts:{},visibilityIntervals:{},summaryTelemetryInterval:null}}async stopEverything(){this.stopped=!0,this.log.debug("stopping watchers"),["downloadCheckInterval","stateCheckInterval","fileCheckInterval","summaryTelemetryInterval"].forEach(e=>{this.timers[e]&&(this.log.debug(`clearing ${e} interval`),clearInterval(this.timers[e]),this.timers[e]=null)}),Object.keys(this.timers.transferTimeouts).forEach(e=>{this.log.debug(`clearing transferTimeout for ${e}`),clearTimeout(this.timers.transferTimeouts[e]),delete this.timers.transferTimeouts[e]}),Object.keys(this.timers.visibilityIntervals).forEach(e=>{this.log.debug(`clearing visibilityInterval for ${e}`),clearInterval(this.timers.visibilityIntervals[e]),delete this.timers.visibilityIntervals[e]}),this.downloadWorkerPool&&(this.log.debug("clearing downloadWorkerPool"),await c.all(Object.values(this.downloadWorkerPool)),this.downloadWorkerPool=null);const{id_workflow_instance:e}=this.config.instance;if(e){try{await this.REST.stopWorkflow(e)}catch(t){return this.log.error(`Error stopping instance: ${String(t)}`),c.reject(t)}this.log.info(`workflow instance ${e} stopped`)}return c.resolve()}async session(e,t){let r=!1;if(e&&e.length&&(r=!0),!r){if(this.sessioning)return c.resolve();if(this.states.sts_expiration&&this.states.sts_expiration>Date.now())return c.resolve();this.sessioning=!0}let s=null;try{await this.fetchInstanceToken(e,t)}catch(o){s=o,this.log.error(`session error ${String(s)}`)}finally{r||(this.sessioning=!1)}return s?c.reject(s):c.resolve()}async fetchInstanceToken(e,t){if(!this.config.instance.id_workflow_instance)return c.reject(new Error("must specify id_workflow_instance"));this.log.debug("new instance token needed");try{const r=await this.REST.instanceToken(this.config.instance.id_workflow_instance,t);this.log.debug(`allocated new instance token expiring at ${r.expiration}`),this.states.sts_expiration=new Date(r.expiration).getTime()-60*this.config.options.sessionGrace,this.config.options.proxy&&i.config.update({httpOptions:{agent:a(this.config.options.proxy,!0)}}),i.config.update(this.config.instance.awssettings),i.config.update(r),e&&e.forEach(e=>{try{e.config.update(r)}catch(t){this.log.warn(`failed to update config on ${String(e)}: ${String(t)}`)}})}catch(r){this.log.warn(`failed to fetch instance token: ${String(r)}`)}return c.resolve()}async sessionedS3(e){return await this.session(null,e),new i.S3({useAccelerateEndpoint:"on"===this.config.options.awsAcceleration})}async sessionedSQS(e){return await this.session(null,e),new i.SQS}reportProgress(){const{upload:e,download:t}=this.states;this.log.json({progress:{download:t,upload:e}})}storeState(e,t,r,s){const o=s||{};this.states[e]||(this.states[e]={}),this.states[e][t]||(this.states[e][t]={}),"incr"===r?Object.keys(o).forEach(r=>{this.states[e][t][r]=this.states[e][t][r]?this.states[e][t][r]+parseInt(o[r],10):parseInt(o[r],10)}):Object.keys(o).forEach(r=>{this.states[e][t][r]=this.states[e][t][r]?this.states[e][t][r]-parseInt(o[r],10):-parseInt(o[r],10)});try{this.states[e].success.niceReads=f(this.states[e].success.reads)}catch(i){this.states[e].success.niceReads=0}try{this.states[e].progress.niceSize=f(this.states[e].success.bytes+this.states[e].progress.bytes||0)}catch(i){this.states[e].progress.niceSize=0}try{this.states[e].success.niceSize=f(this.states[e].success.bytes)}catch(i){this.states[e].success.niceSize=0}this.states[e].niceTypes=Object.keys(this.states[e].types||{}).sort().map(t=>`${this.states[e].types[t]} ${t}`).join(", ");const n=Date.now();(!this.stateReportTime||n-this.stateReportTime>2e3)&&(this.stateReportTime=n,this.reportProgress())}uploadState(e,t,r){return this.storeState("upload",e,t,r)}downloadState(e,t,r){return this.storeState("download",e,t,r)}async deleteMessage(e){try{const t=await this.discoverQueue(this.config.instance.outputQueueName);return(await this.sessionedSQS()).deleteMessage({QueueUrl:t,ReceiptHandle:e.ReceiptHandle}).promise()}catch(t){return this.log.error(`deleteMessage exception: ${String(t)}`),this.states.download.failure||(this.states.download.failure={}),this.states.download.failure[t]=this.states.download.failure[t]?this.states.download.failure[t]+1:1,c.reject(t)}}async discoverQueue(e){if(this.config.instance.discoverQueueCache[e])return c.resolve(this.config.instance.discoverQueueCache[e]);let t;this.log.debug(`discovering queue for ${e}`);try{const r=await this.sessionedSQS();t=await r.getQueueUrl({QueueName:e}).promise()}catch(r){return this.log.error(`Error: failed to find queue for ${e}: ${String(r)}`),c.reject(r)}return this.log.debug(`found queue ${t.QueueUrl}`),this.config.instance.discoverQueueCache[e]=t.QueueUrl,c.resolve(t.QueueUrl)}async queueLength(e){if(!e)return c.reject(new Error("no queueURL specified"));const t=e.match(/([\w\-_]+)$/)[0];this.log.debug(`querying queue length of ${t}`);try{const t=await this.sessionedSQS(),r=await t.getQueueAttributes({QueueUrl:e,AttributeNames:["ApproximateNumberOfMessages"]}).promise();if(r&&r.Attributes&&"ApproximateNumberOfMessages"in r.Attributes){let e=r.Attributes.ApproximateNumberOfMessages;return e=parseInt(e,10)||0,c.resolve(e)}return c.reject(new Error("unexpected response"))}catch(r){return this.log.error(`error in getQueueAttributes ${String(r)}`),c.reject(r)}}url(){return this.config.options.url}apikey(){return this.config.options.apikey}attr(e,t){if(!(e in this.config.options))throw new Error(`config object does not contain property ${e}`);return t?(this.config.options[e]=t,this):this.config.options[e]}stats(e){return this.states[e]}}j.version=d.version,j.REST=k,j.utils=d;export default j;

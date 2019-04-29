/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2019
 */

import{merge as e,isString as t,assign as s,filter as o,every as r,isFunction as i,defaults as n,isArray as a}from"lodash";import l from"aws-sdk";import c,{mkdirp as u}from"fs-extra";import h,{EOL as d}from"os";import g from"path";import p from"proxy-agent";import f from"core-js/features/promise";import w from"axios";import m from"crypto";import{httpsOverHttps as y,httpsOverHttp as k}from"tunnel";import S from"sqlite";w.defaults.validateStatus=(e=>e<=504);const $=["","K","M","G","T","P","E","Z"],b=function(){const t=(e,t)=>{e.headers||(e.headers={});let s=t;if(s||(s={}),!s.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=s.apikey,!s.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const o=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n")].join("\n"),r=m.createHmac("sha1",s.apisecret).update(o).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=r},s=async e=>{const t=e?e.data:null;if(!t)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let s=`Network error ${e.status}`;return t.error&&(s=t.error),504===e.status&&(s="Please check your network connection and try again."),Promise.reject(new Error(s))}return t.error?Promise.reject(new Error(t.error)):Promise.resolve(t)};return{version:"2019.4.29-933",headers:(s,o)=>{const{log:r}=e({log:{debug:()=>{}}},o);let i=o;if(i||(i={}),s.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":i.user_agent||"api","X-EPI2ME-Version":i.agent_version||b.version},s.headers),"signing"in i&&!i.signing||t(s,i),i.proxy){const e=i.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),t=e[2],o=e[3],n={host:e[4],port:e[5]};t&&o&&(n.proxyAuth=`${t}:${o}`),i.proxy.match(/^https/)?(r.debug("using HTTPS over HTTPS proxy",JSON.stringify(n)),s.httpsAgent=y({proxy:n})):(r.debug("using HTTPS over HTTP proxy",JSON.stringify(n)),s.httpsAgent=k({proxy:n})),s.proxy=!1}},get:async(t,o)=>{const{log:r}=e({log:{debug:()=>{}}},o);let i,n=o.url,a=t;o.skip_url_mangle?i=a:(a=`/${a}`,i=(n=n.replace(/\/+$/,""))+(a=a.replace(/\/+/g,"/")));const l={url:i,gzip:!0};let c;b.headers(l,o);try{r.debug(`GET ${l.url}`),c=await w.get(l.url,l)}catch(u){return Promise.reject(u)}return s(c,o)},post:async(t,o,r)=>{const{log:i}=e({log:{debug:()=>{}}},r);let n=r.url;const a={url:`${n=n.replace(/\/+$/,"")}/${t.replace(/\/+/g,"/")}`,gzip:!0,data:o,headers:{}};if(r.legacy_form){const t=[],s=e({json:JSON.stringify(o)},o);Object.keys(s).sort().forEach(e=>{t.push(`${e}=${escape(s[e])}`)}),a.data=t.join("&"),a.headers["Content-Type"]="application/x-www-form-urlencoded"}b.headers(a,r);const{data:l}=a;let c;delete a.data;try{i.debug(`POST ${a.url}`),c=await w.post(a.url,l,a)}catch(u){return Promise.reject(u)}return s(c,r)},put:async(t,o,r,i)=>{const{log:n}=e({log:{debug:()=>{}}},i);let a=i.url;const l={url:`${a=a.replace(/\/+$/,"")}/${t.replace(/\/+/g,"/")}/${o}`,gzip:!0,data:r,headers:{}};if(i.legacy_form){const t=[],s=e({json:JSON.stringify(r)},r);Object.keys(s).sort().forEach(e=>{t.push(`${e}=${escape(s[e])}`)}),l.data=t.join("&"),l.headers["Content-Type"]="application/x-www-form-urlencoded"}b.headers(l,i);const{data:c}=l;let u;delete l.data;try{n.debug(`PUT ${l.url}`),u=await w.put(l.url,c,l)}catch(h){return Promise.reject(h)}return s(u,i)},niceSize(e,t){let s=t||0,o=e||0;return o>1e3?(o/=1e3,(s+=1)>=$.length?"???":this.niceSize(o,s)):0===s?`${o}${$[s]}`:`${o.toFixed(1)}${$[s]}`}}}();const v={fastq:function(e){return new Promise(async(t,s)=>{let o,r=1,i={size:0};try{i=await c.stat(e)}catch(n){s(n)}c.createReadStream(e).on("data",e=>{o=-1,r-=1;do{o=e.indexOf(10,o+1),r+=1}while(-1!==o)}).on("end",()=>t({type:"fastq",bytes:i.size,reads:Math.floor(r/4)})).on("error",s)})},fasta:function(e){return new Promise(async(t,s)=>{let o,r=1,i={size:0};try{i=await c.stat(e)}catch(n){s(n)}c.createReadStream(e).on("data",e=>{o=-1,r-=1;do{o=e.indexOf(62,o+1),r+=1}while(-1!==o)}).on("end",()=>t({type:"fasta",bytes:i.size,sequences:Math.floor(r/2)})).on("error",s)})},default:async function(e){return c.stat(e).then(e=>({type:"bytes",bytes:e.size}))}};function _(e){if("string"!==typeof e&&!(e instanceof String))return Promise.resolve({});let t=g.extname(e).toLowerCase().replace(/^[.]/,"");return"fq"===t?t="fastq":"fa"===t&&(t="fasta"),v[t]||(t="default"),v[t](e)}b.pipe=(async(e,t,s,o)=>{let r=s.url,i=`/${e}`;const n={uri:(r=r.replace(/\/+$/,""))+(i=i.replace(/\/+/g,"/")),gzip:!0,headers:{"Accept-Encoding":"gzip",Accept:"application/gzip"}};return b.headers(n,s),s.proxy&&(n.proxy=s.proxy),o&&(n.onUploadProgress=o),n.responseType="stream",new Promise(async(e,s)=>{try{const r=c.createWriteStream(t);(await w.get(n.uri,n)).data.pipe(r),r.on("finish",e(t)),r.on("error",s(new Error("writer failed")))}catch(o){s(o)}})}),b.countFileReads=(e=>_(e).then(e=>e.reads));let P=0;b.getFileID=(()=>`FILE_${P+=1}`),b.lsFolder=((e,s,o,r="")=>c.readdir(e).then(i=>{let n=i;s&&(n=n.filter(s));let a=[];const l=[],u=n.map(s=>c.stat(g.join(e,s)).then(i=>{if(i.isDirectory())return a.push(g.join(e,s)),Promise.resolve();if(i.isFile()&&(!o||g.extname(s)===o)){const o={name:g.parse(s).base,path:g.join(e,s),size:i.size,id:b.getFileID()},n=e.replace(r,"").replace("\\","").replace("/","");return t(n)&&n.length&&(o.batch=n),l.push(o),Promise.resolve()}return Promise.resolve()}));return Promise.all(u).then(()=>(a=a.sort(),Promise.resolve({files:l,folders:a}))).catch(e=>Promise.reject(new Error(`error listing folder ${e}`)))})),b.loadInputFiles=(({inputFolder:e,outputFolder:t,uploadedFolder:s,filetype:o},r,i)=>new Promise((r,n)=>{const a=e=>{const o=g.basename(e);return!(e.split(g.sep).filter(e=>e.match(/^[.]/)).length||"downloads"===o||"uploaded"===o||"skip"===o||"fail"===o||s&&o===g.basename(s)||t&&o===g.basename(t)||"tmp"===o||i&&i(e))};let l=[e];const c=()=>{l&&l.length&&b.lsFolder(l.splice(0,1)[0],a,o,e).then(({files:e,folders:t})=>{e&&e.length?r(e):(l=[...t,...l]).length?c():r([])}).catch(e=>{n(new Error(`Failed to check for new files: ${e.message}`))})};c()}));var j=!1,I="https://epi2me.nanoporetech.com",E="EPI2ME API",x=!0,F={local:j,url:I,user_agent:E,region:"eu-west-1",sessionGrace:5,uploadTimeout:1200,downloadTimeout:1200,fileCheckInterval:5,downloadCheckInterval:3,stateCheckInterval:60,inFlightDelay:600,waitTimeSeconds:20,waitTokenError:30,transferPoolSize:3,downloadMode:"data+telemetry",filetype:".fastq",signing:x};class T{constructor(e){this.options=s({agent_version:b.version,local:j,url:I,user_agent:E,signing:x},e),this.log=this.options.log}async list(e){try{const s=await b.get(e,this.options),o=e.match(/^[a-z_]+/i)[0];return Promise.resolve(s[`${o}s`])}catch(t){return this.log.error(`list error ${String(t)}`),Promise.reject(t)}}async read(e,t){try{const o=await b.get(`${e}/${t}`,this.options);return Promise.resolve(o)}catch(s){return this.log.error("read",s),Promise.reject(s)}}async user(e){let t;if(this.options.local)t={accounts:[{id_user_account:"none",number:"NONE",name:"None"}]};else try{t=await b.get("user",this.options)}catch(s){return e?e(s):Promise.reject(s)}return e?e(null,t):Promise.resolve(t)}async instanceToken(e,t){try{const r=await b.post("token",{id_workflow_instance:e},s({},this.options,{legacy_form:!0}));return t?t(null,r):Promise.resolve(r)}catch(o){return t?t(o):Promise.reject(o)}}async installToken(e,t){try{const r=await b.post("token/install",{id_workflow:e},s({},this.options,{legacy_form:!0}));return t?t(null,r):Promise.resolve(r)}catch(o){return t?t(o):Promise.reject(o)}}async attributes(e){try{const s=await this.list("attribute");return e?e(null,s):Promise.resolve(s)}catch(t){return e?e(t):Promise.reject(t)}}async workflows(e){try{const s=await this.list("workflow");return e?e(null,s):Promise.resolve(s)}catch(t){return e?e(t):Promise.reject(t)}}async amiImages(e){if(this.options.local){const t=new Error("amiImages unsupported in local mode");return e?e(t):Promise.reject(t)}try{const s=this.list("ami_image");return e?e(null,s):Promise.resolve(s)}catch(t){return e?e(t):Promise.reject(t)}}async amiImage(e,t,s){let o,r,i,n;if(e&&t&&s instanceof Function?(o=e,r=t,i=s,n="update"):e&&t instanceof Object&&!(t instanceof Function)?(o=e,r=t,n="update"):e instanceof Object&&t instanceof Function?(r=e,i=t,n="create"):e instanceof Object&&!t?(r=e,n="create"):(n="read",o=e,i=t instanceof Function?t:null),this.options.local){const e=new Error("ami_image unsupported in local mode");return i?i(e):Promise.reject(e)}if("update"===n)try{const e=await b.put("ami_image",o,r,this.options);return i?i(null,e):Promise.resolve(e)}catch(a){return i?i(a):Promise.reject(a)}if("create"===n)try{const e=await b.post("ami_image",r,this.options);return i?i(null,e):Promise.resolve(e)}catch(a){return i?i(a):Promise.reject(a)}if(!o){const e=new Error("no id_ami_image specified");return i?i(e):Promise.reject(e)}try{const e=await this.read("ami_image",o);return i?i(null,e):Promise.resolve(e)}catch(a){return i?i(a):Promise.reject(a)}}async workflow(t,s,r){let i,n,a,l;if(t&&s&&r instanceof Function?(i=t,n=s,a=r,l="update"):t&&s instanceof Object&&!(s instanceof Function)?(i=t,n=s,l="update"):t instanceof Object&&s instanceof Function?(n=t,a=s,l="create"):t instanceof Object&&!s?(n=t,l="create"):(l="read",i=t,a=s instanceof Function?s:null),"update"===l)try{const e=await b.put("workflow",i,n,this.options);return a?a(null,e):Promise.resolve(e)}catch(d){return a?a(d):Promise.reject(d)}if("create"===l)try{const e=await b.post("workflow",n,this.options);return a?a(null,e):Promise.resolve(e)}catch(d){return a?a(d):Promise.reject(d)}if(!i){const e=new Error("no workflow id specified");return a?a(e):Promise.reject(e)}const c={};try{const t=await this.read("workflow",i);if(t.error)throw new Error(t.error);e(c,t)}catch(d){return this.log.error(`${i}: error fetching workflow ${String(d)}`),a?a(d):Promise.reject(d)}e(c,{params:{}});try{const t=await b.get(`workflow/config/${i}`,this.options);if(t.error)throw new Error(t.error);e(c,t)}catch(d){return this.log.error(`${i}: error fetching workflow config ${String(d)}`),a?a(d):Promise.reject(d)}const u=o(c.params,{widget:"ajax_dropdown"}),h=[...u.map((e,t)=>{const s=u[t];return new Promise(async(e,t)=>{const o=s.values.source.replace("{{EPI2ME_HOST}}","").replace(/&?apikey=\{\{EPI2ME_API_KEY\}\}/,"");try{const r=(await b.get(o,this.options))[s.values.data_root];return r&&(s.values=r.map(e=>({label:e[s.values.items.label_key],value:e[s.values.items.value_key]}))),e()}catch(d){return this.log.error(`failed to fetch ${o}`),t(d)}})})];try{return await Promise.all(h),a?a(null,c):Promise.resolve(c)}catch(d){return this.log.error(`${i}: error fetching config and parameters ${String(d)}`),a?a(d):Promise.reject(d)}}async startWorkflow(e,t){return b.post("workflow_instance",e,s({},this.options,{legacy_form:!0}),t)}stopWorkflow(e,t){return b.put("workflow_instance/stop",e,null,s({},this.options,{legacy_form:!0}),t)}async workflowInstances(e,t){let s,o;if(!e||e instanceof Function||void 0!==t?(s=e,o=t):o=e,o&&o.run_id)try{const e=(await b.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${o.run_id};`,this.options)).data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}));return s?s(null,e):Promise.resolve(e)}catch(r){return s?s(r):Promise.reject(r)}try{const e=await this.list("workflow_instance");return s?s(null,e):Promise.resolve(e)}catch(r){return s?s(r):Promise.reject(r)}}async workflowInstance(e,t){try{const o=await this.read("workflow_instance",e);return t?t(null,o):Promise.resolve(o)}catch(s){return t?t(s):Promise.reject(s)}}workflowConfig(e,t){return b.get(`workflow/config/${e}`,this.options,t)}async register(e,t,o){let r,i;t&&t instanceof Function?i=t:(r=t,i=o);try{const t=await b.put("reg",e,{description:r||`${h.userInfo().username}@${h.hostname()}`},s({},this.options,{signing:!1}));return i?i(null,t):Promise.resolve(t)}catch(n){return i?i(n):Promise.reject(n)}}async datasets(e,t){let s,o;!e||e instanceof Function||void 0!==t?(s=e,o=t):o=e,o||(o={}),o.show||(o.show="mine");try{const e=await this.list(`dataset?show=${o.show}`);return s?s(null,e):Promise.resolve(e)}catch(r){return s?s(r):Promise.reject(r)}}async dataset(e,t){if(!this.options.local)try{const o=await this.read("dataset",e);return t?t(null,o):Promise.resolve(o)}catch(s){return t?t(s):Promise.reject(s)}try{const o=(await this.datasets()).find(t=>t.id_dataset===e);return t?t(null,o):Promise.resolve(o)}catch(s){return t?t(s):Promise.reject(s)}}async fetchContent(e,t){const o=s({},this.options,{skip_url_mangle:!0});try{const s=await b.get(e,o);return t?t(null,s):Promise.resolve(s)}catch(r){return t?t(r):Promise.reject(r)}}}class O extends T{async workflows(e){if(!this.options.local)return super.workflows(e);const t=g.join(this.options.url,"workflows");let s;try{return s=(await c.readdir(t)).filter(e=>c.statSync(g.join(t,e)).isDirectory()).map(e=>g.join(t,e,"workflow.json")).map(e=>c.readJsonSync(e)),e?e(null,s):Promise.resolve(s)}catch(o){return this.log.warn(o),e?e(void 0):Promise.reject(void 0)}}async workflow(e,t,s){if(!this.options.local||!e||"object"===typeof e||s)return super.workflow(e,t,s);const o=g.join(this.options.url,"workflows"),r=g.join(o,e,"workflow.json");try{const e=await c.readJson(r);return s?s(null,e):Promise.resolve(e)}catch(i){return s?s(i):Promise.reject(i)}}async workflowInstances(e,t){if(!this.options.local)return super.workflowInstances(e,t);let s,o;if(!e||e instanceof Function||void 0!==t?(s=e,o=t):o=e,o){const e=new Error("querying of local instances unsupported in local mode");return s?s(e):Promise.reject(e)}const r=g.join(this.options.url,"instances");try{let e=await c.readdir(r);return e=(e=e.filter(e=>c.statSync(g.join(r,e)).isDirectory())).map(e=>{const t=g.join(r,e,"workflow.json");let s;try{s=c.readJsonSync(t)}catch(o){s={id_workflow:"-",description:"-",rev:"0.0"}}return s.id_workflow_instance=e,s.filename=t,s}),s?s(null,e):Promise.resolve(e)}catch(i){return s?s(i):Promise.reject(i)}}async datasets(e,t){if(!this.options.local)return super.datasets(e,t);let s,o;if(!e||e instanceof Function||void 0!==t?(s=e,o=t):o=e,o||(o={}),o.show||(o.show="mine"),"mine"!==o.show)return s(new Error("querying of local datasets unsupported in local mode"));const r=g.join(this.options.url,"datasets");try{let e=await c.readdir(r);e=e.filter(e=>c.statSync(g.join(r,e)).isDirectory());let t=0;return e=e.sort().map(e=>({is_reference_dataset:!0,summary:null,dataset_status:{status_label:"Active",status_value:"active"},size:0,prefix:e,id_workflow_instance:null,id_account:null,is_consented_human:null,data_fields:null,component_id:null,uuid:e,is_shared:!1,id_dataset:t+=1,id_user:null,last_modified:null,created:null,name:e,source:e,attributes:null})),s?s(null,e):Promise.resolve(e)}catch(i){return this.log.warn(i),s?s(null,[]):Promise.resolve([])}}async bundleWorkflow(e,t,s){return b.pipe(`workflow/bundle/${e}.tar.gz`,t,this.options,s)}}class M{constructor(e){this.db=u(e).then(()=>S.open(g.join(e,"db.sqlite"),{Promise:Promise}).then(e=>e.migrate()))}async uploadFile(e){return(await this.db).run("INSERT INTO uploads VALUES(?)",e)}async skipFile(e){return(await this.db).run("INSERT INTO skips VALUES(?)",e)}async seenUpload(e){return(await this.db).get("SELECT * FROM uploads u, skips s WHERE u.filename=? OR s.filename=? LIMIT 1",e,e)}}class N{constructor(t){let s;if((s="string"===typeof t||"object"===typeof t&&t.constructor===String?JSON.parse(t):t||{}).log){if(!r([s.log.info,s.log.warn,s.log.error,s.log.debug],i))throw new Error('expected log object to have "error", "debug", "info" and "warn" methods');this.log=s.log}else this.log={info:e=>{console.info(`[${(new Date).toISOString()}] INFO: ${e}`)},debug:e=>{console.debug(`[${(new Date).toISOString()}] DEBUG: ${e}`)},warn:e=>{console.warn(`[${(new Date).toISOString()}] WARN: ${e}`)},error:e=>{console.error(`[${(new Date).toISOString()}] ERROR: ${e}`)}};this.states={upload:{filesCount:0,success:{files:0,bytes:0,reads:0},failure:{},types:{},niceTypes:"",progress:{bytes:0,total:0}},download:{progress:{},success:{files:0,reads:0,bytes:0},fail:0,failure:{},types:{},niceTypes:""},warnings:[]},this.config={options:n(s,F),instance:{id_workflow_instance:s.id_workflow_instance,inputQueueName:null,outputQueueName:null,outputQueueURL:null,discoverQueueCache:{},bucket:null,bucketFolder:null,remote_addr:null,chain:null,key_id:null}},this.config.instance.awssettings={region:this.config.options.region},this.config.options.inputFolder&&(this.config.options.uploadedFolder&&"+uploaded"!==this.config.options.uploadedFolder?this.uploadTo=this.config.options.uploadedFolder:this.uploadTo=g.join(this.config.options.inputFolder,"uploaded"),this.skipTo=g.join(this.config.options.inputFolder,"skip")),this.REST=new O(e({},{log:this.log},this.config.options))}async stopEverything(){this.log.debug("stopping watchers"),this.downloadCheckInterval&&(this.log.debug("clearing downloadCheckInterval interval"),clearInterval(this.downloadCheckInterval),this.downloadCheckInterval=null),this.stateCheckInterval&&(this.log.debug("clearing stateCheckInterval interval"),clearInterval(this.stateCheckInterval),this.stateCheckInterval=null),this.fileCheckInterval&&(this.log.debug("clearing fileCheckInterval interval"),clearInterval(this.fileCheckInterval),this.fileCheckInterval=null),this.downloadWorkerPool&&(this.log.debug("clearing downloadWorkerPool"),await f.all(Object.values(this.downloadWorkerPool)),this.downloadWorkerPool=null);const{id_workflow_instance:e}=this.config.instance;if(e){try{await this.REST.stopWorkflow(e)}catch(t){return this.log.error(`Error stopping instance: ${String(t)}`),f.reject(t)}this.log.info(`workflow instance ${e} stopped`)}return f.resolve()}async session(){if(this.sessioning)return f.resolve();if(!this.states.sts_expiration||this.states.sts_expiration&&this.states.sts_expiration<=Date.now()){this.sessioning=!0;try{await this.fetchInstanceToken(),this.sessioning=!1}catch(e){return this.sessioning=!1,this.log.error(`session error ${String(e)}`),f.reject(e)}}return f.resolve()}async fetchInstanceToken(){if(!this.config.instance.id_workflow_instance)return f.reject(new Error("must specify id_workflow_instance"));if(this.states.sts_expiration&&this.states.sts_expiration>Date.now())return f.resolve();this.log.debug("new instance token needed");try{const t=await this.REST.instanceToken(this.config.instance.id_workflow_instance);this.log.debug(`allocated new instance token expiring at ${t.expiration}`),this.states.sts_expiration=new Date(t.expiration).getTime()-60*this.config.options.sessionGrace,this.config.options.proxy&&l.config.update({httpOptions:{agent:p(this.config.options.proxy,!0)}}),l.config.update(this.config.instance.awssettings),l.config.update(t)}catch(e){this.log.warn(`failed to fetch instance token: ${String(e)}`)}return f.resolve()}async sessionedS3(){return await this.session(),new l.S3({useAccelerateEndpoint:"on"===this.config.options.awsAcceleration})}async sessionedSQS(){return await this.session(),new l.SQS}reportProgress(){const{upload:e,download:t}=this.states;this.log.info(`Progress: ${JSON.stringify({progress:{download:t,upload:e}})}`)}async autoStart(e,t){let s;try{s=await this.REST.startWorkflow(e)}catch(o){const e=`Failed to start workflow: ${String(o)}`;return this.log.warn(e),t?t(e):f.reject(o)}return this.config.workflow=JSON.parse(JSON.stringify(e)),this.log.debug("instance",JSON.stringify(s)),this.log.debug("workflow config",JSON.stringify(this.config.workflow)),this.autoConfigure(s,t)}async autoJoin(e,t){let s;this.config.instance.id_workflow_instance=e;try{s=await this.REST.workflowInstance(e)}catch(o){const e=`Failed to join workflow instance: ${String(o)}`;return this.log.warn(e),t?t(e):f.reject(o)}return"stopped"===s.state?(this.log.warn(`workflow ${e} is already stopped`),t?t("could not join workflow"):f.reject(new Error("could not join workflow"))):(this.config.workflow=this.config.workflow||{},this.log.debug("instance",JSON.stringify(s)),this.log.debug("workflow config",JSON.stringify(this.config.workflow)),this.autoConfigure(s,t))}async autoConfigure(e,t){if(["id_workflow_instance","id_workflow","remote_addr","key_id","bucket","user_defined"].forEach(t=>{this.config.instance[t]=e[t]}),this.config.instance.inputQueueName=e.inputqueue,this.config.instance.outputQueueName=e.outputqueue,this.config.instance.awssettings.region=e.region||this.config.options.region,this.config.instance.bucketFolder=`${e.outputqueue}/${e.id_user}/${e.id_workflow_instance}`,e.chain)if("object"===typeof e.chain)this.config.instance.chain=e.chain;else try{this.config.instance.chain=JSON.parse(e.chain)}catch(i){throw new Error(`exception parsing chain JSON ${String(i)}`)}if(!this.config.options.inputFolder)throw new Error("must set inputFolder");if(!this.config.options.outputFolder)throw new Error("must set outputFolder");if(!this.config.instance.bucketFolder)throw new Error("bucketFolder must be set");if(!this.config.instance.inputQueueName)throw new Error("inputQueueName must be set");if(!this.config.instance.outputQueueName)throw new Error("outputQueueName must be set");this.db=new M(this.config.options.inputFolder),c.mkdirpSync(this.config.options.outputFolder);const s=this.config.instance.id_workflow_instance?`telemetry-${this.config.instance.id_workflow_instance}.log`:"telemetry.log",o=g.join(this.config.options.outputFolder,"epi2me-logs"),r=g.join(o,s);return c.mkdirp(o,e=>{if(e&&!String(e).match(/EEXIST/))this.log.error(`error opening telemetry log stream: mkdirpException:${String(e)}`);else try{this.telemetryLogStream=c.createWriteStream(r,{flags:"a"}),this.log.info(`logging telemetry to ${r}`)}catch(t){this.log.error(`error opening telemetry log stream: ${String(t)}`)}}),t&&t(null,this.config.instance),this.downloadCheckInterval=setInterval(()=>{this.checkForDownloads()},1e3*this.config.options.downloadCheckInterval),this.stateCheckInterval=setInterval(async()=>{try{const s=await this.REST.workflowInstance(this.config.instance.id_workflow_instance);if("stopped"===s.state){this.log.warn(`instance was stopped remotely at ${s.stop_date}. shutting down the workflow.`);try{const t=await this.stopEverything();"function"===typeof t.config.options.remoteShutdownCb&&t.config.options.remoteShutdownCb(`instance was stopped remotely at ${s.stop_date}`)}catch(e){this.log.error(`Error whilst stopping: ${String(e)}`)}}}catch(t){this.log.warn(`failed to check instance state: ${t&&t.error?t.error:t}`)}},1e3*this.config.options.stateCheckInterval),await this.session(),this.reportProgress(),this.loadUploadFiles(),this.fileCheckInterval=setInterval(this.loadUploadFiles.bind(this),1e3*this.config.options.fileCheckInterval),f.resolve(e)}async checkForDownloads(){if(this.checkForDownloadsRunning)return this.log.debug("checkForDownloads already running"),f.resolve();this.checkForDownloadsRunning=!0;try{const t=await this.discoverQueue(this.config.instance.outputQueueName),s=await this.queueLength(t);if(s)return this.log.debug(`downloads available: ${s}`),await this.downloadAvailable(),this.checkForDownloadsRunning=!1,f.resolve();this.log.debug("no downloads available")}catch(e){this.log.warn(`checkForDownloads error ${String(e)}`),this.states.download.failure||(this.states.download.failure={}),this.states.download.failure[e]=this.states.download.failure[e]?this.states.download.failure[e]+1:1}return this.checkForDownloadsRunning=!1,f.resolve()}async downloadAvailable(){const e=Object.keys(this.downloadWorkerPool||{}).length;if(e>=this.config.options.transferPoolSize)return this.log.debug(`${e} downloads already queued`),f.resolve();let t;try{const o=await this.discoverQueue(this.config.instance.outputQueueName);this.log.debug("fetching messages");const r=await this.sessionedSQS();t=await r.receiveMessage({AttributeNames:["All"],QueueUrl:o,VisibilityTimeout:this.config.options.inFlightDelay,MaxNumberOfMessages:this.config.options.transferPoolSize-e,WaitTimeSeconds:this.config.options.waitTimeSeconds}).promise()}catch(s){return this.log.error(`receiveMessage exception: ${String(s)}`),this.states.download.failure[s]=this.states.download.failure[s]?this.states.download.failure[s]+1:1,f.reject(s)}return this.receiveMessages(t)}storeState(e,t,s,o){const r=o||{};this.states[e]||(this.states[e]={}),this.states[e][t]||(this.states[e][t]={}),"incr"===s?Object.keys(r).forEach(s=>{this.states[e][t][s]=this.states[e][t][s]?this.states[e][t][s]+parseInt(r[s],10):parseInt(r[s],10)}):Object.keys(r).forEach(s=>{this.states[e][t][s]=this.states[e][t][s]?this.states[e][t][s]-parseInt(r[s],10):-parseInt(r[s],10)});try{this.states[e].success.niceReads=b.niceSize(this.states[e].success.reads)}catch(n){this.states[e].success.niceReads=0}try{this.states[e].progress.niceSize=b.niceSize(this.states[e].success.bytes+this.states[e].progress.bytes||0)}catch(n){this.states[e].progress.niceSize=0}try{this.states[e].success.niceSize=b.niceSize(this.states[e].success.bytes)}catch(n){this.states[e].success.niceSize=0}this.states[e].niceTypes=Object.keys(this.states[e].types||{}).sort().map(t=>`${this.states[e].types[t]} ${t}`).join(", ");const i=Date.now();(!this.stateReportTime||i-this.stateReportTime>2e3)&&(this.stateReportTime=i,this.reportProgress())}uploadState(e,t,s){return this.storeState("upload",e,t,s)}downloadState(e,t,s){return this.storeState("download",e,t,s)}async loadUploadFiles(){if(this.dirScanInProgress)return f.resolve();this.dirScanInProgress=!0,this.log.debug("upload: started directory scan");try{const t=e=>this.db.seenUpload(e),s=await b.loadInputFiles(this.config.options,this.log,t);let o=0;const r=()=>new f(async e=>{if(o>this.config.options.transferPoolSize)return void setTimeout(e,1e3);const t=s.splice(0,this.config.options.transferPoolSize-o);o+=t.length;try{await this.enqueueUploadFiles(t)}catch(r){this.log.error(`upload: exception in enqueueUploadFiles: ${String(r)}`)}o-=t.length,e()});for(;s.length;)await r()}catch(e){this.log.error(`upload: exception in loadInputFiles: ${String(e)}`)}return this.dirScanInProgress=!1,this.log.debug("upload: finished directory scan"),f.resolve()}async enqueueUploadFiles(e){let t,s=0,o=0,r={};if(!a(e)||!e.length)return f.resolve();if("workflow"in this.config)if("workflow_attributes"in this.config.workflow)r=this.config.workflow.workflow_attributes;else if("attributes"in this.config.workflow){let{attributes:e}=this.config.workflow.attributes;if(e||(e={}),"epi2me:max_size"in e&&(r.max_size=parseInt(e["epi2me:max_size"],10)),"epi2me:max_files"in e&&(r.max_files=parseInt(e["epi2me:max_files"],10)),"epi2me:category"in e){e["epi2me:category"].includes("storage")&&(r.requires_storage=!0)}}if("requires_storage"in r&&r.requires_storage&&!("storage_account"in this.config.workflow))return t="ERROR: Workflow requires storage enabled. Please provide a valid storage account [ --storage ].",this.log.error(t),this.states.warnings.push(t),f.resolve();if("max_size"in r&&(o=parseInt(r.max_size,10)),"max_files"in r&&(s=parseInt(r.max_files,10),e.length>s))return t=`ERROR: ${e.length} files found. Workflow can only accept ${s}. Please move the extra files away.`,this.log.error(t),this.states.warnings.push(t),f.resolve();this.log.info(`upload: enqueueUploadFiles: ${e.length} new files`),this.states.upload.filesCount+=e.length;const i=e.map(async e=>{const r=e;if(s&&this.states.upload.filesCount>s)t=`Maximum ${s} file(s) already uploaded. Moving ${r.name} into skip folder`,this.log.error(t),this.states.warnings.push(t),this.states.upload.filesCount-=1,r.skip="SKIP_TOO_MANY";else if(o&&r.size>o)t=`${r.name} is over ${o.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}. Moving into skip folder`,r.skip="SKIP_TOO_BIG",this.states.upload.filesCount-=1,this.log.error(t),this.states.warnings.push(t);else try{r.stats=await _(r.path)}catch(i){this.error(`failed to stat ${r.path}: ${String(i)}`)}return this.uploadJob(r)});try{return await f.all(i),this.log.info(`upload: inputBatchQueue (${i.length} jobs) complete`),this.loadUploadFiles()}catch(n){return this.log.error(`upload: enqueueUploadFiles exception ${String(n)}`),f.reject(n)}}async uploadJob(t){if("skip"in t)return this.db.skipFile(t.path);let s,o;try{this.log.info(`upload: ${t.id} starting`),s=await this.uploadHandler(t),this.log.info(`upload: ${s.id} uploaded and notified`)}catch(r){o=r,this.log.error(`upload: ${t.id} done, but failed: ${String(o)}`)}if(s||(s={}),o)this.log.error(`uploadJob ${o}`),this.states.upload.failure||(this.states.upload.failure={}),this.states.upload.failure[o]=this.states.upload.failure[o]?this.states.upload.failure[o]+1:1;else if(this.uploadState("success","incr",e({files:1},s.stats)),s.name){const e=g.extname(s.name);this.uploadState("types","incr",{[e]:1})}return f.resolve()}async receiveMessages(e){return e&&e.Messages&&e.Messages.length?(this.downloadWorkerPool||(this.downloadWorkerPool={}),e.Messages.forEach(e=>{new f((t,s)=>{this.downloadWorkerPool[e.MessageId]=1;const o=setTimeout(()=>{this.log.error(`this.downloadWorkerPool timeoutHandle. Clearing queue slot for message: ${e.MessageId}`),s(new Error("download timed out"))},1e3*(60+this.config.options.downloadTimeout));this.processMessage(e).then(()=>{t()}).catch(e=>{this.log.error(`processMessage ${String(e)}`),t()}).finally(()=>{clearTimeout(o)})}).then(()=>{delete this.downloadWorkerPool[e.MessageId]})}),this.log.info(`downloader queued ${e.Messages.length} messages for processing`),f.resolve()):(this.log.info("complete (empty)"),f.resolve())}async deleteMessage(e){try{const s=await this.discoverQueue(this.config.instance.outputQueueName);return(await this.sessionedSQS()).deleteMessage({QueueUrl:s,ReceiptHandle:e.ReceiptHandle}).promise()}catch(t){return this.log.error(`deleteMessage exception: ${String(t)}`),this.states.download.failure[t]=this.states.download.failure[t]?this.states.download.failure[t]+1:1,f.reject(t)}}async processMessage(e){let t,s;if(!e)return this.log.debug("download.processMessage: empty message"),f.resolve();"Attributes"in e&&("ApproximateReceiveCount"in e.Attributes?this.log.debug(`download.processMessage: ${e.MessageId} / ${e.Attributes.ApproximateReceiveCount}`):this.log.debug(`download.processMessage: ${e.MessageId} / NA `));try{t=JSON.parse(e.Body)}catch(a){this.log.error(`error parsing JSON message.Body from message: ${JSON.stringify(e)} ${String(a)}`);try{await this.deleteMessage(e)}catch(l){this.log.error(`Exception deleting message: ${String(l)}`)}return f.resolve()}if(t.telemetry){const{telemetry:s}=t;if(s.tm_path)try{this.log.debug(`download.processMessage: ${e.MessageId} fetching telemetry`);const o=await this.sessionedS3(),r=await o.getObject({Bucket:t.bucket,Key:s.tm_path}).promise();this.log.info(`download.processMessage: ${e.MessageId} fetched telemetry`),s.batch=r.Body.toString("utf-8").split("\n").filter(e=>e&&e.length>0).map(e=>{try{return JSON.parse(e)}catch(l){return this.log.error(`Telemetry Batch JSON Parse error: ${String(l)}`),e}})}catch(u){this.log.error(`Could not fetch telemetry JSON: ${String(u)}`)}try{this.telemetryLogStream.write(JSON.stringify(s)+d)}catch(h){this.log.error(`error writing telemetry: ${h}`)}this.config.options.telemetryCb&&this.config.options.telemetryCb(s)}if(!t.path)return this.log.warn("nothing to download"),f.resolve();const o=t.path.match(/[\w\W]*\/([\w\W]*?)$/),r=o?o[1]:"";if(s=this.config.options.outputFolder,t.telemetry&&t.telemetry.hints&&t.telemetry.hints.folder){this.log.debug(`using folder hint ${t.telemetry.hints.folder}`);const e=t.telemetry.hints.folder.split("/").map(e=>e.toUpperCase());s=g.join.apply(null,[s,...e])}c.mkdirpSync(s);const i=g.join(s,r);if("data+telemetry"===this.config.options.downloadMode){this.log.debug(`download.processMessage: ${e.MessageId} downloading ${t.path} to ${i}`);const s=await this.sessionedS3(),o=new f(async o=>{this.initiateDownloadStream(s,t,e,i,o)});return await o,this.log.info(`download.processMessage: ${e.MessageId} downloaded ${t.path} to ${i}`),f.resolve()}try{await this.deleteMessage(e)}catch(l){this.log.error(`Exception deleting message: ${String(l)}`)}const n=t.telemetry.batch_summary&&t.telemetry.batch_summary.reads_num?t.telemetry.batch_summary.reads_num:1;return this.downloadState("success","incr",{files:1,reads:n}),f.resolve()}initiateDownloadStream(t,s,o,r,i){let n,a,l,u;const h=()=>{if("on"===this.config.options.filter)try{c.remove(r,e=>{e?this.log.warn(`failed to remove file: ${r}`):this.log.warn(`removed failed download file: ${r} ${e}`)})}catch(e){this.log.warn(`failed to remove file. unlinkException: ${r} ${String(e)}`)}},d=()=>{if(!n.networkStreamError)try{n.networkStreamError=1,n.close(),h(),u.destroy&&(this.log.error(`destroying readstream for ${r}`),u.destroy())}catch(e){this.log.error(`error handling sream error: ${e.message}`)}};try{const e={Bucket:s.bucket,Key:s.path};n=c.createWriteStream(r);const o=t.getObject(e);o.on("httpHeaders",(e,t)=>{this.downloadState("progress","incr",{total:parseInt(t["content-length"],10)})}),u=o.createReadStream()}catch(f){return this.log.error(`getObject/createReadStream exception: ${String(f)}`),void(i&&i())}u.on("error",e=>{this.log.error(`error in download readstream ${e}`);try{d()}catch(t){this.log.error(`error handling readStreamError: ${t}`)}}),n.on("finish",async()=>{if(!n.networkStreamError){this.log.debug(`downloaded ${r}`);try{const s=g.extname(r),o=await _(r);this.downloadState("success","incr",e({files:1},o)),this.downloadState("types","incr",{[s]:1}),this.downloadState("progress","decr",{total:o.bytes,bytes:o.bytes})}catch(t){this.log.warn(`failed to stat ${r}: ${String(t)}`)}try{this.reportProgress();const e=!(!s.telemetry||!s.telemetry.json)&&s.telemetry.json.exit_status;e&&this.config.options.dataCb&&this.config.options.dataCb(r,e)}catch(t){this.log.warn(`failed to fs.stat file: ${t}`)}try{await this.deleteMessage(o)}catch(i){this.log.error(`Exception deleting message: ${String(i)}`)}}}),n.on("close",e=>{this.log.debug(`closing writeStream ${r}`),e&&this.log.error(`error closing writestream ${e}`),clearTimeout(a),clearInterval(l),setTimeout(this.checkForDownloads.bind(this)),i()}),n.on("error",e=>{this.log.error(`error in download write stream ${e}`),d()});const p=()=>{this.log.warn("transfer timed out"),d()};a=setTimeout(p,1e3*this.config.options.downloadTimeout);l=setInterval(async()=>{const e=this.config.instance.outputQueueURL,t=o.ReceiptHandle;this.log.debug({message_id:o.MessageId},"updateVisibility");try{await this.sqs.changeMessageVisibility({QueueUrl:e,ReceiptHandle:t,VisibilityTimeout:this.config.options.inFlightDelay}).promise()}catch(s){this.log.error({message_id:o.MessageId,queue:e,error:s},"Error setting visibility"),clearInterval(l)}},900*this.config.options.inFlightDelay),u.on("data",e=>{clearTimeout(a),a=setTimeout(p,1e3*this.config.options.downloadTimeout),this.downloadState("progress","incr",{bytes:e.length})}).pipe(n)}async uploadHandler(e){const t=await this.sessionedS3();let s;const o=g.join(this.config.options.inputFolder,e.name),r=`${this.config.instance.bucketFolder}/component-0/${e.name}/${e.name}`;let i;return new f((n,a)=>{const l=()=>{s&&!s.closed&&s.close(),a(new Error(`${e.name} timed out`))};i=setTimeout(l,1e3*(this.config.options.uploadTimeout+5));try{s=c.createReadStream(o)}catch(u){return clearTimeout(i),void a(u)}s.on("error",e=>{s.close();let t="error in upload readstream";e&&e.message&&(t+=`: ${e.message}`),clearTimeout(i),a(new Error(t))}),s.on("open",()=>{const o={Bucket:this.config.instance.bucket,Key:r,Body:s};this.config.instance.key_id&&(o.SSEKMSKeyId=this.config.instance.key_id,o.ServerSideEncryption="aws:kms"),e.size&&(o["Content-Length"]=e.size),this.uploadState("progress","incr",{total:e.size});let c=0;const u=t.upload(o,{partSize:10485760,queueSize:1});u.on("httpUploadProgress",e=>{this.uploadState("progress","incr",{bytes:e.loaded-c}),c=e.loaded,clearTimeout(i),i=setTimeout(l,1e3*(this.config.options.uploadTimeout+5))}),u.promise().then(()=>{this.log.info(`${e.id} S3 upload complete`),s.close(),clearTimeout(i),this.uploadComplete(r,e).then(()=>{n(e)}).catch(e=>{a(e)}).finally(()=>{this.uploadState("progress","decr",{total:e.size,bytes:e.size})})}).catch(t=>{this.log.warn(`${e.id} uploadStreamError ${t}`),a(t)})})})}async discoverQueue(e){if(this.config.instance.discoverQueueCache[e])return f.resolve(this.config.instance.discoverQueueCache[e]);let t;this.log.debug(`discovering queue for ${e}`);try{const o=await this.sessionedSQS();t=await o.getQueueUrl({QueueName:e}).promise()}catch(s){return this.log.error(`Error: failed to find queue for ${e}: ${String(s)}`),f.reject(s)}return this.log.debug(`found queue ${t.QueueUrl}`),this.config.instance.discoverQueueCache[e]=t.QueueUrl,f.resolve(t.QueueUrl)}async uploadComplete(e,t){this.log.info(`${t.id} uploaded to S3: ${e}`);const s={bucket:this.config.instance.bucket,outputQueue:this.config.instance.outputQueueName,remote_addr:this.config.instance.remote_addr,user_defined:this.config.instance.user_defined||null,apikey:this.config.options.apikey,id_workflow_instance:this.config.instance.id_workflow_instance,id_master:this.config.instance.id_workflow,utc:(new Date).toISOString(),path:e,prefix:e.substring(0,e.lastIndexOf("/"))};if(this.config.instance.chain)try{s.components=JSON.parse(JSON.stringify(this.config.instance.chain.components)),s.targetComponentId=this.config.instance.chain.targetComponentId}catch(o){return this.log.error(`${t.id} exception parsing components JSON ${String(o)}`),f.reject(o)}if(this.config.instance.key_id&&(s.key_id=this.config.instance.key_id),this.config.options.agent_address)try{s.agent_address=JSON.parse(this.config.options.agent_address)}catch(r){this.log.error(`${t.id} Could not parse agent_address ${String(r)}`)}s.components&&Object.keys(s.components).forEach(e=>{"uploadMessageQueue"===s.components[e].inputQueueName&&(s.components[e].inputQueueName=this.uploadMessageQueue),"downloadMessageQueue"===s.components[e].inputQueueName&&(s.components[e].inputQueueName=this.downloadMessageQueue)});try{const e=await this.discoverQueue(this.config.instance.inputQueueName),o=await this.sessionedSQS();this.log.info(`${t.id} sending SQS message to input queue`),await o.sendMessage({QueueUrl:e,MessageBody:JSON.stringify(s)}).promise()}catch(i){return this.log.error(`${t.id} exception sending SQS message: ${String(i)}`),f.reject(i)}return this.log.info(`${t.id} SQS message sent. Move to uploaded`),this.db.uploadFile(t.path)}async queueLength(e){if(!e)return f.resolve();const t=e.match(/([\w\-_]+)$/)[0];this.log.debug(`querying queue length of ${t}`);try{const t=await this.sessionedSQS(),o=await t.getQueueAttributes({QueueUrl:e,AttributeNames:["ApproximateNumberOfMessages"]}).promise();if(o&&o.Attributes&&"ApproximateNumberOfMessages"in o.Attributes){let e=o.Attributes.ApproximateNumberOfMessages;return e=parseInt(e,10)||0,f.resolve(e)}}catch(s){return this.log.error(`error in getQueueAttributes ${String(s)}`),f.reject(s)}return f.resolve()}url(){return this.config.options.url}apikey(){return this.config.options.apikey}attr(e,t){if(!(e in this.config.options))throw new Error(`config object does not contain property ${e}`);return t?(this.config.options[e]=t,this):this.config.options[e]}stats(e){return this.states[e]}}N.version=b.version,N.REST=O;export default N;

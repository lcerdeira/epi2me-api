/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2019
 */

import{merge as e,isString as t,isArray as o,assign as s,every as i,isFunction as r,filter as n,defaults as a,chain as l}from"lodash";import c from"aws-sdk";import u from"fs-extra";import d,{EOL as h}from"os";import g from"path";import p from"proxy-agent";import f from"axios";import m from"crypto";f.defaults.validateStatus=(e=>e<=504);const w=function(){const t=(e,t)=>{e.headers||(e.headers={});let o=t;if(o||(o={}),!o.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=o.apikey,!o.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const s=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n")].join("\n"),i=m.createHmac("sha1",o.apisecret).update(s).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=i},o=async e=>{const t=e?e.data:null;if(!t)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let o=`Network error ${e.status}`;return t.error&&(o=t.error),504===e.status&&(o="Please check your network connection and try again."),Promise.reject(new Error(o))}return t.error?Promise.reject(new Error(t.error)):Promise.resolve(t)};return{version:"3.0.0",headers:(o,s)=>{let i=s;i||(i={}),o.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":i.user_agent||"api","X-EPI2ME-Version":i.agent_version||w.version},o.headers),"signing"in i&&!i.signing||t(o,i),i.proxy&&(o.proxy=i.proxy)},get:async(e,t)=>{let s,i=t.url,r=e;t.skip_url_mangle?s=r:(r=`/${r}`,s=(i=i.replace(/\/+$/,""))+(r=r.replace(/\/+/g,"/")));const n={url:s,gzip:!0};let a;w.headers(n,t);try{a=await f.get(n.url,n)}catch(l){return Promise.reject(l)}return o(a,t)},post:async(e,t,s)=>{let i=s.url;const r={url:`${i=i.replace(/\/+$/,"")}/${e.replace(/\/+/g,"/")}`,gzip:!0,data:t};if(s.legacy_form){const e={};e.json=JSON.stringify(t),t&&"object"===typeof t&&Object.keys(t).forEach(o=>{e[o]=t[o]}),r.form=e}let n;w.headers(r,s);try{n=await f.post(r.url,r.data,r)}catch(a){return Promise.reject(a)}return o(n,s)},put:async(e,t,s,i)=>{let r=i.url;const n={url:`${r=r.replace(/\/+$/,"")}/${e.replace(/\/+/g,"/")}/${t}`,gzip:!0,data:s};let a;i.legacy_form&&(n.form={json:JSON.stringify(s)}),w.headers(n,i);try{a=await f.put(n.url,n.data,n)}catch(l){return Promise.reject(l)}return o(a,i)}}}();w.pipe=(async(e,t,o,s)=>{let i=o.url,r=`/${e}`;const n={uri:(i=i.replace(/\/+$/,""))+(r=r.replace(/\/+/g,"/")),gzip:!0,headers:{"Accept-Encoding":"gzip",Accept:"application/gzip"}};return w.headers(n,o),o.proxy&&(n.proxy=o.proxy),s&&(n.onUploadProgress=s),n.responseType="stream",new Promise(async(e,o)=>{try{const i=u.createWriteStream(t);(await f.get(n.uri,n)).data.pipe(i),i.on("finish",e(t)),i.on("error",o(new Error("writer failed")))}catch(s){o(s)}})}),w.countFileReads=(e=>new Promise((t,o)=>{let s,i=1;u.createReadStream(e).on("data",e=>{s=-1,i-=1;do{s=e.indexOf(10,s+1),i+=1}while(-1!==s)}).on("end",()=>t(Math.floor(i/4))).on("error",o)})),w.findSuitableBatchIn=(async e=>{await u.mkdirp(e);const t=async()=>{const t=`batch_${Date.now()}`,o=g.join(e,t);return u.mkdirp(o)};let o=await u.readdir(e);if(!(o=o.filter(e=>"batch_"===e.slice(0,"batch_".length)))||!o.length)return t();const s=g.join(e,o.pop());return u.readdirSync(s).length<4e3?s:t()});let y=0;w.getFileID=(()=>`FILE_${y+=1}`),w.lsFolder=((e,o,s,i="")=>u.readdir(e).then(r=>{let n=r;o&&(n=n.filter(o));let a=[];const l=[],c=n.map(o=>u.stat(g.join(e,o)).then(r=>{if(r.isDirectory())return a.push(g.join(e,o)),Promise.resolve();if(r.isFile()&&(!s||g.extname(o)===s)){const s={name:g.parse(o).base,path:g.join(e,o),size:r.size,id:w.getFileID()},n=e.replace(i,"").replace("\\","").replace("/","");return t(n)&&n.length&&(s.batch=n),l.push(s),Promise.resolve()}return Promise.resolve()}));return Promise.all(c).then(()=>(a=a.sort(),Promise.resolve({files:l,folders:a}))).catch(e=>Promise.reject(new Error(`error listing folder ${e}`)))})),w.loadInputFiles=(({inputFolder:e,outputFolder:t,uploadedFolder:s,filetype:i},r=[])=>new Promise((n,a)=>{const l=e=>{const i=g.basename(e);return!("downloads"===i||"uploaded"===i||"skip"===i||"fail"===i||s&&i===g.basename(s)||t&&i===g.basename(t)||"tmp"===i||o(r)&&r.indexOf(g.posix.basename(e))>-1)};let c=[e];const u=()=>{c&&c.length&&w.lsFolder(c.splice(0,1)[0],l,i,e).then(({files:e,folders:t})=>{e&&e.length?n(e):(c=[...t,...c]).length?u():n()}).catch(e=>{a(new Error(`Failed to check for new files: ${e.message}`))})};u()}));var k=!1,_="https://epi2me.nanoporetech.com",S="EPI2ME API",$=!0,v={local:k,url:_,user_agent:S,region:"eu-west-1",retention:"on",sessionGrace:5,sortInputFiles:!1,uploadTimeout:1200,downloadTimeout:1200,fileCheckInterval:5,downloadCheckInterval:3,stateCheckInterval:60,inFlightDelay:600,waitTimeSeconds:20,waitTokenError:30,downloadPoolSize:1,filter:"on",filterByChannel:"off",downloadMode:"data+telemetry",deleteOnComplete:"off",filetype:".fastq",signing:$};class P{constructor(e){this.options=s({agent_version:w.version,local:k,url:_,user_agent:S,signing:$},e);const{log:t}=this.options;if(t){if(!i([t.info,t.warn,t.error],r))throw new Error('expected log object to have "error", "debug", "info" and "warn" methods');this.log=t}else this.log={info:e=>{console.info(`[${(new Date).toISOString()}] INFO: ${e}`)},debug:e=>{console.debug(`[${(new Date).toISOString()}] DEBUG: ${e}`)},warn:e=>{console.warn(`[${(new Date).toISOString()}] WARN: ${e}`)},error:e=>{console.error(`[${(new Date).toISOString()}] ERROR: ${e}`)}}}async list(e){try{const o=await w.get(e,this.options),s=e.match(/^[a-z_]+/i)[0];return Promise.resolve(o[`${s}s`])}catch(t){return this.log.error(`list error ${String(t)}`),Promise.reject(t)}}async read(e,t){try{const s=await w.get(`${e}/${t}`,this.options);return Promise.resolve(s)}catch(o){return this.log.error("read",o),Promise.reject(o)}}async user(e){let t;if(this.options.local)t={accounts:[{id_user_account:"none",number:"NONE",name:"None"}]};else try{t=await w.get("user",this.options)}catch(o){return e?e(o):Promise.reject(o)}return e?e(null,t):Promise.resolve(t)}async instance_token(e,t){try{const i=await w.post("token",{id_workflow_instance:e},s({},this.options,{legacy_form:!0}));return t?t(null,i):Promise.resolve(i)}catch(o){return t?t(o):Promise.reject(o)}}async install_token(e,t){try{const i=await w.post("token/install",{id_workflow:e},s({},this.options,{legacy_form:!0}));return t?t(null,i):Promise.resolve(i)}catch(o){return t?t(o):Promise.reject(o)}}async attributes(e){try{const o=await this.list("attribute");return e?e(null,o):Promise.resolve(o)}catch(t){return e?e(t):Promise.reject(t)}}async workflows(e){try{const o=await this.list("workflow");return e?e(null,o):Promise.resolve(o)}catch(t){return e?e(t):Promise.reject(t)}}async ami_images(e){if(this.options.local){const t=new Error("ami_images unsupported in local mode");return e?e(t):Promise.reject(t)}try{const o=this.list("ami_image");return e?e(null,o):Promise.resolve(o)}catch(t){return e?e(t):Promise.reject(t)}}async ami_image(e,t,o){let s,i,r,n;if(e&&t&&o instanceof Function?(s=e,i=t,r=o,n="update"):e&&t instanceof Object&&!(t instanceof Function)?(s=e,i=t,n="update"):e instanceof Object&&t instanceof Function?(i=e,r=t,n="create"):e instanceof Object&&!t?(i=e,n="create"):(n="read",s=e,r=t instanceof Function?t:null),this.options.local){const e=new Error("ami_image unsupported in local mode");return r?r(e):Promise.reject(e)}if("update"===n)try{const e=await w.put("ami_image",s,i,this.options);return r?r(null,e):Promise.resolve(e)}catch(a){return r?r(a):Promise.reject(a)}if("create"===n)try{const e=await w.post("ami_image",i,this.options);return r?r(null,e):Promise.resolve(e)}catch(a){return r?r(a):Promise.reject(a)}if(!s){const e=new Error("no id_ami_image specified");return r?r(e):Promise.reject(e)}try{const e=await this.read("ami_image",s);return r?r(null,e):Promise.resolve(e)}catch(a){return r?r(a):Promise.reject(a)}}async workflow(t,o,i){let r,a,l,c;if(t&&o&&i instanceof Function?(r=t,a=o,l=i,c="update"):t&&o instanceof Object&&!(o instanceof Function)?(r=t,a=o,c="update"):t instanceof Object&&o instanceof Function?(a=t,l=o,c="create"):t instanceof Object&&!o?(a=t,c="create"):(c="read",r=t,l=o instanceof Function?o:null),"update"===c)try{const e=await w.put("workflow",r,a,s({},this.options,{legacy_form:!0}));return l?l(null,e):Promise.resolve(e)}catch(g){return l?l(g):Promise.reject(g)}if("create"===c)try{const e=await w.post("workflow",a,s({},this.options,{legacy_form:!0}));return l?l(null,e):Promise.resolve(e)}catch(g){return l?l(g):Promise.reject(g)}if(!r){const e=new Error("no workflow id specified");return l?l(e):Promise.reject(e)}const u={};try{const t=await this.read("workflow",r);if(t.error)throw new Error(t.error);e(u,t)}catch(g){return this.log.error(`${r}: error fetching workflow ${String(g)}`),l?l(g):Promise.reject(g)}e(u,{params:{}});try{const t=await w.get(`workflow/config/${r}`,this.options);if(t.error)throw new Error(t.error);e(u,t)}catch(g){return this.log.error(`${r}: error fetching workflow config ${String(g)}`),l?l(g):Promise.reject(g)}const d=n(u.params,{widget:"ajax_dropdown"}),h=[...d.map((e,t)=>{const o=d[t];return new Promise(async(e,t)=>{const s=o.values.source.replace("{{EPI2ME_HOST}}","");try{const i=(await w.get(s,this.options))[o.values.data_root];return i&&(o.values=i.map(e=>({label:e[o.values.items.label_key],value:e[o.values.items.value_key]}))),e()}catch(g){return this.log.error(`failed to fetch ${s}`),t(g)}})})];try{return await Promise.all(h),l?l(null,u):Promise.resolve(u)}catch(g){return this.log.error(`${r}: error fetching config and parameters ${String(g)}`),l?l(g):Promise.reject(g)}}start_workflow(e,t){return w.post("workflow_instance",e,s({},this.options,{legacy_form:!0}),t)}stop_workflow(e,t){return w.put("workflow_instance/stop",e,null,s({},this.options,{legacy_form:!0}),t)}async workflow_instances(e,t){let o,s;if(!e||e instanceof Function||void 0!==t?(o=e,s=t):s=e,s&&s.run_id)try{const e=(await w.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${s.run_id};`,this.options)).data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}));return o?o(null,e):Promise.resolve(e)}catch(i){return o?o(i):Promise.reject(i)}try{const e=await this.list("workflow_instance");return o?o(null,e):Promise.resolve(e)}catch(i){return o?o(i):Promise.reject(i)}}async workflow_instance(e,t){try{const s=await this.read("workflow_instance",e);return t?t(null,s):Promise.resolve(s)}catch(o){return t?t(o):Promise.reject(o)}}workflow_config(e,t){return w.get(`workflow/config/${e}`,this.options,t)}async register(e,t,o){let i,r;t&&t instanceof Function?r=t:(i=t,r=o);try{const t=await w.put("reg",e,{description:i||`${d.userInfo().username}@${d.hostname()}`},s({},this.options,{signing:!1,legacy_form:!0}));return r?r(null,t):Promise.resolve(t)}catch(n){return r?r(n):Promise.reject(n)}}async datasets(e,t){let o,s;!e||e instanceof Function||void 0!==t?(o=e,s=t):s=e,s||(s={}),s.show||(s.show="mine");try{const e=await this.list(`dataset?show=${s.show}`);return o?o(null,e):Promise.resolve(e)}catch(i){return o?o(i):Promise.reject(i)}}async dataset(e,t){if(!this.options.local)try{const s=await this.read("dataset",e);return t?t(null,s):Promise.resolve(s)}catch(o){return t?t(o):Promise.reject(o)}try{const s=(await this.datasets()).find(t=>t.id_dataset===e);return t?t(null,s):Promise.resolve(s)}catch(o){return t?t(o):Promise.reject(o)}}async fetchContent(e,t){const o=s({},this.options,{skip_url_mangle:!0});try{const s=await w.get(e,o);return t?t(null,s):Promise.resolve(s)}catch(i){return t?t(i):Promise.reject(i)}}}class b extends P{async workflows(e){if(!this.options.local)return super.workflows(e);const t=g.join(this.options.url,"workflows");let o;try{return o=(await u.readdir(t)).filter(e=>u.statSync(g.join(t,e)).isDirectory()).map(e=>g.join(t,e,"workflow.json")).map(e=>u.readJsonSync(e)),e?e(null,o):Promise.resolve(o)}catch(s){return this.log.warn(s),e?e(void 0):Promise.reject(void 0)}}async workflow(e,t,o){if(!this.options.local||!e||"object"===typeof e||o)return super.workflow(e,t,o);const s=g.join(this.options.url,"workflows"),i=g.join(s,e,"workflow.json");try{const e=await u.readJson(i);return o?o(null,e):Promise.resolve(e)}catch(r){return o?o(r):Promise.reject(r)}}async workflow_instances(e,t){if(!this.options.local)return super.workflow_instances(e,t);let o,s;if(!e||e instanceof Function||void 0!==t?(o=e,s=t):s=e,s){const e=new Error("querying of local instances unsupported in local mode");return o?o(e):Promise.reject(e)}const i=g.join(this.options.url,"instances");try{let e=await u.readdir(i);return e=(e=e.filter(e=>u.statSync(g.join(i,e)).isDirectory())).map(e=>{const t=g.join(i,e,"workflow.json");let o;try{o=u.readJsonSync(t)}catch(s){o={id_workflow:"-",description:"-",rev:"0.0"}}return o.id_workflow_instance=e,o.filename=t,o}),o?o(null,e):Promise.resolve(e)}catch(r){return o?o(r):Promise.reject(r)}}async datasets(e,t){if(!this.options.local)return super.datasets(e,t);let o,s;if(!e||e instanceof Function||void 0!==t?(o=e,s=t):s=e,s||(s={}),s.show||(s.show="mine"),"mine"!==s.show)return o(new Error("querying of local datasets unsupported in local mode"));const i=g.join(this.options.url,"datasets");try{let e=await u.readdir(i);e=e.filter(e=>u.statSync(g.join(i,e)).isDirectory());let t=0;return e=e.sort().map(e=>({is_reference_dataset:!0,summary:null,dataset_status:{status_label:"Active",status_value:"active"},size:0,prefix:e,id_workflow_instance:null,id_account:null,is_consented_human:null,data_fields:null,component_id:null,uuid:e,is_shared:!1,id_dataset:t+=1,id_user:null,last_modified:null,created:null,name:e,source:e,attributes:null})),o?o(null,e):Promise.resolve(e)}catch(r){return this.log.warn(r),o?o(null,[]):Promise.resolve([])}}async bundle_workflow(e,t,o){return w.pipe(`workflow/bundle/${e}.tar.gz`,t,this.options,o)}}class j{constructor(t){let o;if((o="string"===typeof t||"object"===typeof t&&t.constructor===String?JSON.parse(t):t||{}).log){if(!i([o.log.info,o.log.warn,o.log.error],r))throw new Error('expected log object to have "error", "debug", "info" and "warn" methods');this.log=o.log}else this.log={info:e=>{console.info(`[${(new Date).toISOString()}] INFO: ${e}`)},debug:e=>{console.debug(`[${(new Date).toISOString()}] DEBUG: ${e}`)},warn:e=>{console.warn(`[${(new Date).toISOString()}] WARN: ${e}`)},error:e=>{console.error(`[${(new Date).toISOString()}] ERROR: ${e}`)}};this.states={upload:{success:0,failure:{},queueLength:0,enqueued:0,totalSize:0},download:{success:0,fail:0,failure:{},queueLength:0,totalSize:0},warnings:[]},this.config={options:a(o,v),instance:{id_workflow_instance:o.id_workflow_instance,inputQueueName:null,outputQueueName:null,outputQueueURL:null,discoverQueueCache:{},bucket:null,bucketFolder:null,remote_addr:null,chain:null,key_id:null}},this.config.instance.awssettings={region:this.config.options.region},this.config.options.inputFolder&&(this.config.options.uploadedFolder&&"+uploaded"!==this.config.options.uploadedFolder?this.uploadTo=this.config.options.uploadedFolder:this.uploadTo=g.join(this.config.options.inputFolder,"uploaded"),this.skipTo=g.join(this.config.options.inputFolder,"skip")),this.REST=new b(e({},{log:this.log},this.config.options))}async stop_everything(e){this.log.debug("stopping watchers"),this.downloadCheckInterval&&(this.log.debug("clearing downloadCheckInterval interval"),clearInterval(this.downloadCheckInterval),this.downloadCheckInterval=null),this.stateCheckInterval&&(this.log.debug("clearing stateCheckInterval interval"),clearInterval(this.stateCheckInterval),this.stateCheckInterval=null),this.fileCheckInterval&&(this.log.debug("clearing fileCheckInterval interval"),clearInterval(this.fileCheckInterval),this.fileCheckInterval=null),this.uploadWorkerPool&&(this.log.debug("clearing uploadWorkerPool"),await Promise.all(this.uploadWorkerPool),this.uploadWorkerPool=null),this.downloadWorkerPool&&(this.log.debug("clearing downloadWorkerPool"),this.downloadWorkerPool.drain(),this.downloadWorkerPool=null);const{id_workflow_instance:t}=this.config.instance;t?this.REST.stop_workflow(t,()=>{this.log.info(`workflow instance ${t} stopped`),e&&e(this)}):e&&e(this)}async session(){if(this.sessioning)return Promise.resolve();if(!this.states.sts_expiration||this.states.sts_expiration&&this.states.sts_expiration<=Date.now()){this.sessioning=!0;try{await this.fetchInstanceToken(),this.sessioning=!1}catch(e){return this.sessioning=!1,this.log.error(`session error ${String(e)}`),Promise.reject(e)}}return Promise.resolve()}async fetchInstanceToken(){if(!this.config.instance.id_workflow_instance)return Promise.reject(new Error("must specify id_workflow_instance"));if(this.states.sts_expiration&&this.states.sts_expiration>Date.now())return Promise.resolve();this.log.debug("new instance token needed");try{const t=await this.REST.instance_token(this.config.instance.id_workflow_instance);this.log.debug(`allocated new instance token expiring at ${t.expiration}`),this.states.sts_expiration=new Date(t.expiration).getTime()-60*this.config.options.sessionGrace,this.config.options.proxy&&c.config.update({httpOptions:{agent:p(this.config.options.proxy,!0)}}),c.config.update(this.config.instance.awssettings),c.config.update(t)}catch(e){this.log.warn(`failed to fetch instance token: ${String(e)}`)}return Promise.resolve()}async sessionedS3(){return await this.session(),new c.S3({useAccelerateEndpoint:"on"===this.config.options.awsAcceleration})}async sessionedSQS(){return await this.session(),new c.SQS}autoStart(e,t){this.REST.start_workflow(e,async(o,s)=>{if(o){const e=`Failed to start workflow: ${o&&o.error?o.error:o}`;return this.log.warn(e),void(t&&t(e))}this.config.workflow=JSON.parse(JSON.stringify(e)),await this.autoConfigure(s,t)})}autoJoin(e,t){this.config.instance.id_workflow_instance=e,this.REST.workflow_instance(e,async(o,s)=>{if(o){const e=`Failed to join workflow instance: ${o&&o.error?o.error:o}`;return this.log.warn(e),void(t&&t(e))}if("stopped"===s.state)return this.log.warn(`workflow ${e} is already stopped`),void(t&&t("could not join workflow"));this.config.workflow=this.config.workflow||{},await this.autoConfigure(s,t)})}async autoConfigure(e,t){if(this.config.instance.id_workflow_instance=e.id_workflow_instance,this.config.instance.id_workflow=e.id_workflow,this.config.instance.remote_addr=e.remote_addr,this.config.instance.key_id=e.key_id,this.config.instance.bucket=e.bucket,this.config.instance.inputQueueName=e.inputqueue,this.config.instance.outputQueueName=e.outputqueue,this.config.instance.awssettings.region=e.region||this.config.options.region,this.config.instance.bucketFolder=`${e.outputqueue}/${e.id_user}/${e.id_workflow_instance}`,this.config.instance.user_defined=e.user_defined,e.chain)if("object"===typeof e.chain)this.config.instance.chain=e.chain;else try{this.config.instance.chain=JSON.parse(e.chain)}catch(r){throw new Error(`exception parsing chain JSON ${String(r)}`)}if(!this.config.options.inputFolder)throw new Error("must set inputFolder");if(!this.config.options.outputFolder)throw new Error("must set outputFolder");if(!this.config.instance.bucketFolder)throw new Error("bucketFolder must be set");if(!this.config.instance.inputQueueName)throw new Error("inputQueueName must be set");if(!this.config.instance.outputQueueName)throw new Error("outputQueueName must be set");u.mkdirpSync(this.config.options.outputFolder);const o=this.config.instance.id_workflow_instance?`telemetry-${this.config.instance.id_workflow_instance}.log`:"telemetry.log",s=g.join(this.config.options.outputFolder,"epi2me-logs"),i=g.join(s,o);return u.mkdirp(s,e=>{if(e&&!String(e).match(/EEXIST/))this.log.error(`error opening telemetry log stream: mkdirpException:${String(e)}`);else try{this.telemetryLogStream=u.createWriteStream(i,{flags:"a"}),this.log.info(`logging telemetry to ${i}`)}catch(t){this.log.error(`error opening telemetry log stream: ${String(t)}`)}}),this.uploadedFiles=[],t&&t(null,this.config.instance),this.downloadCheckInterval=setInterval(this.loadAvailableDownloadMessages.bind(this),1e3*this.config.options.downloadCheckInterval),this.stateCheckInterval=setInterval(()=>{this.REST.workflow_instance(this.config.instance.id_workflow_instance,(e,t)=>{e?this.log.warn(`failed to check instance state: ${e&&e.error?e.error:e}`):"stopped"===t.state&&(this.log.warn(`instance was stopped remotely at ${t.stop_date}. shutting down the workflow.`),this.stop_everything(e=>{"function"===typeof e.config.options.remoteShutdownCb&&e.config.options.remoteShutdownCb(`instance was stopped remotely at ${t.stop_date}`)}))})},1e3*this.config.options.stateCheckInterval),await this.session(),this.loadUploadFiles(),this.fileCheckInterval=setInterval(this.loadUploadFiles.bind(this),1e3*this.config.options.fileCheckInterval),Promise.resolve()}async loadAvailableDownloadMessages(){try{const t=await this.discoverQueue(this.config.instance.outputQueueName),o=await this.queueLength(t);if(void 0!==o&&null!==o&&(this.states.download.queueLength=o,o>0))return this.log.debug(`downloads available: ${o}`),this.downloadAvailable();this.log.debug("no downloads available")}catch(e){this.log.warn(e),this.states.download.failure||(this.states.download.failure={}),this.states.download.failure[e]=this.states.download.failure[e]?this.states.download.failure[e]+1:1}return Promise.resolve()}async downloadAvailable(){const e=this.downloadWorkerPool?this.downloadWorkerPool.remaining:0;if(e>=5*this.config.options.downloadPoolSize)return this.log.debug(`${e} downloads already queued`),Promise.resolve();let t;try{const e=await this.discoverQueue(this.config.instance.outputQueueName);this.log.debug("fetching messages");const s=this.sessionedSQS();t=await s.receiveMessage({AttributeNames:["All"],QueueUrl:e,VisibilityTimeout:this.config.options.inFlightDelay,MaxNumberOfMessages:this.config.options.downloadPoolSize,WaitTimeSeconds:this.config.options.waitTimeSeconds}).promise()}catch(o){return this.log.error(`receiveMessage exception: ${String(o)}`),this.states.download.failure[o]=this.states.download.failure[o]?this.states.download.failure[o]+1:1,Promise.reject(o)}return this.receiveMessages(t)}loadUploadFiles(){const e=this.inputBatchQueue?this.inputBatchQueue.remaining:0;this.dirScanInProgress||0!==e||(this.log.debug(`loadUploadFiles: ${e} batches in the inputBatchQueue`),this.dirScanInProgress=!0,this.log.debug("scanning input folder for new files"),w.loadInputFiles(this.config.options,this.log).then(async e=>{this.dirScanInProgress=!1,await this.enqueueUploadFiles(e)}).catch(e=>{this.dirScanInProgress=!1,this.log.error(e)}))}async enqueueUploadFiles(e){let t,s=0,i=0,r={};if(o(e)&&e.length){if("workflow"in this.config)if("workflow_attributes"in this.config.workflow)r=this.config.workflow.workflow_attributes;else if("attributes"in this.config.workflow){const{attributes:e}=this.config.workflow.attributes;if("epi2me:max_size"in e&&(r.max_size=parseInt(e["epi2me:max_size"],10)),"epi2me:max_files"in e&&(r.max_files=parseInt(e["epi2me:max_files"],10)),"epi2me:category"in e){e["epi2me:category"].includes("storage")&&(r.requires_storage=!0)}}if("requires_storage"in r&&r.requires_storage&&!("storage_account"in this.config.workflow))return t="ERROR: Workflow requires storage enabled. Please provide a valid storage account [ --storage ].",this.log.error(t),void this.states.warnings.push(t);if("max_size"in r&&(i=parseInt(r.max_size,10)),"max_files"in r&&(s=parseInt(r.max_files,10),e.length>s))return t=`ERROR: ${e.length} files found. Workflow can only accept ${s}. Please move the extra files away.`,this.log.error(t),void this.states.warnings.push(t);this.log.info(`enqueueUploadFiles: ${e.length} new files`),this.inputBatchQueue=[],this.inputBatchQueue.remaining=0,this.states.upload.filesCount=this.states.upload.filesCount?this.states.upload.filesCount+e.length:e.length,".fastq"===this.config.options.filetype||".fq"===this.config.options.filetype?(this.inputBatchQueue.push(async()=>{const o=[],r=[];this.log.debug("enqueueUploadFiles.countFileReads: counting FASTQ reads per file"),e.forEach(e=>{const n=e;return s&&this.states.upload.filesCount>s?(t=`Maximum ${s} file(s) already uploaded. Moving ${n.name} into skip folder`,this.log.error(t),this.states.warnings.push(t),this.states.upload.filesCount-=1,n.skip="SKIP_TOO_MANY",void o.push(this.uploadJob(n))):i&&n.size>i?(t=`${n.name} is over ${i.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}. Moving into skip folder`,n.skip="SKIP_TOO_BIG",this.states.upload.filesCount-=1,this.log.error(t),this.states.warnings.push(t),void o.push(this.uploadJob(n))):void r.push(w.countFileReads(n.path).then(e=>{n.readCount=e,this.states.upload.enqueued+=e,this.states.upload.readsCount=this.states.upload.readsCount?this.states.upload.readsCount+e:e,o.push(this.uploadJob(n))}).catch(e=>{this.log.error(`statQ, countFileReads ${String(e)}`)}))}),await Promise.all(r).then(async()=>{this.log.debug(`enqueueUploadFiles.enqueued: ${this.states.upload.enqueued}`),await Promise.all(o).catch(e=>{this.log.error(`uploadWorkerPool (fastq) exception ${String(e)}`)})}),this.inputBatchQueue.remaining-=1}),this.inputBatchQueue.remaining+=1):(this.states.upload.enqueued+=e.length,this.inputBatchQueue=e.map(e=>{const o=e;return s&&this.states.upload.filesCount>s?(t=`Maximum ${s} file(s) already uploaded. Moving ${o.name} into skip folder`,this.log.error(t),this.states.warnings.push(t),this.states.upload.filesCount-=1,o.skip="SKIP_TOO_MANY"):i&&o.size>i&&(t=`${o.name} is over ${i.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}. Moving into skip folder`,this.log.error(t),this.states.warnings.push(t),this.states.upload.filesCount-=1,o.skip="SKIP_TOO_BIG"),this.uploadJob(o).then(()=>{this.inputBatchQueue.remaining-=1})}),this.inputBatchQueue.remaining+=1);try{await Promise.all(this.inputBatchQueue),this.log.info("inputBatchQueue slot released. trigger loadUploadFiles"),this.loadUploadFiles()}catch(n){this.log.error(`enqueueUploadFiles exception ${String(n)}`)}}}async uploadJob(e){try{this.log.info(JSON.stringify(e))}catch(t){this.log.error(`${e.id} could not stringify fileObject!`)}if("skip"in e){const o=e.readCount||1;this.states.upload.enqueued=this.states.upload.enqueued-o,this.states.upload.queueLength=this.states.upload.queueLength?this.states.upload.queueLength-o:0;try{await this.moveFile(e,"skip")}catch(t){return Promise.reject(t)}return Promise.resolve()}return new Promise(t=>{this.uploadHandler(e,(e,o)=>{e?this.log.info(`${o.id} done, but failed: ${String(e)}`):this.log.info(`${o.id} completely done. releasing uploadWorkerPool queue slot`),t();const s=o.readCount||1;this.states.upload.enqueued=this.states.upload.enqueued-s,e?(this.log.error(`uploadHandler ${e}`),this.states.upload.failure||(this.states.upload.failure={}),this.states.upload.failure[e]=this.states.upload.failure[e]?this.states.upload.failure[e]+1:1):(this.states.upload.queueLength=this.states.upload.queueLength?this.states.upload.queueLength-s:0,this.states.upload.success=this.states.upload.success?this.states.upload.success+s:s)})})}async receiveMessages(e){return e&&e.Messages&&e.Messages.length?(this.downloadWorkerPool||(this.downloadWorkerPool=[],this.downloadWorkerPool.remaining=0),e.Messages.forEach(e=>{const t=new Promise((t,o)=>{const s=setTimeout(()=>{clearTimeout(s),this.log.error(`this.downloadWorkerPool timeoutHandle. Clearing queue slot for message: ${e.Body}`),this.downloadWorkerPool.remaining-=1,o()},1e3*(60+this.config.options.downloadTimeout));this.processMessage(e,()=>{this.downloadWorkerPool.remaining-=1,clearTimeout(s),t()})});this.downloadWorkerPool.remaining+=1,this.downloadWorkerPool.push(t)}),this.log.info(`downloader queued ${e.Messages.length} files for download`),Promise.all(this.downloadWorkerPool)):(this.log.info("complete (empty)"),Promise.resolve())}async deleteMessage(e){try{const o=await this.discoverQueue(this.config.instance.outputQueueName),s=this.sessionedSQS();await s.deleteMessage({QueueUrl:o,ReceiptHandle:e.ReceiptHandle}).promise()}catch(t){this.log.error(`deleteMessage exception: ${String(t)}`),this.states.download.failure[t]=this.states.download.failure[t]?this.states.download.failure[t]+1:1}}async processMessage(e,t){let o,s,i;const r=this,n=e=>{try{this.telemetryLogStream.write(JSON.stringify(e)+h)}catch(t){this.log.error(`error writing telemetry: ${t}`)}r.config.options.telemetryCb&&this.config.options.telemetryCb(e)};if(!e)return this.log.debug("download.processMessage: empty message"),t();"Attributes"in e&&("ApproximateReceiveCount"in e.Attributes?this.log.info(`download.processMessage: ${e.MessageId} / ${e.Attributes.ApproximateReceiveCount}`):this.log.info(`download.processMessage: ${e.MessageId} / NA `));try{o=JSON.parse(e.Body)}catch(d){return this.log.error(`error parsing JSON message.Body from message: ${JSON.stringify(e)} ${String(d)}`),this.deleteMessage(e),t()}if(o.telemetry){const{telemetry:e}=o;if(e.tm_path)try{const t=await this.sessionedS3().getObject({Bucket:o.bucket,Key:e.tm_path}).promise();e.batch=t.Body.toString("utf-8").split("\n").filter(e=>e&&e.length>0).map(e=>{try{return JSON.parse(e)}catch(t){return this.log.error(`Telemetry Batch JSON Parse error: ${t.message}`),e}})}catch(p){this.log.error(`Could not fetch telemetry JSON: ${p.message}`)}n(e)}if(!o.path)return void this.log.warn(`invalid message: ${JSON.stringify(o)}`);const a=o.path.match(/[\w\W]*\/([\w\W]*?)$/),l=a?a[1]:"";if(s=this.config.options.outputFolder,"on"===this.config.options.filter&&o.telemetry&&o.telemetry.hints&&o.telemetry.hints.folder){this.log.debug(`using folder hint ${o.telemetry.hints.folder}`);const e=o.telemetry.hints.folder.split("/").map(e=>e.toUpperCase());s=g.join.apply(null,[s,...e])}".fast5"===this.config.options.filetype&&(s=w.findSuitableBatchIn(s)),u.mkdirpSync(s);const c=g.join(s,l);if("data+telemetry"===this.config.options.downloadMode)this.log.info(`downloading ${o.path} to ${c}`),i=this.sessionedS3(),this.initiateDownloadStream(i,o,e,c,t);else if("telemetry"===this.config.options.downloadMode){this.deleteMessage(e);const s=o.telemetry.batch_summary&&o.telemetry.batch_summary.reads_num?o.telemetry.batch_summary.reads_num:1;return this.states.download.success=this.states.download.success?this.states.download.success+s:s,t()}}initiateDownloadStream(e,t,o,s,i){let r,n,a,c;const d=()=>{if("on"===this.config.options.filter)try{u.remove(s,e=>{e?this.log.warn(`failed to remove file: ${s}`):this.log.warn(`removed failed download file: ${s} ${e}`)})}catch(e){this.log.warn(`failed to remove file. unlinkException: ${s} ${String(e)}`)}},h=()=>{if(!r.networkStreamError)try{r.networkStreamError=1,r.close(),d(),c.destroy&&(this.log.error(`destroying readstream for ${s}`),c.destroy())}catch(e){this.log.error(`error handling sream error: ${e.message}`)}};try{const o={Bucket:t.bucket,Key:t.path};this.config.instance.key_id,r=u.createWriteStream(s);const n=e.getObject(o);c=n.createReadStream()}catch(p){return this.log.error(`getObject/createReadStream exception: ${String(p)}`),void(i&&i())}c.on("error",e=>{this.log.error(`error in download readstream ${e}`);try{h()}catch(t){this.log.error(`error handling readStreamError: ${t}`)}}),r.on("finish",async()=>{if(!r.networkStreamError){this.log.debug(`downloaded ${s}`);const i=t.telemetry&&t.telemetry.batch_summary&&t.telemetry.batch_summary.reads_num?t.telemetry.batch_summary.reads_num:1;this.states.download.success?this.states.download.success+=i:this.states.download.success=i;try{const t=await u.stat(s);this.states.download.totalSize+=t.size}catch(e){this.log.warn(`failed to stat file: ${String(e)}`)}try{const o=()=>{this.log.info(`Uploads: ${JSON.stringify(this.states.upload)}`),this.log.info(`Downloads: ${JSON.stringify(this.states.download)}`)};if(".fastq"===this.config.options.filetype||".fq"===this.config.options.filetype){this.downloadedFileSizes||(this.downloadedFileSizes={});try{const t=await u.stat(s);this.downloadedFileSizes[s]=t.size||0,this.states.download.totalSize=l(this.downloadedFileSizes).values().sum().value(),o()}catch(e){this.log.error(`finish, getFileSize (fastq) ${String(e)}`)}}else try{const t=await w.getFileSize(s);this.states.download.totalSize+=t.size||0,o()}catch(e){this.log.error(`finish, getFileSize (other) ${String(e)}`)}const i=!(!t.telemetry||!t.telemetry.json)&&t.telemetry.json.exit_status;i&&this.config.options.dataCb&&this.config.options.dataCb(s,i)}catch(e){this.log.warn(`failed to fs.stat file: ${e}`)}this.deleteMessage(o)}}),r.on("close",e=>{this.log.debug(`closing writeStream ${s}`),e&&this.log.error(`error closing writestream ${e}`),clearTimeout(n),clearInterval(a),setTimeout(this.loadAvailableDownloadMessages.bind(this)),i()}),r.on("error",e=>{this.log.error(`error in download write stream ${e}`),h()});const g=()=>{this.log.warn("transfer timed out"),h()};n=setTimeout(g,1e3*this.config.options.downloadTimeout);a=setInterval(async()=>{const e=this.config.instance.outputQueueURL,t=o.ReceiptHandle;this.log.debug({message_id:o.MessageId},"updateVisibility");try{await this.sqs.changeMessageVisibility({QueueUrl:e,ReceiptHandle:t,VisibilityTimeout:this.config.options.inFlightDelay}).promise()}catch(s){this.log.error({message_id:o.MessageId,queue:e,error:s},"Error setting visibility"),clearInterval(a)}},900*this.config.options.inFlightDelay),c.on("data",()=>{clearTimeout(n),n=setTimeout(g,1e3*this.config.options.downloadTimeout)}).pipe(r)}uploadHandler(e,t){const o=this.sessionedS3();let s;const i=e.batch||"",r=g.join(this.config.options.inputFolder,i,e.name),n=`${this.config.instance.bucketFolder}/component-0/${e.name}/${e.name}`;let a,l=!1;const c=o=>{l||(l=!0,clearTimeout(a),t(o,e))};a=setTimeout(()=>{s&&!s.closed&&s.close(),c(`this.uploadWorkerPool timeoutHandle. Clearing queue slot for file: ${e.name}`)},1e3*(this.config.options.uploadTimeout+5));try{s=u.createReadStream(r)}catch(d){return c(`createReadStreamException exception${String(d)}`)}s.on("error",e=>{s.close();let t="error in upload readstream";e&&e.message&&(t+=`: ${e.message}`),c(t)}),s.on("open",()=>{const t={Bucket:this.config.instance.bucket,Key:n,Body:s};this.config.instance.key_id&&(t.SSEKMSKeyId=this.config.instance.key_id,t.ServerSideEncryption="aws:kms"),e.size&&(t["Content-Length"]=e.size),o.upload(t,{partSize:10485760,queueSize:1},async t=>{if(t)return this.log.warn(`${e.id} uploadStreamError ${t}`),c(`uploadStreamError ${String(t)}`);this.log.info(`${e.id} S3 upload complete`);try{await this.uploadComplete(n,e)}catch(o){return c(o),Promise.reject(o)}c(),s.close()}).on("httpUploadProgress",t=>{this.log.debug(`upload progress ${t.key} ${t.loaded} / ${t.total}`),clearTimeout(a),a=setTimeout(()=>{s&&!s.closed&&s.close(),c(`this.uploadWorkerPool timeoutHandle. Clearing queue slot for file: ${e.name}`)},1e3*(this.config.options.uploadTimeout+5))})}),s.on("end",s.close),s.on("close",()=>this.log.debug("closing readstream"))}async discoverQueue(e){if(this.config.instance.discoverQueueCache[e])return this.config.instance.discoverQueueCache[e];this.log.debug(`discovering queue for ${e}`);try{const o=this.sessionedSQS(),s=await o.getQueueUrl({QueueName:e}).promise();return this.log.debug(`found queue ${s.QueueUrl}`),this.config.instance.discoverQueueCache[e]=s.QueueUrl,s.QueueUrl}catch(t){return this.log.error(`failed to find queue for ${e}: ${String(t)}`),Promise.reject(t)}}async uploadComplete(e,t){this.log.info(`${t.id} uploaded to S3: ${e}`);const o={bucket:this.config.instance.bucket,outputQueue:this.config.instance.outputQueueName,remote_addr:this.config.instance.remote_addr,user_defined:this.config.instance.user_defined||null,apikey:this.config.options.apikey,id_workflow_instance:this.config.instance.id_workflow_instance,id_master:this.config.instance.id_workflow,utc:(new Date).toISOString(),path:e,prefix:e.substring(0,e.lastIndexOf("/"))};if(this.config.instance.chain)try{o.components=JSON.parse(JSON.stringify(this.config.instance.chain.components)),o.targetComponentId=this.config.instance.chain.targetComponentId}catch(s){return this.log.error(`${t.id} exception parsing components JSON ${String(s)}`),Promise.reject(new Error("json exception"))}if(this.config.instance.key_id&&(o.key_id=this.config.instance.key_id),this.config.options.agent_address)try{o.agent_address=JSON.parse(this.config.options.agent_address)}catch(i){this.log.error(`${t.id} Could not parse agent_address ${String(i)}`)}o.components&&Object.keys(o.components).forEach(e=>{"uploadMessageQueue"===o.components[e].inputQueueName&&(o.components[e].inputQueueName=this.uploadMessageQueue),"downloadMessageQueue"===o.components[e].inputQueueName&&(o.components[e].inputQueueName=this.downloadMessageQueue)});try{const e=await this.discoverQueue(this.config.instance.inputQueueName),s=this.sessionedSQS();this.log.info(`${t.id} sending SQS message to input queue`),await s.sendMessage({QueueUrl:e,MessageBody:JSON.stringify(o)}).promise()}catch(r){return this.log.error(`${t.id} exception sending SQS message: ${String(r)}`),Promise.reject(new Error("SQS sendmessage exception"))}this.log.info(`${t.id} SQS message sent. Move to uploaded`);try{await this.moveFile(t,"upload")}catch(n){return Promise.reject(n)}}async moveFile(e,t){const o="upload"===t?this.uploadTo:this.skipTo,s=e.name,i=e.batch||"",r=e.path||g.join(this.config.options.inputFolder,i,s),n=g.join(o,i,s);try{await u.mkdirp(g.join(o,i)),await u.move(r,n),this.log.debug(`${e.id}: ${t} and mv done`),"upload"===t&&(this.states.upload.totalSize+=e.size),this.uploadedFiles.push(s)}catch(a){this.log.debug(`${e.id} ${t} move error: ${String(a)}`);try{await u.remove(n)}catch(l){this.log.warn(`${e.id} ${t} additionally failed to delete ${n}: ${String(l)}`)}return Promise.reject(a)}}async queueLength(e){if(!e)return Promise.resolve();const t=e.match(/([\w\-_]+)$/)[0];this.log.debug(`querying queue length of ${t}`);try{const t=await this.sessionedSQS().getQueueAttributes({QueueUrl:e,AttributeNames:["ApproximateNumberOfMessages"]}).promise();if(t&&t.Attributes&&"ApproximateNumberOfMessages"in t.Attributes){let e=t.Attributes.ApproximateNumberOfMessages;return e=parseInt(e,10)||0,Promise.resolve(e)}}catch(o){return this.log.error(`error in getQueueAttributes ${String(o)}`),Promise.reject(o)}return Promise.resolve()}url(){return this.config.options.url}apikey(){return this.config.options.apikey}attr(e,t){if(!(e in this.config.options))throw new Error(`config object does not contain property ${e}`);return t?(this.config.options[e]=t,this):this.config.options[e]}stats(e){return this.states[e]&&(this.states[e].queueLength=parseInt(this.states[e].queueLength,10)||0,"upload"===e&&this.uploadedFiles&&this.states.upload&&(this.states.upload.total=this.uploadedFiles.length+this.states.upload.enqueued+this.states.upload.success)),this.states[e]}}j.version=w.version,j.REST=b;export default j;

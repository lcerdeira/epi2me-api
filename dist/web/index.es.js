/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2020
 */

import{merge as e,assign as t,filter as r,every as s,isFunction as o,defaults as n}from"lodash";import i from"axios";import a from"crypto";import{httpsOverHttps as c,httpsOverHttp as l}from"tunnel";import u from"os";import h from"graphql-tag";import{ApolloClient as p}from"apollo-client";import{InMemoryCache as d}from"apollo-cache-inmemory";import{ApolloLink as g,execute as f}from"apollo-link";import{createHttpLink as m}from"apollo-link-http";import{buildAxiosFetch as w}from"@lifeomic/axios-fetch";import y from"socket.io-client";i.defaults.validateStatus=e=>e<=504;const k=function(){const t=(e,t)=>{e.headers||(e.headers={});let r=t;if(r||(r={}),!r.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=r.apikey,!r.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const s=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n")].join("\n"),o=a.createHmac("sha1",r.apisecret).update(s).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=o},r=async e=>{const t=e?e.data:null;if(!t)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let r=`Network error ${e.status}`;return t.error&&(r=t.error),504===e.status&&(r="Please check your network connection and try again."),Promise.reject(new Error(r))}return t.error?Promise.reject(new Error(t.error)):Promise.resolve(t)};return{version:"3.0.1421",headers:(r,s)=>{const{log:o}=e({log:{debug:()=>{}}},s);let n=s;if(n||(n={}),r.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":n.user_agent||"api","X-EPI2ME-Version":n.agent_version||k.version},r.headers,n.headers),"signing"in n&&!n.signing||t(r,n),n.proxy){const e=n.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),t=e[2],s=e[3],i={host:e[4],port:e[5]};t&&s&&(i.proxyAuth=`${t}:${s}`),n.proxy.match(/^https/)?(o.debug("using HTTPS over HTTPS proxy",JSON.stringify(i)),r.httpsAgent=c({proxy:i})):(o.debug("using HTTPS over HTTP proxy",JSON.stringify(i)),r.httpsAgent=l({proxy:i})),r.proxy=!1}},get:async(t,s)=>{const{log:o}=e({log:{debug:()=>{}}},s);let n,a=s.url,c=t;s.skip_url_mangle?n=c:(c=`/${c}`,n=(a=a.replace(/\/+$/,""))+(c=c.replace(/\/+/g,"/")));const l={url:n,gzip:!0};let u;k.headers(l,s);try{o.debug(`GET ${l.url}`),u=await i.get(l.url,l)}catch(h){return Promise.reject(h)}return r(u,s)},post:async(t,s,o)=>{const{log:n}=e({log:{debug:()=>{}}},o);let a=o.url;const c={url:`${a=a.replace(/\/+$/,"")}/${t.replace(/\/+/g,"/")}`,gzip:!0,data:s,headers:{}};if(o.legacy_form){const t=[],r=e({json:JSON.stringify(s)},s);Object.keys(r).sort().forEach(e=>{t.push(`${e}=${escape(r[e])}`)}),c.data=t.join("&"),c.headers["Content-Type"]="application/x-www-form-urlencoded"}k.headers(c,o);const{data:l}=c;let u;delete c.data;try{n.debug(`POST ${c.url}`),u=await i.post(c.url,l,c)}catch(h){return Promise.reject(h)}return o.handler?o.handler(u):r(u,o)},put:async(t,s,o,n)=>{const{log:a}=e({log:{debug:()=>{}}},n);let c=n.url;const l={url:`${c=c.replace(/\/+$/,"")}/${t.replace(/\/+/g,"/")}/${s}`,gzip:!0,data:o,headers:{}};if(n.legacy_form){const t=[],r=e({json:JSON.stringify(o)},o);Object.keys(r).sort().forEach(e=>{t.push(`${e}=${escape(r[e])}`)}),l.data=t.join("&"),l.headers["Content-Type"]="application/x-www-form-urlencoded"}k.headers(l,n);const{data:u}=l;let h;delete l.data;try{a.debug(`PUT ${l.url}`),h=await i.put(l.url,u,l)}catch(p){return Promise.reject(p)}return r(h,n)}}}(),$=(e,t)=>{const r=["","K","M","G","T","P","E","Z"];let s=t||0,o=e||0;return o>=1e3?(o/=1e3,(s+=1)>=r.length?"???":$(o,s)):0===s?`${o}${r[s]}`:`${o.toFixed(1)}${r[s]}`};var I=!1,b="https://epi2me.nanoporetech.com",v="https://graphql.epi2me-dev.nanoporetech.com",P="EPI2ME API",j=!0,S={local:I,url:b,gqlUrl:v,user_agent:P,region:"eu-west-1",sessionGrace:5,uploadTimeout:1200,downloadTimeout:1200,fileCheckInterval:5,downloadCheckInterval:3,stateCheckInterval:60,inFlightDelay:600,waitTimeSeconds:20,waitTokenError:30,transferPoolSize:3,downloadMode:"data+telemetry",filetype:[".fastq",".fq",".fastq.gz",".fq.gz"],signing:j};class E{constructor(e){this.options=t({agent_version:k.version,local:I,url:b,user_agent:P,signing:j},e),this.log=this.options.log}async list(e){try{const t=await k.get(e,this.options),r=e.match(/^[a-z_]+/i)[0];return Promise.resolve(t[`${r}s`])}catch(t){return this.log.error(`list error ${String(t)}`),Promise.reject(t)}}async read(e,t){try{const r=await k.get(`${e}/${t}`,this.options);return Promise.resolve(r)}catch(r){return this.log.error("read",r),Promise.reject(r)}}async user(){return this.options.local?{accounts:[{id_user_account:"none",number:"NONE",name:"None"}]}:k.get("user",this.options)}async status(){return k.get("status",this.options)}async jwt(){try{const t=e=>e.headers["x-epi2me-jwt"]?Promise.resolve(e.headers["x-epi2me-jwt"]):Promise.reject(new Error("failed to fetch JWT")),r=await k.post("authenticate",{},e({handler:t},this.options));return Promise.resolve(r)}catch(t){return Promise.reject(t)}}async instanceToken(r,s){return k.post("token",e(s,{id_workflow_instance:r}),t({},this.options,{legacy_form:!0}))}async installToken(e){return k.post("token/install",{id_workflow:e},t({},this.options,{legacy_form:!0}))}async attributes(){return this.list("attribute")}async workflows(){return this.list("workflow")}async amiImages(){if(this.options.local)throw new Error("amiImages unsupported in local mode");return this.list("ami_image")}async amiImage(e,t,r){let s,o,n,i;if(e&&t&&r instanceof Function?(s=e,o=t,n=r,i="update"):e&&t instanceof Object&&!(t instanceof Function)?(s=e,o=t,i="update"):e instanceof Object&&t instanceof Function?(o=e,n=t,i="create"):e instanceof Object&&!t?(o=e,i="create"):(i="read",s=e,n=t instanceof Function?t:null),this.options.local){const e=new Error("ami_image unsupported in local mode");return n?n(e):Promise.reject(e)}if("update"===i)try{const e=await k.put("ami_image",s,o,this.options);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}if("create"===i)try{const e=await k.post("ami_image",o,this.options);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}if(!s){const e=new Error("no id_ami_image specified");return n?n(e):Promise.reject(e)}try{const e=await this.read("ami_image",s);return n?n(null,e):Promise.resolve(e)}catch(a){return n?n(a):Promise.reject(a)}}async workflow(t,s,o){let n,i,a,c;if(t&&s&&o instanceof Function?(n=t,i=s,a=o,c="update"):t&&s instanceof Object&&!(s instanceof Function)?(n=t,i=s,c="update"):t instanceof Object&&s instanceof Function?(i=t,a=s,c="create"):t instanceof Object&&!s?(i=t,c="create"):(c="read",n=t,a=s instanceof Function?s:null),"update"===c)try{const e=await k.put("workflow",n,i,this.options);return a?a(null,e):Promise.resolve(e)}catch(p){return a?a(p):Promise.reject(p)}if("create"===c)try{const e=await k.post("workflow",i,this.options);return a?a(null,e):Promise.resolve(e)}catch(p){return a?a(p):Promise.reject(p)}if(!n){const e=new Error("no workflow id specified");return a?a(e):Promise.reject(e)}const l={};try{const t=await this.read("workflow",n);if(t.error)throw new Error(t.error);e(l,t)}catch(p){return this.log.error(`${n}: error fetching workflow ${String(p)}`),a?a(p):Promise.reject(p)}e(l,{params:{}});try{const t=await k.get(`workflow/config/${n}`,this.options);if(t.error)throw new Error(t.error);e(l,t)}catch(p){return this.log.error(`${n}: error fetching workflow config ${String(p)}`),a?a(p):Promise.reject(p)}const u=r(l.params,{widget:"ajax_dropdown"}),h=[...u.map((e,t)=>{const r=u[t];return new Promise((e,t)=>{const s=r.values.source.replace("{{EPI2ME_HOST}}","").replace(/&?apikey=\{\{EPI2ME_API_KEY\}\}/,"");k.get(s,this.options).then(t=>{const s=t[r.values.data_root];return s&&(r.values=s.map(e=>({label:e[r.values.items.label_key],value:e[r.values.items.value_key]}))),e()}).catch(e=>(this.log.error(`failed to fetch ${s}`),t(e)))})})];try{return await Promise.all(h),a?a(null,l):Promise.resolve(l)}catch(p){return this.log.error(`${n}: error fetching config and parameters ${String(p)}`),a?a(p):Promise.reject(p)}}async startWorkflow(e){return k.post("workflow_instance",e,t({},this.options,{legacy_form:!0}))}async stopWorkflow(e){return k.put("workflow_instance/stop",e,null,t({},this.options,{legacy_form:!0}))}async workflowInstances(e){if(e&&e.run_id)try{const t=(await k.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${e.run_id};`,this.options)).data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}));return Promise.resolve(t)}catch(t){return Promise.reject(t)}return this.list("workflow_instance")}async workflowInstance(e){return this.read("workflow_instance",e)}async workflowConfig(e){return k.get(`workflow/config/${e}`,this.options)}async register(e,r){return k.put("reg",e,{description:r||`${u.userInfo().username}@${u.hostname()}`},t({},this.options,{signing:!1}))}async datasets(e){let t=e;return t||(t={}),t.show||(t.show="mine"),this.list(`dataset?show=${t.show}`)}async dataset(e){return this.options.local?this.datasets().then(t=>t.find(t=>t.id_dataset===e)):this.read("dataset",e)}async fetchContent(e,r){const s=t({},this.options,{skip_url_mangle:!0,headers:{"Content-Type":""}});try{const t=await k.get(e,s);return r?r(null,t):Promise.resolve(t)}catch(o){return r?r(o):Promise.reject(o)}}}const _=function(){const t=(e,t)=>{e.headers||(e.headers={});let r=t;if(r||(r={}),!r.apikey||!r.apisecret)return;e.headers["X-EPI2ME-APIKEY"]=r.apikey,e.headers["X-EPI2ME-SIGNATUREDATE"]=(new Date).toISOString();const s=[Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n"),e.body].join("\n"),o=a.createHmac("sha1",r.apisecret).update(s).digest("hex");e.headers["X-EPI2ME-SIGNATUREV0"]=o};return{version:"3.0.1421",setHeaders:(r,s)=>{const{log:o}=e({log:{debug:()=>{}}},s);let n=s;if(n||(n={}),r.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-CLIENT":n.user_agent||"api","X-EPI2ME-VERSION":n.agent_version||_.version},r.headers,n.headers),"signing"in n&&!n.signing||t(r,n),n.proxy){const e=n.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),t=e[2],s=e[3],i={host:e[4],port:e[5]};t&&s&&(i.proxyAuth=`${t}:${s}`),n.proxy.match(/^https/)?(o.debug("using HTTPS over HTTPS proxy",JSON.stringify(i)),r.httpsAgent=c({proxy:i})):(o.debug("using HTTPS over HTTP proxy",JSON.stringify(i)),r.httpsAgent=l({proxy:i})),r.proxy=!1}}}}(),T=w(i),x=(e,t)=>{const{apikey:r,apisecret:s}=t.headers.keys;return delete t.headers.keys,_.setHeaders(t,{apikey:r,apisecret:s,signing:!0}),T(e,t)},O=new p({link:new g(e=>{const t=e.getContext().uri||v,{apikey:r,apisecret:s}=e.getContext(),o=m({uri:`${t}/graphql`,fetch:x,headers:{keys:{apikey:r,apisecret:s}}});return f(o,e)}),cache:new d}),W="\npage\npages\nhasNext\nhasPrevious\ntotalCount\n",C="\nidWorkflow\nname\ndescription\nsummary\n",q="\nidWorkflowInstance\noutputqueue\nstartDate\n";class A{constructor(e){this.options=t({agent_version:k.version,local:I,url:v,user_agent:P,signing:j},e),this.log=this.options.log,this.client=O}createContext(t){return e(this.options.profile,t)}workflows(e={},t={}){const r=h`
      query allWorkflows($page: Int) {
        allWorkflows(page: $page) {
          ${W}
          results {
            ${C}
          }
        }
      }
    `,s=this.createContext(e);return this.client.query({query:r,variables:t,context:s})}workflow(e){const t=h`
      query workflow($idWorkflow: ID!) {
        workflow(idWorkflow: $idWorkflow) {
          ${C}
        }
      }
    `;return this.client.query({query:t,variables:e})}workflowInstances(e){const t=h`
      query allWorkflowInstances($page: Int) {
        allWorkflowInstances(page: $page) {
          ${W}
          results {
            ${q}
          }
        }
      }
    `;return this.client.query({query:t,variables:e})}workflowInstance(e){const t=h`
      query workflowInstance($idWorkflowInstance: ID!) {
        workflowInstance(idWorkflowInstance: $idWorkflowInstance) {
          ${q}
        }
      }
    `;return this.client.query({query:t,variables:e})}startWorkflow(e){const t=h`
      mutation startWorkflow(
        $idWorkflow: ID!
        $computeAccountId: Int!
        $storageAccountId: Int
        $isConsentedHuman: Int = 0
      ) {
        startWorkflowInstance(
          idWorkflow: $idWorkflow
          computeAccountId: $computeAccountId
          storageAccountId: $storageAccountId
          isConsentedHuman: $isConsentedHuman
        ) {
          bucket
          idUser
          idWorkflowInstance
          inputqueue
          outputqueue
          region
          keyId
          chain
        }
      }
    `;return this.client.mutate({mutation:t,variables:e})}async register(e,t,r){let s,o;t&&t instanceof Function?o=t:(s=t,o=r);try{const t=await k.post("apiaccess",{code:e,description:s||`${u.userInfo().username}@${u.hostname()}`},this.options);return o?o(null,t):Promise.resolve(t)}catch(n){return o?o(n):Promise.reject(n)}}}class N{constructor(t,r){this.debounces={},this.debounceWindow=e({debounceWindow:2e3},r).debounceWindow,this.log=e({log:{debug:()=>{}}},r).log,t.jwt().then(e=>{this.socket=y(r.url,{transportOptions:{polling:{extraHeaders:{Cookie:`x-epi2me-jwt=${e}`}}}}),this.socket.on("connect",()=>{this.log.debug("socket ready")})})}debounce(t,r){const s=e(t)._uuid;if(s){if(this.debounces[s])return;this.debounces[s]=1,setTimeout(()=>{delete this.debounces[s]},this.debounceWindow)}r&&r(t)}watch(e,t){if(!this.socket)return this.log.debug(`socket not ready. requeueing watch on ${e}`),void setTimeout(()=>{this.watch(e,t)},1e3);this.socket.on(e,e=>this.debounce(e,t))}emit(e,t){if(!this.socket)return this.log.debug(`socket not ready. requeueing emit on ${e}`),void setTimeout(()=>{this.emit(e,t)},1e3);this.log.debug(`socket emit ${e} ${JSON.stringify(t)}`),this.socket.emit(e,t)}}class H{constructor(t){let r;if((r="string"===typeof t||"object"===typeof t&&t.constructor===String?JSON.parse(t):t||{}).log){if(!s([r.log.info,r.log.warn,r.log.error,r.log.debug,r.log.json],o))throw new Error("expected log object to have error, debug, info, warn and json methods");this.log=r.log}else this.log={info:e=>{console.info(`[${(new Date).toISOString()}] INFO: ${e}`)},debug:e=>{console.debug(`[${(new Date).toISOString()}] DEBUG: ${e}`)},warn:e=>{console.warn(`[${(new Date).toISOString()}] WARN: ${e}`)},error:e=>{console.error(`[${(new Date).toISOString()}] ERROR: ${e}`)},json:e=>{console.log(JSON.stringify(e))}};this.stopped=!0,this.states={upload:{filesCount:0,success:{files:0,bytes:0,reads:0},types:{},niceTypes:"",progress:{bytes:0,total:0}},download:{progress:{},success:{files:0,reads:0,bytes:0},fail:0,types:{},niceTypes:""},warnings:[]},this.config={options:n(r,S),instance:{id_workflow_instance:r.id_workflow_instance,inputQueueName:null,outputQueueName:null,outputQueueURL:null,discoverQueueCache:{},bucket:null,bucketFolder:null,remote_addr:null,chain:null,key_id:null}},this.config.instance.awssettings={region:this.config.options.region},this.REST=new E(e({log:this.log},this.config.options)),this.graphQL=new A(e({log:this.log},this.config.options)),this.timers={downloadCheckInterval:null,stateCheckInterval:null,fileCheckInterval:null,transferTimeouts:{},visibilityIntervals:{},summaryTelemetryInterval:null}}async socket(){return this.mySocket?this.mySocket:(this.mySocket=new N(this.REST,e({log:this.log},this.config.options)),this.mySocket)}async realtimeFeedback(e,t){(await this.socket()).emit(e,t)}async stopEverything(){this.stopped=!0,this.log.debug("stopping watchers"),["downloadCheckInterval","stateCheckInterval","fileCheckInterval","summaryTelemetryInterval"].forEach(e=>{this.timers[e]&&(this.log.debug(`clearing ${e} interval`),clearInterval(this.timers[e]),this.timers[e]=null)}),Object.keys(this.timers.transferTimeouts).forEach(e=>{this.log.debug(`clearing transferTimeout for ${e}`),clearTimeout(this.timers.transferTimeouts[e]),delete this.timers.transferTimeouts[e]}),Object.keys(this.timers.visibilityIntervals).forEach(e=>{this.log.debug(`clearing visibilityInterval for ${e}`),clearInterval(this.timers.visibilityIntervals[e]),delete this.timers.visibilityIntervals[e]}),this.downloadWorkerPool&&(this.log.debug("clearing downloadWorkerPool"),await Promise.all(Object.values(this.downloadWorkerPool)),this.downloadWorkerPool=null);const{id_workflow_instance:e}=this.config.instance;if(e){try{await this.REST.stopWorkflow(e)}catch(t){return this.log.error(`Error stopping instance: ${String(t)}`),Promise.reject(t)}this.log.info(`workflow instance ${e} stopped`)}return Promise.resolve()}reportProgress(){const{upload:e,download:t}=this.states;this.log.json({progress:{download:t,upload:e}})}storeState(e,t,r,s){const o=s||{};this.states[e]||(this.states[e]={}),this.states[e][t]||(this.states[e][t]={}),"incr"===r?Object.keys(o).forEach(r=>{this.states[e][t][r]=this.states[e][t][r]?this.states[e][t][r]+parseInt(o[r],10):parseInt(o[r],10)}):Object.keys(o).forEach(r=>{this.states[e][t][r]=this.states[e][t][r]?this.states[e][t][r]-parseInt(o[r],10):-parseInt(o[r],10)});try{this.states[e].success.niceReads=$(this.states[e].success.reads)}catch(i){this.states[e].success.niceReads=0}try{this.states[e].progress.niceSize=$(this.states[e].success.bytes+this.states[e].progress.bytes||0)}catch(i){this.states[e].progress.niceSize=0}try{this.states[e].success.niceSize=$(this.states[e].success.bytes)}catch(i){this.states[e].success.niceSize=0}this.states[e].niceTypes=Object.keys(this.states[e].types||{}).sort().map(t=>`${this.states[e].types[t]} ${t}`).join(", ");const n=Date.now();(!this.stateReportTime||n-this.stateReportTime>2e3)&&(this.stateReportTime=n,this.reportProgress())}uploadState(e,t,r){return this.storeState("upload",e,t,r)}downloadState(e,t,r){return this.storeState("download",e,t,r)}url(){return this.config.options.url}apikey(){return this.config.options.apikey}attr(e,t){if(!(e in this.config.options))throw new Error(`config object does not contain property ${e}`);return t?(this.config.options[e]=t,this):this.config.options[e]}stats(e){return this.states[e]}}H.version=k.version,H.REST=E,H.utils=k;export default H;

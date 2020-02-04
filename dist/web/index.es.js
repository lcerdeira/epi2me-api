/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2020
 */

import{merge as e,assign as t,filter as s,every as o,isFunction as r,defaults as i}from"lodash";import n from"graphql-tag";import{InMemoryCache as a}from"apollo-cache-inmemory";import c from"apollo-client";import{ApolloLink as l,execute as u}from"apollo-link";import{createHttpLink as h}from"apollo-link-http";import p from"axios";import{buildAxiosFetch as d}from"@lifeomic/axios-fetch";import g from"crypto";import{httpsOverHttps as f,httpsOverHttp as w}from"tunnel";import m from"os";import y from"socket.io-client";var k="https://epi2me.nanoporetech.com",$={local:!1,url:k,user_agent:"EPI2ME API",region:"eu-west-1",sessionGrace:5,uploadTimeout:1200,downloadTimeout:1200,fileCheckInterval:5,downloadCheckInterval:3,stateCheckInterval:60,inFlightDelay:600,waitTimeSeconds:20,waitTokenError:30,transferPoolSize:3,downloadMode:"data+telemetry",filetype:[".fastq",".fq",".fastq.gz",".fq.gz"],signing:!0};function I(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}const b="\npage\npages\nhasNext\nhasPrevious\ntotalCount\n",v="\nidWorkflowInstance\nstartDate\nworkflowImage{\n  workflow\n  {\n    rev\n    name\n  }\n}\n";const E=function(){const t=(e,t)=>{e.headers||(e.headers={});let s=t;if(s||(s={}),!s.apikey||!s.apisecret)return;e.headers["X-EPI2ME-APIKEY"]=s.apikey,e.headers["X-EPI2ME-SIGNATUREDATE"]=(new Date).toISOString();const o=[Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n"),e.body].join("\n"),r=g.createHmac("sha1",s.apisecret).update(o).digest("hex");e.headers["X-EPI2ME-SIGNATUREV0"]=r};return{version:"3.0.1130",setHeaders:(s,o)=>{const{log:r}=e({log:{debug:()=>{}}},o);let i=o;if(i||(i={}),s.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-CLIENT":i.user_agent||"api","X-EPI2ME-VERSION":i.agent_version||E.version},s.headers,i.headers),"signing"in i&&!i.signing||t(s,i),i.proxy){const e=i.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),t=e[2],o=e[3],n={host:e[4],port:e[5]};t&&o&&(n.proxyAuth=`${t}:${o}`),i.proxy.match(/^https/)?(r.debug("using HTTPS over HTTPS proxy",JSON.stringify(n)),s.httpsAgent=f({proxy:n})):(r.debug("using HTTPS over HTTP proxy",JSON.stringify(n)),s.httpsAgent=w({proxy:n})),s.proxy=!1}}}}(),P=d(p),S=(e,t)=>{const{apikey:s,apisecret:o}=t.headers.keys;return delete t.headers.keys,E.setHeaders(t,{apikey:s,apisecret:o,signing:!0}),P(e,t)},_=new c({link:new l(e=>{const{apikey:t,apisecret:s,url:o}=e.getContext(),r=h({uri:`${o}/graphql`,fetch:S,headers:{keys:{apikey:t,apisecret:s}}});return u(r,e)}),cache:new a});p.defaults.validateStatus=e=>e<=504;const T=function(){const t=(e,t)=>{e.headers||(e.headers={});let s=t;if(s||(s={}),!s.apikey)return;if(e.headers["X-EPI2ME-ApiKey"]=s.apikey,!s.apisecret)return;e.headers["X-EPI2ME-SignatureDate"]=(new Date).toISOString(),e.url.match(/^https:/)&&(e.url=e.url.replace(/:443/,"")),e.url.match(/^http:/)&&(e.url=e.url.replace(/:80/,""));const o=[e.url,Object.keys(e.headers).sort().filter(e=>e.match(/^x-epi2me/i)).map(t=>`${t}:${e.headers[t]}`).join("\n")].join("\n"),r=g.createHmac("sha1",s.apisecret).update(o).digest("hex");e.headers["X-EPI2ME-SignatureV0"]=r},s=async e=>{const t=e?e.data:null;if(!t)return Promise.reject(new Error("unexpected non-json response"));if(e&&e.status>=400){let s=`Network error ${e.status}`;return t.error&&(s=t.error),504===e.status&&(s="Please check your network connection and try again."),Promise.reject(new Error(s))}return t.error?Promise.reject(new Error(t.error)):Promise.resolve(t)};return{version:"3.0.1130",headers:(s,o)=>{const{log:r}=e({log:{debug:()=>{}}},o);let i=o;if(i||(i={}),s.headers=e({Accept:"application/json","Content-Type":"application/json","X-EPI2ME-Client":i.user_agent||"api","X-EPI2ME-Version":i.agent_version||T.version},s.headers,i.headers),"signing"in i&&!i.signing||t(s,i),i.proxy){const e=i.proxy.match(/https?:\/\/((\S+):(\S+)@)?(\S+):(\d+)/),t=e[2],o=e[3],n={host:e[4],port:e[5]};t&&o&&(n.proxyAuth=`${t}:${o}`),i.proxy.match(/^https/)?(r.debug("using HTTPS over HTTPS proxy",JSON.stringify(n)),s.httpsAgent=f({proxy:n})):(r.debug("using HTTPS over HTTP proxy",JSON.stringify(n)),s.httpsAgent=w({proxy:n})),s.proxy=!1}},get:async(t,o)=>{const{log:r}=e({log:{debug:()=>{}}},o);let i,n=o.url,a=t;o.skip_url_mangle?i=a:(a=`/${a}`,n=n.replace(/\/+$/,""),a=a.replace(/\/+/g,"/"),i=n+a);const c={url:i,gzip:!0};let l;T.headers(c,o);try{r.debug(`GET ${c.url}`),l=await p.get(c.url,c)}catch(u){return Promise.reject(u)}return s(l,o)},post:async(t,o,r)=>{const{log:i}=e({log:{debug:()=>{}}},r);let n=r.url;n=n.replace(/\/+$/,"");const a={url:`${n}/${t.replace(/\/+/g,"/")}`,gzip:!0,data:o,headers:{}};if(r.legacy_form){const t=[],s=e({json:JSON.stringify(o)},o);Object.keys(s).sort().forEach(e=>{t.push(`${e}=${escape(s[e])}`)}),a.data=t.join("&"),a.headers["Content-Type"]="application/x-www-form-urlencoded"}T.headers(a,r);const{data:c}=a;let l;delete a.data;try{i.debug(`POST ${a.url}`),l=await p.post(a.url,c,a)}catch(u){return Promise.reject(u)}return r.handler?r.handler(l):s(l,r)},put:async(t,o,r,i)=>{const{log:n}=e({log:{debug:()=>{}}},i);let a=i.url;a=a.replace(/\/+$/,"");const c={url:`${a}/${t.replace(/\/+/g,"/")}/${o}`,gzip:!0,data:r,headers:{}};if(i.legacy_form){const t=[],s=e({json:JSON.stringify(r)},r);Object.keys(s).sort().forEach(e=>{t.push(`${e}=${escape(s[e])}`)}),c.data=t.join("&"),c.headers["Content-Type"]="application/x-www-form-urlencoded"}T.headers(c,i);const{data:l}=c;let u;delete c.data;try{n.debug(`PUT ${c.url}`),u=await p.put(c.url,l,c)}catch(h){return Promise.reject(h)}return s(u,i)}}}();class j{constructor(s){I(this,"createContext",t=>{const{apikey:s,apisecret:o,url:r}=this.options;return e({apikey:s,apisecret:o,url:r},t)}),I(this,"query",e=>({context:t={},variables:s={}}={})=>{const o=this.createContext(t);let r;return r="string"===typeof e?n`
        ${e}
      `:e,this.client.query({query:r,variables:s,context:o})}),I(this,"mutate",e=>({context:t={},variables:s={}}={})=>{const o=this.createContext(t);let r;return r="string"===typeof e?n`
        ${e}
      `:e,this.client.mutate({mutation:r,variables:s,context:o})}),I(this,"workflows",this.query(n`
    query allWorkflows($page: Int, $isActive: Int) {
      allWorkflows(page: $page, isActive: $isActive) {
        ${b}
        results {
          ${"\nidWorkflow\nname\ndescription\nsummary\nrev\n"}
        }
      }
    }
  `)),I(this,"workflowPages",async e=>{let t=e,s=await this.workflows({variables:{page:t}});const o=async e=>(t=e,s=await this.workflows({variables:{page:t}}),s);return{data:s,next:()=>o(t+1),previous:()=>o(t-1),first:()=>o(1),last:()=>o(0)}}),I(this,"workflow",this.query(n`
    query workflow($idWorkflow: ID!) {
      workflow(idWorkflow: $idWorkflow) {
        ${"\nidWorkflow\nname\ndescription\nsummary\nrev\n"}
      }
    }
   `)),I(this,"workflowInstances",this.query(n`
  query allWorkflowInstances($page: Int, $shared: Boolean, $idUser: Int) {
    allWorkflowInstances(page: $page, shared: $shared, idUser: $idUser) {
      ${b}
      results {
        ${v}
      }
    }
  }
   `)),I(this,"workflowInstance",this.query(n`
      query workflowInstance($idWorkflowInstance: ID!) {
        workflowInstance(idWorkflowInstance: $idWorkflowInstance) {
          ${v}
        }
      }
   `)),I(this,"startWorkflow",this.mutate(n`
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
  `)),I(this,"user",this.query(n`
    query user {
      me {
        username
        realname
        useraccountSet {
          idUserAccount
        }
      }
    }
  `)),I(this,"register",this.mutate(n`
    mutation registerToken($code: String!, $description: String) {
      registerToken(code: $code, descripton: $description) {
        apikey
        apisecret
        description
      }
    }
  `)),this.options=t({agent_version:T.version,local:!1,url:k,user_agent:"EPI2ME API",signing:!0},s),this.options.url=this.options.url.replace(/:\/\//,"://graphql."),this.log=this.options.log,this.client=_}}const x=(e,t)=>{const s=["","K","M","G","T","P","E","Z"];let o=t||0,r=e||0;return r>=1e3?(r/=1e3,o+=1,o>=s.length?"???":x(r,o)):0===o?`${r}${s[o]}`:`${r.toFixed(1)}${s[o]}`};class O{constructor(e){this.options=t({agent_version:T.version,local:!1,url:k,user_agent:"EPI2ME API",signing:!0},e),this.log=this.options.log}async list(e){const t=e.match(/^[a-z_]+/i)[0];return T.get(e,this.options).then(e=>e[`${t}s`])}async read(e,t){return T.get(`${e}/${t}`,this.options)}async user(){return this.options.local?{accounts:[{id_user_account:"none",number:"NONE",name:"None"}]}:T.get("user",this.options)}async status(){return T.get("status",this.options)}async jwt(){return T.post("authenticate",{},e({handler:e=>e.headers["x-epi2me-jwt"]?Promise.resolve(e.headers["x-epi2me-jwt"]):Promise.reject(new Error("failed to fetch JWT"))},this.options))}async instanceToken(s,o){return T.post("token",e(o,{id_workflow_instance:s}),t({},this.options,{legacy_form:!0}))}async installToken(e){return T.post("token/install",{id_workflow:e},t({},this.options,{legacy_form:!0}))}async attributes(){return this.list("attribute")}async workflows(){return this.list("workflow")}async amiImages(){if(this.options.local)throw new Error("amiImages unsupported in local mode");return this.list("ami_image")}async amiImage(e,t){let s,o,r;if(e&&t instanceof Object?(s=e,o=t,r="update"):e instanceof Object&&!t?(o=e,r="create"):(r="read",s=e),this.options.local)throw new Error("ami_image unsupported in local mode");if("update"===r)return T.put("ami_image",s,o,this.options);if("create"===r)return T.post("ami_image",o,this.options);if(!s)throw new Error("no id_ami_image specified");return this.read("ami_image",s)}async workflow(t,o,r){let i,n,a,c;if(t&&o&&r instanceof Function?(i=t,n=o,a=r,c="update"):t&&o instanceof Object&&!(o instanceof Function)?(i=t,n=o,c="update"):t instanceof Object&&o instanceof Function?(n=t,a=o,c="create"):t instanceof Object&&!o?(n=t,c="create"):(c="read",i=t,a=o instanceof Function?o:null),"update"===c)try{const e=await T.put("workflow",i,n,this.options);return a?a(null,e):Promise.resolve(e)}catch(p){return a?a(p):Promise.reject(p)}if("create"===c)try{const e=await T.post("workflow",n,this.options);return a?a(null,e):Promise.resolve(e)}catch(p){return a?a(p):Promise.reject(p)}if(!i){const e=new Error("no workflow id specified");return a?a(e):Promise.reject(e)}const l={};try{const t=await this.read("workflow",i);if(t.error)throw new Error(t.error);e(l,t)}catch(p){return this.log.error(`${i}: error fetching workflow ${String(p)}`),a?a(p):Promise.reject(p)}e(l,{params:{}});try{const t=await T.get(`workflow/config/${i}`,this.options);if(t.error)throw new Error(t.error);e(l,t)}catch(p){return this.log.error(`${i}: error fetching workflow config ${String(p)}`),a?a(p):Promise.reject(p)}const u=s(l.params,{widget:"ajax_dropdown"}),h=[...u.map((e,t)=>{const s=u[t];return new Promise((e,t)=>{const o=s.values.source.replace("{{EPI2ME_HOST}}","").replace(/&?apikey=\{\{EPI2ME_API_KEY\}\}/,"");T.get(o,this.options).then(t=>{const o=t[s.values.data_root];return o&&(s.values=o.map(e=>({label:e[s.values.items.label_key],value:e[s.values.items.value_key]}))),e()}).catch(e=>(this.log.error(`failed to fetch ${o}`),t(e)))})})];try{return await Promise.all(h),a?a(null,l):Promise.resolve(l)}catch(p){return this.log.error(`${i}: error fetching config and parameters ${String(p)}`),a?a(p):Promise.reject(p)}}async startWorkflow(e){return T.post("workflow_instance",e,t({},this.options,{legacy_form:!0}))}async stopWorkflow(e){return T.put("workflow_instance/stop",e,null,t({},this.options,{legacy_form:!0}))}async workflowInstances(e){return e&&e.run_id?T.get(`workflow_instance/wi?show=all&columns[0][name]=run_id;columns[0][searchable]=true;columns[0][search][regex]=true;columns[0][search][value]=${e.run_id};`,this.options).then(e=>e.data.map(e=>({id_workflow_instance:e.id_ins,id_workflow:e.id_flo,run_id:e.run_id,description:e.desc,rev:e.rev}))):this.list("workflow_instance")}async workflowInstance(e){return this.read("workflow_instance",e)}async workflowConfig(e){return T.get(`workflow/config/${e}`,this.options)}async register(e,s){return T.put("reg",e,{description:s||`${m.userInfo().username}@${m.hostname()}`},t({},this.options,{signing:!1}))}async datasets(e){let t=e;return t||(t={}),t.show||(t.show="mine"),this.list(`dataset?show=${t.show}`)}async dataset(e){return this.options.local?this.datasets().then(t=>t.find(t=>t.id_dataset===e)):this.read("dataset",e)}async fetchContent(e){const s=t({},this.options,{skip_url_mangle:!0,headers:{"Content-Type":""}});return T.get(e,s)}}class W{constructor(t,s){this.debounces={},this.debounceWindow=e({debounceWindow:2e3},s).debounceWindow,this.log=e({log:{debug:()=>{}}},s).log,t.jwt().then(e=>{this.socket=y(s.url,{transportOptions:{polling:{extraHeaders:{Cookie:`x-epi2me-jwt=${e}`}}}}),this.socket.on("connect",()=>{this.log.debug("socket ready")})})}debounce(t,s){const o=e(t)._uuid;if(o){if(this.debounces[o])return;this.debounces[o]=1,setTimeout(()=>{delete this.debounces[o]},this.debounceWindow)}s&&s(t)}watch(e,t){if(!this.socket)return this.log.debug(`socket not ready. requeueing watch on ${e}`),void setTimeout(()=>{this.watch(e,t)},1e3);this.socket.on(e,e=>this.debounce(e,t))}emit(e,t){if(!this.socket)return this.log.debug(`socket not ready. requeueing emit on ${e}`),void setTimeout(()=>{this.emit(e,t)},1e3);this.log.debug(`socket emit ${e} ${JSON.stringify(t)}`),this.socket.emit(e,t)}}class C{constructor(t){let s;if(s="string"===typeof t||"object"===typeof t&&t.constructor===String?JSON.parse(t):t||{},s.endpoint&&(s.url=s.endpoint,delete s.endpoint),s.log){if(!o([s.log.info,s.log.warn,s.log.error,s.log.debug,s.log.json],r))throw new Error("expected log object to have error, debug, info, warn and json methods");this.log=s.log}else this.log={info:e=>{console.info(`[${(new Date).toISOString()}] INFO: ${e}`)},debug:e=>{console.debug(`[${(new Date).toISOString()}] DEBUG: ${e}`)},warn:e=>{console.warn(`[${(new Date).toISOString()}] WARN: ${e}`)},error:e=>{console.error(`[${(new Date).toISOString()}] ERROR: ${e}`)},json:e=>{console.log(JSON.stringify(e))}};this.stopped=!0,this.states={upload:{filesCount:0,success:{files:0,bytes:0,reads:0},types:{},niceTypes:"",progress:{bytes:0,total:0}},download:{progress:{},success:{files:0,reads:0,bytes:0},fail:0,types:{},niceTypes:""},warnings:[]},this.config={options:i(s,$),instance:{id_workflow_instance:s.id_workflow_instance,inputQueueName:null,outputQueueName:null,outputQueueURL:null,discoverQueueCache:{},bucket:null,bucketFolder:null,remote_addr:null,chain:null,key_id:null}},this.config.instance.awssettings={region:this.config.options.region},this.REST=new O(e({log:this.log},this.config.options)),this.graphQL=new j(e({log:this.log},this.config.options)),this.timers={downloadCheckInterval:null,stateCheckInterval:null,fileCheckInterval:null,transferTimeouts:{},visibilityIntervals:{},summaryTelemetryInterval:null}}async socket(){return this.mySocket?this.mySocket:(this.mySocket=new W(this.REST,e({log:this.log},this.config.options)),this.mySocket)}async realtimeFeedback(e,t){(await this.socket()).emit(e,t)}async stopEverything(){this.stopped=!0,this.log.debug("stopping watchers"),["downloadCheckInterval","stateCheckInterval","fileCheckInterval","summaryTelemetryInterval"].forEach(e=>{this.timers[e]&&(this.log.debug(`clearing ${e} interval`),clearInterval(this.timers[e]),this.timers[e]=null)}),Object.keys(this.timers.transferTimeouts).forEach(e=>{this.log.debug(`clearing transferTimeout for ${e}`),clearTimeout(this.timers.transferTimeouts[e]),delete this.timers.transferTimeouts[e]}),Object.keys(this.timers.visibilityIntervals).forEach(e=>{this.log.debug(`clearing visibilityInterval for ${e}`),clearInterval(this.timers.visibilityIntervals[e]),delete this.timers.visibilityIntervals[e]}),this.downloadWorkerPool&&(this.log.debug("clearing downloadWorkerPool"),await Promise.all(Object.values(this.downloadWorkerPool)),this.downloadWorkerPool=null);const{id_workflow_instance:e}=this.config.instance;if(e){try{await this.REST.stopWorkflow(e)}catch(t){return this.log.error(`Error stopping instance: ${String(t)}`),Promise.reject(t)}this.log.info(`workflow instance ${e} stopped`)}return Promise.resolve()}reportProgress(){const{upload:e,download:t}=this.states;this.log.json({progress:{download:t,upload:e}})}storeState(e,t,s,o){const r=o||{};this.states[e]||(this.states[e]={}),this.states[e][t]||(this.states[e][t]={}),"incr"===s?Object.keys(r).forEach(s=>{this.states[e][t][s]=this.states[e][t][s]?this.states[e][t][s]+parseInt(r[s],10):parseInt(r[s],10)}):Object.keys(r).forEach(s=>{this.states[e][t][s]=this.states[e][t][s]?this.states[e][t][s]-parseInt(r[s],10):-parseInt(r[s],10)});try{this.states[e].success.niceReads=x(this.states[e].success.reads)}catch(n){this.states[e].success.niceReads=0}try{this.states[e].progress.niceSize=x(this.states[e].success.bytes+this.states[e].progress.bytes||0)}catch(n){this.states[e].progress.niceSize=0}try{this.states[e].success.niceSize=x(this.states[e].success.bytes)}catch(n){this.states[e].success.niceSize=0}this.states[e].niceTypes=Object.keys(this.states[e].types||{}).sort().map(t=>`${this.states[e].types[t]} ${t}`).join(", ");const i=Date.now();(!this.stateReportTime||i-this.stateReportTime>2e3)&&(this.stateReportTime=i,this.reportProgress())}uploadState(e,t,s){return this.storeState("upload",e,t,s)}downloadState(e,t,s){return this.storeState("download",e,t,s)}url(){return this.config.options.url}apikey(){return this.config.options.apikey}attr(e,t){if(!(e in this.config.options))throw new Error(`config object does not contain property ${e}`);return t?(this.config.options[e]=t,this):this.config.options[e]}stats(e){return this.states[e]}}C.version=T.version,C.Profile=class{constructor(t,s){this.allProfileData={},this.defaultEndpoint=process.env.METRICHOR||$.endpoint||$.url,this.raiseExceptions=s,t&&(this.allProfileData=e(t,{profiles:{}})),this.allProfileData.endpoint&&(this.defaultEndpoint=this.allProfileData.endpoint)}profile(t){return t?e({endpoint:this.defaultEndpoint},this.allProfileData.profiles[t]):{}}profiles(){return Object.keys(this.allProfileData.profiles||{})}},C.REST=O,C.utils=T;export default C;

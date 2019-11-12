/**
 * Copyright Metrichor Ltd. (An Oxford Nanopore Technologies Company) 2019
 */

"use strict";function _interopDefault(e){return e&&"object"===typeof e&&"default"in e?e.default:e}var os=require("os"),fs=_interopDefault(require("fs-extra")),path=_interopDefault(require("path")),lodash=require("lodash"),local=!1,url="https://epi2me.nanoporetech.com",gqlUrl="https://graphql.epi2me-dev.nanoporetech.com",user_agent="EPI2ME API",region="eu-west-1",sessionGrace=5,uploadTimeout=1200,downloadTimeout=1200,fileCheckInterval=5,downloadCheckInterval=3,stateCheckInterval=60,inFlightDelay=600,waitTimeSeconds=20,waitTokenError=30,transferPoolSize=3,downloadMode="data+telemetry",filetype=[".fastq",".fq",".fastq.gz",".fq.gz"],signing=!0,DEFAULTS={local:local,url:url,gqlUrl:gqlUrl,user_agent:user_agent,region:region,sessionGrace:sessionGrace,uploadTimeout:uploadTimeout,downloadTimeout:downloadTimeout,fileCheckInterval:fileCheckInterval,downloadCheckInterval:downloadCheckInterval,stateCheckInterval:stateCheckInterval,inFlightDelay:inFlightDelay,waitTimeSeconds:waitTimeSeconds,waitTokenError:waitTokenError,transferPoolSize:transferPoolSize,downloadMode:downloadMode,filetype:filetype,signing:signing};class Profile{constructor(e,t){this.prefsFile=e||Profile.profilePath(),this.allProfileData={},this.defaultEndpoint=process.env.METRICHOR||DEFAULTS.endpoint||DEFAULTS.url,this.raiseExceptions=t;try{this.allProfileData=lodash.merge(fs.readJSONSync(this.prefsFile),{profiles:{}}),this.allProfileData.endpoint&&(this.defaultEndpoint=this.allProfileData.endpoint)}catch(i){if(this.raiseExceptions)throw i}}static profilePath(){return path.join(os.homedir(),".epi2me.json")}profile(e,t){if(e&&t){lodash.merge(this.allProfileData,{profiles:{[e]:t}});try{fs.writeJSONSync(this.prefsFile,this.allProfileData)}catch(i){if(this.raiseExceptions)throw i}}return e?lodash.merge({endpoint:this.defaultEndpoint},this.allProfileData.profiles[e]):{}}profiles(){return Object.keys(this.allProfileData.profiles||{})}}module.exports=Profile;

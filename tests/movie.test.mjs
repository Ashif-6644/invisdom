import test from 'node:test';
import assert from 'node:assert/strict';
import {MOODS,validateInput,validateMovie,sampleMovie,shareText} from '../movie/core.mjs';
import {handleRequest,MovieQuota} from '../server/worker.mjs';

const input={name:'Ashif',mood:'chaotic',day:'Five meetings and finally a quiet cup of karak.'};
const movie={title:'The Karak Clause',genre:'Workday Comedy',tagline:'Five meetings. One very important tea break.',storyline:'Ashif navigates a busy day with a little wit and a perfectly timed cup of karak.'};
const origin='https://ashif-6644.github.io';
function req(value=input,options={}) {return new Request('https://studio.example/api/movie',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.4',...options.headers},body:typeof value==='string'?value:JSON.stringify(value),...options});}
const ai=async()=>({response:JSON.stringify(movie)});
function env(allowed=true,run=ai){return {AI:{run},RATE_LIMIT_SALT:'test-only-salt',MOVIE_QUOTA:{idFromName:()=>1,get:()=>({fetch:async()=>Response.json({allowed})})}};}
test('all moods produce labelled sample-compatible writing and new takes',()=>{
 for(const mood of MOODS){const a=validateMovie(sampleMovie({...input,mood},0)),b=validateMovie(sampleMovie({...input,mood},1));assert.notEqual(a.title,b.title);assert.ok(a.storyline.includes(input.name));assert.ok(a.storyline.includes(input.day));}
 assert.match(shareText(movie,'Ashif','https://example.test/',true),/sample movie poster/);
});
test('reject whitespace, overlong values, wrong moods, invalid response fields',()=>{
 for(const v of [{...input,name:' '},{...input,day:'short'},{...input,name:'a'.repeat(41)},{...input,day:'x'.repeat(361)},{...input,mood:'anything'},null])assert.throws(()=>validateInput(v));
 assert.throws(()=>validateMovie({...movie,title:'x'.repeat(65)}));assert.throws(()=>validateMovie({...movie,tagline:''}));
});
test('API rejects other origins and unconfigured service without provider calls',async()=>{
 let calls=0;const provider=async()=>{calls++;return ai()};
 const denied=new Request('https://studio.example/api/movie',{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:JSON.stringify(input)});
 assert.equal((await handleRequest(denied,env(true,provider))).status,403);
 assert.equal((await handleRequest(req(),{})).status,503);assert.equal(calls,0);
});
test('preflight and incorrect methods and invalid/oversize bodies',async()=>{
 const pre=new Request('https://studio.example/api/movie',{method:'OPTIONS',headers:{Origin:origin}});
 assert.equal((await handleRequest(pre,{})).status,204);
 const get=new Request('https://studio.example/api/movie',{headers:{Origin:origin}});
 assert.equal((await handleRequest(get,{})).status,405);
 for(const data of ['not JSON',{...input,name:' '},'x'.repeat(5000)])assert.equal((await handleRequest(req(data),env())).status,400);
});
test('Workers AI is used without an API key and returned JSON is validated',async()=>{
 let sent,selected;
 const result=await handleRequest(req(),env(true,async(model,options)=>{selected=model;sent=options;return ai();}));
 assert.equal(result.status,200);assert.deepEqual(await result.json(),{movie});assert.equal(selected,'@cf/meta/llama-3.1-8b-instruct-fp8');assert.equal(sent.response_format.type,'json_schema');assert.equal(sent.max_tokens,600);
 assert.equal(result.headers.get('Cache-Control'),'no-store');assert.equal(result.headers.get('Access-Control-Allow-Origin'),origin);
 assert.equal((await handleRequest(req(),env(true,async()=>({response:movie})))).status,200);
});
test('quota exhaustion and quota failure prevent AI calls',async()=>{
 let calls=0;const provider=async()=>{calls++;return ai()};
 assert.equal((await handleRequest(req(),env(false,provider))).status,429);
 const broken=env(true,provider);broken.MOVIE_QUOTA.get=()=>({fetch:async()=>{throw Error('offline')}});
 assert.equal((await handleRequest(req(),broken)).status,503);assert.equal(calls,0);
});
test('invalid AI output and provider failure return controlled errors',async()=>{
 for(const body of [{response:'invalid'},{response:{}},{response:{...movie,title:'x'.repeat(65)}}])assert.equal((await handleRequest(req(),env(true,async()=>body))).status,502);
 const failed=await handleRequest(req(),env(true,async()=>{throw Error('private provider detail')}));
 assert.equal(failed.status,502);assert.doesNotMatch(await failed.text(),/private provider detail/);
});
test('free daily allowance exhaustion returns 429 without a paid fallback',async()=>{
 let calls=0;
 const result=await handleRequest(req(),env(true,async()=>{calls++;throw Object.assign(Error('limit'),{code:3036});}));
 assert.equal(result.status,429);assert.equal(calls,1);
});
test('durable quota enforces shared daily and per-client caps and rolls over',async()=>{
 const data=new Map();let queue=Promise.resolve();
 const storage={transaction(fn){const work=queue.then(()=>fn({get:async k=>structuredClone(data.get(k)),put:async(k,v)=>data.set(k,structuredClone(v))}));queue=work.then(()=>{});return work;}};
 const quota=new MovieQuota({storage});
 async function consume(client,day='2026-10-23'){const result=await quota.fetch(new Request('https://quota.internal/consume',{method:'POST',body:JSON.stringify({client:client.repeat(64),day,globalLimit:3,clientLimit:2})}));return (await result.json()).allowed;}
 assert.deepEqual(await Promise.all([consume('a'),consume('a'),consume('a')]),[true,true,false]);
 assert.equal(await consume('b'),true);assert.equal(await consume('c'),false);assert.equal(await consume('c','2026-10-24'),true);
 const state=data.get('current');assert.deepEqual(Object.keys(state).sort(),['clients','day','total']);assert.equal(state.total,1);
});

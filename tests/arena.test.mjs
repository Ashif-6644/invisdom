import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHALLENGES,CATEGORIES,createRound,encodeRound,decodeRound,roundOptions} from '../arena/core.mjs';
test('every challenge can be shared and keeps its opponent and order',()=>{
 for(const challenge of CHALLENGES)for(const random of [()=>0,()=>0.999]){
  const round=createRound(challenge.id,'آشف 👋','This is my original answer with a little imagination.',random);
  assert.deepEqual(decodeRound(encodeRound(round)),round);
  const options=roundOptions(round);assert.equal(options.length,2);assert.equal(options.filter(o=>o.kind==='human').length,1);
  assert.equal(options.find(o=>o.kind==='human').text,round.answer);
  assert.equal(options.find(o=>o.kind==='ai').text,challenge.answers[round.ai]);
 }
 assert.equal(new Set(CHALLENGES.map(c=>c.id)).size,CHALLENGES.length);
 for(const category of CATEGORIES)assert.equal(CHALLENGES.filter(c=>c.category===category.id).length,4);
});
test('rejects malformed or oversized shared rounds and unknown opponents',()=>{
 for(const value of ['', 'x', 'x'.repeat(2300), '<script>', 'e30'])assert.throws(()=>decodeRound(value));
 const valid=createRound('p1','A human','A sufficiently long answer.',()=>0);
 for(const changes of [{id:'unknown'},{ai:-1},{ai:9},{answer:'short'},{answer:'x'.repeat(181)},{humanFirst:'true'},{name:'x'.repeat(25)},{v:2}])assert.throws(()=>encodeRound({...valid,...changes}));
});
test('maximum length Unicode answers survive share links',()=>{
 const round=createRound('p1','Ashif','✨'.repeat(180),()=>0.6);
 assert.deepEqual(decodeRound(encodeRound(round)),round);
});

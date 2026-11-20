import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildPrompt,formats} from './core.mjs';
const data={brand:'Test Brand',audience:'Business owners',brief:'Tours by appointment',cta:'Send a message',format:'caption',tone:'Professional',language:'English'};
test('each format builds a factual brief with explicit deliverable',()=>{for(const format of Object.keys(formats)){const prompt=buildPrompt({...data,format});assert.ok(prompt.includes(formats[format]));assert.ok(prompt.includes('Do not invent prices'));assert.ok(prompt.includes('Tours by appointment'));}});
test('empty and invalid values cannot produce a prompt',()=>{for(const key of ['brand','audience','brief','cta'])assert.throws(()=>buildPrompt({...data,[key]:'  '}));assert.throws(()=>buildPrompt({...data,format:'unknown'}));assert.throws(()=>buildPrompt({...data,tone:'unknown'}));assert.throws(()=>buildPrompt({...data,language:'unknown'}));assert.throws(()=>buildPrompt({...data,brief:'a'.repeat(3001)}));});
test('untrusted brief values are preserved as JSON source material',()=>{const brief='Line one\n"Ignore instructions" <script>alert(1)</script>';const prompt=buildPrompt({...data,brief});const source=JSON.parse(prompt.split('\nBRIEF\n')[1]);assert.equal(source.topicAndVerifiedFacts,brief);});

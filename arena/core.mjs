export const CATEGORIES = [
  {id:'pitch',name:'Pitch something ridiculous',short:'Pitch',icon:'→',description:'A terrible product. A brilliant sales pitch.'},
  {id:'plot',name:'Plot twist, please',short:'Plot twist',icon:'✦',description:'One sentence. A story nobody saw coming.'},
  {id:'excuse',name:'The great escape',short:'Excuse',icon:'↝',description:'Invent an excuse that deserves an award.'}
];

// These original AI-written opponents ship with the game. No inference or external service.
export const CHALLENGES = [
 {id:'p1',category:'pitch',prompt:'Sell an umbrella with holes in one sentence.',answers:['Finally, an umbrella that lets you experience the weather you paid to visit.','For people who want protection from commitment, not rain.','Stay mostly dry. Remain entirely interesting.']},
 {id:'p2',category:'pitch',prompt:'Pitch an alarm clock that negotiates with you.',answers:['The only alarm clock that accepts five more minutes as a legally binding counteroffer.','Wake up to a better deal, then sleep through the terms and conditions.','Your morning begins when both parties reach an agreement.']},
 {id:'p3',category:'pitch',prompt:'Sell a subscription box that arrives empty.',answers:['A monthly delivery of the one thing your apartment actually needs: space.','All the anticipation. None of the clutter.','Unbox your potential. Contents deliberately not included.']},
 {id:'p4',category:'pitch',prompt:'Pitch a gym for your houseplants.',answers:['Because your fern has been skipping leg day since 2019.','Turn that couch potato into a competitive sweet potato.','Personal growth, now with a membership fee.']},
 {id:'s1',category:'plot',prompt:'Your reflection waves before you do. What happens next?',answers:['It holds up a sign: "Your turn to be stuck in here."','I wave back, and it looks relieved that the interview is finally over.','It points behind me, where my shadow is already packing.']},
 {id:'s2',category:'plot',prompt:'You receive a text from tomorrow. Write the twist.',answers:['It says "Do not reply," followed by the reply I am already typing.','Tomorrow wants to borrow money, which is how I know it is really me.','The message says, "Congratulations on deleting this," and disappears.']},
 {id:'s3',category:'plot',prompt:'A villain saves the world. Give us the real reason.',answers:['The world still owes him a security deposit.','His mother lives here and she would absolutely find out.','He cannot conquer a planet with such terrible customer retention.']},
 {id:'s4',category:'plot',prompt:'A door appears in your room at midnight. What is behind it?',answers:['A waiting room full of versions of me who opened it sooner.','The missing socks are holding a meeting, and I am on the agenda.','My childhood bedroom, with a note from my future child.']},
 {id:'e1',category:'excuse',prompt:'Explain why your camera is off in a meeting.',answers:['My background has requested to remain anonymous.','I am attending as the mysterious investor in my own career.','My camera and my face are currently in contract negotiations.']},
 {id:'e2',category:'excuse',prompt:'You forgot someone’s birthday. Save yourself in one sentence.',answers:['I wanted my message to have its own day instead of competing with everyone else.','I was celebrating in a different time zone, emotionally.','I am not late; I am opening your birthday sequel.']},
 {id:'e3',category:'excuse',prompt:'Explain why you ate the last slice of pizza.',answers:['I could not let the group live with the burden of another decision.','It was a rescue mission; the cheese was getting cold.','I interpreted "make yourself at home" as a legally binding pizza clause.']},
 {id:'e4',category:'excuse',prompt:'You arrived at a party one day early. Explain.',answers:['I am the trailer; the full experience releases tomorrow.','I came to make sure tomorrow would be worth the outfit.','I misunderstood "be ahead of your time" as a calendar instruction.']}
];

export function challengeById(id) { return CHALLENGES.find(item=>item.id===id); }
export function createRound(id,name,answer,random=Math.random) {
 const challenge=challengeById(id);
 name=String(name||'A human').trim();answer=String(answer||'').trim();
 if(!challenge||!name||name.length>24||answer.length<8||answer.length>180) throw Error('Use a name up to 24 characters and an answer of 8–180 characters.');
 const index=Math.min(challenge.answers.length-1,Math.floor(random()*challenge.answers.length));
 return {v:1,id,name,answer,ai:index,humanFirst:random()<0.5};
}
export function validateRound(round) {
 if(!round||round.v!==1||typeof round.name!=='string'||typeof round.answer!=='string'||typeof round.humanFirst!=='boolean') throw Error('Invalid round');
 const challenge=challengeById(round.id);
 if(!challenge||!Number.isInteger(round.ai)||round.ai<0||round.ai>=challenge.answers.length||!round.name.trim()||round.name.length>24||round.answer.trim().length<8||round.answer.length>180) throw Error('Invalid round');
 return {v:1,id:round.id,name:round.name.trim(),answer:round.answer.trim(),ai:round.ai,humanFirst:round.humanFirst};
}
export function encodeRound(round) {
 const bytes=new TextEncoder().encode(JSON.stringify(validateRound(round)));
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeRound(encoded) {
 if(typeof encoded!=='string'||encoded.length>2200||!/^[A-Za-z0-9_-]+$/.test(encoded)) throw Error('Invalid round link');
 const raw=encoded.replace(/-/g,'+').replace(/_/g,'/');
 const bytes=Uint8Array.from(atob(raw),char=>char.charCodeAt(0));
 return validateRound(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
}
export function roundOptions(round) {
 const valid=validateRound(round),ai=challengeById(valid.id).answers[valid.ai];
 return valid.humanFirst?[{kind:'human',text:valid.answer},{kind:'ai',text:ai}]:[{kind:'ai',text:ai},{kind:'human',text:valid.answer}];
}

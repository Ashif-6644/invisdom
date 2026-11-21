import { buildPrompt,validateContent } from './core.mjs';
const form=document.querySelector('#brief-form');
const result=document.querySelector('#result');
const status=document.querySelector('#status');
const submit=form.querySelector('[type=submit]');
let endpoint='';
try {const candidate=window.INVISDOM_CONTENT_CONFIG?.apiUrl;if(candidate){const url=new URL(candidate);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/api/content')throw Error();endpoint=url.href;}}catch{}
let controller,version=0;
function clear(){version++;controller?.abort();result.value='';document.querySelector('#result-label').hidden=true;document.querySelector('#actions').hidden=true;document.querySelector('#empty').hidden=false;status.textContent='';submit.disabled=!endpoint;submit.textContent='Generate content';}
if(!endpoint){submit.disabled=true;status.textContent='AI generation is not connected yet. Please check back after the studio is activated.';}
document.querySelector('#example').addEventListener('click',()=>{
  const examples={
    caption:{brand:'Your Workspace',audience:'Entrepreneurs in Dubai',brief:'Promote private office tours. No confirmed prices or facilities to mention.',cta:'Message us to arrange an office tour.'},
    carousel:{brand:'Your HR Team',audience:'Small business managers',brief:'Explain simple ways to recognise employee contributions throughout the year, including a personal thank-you and giving credit for good work.',cta:'Share one way your team recognises good work.'},
    reel:{brand:'Your Cafe',audience:'Coffee lovers',brief:'A 30-second behind-the-scenes video showing the preparation of a coffee, from grinding beans to pouring the finished drink.',cta:'Visit us for your next coffee.'},
    whatsapp:{brand:'Business Center',audience:'Digital marketing businesses',brief:'Promote private offices. Do not mention prices or unconfirmed features.',cta:'Contact us to discuss your office requirements.'}
  };
  const values={...examples[form.elements.namedItem('format').value],tone:'Professional',language:'English'};
  for(const [key,value] of Object.entries(values))form.elements.namedItem(key).value=value;
  clear();status.textContent=endpoint?'Example added. Edit it to match your business, then generate your content.':'Example added. AI generation still needs to be connected.';
});
form.addEventListener('input',clear);
form.addEventListener('submit',async event=>{
  event.preventDefault();if(!endpoint){status.textContent='AI generation is not connected yet.';return;}
  clear();const requestVersion=version;
  const data=Object.fromEntries(new FormData(form));
  try{
    buildPrompt(data);controller=new AbortController();const timeout=setTimeout(()=>controller?.abort(),60000);
    submit.disabled=true;submit.textContent='Writing your content…';status.textContent='Creating your draft…';
    let response;try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});}finally{clearTimeout(timeout);}
    const body=await response.json();if(requestVersion!==version)return;
    if(!response.ok)throw Error(response.status===429?'Daily generation limit reached. Please try again later.':'Content generation is unavailable. Please try again later.');
    result.value=validateContent(body.content,data);
    document.querySelector('#empty').hidden=true;document.querySelector('#result-label').hidden=false;document.querySelector('#actions').hidden=false;
    status.textContent='Draft ready. Review it before sharing.';result.focus();
  }catch(error){if(requestVersion===version)status.textContent=error.name==='AbortError'?'Generation timed out. Please try again.':error.message;}
  finally{if(requestVersion===version){submit.disabled=false;submit.textContent='Generate content';}}
});
document.querySelector('#regenerate').addEventListener('click',()=>{if(!submit.disabled)form.requestSubmit();});
document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.value);status.textContent='Content copied.';}catch{result.focus();result.select();status.textContent='Use your device’s copy command to copy the selected content.';}});
document.querySelector('#download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([result.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='invisdom-content.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Content downloaded.';});

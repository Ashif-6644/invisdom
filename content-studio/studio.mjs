import { buildPrompt } from './core.mjs';
const form=document.querySelector('#brief-form');
const result=document.querySelector('#result');
const status=document.querySelector('#status');
document.querySelector('#example').addEventListener('click',()=>{
  const values={brand:'Your Workspace',audience:'Entrepreneurs and small teams in Dubai',brief:'Promote private office tours. Focus on a professional environment and a convenient workspace. Do not mention prices or unconfirmed facilities.',cta:'Message us to arrange an office tour.',tone:'Professional',language:'English'};
  for(const [key,value] of Object.entries(values)) form.elements.namedItem(key).value=value;
  form.dispatchEvent(new Event('input'));
  status.textContent='Example added. Edit it to match your business, then build your prompt.';
});
// Editing invalidates the old output so the copied prompt always matches the brief.
form.addEventListener('input',()=>{
  result.value='';document.querySelector('#result-label').hidden=true;
  document.querySelector('#actions').hidden=true;document.querySelector('#empty').hidden=false;status.textContent='';
});
form.addEventListener('submit',event=>{
  event.preventDefault();
  try{
    result.value=buildPrompt(Object.fromEntries(new FormData(form)));
    document.querySelector('#empty').hidden=true;document.querySelector('#result-label').hidden=false;document.querySelector('#actions').hidden=false;
    status.textContent='Prompt ready. Copy it into ChatGPT to generate your content.';
    result.focus();
  }catch(error){status.textContent=error.message;}
});
document.querySelector('#copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(result.value);status.textContent='Copied. Open ChatGPT and paste your prompt.';}
  catch{result.focus();result.select();status.textContent='Select and copy the prompt using your device’s copy command.';}
});
document.querySelector('#download').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([result.value],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='invisdom-content-prompt.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Prompt downloaded.';
});

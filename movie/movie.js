import { validateInput, sampleMovie, validateMovie, shareText } from './core.mjs';
const $ = id => document.getElementById(id);
const configuredUrl = window.INVISDOM_MOVIE_CONFIG?.apiUrl || '';
const apiUrl = (() => { try { return configuredUrl && new URL(configuredUrl).protocol === 'https:' ? configuredUrl : ''; } catch { return ''; } })();
let current = null, take = 0, working = false;
if (apiUrl) {
  $('mode-badge').textContent = 'AI MOVIE STUDIO';
  $('generate-label').textContent = 'Make my movie';
  $('privacy').textContent = 'Your name, mood and scene are sent to OpenAI to create your movie. This app does not save your scene or result. Keep private details out of your scene.';
}
$('day').addEventListener('input', () => { $('char-count').textContent = `${$('day').value.length} / 360`; });
$('movie-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (working) return;
  $('form-status').textContent = '';
  let input;
  try { input = validateInput({name:$('first-name').value, mood:new FormData($('movie-form')).get('mood'), day:$('day').value}); }
  catch (error) { $('form-status').textContent = error.message; return; }
  working = true; $('generate').disabled = true; $('movie-form').classList.add('is-loading');
  $('generate-label').textContent = apiUrl ? 'Writing your opening scene…' : 'Setting the scene…';
  try {
    let movie;
    if (apiUrl) {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 35000);
      try {
        const response = await fetch(apiUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(input), signal:controller.signal, credentials:'omit', cache:'no-store'});
        if (!response.ok) {
          const messages = {400:'Please check your name and scene, then try again.', 403:'This studio connection is not available from this site.', 422:'Try a lighter, everyday scene without sensitive details.', 429:'The studio has reached its request limit. Please come back later.', 503:'The AI studio is not connected yet. Please try again later.'};
          throw new Error(messages[response.status] || 'The studio is taking an intermission. Please try again.');
        }
        const data = await response.json(); movie = validateMovie(data.movie);
      } finally { clearTimeout(timer); }
    } else movie = validateMovie(sampleMovie(input, take));
    take += 1; current = {movie, input, isSample:!apiUrl}; renderResult();
    $('form-status').textContent = apiUrl ? 'Your movie is ready.' : 'Your sample poster is ready. The writing uses sample templates, not AI.';
    if (window.matchMedia('(max-width: 700px)').matches) $('result').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'});
  } catch (error) {
    $('form-status').textContent = error.name === 'AbortError' ? 'That took longer than expected. Please try again.' : error instanceof TypeError ? 'Could not reach the studio. Check your connection and try again.' : error.message;
  } finally {
    working = false; $('generate').disabled = false; $('movie-form').classList.remove('is-loading');
    $('generate-label').textContent = current ? (apiUrl ? 'Give me another take' : 'Try another sample take') : (apiUrl ? 'Make my movie' : 'Make a sample poster');
  }
});
function renderResult() {
  const {movie, input, isSample} = current;
  $('result-empty').hidden = true; $('result-content').hidden = false;
  $('result-mode').textContent = isSample ? 'SAMPLE · NOT AI-GENERATED' : 'YOUR AI MOVIE';
  $('poster-stamp').textContent = isSample ? 'SAMPLE' : 'AI STORY';
  $('take-label').textContent = `TAKE ${String(take).padStart(2,'0')}`;
  $('poster-name').textContent = `STARRING ${input.name.toLocaleUpperCase()}`;
  $('poster-title').textContent = movie.title.toLocaleUpperCase();
  $('poster-genre').textContent = movie.genre.toLocaleUpperCase();
  $('poster-tagline').textContent = movie.tagline;
  $('story').textContent = movie.storyline;
  $('share-status').textContent = ''; $('copy-fallback').hidden = true;
  fitTitle();
}
function fitTitle(){
  if(!current)return;
  const title=$('poster-title');let size=34;title.style.fontSize=`${size}px`;
  while((title.scrollHeight>title.clientHeight+1||title.scrollWidth>title.clientWidth+1)&&size>14){size--;title.style.fontSize=`${size}px`;}
}
new ResizeObserver(fitTitle).observe($('generated-poster'));
function wrap(ctx, text, width) {
  const lines = []; let line = '';
  // Break words only when a single token cannot fit, including CJK and long names.
  for (const word of text.replace(/\s+/g,' ').trim().split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= width) { line = candidate; continue; }
    if (line) { lines.push(line); line = ''; }
    for (const char of Array.from(word)) {
      if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = ''; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}
async function posterBlob() {
  if (!current) throw new Error('Make your movie first.');
  await document.fonts.ready;
  const {movie, input, isSample} = current;
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser could not create the poster image.');
  const ink='#143f37', cream='#fff0d5', orange='#ee764b';
  ctx.fillStyle = '#f8f6ed'; ctx.fillRect(0,0,1080,1920);
  ctx.fillStyle = ink; ctx.font = '700 29px "DM Sans", sans-serif'; ctx.fillText('✦  INVISDOM',72,100);
  ctx.textAlign='right';ctx.font='500 15px "DM Sans", sans-serif';ctx.fillText('YOUR LIFE AS A MOVIE',1008,96);ctx.textAlign='left';
  ctx.fillStyle=ink;ctx.fillRect(52,154,976,1510);
  ctx.fillStyle=cream;ctx.font='500 19px "DM Sans", sans-serif';ctx.fillText('INVISDOM PICTURES',100,220);
  ctx.textAlign='right';ctx.fillStyle='#cfd8b9';ctx.font='500 17px "DM Sans", sans-serif';ctx.fillText(isSample?'SAMPLE POSTER · NOT AI-GENERATED':'AN AI-WRITTEN STORY',976,220);ctx.textAlign='left';
  ctx.fillStyle=orange;ctx.beginPath();ctx.arc(590,608,265,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#f8bd9666';ctx.lineWidth=2;ctx.beginPath();ctx.arc(590,608,230,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.translate(140,945);ctx.rotate(-.12);const heights=[170,295,230,470,300,160,240,200];
  for(let i=0;i<heights.length;i++){ctx.fillStyle=ink;ctx.fillRect(i*101,-heights[i],84,heights[i]+140);ctx.fillStyle='#2b5c49';ctx.fillRect(i*101+66,-heights[i],18,heights[i]+140);}
  ctx.fillStyle=ink;ctx.beginPath();ctx.moveTo(315,-468);ctx.lineTo(346,-650);ctx.lineTo(367,-468);ctx.fill();ctx.restore();
  ctx.strokeStyle='#c4cea166';ctx.beginPath();ctx.ellipse(500,790,520,125,-.3,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=cream;ctx.textAlign='center';let starSize=26;do{ctx.font=`500 ${starSize}px "DM Sans", sans-serif`;starSize--;}while(ctx.measureText(`STARRING ${input.name.toLocaleUpperCase()}`).width>870&&starSize>12);ctx.fillText(`STARRING ${input.name.toLocaleUpperCase()}`,540,1050);ctx.textAlign='left';
  ctx.fillStyle='#d2d8ae';ctx.font='500 20px "DM Sans", sans-serif';ctx.fillText(movie.genre.toLocaleUpperCase(),100,1120,880);
  let titleSize=100,titleLines;
  do{ctx.font=`700 ${titleSize}px "Playfair Display", Georgia, serif`;titleLines=wrap(ctx,movie.title.toLocaleUpperCase(),870);if(titleLines.length<=3)break;titleSize-=4;}while(titleSize>48);
  ctx.fillStyle=cream;titleLines.forEach((line,i)=>ctx.fillText(line,100,1230+i*(titleSize*1.05)));
  const titleEnd=1230+(titleLines.length-1)*(titleSize*1.05);ctx.font='400 30px "DM Sans", sans-serif';
  let tagSize=30,tagLines;const tagY=titleEnd+62;
  do{ctx.font=`400 ${tagSize}px "DM Sans", sans-serif`;tagLines=wrap(ctx,movie.tagline,870);if(tagY+tagLines.length*tagSize*1.4<1570)break;tagSize-=2;}while(tagSize>16);
  ctx.fillStyle='#dfdfc5';tagLines.forEach((line,i)=>ctx.fillText(line,100,tagY+i*tagSize*1.4));
  ctx.strokeStyle='#b3c2a855';ctx.beginPath();ctx.moveTo(100,1600);ctx.lineTo(980,1600);ctx.stroke();
  ctx.font='500 13px "DM Sans", sans-serif';ctx.fillStyle='#d4d9bc';ctx.fillText('A FILM BY LIFE ITSELF',100,1634);ctx.textAlign='right';ctx.fillText('CREATED BY MOHAMED ASHIF',980,1634);ctx.textAlign='left';
  ctx.fillStyle=ink;ctx.font='500 22px "DM Sans", sans-serif';ctx.fillText('What would your movie be called?',72,1740);
  ctx.font='400 23px "DM Sans", sans-serif';ctx.fillText('ashif-6644.github.io/invisdom/movie/',72,1790);
  ctx.font='400 18px "DM Sans", sans-serif';ctx.fillStyle='#6d766c';ctx.fillText('@invisible_startdom',72,1850);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not create your poster image.')),'image/png'));
}
function filename(){return `INVISDOM-${current.input.name.replace(/[^a-z0-9_-]/gi,'').slice(0,30)||'Movie'}-Take-${take}.png`;}
function download(blob) {const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('download').addEventListener('click',async()=>{const button=$('download');button.disabled=true;try{download(await posterBlob());$('share-status').textContent='Your poster is ready to save. Upload it to your Instagram Story.';}catch(error){$('share-status').textContent=error.message;}finally{button.disabled=false;}});
let cachedFile=null;
// Prepare an image after generation so mobile Share can run within the user's tap.
const observer=new MutationObserver(()=>{cachedFile=null;if(current){const snapshot=current;posterBlob().then(blob=>{if(current===snapshot)cachedFile=new File([blob],filename(),{type:'image/png'});}).catch(()=>{});}});
observer.observe($('poster-title'),{childList:true});
$('share').addEventListener('click',async()=>{
  if(!current)return;
  const url=new URL('./',location.href);url.search='';url.hash='';
  const text=shareText(current.movie,current.input.name,url.href,current.isSample);
  try{
    if(cachedFile&&navigator.canShare?.({files:[cachedFile]})&&navigator.share){await navigator.share({files:[cachedFile],title:current.movie.title,text});return;}
    if(navigator.share){await navigator.share({title:current.movie.title,text});return;}
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);$('share-status').textContent='Movie text and link copied. Download the poster to share the image.';return;}
    showCopy(text);
  }catch(error){if(error.name!=='AbortError')showCopy(text);}
});
function showCopy(text){$('copy-fallback').hidden=false;$('copy-fallback').open=true;$('copy-text').value=text;$('copy-text').focus();$('copy-text').select();$('share-status').textContent='Select and copy your movie text below. You can also download the poster.';}

export const MOODS = ['chaotic', 'ambitious', 'tired', 'joyful', 'dreamy', 'determined'];
const samples = {
  chaotic: { genre:'Everyday Adventure Comedy', titles:['The Plot Thickens','Chaos, With Extra Coffee','Everything, All Before Lunch'], tagline:'One ordinary day. Absolutely no ordinary plot.', ending:'With a little caffeine and impeccable comic timing, our hero discovers that a messy day can still make a brilliant story.' },
  ambitious: { genre:'The Big-Dream Comedy', titles:['Watch This Space','The Next Big Thing','Main Character in Progress'], tagline:'Big plans. Small breaks. A very dramatic comeback.', ending:'Armed with a bigger dream than the to-do list, our hero turns a small opening into the beginning of something great.' },
  tired: { genre:'The Slow-Burn Comedy', titles:['Powered by the Last Sip','The Nap That Never Was','Running on Almost Empty'], tagline:'The energy is low. The stakes are surprisingly high.', ending:'Somewhere between the next task and a much-needed break, our hero finds a small win worth staying awake for.' },
  joyful: { genre:'A Feel-Good Feature', titles:['A Little More Sunshine','Good Things, Great Timing','The Best Part Is Now'], tagline:'Small wins. Big smiles. Roll the happy credits.', ending:'A simple moment turns into an unexpected reminder that the good stuff rarely needs a grand entrance.' },
  dreamy: { genre:'A Daydream Adventure', titles:['Somewhere Between Stars','The Beautiful Detour','Head in the Opening Credits'], tagline:'Reality called. Imagination answered first.', ending:'One unexpected detour turns the familiar into a world of possibilities, and our hero decides to follow the interesting route.' },
  determined: { genre:'The Everyday Comeback', titles:['One More Take','Still in the Story','The Comeback Starts Here'], tagline:'A difficult scene. A determined star. Another take.', ending:'It is not the easiest scene, but our hero finds a way forward, one small, stubborn step at a time.' }
};
export function validateInput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Please complete all three fields.');
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const day = typeof value.day === 'string' ? value.day.trim() : '';
  if (!name || name.length > 40 || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('Enter a first name of up to 40 characters.');
  if (day.length < 8 || day.length > 360 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(day)) throw new Error('Describe your day in 8–360 characters.');
  if (!MOODS.includes(value.mood)) throw new Error('Choose a mood from the list.');
  return {name, day, mood:value.mood};
}
export function sampleMovie(input, take = 0) {
  const v = validateInput(input), s = samples[v.mood];
  return {title:s.titles[take % s.titles.length], genre:s.genre, tagline:s.tagline, storyline:`${v.name} takes the lead. The opening scene: “${v.day}” ${s.ending}`};
}
export function validateMovie(value) {
  const max = {title:64, genre:45, tagline:130, storyline:650};
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The movie response was incomplete. Please try again.');
  const result = {};
  for (const key of Object.keys(max)) {
    if (typeof value[key] !== 'string' || !value[key].trim() || value[key].length > max[key] || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value[key])) throw new Error('The movie response was incomplete. Please try again.');
    result[key] = value[key].trim();
  }
  return result;
}
export function shareText(movie, name, url, isSample) {
  return `🎬 ${movie.title}\nStarring ${name}\n${movie.tagline}\n${movie.genre}\n\n${isSample ? 'My INVISDOM sample movie poster' : 'My INVISDOM AI movie'} — what would yours be called?\n${url}`;
}

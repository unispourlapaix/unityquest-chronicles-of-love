// Shared by the React game and the standalone artist page.
export async function createScoreImage({ variant = 0, pseudo, score, texts, assetBase = '' }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const background = ctx.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, '#f5eaf6'); background.addColorStop(1, '#fff1e2');
  ctx.fillStyle = background; ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = '#fffdfb'; ctx.beginPath(); ctx.roundRect(55, 55, 970, 1240, 48); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = texts.dir;
  const font = '"Segoe UI", Arial, sans-serif';
  const fit = (text, start, width, weight = '500') => {
    let size = start;
    do { ctx.font = `${weight} ${size}px ${font}`; if (ctx.measureText(text).width <= width) break; size -= 2; } while (size > 14);
  };
  ctx.fillStyle = '#685297'; ctx.font = `700 32px ${font}`; ctx.fillText('UNITYQUEST', 540, 120);
  fit(texts.words.score, 37, 850); ctx.fillText(texts.words.score, 540, 180);
  const sheep = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image); image.onerror = () => reject(new Error('Sheep image unavailable'));
    image.src = `${assetBase}/companions/sheep-${variant}.svg`;
  });
  ctx.drawImage(sheep, 250, 220, 580, 558);
  const name = String(pseudo || texts.words.anonymous);
  ctx.fillStyle = '#40354e'; fit(name, 48, 850, '600'); ctx.fillText(name, 540, 810);
  const value = new Intl.NumberFormat(texts.locale).format(score);
  ctx.fillStyle = '#685297'; fit(value, 100, 850, '750'); ctx.fillText(value, 540, 920);
  fit(texts.words.points, 32, 850); ctx.fillText(texts.words.points, 540, 994);
  ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; ctx.fillText('🐑 💗 ✨ 😊', 540, 1060);
  const message = texts.sheep[variant];
  ctx.fillStyle = '#74647b'; ctx.font = `28px ${font}`;
  const tokens = /\s/.test(message) ? message.split(/\s+/) : Array.from(message);
  const join = /\s/.test(message) ? ' ' : '';
  const lines = []; let line = '';
  for (const token of tokens) {
    const next = line ? line + join + token : token;
    if (ctx.measureText(next).width > 820 && line) { lines.push(line); line = token; } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > 3) { fit(message, 24, 850); ctx.fillText(message, 540, 1150); }
  else lines.forEach((text, index) => ctx.fillText(text, 540, 1120 + index * 38));
  ctx.fillStyle = '#a08aaf'; ctx.font = `20px ${font}`; ctx.fillText('♥ UnityQuest ♥', 540, 1245);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG unavailable')), 'image/png'));
  return new File([blob], 'unityquest-score.png', { type: 'image/png' });
}
export function downloadScoreImage(file) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = file.name;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export async function shareScoreImage(options) {
  const file = await createScoreImage(options);
  const payload = { title: options.texts.words.score, text: options.text, files: [file] };
  if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try { await navigator.share(payload); return 'shared'; }
    catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  }
  downloadScoreImage(file);
  return 'downloaded';
}

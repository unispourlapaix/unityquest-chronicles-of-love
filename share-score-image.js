// Original pixel artwork drawn directly on the local score card.
const seasons = [
  ['#9cc7d6','#fbe8d0','#8198a6','#4c7180','#d9ecdc','#75a496','#45786c','#f5afc3'],
  ['#68b6d5','#e8f6cc','#7899a8','#365f79','#edf6da','#65944c','#345f4a','#f8cb69'],
  ['#a798b7','#ffd6a1','#8d748e','#69536f','#f7dac4','#b07860','#754d50','#f2ae59'],
  ['#849bc8','#dfedfd','#697fa8','#455c86','#f2f6ff','#bfd5ea','#809abe','#f2a9ba']
];
const smiles = [':)', ':D', ';)', '^_^'];

function drawLandscape(ctx, variant) {
  const [sky, haze, far, near, snow, meadow, grass, bloom] = seasons[variant];
  const pixel = 10;
  const rect = (x,y,w,h,color) => {
    ctx.fillStyle = color;
    ctx.fillRect(60+x*pixel, 190+y*pixel, w*pixel, h*pixel);
  };
  const skyline = (base, color, height) => {
    for(let x=0;x<96;x++){
      const top = Math.round(height(x));
      if(top<base) rect(x,top,1,base-top,color);
    }
  };
  const peak = (x,c,t,w) => t + Math.abs(x-c)*w;
  rect(0,0,96,64,sky);
  rect(0,25,96,27,haze);
  for(let y=0;y<13;y++){
    const half=Math.floor(Math.sqrt(Math.max(0,42-(y-6)**2)));
    rect(74-half,5+y,half*2+1,1,variant===3?'#ffefda':'#fff0b5');
  }
  for(const [x,y] of [[3,9],[30,12],[55,6]]){
    rect(x,y,13,2,haze); rect(x+3,y-2,7,2,haze); rect(x+5,y-3,3,1,haze);
  }
  skyline(49,far,x=>Math.min(peak(x,15,18,.9),peak(x,39,9,.87),peak(x,67,15,.68),peak(x,91,19,1.1)));
  const ridge=x=>Math.min(peak(x,23,24,.78),peak(x,52,15,1.13),peak(x,80,23,.92));
  skyline(54,near,ridge);
  for(let x=0;x<96;x++){
    const top=Math.round(ridge(x));
    const cap=26+(x*7%5);
    if(top<cap)rect(x,top,1,cap-top,snow);
    if(x>=52&&x<66) rect(x,Math.max(cap,top),1,Math.max(0,47-Math.max(cap,top)),far);
  }
  skyline(64,meadow,x=>45+3*Math.sin(x/10)+2*Math.cos(x/6));
  skyline(64,grass,x=>54+3*Math.sin(x/13));
  for(let i=0;i<115;i++){
    const x=(i*37+13)%96, y=49+(i*29%15);
    rect(x,y,1+(i%3===0?1:0),1,i%4===0?bloom:i%3===0?haze:meadow);
    if((variant===0||variant===1)&&i%13===0&&y<63){rect(x,y,1,2,grass);rect(x,y,1,1,bloom);}
  }
  for(const [x,y] of [[7,47],[15,48],[87,48],[91,45]]){
    rect(x,y,1,5,near);
    for(let k=0;k<4;k++) rect(x-k,y-6+k*2,1+2*k,2,variant===2?bloom:near);
    if(variant===3) rect(x-2,y-2,5,1,snow);
  }

  // Hand-drawn sprite; each character is one square pixel.
  const sheep=[
    '..........####..........',
    '.....#####WWWW#####.....',
    '...##WWWWWWWWWWWWWW##...',
    '..#WWWWWWWWWWWWWWWWWW#..',
    '.#WWLLWWWWWWWWWLLWWWWW#.',
    '.#WLLWWWWWWWWLLLLLWWWW#.',
    '#WWWWWWWWWWLLWLLLWWWWWW#',
    '#WWWLLWWWLLWWWWWWLLWWWW#',
    '#WLLLLWLLWWW########LLW#',
    '#WWWWWLWWW##FFFFFFFF##W#',
    '#WWWWWWWW#EFFRFFFFRFFE##',
    '#WWWWWWWL#EEFFKFFKFFEE#.',
    '.#LLLWWWL#FFFFPFFPFFFF#.',
    '..#LLLLLL#FFFFFKKFFFF#..',
    '...#######FFFFFMMFFFF#..',
    '.....##...##FFFFFF##....',
    '.....##.....######......',
    '.....##......##.##......'
  ];
  const palette={'#':'#333349',W:'#fffcf0',L:'#d6d3e5',F:'#c49888',E:'#a7767e',R:'#e9bc9f',K:'#342d43',P:'#f6aeb5',M:'#865369'};
  rect(30,60,38,2,near); rect(34,59,30,4,near);
  sheep.forEach((row,y)=>[...row].forEach((cell,x)=>{
    if(palette[cell])rect(36+x, 43+y, 1,1,palette[cell]);
  }));
  // A small seasonal accessory and a wool highlight.
  rect(47,42,3,1,bloom); rect(48,41,1,3,bloom);
  rect(41,40,4,1,'#ffffff');
}

export function scoreShareText({ variant = 0, pseudo, score, texts }) {
  const index = seasons[variant] ? variant : 0;
  const value = new Intl.NumberFormat(texts.locale).format(score);
  return [pseudo, `${texts.words.score} : ${value} ${texts.words.points}`, smiles[index]].filter(Boolean).join(' — ');
}

export async function createScoreImage({ variant = 0, pseudo, score, texts }) {
  const index = seasons[variant] ? variant : 0;
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#171b2b'; ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle = '#293047'; ctx.fillRect(30,30,1020,1290);
  ctx.fillStyle = '#20263a'; ctx.fillRect(40,40,1000,1270);
  ctx.fillStyle = '#d9bfb2'; ctx.fillRect(60,164,960,6); ctx.fillRect(60,850,960,6);
  drawLandscape(ctx,index);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const print = (text,y,size,color,weight='600',font='system-ui, sans-serif') => {
    ctx.fillStyle=color;
    do { ctx.font=`${weight} ${size}px ${font}`; if(ctx.measureText(text).width<=900)break; size-=2; } while(size>14);
    ctx.fillText(text,540,y,900);
  };
  ctx.direction='ltr';
  print('UNITYQUEST',112,48,'#fff0d6','800','monospace');
  ctx.direction=texts.dir;
  print(texts.words.score,910,36,'#d4d8eb');
  const value = new Intl.NumberFormat(texts.locale).format(score);
  print(`${value} ${texts.words.points}`,1015,82,'#fff0d6','800');
  if(pseudo) print(String(pseudo),1120,39,'#d4d8eb');
  ctx.direction='ltr';
  print(smiles[index],pseudo?1218:1168,56,'#efbccd','700','monospace');
  const blob = await new Promise((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG unavailable')), 'image/png'));
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
  let supportsFiles = false;
  try { supportsFiles = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] }); } catch {}
  if (supportsFiles) {
    try { await navigator.share(payload); return 'shared'; }
    catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  }
  downloadScoreImage(file);
  return 'downloaded';
}

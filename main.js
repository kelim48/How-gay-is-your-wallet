
import './style.css';
import { analyzeAddress } from './analyzer/solanaAnalyzer.js';
import { computeFeaturesFromOnchain, scoreFromFeatures } from './lib/scoring.js';
import { phraseForScore, explainFeatures } from './lib/phrases.js';
import { renderShareImage } from './lib/canvasShare.js';

// DOM elements
const addressInput = document.getElementById('address');
const analyzeBtn = document.getElementById('analyzeBtn');
const randomBtn = document.getElementById('randomBtn');
const resultCard = document.getElementById('resultCard');
const scoreValue = document.getElementById('scoreValue');
const phraseEl = document.getElementById('phrase');
const explainEl = document.getElementById('explain');
const gaugeFill = document.getElementById('gaugeFill');
const pfpCanvas = document.getElementById('pfpCanvas');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');

function showToast(msg, timeout=2400){
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(()=> toast.classList.add('hidden'), timeout);
}

analyzeBtn.addEventListener('click', async ()=> {
  const address = addressInput.value.trim();
  if (!address) return showToast('Please enter a wallet address');
  await runAnalysis(address);
});

randomBtn.addEventListener('click', ()=> {
  // generate random-looking address (for fun)
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let s = '';
  for (let i=0;i<44;i++) s += chars[Math.floor(Math.random()*chars.length)];
  addressInput.value = s;
  showToast('Random address generated');
});

resetBtn.addEventListener('click', ()=> {
  resultCard.classList.add('hidden');
  addressInput.value = '';
});

async function runAnalysis(address){
  try {
    showToast('Analyzing...');
    // analysis: attempt to use real provider if configured (none by default)
    const analysis = await analyzeAddress(address, {}); // options could include realProvider
    // derive features & score
    const features = computeFeaturesFromOnchain(Object.assign({}, analysis, {address}));
    const score = scoreFromFeatures(features);
    const phrase = phraseForScore(score);
    // update UI
    scoreValue.textContent = score;
    phraseEl.textContent = phrase;
    explainEl.innerHTML = explainFeatures(features);
    gaugeFill.style.width = score + '%';
    resultCard.classList.remove('hidden');
    if (score >= 75) burstConfetti(document.body, 120);
    // draw mini avatar in canvas
    drawMiniAvatar(pfpCanvas.getContext('2d'), features.avatarSeed || Math.floor((Math.random()*360)));
    // save last results on window for sharing
    window.__lastResult = {address, score, phrase, features, avatarSeed: features.avatarSeed};
    showToast('Done — ready to share!');
  } catch (err) {
    console.error(err);
    showToast('Analysis failed: ' + (err.message || 'unknown error'));
  }
}

shareBtn.addEventListener('click', async ()=> {
  if (!window.__lastResult) return showToast('Nothing to share yet');
  const res = await renderShareImage(window.__lastResult);
  // try Web Share API with blob
  if (navigator.canShare && navigator.canShare({files: []}) && res.blob) {
    const file = new File([res.blob], 'gayness.png', {type:'image/png'});
    try {
      await navigator.share({files:[file], title:'My Gayness Score', text: window.__lastResult.phrase});
      showToast('Shared!');
      return;
    } catch (err) {
      console.warn('Share failed', err);
    }
  }
  // fallback: open image in new tab
  const win = window.open(res.url, '_blank');
  if (win) win.focus();
});

downloadBtn.addEventListener('click', async ()=> {
  if (!window.__lastResult) return showToast('Nothing to download yet');
  const res = await renderShareImage(window.__lastResult);
  const a = document.createElement('a');
  a.href = res.url;
  a.download = 'gayness.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Downloaded image');
});

function drawMiniAvatar(ctx, seed){
  const size = Math.min(ctx.canvas.width, ctx.canvas.height);
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(ctx.canvas.width/2 - 32, ctx.canvas.height/2 - 32);
  // draw simple avatar using seed hue
  const hue = seed % 360;
  ctx.fillStyle = 'hsl('+hue+' 70% 50%)';
  ctx.beginPath(); ctx.arc(48,48,44,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  for (let i=0;i<5;i++){
    const ang = i*Math.PI*2/5 - Math.PI/2;
    ctx.lineTo(48 + Math.cos(ang)*26, 48 + Math.sin(ang)*26);
    const ang2 = ang + Math.PI/5;
    ctx.lineTo(48 + Math.cos(ang2)*10, 48 + Math.sin(ang2)*10);
  }
  ctx.fill();
  ctx.restore();
}

// keyboard enter support
addressInput.addEventListener('keyup', (e)=> { if (e.key === 'Enter') analyzeBtn.click(); });

// expose for debugging
window.runAnalysis = runAnalysis;


function burstConfetti(container, count=80) {
  // simple colorful paper confetti using canvas overlay
  const cvs = document.createElement('canvas');
  cvs.width = container.offsetWidth || 800;
  cvs.height = container.offsetHeight || 400;
  cvs.style.position = 'fixed';
  cvs.style.left = 0;
  cvs.style.top = 0;
  cvs.style.pointerEvents = 'none';
  cvs.style.zIndex = 9999;
  document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  const pieces = [];
  for (let i=0;i<count;i++){
    pieces.push({
      x: Math.random()*cvs.width,
      y: -Math.random()*cvs.height,
      ang: Math.random()*Math.PI*2,
      vx: (Math.random()-0.5)*6,
      vy: 2+Math.random()*6,
      size: 6 + Math.random()*10,
      color: `hsl(${Math.floor(Math.random()*360)} 70% 60%)`,
      rot: Math.random()*Math.PI*2,
      drot: (Math.random()-0.5)*0.2
    });
  }
  let t = 0;
  function frame(){
    t++;
    ctx.clearRect(0,0,cvs.width,cvs.height);
    for (const p of pieces){
      p.x += p.vx; p.y += p.vy; p.rot += p.drot;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    }
    if (t < 180) requestAnimationFrame(frame);
    else cvs.remove();
  }
  requestAnimationFrame(frame);
}
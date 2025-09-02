
// canvasShare.js - generate a shareable PNG on client side and offer download/share
export async function renderShareImage({address, score, phrase, features, avatarSeed}) {
  const width = 1200, height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');

  // background gradient
  const g = ctx.createLinearGradient(0,0,width,height);
  g.addColorStop(0, '#0f1724');
  g.addColorStop(1, '#2b1432');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,width,height);

  // decorative gradient blob
  const blob = ctx.createLinearGradient(0,0,width*0.6,height*0.6);
  blob.addColorStop(0, '#ff6ec7');
  blob.addColorStop(1, '#7c5cff');
  ctx.fillStyle = blob;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.ellipse(width*0.78, height*0.28, 300,200, Math.PI/6, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // left panel for avatar
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  roundRect(ctx, 60, 80, 420, 470, 20, true, false);

  // draw avatar (generated identicon-ish)
  drawAvatar(ctx, 260, 210, 160, avatarSeed);

  // Score big text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px Inter, system-ui, sans-serif';
  ctx.fillText(score + '%', 520, 240);

  // phrase
  ctx.font = '28px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  wrapText(ctx, phrase, 520, 290, 620, 34);

  // address small
  ctx.font = '20px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Address: ' + truncateAddress(address), 520, 380);

  // features lines
  ctx.font = '18px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  const feats = [
    'Tx count: ' + features.txCount,
    'Programs: ' + features.uniquePrograms,
    'NFTs: ' + features.nfts,
    'Social tokens: ' + features.socialTokens
  ];
  feats.forEach((t,i)=> ctx.fillText(t, 520, 420 + i*28));

  // watermark
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('Crypto Gayness Analyzer — just for fun', 60, height - 40);

  // helper functions
  function truncateAddress(a){ if(!a) return ''; return a.slice(0,6)+'...'+a.slice(-4); }
  function roundRect(ctx,x,y,w,h,r,fill,stroke){ if (typeof r==='undefined') r=5; ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill) ctx.fill(); if(stroke) ctx.stroke(); }
  function wrapText(ctx,text,x,y,maxWidth,lineHeight){
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  function drawAvatar(ctx, cx, cy, size, seed) {
    // simple colored star-ish shape based on seed
    const hue = seed % 360;
    ctx.save();
    ctx.translate(cx, cy);
    // circular background
    ctx.fillStyle = 'hsl(' + hue + ' 70% 50%)';
    ctx.beginPath();
    ctx.arc(0,0,size/2,0,Math.PI*2);
    ctx.fill();
    // star overlay
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const spikes = 5;
    const outer = size*0.46;
    const inner = size*0.2;
    ctx.beginPath();
    for (let i=0;i<spikes;i++){
      const ang = i*Math.PI*2/spikes - Math.PI/2;
      ctx.lineTo(Math.cos(ang)*outer, Math.sin(ang)*outer);
      const ang2 = ang + Math.PI/spikes;
      ctx.lineTo(Math.cos(ang2)*inner, Math.sin(ang2)*inner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // return blob
  return new Promise((resolve)=>{
    canvas.toBlob((b)=> resolve({blob:b, url:canvas.toDataURL('image/png')}),'image/png',0.95);
  });
}

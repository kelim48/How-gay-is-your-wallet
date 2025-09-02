import './style.css'

// Fun phrases based on gayness percentage ranges
const phrases = {
  0: "Straight as an arrow 🏹",
  10: "Slightly curious 👀",
  20: "Questioning vibes 🤔",
  30: "Rainbow adjacent 🌈",
  40: "Bi-curious energy ✨",
  50: "Half gay, half not 🤷‍♂️",
  60: "Pretty gay tbh 💅",
  70: "Very gay energy 🏳️‍🌈",
  80: "Super gay vibes ✨🌈",
  90: "Extremely gay 💖",
  100: "MAXIMUM GAYNESS ACHIEVED! 🏳️‍🌈✨💖"
};

function getRandomPercentage() {
  return Math.floor(Math.random() * 101);
}

function getPhraseForPercentage(percentage) {
  // Find the closest phrase key
  const keys = Object.keys(phrases).map(Number).sort((a, b) => a - b);
  let closestKey = keys[0];
  
  for (let key of keys) {
    if (percentage >= key) {
      closestKey = key;
    }
  }
  
  return phrases[closestKey];
}

function isValidSolanaAddress(address) {
  // Basic Solana address validation (base58, 32-44 characters)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

function analyzeWallet() {
  const walletInput = document.getElementById('wallet-input');
  const resultDiv = document.getElementById('result');
  const address = walletInput.value.trim();
  
  if (!address) {
    resultDiv.innerHTML = `
      <div class="error">
        <p>Please enter a wallet address! 🤨</p>
      </div>
    `;
    return;
  }
  
  if (!isValidSolanaAddress(address)) {
    resultDiv.innerHTML = `
      <div class="error">
        <p>Invalid Solana address format! 😅</p>
        <p class="small">Make sure it's a valid Solana wallet address</p>
      </div>
    `;
    return;
  }
  
  // Generate "random" percentage (but consistent for same address)
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const percentage = Math.abs(hash) % 101;
  
  const phrase = getPhraseForPercentage(percentage);
  
  resultDiv.innerHTML = `
    <div class="result-card">
      <div class="percentage-display">
        <span class="percentage-number">${percentage}%</span>
        <span class="percentage-label">GAY</span>
      </div>
      <div class="phrase">
        <p>${phrase}</p>
      </div>
      <div class="wallet-info">
        <p class="small">Wallet: ${address.slice(0, 8)}...${address.slice(-8)}</p>
      </div>
      <div class="share-section">
        <button onclick="shareOnTwitter(${percentage}, '${phrase.replace(/'/g, "\\'")}')" class="twitter-btn">
          Generate Image & Share 🐦📸
        </button>
      </div>
      <div class="donation-section">
        <p class="donation-text">Help us fund the leaderboard of shame 💸</p>
        <div class="donation-wallet">
          <code>8zApmiUpersHw6XesgfP1DYm13rTtAQ4g54cM1PbvmWz</code>
          <button onclick="copyDonationWallet()" class="copy-btn">Copy</button>
        </div>
      </div>
    </div>
  `;
}

function shareOnTwitter(percentage, phrase) {
  // Generate and download the image
  const walletInput = document.getElementById('wallet-input');
  const walletAddress = walletInput.value.trim();
  const canvas = generateResultImage(percentage, phrase, walletAddress);
  
  // Download the image
  downloadImage(canvas, `crypto-gayness-${percentage}percent.png`);
  
  // Open Twitter with text
  const text = `My crypto wallet is ${percentage}% gay! ${phrase} 🏳️‍🌈\n\nCheck your wallet's gayness at:`;
  const url = window.location.href;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  // Small delay to ensure download starts first
  setTimeout(() => {
    window.open(twitterUrl, '_blank');
  }, 500);
}

function copyDonationWallet() {
  const walletAddress = '8zApmiUpersHw6XesgfP1DYm13rTtAQ4g54cM1PbvmWz';
  navigator.clipboard.writeText(walletAddress).then(() => {
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#27ae60';
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  });
}

function generateResultImage(percentage, phrase, walletAddress) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size for Twitter optimal image (1200x630)
  canvas.width = 1200;
  canvas.height = 630;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add rainbow overlay for higher percentages
  if (percentage > 50) {
    const rainbowGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    rainbowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
    rainbowGradient.addColorStop(0.17, 'rgba(255, 165, 0, 0.1)');
    rainbowGradient.addColorStop(0.33, 'rgba(255, 255, 0, 0.1)');
    rainbowGradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.1)');
    rainbowGradient.addColorStop(0.67, 'rgba(0, 0, 255, 0.1)');
    rainbowGradient.addColorStop(0.83, 'rgba(75, 0, 130, 0.1)');
    rainbowGradient.addColorStop(1, 'rgba(238, 130, 238, 0.1)');
    ctx.fillStyle = rainbowGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏳️‍🌈 Crypto Gayness Analyzer', canvas.width / 2, 100);
  
  // Percentage
  ctx.font = 'bold 120px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`${percentage}%`, canvas.width / 2, 280);
  
  // GAY label
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('GAY', canvas.width / 2, 330);
  
  // Phrase (wrap text if too long)
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  const cleanPhrase = phrase.replace(/[^\w\s!]/g, ''); // Remove emojis for canvas
  const words = cleanPhrase.split(' ');
  let line = '';
  let y = 420;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > 1000 && n > 0) {
      ctx.fillText(line, canvas.width / 2, y);
      line = words[n] + ' ';
      y += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);
  
  // Wallet address (shortened)
  ctx.font = '24px Monaco, Menlo, monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const shortWallet = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
  ctx.fillText(shortWallet, canvas.width / 2, y + 80);
  
  // Website URL
  ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Check your wallet at: ' + window.location.hostname, canvas.width / 2, y + 120);
  
  return canvas;
}

function downloadImage(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <h1>🏳️‍🌈 Crypto Gayness Analyzer</h1>
      <p class="subtitle">Discover your wallet's rainbow energy ✨</p>
    </header>
    
    <main class="main">
      <div class="analyzer-card">
        <div class="input-section">
          <h2 class="question">How gay is your wallet? 🏳️‍🌈</h2>
          <label for="wallet-input">Enter your Solana wallet address:</label>
          <input 
            type="text" 
            id="wallet-input" 
            placeholder="e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
            maxlength="44"
          />
          <button onclick="analyzeWallet()" class="analyze-btn">
            Analyze My Gayness 🔍
          </button>
        </div>
        
        <div id="result" class="result-section">
          <div class="placeholder">
            <p>Enter your wallet address above to discover your gayness level! 🌈</p>
          </div>
        </div>
      </div>
      
      <div class="disclaimer">
        <p>⚠️ This is purely for entertainment purposes. Results are completely random and not based on actual wallet activity!</p>
      </div>
    </main>
  </div>
`;

// Make functions globally available
window.analyzeWallet = analyzeWallet;
window.shareOnTwitter = shareOnTwitter;
window.copyDonationWallet = copyDonationWallet;
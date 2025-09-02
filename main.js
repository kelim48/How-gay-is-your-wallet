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
          Share on Twitter 🐦
        </button>
      </div>
      <div class="donation-section">
        <p class="donation-text">Help us fund the leaderboard of shame 💸</p>
        <div class="donation-wallet">
          <code>7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU</code>
          <button onclick="copyDonationWallet()" class="copy-btn">Copy</button>
        </div>
      </div>
    </div>
  `;
}

function shareOnTwitter(percentage, phrase) {
  const text = `My crypto wallet is ${percentage}% gay! ${phrase} 🏳️‍🌈\n\nCheck your wallet's gayness at:`;
  const url = window.location.href;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank');
}

function copyDonationWallet() {
  const walletAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
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
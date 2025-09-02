
Upgraded Crypto Gayness Analyzer
--------------------------------

Files:
- index.html
- style.css
- main.js
- analyzer/solanaAnalyzer.js  (mock-first; can accept options.realProvider to plug a real on-chain provider)
- lib/scoring.js (scoring logic)
- lib/phrases.js (phrase generation)
- lib/canvasShare.js (image generation)

How to plug a real provider:
- Option A: Provide a function to analyzeAddress as options.realProvider that returns an object with:
  { txCount, uniquePrograms, splTokens, nfts, dexInteractions, socialTokens, avatarSeed }
- Option B: Modify analyzer/solanaAnalyzer.js to call your RPC / Helius / Solscan APIs. The current repository intentionally leaves that step to you to avoid shipping API keys.

Build & Run:
This project uses plain ES modules and should work with a static server or Vite. To run with Vite (already present in the original project):
1. npm install
2. npm run dev

Notes:
- The analyzer is intentionally playful and deterministic when no RPC is provided.
- Image generation is client-side and uses Canvas; sharing attempts to use the Web Share API and falls back to opening the PNG in a new tab.


Server proxy (optional, recommended for real on-chain analysis)
---------------------------------------------------------------
A lightweight Express server is included in /server. It uses @solana/web3.js and by default connects to the public Solana mainnet RPC.
To run the server:
1) cd server
2) npm install
3) (optional) set environment variable RPC_URL to a custom RPC endpoint (e.g. an Alchemy/Solana or QuickNode URL)
4) npm start
Then run the client (or host the client files) and the client will automatically try to call /api/analyze on the same origin.

If you plan to deploy, put the server behind a host (Render, Heroku, Railway, Vercel Serverless functions) and set RPC_URL to a reliable RPC provider to avoid rate limits.

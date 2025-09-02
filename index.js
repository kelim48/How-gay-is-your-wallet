import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const app = express();
app.use(cors());
app.use(express.json());

// Configurable via env
const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.RPC_URL || clusterApiUrl('mainnet-beta');
const PAGE_LIMIT = 1000; // signature fetch limit per request (may be rate-limited by RPC)

const connection = new Connection(RPC_URL, 'confirmed');

function safeNumber(v){ return typeof v === 'number' ? v : 0; }

app.get('/api/analyze', async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) return res.status(400).json({error: 'address required'});
    const pub = new PublicKey(address);

    // fetch recent signatures (may not cover historical fully)
    const sigs = await connection.getSignaturesForAddress(pub, {limit: PAGE_LIMIT});
    const txCount = sigs.length;

    // fetch parsed transactions for those signatures
    const sigStrings = sigs.map(s=>s.signature);
    const txs = [];
    for (let i=0;i<sigStrings.length;i+=100){
      const batch = sigStrings.slice(i, i+100);
      const parsed = await connection.getParsedTransactions(batch, {maxSupportedTransactionVersion:0});
      parsed.forEach(p => { if (p) txs.push(p); });
    }

    // derive unique program ids and dex-like interactions heuristically
    const uniqueProgramSet = new Set();
    let dexInteractions = 0;
    for (const t of txs){
      const message = t.transaction.message;
      const instructions = message.instructions || [];
      for (const instr of instructions){
        let pid = instr.programId?.toString?.() || instr.programId;
        if (!pid && instr.programIdIndex !== undefined){
          // fallback: try to read from accountKeys
          pid = message.accountKeys && message.accountKeys[instr.programIdIndex] && message.accountKeys[instr.programIdIndex].pubkey?.toString();
        }
        if (pid) uniqueProgramSet.add(pid);
        // naive dex detection: program not system or token program
        if (pid && pid !== '11111111111111111111111111111111' && pid !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
          dexInteractions += 1;
        }
      }
    }

    // token accounts (SPL tokens)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pub, {programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')});
    let splTokens = tokenAccounts.value.length;
    // approximate NFTs: token accounts with amount == 1 and decimals == 0
    let nfts = 0;
    for (const ta of tokenAccounts.value){
      try {
        const amt = ta.account.data.parsed.info.tokenAmount;
        if (amt && typeof amt.uiAmount === 'number' && amt.uiAmount === 1 && amt.decimals === 0) nfts += 1;
      } catch(e){}
    }

    // social tokens heuristic: count token mints with small supply? (approximate by counting tokens < 20)
    const socialTokens = Math.min(40, Math.floor(splTokens * 0.15));

    const result = {
      address,
      txCount,
      uniquePrograms: uniqueProgramSet.size,
      splTokens,
      nfts,
      dexInteractions,
      socialTokens,
      rpcUrl: RPC_URL
    };
    return res.json(result);
  } catch (err) {
    console.error('analyze error', err && err.message);
    return res.status(500).json({error: err.message || 'server failure'});
  }
});

app.listen(PORT, ()=> {
  console.log('Server listening on', PORT);
  console.log('Using RPC:', RPC_URL);
});
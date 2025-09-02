
// scoring.js - deterministic "AI-like" scoring using features
export function seededHashToNumber(seed) {
  // simple xorshift-ish hash to produce reproducible pseudo-random number [0,1)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  // normalize
  return (h >>> 0) / 4294967296;
}

export function computeFeaturesFromOnchain(analysis) {
  // analysis is an object with optional properties produced by a real analyzer
  // We'll produce features with sensible defaults
  const features = {
    txCount: analysis.txCount || 0,
    uniquePrograms: analysis.uniquePrograms || 0,
    splTokens: analysis.splTokens || 0,
    nfts: analysis.nfts || 0,
    dexInteractions: analysis.dexInteractions || 0,
    socialTokens: analysis.socialTokens || 0,
    // fallback: seed-based randomness to make different addresses differ
    seedFactor: seededHashToNumber(analysis.address || ''),
  };
  return features;
}

export function scoreFromFeatures(features) {
  // playful weighted scoring; outputs 0..100
  // whimsically, bigger NFT count -> +, more dex interactions -> -, social tokens -> +, etc.
  const weights = {
    txCount: 0.08,
    uniquePrograms: 0.12,
    splTokens: 0.10,
    nfts: 0.22,
    dexInteractions: -0.15,
    socialTokens: 0.18,
    seedFactor: 0.45
  };
  // normalize some inputs (log-ish)
  const tx = Math.log10(Math.min(Math.max(features.txCount,1), 1e6));
  const progs = Math.log10(Math.min(Math.max(features.uniquePrograms,1), 1e4));
  const spl = Math.log10(Math.min(Math.max(features.splTokens,1),1e4));
  const nfts = Math.log10(Math.min(Math.max(features.nfts,1),1e4));
  const dex = Math.log10(Math.min(Math.max(features.dexInteractions+1,1),1e4));
  const social = Math.log10(Math.min(Math.max(features.socialTokens+1,1),1e4));
  let raw = 0;
  raw += tx * weights.txCount;
  raw += progs * weights.uniquePrograms;
  raw += spl * weights.splTokens;
  raw += nfts * weights.nfts;
  raw += dex * weights.dexInteractions;
  raw += social * weights.socialTokens;
  raw += features.seedFactor * weights.seedFactor * 6; // scale seed moderately
  // map to 0..100-ish with sigmoid
  const mapped = 1/(1+Math.exp(-raw+1)); // sigmoid shift
  return Math.round(mapped * 100);
}

// solanaAnalyzer.js - updated to try server-side proxy at /api/analyze if available, else mock
export async function analyzeAddress(address, options = {}) {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address');
  }

  // If a realProvider is given, use it
  if (options.realProvider && typeof options.realProvider === 'function') {
    try {
      const data = await options.realProvider(address);
      if (data && typeof data === 'object') return Object.assign({address}, data);
    } catch (e) {
      console.warn('realProvider failed, falling back:', e && e.message);
    }
  }

  // If running alongside a server proxy that exposes /api/analyze, try that first
  try {
    const resp = await fetch('/api/analyze?address=' + encodeURIComponent(address));
    if (resp.ok) {
      const data = await resp.json();
      if (data && !data.error) return Object.assign({address}, data);
      // else fallthrough to mock
    }
  } catch (e) {
    // ignore and fallback to client mock
  }

  // Client-side deterministic mock (same as before)
  function seededInt(seed, min, max) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    h = Math.abs((h * 1664525 + 1013904223) | 0) >>> 0;
    const r = (h % 10000) / 10000;
    return Math.floor(min + r * (max - min + 1));
  }

  const features = {
    address,
    txCount: seededInt(address+'tx', 0, 1500),
    uniquePrograms: seededInt(address+'prog', 1, 40),
    splTokens: seededInt(address+'spl', 0, 120),
    nfts: seededInt(address+'nft', 0, 40),
    dexInteractions: seededInt(address+'dex', 0, 200),
    socialTokens: seededInt(address+'social', 0, 40),
    avatarSeed: seededInt(address+'avatar', 0, 360)
  };

  return features;
}
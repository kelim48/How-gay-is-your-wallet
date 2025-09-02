
// phrases.js - generates a custom phrase and explanation based on features and score
const phrasesBuckets = [
  {min:90, phrase: "Unapologetically fabulous 🌈", tone:"extravagant"},
  {min:75, phrase: "Rainbow-level vibes", tone:"loud"},
  {min:60, phrase: "Pride-ready energy", tone:"cheerful"},
  {min:45, phrase: "Curious explorer of aesthetics", tone:"quirky"},
  {min:30, phrase: "Closeted shimmer", tone:"subtle"},
  {min:0,  phrase: "Stoic and mysterious", tone:"dry"}
];

export function phraseForScore(score) {
  for (let b of phrasesBuckets) {
    if (score >= b.min) return b.phrase;
  }
  return "Unique and unclassified";
}

export function explainFeatures(features) {
  // simple human-readable explanation
  const lines = [];
  lines.push(`<strong>Transactions:</strong> ${features.txCount} overall activity`);
  lines.push(`<strong>Programs used:</strong> ${features.uniquePrograms} distinct programs`);
  lines.push(`<strong>SPL tokens:</strong> ${features.splTokens} tokens held`);
  lines.push(`<strong>NFTs:</strong> ${features.nfts} NFTs`);
  lines.push(`<strong>DEX interactions:</strong> ${features.dexInteractions}`);
  lines.push(`<strong>Social tokens count:</strong> ${features.socialTokens}`);
  return lines.join('<br/>');
}

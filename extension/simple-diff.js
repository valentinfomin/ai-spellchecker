/**
 * Simple text diff algorithm (Longest Common Subsequence).
 * Used to calculate word-level differences between original and fixed text.
 * Returns a list of changes: { type: 'same'|'ins'|'del', value: string }
 */
export function diffWords(text1, text2) {
  // Split text into words, punctuation, and whitespace tokens
  // \w matches standard word characters
  // \u00C0-\u00FF matches Latin-1 Supplement (common accented chars)
  // \p{L} would be better but requires 'u' flag which might complicate simple split
  const split = (text) => text.match(/[\w\u00C0-\u00FF]+|[^\w\s]|[\s]+/g) || [];
  
  const tokens1 = split(text1);
  const tokens2 = split(text2);
  
  const m = tokens1.length;
  const n = tokens2.length;
  
  // DP Matrix for LCS
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokens1[i - 1] === tokens2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  let i = m;
  let j = n;
  const changes = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
      changes.unshift({ type: 'same', value: tokens1[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      changes.unshift({ type: 'ins', value: tokens2[j - 1] });
      j--;
    } else {
      changes.unshift({ type: 'del', value: tokens1[i - 1] });
      i--;
    }
  }

  return changes;
}

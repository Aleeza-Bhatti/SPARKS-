export function getCosineSimilarity(a: number[], b: number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function getMeanVector(vectors: number[][]): number[] {
  if (!vectors.length) return [];
  const len = vectors[0].length;
  const sum = new Array(len).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < len; i++) sum[i] += vec[i];
  }
  return sum.map((v) => v / vectors.length);
}

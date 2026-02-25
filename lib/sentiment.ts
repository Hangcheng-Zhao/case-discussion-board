// Auto-classify sentiment based on keyword matching

export function classifySentiment(
  text: string,
  positiveKeywords: string[],
  negativeKeywords: string[]
): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();

  let positiveScore = 0;
  let negativeScore = 0;

  for (const kw of positiveKeywords) {
    if (lower.includes(kw)) positiveScore++;
  }

  for (const kw of negativeKeywords) {
    if (lower.includes(kw)) negativeScore++;
  }

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}

export type SpamDetectionResult = {
  flagged: boolean;
  reason?: string;
};

const URL_PATTERN = /https?:\/\/|www\./i;
const REPEAT_CHAR_PATTERN = /(.)\1{8,}/;
const SPAM_KEYWORDS = [
  'click here',
  'free money',
  'crypto giveaway',
  'whatsapp only',
  'telegram only',
  'earn $',
  'work from home',
];

/**
 * Lightweight spam hook — flags obvious patterns for moderation review.
 */
export function detectSpam(body: string | null | undefined): SpamDetectionResult {
  if (!body?.trim()) return { flagged: false };

  const text = body.trim().toLowerCase();

  if (text.length > 2000) {
    return { flagged: true, reason: 'MESSAGE_TOO_LONG' };
  }

  const urlMatches = text.match(new RegExp(URL_PATTERN.source, 'gi'));
  if (urlMatches && urlMatches.length >= 3) {
    return { flagged: true, reason: 'EXCESSIVE_LINKS' };
  }

  if (REPEAT_CHAR_PATTERN.test(text)) {
    return { flagged: true, reason: 'REPEAT_CHARACTERS' };
  }

  for (const keyword of SPAM_KEYWORDS) {
    if (text.includes(keyword)) {
      return { flagged: true, reason: 'SPAM_KEYWORD' };
    }
  }

  return { flagged: false };
}

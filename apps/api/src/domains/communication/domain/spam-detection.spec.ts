import { detectSpam } from './spam-detection';

describe('spam-detection', () => {
  it('flags excessive links', () => {
    const result = detectSpam(
      'visit https://a.com and https://b.com and https://c.com now',
    );
    expect(result.flagged).toBe(true);
    expect(result.reason).toBe('EXCESSIVE_LINKS');
  });

  it('passes normal messages', () => {
    expect(detectSpam('Is this still available?')).toEqual({ flagged: false });
  });

  it('flags spam keywords', () => {
    const result = detectSpam('Limited crypto giveaway — click here!');
    expect(result.flagged).toBe(true);
    expect(result.reason).toBe('SPAM_KEYWORD');
  });
});

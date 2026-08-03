import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { serializeJsonLdForHtmlScript } from './serialize-json-ld';

describe('serializeJsonLdForHtmlScript (SEC-001)', () => {
  it('escapes script breakout sequences in title and description', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: '</script><script>alert(1)</script>',
      description: 'Nice car</script><img src=x onerror=alert(1)>',
    };

    const html = serializeJsonLdForHtmlScript(payload);

    assert.equal(html.includes('</script>'), false);
    assert.equal(html.includes('<script>'), false);
    assert.equal(html.includes('<img'), false);
    assert.equal(html.includes('<'), false);
    assert.equal(html.includes('>'), false);
    assert.match(html, /\\u003c\/script\\u003e/);
    assert.match(html, /\\u003cscript\\u003e/);
  });

  it('remains valid JSON that round-trips to original values', () => {
    const payload = {
      name: '</script><script>alert(1)</script>',
      description: 'A & B > C < D',
      price: 15000,
    };

    const html = serializeJsonLdForHtmlScript(payload);
    const parsed = JSON.parse(html) as typeof payload;

    assert.equal(parsed.name, payload.name);
    assert.equal(parsed.description, payload.description);
    assert.equal(parsed.price, payload.price);
  });

  it('escapes ampersands and line separators', () => {
    const html = serializeJsonLdForHtmlScript({
      name: 'A & B\u2028C\u2029D',
    });
    assert.equal(html.includes('&'), false);
    assert.equal(html.includes('\u2028'), false);
    assert.equal(html.includes('\u2029'), false);
    assert.match(html, /\\u0026/);
  });
});

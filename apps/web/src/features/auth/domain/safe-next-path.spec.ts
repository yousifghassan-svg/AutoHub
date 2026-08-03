import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hrefWithNext, resolveLoginReturn } from './login-return';
import { safeNextPath } from './safe-next-path';

describe('safeNextPath (P5-1)', () => {
  it('allows same-origin relative paths', () => {
    assert.equal(safeNextPath('/sell'), '/sell');
    assert.equal(safeNextPath('/my-listings?tab=draft'), '/my-listings?tab=draft');
  });

  it('rejects open redirects', () => {
    assert.equal(safeNextPath('https://evil.com'), null);
    assert.equal(safeNextPath('//evil.com'), null);
    assert.equal(safeNextPath('\\evil'), null);
    assert.equal(safeNextPath('javascript:alert(1)'), null);
    assert.equal(safeNextPath(''), null);
    assert.equal(safeNextPath(null), null);
  });
});

describe('login return helpers (P5-1)', () => {
  it('appends safe next to login/profile-setup hrefs', () => {
    assert.equal(hrefWithNext('/login', '/sell'), '/login?next=%2Fsell');
    assert.equal(
      hrefWithNext('/profile-setup', '/sell'),
      '/profile-setup?next=%2Fsell',
    );
  });

  it('omits next when unsafe or missing', () => {
    assert.equal(hrefWithNext('/login', '//evil.com'), '/login');
    assert.equal(hrefWithNext('/login', null), '/login');
  });

  it('resolves login return with fallback', () => {
    assert.equal(resolveLoginReturn('/sell'), '/sell');
    assert.equal(resolveLoginReturn('https://x', '/'), '/');
  });
});

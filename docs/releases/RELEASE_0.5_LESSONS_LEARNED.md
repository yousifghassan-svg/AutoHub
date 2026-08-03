# Release 0.5 — Lessons Learned

**Companion:** [`RELEASE_0.5_MARKETPLACE.md`](./RELEASE_0.5_MARKETPLACE.md)  
**Date:** 2026-08-04

---

## What worked

1. **Extend, don’t rebuild** — Reusing the listing hub + sell plugins beat a parallel marketplace rewrite.  
2. **Slice audits before code** — P5-1…P5-9 each started with an audit; reduced duplicate forms/logic.  
3. **Platform packages for draft + quality** — `@autohub/utils` engines kept host listing-generic.  
4. **Create/edit one mode switch** — Edit parity succeeded by mounting the same wizard, not a thin form.  
5. **Strict production audit** — Catching JSON-LD XSS and plate lifecycle asymmetry before freeze was worth the FAIL → fix cycle.  
6. **Shared lifecycle helper** — Extracting `listingContentEditBlockedMessage` prevented vehicle/plate drift.

---

## What to improve next time

1. **Plugin boundaries early** — Edit hydrate leaked domain repos into the host; define `hydrateFromListing` on the plugin contract before the next vertical.  
2. **Freeze exceptions in writing at slice time** — P5-1 Auth `next` touch should have carried a waiver in the slice commit, not only at freeze.  
3. **Backlog hygiene with code** — BUG-006/014 stayed “open” in docs after code fixed them; close bugs in the same slice.  
4. **E2E earlier** — Unit coverage is strong; ownership/media/status e2e would have shortened the audit.  
5. **Staging evidence as a hard gate** — Mirror Search: leave ops smoke explicit, but schedule it before tagging when possible.

---

## Process notes for later freezes

- Keep Auth/Search freeze tags untouched unless a written waiver is recorded in the consuming release.  
- Production audit → fix blockers → focused re-audit → freeze docs → tag → push.  
- Deferred list must be exhaustive so the freeze stays immutable except hotfixes.

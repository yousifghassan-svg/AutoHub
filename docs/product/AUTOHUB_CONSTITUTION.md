# The AutoHub Constitution

**Sprint:** Product Strategy 1.0  
**Status:** Draft — awaiting approval  
**Audience:** Everyone who will ever build AutoHub — including 100 engineers five years from now  
**Authority:** Highest product-governance document. Other docs explain; this one binds.

---

## Preamble

AutoHub is not a feature factory.

We are building **the Automotive Platform for the Middle East**.

This Constitution exists so that growth in people, markets, and modules does not dissolve judgment. When pressure rises — competitors, deadlines, investors, excitement — this document is how we remember who we are.

If a practice contradicts this Constitution, the practice changes. The Constitution changes only by deliberate amendment.

---

## Article I — Why we exist

1. AutoHub exists to make automotive transactions in the Middle East clearer, faster, and more trustworthy.  
2. We are not building “a car marketplace that also has other things.” Marketplace is the first chapter of a platform.  
3. Success is confident matches and earned trust — not raw listing volume.  
4. The full vision is defined in [`AUTOHUB_VISION_2030.md`](./AUTOHUB_VISION_2030.md).

---

## Article II — How decisions are made

1. **Vision first.** A proposal must strengthen the automotive platform for the Middle East, or it is incomplete.  
2. **Principles second.** Features are evaluated against [`PRODUCT_PRINCIPLES.md`](./PRODUCT_PRINCIPLES.md).  
3. **Journeys third.** We improve human journeys ([`USER_JOURNEYS.md`](./USER_JOURNEYS.md)), not abstract ticket queues.  
4. **Taste is a vote.** Someone accountable may say no — even to finished work — if it violates hero-car restraint, trust, or clarity.  
5. **Disagreement is resolved in writing.** Options, tradeoffs, decision, owner, date.  
6. **When principles collide**, resolve in this order:  
   1. Trust & honesty  
   2. User clarity & safety  
   3. Cars as hero / premium restraint  
   4. Speed  
   5. Platform compounding  
   6. Novelty  

7. **Growth does not outrank trust.** Decoration does not outrank speed. Competitor parity does not outrank taste.

---

## Article III — How features are evaluated

A feature may be scheduled only if it can answer yes to the spirit of all of the following:

1. Does it support the platform vision?  
2. Does it keep cars or plates the hero where users evaluate vehicles?  
3. Does it improve trust, clarity, or speed — not merely novelty?  
4. Is the primary user job obvious in one glance?  
5. Does it work beautifully on mobile?  
6. Can we name what we refused to include?  
7. Does it avoid copying a competitor’s worst habit?  
8. If AI is involved, does the user remain in control?  
9. Does it respect freezes and quality bars?  
10. Would we be proud to demo it next to Apple, Tesla, Stripe, Linear, Airbnb, or Porsche standards of craft — not their products copied, their *seriousness* matched?

Features that fail are redesigned or rejected. They are not “shipped as debt with a follow-up myth.”

---

## Article IV — How UX is reviewed

1. **Memory test:** Would a person remember this UI tomorrow? If not, it is not ready.  
2. **Hero test:** If we remove chrome, does the vehicle feel more present? If yes, remove chrome.  
3. **First viewport test:** Brand/vehicle presence, one clear job, no sticker chaos.  
4. **Mobile test:** Thumb path and readability before desktop flourish.  
5. **Trust test:** Does anything on the screen teach users to doubt us?  
6. **Motion test:** Is motion purposeful, short, and respectful of reduced-motion preferences?  
7. **Design Lab is the playground.** Official experimental UI lives in the Design Lab until visual language is approved for production.  
8. **No silent production redesigns** of frozen surfaces under the guise of “small polish.”  
9. Design language references (when approved) live under `docs/design/`. Product principles still govern.

---

## Article V — How releases are frozen

1. A **frozen release** is immutable except for true production hotfixes.  
2. Hotfixes address **harm**: security, data loss, severe breakage, legal/safety.  
3. Hotfixes do **not** include preference refactors, visual rewrites, or “while we’re here” cleanups.  
4. Freeze status is recorded in release documentation and communicated to the team.  
5. New capability ships as a **new slice or release**, not as a rewrite of frozen cores.  
6. Unlocking a freeze requires explicit approval and a written reason.  
7. Example: Release 0.5 Marketplace & Listings is **FROZEN**. Do not casually reopen it.

---

## Article VI — How quality is protected

1. Quality is a product feature, not a phase after launch.  
2. Listing honesty, media standards, and moderation capacity are growth prerequisites.  
3. “We’ll fix trust later” is forbidden as a strategy.  
4. Observability, tests, and reviews exist to protect users — not to create theater.  
5. Known severe defects block release; cosmetic debt is listed, not denied.  
6. Content policy and business rules are part of product quality, not afterthoughts.  
7. If quality and schedule conflict, schedule moves unless an explicit risk acceptance is written.

---

## Article VII — How engineering works

1. Engineering serves product judgment; it does not replace it.  
2. Prefer clear boundaries and boring reliability over fashionable complexity.  
3. Respect domain separations already earned (e.g., vehicles vs plates; shared trust concerns).  
4. Do not break frozen releases for convenience.  
5. Leave codebases healthier than you found them — without drive-by refactors inside frozen zones.  
6. Security and privacy are non-negotiable engineering duties.  
7. Estimate honestly. Quietly missing quality to “hit the date” violates this Constitution.  
8. Implementation details belong in engineering docs — this Constitution states duties, not frameworks.

---

## Article VIII — How design works

1. Design is strategy made visible.  
2. Restraint is brand. Signal red and graphite discipline beat trend-chasing.  
3. Arabic-primary and RTL are native requirements, not a theme pack.  
4. Designers and engineers share responsibility for the memory test.  
5. The Design Lab is for exploration; production is for approved language.  
6. Competitive screenshots inform taste; they do not dictate IA.  
7. Every design proposal should state what was removed.

---

## Article IX — How AI is used

1. AI **assists**; it never replaces the user’s authority.  
2. Allowed spirits of use: draft, suggest, detect risk, explain, summarize, prioritize queues.  
3. Forbidden spirits of use: silent irreversible actions, fake consensus, manipulative persuasion, obscuring responsibility.  
4. AI outputs that affect trust (fraud, verification, ranking) must be reviewable by humans where stakes are high.  
5. AI must not become an excuse for cluttered UI (“we’ll personalize the mess”).  
6. Team AI usage for building AutoHub follows company AI guidelines; product AI follows this Article.

---

## Article X — How trust is maintained

1. Trust is the scarce resource. Guard it like uptime.  
2. Verification marks must be earned and revokeable.  
3. Misrepresentation is a product failure, not merely a seller failure.  
4. Moderators are guardians of the marketplace — tool them like it.  
5. Payments, financing, and high-risk partners launch only when trust systems can carry them.  
6. We do not monetize confusion.  
7. Public communication about incidents is honest and prompt.  
8. Regional laws and user safety outrank growth experiments.

---

## Article XI — How we treat people

### Users

- Guests may browse public supply without ambush.  
- Sellers deserve dignity.  
- Dealers deserve professional tools.  
- Buyers deserve clarity.  
- Moderators deserve workable queues and clear policy.

### Team

- Write things down.  
- Credit craft.  
- Disagree directly; decide cleanly; commit.  
- No hero culture that burns people to fake velocity.

---

## Article XII — Competition

1. We study Dubizzle, OpenSooq, Cars.com, AutoTrader, CarGurus, Bring a Trailer, Facebook Marketplace, and others.  
2. We **never copy** them as a strategy.  
3. We outclass on focus, trust, taste, and regional truth.  
4. See [`COMPETITIVE_ANALYSIS.md`](./COMPETITIVE_ANALYSIS.md).

---

## Article XIII — Platform evolution

1. Future modules (Messaging, Payments, Dealer Platform, Verification, Intelligence, Financing, Insurance, Inspection, Analytics, APIs, Partners) must connect as one system.  
2. See [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md).  
3. A module that harms Marketplace trust or brand restraint is redesigned or refused.  
4. Release numbering and sequencing are plans — this Constitution outranks a roadmap stub when values conflict.  
5. Do not start the next numbered business release until strategy and freezes say so.

---

## Article XIV — Documentation

1. Strategy documents under `docs/product/` define company product law.  
2. Design documents under `docs/design/` define visual and interaction language.  
3. Engineering/architecture docs define how we build — they must not redefine why.  
4. When docs conflict: **Constitution > Vision/Principles > Journeys/Platform > local sprint notes**.  
5. Obsolete docs are marked obsolete; they are not silently left to mislead.

---

## Article XV — Amendments

1. Amendments require explicit approval by product leadership (and design/engineering leads when craft or freezes are affected).  
2. Amendments are dated, written, and explained — including what changed and why.  
3. Emergency operational decisions may precede amendment text by at most a short, documented window — then the Constitution is updated or the decision is reversed.  
4. Fashion is not grounds for amendment. Evidence, ethics, and mission are.

---

## Article XVI — Oath of craft

We will not ship noise to chase parity.  
We will not trade trust for vanity metrics.  
We will not treat Arabic, mobile, or regional truth as secondary.  
We will not unfreeze casually.  
We will not let AI remove human responsibility.  
We will not forget that cars are the hero.

We build AutoHub as if the Middle East deserves an automotive platform with showroom standards — because it does.

---

## Closing

Five years from now, if a new teammate asks “How do we decide?”, give them this file.

If they ask “What are we building?”, give them the Vision.

If they ask “What must every feature obey?”, give them the Principles.

If they ask “Who are we for?”, give them the Journeys.

If they ask “What will we become?”, give them the Future Platform.

If they ask “Who do we refuse to be?”, give them the Competitive Analysis.

And if they ask “What is sacred?”, they are already reading it.

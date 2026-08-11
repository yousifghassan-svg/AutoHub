# AutoHub Product Principles

**Sprint:** Product Strategy 1.0  
**Status:** Draft — awaiting approval  
**Authority:** Normative for all future features after approval  
**Companion:** [`AUTOHUB_VISION_2030.md`](./AUTOHUB_VISION_2030.md) · [`AUTOHUB_CONSTITUTION.md`](./AUTOHUB_CONSTITUTION.md)

Every future feature must follow these principles. If a feature violates them, it is redesigned or rejected — not “shipped with debt and a promise.”

---

## How to use this document

Before building anything material, answer:

1. Which principles does this strengthen?  
2. Which principles does this risk?  
3. What would we remove to stay true?

If you cannot name the principles, you are not ready to build.

---

## The principles

### 1. Cars are the hero

The vehicle (or plate) is the product. Interfaces present it; they do not compete with it.

**Do:** Large photography, quiet chrome, price as a hero number, remove UI that steals attention.  
**Don’t:** Sticker walls, stat strips on heroes, decorative dashboards on consumer browse.

---

### 2. Search before navigation

Intent is the front door. People arrive wanting a car, not a sitemap tour.

**Do:** Spotlight-like find, progressive filters after intent, deep links that preserve query meaning.  
**Don’t:** Force multi-level category mazes before the user can type what they want.

---

### 3. Trust before transaction

A fast checkout on a dishonest listing is a failure. Confidence precedes money movement.

**Do:** Verification, clear seller identity, honest media, moderation, quality bars before growth hacks.  
**Don’t:** Monetize distrust; hide risk; fake scarcity; prioritize GMV over safety.

---

### 4. Simplicity over complexity

One job per surface. Complexity is allowed in the system; confusion is not allowed in the UI.

**Do:** Progressive disclosure, short wizards, defaults that are right, advanced options behind “More.”  
**Don’t:** Settings museums, infinite form fields, features that require a manual to use once.

---

### 5. Speed over decoration

Perceived performance is a feature. Motion and visuals must never make the product feel heavy.

**Do:** Skeletons, optimistic UI, short purposeful motion, ruthless bundle and query discipline (as culture, not as this doc’s implementation detail).  
**Don’t:** Animation for applause; waiting without feedback; beauty that costs seconds.

---

### 6. AI assists, never replaces the user

AI may draft, suggest, detect, and explain. The user remains the author of decisions.

**Do:** Assist listing quality, search understanding, fraud signals, market context — with override.  
**Don’t:** Silent irreversible AI actions; fake “AI magic” that obscures control; dark-pattern persuasion bots.

---

### 7. Mobile-first thinking

Most automotive intent happens on a phone. Design the thumb path first; elevate desktop second.

**Do:** Thumb-reach CTAs, readable type, full-bleed media that works in one column, offline-tolerant expectations where relevant.  
**Don’t:** Desktop-only workflows that are merely “shrunk” for mobile.

---

### 8. Premium experience

Premium is not luxury pricing — it is intentional materials: space, type, photography, restraint.

**Do:** Signal + graphite discipline, showroom calm, memorable brand moments.  
**Don’t:** Generic SaaS templates, purple glow, cluttered classifieds aesthetics, apology UI.

---

### 9. Every click has a purpose

No decorative controls. No mystery buttons. No second CTA that exists because a template had a slot.

**Do:** Primary action clarity; secondary actions quieter; destructive actions deliberate.  
**Don’t:** Click farms, engagement bait, redundant paths that fragment attention.

---

### 10. Platform over feature checklist

We build an automotive platform. Features must connect modules — marketplace, trust, dealers, intelligence — not accumulate as isolated trophies.

**Do:** Ask how a feature strengthens the system and future modules.  
**Don’t:** Ship one-off gimmicks that cannot compound.

---

### 11. Regional truth over imported templates

Iraq-first and Middle East–real: language, currency, plates, cities, dealer culture, import reality.

**Do:** Arabic-primary and RTL as native; IQD/USD clarity; plate domain respect; local trust cues.  
**Don’t:** Copy Western marketplace IA and “translate later.”

---

### 12. Honesty in the listing

Photos, price, status, and condition must tell one story. Misrepresentation is product failure.

**Do:** Media standards, status clarity (draft / active / sold), quality gates.  
**Don’t:** Allow bait photos, hidden fees in spirit, zombie sold listings that still fish contacts.

---

### 13. Sellers deserve dignity

Private sellers and dealers are customers, not inventory machines. Tools should feel calm and capable.

**Do:** Clear drafts, quality guidance, respectful empty states, professional dealer presence.  
**Don’t:** Nagging growth dark patterns; shame-based completion scores without help.

---

### 14. Freeze means freeze

Approved freezes protect users and teams. Hotfixes only for true production harm — not preference.

**Do:** Respect release freezes; document exceptions; prefer new slices over rewriting frozen cores.  
**Don’t:** “Quick refactors” inside frozen surfaces because it is convenient.

---

### 15. Taste is a responsibility

Someone must say no. Good product is often the art of exclusion.

**Do:** Design review, principle review, memory test (“would they remember this tomorrow?”).  
**Don’t:** Design by committee addition; ship because it was already built.

---

## Feature evaluation checklist

A feature is ready for scheduling only if:

| # | Question | Pass |
| --- | --- | --- |
| 1 | Does it support the Automotive Platform vision? | ☐ |
| 2 | Does it keep cars (or plates) the hero? | ☐ |
| 3 | Does it improve trust, clarity, or speed — not just novelty? | ☐ |
| 4 | Is the primary user job obvious in one glance? | ☐ |
| 5 | Does it work beautifully on mobile? | ☐ |
| 6 | Can we explain what we refused to include? | ☐ |
| 7 | Does it avoid copying a competitor’s worst habit? | ☐ |
| 8 | If AI is involved, does the user stay in control? | ☐ |
| 9 | Does it respect freezes and quality bars? | ☐ |
| 10 | Would Apple/Tesla/Stripe/Linear be embarrassed by the clutter? | ☐ |

---

## Principle conflicts

When principles collide, resolve in this order unless the Constitution says otherwise:

1. **Trust & honesty**  
2. **User clarity & safety**  
3. **Cars as hero / premium restraint**  
4. **Speed**  
5. **Platform compounding**  
6. **Novelty / experimentation**

Growth never outranks trust. Decoration never outranks speed. Competitor parity never outranks taste.

---

## One line

**Build the automotive platform with showroom taste, search-first clarity, and trust that compounds — or do not build it.**

# Release 0.3 — Media

**Version:** `0.3.x`  
**Codename:** Media  
**Production intent:** Trusted upload/processing pipeline for listing imagery  
**Master checklist:** [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md)

---

## Goals

- Deliver Cloudflare R2-backed media storage with API-mediated upload.  
- Persist `MediaAsset` / variants; support image (and video) flows used by clients.  
- Attach media to listings via the shared listings media bridge.  
- Apply processing (e.g. Sharp variants) and safe delete ordering.  
- Reduce trust in raw client `r2Key` over time (hardening acceptance for exit criteria).

---

## Features

| Area | Deliverable |
| --- | --- |
| Media domain | `/v1/media/*` upload/complete/get/delete patterns as implemented |
| Storage | R2 (S3-compatible) credentials via env |
| Processing | Variants/thumbnails; virus-scan status fields in schema |
| Listing bridge | `POST /v1/listings/:id/media` attach path |
| Web | `MediaUploader` + sell/create attach |
| Mobile | Create-flow multipart upload + attach |
| Admin | Media tooling surfaces where shipped |
| Ops | Soft-delete then storage cleanup; Alpha in-process cleanup acceptable until workers |

---

## Acceptance Criteria

- [ ] Authenticated user can upload an image and receive a `MediaAsset` id  
- [ ] Variants/thumbnail become available (or documented async timing)  
- [ ] Owner can attach media to their listing; stranger cannot  
- [ ] Delete soft-deletes DB and best-effort removes R2 object without orphaning inconsistently  
- [ ] Invalid/missing file returns 400 (not 500)  
- [ ] Public clients render attached listing images via public URL helpers  
- [ ] Staging uses dedicated R2 bucket (not shared with unrelated envs)  
- [ ] Known P0 gap tracked: listing attach must not permanently trust unverified client `r2Key` — either fixed in this release or explicitly waived with owner + target release  

---

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Dual pipelines (`MediaAsset` vs `ListingMedia`) | High | Standardize attach-by-`mediaAssetId`; see architecture review |
| Malicious upload content | High | Type/size checks; virus-scan status; throttle uploads |
| Orphan R2 objects / delete ordering bugs | Medium | Soft-delete first; cleanup job; monitoring |
| Cost runaway (large videos) | Medium | Client compression; server limits; throttle |
| In-process cleanup only | Medium | Accept for Alpha; workers before scale (0.4+/1.0) |

---

## Dependencies

| Dependency | Need |
| --- | --- |
| Release 0.1 | Schema media models, API infra |
| Release 0.2 | Authn/authz on upload/delete |
| Cloudflare R2 | Bucket + API tokens |
| Clients | Web/mobile uploaders |

**Blocks:** High-quality 0.4 publish UX; 1.0 media reliability bar  

---

## QA Checklist

- [ ] Upload JPEG/PNG happy path; reject disallowed type  
- [ ] Multi-image attach order / primary star behavior on web sell  
- [ ] Video optional path (if enabled) does not break image-only publish  
- [ ] Listing detail gallery shows attached media after publish  
- [ ] Delete media as owner succeeds; as other user fails  
- [ ] Reload draft: document known thumb restore gaps if still present  
- [ ] Load test light: parallel uploads under throttle do not 500 the API  
- [ ] Confirm no production R2 credentials in repo  

---

## Rollback Plan

1. Redeploy previous API build; disable new upload UI entry points via prior web/mobile builds if needed.  
2. Leave existing R2 objects in place — do not bulk-delete buckets on rollback.  
3. If migration added media columns/enums, restore DB snapshot if forward migration is unsafe; otherwise keep schema and disable features with config.  
4. If bad deletes removed user media: restore R2 versioning/snapshot if enabled; otherwise mark incident and halt cleanup jobs.  
5. Communicate “image upload temporarily unavailable” if partial outage.  

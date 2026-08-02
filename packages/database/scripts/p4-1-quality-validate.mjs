/**
 * P4-1 search quality gate against running API.
 * Usage: node packages/database/scripts/p4-1-quality-validate.mjs
 */
const BASE = process.env.API_BASE ?? 'http://127.0.0.1:4000/v1';

async function search(params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${BASE}/vehicles/search?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${qs}`);
  const body = await res.json();
  const items = body?.data?.items ?? [];
  return {
    total: body?.data?.total ?? items.length,
    slugs: items.map((i) => i.slug),
    titles: items.flatMap((i) => (i.translations ?? []).map((t) => t.title)),
  };
}

function hasSlug(result, key) {
  return result.slugs.some((s) => s?.includes(key));
}

function pass(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  let ok = true;

  const camryEn = await search({ keyword: 'Camry', pageSize: '50' });
  ok =
    pass(
      'Q-1 exact EN Camry',
      hasSlug(camryEn, 'q1-camry'),
      `total=${camryEn.total}`,
    ) && ok;

  const camryAr = await search({ keyword: 'كامري', pageSize: '50' });
  ok =
    pass(
      'Q-1 exact AR كامري',
      hasSlug(camryAr, 'q1-camry'),
      `total=${camryAr.total}`,
    ) && ok;

  const x5 = await search({ keyword: 'X5', pageSize: '50' });
  ok = pass('Q-2 partial X5', hasSlug(x5, 'q2-x5'), `total=${x5.total}`) && ok;

  const patro = await search({ keyword: 'Patro', pageSize: '50' });
  ok =
    pass(
      'Q-2 partial Patro→Patrol',
      hasSlug(patro, 'q3-patrol'),
      `total=${patro.total}`,
    ) && ok;

  const toyota = await search({ keyword: 'toyota', pageSize: '50' });
  ok =
    pass(
      'Q-3 English toyota',
      hasSlug(toyota, 'q1-camry'),
      `total=${toyota.total}`,
    ) && ok;

  const tesla = await search({ keyword: 'Tesla', pageSize: '50' });
  ok =
    pass(
      'Q-3 English Tesla',
      hasSlug(tesla, 'q6-tesla'),
      `total=${tesla.total}`,
    ) && ok;

  const toyotaAr = await search({ keyword: 'تويوتا', pageSize: '50' });
  ok =
    pass(
      'Q-4 Arabic تويوتا',
      hasSlug(toyotaAr, 'q1-camry'),
      `total=${toyotaAr.total}`,
    ) && ok;

  const teslaAr = await search({ keyword: 'تيسلا', pageSize: '50' });
  ok =
    pass(
      'Q-4 Arabic تيسلا',
      hasSlug(teslaAr, 'q6-tesla'),
      `total=${teslaAr.total}`,
    ) && ok;

  // Combined filters: toyota keyword + Baghdad city + IQD price band covering Q1
  const citiesRes = await fetch(`${BASE}/catalog/filters`);
  const citiesBody = await citiesRes.json();
  const baghdad = (citiesBody?.data?.cities ?? []).find((c) =>
    /baghdad/i.test(c.nameEn ?? c.slug ?? ''),
  );
  const toyotaBrand = (citiesBody?.data?.brands ?? []).find((b) =>
    /toyota/i.test(b.nameEn ?? b.slug ?? ''),
  );

  if (!baghdad || !toyotaBrand) {
    ok = pass('Q-5 combined filters setup', false, 'missing Baghdad or Toyota from catalog') && ok;
  } else {
    const combined = await search({
      keyword: 'toyota',
      makeId: toyotaBrand.id,
      cityId: baghdad.id,
      currencyCode: 'IQD',
      minPrice: '10000000',
      maxPrice: '30000000',
      pageSize: '50',
    });
    ok =
      pass(
        'Q-5 combined filters stable',
        hasSlug(combined, 'q1-camry') && !hasSlug(combined, 'q3-patrol'),
        `total=${combined.total} slugs=${combined.slugs.filter((s) => s?.includes('p4-quality')).join(',')}`,
      ) && ok;
  }

  const cat = await search({ keyword: 'Caterpillar', pageSize: '50' });
  ok =
    pass(
      'Q-6 HE Caterpillar EN',
      hasSlug(cat, 'q4-cat'),
      `total=${cat.total}`,
    ) && ok;

  const catAr = await search({ keyword: 'كاتربيلر', pageSize: '50' });
  ok =
    pass(
      'Q-6 HE كاتربيلر AR',
      hasSlug(catAr, 'q4-cat'),
      `total=${catAr.total}`,
    ) && ok;

  const heYear = await search({
    keyword: 'Komatsu',
    minYear: '2014',
    maxYear: '2016',
    pageSize: '50',
  });
  ok =
    pass(
      'Q-6 HE year filter',
      hasSlug(heYear, 'q5-komatsu') && !hasSlug(heYear, 'q4-cat'),
      `total=${heYear.total}`,
    ) && ok;

  // Exact-match heuristic smoke: featured Tesla should appear when searching Tesla
  const teslaOrder = await search({ keyword: 'Tesla', pageSize: '10' });
  const featuredIdx = teslaOrder.slugs.findIndex((s) => s?.includes('q6-tesla'));
  ok =
    pass(
      'Q-1 heuristic smoke (featured Tesla present)',
      featuredIdx >= 0,
      `index=${featuredIdx}`,
    ) && ok;

  console.log(ok ? '\nQUALITY GATE: PASS' : '\nQUALITY GATE: FAIL');
  process.exitCode = ok ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

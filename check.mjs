// Smoke test: the proxy fetches a live area query, the page's own helpers pick planes from it,
// and one of those planes can be followed by its callsign.
// Run: node check.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { onRequestGet } from './functions/api/adsb.js';

const html = readFileSync(new URL('index.html', import.meta.url), 'utf8');
const core = html.match(/<script id="core">([\s\S]*?)<\/script>/)[1];
const { nearby, plausible } = new Function(`${core}; return { nearby, plausible };`)();

// A plane parked at Newark fits a Santiago -> Newark route, not a stale San Francisco -> Denver one.
const ap = (latitude, longitude) => ({ latitude, longitude });
assert.ok(plausible({ origin: ap(19.41, -70.6), destination: ap(40.69, -74.17) }, 40.69, -74.17));
assert.ok(!plausible({ origin: ap(37.62, -122.38), destination: ap(39.86, -104.67) }, 40.69, -74.17));

const get = q => onRequestGet({ request: new Request('http://localhost/api/adsb?' + q) });
assert.equal((await get('lat=91&lon=0&r=5')).status, 400);
assert.equal((await get('lat=40&lon=-74')).status, 400);
assert.equal((await get('cs=UAL79/../../v2/all')).status, 400);   // only a bare callsign reaches adsb.lol

const res = await get('lat=40.758&lon=-73.986&r=25');   // 25 nm around Times Square covers JFK, LGA, EWR and TEB
assert.equal(res.status, 200, `proxy HTTP ${res.status}`);
const j = await res.json(), list = nearby(j);
assert.ok(j.ac.length > 0, 'nothing at all within 25 nm of Times Square');
assert.ok(list.length <= 5);
list.forEach((a, i) => { assert.notEqual(a.alt_baro, 'ground'); assert.ok(!i || list[i - 1].dst <= a.dst, 'not sorted by distance'); });

// Follow one of those planes by callsign, the way the sign does when you type a flight number.
const p = j.ac.find(a => a.flight?.trim() && a.alt_baro !== 'ground'), cs = p.flight.trim();
assert.ok((await (await get('cs=' + cs)).json()).ac.some(a => a.hex === p.hex), `callsign query lost ${cs}`);
console.log(`ok: ${j.ac.length} aircraft in range, ${list.length} picked, nearest ${list[0]?.flight?.trim() ?? list[0]?.hex} at ${list[0]?.dst} nm, followed ${cs}`);

// Same-origin proxy for adsb.lol's area query: its API sends no CORS header, so the page can't call it directly.
// GET /api/point?lat=40.758&lon=-73.986&r=8.7 (r in nautical miles; adsb.lol caps it at 250)
// ponytail: no edge cache. Cloudflare's free plan allows 100k function requests a day, about 11 signs polling every 10 s.
export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams, [lat, lon, r] = ['lat', 'lon', 'r'].map(k => parseFloat(q.get(k)));
  if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && r > 0 && r <= 250)) return new Response('need lat, lon and r (nm, up to 250)', { status: 400 });
  const res = await fetch(`https://api.adsb.lol/v2/point/${lat}/${lon}/${r}`);
  return new Response(res.body, { status: res.status, headers: { 'content-type': 'application/json' } });
}

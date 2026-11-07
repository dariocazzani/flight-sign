// Same-origin proxy for adsb.lol: its API sends no CORS header, so the page can't call it directly.
// GET /api/adsb?lat=40.758&lon=-73.986&r=8.7  planes around a point (r in nautical miles; adsb.lol caps it at 250)
// GET /api/adsb?cs=UAL79                      one flight, by the callsign it broadcasts
// ponytail: no edge cache. Cloudflare's free plan allows 100k function requests a day, about 11 signs polling every 10 s.
export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams, cs = q.get('cs'), [lat, lon, r] = ['lat', 'lon', 'r'].map(k => parseFloat(q.get(k)));
  const path = cs ? /^[A-Za-z0-9]{2,8}$/.test(cs) && `callsign/${cs}`
    : Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && r > 0 && r <= 250 && `point/${lat}/${lon}/${r}`;
  if (!path) return new Response('need lat, lon and r (nm, up to 250), or cs (a callsign like UAL79)', { status: 400 });
  const res = await fetch(`https://api.adsb.lol/v2/${path}`);
  return new Response(res.body, { status: res.status, headers: { 'content-type': 'application/json' } });
}

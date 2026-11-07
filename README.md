# Flight Sign

A browser take on the FlightWall Mini: a 128x64 LED matrix that cycles through the five nearest planes in the air, showing flight number, airline, route, aircraft, altitude, speed, and which way to look. It can also follow a single flight by its number. One HTML file and a small proxy. No build step, no API key.

## Run

The page needs its same-origin proxy (`functions/api/adsb.js`) because adsb.lol's API sends no CORS headers. Cloudflare's dev server runs both:

    npx wrangler pages dev .

Then open http://localhost:8788.

For a wall display on a Raspberry Pi, point Chromium at the deployed site:

    chromium --kiosk "https://<your-site>.pages.dev/?at=40.758,-73.986&r=10"

On an iPhone: open the hosted page in Safari, set your location, then tap Share and Add to Home Screen.

## Use

- Type a flight number like UA79 to follow that flight, or tap "Use my location" to see the planes overhead.
- Tap the sign for the next plane. On a keyboard: N for next, F for fullscreen.
- Bookmark the page to keep your setup. It lives in the URL, e.g. `?at=40.758,-73.986&r=10` or `?flight=UA79`.

## How it works

- Every 10 seconds the page asks adsb.lol, through the proxy, for aircraft within the radius and keeps the five nearest that are airborne.
- To follow a flight, adsbdb turns the flight number into the callsign the plane broadcasts (UA79 becomes UAL79), and the proxy asks adsb.lol for that callsign. adsb.lol is fed by volunteer receivers, so a flight can drop out of coverage over oceans and remote areas. The time left is the straight-line distance to the destination at the current ground speed, so treat it as a rough countdown.
- Airline, flight number and route come from adsbdb by callsign. adsbdb allows cross-origin requests, so the browser calls it directly and caches each callsign.
- Callsign route data goes stale when an airline moves a flight number to another route, so a route is shown only if the plane is roughly between its origin and destination.
- Draws into a 128x64 framebuffer with the public-domain X11 5x8 and 6x13 bitmap fonts that rpi-rgb-led-matrix ships, so a physical build on a 128x64 HUB75 panel can reuse the layout pixel for pixel.

## Check

`node check.mjs` runs the proxy against live data and checks the page's plane picking, route filter and callsign lookup.

## Deploy

Cloudflare Pages, connected to this repo with no build command: the repo root is the site and `functions/` becomes the `/api/adsb` endpoint. The free plan's 100,000 function requests a day cover about 11 signs polling every 10 seconds.

Positions from [adsb.lol](https://adsb.lol) (ODbL). Routes from [adsbdb](https://www.adsbdb.com). Not affiliated with TheFlightWall.

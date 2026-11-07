# Flight Sign

A browser take on the FlightWall Mini: a 128x64 LED matrix that cycles through the five nearest planes in the air, showing flight number, airline, route, aircraft, altitude, speed, and which way to look. One HTML file and a small proxy. No build step, no API key.

## Run

The page needs its same-origin proxy (`functions/api/point.js`) because adsb.lol's API sends no CORS headers. Cloudflare's dev server runs both:

    npx wrangler pages dev .

Then open http://localhost:8788.

For a wall display on a Raspberry Pi, point Chromium at the deployed site:

    chromium --kiosk "https://<your-site>.pages.dev/?at=40.758,-73.986&r=10"

On an iPhone: open the hosted page in Safari, set your location, then tap Share and Add to Home Screen.

## Use

- Tap "Use my location" or type a latitude and longitude. The radius (5, 10 or 25 miles) sets how far out to look.
- Each plane stays up for 6 seconds. Tap the sign or press N for the next one, F for fullscreen.
- The setup lives in the URL, e.g. `?at=40.758,-73.986&r=10`.

## How it works

- Every 10 seconds the page asks adsb.lol, through the proxy, for aircraft within the radius and keeps the five nearest that are airborne.
- Airline, flight number and route come from adsbdb by callsign. adsbdb allows cross-origin requests, so the browser calls it directly and caches each callsign.
- Callsign route data goes stale when an airline moves a flight number to another route, so a route is shown only if the plane is roughly between its origin and destination.
- Draws into a 128x64 framebuffer with the public-domain X11 5x8 and 6x13 bitmap fonts that rpi-rgb-led-matrix ships, so a physical build on a 128x64 HUB75 panel can reuse the layout pixel for pixel.

## Check

`node check.mjs` runs the proxy against live data and checks the page's plane picking and route filter.

## Deploy

Cloudflare Pages, connected to this repo with no build command: the repo root is the site and `functions/` becomes the `/api/point` endpoint. The free plan's 100,000 function requests a day cover about 11 signs polling every 10 seconds.

Positions from [adsb.lol](https://adsb.lol) (ODbL). Routes from [adsbdb](https://www.adsbdb.com). Not affiliated with TheFlightWall.

/* Where am I, and which way am I walking.
 *
 * Two things are going on here, with very different reliability:
 *
 *   1. Distance and bearing to a landmark — computed from real lat/lon. Accurate
 *      to whatever the landmark coordinate is worth, and unaffected by the map
 *      illustration being distorted. This is the trustworthy part.
 *
 *   2. The dot drawn on the map image — subject to the illustration's ~180 m of
 *      distortion on top of that. Shown with an accuracy ring, never as a
 *      pinpoint, because a confident wrong dot is worse than an honest fuzzy one.
 *
 * A "I'm standing here" calibration lets you tap a landmark you're physically at;
 * we store the offset between your GPS fix and that landmark and apply it to
 * everything after. That collapses most of the systematic error for your device.
 */

(function (global) {
  'use strict';

  var STORE_CAL = 'hinterland26.calibration';

  var R = 6371000; // metres
  var rad = function (d) { return d * Math.PI / 180; };
  var deg = function (r) { return r * 180 / Math.PI; };

  function distanceM(a, b) {
    var dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    var la1 = rad(a.lat), la2 = rad(b.lat);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function bearingDeg(a, b) {
    var dLon = rad(b.lon - a.lon);
    var la1 = rad(a.lat), la2 = rad(b.lat);
    var y = Math.sin(dLon) * Math.cos(la2);
    var x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
    return (deg(Math.atan2(y, x)) + 360) % 360;
  }

  var COMPASS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  function compass(b) { return COMPASS[Math.round(b / 22.5) % 16]; }

  function fmtDistance(m) {
    if (m < 1000) return Math.round(m / 10) * 10 + ' m';
    return (m / 1000).toFixed(1) + ' km';
  }

  // Rough walking time. Festival ground is grass, crowds, and queues, so this is
  // deliberately slower than the usual 5 km/h figure.
  function walkMinutes(m) { return Math.max(1, Math.round(m / 67)); }

  // ── Projection between lat/lon and the map illustration's pixel space ──

  function lonLatToPx(lat, lon) {
    var mPerDegLon = 111320 * Math.cos(rad(MAP.anchor.lat));
    var mPerDegLat = 110574;
    return {
      x: MAP.anchor.px + (lon - MAP.anchor.lon) * mPerDegLon / MAP.mPerPxX,
      y: MAP.anchor.py - (lat - MAP.anchor.lat) * mPerDegLat / MAP.mPerPxY,
    };
  }

  // ── Calibration ────────────────────────────────────────────────────────

  function loadCal() {
    try { return JSON.parse(localStorage.getItem(STORE_CAL) || 'null'); }
    catch (e) { return null; }
  }
  function saveCal(c) {
    try {
      if (c) localStorage.setItem(STORE_CAL, JSON.stringify(c));
      else localStorage.removeItem(STORE_CAL);
    } catch (e) {}
  }

  // Applies the stored offset so a corrected fix lines up with the landmarks.
  function correct(fix) {
    var c = loadCal();
    if (!c) return fix;
    return { lat: fix.lat + c.dLat, lon: fix.lon + c.dLon, accuracy: fix.accuracy };
  }

  global.HLGeo = {
    distanceM: distanceM,
    bearingDeg: bearingDeg,
    compass: compass,
    fmtDistance: fmtDistance,
    walkMinutes: walkMinutes,
    lonLatToPx: lonLatToPx,
    loadCal: loadCal,
    saveCal: saveCal,
    correct: correct,
  };
})(window);

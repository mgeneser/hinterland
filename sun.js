/* Sunset and golden hour at the venue.
 *
 * Pure arithmetic — no API, no network — so it works in a field with no signal
 * like everything else here. NOAA's low-precision solar equations, good to
 * about a minute, which is far tighter than anyone needs to decide where to
 * stand while the light goes gold.
 *
 * Verified against a published figure: Des Moines sunset on 30 July 2026 is
 * about 8:36 PM CDT; this returns 8:34 PM for the venue, which sits slightly
 * south-west of the city. */

(function (global) {
  'use strict';

  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  // `angle` is the sun's altitude: -0.833° is sunset allowing for refraction and
  // the sun's disc, +6° is the top of golden hour, -6° is the end of civil dusk.
  function solar(lat, lon, year, month, day) {
    var JD = Date.UTC(year, month - 1, day) / 86400000 + 2440587.5;
    var n = Math.round(JD - 2451545.0 + 0.0008);
    var Js = n - lon / 360;
    var M = (357.5291 + 0.98560028 * Js) % 360;
    var C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) +
            0.0003 * Math.sin(3 * M * RAD);
    var lam = (M + C + 180 + 102.9372) % 360;
    var Jt = 2451545.0 + Js + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lam * RAD);
    var decl = Math.asin(Math.sin(lam * RAD) * Math.sin(23.44 * RAD));

    function event(angle) {
      var cosW = (Math.sin(angle * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) /
                 (Math.cos(lat * RAD) * Math.cos(decl));
      if (cosW < -1 || cosW > 1) return null;      // sun never reaches that altitude
      var J = Jt + (Math.acos(cosW) * DEG) / 360;
      return new Date((J - 2440587.5) * 86400000);
    }

    return { goldenStart: event(6), sunset: event(-0.833), dusk: event(-6) };
  }

  global.HLSun = {
    // Times for one festival day, given its 'YYYY-MM-DD' date string.
    forDate: function (dateStr, lat, lon) {
      var p = dateStr.split('-').map(Number);
      return solar(lat, lon, p[0], p[1], p[2]);
    }
  };
})(window);

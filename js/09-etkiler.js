/* =============================================================
   09-etkiler.js
   NE YAPAR : Kucuk etkilesim detaylari — "tasarlanmis" hissini
              veren seyler:
                1) Miknatis butonlar   — imlece dogru hafifce kayar
                2) Karta 3B egim       — imlece gore hafif doner
                3) Scroll ilerleme     — sayfanin ustunde ince cizgi
   BAGLI    : 01-utils.js

   ---------------------------------------------------------------
   KURALLAR
   ---------------------------------------------------------------
   - Hepsi SADECE fare olan cihazlarda calisir. Dokunmatikte imlec
     yok, bu etkiler orada anlamsiz ve zararli olur.
   - prefers-reduced-motion aciksa hicbiri calismaz.
   - Hicbiri icerigi ya da tiklanabilirligi degistirmez; sadece
     gorsel katman. Bozulursa site aynen calisir.
   ============================================================= */

window.Etkiler = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Gercek fare var mi? (dokunmatik tabletlerde false doner)
  var FARE_VAR = window.matchMedia &&
                 window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* -----------------------------------------------------------
     1) MIKNATIS BUTONLAR
     Imlec butona yaklasinca buton ona dogru birkac piksel kayar.
     Cok az: 6px. Fazlasi oyuncak gibi durur.
     ----------------------------------------------------------- */
  function miknatis() {
    var GUC = 6;   // piksel

    U.$$('[data-miknatis], .dugme--birincil').forEach(function (dugme) {
      U.on(dugme, 'pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = dugme.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        var y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        dugme.style.transform = 'translate(' + (x * GUC).toFixed(1) + 'px,' +
                                              (y * GUC).toFixed(1) + 'px)';
      });
      U.on(dugme, 'pointerleave', function () {
        dugme.style.transform = '';
      });
    });
  }

  /* -----------------------------------------------------------
     2) KARTA 3B EGIM
     Kart, imlecin bulundugu yone gore hafifce doner. Egim kucuk
     (6 derece) — buyugu ucuz gorunur.
     ----------------------------------------------------------- */
  function egim() {
    var ACI = 6;   // derece

    U.$$('[data-egim], .kart:not(.karusel-kart)').forEach(function (kart) {
      U.on(kart, 'pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = kart.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        var y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        kart.style.transform =
          'perspective(900px) rotateY(' + (x * ACI).toFixed(2) + 'deg) ' +
          'rotateX(' + (-y * ACI).toFixed(2) + 'deg) translateY(-4px)';
      });
      U.on(kart, 'pointerleave', function () {
        kart.style.transform = '';
      });
    });
  }

  /* -----------------------------------------------------------
     3) SCROLL ILERLEME CIZGISI
     Sayfanin en ustunde, ne kadar okundugunu gosteren ince cizgi.
     Bu etki dokunmatikte de calisir — imlece bagli degil.
     ----------------------------------------------------------- */
  function ilerleme() {
    var cizgi = document.createElement('div');
    cizgi.className = 'ilerleme-cizgisi';
    cizgi.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cizgi);

    var bekleyen = false;
    function guncelle() {
      if (bekleyen) return;
      bekleyen = true;
      requestAnimationFrame(function () {
        var d = document.documentElement;
        var kaydirilabilir = d.scrollHeight - d.clientHeight;
        var oran = kaydirilabilir > 0 ? (d.scrollTop / kaydirilabilir) : 0;
        cizgi.style.transform = 'scaleX(' + oran.toFixed(4) + ')';
        bekleyen = false;
      });
    }
    window.addEventListener('scroll', guncelle, { passive: true });
    window.addEventListener('resize', guncelle);
    guncelle();
  }

  function baslat() {
    if (AZ_HAREKET) return;

    ilerleme();                  // dokunmatikte de calisir
    if (!FARE_VAR) return;       // asagidakiler sadece fare varken

    miknatis();
    egim();
  }

  return { baslat: baslat };
})();

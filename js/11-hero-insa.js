/* =============================================================
   11-hero-insa.js
   NE YAPAR : Hero'nun sagindaki "vitrin" — gercek bir demonun
              tarayici penceresi. Scroll ile gorunure girince
              cerceve yukselir, ekran goruntusu icine yuklenir.
   BAGLI    : 01-utils.js
   NEREDE   : index.html -> <div class="vitrin" data-vitrin>

   ---------------------------------------------------------------
   NEDEN BU?
   ---------------------------------------------------------------
   Sitenin IMZA ANI. Sattigimiz seyi anlatmadan gosteriyor:
   "biz BOYLE site yapiyoruz." Onceki soyut tel-kafes animasyon
   "mantigi cozulemedi" diye gercek ekran goruntusuyle degistirildi
   (2026-09-10). Gorseli degistirmek: index.html icindeki <img src>.

   ERISILEBILIRLIK:
   Cerceve dekoratif; icteki <img> gercek alt metin tasir.
   prefers-reduced-motion aciksa gecis yok, dogrudan son hal.
   ============================================================= */

window.HeroInsa = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function kur(kap) {
    // IntersectionObserver yoksa ya da hareket azaltiliyorsa: dogrudan goster.
    if (AZ_HAREKET || !('IntersectionObserver' in window)) {
      kap.classList.add('gorundu');
      return;
    }

    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        kap.classList.add('gorundu');
        gozcu.disconnect();   // bir kez
      });
    }, { threshold: 0.2 });

    gozcu.observe(kap);
  }

  function baslat() {
    U.$$('[data-vitrin]').forEach(kur);
  }

  return { baslat: baslat };
})();

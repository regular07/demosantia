/* =============================================================
   03-nav.js
   NE YAPAR : Mobil menuyu acar/kapatir, bulundugun sayfayi menude
              isaretler.
   BAGLI    : 01-utils.js
   NE ZAMAN : Header sayfaya YERLESTIKTEN SONRA calistirilmali,
              yoksa menuyu bulamaz. (99-main.js sirayi ayarliyor.)
   ============================================================= */

window.Nav = (function () {
  'use strict';

  function baslat() {
    var dugme = U.$('.menu-dugme');
    var menu  = U.$('.menu');

    if (!menu) {
      Hata.goster('Menu bulunamadi', '03-nav.js',
                  'partials/header.html icinde class="menu" var mi?');
      return;
    }

    // Hamburger
    U.on(dugme, 'click', function () {
      var acik = menu.classList.toggle('acik');
      dugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
    });

    // Aktif sayfayi isaretle
    var simdiki = U.sayfaAdi();
    U.$$('.menu a').forEach(function (a) {
      var hedef = a.getAttribute('href');
      if (hedef === simdiki) {
        a.classList.add('aktif');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  return { baslat: baslat };
})();

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
    var ust   = U.$('.ust');

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

    // Pill scroll durumu: sayfa tepedeyken pill DUZ OPAK BEYAZ durur.
    // Scroll baslar baslamaz (kucuk esik — hero'dan daha cikmadan)
    // buzlu cama gecer ve o andan sonra hep cam kalir (Akif, 20.09.2026).
    if (ust) {
      var esik = 16;
      var guncelle = function () {
        ust.classList.toggle('ust--kaydi', window.scrollY > esik);
      };
      window.addEventListener('scroll', guncelle, { passive: true });
      guncelle();

      // Header'in gercek yuksekligini kok elemana yaz — koyu hero
      // (06-sections.css) bu degeri kullanip kendini header'in
      // ARKASINA kadar uzatiyor, ustte beyaz bosluk kalmasin diye.
      // Yazi tipi gec yuklenince yukseklik degisebilir, o yuzden
      // fontlar hazir olunca ve pencere boyu degisince tekrar olculur.
      var yukseklikYaz = function () {
        document.documentElement.style.setProperty(
          '--ust-yukseklik', ust.offsetHeight + 'px'
        );
      };
      yukseklikYaz();
      window.addEventListener('resize', yukseklikYaz);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(yukseklikYaz);
      }
    }
  }

  return { baslat: baslat };
})();

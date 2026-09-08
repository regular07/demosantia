/* =============================================================
   08-sayac.js
   NE YAPAR : Rakamlar gorunur olunca sifirdan gercek degerine sayar.
   BAGLI    : 01-utils.js
   NEREDE   : <span class="sayi" data-sayac="3000" data-son="₺">3.000₺</span>

   KURAL    : HTML'deki metin ZATEN dogru yazar. Bu dosya sadece
              animasyonu ekler. JavaScript calismazsa ziyaretci
              yine dogru rakami gorur — bos ya da "0" gormez.
   ============================================================= */

window.Sayac = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Sayiyi Turkce bicimde yazar: 3000 -> "3.000" */
  function bicimle(n) {
    return Math.round(n).toLocaleString('tr-TR');
  }

  function say(oge) {
    var hedef = parseFloat(oge.getAttribute('data-sayac'));
    if (isNaN(hedef)) return;

    var on  = oge.getAttribute('data-on')  || '';   // ornek: "%"
    var son = oge.getAttribute('data-son') || '';   // ornek: "₺" veya " gün"
    var sure = 1100;
    var baslangic = null;

    function adim(zaman) {
      if (baslangic === null) baslangic = zaman;
      var ilerleme = Math.min((zaman - baslangic) / sure, 1);
      // ease-out: hizli baslar, yumusak biter
      var yumusak = 1 - Math.pow(1 - ilerleme, 3);
      oge.textContent = on + bicimle(yumusak * hedef) + son;
      if (ilerleme < 1) requestAnimationFrame(adim);
    }
    requestAnimationFrame(adim);
  }

  function baslat() {
    var ogeler = U.$$('[data-sayac]');
    if (!ogeler.length) return;

    // Hareket azaltma tercihi varsa dokunma; metin zaten dogru.
    if (AZ_HAREKET || !('IntersectionObserver' in window)) return;

    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        say(g.target);
        gozcu.unobserve(g.target);   // bir kez sayar
      });
    }, { threshold: 0.6 });

    ogeler.forEach(function (o) { gozcu.observe(o); });
  }

  return { baslat: baslat };
})();

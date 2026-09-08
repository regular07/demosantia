/* =============================================================
   06-reveal.js
   NE YAPAR : Bolumler scroll ile yumusakca belirir.
   BAGLI    : 01-utils.js
   KURAL    : Icerik BASLANGICTA GORUNURDUR. Animasyon sadece kucuk bir
              kayma ekler. JavaScript calismasa bile sayfa okunur kalir.
   ============================================================= */

window.Belir = (function () {
  'use strict';

  function baslat() {
    // Kullanici hareket azaltma istemisse hic dokunma
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    var ogeler = U.$$('[data-belir]');
    if (!ogeler.length) return;

    ogeler.forEach(function (o) {
      o.style.transition = 'transform .5s ease, opacity .5s ease';
      o.style.transform  = 'translateY(10px)';
      o.style.opacity    = '.75';          // hic sifir yapmiyoruz
    });

    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        g.target.style.transform = 'none';
        g.target.style.opacity   = '1';
        gozcu.unobserve(g.target);
      });
    }, { threshold: .12 });

    ogeler.forEach(function (o) { gozcu.observe(o); });
  }

  return { baslat: baslat };
})();

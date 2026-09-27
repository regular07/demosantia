/* =============================================================
   01-utils.js
   NE YAPAR : Her yerde lazim olan 6 kucuk yardimci. Baska hicbir sey.
   BAGLI    : Hicbir seye.
   ============================================================= */

window.U = (function () {
  'use strict';

  /** Tek oge sec.  U.$('#email') */
  function $(secici, kok) { return (kok || document).querySelector(secici); }

  /** Coklu oge sec, gercek dizi doner.  U.$$('.kart') */
  function $$(secici, kok) {
    return Array.prototype.slice.call((kok || document).querySelectorAll(secici));
  }

  /** Olay bagla.  U.on(dugme, 'click', fn) */
  function on(oge, olay, fn) { if (oge) oge.addEventListener(olay, fn); }

  /** Sayfa hazir olunca calistir. */
  function hazir(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  /** Dosya adini adresten cikarir: /a/b/contact.html -> contact.html */
  function sayfaAdi() {
    var son = location.pathname.split('/').pop();
    return son === '' ? 'index.html' : son;
  }

  /** Hero giris animasyonlarini sinematik perde kalkana kadar beklet.
   *  <html class="sekans"> varsa (12-hero-sahne.js calisiyor) ve oge hero
   *  icindeyse fn, perde kalktiginda ('hero:acildi' olayi) BIR KEZ calisir.
   *  Aksi halde (mobil, hareket azaltma, hero disi) fn hemen calisir.
   *  U.heroBekle(h1, function () { gozcu.observe(h1); }) */
  var heroAcildi = false;
  document.addEventListener('hero:acildi', function () { heroAcildi = true; });
  function heroBekle(oge, fn) {
    var perdeli = document.documentElement.classList.contains('sekans') &&
                  oge && oge.closest && oge.closest('.hero');
    if (!perdeli || heroAcildi) { fn(); return; }
    document.addEventListener('hero:acildi', function () { fn(); }, { once: true });
  }

  return { $: $, $$: $$, on: on, hazir: hazir, sayfaAdi: sayfaAdi, heroBekle: heroBekle };
})();

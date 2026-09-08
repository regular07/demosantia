/* =============================================================
   01-utils.js
   NE YAPAR : Her yerde lazim olan 5 kucuk yardimci. Baska hicbir sey.
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

  return { $: $, $$: $$, on: on, hazir: hazir, sayfaAdi: sayfaAdi };
})();

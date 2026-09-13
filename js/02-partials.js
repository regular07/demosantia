/* =============================================================
   02-partials.js
   NE YAPAR : partials/header.html ve partials/footer.html dosyalarini
              cekip sayfaya yerlestirir.
   NEDEN    : Menuyu 5 ayri HTML dosyasinda degil, TEK dosyada yonetelim.
   BAGLI    : 00-hata.js, 01-utils.js
   DIKKAT   : fetch kullandigi icin sayfa cift tiklayarak degil,
              basla.command ile (yerel sunucu uzerinden) acilmali.
   ============================================================= */

window.Parcalar = (function () {
  'use strict';

  /**
   * Bir parcayi cekip hedef elemanin icine koyar.
   * @param {string} yol    'partials/header.html'
   * @param {string} hedef  '#ust' gibi bir secici
   */
  function yerlestir(yol, hedef) {
    var kutu = U.$(hedef);
    if (!kutu) return Promise.resolve();

    return fetch(yol)
      .then(function (c) {
        if (!c.ok) throw new Error('HTTP ' + c.status);
        return c.text();
      })
      .then(function (html) { kutu.innerHTML = html; })
      .catch(function (e) {
        Hata.goster(
          'Parca yuklenemedi: ' + yol + ' (' + e.message + ')',
          '02-partials.js',
          'Sayfayi cift tiklayarak mi actin? basla.command ile acman gerekiyor.'
        );
        // Site tamamen bos kalmasin diye asgari bir baglanti birak
        kutu.innerHTML = '<div class="kap" style="padding:14px 24px"><a href="index.html">Demosentia</a></div>';
      });
  }

  /** Header ve footer'i birlikte yukler, ikisi de bitince sozu tamamlar. */
  function hepsiniYukle() {
    return Promise.all([
      yerlestir('partials/header.html', '#ust'),
      yerlestir('partials/footer.html', '#alt')
    ]);
  }

  return { yerlestir: yerlestir, hepsiniYukle: hepsiniYukle };
})();

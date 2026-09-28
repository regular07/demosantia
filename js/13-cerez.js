/* =============================================================
   13-cerez.js
   NE YAPAR : Tum sayfalarin altina kucuk bir cerez tercih seridi
              ekler (Kabul / Reddet). Tercih localStorage'da kalir.
              Su an sitede aktif bir izleme cerezi YOK; bu serit,
              ileride eklenecek analytics.js'in (GA4) calisip
              calismayacagina karar verir.
   BAGLI    : Hicbir seye — U/Hata olmadan da (404.html, test.html
              dahil) her sayfada calisabilsin diye kasten bagimsiz.
   YAYINLAR : 'demosentia:cerez-tercih' olayi (detail: 'kabul'|'red')
              -> assets/js/analytics.js bunu dinler.
   ============================================================= */

(function () {
  'use strict';

  var ANAHTAR = 'demosentia_cerez_tercih';

  function tercihOku() {
    try { return localStorage.getItem(ANAHTAR); } catch (e) { return null; }
  }

  function tercihYaz(deger) {
    try { localStorage.setItem(ANAHTAR, deger); } catch (e) { /* ozel gezinti vb. */ }
  }

  function kvkkLinki() {
    var sayfa = location.pathname.split('/').pop();
    return sayfa === 'kvkk.html' ? null : 'kvkk.html';
  }

  function bannerGoster() {
    if (tercihOku()) return;                          // zaten karar verilmis
    if (document.getElementById('cerez-serit')) return; // cift ekleme

    var link = kvkkLinki();
    var serit = document.createElement('div');
    serit.id = 'cerez-serit';
    serit.className = 'cerez-serit';
    serit.setAttribute('role', 'dialog');
    serit.setAttribute('aria-label', 'Çerez tercihi');

    serit.innerHTML =
      '<p>Siteyi nasıl kullandığınızı anonim olarak ölçmek için Google Analytics ' +
      'çerezleri kullanıyoruz; yalnızca onay verirseniz çalışır. Tercihiniz bu cihazda saklanır.' +
      (link ? ' <a href="' + link + '">KVKK Aydınlatma Metni</a>' : '') + '</p>' +
      '<div class="cerez-butonlar">' +
        '<button type="button" class="cerez-red" data-cerez="red">Reddet</button>' +
        '<button type="button" class="cerez-kabul" data-cerez="kabul">Kabul et</button>' +
      '</div>';

    document.body.appendChild(serit);

    serit.addEventListener('click', function (e) {
      var buton = e.target.closest && e.target.closest('[data-cerez]');
      if (!buton) return;
      var deger = buton.getAttribute('data-cerez');
      tercihYaz(deger);
      serit.remove();
      document.dispatchEvent(new CustomEvent('demosentia:cerez-tercih', { detail: deger }));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bannerGoster);
  } else {
    bannerGoster();
  }
})();

/* =============================================================
   analytics.js
   NE YAPAR : GA4 olcum kodunu YALNIZCA cerez onayi "kabul" ise
              yukler. GA_ID bossa hicbir sey yapmaz (analytics
              henuz kurulmadi demektir).
   BAGLI    : js/13-cerez.js -> 'demosentia:cerez-tercih' olayi.
   NASIL    : GA4'e gectiginde SADECE GA_ID satirini doldur.
              Ozel bir hesap acildiginda "G-XXXXXXXXXX" seklinde bir
              olcum kimligi buraya yazilir.
   ============================================================= */

(function () {
  'use strict';

  var GA_ID = '';   // ornek: 'G-XXXXXXXXXX' — bos oldugu surece hicbir sey yuklenmez

  if (!GA_ID) return;

  var ANAHTAR = 'demosentia_cerez_tercih';
  var yuklendi = false;

  function tercihOku() {
    try { return localStorage.getItem(ANAHTAR); } catch (e) { return null; }
  }

  function gtagYukle() {
    if (yuklendi) return;
    yuklendi = true;

    var betik = document.createElement('script');
    betik.async = true;
    betik.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(betik);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  // Sayfa yuklenirken tercih zaten "kabul" ise hemen yukle
  if (tercihOku() === 'kabul') gtagYukle();

  // Kullanici banner'da "Kabul et" dediginde (ayni oturumda) hemen yukle
  document.addEventListener('demosentia:cerez-tercih', function (e) {
    if (e.detail === 'kabul') gtagYukle();
  });
})();

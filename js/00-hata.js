/* =============================================================
   00-hata.js
   NE YAPAR : Sessiz hata birakmaz. Sayfadaki her JavaScript hatasini,
              yuklenemeyen her dosyayi ve basarisiz her sunucu cagrisini
              yakalar; ekranin en ustune Turkce bir serit basar.
   BAGLI    : Hicbir seye. HER SAYFADA EN ONCE yuklenir.
   NEREDE   : Serit sadece localhost'ta gorunur. Canli sitede musteri
              asla gormez (asagidaki GELISTIRME kontrolu).
   ============================================================= */

window.Hata = (function () {
  'use strict';

  // Yerelde miyiz? Sadece burada hata seridi gosterilir.
  var GELISTIRME = ['localhost', '127.0.0.1', ''].indexOf(location.hostname) !== -1;

  var kutu = null;
  var sayac = 0;

  function kutuyuKur() {
    if (kutu) return kutu;
    kutu = document.createElement('div');
    kutu.id = 'hata-serit';
    kutu.setAttribute('role', 'alert');
    kutu.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
      'background:#c0392b', 'color:#fff',
      'font:13px/1.55 ui-monospace,Menlo,monospace',
      'padding:10px 44px 10px 14px', 'max-height:45vh', 'overflow:auto',
      'box-shadow:0 4px 20px rgba(0,0,0,.35)'
    ].join(';');

    var kapat = document.createElement('button');
    kapat.textContent = '×';
    kapat.setAttribute('aria-label', 'Hata seridini kapat');
    kapat.style.cssText = 'position:absolute;top:6px;right:10px;color:#fff;font-size:22px;line-height:1;background:none;border:none;cursor:pointer';
    kapat.onclick = function () { kutu.remove(); kutu = null; sayac = 0; };
    kutu.appendChild(kapat);

    (document.body || document.documentElement).appendChild(kutu);
    return kutu;
  }

  /**
   * Ekrana hata basar.
   * @param {string} baslik  Ne oldu
   * @param {string} yer     Hangi dosya : satir
   * @param {string} ipucu   Nereye bakmali
   */
  function goster(baslik, yer, ipucu) {
    // Konsola her zaman yaz — canlida da lazim olabilir
    console.error('[Demosentia] ' + baslik + (yer ? ' @ ' + yer : ''), ipucu || '');
    if (!GELISTIRME) return;

    sayac++;
    var k = kutuyuKur();
    var satir = document.createElement('div');
    satir.style.cssText = 'padding:6px 0;border-top:' + (sayac > 1 ? '1px solid rgba(255,255,255,.25)' : 'none');
    satir.innerHTML =
      '<b>&#9888; HATA ' + (yer ? '&mdash; ' + kacir(yer) : '') + '</b><br>' +
      kacir(baslik) +
      (ipucu ? '<br><span style="opacity:.8">Kontrol et: ' + kacir(ipucu) + '</span>' : '');
    k.appendChild(satir);
  }

  function kacir(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /** Bir sart saglanmiyorsa hata bas ve false don. */
  function bekle(sart, baslik, yer, ipucu) {
    if (sart) return true;
    goster(baslik, yer, ipucu);
    return false;
  }

  // --- 1. Yakalanmamis JavaScript hatalari ---
  window.addEventListener('error', function (e) {
    // Dosya yuklenemedi (css/js/img) — e.target var, e.message yok
    if (e.target && e.target !== window && (e.target.src || e.target.href)) {
      var yol = e.target.src || e.target.href;
      goster(
        'Dosya yuklenemedi: ' + yol.split('/').slice(-2).join('/'),
        e.target.tagName.toLowerCase(),
        'Dosya adi ve klasor yolu dogru mu? Buyuk/kucuk harfe dikkat.'
      );
      return;
    }
    var dosya = e.filename ? e.filename.split('/').slice(-2).join('/') : 'bilinmiyor';
    goster(e.message, dosya + ' : ' + e.lineno, null);
  }, true);

  // --- 2. Yakalanmamis Promise hatalari (fetch vb.) ---
  window.addEventListener('unhandledrejection', function (e) {
    goster(
      'Beklenmeyen sunucu/veri hatasi: ' + (e.reason && e.reason.message ? e.reason.message : e.reason),
      'promise',
      'Sunucu calisiyor mu? basla.command acik mi?'
    );
  });

  return { goster: goster, bekle: bekle, GELISTIRME: GELISTIRME };
})();

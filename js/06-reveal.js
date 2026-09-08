/* =============================================================
   06-reveal.js
   NE YAPAR : Scroll ettikce icerik SONUKTEN CANLIYA doner.
              Basliklar kelime kelime, diger ogeler blok halinde.
   BAGLI    : 01-utils.js

   ---------------------------------------------------------------
   ALTIN KURAL: ICERIK HICBIR ZAMAN GORUNMEZ OLMAZ
   ---------------------------------------------------------------
   Baslangic opakligi 0 DEGIL, 0.25. Yani:
     - JavaScript hic calismasa bile butun yazilar okunur.
     - Arama motoru ve ekran okuyucu her seyi gorur.
     - Ekran goruntusu alindiginda sayfa bos cikmaz.
   Animasyon sadece "sonuk -> canli" gecisini ekler, icerigi
   saklamaz. Sifir opaklikta bekleyen sayfalar bozuk gorunur.

   KULLANIM (HTML tarafinda):
     <h2 data-canlan>...</h2>             kelime kelime canlanir
     <p  data-canlan="blok">...</p>       tumu birlikte canlanir
     <div data-canlan="sirali">...</div>  cocuklari sirayla canlanir
   ============================================================= */

window.Belir = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Basligi kelimelere boler, her kelimeyi kendi <span>'ine sarar. */
  function kelimelereBol(oge) {
    if (oge.dataset.bolundu) return;          // iki kez bolme

    var kelimeler = oge.textContent.split(/(\s+)/);   // bosluklari da koru
    oge.textContent = '';

    var sira = 0;
    kelimeler.forEach(function (k) {
      if (/^\s*$/.test(k)) {
        oge.appendChild(document.createTextNode(k));
        return;
      }
      var s = document.createElement('span');
      s.className = 'kelime';
      // Her kelime bir oncekinden az sonra canlansin (dalga etkisi)
      s.style.transitionDelay = (sira * 45) + 'ms';
      s.textContent = k;
      oge.appendChild(s);
      sira++;
    });

    oge.dataset.bolundu = '1';
  }

  /** Sirali kaplarin cocuklarina artan gecikme verir. */
  function siraGecikmesi(kap) {
    Array.prototype.forEach.call(kap.children, function (c, i) {
      c.style.transitionDelay = (i * 90) + 'ms';
    });
  }

  function baslat() {
    var ogeler = U.$$('[data-canlan]');
    if (!ogeler.length) return;

    // Hareket azaltma tercihi varsa: her sey dogrudan tam canli
    if (AZ_HAREKET || !('IntersectionObserver' in window)) {
      ogeler.forEach(function (o) { o.classList.add('canli'); });
      return;
    }

    ogeler.forEach(function (o) {
      var tur = o.getAttribute('data-canlan') || 'kelime';
      if (tur === 'kelime')  kelimelereBol(o);
      if (tur === 'sirali')  siraGecikmesi(o);
      o.classList.add('canlanacak');
    });

    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        g.target.classList.add('canli');
        gozcu.unobserve(g.target);   // bir kez canlanir, geri sonmez
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px'   // biraz erken tetiklensin
    });

    ogeler.forEach(function (o) { gozcu.observe(o); });
  }

  return { baslat: baslat };
})();

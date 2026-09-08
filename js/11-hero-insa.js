/* =============================================================
   11-hero-insa.js
   NE YAPAR : Hero'nun sag tarafinda, tel kafes kutular sirayla
              yerine oturup bir web sayfasi duzenine donusur.
              "Site kendini insa ediyor."
   BAGLI    : 01-utils.js
   NEREDE   : index.html -> <div class="insa" data-insa></div>

   ---------------------------------------------------------------
   NEDEN BU?
   ---------------------------------------------------------------
   Sitenin IMZA ANI. Sattigimiz seyi anlatmadan gosteriyor:
   "sana bir web sitesi kuruyorum." Baska bir sektorde klise
   olurdu; burada tam yerinde.

   NASIL CIZILIYOR:
   Canvas degil, sade <div>'ler. Sebebi: her kutu bir CSS gecisi
   ile yerine oturuyor, bu tarayici icin ucuz ve kodu okunur.
   Canvas olsaydi her kareyi elle cizmek gerekirdi.

   ERISILEBILIRLIK:
   Tamamen dekoratif -> aria-hidden. Ekran okuyucu atlar.
   prefers-reduced-motion aciksa animasyon yok, duzen dogrudan
   son halinde gorunur.
   ============================================================= */

window.HeroInsa = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Bir web sayfasi duzeninin parcalari.
     Degerler yuzde: sol, ust, genislik, yukseklik.
     Sira, insa edilme sirasi (once cerceve, sonra icerik). */
  var PARCALAR = [
    { s: 8,  u: 10, g: 84, y: 9,  tur: 'ust-cubuk' },   // tarayici cubugu
    { s: 8,  u: 24, g: 50, y: 7,  tur: 'baslik'    },   // baslik
    { s: 8,  u: 34, g: 38, y: 4,  tur: 'metin'     },   // paragraf
    { s: 8,  u: 40, g: 30, y: 4,  tur: 'metin'     },
    { s: 8,  u: 49, g: 20, y: 6,  tur: 'dugme'     },   // buton
    { s: 8,  u: 63, g: 24, y: 22, tur: 'kart'      },   // uc kart
    { s: 38, u: 63, g: 24, y: 22, tur: 'kart'      },
    { s: 68, u: 63, g: 24, y: 22, tur: 'kart'      }
  ];

  function kur(kap) {
    kap.setAttribute('aria-hidden', 'true');
    kap.innerHTML = '';

    var kutular = PARCALAR.map(function (p, i) {
      var d = document.createElement('div');
      d.className = 'insa-parca insa-parca--' + p.tur;
      d.style.left   = p.s + '%';
      d.style.top    = p.u + '%';
      d.style.width  = p.g + '%';
      d.style.height = p.y + '%';
      d.style.transitionDelay = (i * 110) + 'ms';
      kap.appendChild(d);
      return d;
    });

    // Hareket azaltma: dogrudan son hal
    if (AZ_HAREKET || !('IntersectionObserver' in window)) {
      kutular.forEach(function (k) { k.classList.add('yerinde'); });
      return;
    }

    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        kutular.forEach(function (k) { k.classList.add('yerinde'); });
        gozcu.disconnect();   // bir kez insa edilir
      });
    }, { threshold: 0.25 });

    gozcu.observe(kap);
  }

  function baslat() {
    U.$$('[data-insa]').forEach(kur);
  }

  return { baslat: baslat };
})();

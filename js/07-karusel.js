/* =============================================================
   07-karusel.js
   NE YAPAR : Yatay kayan 3 boyutlu kart serisi. Kartlar merkeze
              yaklastikca duzlesir, kenarlara gittikce Y ekseninde
              doner ve geri cekilir — derinlik hissi verir.
   BAGLI    : 01-utils.js
   NEREDE   : portfolio.html ve index.html icindeki
              <div class="karusel" data-karusel> bloklari.

   ---------------------------------------------------------------
   NEDEN JAVASCRIPT YERINE CSS ILE BASLIYORUZ
   ---------------------------------------------------------------
   Kaydirmanin kendisi tarayicinin OZ scroll'u (overflow-x: auto).
   Yani JavaScript hic calismasa bile kartlar parmakla/trackpad ile
   kaydirilir, klavyeyle gezilebilir, ekran okuyucu okur.
   Bu dosya sadece 3B egimi ve oklari EKLER — temel islevi kurmaz.
   Boylece bozulursa site calismaya devam eder.
   ============================================================= */

window.Karusel = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Bir kartin merkeze uzakligina gore 3B donusunu hesaplar. */
  function egimVer(ray, kartlar) {
    var merkez = ray.scrollLeft + ray.clientWidth / 2;

    kartlar.forEach(function (kart) {
      var kartMerkez = kart.offsetLeft + kart.offsetWidth / 2;
      var fark = (kartMerkez - merkez) / ray.clientWidth;   // -1 .. +1 civari
      fark = Math.max(-1.4, Math.min(1.4, fark));

      var donus  = fark * -22;                 // derece: saga giden saga doner
      var uzaklik = Math.abs(fark) * -90;      // merkezden uzak = geride
      var olcek  = 1 - Math.abs(fark) * 0.08;
      var solma  = 1 - Math.abs(fark) * 0.35;

      kart.style.transform =
        'perspective(1100px) rotateY(' + donus.toFixed(2) + 'deg) ' +
        'translateZ(' + uzaklik.toFixed(0) + 'px) ' +
        'scale(' + olcek.toFixed(3) + ')';
      kart.style.opacity = Math.max(0.45, solma).toFixed(2);
    });
  }

  /** Bir karuseli kurar. */
  function kur(kap) {
    var ray = U.$('.karusel-ray', kap);
    if (!ray) return;

    var kartlar = U.$$('.karusel-kart', ray);
    if (!kartlar.length) return;

    /* --- 3B egim (hareket azaltma acikken atlanir) --- */
    if (!AZ_HAREKET) {
      var bekleyen = false;
      var guncelle = function () {
        if (bekleyen) return;
        bekleyen = true;
        requestAnimationFrame(function () {
          egimVer(ray, kartlar);
          bekleyen = false;
        });
      };
      ray.addEventListener('scroll', guncelle, { passive: true });
      window.addEventListener('resize', guncelle);
      guncelle();
    }

    /* --- Ok dugmeleri --- */
    var geri = U.$('.karusel-ok--geri', kap);
    var ileri = U.$('.karusel-ok--ileri', kap);

    function adim() {
      // Bir kart genisligi + aradaki bosluk kadar kaydir
      return kartlar[0].offsetWidth + 20;
    }
    U.on(geri,  'click', function () { ray.scrollBy({ left: -adim(), behavior: AZ_HAREKET ? 'auto' : 'smooth' }); });
    U.on(ileri, 'click', function () { ray.scrollBy({ left:  adim(), behavior: AZ_HAREKET ? 'auto' : 'smooth' }); });

    /** Oklari, gidilecek yer kalmadiginda pasiflestirir. */
    function oklariGuncelle() {
      var sol = ray.scrollLeft;
      var enFazla = ray.scrollWidth - ray.clientWidth - 2;
      if (geri)  geri.disabled  = sol <= 2;
      if (ileri) ileri.disabled = sol >= enFazla;
    }
    ray.addEventListener('scroll', oklariGuncelle, { passive: true });
    window.addEventListener('resize', oklariGuncelle);
    oklariGuncelle();

    /* --- Fare ile surukleme (masaustu) --- */
    var suruklu = false, baslangicX = 0, baslangicScroll = 0;

    U.on(ray, 'pointerdown', function (e) {
      if (e.pointerType === 'touch') return;   // dokunmatikte tarayici zaten yapiyor
      suruklu = true;
      baslangicX = e.clientX;
      baslangicScroll = ray.scrollLeft;
      ray.classList.add('surukleniyor');
    });
    U.on(window, 'pointermove', function (e) {
      if (!suruklu) return;
      ray.scrollLeft = baslangicScroll - (e.clientX - baslangicX);
    });
    U.on(window, 'pointerup', function () {
      suruklu = false;
      ray.classList.remove('surukleniyor');
    });
  }

  /* Gorsel yuklenemezse (henuz uretilmediyse ya da yol yanlissa)
     kirik resim ikonu gosterme; alt metnini yaz. */
  function gorselYedegi() {
    U.$$('.karusel-kart img').forEach(function (im) {
      function yedek() {
        var kap = im.parentElement;
        if (!kap) return;
        kap.textContent = im.getAttribute('alt') || 'görsel hazırlanıyor';
        Hata.goster('Gorsel yuklenemedi: ' + im.getAttribute('src'),
                    '07-karusel.js',
                    'assets/img/ altinda bu dosya var mi?');
      }
      if (im.complete && im.naturalWidth === 0) { yedek(); return; }
      im.addEventListener('error', yedek);
    });
  }

  function baslat() {
    gorselYedegi();
    U.$$('[data-karusel]').forEach(kur);
  }

  return { baslat: baslat };
})();

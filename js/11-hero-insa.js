/* =============================================================
   11-hero-insa.js
   NE YAPAR : Hero'nun sagindaki "vitrin" — gercek bir demonun
              tarayici penceresi.
              1) Scroll ile gorunure girince cerceve yukselir,
                 ekran goruntusu icine yuklenir.
              2) Fare ustundeyken cerceve 3B egilir (imleci takip
                 eder: sag -> saga doner) ve bir parilti gezinir.
   BAGLI    : 01-utils.js
   NEREDE   : index.html -> <div class="vitrin" data-vitrin>

   ---------------------------------------------------------------
   NEDEN BU?
   ---------------------------------------------------------------
   Sitenin IMZA ANI. Sattigimiz seyi anlatmadan gosteriyor:
   "biz BOYLE site yapiyoruz." Onceki soyut tel-kafes animasyon
   "mantigi cozulemedi" diye gercek ekran goruntusuyle degistirildi
   (2026-09-10). Gorseli degistirmek: index.html icindeki <img src>.

   ERISILEBILIRLIK:
   Cerceve dekoratif; icteki <img> gercek alt metin tasir.
   prefers-reduced-motion aciksa: gecis yok, egilme yok, parilti yok.
   Egilme sadece fare (hover + pointer:fine) olan cihazlarda; dokunmatik atlar.
   ============================================================= */

window.HeroInsa = (function () {
  'use strict';

  var AZ_HAREKET = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FARE_VAR = window.matchMedia &&
                 window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- 3B egilme + parilti (fareyi takip eder) ---- */
  function egilmeKur(kap) {
    if (AZ_HAREKET || !FARE_VAR) return;

    var cerceve = kap.querySelector('.vitrin-cerceve');
    var parlama = kap.querySelector('.vitrin-parlama');
    if (!cerceve) return;

    var MAKS = 7;                 // en fazla egilme (derece)
    var hedefX = 0, hedefY = 0;   // gidilecek aci
    var suanX = 0,  suanY = 0;    // simdiki aci (yumusatilmis)
    var raf = null, icerde = false;

    function cizim() {
      suanX += (hedefX - suanX) * 0.14;
      suanY += (hedefY - suanY) * 0.14;
      cerceve.style.transform =
        'rotateX(' + suanY.toFixed(2) + 'deg) rotateY(' + suanX.toFixed(2) + 'deg)';

      var duruldu = Math.abs(hedefX - suanX) < 0.04 && Math.abs(hedefY - suanY) < 0.04;
      if (!duruldu || icerde) {
        raf = requestAnimationFrame(cizim);
      } else {
        cerceve.style.transform = '';   // tam durunca stil temizle, CSS'e birak
        raf = null;
      }
    }

    kap.addEventListener('mouseenter', function () {
      icerde = true;
      cerceve.style.transition = 'transform .12s ease-out';
      if (!raf) raf = requestAnimationFrame(cizim);
    });

    kap.addEventListener('mousemove', function (e) {
      var r = kap.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 .. 0.5
      var ny = (e.clientY - r.top)  / r.height - 0.5;
      hedefX =  nx * MAKS * 2;    // imlec sagda -> rotateY pozitif -> saga doner
      hedefY = -ny * MAKS * 2;    // imlec asagida -> rotateX negatif
      if (parlama) {
        parlama.style.setProperty('--px', ((nx + 0.5) * 100).toFixed(1) + '%');
        parlama.style.setProperty('--py', ((ny + 0.5) * 100).toFixed(1) + '%');
      }
      if (!raf) raf = requestAnimationFrame(cizim);
    });

    kap.addEventListener('mouseleave', function () {
      icerde = false;
      hedefX = 0; hedefY = 0;
      cerceve.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      if (!raf) raf = requestAnimationFrame(cizim);
    });
  }

  /* ---- Scroll ile ortaya cikma ---- */
  function kur(kap) {
    function goster() {
      kap.classList.add('gorundu');
      // Cikma animasyonu bitince egilmeyi devreye al (yoksa transform catisir)
      setTimeout(function () { egilmeKur(kap); }, AZ_HAREKET ? 0 : 820);
    }

    if (AZ_HAREKET || !('IntersectionObserver' in window)) {
      goster();
      return;
    }

    var gozcu = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        goster();
        gozcu.disconnect();   // bir kez
      });
    }, { threshold: 0.2 });

    gozcu.observe(kap);
  }

  function baslat() {
    U.$$('[data-vitrin]').forEach(kur);
  }

  return { baslat: baslat };
})();

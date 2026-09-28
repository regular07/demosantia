/* =============================================================
   12-hero-sahne.js
   NE YAPAR : Ana sayfa hero'sunun Apple/Stripe tarzi sinematik
              girisi. Tamamen SCROLL'A BAGLI (kendiliginden oynamaz):
                1) Donus    — yan duran laptop bize doner
                              (kare dizisi, <canvas>'a cizilir)
                2) Yaklasma — son karede kamera laptop EKRANINA
                              yaklasip icine girer (canvas'a transform)
                3) Gecis    — katman solar, alttaki MEVCUT hero
                              (yazilar, dugmeler, vitrin) aynen belirir
              Asagi kaydir = ileri, yukari kaydir = geri.
   BAGLI    : GSAP + ScrollTrigger (index.html'de CDN), 01-utils.js
   NEREDE   : index.html -> <div class="hero-sahne" data-hero-sahne>
   CSS      : 06-sections.css -> "HERO SINEMATIK GIRIS"

   ---------------------------------------------------------------
   NEDEN VIDEO DEGIL DE KARE DIZISI?
   ---------------------------------------------------------------
   video.currentTime ile scroll'a gore ileri-geri sarmak takilir
   (tarayici her seferinde anahtar kareyi arar). Tek tek JPG'ler
   onceden yuklenip canvas'a cizilince her iki yonde de akici.

   ---------------------------------------------------------------
   GERCEK VIDEO GELINCE (yer tutucu kareleri degistirmek)
   ---------------------------------------------------------------
   1) Eski kareleri sil, videodan yenilerini cikar (1280 genislik):
        rm assets/hero-seq/f_*.jpg
        ffmpeg -i hero.mp4 -vf "fps=12,scale=1280:-2" -q:v 5 assets/hero-seq/f_%03d.jpg
      (~4-5 sn x 12 fps = ~48-60 kare. Numara 001'den baslar.)
   2) Asagidaki AYAR.kareSayisi'ni cikan dosya sayisina esitle:
        ls assets/hero-seq/*.jpg | wc -l
      Sonra WebP'ye cevir (site .webp okur, ~3 kat hafif), ornek:
        for f in assets/hero-seq/f_*.jpg; do cwebp -q 80 "$f" -o "${f%.jpg}.webp"; done
   3) SON karede ekran dikdortgenini yeniden olc -> AYAR.ekran.
      (Olcum: gorseli ac, ekranin sol/ust kenari ve eni/boyu piksel
       olarak bul, gorsel eni/boyuna bol, 100 ile carp.)

   ERISILEBILIRLIK:
   Katman aria-hidden; gercek icerik (h1, dugmeler) hep DOM'da.
   prefers-reduced-motion veya <=768px ekranda sekans HIC kurulmaz,
   hero dogrudan gorunur (index.html <head> betigi + gsap.matchMedia).
   ============================================================= */

window.HeroSahne = (function () {
  'use strict';

  /* ---- TEK AYAR NOKTASI ---- */
  var AYAR = {
    kareSayisi: 49,
    // ### -> 001, 002 ... (kare numarasi 1'den baslar)
    kareYolu: 'assets/hero-seq/f_###.webp',   // JPG'ler yedek olarak klasorde duruyor

    // Ekran dikdortgeni, KARENIN yuzdesi olarak (son kare = ekrani donuk laptop).
    // Olcum: assets/img/hero-cihaz-3d-ekran.jpg (1536x1024) uzerinde piksel tarama:
    //   sol 313px, ust 135px, en 872px, boy 593px  (ekran camiyla cerceve siniri)
    // Video gelince SON kare uzerinde yeniden kalibre et.
    ekran: { sol: 25.39, ust: 15.42, genislik: 47.34, yukseklik: 56.11 },  // 720p final video son kare (1280x720): sol 325, ust 111, en 606, boy 404 px

    // Pin suresi: kac ekran boyu scroll (2.5-3 arasi iyi hissettiriyor)
    kaydirmaBoyu: 2.75,   // DEGISIRSE: 06-sections.css "CLS onlemi" 275vh de degismeli

    // Evreler, toplam ilerlemenin (0..1) dilimleri. Ust uste binebilir.
    evre: {
      donus:    [0.00, 0.45],   // kare 1 -> son kare
      yaklasma: [0.42, 0.82],   // son karede ekrana dogru zoom
      gecis:    [0.74, 1.00]    // katman solar, hero belirir
    },

    // Zoom sonunda ekran, gorunen alani bu kadar ASARAK kaplar (kenarlar disari tassin)
    zoomPayi: 1.08,

    // Scroll'u yumusatma (saniye). 0 = parmakla birebir; 0.5 = hafif ataletli
    yumusatma: 0.5
  };

  var SART = '(min-width: 769px) and (prefers-reduced-motion: no-preference)';

  // Perde kalkinca hero'nun kendi giris animasyonlari (kelime belirme,
  // sayaclar, vitrin) baslasin diye BIR KEZ 'hero:acildi' olayi yayilir.
  // Dinleyen: U.heroBekle (01-utils.js). Geri kaydirip inince tekrar yok.
  var ACILMA_ESIGI = 0.85;   // gecis evresinin bu kadari bitince
  var acildi = false;
  function heroAc() {
    if (acildi) return;
    acildi = true;
    document.dispatchEvent(new CustomEvent('hero:acildi'));
  }

  /* ---- Yardimcilar ---- */
  function kareAdresi(i) {                // i: 0 tabanli
    var no = String(i + 1);
    while (no.length < 3) no = '0' + no;
    return AYAR.kareYolu.replace('###', no);
  }
  function dilim(p, aralik) {             // p'nin [a,b] icindeki orani, 0..1'e kirpilmis
    var a = aralik[0], b = aralik[1];
    return Math.min(1, Math.max(0, (p - a) / (b - a)));
  }
  function yumusak(t) { return t * t * (3 - 2 * t); }   // smoothstep

  /* ---- Asil kurulum (sadece genis ekran + hareket serbest) ---- */
  function kur(sahne) {
    var hero   = sahne.closest('.hero');
    var tuval  = sahne.querySelector('canvas');
    var ctx    = tuval.getContext('2d');
    var kareler = new Array(AYAR.kareSayisi);
    var cizilen = -1;                      // son cizilen kare (gereksiz cizimi onler)
    var durum  = { p: 0 };                 // GSAP'in scrub ettigi ilerleme
    var olcu   = null;                     // tuval boyu + ekranin tuvaldeki yeri
    var bitti  = false;                    // temizle() sonrasi gec gelen kareler cizmesin

    /* Kareleri KADEMELI yukle (sayfa acilisini 49 istekle bogmamak icin):
       - ilk ONDEN_KARE kare hemen istenir (ilk kare <head>'de preload'lu),
       - kalanlar sayfa 'load' olduktan sonra, tarayici bosta kaldikca
         arka planda sirayla (ayni anda en fazla ARKA_PARALEL istek).
       Henuz gelmemis kareye kaydirilirsa ciz() en yakin yuklu kareyi
       gosterir; tuval hic bos kalmaz. */
    var ONDEN_KARE = 7, ARKA_PARALEL = 3;
    function kareYukle(i) {
      if (kareler[i]) return;
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        img.hazir = true;
        ciz();                 // daha yakin bir kare geldiyse ciz() onu secer
        sirayaDevam();
      };
      img.onerror = sirayaDevam;
      img.src = kareAdresi(i);
      kareler[i] = img;
    }
    for (var i = 0; i < Math.min(ONDEN_KARE, AYAR.kareSayisi); i++) kareYukle(i);

    var siradaki = ONDEN_KARE, arkaBasladi = false;
    function sirayaDevam() {
      if (!arkaBasladi || bitti) return;
      while (siradaki < AYAR.kareSayisi && kareler[siradaki]) siradaki++;
      if (siradaki >= AYAR.kareSayisi) return;
      var no = siradaki++;
      var bosta = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1); };
      bosta(function () { kareYukle(no); }, { timeout: 500 });
    }
    function arkaPlanaBasla() {
      if (arkaBasladi) return;
      arkaBasladi = true;
      for (var j = 0; j < ARKA_PARALEL; j++) sirayaDevam();
    }
    if (document.readyState === 'complete') arkaPlanaBasla();
    else window.addEventListener('load', arkaPlanaBasla);

    function kareNo() {
      return Math.round(dilim(durum.p, AYAR.evre.donus) * (AYAR.kareSayisi - 1));
    }

    function hazirMi(i) { return i >= 0 && i < AYAR.kareSayisi && kareler[i] && kareler[i].hazir; }
    function enYakinHazir(n) {
      for (var d = 0; d < AYAR.kareSayisi; d++) {
        if (hazirMi(n - d)) return n - d;
        if (hazirMi(n + d)) return n + d;
      }
      return 0;
    }

    /* Tuvali ekrana (CSS boyu x DPR) esitle, ekranin tuvaldeki yerini hesapla. */
    function boyutla() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = tuval.clientWidth, h = tuval.clientHeight;
      tuval.width  = Math.round(w * dpr);
      tuval.height = Math.round(h * dpr);

      // "cover" yerlesimi: kare tuvali tam kaplar, tasan kirpilir
      var ref = kareler[0];
      var kw = (ref && ref.naturalWidth)  || 1280;
      var kh = (ref && ref.naturalHeight) || 853;
      var s  = Math.max(w / kw, h / kh);
      var ox = (w - kw * s) / 2, oy = (h - kh * s) / 2;

      var e = AYAR.ekran;
      var ex = ox + kw * s * e.sol / 100,  ey = oy + kh * s * e.ust / 100;
      var ew = kw * s * e.genislik / 100,  eh = kh * s * e.yukseklik / 100;

      olcu = {
        w: w, h: h, dpr: dpr, s: s, ox: ox, oy: oy, kw: kw, kh: kh,
        mx: ex + ew / 2, my: ey + eh / 2,                    // ekran merkezi (px)
        zoom: Math.max(w / ew, h / eh) * AYAR.zoomPayi       // ekranin gorunen alani kaplama olcegi
      };
      cizilen = -1;
      ciz();
    }

    /* Mevcut ilerlemeye gore kareyi ciz + kamerayi ayarla + katmani sondur. */
    function ciz() {
      if (!olcu || bitti) return;
      var p = durum.p;

      // 1) Donus: dogru kareyi bul; yuklenmediyse en yakin yuklenmis kare
      //    (esit uzaklikta onceki kare tercih edilir)
      var n = kareNo();
      var k = enYakinHazir(n);
      if (k !== cizilen && kareler[k] && kareler[k].hazir) {
        var img = kareler[k];
        ctx.setTransform(olcu.dpr, 0, 0, olcu.dpr, 0, 0);
        ctx.clearRect(0, 0, olcu.w, olcu.h);
        ctx.drawImage(img, olcu.ox, olcu.oy, olcu.kw * olcu.s, olcu.kh * olcu.s);
        cizilen = k;
      }

      // 2) Yaklasma: olcek ekran merkezinden (transform-origin), ayrica ekran
      //    merkezi yavasca gorunen alanin ortasina kayar. Ustel olcek:
      //    zoom esit hizda "ilerliyor" gibi hisseder.
      var y = yumusak(dilim(p, AYAR.evre.yaklasma));
      var olcek = Math.pow(olcu.zoom, y);
      var dx = (olcu.w / 2 - olcu.mx) * y;
      var dy = (olcu.h / 2 - olcu.my) * y;
      tuval.style.transformOrigin = olcu.mx.toFixed(1) + 'px ' + olcu.my.toFixed(1) + 'px';
      tuval.style.transform =
        'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + olcek.toFixed(4) + ')';

      // 3) Gecis: katman solar. Tamamen sonunce gizle (tiklama/boyama yuku yok)
      var g = dilim(p, AYAR.evre.gecis);
      sahne.style.opacity = (1 - g).toFixed(3);
      sahne.style.visibility = g >= 1 ? 'hidden' : '';
      if (g >= ACILMA_ESIGI) heroAc();
    }

    boyutla();
    window.addEventListener('resize', boyutla);

    // Yazi tipleri gec gelince header/hero boyu degisir -> pin olculerini tazele
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    // CSS'in onden ayirdigi bosluk (bkz. 06-sections.css "CLS onlemi")
    // birakilir; ayni gorevde pin-spacer kurulur, arada boyama olmaz.
    document.documentElement.classList.add('sekans-pin');

    // Pin + scrub: hero ekrana sabitlenir, scroll ilerlemesi durum.p'ye akar
    var tween = gsap.to(durum, {
      p: 1,
      ease: 'none',
      onUpdate: ciz,
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * AYAR.kaydirmaBoyu); },
        pin: true,
        scrub: AYAR.yumusatma,
        invalidateOnRefresh: true
      }
    });

    // gsap.matchMedia kosulu bozulunca (pencere daraldi vb.) her seyi geri al
    return function temizle() {
      bitti = true;
      window.removeEventListener('resize', boyutla);
      window.removeEventListener('load', arkaPlanaBasla);
      if (tween.scrollTrigger) tween.scrollTrigger.kill(true);
      tween.kill();
      sahne.removeAttribute('style');
      tuval.removeAttribute('style');
      document.documentElement.classList.remove('sekans', 'sekans-pin');
      heroAc();   // perde yok -> bekleyen animasyonlar hemen oynasin
    };
  }

  function baslat() {
    var sahne = U.$('[data-hero-sahne]');
    if (!sahne) return;

    // GSAP (CDN) yuklenemediyse: perdeyi kaldir, hero dogrudan gorunsun
    if (!window.gsap || !window.ScrollTrigger) {
      document.documentElement.classList.remove('sekans');
      heroAc();   // perde yok -> bekleyen animasyonlar hemen oynasin
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Kosul saglandigi surece kurulu kalir; saglanmazsa temizle() calisir.
    // (Mobil / hareket azaltma: hic kurulmaz, sekans sinifi da yok.)
    var mm = gsap.matchMedia();
    mm.add(SART, function () {
      document.documentElement.classList.add('sekans');
      return kur(sahne);
    });
    if (!window.matchMedia(SART).matches) {
      document.documentElement.classList.remove('sekans');
      heroAc();   // perde yok -> bekleyen animasyonlar hemen oynasin
    }
  }

  return { baslat: baslat, AYAR: AYAR };
})();

/* =============================================================
   10-karsilastir.js
   NE YAPAR : "Once / Sonra" surgusu. Kolu surukleyince eski site
              gorseli ile yeni site gorseli arasinda gecis olur.
   BAGLI    : 01-utils.js
   NEREDE   : index.html icindeki <div class="karsilastir">

   ---------------------------------------------------------------
   NEDEN BU BILESEN?
   ---------------------------------------------------------------
   Bu bir sus degil, SATIS ARACI. Musteriye "sana ne katiyorum"
   sorusunun cevabini anlatmadan gosteriyor. Kapi kapi gezerken
   telefonda acilip parmakla surulecek sey budur.

   ERISILEBILIRLIK:
   Kol bir <input type="range">. Yani klavyeyle ok tuslariyla
   gezilebilir, ekran okuyucu okur, JavaScript bozulsa bile
   iki gorsel de sayfada durur.
   ============================================================= */

window.Karsilastir = (function () {
  'use strict';

  function kur(kap) {
    var kol    = U.$('.karsilastir-kol', kap);
    var ustKat = U.$('.karsilastir-ust', kap);
    if (!kol || !ustKat) return;

    /** Surgu degerine gore ust katmani kirpar. */
    function ciz(deger) {
      // Ust katman soldan saga kirpiliyor: 0 = tamamen gizli, 100 = tam gorunur
      ustKat.style.clipPath = 'inset(0 ' + (100 - deger) + '% 0 0)';
      kap.style.setProperty('--kol-konum', deger + '%');
      kol.setAttribute('aria-valuetext', 'Yeni tasarım %' + Math.round(deger) + ' görünür');
    }

    U.on(kol, 'input', function () { ciz(parseFloat(kol.value)); });

    // Kap uzerinde surukleyince de calissin (kola tam basmak gerekmesin)
    var suruklu = false;
    function konumdanDeger(e) {
      var r = kap.getBoundingClientRect();
      var oran = ((e.clientX - r.left) / r.width) * 100;
      return Math.max(0, Math.min(100, oran));
    }
    U.on(kap, 'pointerdown', function (e) {
      // Link ya da butona basildiysa karisma
      if (e.target.closest('a, button')) return;
      suruklu = true;
      var d = konumdanDeger(e);
      kol.value = d; ciz(d);
    });
    U.on(window, 'pointermove', function (e) {
      if (!suruklu) return;
      var d = konumdanDeger(e);
      kol.value = d; ciz(d);
    });
    U.on(window, 'pointerup', function () { suruklu = false; });

    ciz(parseFloat(kol.value || 50));
  }

  function baslat() {
    U.$$('[data-karsilastir]').forEach(kur);
  }

  return { baslat: baslat };
})();

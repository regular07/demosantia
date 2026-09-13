/* =============================================================
   99-main.js
   NE YAPAR : Sitenin giris noktasi. Hangi modulun ne zaman
              calisacagina karar verir.
   BAGLI    : Butun diger js dosyalarina.
   SIRA     : Once header/footer yerlesir, SONRA menu kurulur.
              Bu sira onemli — menu, header gelmeden bulunamaz.
   ============================================================= */

U.hazir(function () {
  'use strict';

  Parcalar.hepsiniYukle().then(function () {
    Nav.baslat();          // menu ancak header geldikten sonra kurulabilir
  });

  TeklifFormu.baslat();    // form sayfada yoksa kendisi sessizce cikar
  Belir.baslat();
  Karusel.baslat();     // portfolyodaki 3B kart serisi
  Sayac.baslat();       // gorunur olunca sayan rakamlar
  Etkiler.baslat();     // miknatis buton, kart egimi, ilerleme cizgisi
  Karsilastir.baslat(); // once/sonra surgusu
  HeroInsa.baslat();    // hero'da kendini insa eden duzen

  if (Hata.GELISTIRME) {
    console.info('%c Demosentia ', 'background:#0d7d84;color:#fff;border-radius:3px',
                 'gelistirme modu — hatalar ekranda gosterilecek. Test paneli: /test.html');
  }
});

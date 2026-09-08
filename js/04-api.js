/* =============================================================
   04-api.js   ★ BACKEND'E TEK TEMAS NOKTASI
   NE YAPAR : Sunucuya giden BUTUN cagrilar bu dosyada.
   NEDEN    : Servisi degistirdigimizde (Node -> ASP.NET Core) ya da
              baska bir sunucuya tasidigimizda SADECE BU DOSYA degisir.
              Sayfalar ve formlar sunucunun ne oldugunu bilmez.
   BAGLI    : 00-hata.js
   SERVIS   : server/ klasorundeki Node + Express servisi.
              REST sozlesmesi: server/README.md
   ============================================================= */

window.Api = (function () {
  'use strict';

  /* -----------------------------------------------------------
     AYARLAR — tasima aninda degisecek TEK yer burasi.
     ----------------------------------------------------------- */
  /* -----------------------------------------------------------
     ORTAM TESPITI

     GitHub Pages SADECE statik dosya sunar — Node servisi orada
     CALISMAZ. Bu yuzden adres sabit yazilamaz: site nerede
     aciliyorsa ona gore karar veriyoruz.

       yerelde  -> kendi bilgisayarindaki servis (gercek kayit)
       canlida  -> CANLI_API tanimliysa oraya, degilse demo modu

     Demo modunda form calisir, dogrulama yapar, ama kayit
     gondermez ve bunu kullaniciya acikca soyler. Sessizce
     patlamasindansa durumu bildirmesi dogru.
     ----------------------------------------------------------- */

  // Servisi bir sunucuya tasidiginda BURAYI doldur, gerisi kendiliginden calisir.
  var CANLI_API = '';   // ornek: 'https://api.demosantia.com'

  var yerelMi = ['localhost', '127.0.0.1', ''].indexOf(location.hostname) !== -1;

  var AYAR = {
    // Kademe 1 (su an): kendi bilgisayarindaki Node servisi -> yerel PostgreSQL
    // Kademe 2 (canli): ayni servis bir sunucuda  -> CANLI_API doldurulur
    // Kademe 3 (ileride): ASP.NET Core Web API    -> yine CANLI_API
    //
    // REST sozlesmesi ayni kaldigi surece servisin hangi dille yazildigi
    // bu dosyayi ilgilendirmez. Sadece adres degisir.
    taban: yerelMi ? 'http://localhost:3001' : CANLI_API,

    // Adres yoksa sunucuya hic gitme, sadece dogrula
    taslakModu: !(yerelMi || CANLI_API)
  };

  /* -----------------------------------------------------------
     Ic yardimci: JSON istegi
     ----------------------------------------------------------- */
  function istek(yontem, yol, veri) {
    if (AYAR.taslakModu) {
      // Sunucu bagli degilken formun geri kalanini test edebilmek icin.
      console.info('[Api] TASLAK MODU — sunucuya gidilmedi. Veri:', veri);
      return new Promise(function (coz) {
        setTimeout(function () { coz({ taslak: true, veri: veri }); }, 400);
      });
    }

    var secenek = {
      method: yontem,
      headers: { 'Accept': 'application/json' }
    };
    if (veri) {
      secenek.headers['Content-Type'] = 'application/json';
      secenek.body = JSON.stringify(veri);
    }

    return fetch(AYAR.taban + yol, secenek).then(function (cevap) {
      return cevap.json()
        .catch(function () { return {}; })   // govde JSON degilse bos nesne
        .then(function (govde) {
          if (!cevap.ok) {
            // Servis Turkce hata mesaji donuyor; onu kullan.
            var e = new Error(govde.hata || ('Sunucu ' + cevap.status));
            e.durum = cevap.status;
            e.hatalar = govde.hatalar || null;   // alan bazli hatalar
            throw e;
          }
          return govde;
        });
    });
  }

  /* -----------------------------------------------------------
     DISARIYA ACILAN FONKSIYONLAR
     Sayfalar sadece bunlari cagirir.
     ----------------------------------------------------------- */

  /**
   * Teklif talebini kaydeder.
   * @param {{full_name:string, email:string, phone:string,
   *          company:string, package:string, budget_band:string,
   *          message:string}} veri
   * @returns {Promise<{tamam:boolean, id:string}>}
   */
  function teklifGonder(veri) {
    return istek('POST', '/api/quote-requests', veri);
  }

  /** Servis ve veritabani ayakta mi? test.html bunu kullanir. */
  function saglikKontrol() {
    if (AYAR.taslakModu) {
      return Promise.resolve({ durum: 'taslak', mesaj: 'Servis baglanmadi (taslak modu)' });
    }
    return istek('GET', '/api/health')
      .then(function (c) {
        return {
          durum: c.veritabani === 'acik' ? 'acik' : 'kapali',
          mesaj: 'servis ' + c.servis + ', veritabani ' + c.veritabani + ' (' + c.detay + ')'
        };
      })
      .catch(function (e) {
        return {
          durum: 'kapali',
          mesaj: e.message + ' — server/ klasorunde "npm start" calisiyor mu?'
        };
      });
  }

  return {
    AYAR: AYAR,
    teklifGonder: teklifGonder,
    saglikKontrol: saglikKontrol
  };
})();

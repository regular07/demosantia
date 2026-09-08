/* =============================================================
   04-api.js   ★ BACKEND'E TEK TEMAS NOKTASI
   NE YAPAR : Sunucuya giden BUTUN cagrilar bu dosyada.
   NEDEN    : Veritabanini degistirdigimizde (yerel Postgres ->
              barindirilan Postgres -> kendi sunucumuz + ASP.NET Core)
              SADECE BU DOSYA degisir. Sayfalar ve formlar
              veritabaninin nerede oldugunu bilmez.
   BAGLI    : 00-hata.js
   ============================================================= */

window.Api = (function () {
  'use strict';

  /* -----------------------------------------------------------
     AYARLAR — tasima aninda degisecek TEK yer burasi.
     ----------------------------------------------------------- */
  var AYAR = {
    // Kademe 1 (yerel gelistirme): kendi bilgisayarindaki servis
    // Kademe 2 (canli): barindirilan Postgres'in REST adresi
    // Kademe 3 (ileride): https://api.demosantia.com
    taban: '',              // bos = henuz bagli degil, taslak modu
    anahtar: '',            // erisim anahtari (varsa)
    taslakModu: true        // true iken sunucuya gitmez, sadece dogrular
  };

  /* -----------------------------------------------------------
     Ic yardimci: JSON POST
     ----------------------------------------------------------- */
  function gonder(yol, veri) {
    if (AYAR.taslakModu) {
      // Veritabani henuz bagli degil. Formun geri kalanini test
      // edebilmen icin basarili gibi davraniyoruz ama acikca soyluyoruz.
      console.info('[Api] TASLAK MODU — sunucuya gidilmedi. Gonderilecek veri:', veri);
      return new Promise(function (coz) {
        setTimeout(function () { coz({ taslak: true, veri: veri }); }, 400);
      });
    }

    return fetch(AYAR.taban + yol, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': AYAR.anahtar,
        'Authorization': 'Bearer ' + AYAR.anahtar,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(veri)
    }).then(function (cevap) {
      if (!cevap.ok) {
        return cevap.text().then(function (metin) {
          throw new Error('Sunucu ' + cevap.status + ': ' + metin.slice(0, 200));
        });
      }
      return cevap.status === 204 ? {} : cevap.json();
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
   */
  function teklifGonder(veri) {
    return gonder('/rest/v1/quote_requests', veri);
  }

  /** Sunucu ayakta mi? test.html bunu kullanir. */
  function saglikKontrol() {
    if (AYAR.taslakModu) {
      return Promise.resolve({ durum: 'taslak', mesaj: 'Veritabani henuz baglanmadi (taslak modu)' });
    }
    return fetch(AYAR.taban + '/rest/v1/', { headers: { apikey: AYAR.anahtar } })
      .then(function (c) {
        return { durum: c.ok ? 'acik' : 'kapali', mesaj: 'HTTP ' + c.status };
      })
      .catch(function (e) { return { durum: 'kapali', mesaj: e.message }; });
  }

  return {
    AYAR: AYAR,
    teklifGonder: teklifGonder,
    saglikKontrol: saglikKontrol
  };
})();

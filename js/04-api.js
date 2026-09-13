/* =============================================================
   04-api.js   ★ BACKEND'E TEK TEMAS NOKTASI
   NE YAPAR : Teklif formunun verisi buradan cikar. Sayfalar ve
              formlar arkada ne oldugunu (Node / Supabase / Web3Forms)
              BILMEZ — servis degisince SADECE bu dosya degisir.
   BAGLI    : 00-hata.js

   HEDEFLER (oncelik sirasiyla):
     1) Supabase  -> CANLI sitede varsayilan. Kendi Postgres tablomuz
        (quote_requests). Kayit kalici + sorgulanabilir. Aylik sinir yok.
        Tarayicidan dogrudan REST ile yazar; RLS sadece INSERT'e izin verir,
        okuma kapalidir. Kotuye kullanim/tekrar korumasi sunucu tarafinda
        (trigger): ayni e-postadan saatte 5, ayni mesaj 10 dk icinde tekrar -> ret.
     2) Web3Forms -> yedek. Supabase bosaltilirsa devreye girer (ayda 250).
     3) Yerel Node servisi (server/) -> gelistirme/test. localhost'ta calisir.

   Yerelde denemek icin adres cubuguna ?form=supabase veya ?form=web3 ekle.
   ============================================================= */

window.Api = (function () {
  'use strict';

  /* -----------------------------------------------------------
     AYARLAR — tasima aninda degisecek TEK yer burasi.
     ----------------------------------------------------------- */

  // 1) SUPABASE (canli varsayilan). Anahtar "publishable" — istemci kodunda
  //    durmasi normaldir; guvenligi RLS saglar (disaridan sadece INSERT).
  var SUPABASE_URL = 'https://avwxujnzaycatxkgflyn.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_2AypfknuSPcwL28RZbrsZQ_S89EoO5a';

  // 2) WEB3FORMS (yedek). Supabase'i bosaltirsan bu devreye girer.
  var WEB3FORMS_KEY = '4bccf148-a573-46a9-9984-c97be47514cb';

  // 3) Kendi sunucuna tasirsan (VPS / ev sunucusu) burayi doldur, hepsi atlanir.
  var CANLI_API = '';   // ornek: 'https://api.demosentia.com'

  // localhost VEYA ev agindaki bir IP (telefondan test ederken)
  var ozelAg = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
  var yerelMi = ['localhost', '127.0.0.1', ''].indexOf(location.hostname) !== -1
             || ozelAg.test(location.hostname);

  // Yerelde belirli bir hedefi zorlamak icin: ?form=supabase | ?form=web3 | ?form=node
  var zorla = (/[?&]form=(supabase|web3|node)\b/.exec(location.search) || [])[1] || '';

  var AYAR = {
    taban: yerelMi ? location.protocol + '//' + location.hostname + ':3001' : CANLI_API,
    // Hicbir hedef yoksa sunucuya hic gitme, sadece dogrula (demo modu)
    taslakModu: !(yerelMi || CANLI_API || SUPABASE_URL || WEB3FORMS_KEY)
  };

  /* -----------------------------------------------------------
     Ic yardimci: yerel Node servisine JSON istegi
     ----------------------------------------------------------- */
  function istek(yontem, yol, veri) {
    if (AYAR.taslakModu) {
      console.info('[Api] TASLAK MODU — sunucuya gidilmedi. Veri:', veri);
      return new Promise(function (coz) {
        setTimeout(function () { coz({ taslak: true, veri: veri }); }, 400);
      });
    }

    var secenek = { method: yontem, headers: { 'Accept': 'application/json' } };
    if (veri) {
      secenek.headers['Content-Type'] = 'application/json';
      secenek.body = JSON.stringify(veri);
    }

    return fetch(AYAR.taban + yol, secenek).then(function (cevap) {
      return cevap.json().catch(function () { return {}; }).then(function (govde) {
        if (!cevap.ok) {
          var e = new Error(govde.hata || ('Sunucu ' + cevap.status));
          e.durum = cevap.status;
          e.hatalar = govde.hatalar || null;
          throw e;
        }
        return govde;
      });
    });
  }

  /* -----------------------------------------------------------
     DISARIYA ACILAN FONKSIYONLAR — sayfalar sadece bunlari cagirir.
     ----------------------------------------------------------- */

  /**
   * Teklif talebini kaydeder. Hedefi ortama gore secer.
   * @returns {Promise<{tamam:boolean, id:(number|null), taslak?:boolean}>}
   */
  function teklifGonder(veri) {
    // Bal tuzagi: gercek kullanici bos birakir. Doluysa bot -> sessizce yut.
    if (veri && veri.botcheck) {
      return Promise.resolve({ tamam: true, id: null });
    }

    var canliBaglam = !yerelMi;   // GitHub Pages / gercek alan adi

    if (SUPABASE_URL && SUPABASE_KEY && (zorla === 'supabase' || (canliBaglam && zorla !== 'web3' && zorla !== 'node'))) {
      return supabaseGonder(veri);
    }
    if (WEB3FORMS_KEY && (zorla === 'web3' || (canliBaglam && zorla !== 'node'))) {
      return web3formsGonder(veri);
    }
    return istek('POST', '/api/quote-requests', veri);
  }

  /* --- 1) SUPABASE: tarayicidan dogrudan REST insert ---
     RLS sadece INSERT'e izin verir. Trigger tekrar/kotuye kullanimi eler
     ve Turkce hata mesaji dondurur; onu kullaniciya gosteriyoruz. */
  function supabaseGonder(veri) {
    var satir = {
      full_name:   veri.full_name,
      email:       veri.email,
      phone:       veri.phone || null,
      company:     veri.company || null,
      package:     veri.package,
      budget_band: veri.budget_band || null,
      message:     veri.message,
      source:      'website'
    };

    return fetch(SUPABASE_URL + '/rest/v1/quote_requests', {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'   // satiri geri isteme (okuma kapali)
      },
      body: JSON.stringify(satir)
    }).then(function (cevap) {
      if (cevap.ok) return { tamam: true, id: null };
      return cevap.json().catch(function () { return {}; }).then(function (c) {
        // PostgREST: { message, details, hint, code }
        var e = new Error(c.message || ('Kayit olusturulamadi (' + cevap.status + ')'));
        e.durum = cevap.status;
        throw e;
      });
    });
  }

  /* --- 2) WEB3FORMS: yedek. Cevap { success:true } -> HTTP 200 --- */
  function web3formsGonder(veri) {
    var govde = {
      access_key: WEB3FORMS_KEY,
      subject:    'Yeni teklif talebi — Demosentia',
      from_name:  'Demosentia web sitesi',
      botcheck:   veri.botcheck || '',
      'Ad Soyad': veri.full_name,
      email:      veri.email,
      'Telefon':  veri.phone   || '—',
      'Firma':    veri.company || '—',
      'Paket':    veri.package,
      'Butce':    veri.budget_band || '—',
      'Mesaj':    veri.message
    };

    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(govde)
    }).then(function (cevap) {
      return cevap.json().catch(function () { return {}; }).then(function (c) {
        if (!cevap.ok || !c.success) {
          var e = new Error(c.message || ('Gonderim basarisiz (' + cevap.status + ')'));
          e.durum = cevap.status;
          throw e;
        }
        return { tamam: true, id: null };
      });
    });
  }

  /** Servis ve veritabani ayakta mi? test.html bunu kullanir. */
  function saglikKontrol() {
    if (AYAR.taslakModu) {
      return Promise.resolve({ durum: 'taslak', mesaj: 'Servis baglanmadi (taslak modu)' });
    }
    if (!yerelMi && SUPABASE_URL) {
      return fetch(SUPABASE_URL + '/rest/v1/', { headers: { 'apikey': SUPABASE_KEY } })
        .then(function (c) {
          return { durum: c.ok ? 'acik' : 'kapali', mesaj: 'Supabase REST ' + c.status };
        })
        .catch(function (e) { return { durum: 'kapali', mesaj: e.message }; });
    }
    return istek('GET', '/api/health')
      .then(function (c) {
        return {
          durum: c.veritabani === 'acik' ? 'acik' : 'kapali',
          mesaj: 'servis ' + c.servis + ', veritabani ' + c.veritabani + ' (' + c.detay + ')'
        };
      })
      .catch(function (e) {
        return { durum: 'kapali', mesaj: e.message + ' — server/ klasorunde "npm start" calisiyor mu?' };
      });
  }

  return {
    AYAR: AYAR,
    teklifGonder: teklifGonder,
    saglikKontrol: saglikKontrol
  };
})();

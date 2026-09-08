/* =============================================================
   05-quote-form.js
   NE YAPAR : contact.html icindeki teklif formunu yonetir —
              alan dogrulamasi, hata mesajlari, gonderim durumu.
   BAGLI    : 00-hata.js, 01-utils.js, 04-api.js
   BILMEZ   : Veritabaninin ne oldugunu. Sadece Api.teklifGonder cagirir.
   ============================================================= */

window.TeklifFormu = (function () {
  'use strict';

  // Zorunlu alanlar ve bos birakilirsa gosterilecek Turkce mesaj
  var ZORUNLU = {
    full_name: 'Adiniz gerekli.',
    email:     'E-posta gerekli.',
    package:   'Bir paket seciniz.',
    message:   'Kisa da olsa bir mesaj yaziniz.'
  };

  function alanKutusu(ad) {
    var girdi = U.$('[name="' + ad + '"]');
    return girdi ? girdi.closest('.alan') : null;
  }

  function hataYaz(ad, mesaj) {
    var kutu = alanKutusu(ad);
    if (!kutu) return;
    kutu.classList.toggle('hatali', !!mesaj);
    var yer = U.$('.alan-hata', kutu);
    if (yer) yer.textContent = mesaj || '';
  }

  function temizle() {
    Object.keys(ZORUNLU).forEach(function (ad) { hataYaz(ad, ''); });
  }

  /** Formu okur, dogrular. Gecerliyse veri nesnesi, degilse null doner. */
  function oku(form) {
    var fd = new FormData(form);
    var veri = {};
    fd.forEach(function (deger, ad) { veri[ad] = String(deger).trim(); });

    var gecerli = true;
    temizle();

    Object.keys(ZORUNLU).forEach(function (ad) {
      if (!veri[ad]) { hataYaz(ad, ZORUNLU[ad]); gecerli = false; }
    });

    // E-posta bicimi
    if (veri.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(veri.email)) {
      hataYaz('email', 'E-posta adresi gecerli gorunmuyor.');
      gecerli = false;
    }

    if (veri.message && veri.message.length < 10) {
      hataYaz('message', 'Biraz daha detay yazin (en az 10 karakter).');
      gecerli = false;
    }

    return gecerli ? veri : null;
  }

  function baslat() {
    var form = U.$('#teklif-formu');
    if (!form) return;   // bu sayfada form yok, sessizce cik

    var dugme = U.$('button[type="submit"]', form);
    var sonuc = U.$('#form-sonuc');

    U.on(form, 'submit', function (e) {
      e.preventDefault();
      sonuc.className = 'form-sonuc';
      sonuc.textContent = '';

      var veri = oku(form);
      if (!veri) {
        sonuc.className = 'form-sonuc form-sonuc--hata';
        sonuc.textContent = 'Lutfen isaretli alanlari duzeltin.';
        var ilk = U.$('.alan.hatali input, .alan.hatali select, .alan.hatali textarea');
        if (ilk) ilk.focus();
        return;
      }

      dugme.disabled = true;
      dugme.textContent = 'Gonderiliyor...';

      Api.teklifGonder(veri)
        .then(function (c) {
          form.reset();
          sonuc.className = 'form-sonuc form-sonuc--basari';
          sonuc.textContent = c && c.taslak
            ? 'Bu bir demo sitesidir — form calisiyor ancak talep kaydedilmedi. ' +
              'Gercek site yayina alindiginda talepler dogrudan bize ulasir.'
            : 'Talebiniz alindi. En kisa surede donus yapacagiz.';
        })
        .catch(function (e) {
          sonuc.className = 'form-sonuc form-sonuc--hata';

          // Sunucu alan bazli hata dondurduyse (ornegin e-posta bicimi),
          // ilgili alanin altina yaz. Sunucu dogrulamasi tarayicidakinden
          // daha kapsamli olabilir, o yuzden onu da gosteriyoruz.
          if (e.hatalar) {
            Object.keys(e.hatalar).forEach(function (ad) {
              hataYaz(ad, e.hatalar[ad]);
            });
            sonuc.textContent = 'Lutfen isaretli alanlari duzeltin.';
            return;
          }

          // Hiz siniri: kullaniciya ne yapacagini soyle
          if (e.durum === 429) {
            sonuc.textContent = e.message;
            return;
          }

          sonuc.textContent = 'Gonderilemedi. Lutfen tekrar deneyin veya bize dogrudan yazin.';
          Hata.goster('Teklif gonderilemedi: ' + e.message, '05-quote-form.js',
                      'server/ klasorunde "npm start" calisiyor mu? js/04-api.js adresi dogru mu?');
        })
        .finally(function () {
          dugme.disabled = false;
          dugme.textContent = 'Teklif iste';
        });
    });
  }

  return { baslat: baslat, oku: oku };
})();

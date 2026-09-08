/* =============================================================
   01-ayarlar.js
   NE YAPAR : Ortam degiskenlerini okur, eksikse ERKEN uyarir.
   BAGLI    : Hicbir seye.
   NEDEN    : Ayarlar tek yerde toplansin; kod icine gomulu
              adres/sifre olmasin.
   ============================================================= */

'use strict';

const AYAR = {
  port:            Number(process.env.PORT || 3001),

  // Veritabani — pg kutuphanesi PG* degiskenlerini kendisi de okur,
  // ama acikca yazmak neyin nereden geldigini gorunur kiliyor.
  db: {
    host:     process.env.PGHOST     || 'localhost',
    port:     Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'demosantia',
    user:     process.env.PGUSER     || process.env.USER,
    password: process.env.PGPASSWORD || undefined
  },

  yonetimAnahtari: process.env.YONETIM_ANAHTARI || '',

  // Virgulle ayrilmis liste. Ornek:
  //   IZINLI_KAYNAK=http://localhost:8000,http://10.29.169.227:8000
  // Telefondan test ederken Mac'in yerel ag IP'sini de eklemek gerekir,
  // cunku tarayici icin "localhost" ile "10.x.x.x" farkli kaynaklardir.
  izinliKaynaklar: (process.env.IZINLI_KAYNAK || 'http://localhost:8000')
                     .split(',').map(s => s.trim()).filter(Boolean)
};

/** Servis acilirken ayarlari denetler. Eksik varsa net sekilde soyler. */
function denetle() {
  const uyarilar = [];

  if (!AYAR.yonetimAnahtari) {
    uyarilar.push('YONETIM_ANAHTARI bos. Talep okuma uc noktalari KAPALI olacak.');
  } else if (AYAR.yonetimAnahtari.length < 16) {
    uyarilar.push('YONETIM_ANAHTARI cok kisa (16 karakterden az). Uzat.');
  } else if (AYAR.yonetimAnahtari.startsWith('degistir-bunu')) {
    uyarilar.push('YONETIM_ANAHTARI hala ornek deger. .env dosyasinda degistir.');
  }

  return uyarilar;
}

module.exports = { AYAR, denetle };

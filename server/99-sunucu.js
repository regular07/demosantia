/* =============================================================
   99-sunucu.js
   NE YAPAR : Servisin giris noktasi. Express'i kurar, ara katmanlari
              bagler, rotalari takar ve dinlemeye baslar.
   BAGLI    : Butun diger server dosyalarina.
   CALISTIR : cd server && npm start
   ============================================================= */

'use strict';

const express = require('express');
const { AYAR, denetle } = require('./01-ayarlar');
const { baglantiTest } = require('./02-veritabani');
const rotalar = require('./04-rotalar');

const uygulama = express();

// Express'in "X-Powered-By" basligini kapat — gereksiz bilgi sizdirmayalim
uygulama.disable('x-powered-by');

// Gelen JSON govdesini oku. 64kb siniri: devasa govde gonderilmesini engeller.
uygulama.use(express.json({ limit: '64kb' }));

/* -------------------------------------------------------------
   CORS — hangi adresten gelen tarayici isteklerine izin verilir.
   Sadece kendi sitemize aciyoruz; herkese acmak (*) yanlis olurdu.
   ------------------------------------------------------------- */
uygulama.use((req, res, next) => {
  const kaynak = req.get('Origin');
  if (kaynak && AYAR.izinliKaynaklar.includes(kaynak)) {
    res.set('Access-Control-Allow-Origin', kaynak);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Yonetim-Anahtari');

  // Tarayici asil istekten once OPTIONS ile "izin var mi" diye sorar
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Basit istek gunlugu — terminalde ne olup bittigini gorursun
uygulama.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString('tr-TR')}  ${req.method} ${req.originalUrl}`);
  next();
});

// Rotalar /api altinda
uygulama.use('/api', rotalar);

// Bilinmeyen adres
uygulama.use((req, res) => {
  res.status(404).json({ hata: `Bilinmeyen adres: ${req.method} ${req.originalUrl}` });
});

// Beklenmeyen hata — cokme yerine duzgun cevap
uygulama.use((hata, _req, res, _next) => {
  // Bozuk JSON gonderilmisse express.json burayi tetikler
  if (hata.type === 'entity.parse.failed') {
    return res.status(400).json({ hata: 'Gonderilen veri gecerli JSON degil.' });
  }
  console.error('[beklenmeyen]', hata.message);
  res.status(500).json({ hata: 'Sunucu hatasi.' });
});

/* -------------------------------------------------------------
   Baslat
   ------------------------------------------------------------- */
(async function baslat() {
  const uyarilar = denetle();

  const db = await baglantiTest();

  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │  Demosantia API                             │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log(`  Adres        : http://localhost:${AYAR.port}`);
  console.log(`  Saglik       : http://localhost:${AYAR.port}/api/health`);
  console.log(`  Veritabani   : ${db.acik ? 'BAGLI (' + db.veritabani + ')' : 'BAGLANAMADI — ' + db.hata}`);
  console.log(`  Izinli kaynak: ${AYAR.izinliKaynaklar.join(', ')}`);

  if (!db.acik) {
    console.log('');
    console.log('  ! Postgres.app calisiyor mu? Yesil "Running" yaziyor mu?');
  }
  uyarilar.forEach(u => console.log(`  ! ${u}`));

  console.log('');
  console.log('  Durdurmak icin Ctrl+C');
  console.log('');

  uygulama.listen(AYAR.port);
})();

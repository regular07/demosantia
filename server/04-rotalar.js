/* =============================================================
   04-rotalar.js
   NE YAPAR : REST uc noktalari. Servisin "sozlesmesi" burada.
   BAGLI    : 02-veritabani.js, 03-dogrulama.js, 01-ayarlar.js

   ---------------------------------------------------------------
   REST SOZLESMESI  (Demet bunu C#'a cevirmek isterse referans alir)
   ---------------------------------------------------------------
   GET    /api/health              -> herkese acik, saglik durumu
   POST   /api/quote-requests      -> HERKESE ACIK, form buraya yazar
   GET    /api/quote-requests      -> KORUMALI, talep listesi
   PATCH  /api/quote-requests/:id  -> KORUMALI, durum guncelleme

   Korumali uc noktalar "X-Yonetim-Anahtari" basligini ister.
   ---------------------------------------------------------------
   ============================================================= */

'use strict';

const express = require('express');
const { sorgu, baglantiTest } = require('./02-veritabani');
const { teklifDogrula, durumDogrula } = require('./03-dogrulama');
const { AYAR } = require('./01-ayarlar');

const rotalar = express.Router();

/* -------------------------------------------------------------
   Basit hiz siniri: ayni IP dakikada en fazla 5 form gonderebilir.
   Bellekte tutuluyor; servis yeniden baslayinca sifirlanir.
   Kucuk bir site icin yeterli, spam'i keser.
   ------------------------------------------------------------- */
const gecmis = new Map();
const PENCERE_MS = 60_000;
const ENFAZLA    = 5;

function hizSiniri(req, res, next) {
  const kimlik = req.ip || 'bilinmiyor';
  const simdi  = Date.now();
  const liste  = (gecmis.get(kimlik) || []).filter(t => simdi - t < PENCERE_MS);

  if (liste.length >= ENFAZLA) {
    return res.status(429).json({
      hata: 'Cok fazla istek gonderildi. Lutfen bir dakika sonra tekrar deneyin.'
    });
  }
  liste.push(simdi);
  gecmis.set(kimlik, liste);
  next();
}

/* -------------------------------------------------------------
   Yonetim anahtari kontrolu — okuma/guncelleme uc noktalari icin
   ------------------------------------------------------------- */
function yonetimGerekli(req, res, next) {
  if (!AYAR.yonetimAnahtari) {
    return res.status(503).json({
      hata: 'Yonetim uc noktalari kapali. .env icinde YONETIM_ANAHTARI tanimlanmali.'
    });
  }
  if (req.get('X-Yonetim-Anahtari') !== AYAR.yonetimAnahtari) {
    return res.status(401).json({ hata: 'Yetkisiz.' });
  }
  next();
}

/* ============ GET /api/health ============ */
rotalar.get('/health', async (_req, res) => {
  const db = await baglantiTest();
  res.status(db.acik ? 200 : 503).json({
    servis: 'acik',
    veritabani: db.acik ? 'acik' : 'kapali',
    detay: db.acik ? db.veritabani : db.hata,
    an: new Date().toISOString()
  });
});

/* ============ POST /api/quote-requests ============
   Herkese acik. Site formu buraya yazar. */
rotalar.post('/quote-requests', hizSiniri, async (req, res) => {
  const { gecerli, veri, hatalar } = teklifDogrula(req.body || {});

  if (!gecerli) {
    return res.status(400).json({
      hata: 'Gonderilen bilgilerde eksik veya hatali alanlar var.',
      hatalar
    });
  }

  try {
    const c = await sorgu(
      `insert into quote_requests
         (full_name, email, phone, company, package, budget_band, message, source)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id, created_at`,
      [veri.full_name, veri.email, veri.phone || null, veri.company || null,
       veri.package, veri.budget_band || null, veri.message, 'website']
    );

    console.log(`[talep] #${c.rows[0].id} ${veri.full_name} <${veri.email}> paket=${veri.package}`);

    // Musteriye sadece basarili oldugunu soyluyoruz, ic detay vermiyoruz
    res.status(201).json({ tamam: true, id: c.rows[0].id });

  } catch (e) {
    console.error('[talep] kaydedilemedi:', e.message);
    res.status(500).json({ hata: 'Kayit olusturulamadi. Lutfen tekrar deneyin.' });
  }
});

/* ============ GET /api/quote-requests ============
   Korumali. Talepleri listeler.
   ?durum=new  ile filtrelenebilir. */
rotalar.get('/quote-requests', yonetimGerekli, async (req, res) => {
  const durum = (req.query.durum || '').trim();
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  try {
    const c = durum
      ? await sorgu(
          `select * from quote_requests where status = $1
           order by created_at desc limit $2`, [durum, limit])
      : await sorgu(
          `select * from quote_requests
           order by created_at desc limit $1`, [limit]);

    res.json({ adet: c.rowCount, talepler: c.rows });
  } catch (e) {
    console.error('[liste] hata:', e.message);
    res.status(500).json({ hata: 'Liste alinamadi.' });
  }
});

/* ============ PATCH /api/quote-requests/:id ============
   Korumali. Bir talebin durumunu ve notunu gunceller. */
rotalar.patch('/quote-requests/:id', yonetimGerekli, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ hata: 'Gecersiz id.' });
  }

  const { gecerli, veri, hatalar } = durumDogrula(req.body || {});
  if (!gecerli) return res.status(400).json({ hata: 'Gecersiz veri.', hatalar });

  try {
    const c = await sorgu(
      `update quote_requests
          set status = $1,
              note   = coalesce($2, note)
        where id = $3
       returning id, full_name, status, note`,
      [veri.status, veri.note, id]
    );

    if (c.rowCount === 0) return res.status(404).json({ hata: 'Talep bulunamadi.' });
    res.json({ tamam: true, talep: c.rows[0] });

  } catch (e) {
    console.error('[guncelle] hata:', e.message);
    res.status(500).json({ hata: 'Guncellenemedi.' });
  }
});

module.exports = rotalar;

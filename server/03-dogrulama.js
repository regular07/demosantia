/* =============================================================
   03-dogrulama.js
   NE YAPAR : Disaridan gelen veriyi denetler ve temizler.
   BAGLI    : Hicbir seye.
   NEDEN    : Tarayicidaki dogrulama (js/05-quote-form.js) sadece
              KULLANICI KOLAYLIGI icindir. Kotu niyetli biri onu
              tamamen atlayip dogrudan bu servise istek atabilir.
              GERCEK dogrulama burada yapilir. Bu dosya olmadan
              veritabanina cop girer.
   KATMAN   : 1) burasi  2) veritabanindaki CHECK kisitlari
              Iki katman birbirini yedekler.
   ============================================================= */

'use strict';

const PAKETLER = ['basic', 'standard', 'premium'];
const DURUMLAR = ['new', 'contacted', 'quoted', 'won', 'lost'];
const BUTCELER = ['', '0-5000', '5000-10000', '10000-20000', '20000+'];

// Alan uzunluk sinirlari — cok uzun veri gonderilmesini engeller
const SINIR = {
  full_name: 120, email: 200, phone: 40,
  company: 160, message: 5000, budget_band: 20
};

/** Bosluklari kirp, string degilse bos string yap. */
function metin(d) {
  return typeof d === 'string' ? d.trim() : '';
}

/**
 * Teklif talebini dogrular.
 * @returns {{gecerli:boolean, veri:object|null, hatalar:object}}
 *          hatalar: { alanAdi: 'Turkce mesaj' }
 */
function teklifDogrula(gelen) {
  const hatalar = {};
  const v = {
    full_name:   metin(gelen.full_name),
    email:       metin(gelen.email).toLowerCase(),
    phone:       metin(gelen.phone),
    company:     metin(gelen.company),
    package:     metin(gelen.package),
    budget_band: metin(gelen.budget_band),
    message:     metin(gelen.message)
  };

  // --- Zorunlu alanlar ---
  if (!v.full_name) hatalar.full_name = 'Ad soyad gerekli.';
  if (!v.email)     hatalar.email     = 'E-posta gerekli.';
  if (!v.package)   hatalar.package   = 'Paket secilmeli.';
  if (!v.message)   hatalar.message   = 'Mesaj gerekli.';

  // --- Bicim kontrolleri ---
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) {
    hatalar.email = 'E-posta bicimi gecersiz.';
  }
  if (v.package && !PAKETLER.includes(v.package)) {
    hatalar.package = 'Gecersiz paket. Beklenen: ' + PAKETLER.join(', ');
  }
  // Telefon istege bagli; yazilmissa Turkiye bicimi olmali.
  // Rakam disini at, sonra: istege bagli 90/0 onek + [2-5] + 9 rakam.
  if (v.phone && !/^(90)?0?[2-5][0-9]{9}$/.test(v.phone.replace(/\D/g, ''))) {
    hatalar.phone = 'Telefon numarasi gecersiz. Ornek: 0532 123 45 67';
  }
  if (v.budget_band && !BUTCELER.includes(v.budget_band)) {
    hatalar.budget_band = 'Gecersiz butce araligi.';
  }
  if (v.message && v.message.length < 10) {
    hatalar.message = 'Mesaj cok kisa (en az 10 karakter).';
  }

  // --- Uzunluk sinirlari ---
  for (const [alan, enfazla] of Object.entries(SINIR)) {
    if (v[alan] && v[alan].length > enfazla) {
      hatalar[alan] = `Cok uzun (en fazla ${enfazla} karakter).`;
    }
  }

  const gecerli = Object.keys(hatalar).length === 0;
  return { gecerli, veri: gecerli ? v : null, hatalar };
}

/** Durum guncellemesi dogrulama. */
function durumDogrula(gelen) {
  const hatalar = {};
  const durum = metin(gelen.status);
  const not   = metin(gelen.note);

  if (!durum) {
    hatalar.status = 'Durum gerekli.';
  } else if (!DURUMLAR.includes(durum)) {
    hatalar.status = 'Gecersiz durum. Beklenen: ' + DURUMLAR.join(', ');
  }
  if (not.length > 2000) hatalar.note = 'Not cok uzun (en fazla 2000 karakter).';

  const gecerli = Object.keys(hatalar).length === 0;
  return { gecerli, veri: gecerli ? { status: durum, note: not || null } : null, hatalar };
}

module.exports = { teklifDogrula, durumDogrula, PAKETLER, DURUMLAR };

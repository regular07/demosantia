/* =============================================================
   02-veritabani.js
   NE YAPAR : PostgreSQL baglanti havuzunu kurar ve sorgu calistirir.
   BAGLI    : 01-ayarlar.js
   KURAL    : SQL'e kullanici verisi ASLA string birlestirme ile
              konmaz. Hep $1, $2 parametreleri kullanilir.
              Sebep: SQL injection. Bu kurala istisna yok.

   ---------------------------------------------------------------
   NEDEN BU KADAR SAVUNMACI? (8 Eylul 2026'da yasanmis gercek hata)
   ---------------------------------------------------------------
   BELIRTI : Servis basladiginda calisiyor, birkac dakika bosta
             kalinca form 500 veriyor; /api/health "veritabani kapali"
             diyor. Ama Postgres ayakta ve taze bir Node sureci ayni
             ayarla 70 ms'de baglaniyor.

   KOK NEDEN: macOS App Nap. Isletim sistemi, on planda gorunur bir
             penceresi olmayan sureci askiya aliyor. Askidaki surecin
             zamanlayicilari calismadigi icin baglanti kurulamiyor ve
             connectionTimeoutMillis doluyor. Sorun kodda degil,
             surecin uyutulmasinda.

   COZUM   : basla.command servisi "caffeinate -i" ile baslatir.
             Dogrulandi: 90 sn bosta bekledikten sonra sorunsuz kayit.

   Asagidaki uc onlem ise gercek ag kesintilerine karsi (tethering
   kopmasi, uyku sonrasi olu soketler) ikinci savunma hatti:
     1) keepAlive   : soket bosta dursa da canli tutulur.
     2) kisa idle   : bosta baglanti 10 sn sonra birakilir.
     3) yeniden dene: gecici baglanti hatasinda 2 kez daha denenir.
   ============================================================= */

'use strict';

const { Pool } = require('pg');
const { AYAR } = require('./01-ayarlar');

// Havuz: her istekte yeni baglanti acmak yerine hazir baglantilari
// tekrar kullanir. Kucuk bir site icin 5 baglanti fazlasiyla yeter.
const havuz = new Pool({
  host:     AYAR.db.host,
  port:     AYAR.db.port,
  database: AYAR.db.database,
  user:     AYAR.db.user,
  password: AYAR.db.password,

  max: 5,

  // Onlem 1: TCP keepalive — isletim sistemi soketi olu sanmasin.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,

  // Onlem 2: bosta duran baglantiyi cabuk birak (30 sn degil, 10 sn).
  idleTimeoutMillis: 10000,

  connectionTimeoutMillis: 5000
});

// Bosta bir baglanti hata verirse pg onu havuzdan atar.
// Burada sadece gunluge yaziyoruz ki sessiz kalmasin.
havuz.on('error', (e) => {
  console.error('[veritabani] bosta baglanti hatasi (havuzdan atildi):', e.message);
});

/* -------------------------------------------------------------
   Gecici (yeniden denemeye deger) hatalar.
   Veri hatalari — ornegin CHECK kisiti ihlali — buraya girmez;
   onlari tekrar denemenin anlami yok, ayni sonucu verir.
   ------------------------------------------------------------- */
const GECICI_HATALAR = [
  'connection terminated',
  'client has encountered a connection error',
  'econnreset',
  'epipe',
  'etimedout',
  'socket hang up'
];

function geciciMi(e) {
  const m = String((e && e.message) || '').toLowerCase();
  return GECICI_HATALAR.some((p) => m.includes(p));
}

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

/**
 * Parametreli sorgu calistirir. Gecici baglanti hatasinda 2 kez daha dener.
 * @param {string} metin  'select * from t where id = $1'
 * @param {Array}  deger  [5]
 */
async function sorgu(metin, deger) {
  let sonHata;

  for (let deneme = 1; deneme <= 3; deneme++) {
    try {
      return await havuz.query(metin, deger);
    } catch (e) {
      sonHata = e;

      // Veri hatasiysa tekrar deneme, dogrudan yukari bildir
      if (!geciciMi(e)) throw e;

      if (deneme < 3) {
        console.warn(`[veritabani] gecici hata, yeniden deneniyor (${deneme}/2): ${e.message}`);
        await bekle(deneme * 300);   // 300 ms, sonra 600 ms
      }
    }
  }

  console.error('[veritabani] 3 denemede baglanilamadi:', sonHata.message);
  throw sonHata;
}

/** Baglanti gercekten calisiyor mu? Saglik kontrolu icin. */
async function baglantiTest() {
  try {
    const c = await sorgu('select now() as an, current_database() as vt');
    return { acik: true, veritabani: c.rows[0].vt, an: c.rows[0].an };
  } catch (e) {
    return { acik: false, hata: e.message };
  }
}

module.exports = { sorgu, baglantiTest, havuz };

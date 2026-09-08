/* =============================================================
   02-veritabani.js
   NE YAPAR : PostgreSQL baglantisi kurar ve sorgu calistirir.
   BAGLI    : 01-ayarlar.js
   KURAL    : SQL'e kullanici verisi ASLA string birlestirme ile
              konmaz. Hep $1, $2 parametreleri kullanilir.
              Sebep: SQL injection. Bu kurala istisna yok.

   ---------------------------------------------------------------
   NEDEN HAVUZ (POOL) KULLANMIYORUZ? — 8 Eylul 2026
   ---------------------------------------------------------------
   DURUST NOT: Havuzu, sandigimiz bir hatayi cozmek icin kaldirdik.
   Sonra anlasildi ki hatanin sebebi havuz DEGILMIS. Yine de geri
   koymadik; gerekcesi asagida.

   YASANAN BELIRTI:
     Servis basladiginda calisiyor, birkac dakika sonra her istek
     "connection timeout", sonra "timeout expired" ile 500 donuyor.
     Postgres ayakta, psql sorunsuz, TAM O ANDA acilan taze bir Node
     sureci 43-75 ms'de baglaniyor. Ama calisan servis baglanamiyor.

   GERCEK KOK NEDEN — olcerek bulundu:
     Surecin durumu:  STAT = SN,  nice = 5
     'N' = macOS sureci DUSUK ONCELIGE dusurmus. Gorunur penceresi
     olmayan, terminale bagli olmayan arka plan surecleri isletim
     sistemi tarafindan kisitlaniyor. Kisitlanan surece o kadar az
     islemci veriliyor ki basit bir sorgu bile 10 saniyeyi asiyor.
     Sorun veritabaninda, pg kutuphanesinde ya da havuzda DEGIL.

   DENENEN VE ISE YARAMAYANLAR:
     keepAlive + kisa idle timeout   -> yetmedi
     yeniden deneme                  -> yetmedi (surec hala kisitli)
     caffeinate -dims -w PID         -> yetmedi (o sistem uykusunu
                                        engeller, surec onceligini degil)
     renice / taskpolicy             -> root izni gerekiyor

   COZUM:
     Servisi ON PLANDA, gercek bir Terminal penceresinde calistir.
     basla.command tam bunu yapar: cift tiklayinca acilan Terminal
     penceresi on planda oldugu icin surec normal oncelikte kalir.
     Servisi arka plana atip pencereyi kapatirsan sorun geri gelir.

   PEKI HAVUZ NEDEN GERI KONMADI?
     Bu is yuku icin gerekli degil. Gunde birkac form alan bir site
     icin istek basina 30-75 ms baglanti maliyeti onemsiz; buna
     karsilik saklanan durum olmayinca curuyecek durum da olmuyor.
     Havuz yuksek es zamanlilikta anlamlidir.

     ILERIDE: servis 7/24 acik gercek bir sunucuya tasinip gunde
     binlerce istek almaya baslarsa havuza donulmeli. O noktada
     pg.Pool dogru secim olur.
   ============================================================= */

'use strict';

const { Client } = require('pg');
const { AYAR } = require('./01-ayarlar');

/** Her cagride yeni, temiz bir istemci uretir. */
function yeniIstemci() {
  return new Client({
    host:     AYAR.db.host,
    port:     AYAR.db.port,
    database: AYAR.db.database,
    user:     AYAR.db.user,
    password: AYAR.db.password,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000
  });
}

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
  'socket hang up',
  'connection refused',
  'econnrefused'
];

function geciciMi(e) {
  const m = String((e && e.message) || '').toLowerCase();
  return GECICI_HATALAR.some((p) => m.includes(p));
}

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

/**
 * Parametreli sorgu calistirir. Her cagri kendi baglantisini acar ve kapatir.
 * Gecici baglanti hatasinda 2 kez daha dener.
 * @param {string} metin  'select * from t where id = $1'
 * @param {Array}  deger  [5]
 */
async function sorgu(metin, deger) {
  let sonHata;

  for (let deneme = 1; deneme <= 3; deneme++) {
    const istemci = yeniIstemci();
    try {
      await istemci.connect();
      const sonuc = await istemci.query(metin, deger);
      return sonuc;

    } catch (e) {
      sonHata = e;
      if (!geciciMi(e)) throw e;   // veri hatasi -> tekrar deneme

      if (deneme < 3) {
        console.warn(`[veritabani] gecici hata, yeniden deneniyor (${deneme}/2): ${e.message}`);
        await bekle(deneme * 300);   // 300 ms, sonra 600 ms
      }

    } finally {
      // Baglantiyi HER DURUMDA kapat. Kapanmazsa Postgres tarafinda
      // bosta baglanti birikir ve max_connections dolar.
      try { await istemci.end(); } catch { /* zaten kapali */ }
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

module.exports = { sorgu, baglantiTest };

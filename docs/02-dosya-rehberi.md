# Dosya rehberi

"Şunu değiştirmek istiyorum, hangi dosyaya gireceğim?"

## CSS — `css/`

Numaralar **yükleme sırasını** verir. Son yüklenen kazanır.

| Dosya | Sorumluluğu | Ne zaman açarsın |
|---|---|---|
| `01-reset.css` | Tarayıcı varsayılanlarını sıfırlar | Neredeyse hiç |
| `02-tokens.css` | **Bütün renkler, yazı tipleri, ölçüler** | Renk/font değiştireceksen |
| `03-base.css` | `body`, `h1`, `p`, `a` temel görünümü | Genel tipografi |
| `04-layout.css` | Konteyner, bölüm aralıkları, ızgara | Yerleşim bozuksa |
| `05-components.css` | Buton, kart, form, menü, footer | Tekrar eden parça |
| `06-sections.css` | Hero, süreç adımları, SSS | Tek bölüme özel görünüm |
| `07-responsive.css` | **Bütün mobil kırılımları** | Mobilde bozukluk |

> Kural: `@media` sadece `07-responsive.css` içinde. Başka dosyaya yazma.

## JavaScript — `js/`

| Dosya | Sorumluluğu | Neye bağlı |
|---|---|---|
| `00-hata.js` | Hataları ekranda gösterir | — |
| `01-utils.js` | `$`, `$$`, `on`, `hazir` yardımcıları | — |
| `02-partials.js` | Menü/alt bilgiyi sayfaya yerleştirir | utils |
| `03-nav.js` | Mobil menü, aktif sayfa işareti | utils |
| `04-api.js` | **Sunucuya giden tek kapı** | — |
| `05-quote-form.js` | Teklif formu doğrulama + gönderim | utils, api |
| `06-reveal.js` | Scroll ile yumuşak belirme | utils |
| `99-main.js` | Hepsini sırayla başlatır | hepsi |

> Kural: bir dosyanın işini tek cümleyle anlatamıyorsan ikiye böl.

## Sayfalar

| Dosya | İçerik |
|---|---|
| `index.html` | Hero, ne yapıyoruz, süreç, SSS |
| `services.html` | 3 paket + destek paketleri |
| `portfolio.html` | Örnek çalışmalar |
| `about.html` | Hakkımızda |
| `contact.html` | Teklif formu |
| `test.html` | Sağlık kontrol paneli (canlıya çıkmaz) |

## Sık yapılan işler

**Menüye yeni sayfa eklemek**
1. Yeni `sayfa.html` oluştur (mevcut birini kopyala, `<title>` ve içeriği değiştir)
2. `partials/header.html` içine link ekle
3. `partials/footer.html` içine link ekle
4. `test.html` içindeki `SAYFA` listesine ekle

**Marka rengini değiştirmek**
Sadece `css/02-tokens.css` → `--marka` satırı. Başka hiçbir yere dokunma.

**Veritabanını bağlamak**
Sadece `js/04-api.js` → `AYAR` bloğu: `taban`, `anahtar`, `taslakModu: false`.

# Başla buradan

Bu repoya ilk kez bakıyorsan, okuman gereken tek sayfa bu.

## 1. Çalıştır

Repo klasöründeki **`basla.command`** dosyasına çift tıkla. Bir terminal penceresi açılır
ve tarayıcıda test paneli gelir. Pencereyi kapatma — sunucu orada çalışıyor.

Kapatmak için o pencerede `Ctrl+C`.

> **Neden çift tıklayıp `index.html`'i açamıyorum?**
> Menü ve alt bilgi `partials/` klasöründen çekiliyor (5 sayfada tekrar etmesin diye).
> Tarayıcı güvenlik gereği `file://` üzerinden dosya çekmiyor. Küçük bir yerel sunucu şart.

## 2. Her şey yerinde mi?

<http://localhost:8000/test.html> → hepsi yeşilse tamam.
Kırmızı bir satır varsa hangi dosyanın eksik olduğunu orada yazıyor.

## 3. Hata çıkarsa ne olur?

Sayfanın en üstünde **kırmızı bir şerit** belirir. Üç şey yazar:

```
⚠ HATA — js/05-quote-form.js : 42
  "email" alanı sayfada bulunamadı.
  Kontrol et: contact.html içinde id="email" var mı?
```

Ne oldu · hangi dosyanın kaçıncı satırı · nereye bakman gerektiği.
Bu şerit **sadece localhost'ta** çıkar; canlı sitede müşteri asla görmez.

## 4. Bir şey değiştireceğim, hangi dosya?

| İstediğin | Dosya |
|---|---|
| Renk / yazı tipi değiştir | `css/02-tokens.css` |
| Menüye sayfa ekle | `partials/header.html` |
| Paket fiyatı değiştir | `services.html` |
| Form alanı ekle | `contact.html` + `js/05-quote-form.js` |
| Veritabanı adresi değiştir | `js/04-api.js` (sadece burası) |
| Mobil görünüm düzelt | `css/07-responsive.css` |

Uzun hali: `02-dosya-rehberi.md`

## 5. Değişiklik yaptım, ne kontrol edeyim?

`07-test-listesi.md` içindeki maddeleri sırayla geç.

## Belgeler

| Dosya | Cevabı |
|---|---|
| `01-mimari.md` | Neden bu teknolojiler, neden bu yapı? |
| `02-dosya-rehberi.md` | Hangi dosya ne yapar? |
| `03-css-kurallari.md` | Yeni stil nereye yazılır? |
| `04-js-kurallari.md` | Yeni script nasıl eklenir? |
| `05-veritabani.md` | Tablolar ve sorgular |
| `06-yayinlama.md` | Canlıya nasıl alınır? |
| `07-test-listesi.md` | Elle test protokolü |
| `08-sorun-giderme.md` | **Bir şey bozulduğunda buraya bak** |

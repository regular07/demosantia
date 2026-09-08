# Demosantia API

Teklif formunun arkasındaki küçük REST servisi. Node.js + Express + PostgreSQL.

## Çalıştırma

```bash
cd server
cp .env.ornek .env      # bir kez: değerleri doldur
npm install             # bir kez
npm start
```

`npm run dev` dosya değişince kendini yeniden başlatır.

## REST sözleşmesi

| Yöntem | Adres | Erişim | Ne yapar |
|---|---|---|---|
| `GET` | `/api/health` | herkese açık | Servis ve veritabanı ayakta mı |
| `POST` | `/api/quote-requests` | **herkese açık** | Yeni teklif talebi kaydeder |
| `GET` | `/api/quote-requests` | korumalı | Talepleri listeler |
| `PATCH` | `/api/quote-requests/:id` | korumalı | Durum ve not günceller |

Korumalı uç noktalar `X-Yonetim-Anahtari` başlığını ister.

### POST gövdesi

```json
{
  "full_name": "Ayse Yilmaz",
  "email": "ayse@ornekkafe.com",
  "phone": "0532 111 22 33",
  "company": "Ornek Kafe",
  "package": "standard",
  "budget_band": "5000-10000",
  "message": "Kafemiz icin menulu bir site istiyoruz."
}
```

Başarılı: `201 { "tamam": true, "id": 8 }`
Hatalı: `400 { "hata": "...", "hatalar": { "email": "E-posta bicimi gecersiz." } }`

## Dosyalar

| Dosya | Sorumluluğu |
|---|---|
| `01-ayarlar.js` | Ortam değişkenleri, açılışta denetim |
| `02-veritabani.js` | Postgres bağlantı havuzu, parametreli sorgu |
| `03-dogrulama.js` | **Sunucu tarafı doğrulama** — tarayıcıdaki atlanabilir, bu atlanamaz |
| `04-rotalar.js` | REST uç noktaları, hız sınırı, yetki kontrolü |
| `99-sunucu.js` | Giriş noktası, CORS, hata yakalama |

## Güvenlik notları

- SQL'e kullanıcı verisi **hep `$1, $2` parametreleriyle** giriyor — string birleştirme yok
- Doğrulama iki katmanlı: bu servis + veritabanındaki `CHECK` kısıtları
- CORS sadece `IZINLI_KAYNAK` adresine açık, `*` değil
- POST'ta hız sınırı: aynı IP dakikada 5 istek
- Okuma/güncelleme yönetim anahtarı ister
- Hata mesajlarında iç detay dışarı verilmiyor

## Sonradan C#'a taşımak

Yukarıdaki REST sözleşmesi aynı kaldığı sürece, bu servis ASP.NET Core Web API ile
baştan yazılabilir ve **sitede tek satır değişmez**. `js/04-api.js` içindeki adres
bile aynı kalır.

# Mimari

## Neden bu teknolojiler

Site, **Demet'in profesyonel olarak kullandığı teknolojilerin içinde** kalacak şekilde
kuruldu (kaynak: `AkifOS/🛠️ 600-Arsenal/Demet - Teknik Profil.md`).

| Katman | Seçim | Gerekçe |
|---|---|---|
| Sayfa | Düz HTML5 | Derleme adımı yok. Dosyayı aç, çalışır. |
| Stil | Elle yazılmış CSS3 | Tailwind yok. Değişkenler `02-tokens.css`'te. |
| Etkileşim | Vanilla JavaScript | jQuery gerekmedi, istenirse eklenir. |
| Servis | REST | Demet REST servis tasarlayıp entegre etmiş. |
| Veritabanı | PostgreSQL | DB2/Oracle/T-SQL bilgisi birebir taşınır. |
| Yayın | GitHub Pages | Ücretsiz, statik siteye uygun. |

Eski `deeploico` reposu Astro + Tailwind + GSAP üzerineydi. Üçü de bu profilde yok ve
üçü de derleme adımı gerektiriyordu — bu yüzden yeni repo açıldı.

## Veritabanı: üç kademe

**Karar: 8 Eylül 2026.** Veritabanı bizim olacak, ama altyapıya ilk müşteriden önce
para bağlanmıyor.

1. **Kademe 1 — geliştirme (şu an):** kendi makinende PostgreSQL. Tam kontrol, sıfır maliyet.
2. **Kademe 2 — canlı, ilk müşteriye kadar:** aynı şemanın barındırılan kopyası, ücretsiz katman.
3. **Kademe 3 — para girince:** kendi sunucun (VPS) + kendi Postgres'in + ASP.NET Core Web API.

Üç kademede de şema bizim: `database/01-tables.sql` … `04-seed.sql`.

## Kilit karar: tek temas noktası

Sunucuya giden **bütün** çağrılar `js/04-api.js` içinde. Sayfalar, formlar ve diğer
script'ler veritabanının nerede durduğunu bilmiyor.

```
contact.html
   ↓
js/05-quote-form.js      (doğrulama)
   ↓
js/04-api.js       ★     (tek değişim noktası)
   ↓
quote_requests tablosu
```

Kademeler arası geçiş = `04-api.js` içindeki `AYAR.taban` adresini değiştirmek.
Başka hiçbir dosyaya dokunulmuyor.

## Derleyici yok, kontrol katmanı var

Derleme adımı olmadığı için hataları yakalayan bir derleyici de yok. O görevi iki şey
üstleniyor:

- `js/00-hata.js` — çalışma anındaki her hatayı ekrana basar
- `test.html` — bütün dosyaların, sayfaların ve bağlantının yerinde olup olmadığını denetler

Bedava gelen sadeliğin karşılığı, kendi kontrol katmanımızı yazmak.

## Sunucu tavizi

`02-partials.js`, menü ve alt bilgiyi `fetch` ile çekiyor. Tarayıcı bunu `file://`
üzerinden yapmıyor, bu yüzden yerel sunucu gerekiyor (`basla.command`).

Karşılığında menü **5 dosyada değil 1 dosyada** yönetiliyor.

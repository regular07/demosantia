# Veritabanı

## Kurulum (Kademe 1 — kendi makinen)

1. [Postgres.app](https://postgresapp.com) indir, Applications'a at, çalıştır.
2. Terminalde:

```bash
cd ~/Projects/demosantia

createdb demosantia

psql demosantia -f database/01-tables.sql
psql demosantia -f database/02-indexes.sql
psql demosantia -f database/03-security.sql
psql demosantia -f database/04-seed.sql
```

3. Kontrol et:

```bash
psql demosantia -c "select id, full_name, package, status from quote_requests;"
```

Üç test kaydı görmelisin.

> **Sıfırdan başlamak:** `dropdb demosantia` deyip yukarıdaki 5 komutu tekrar çalıştır.
> Canlıya hiçbir şey olmaz. Burası senin laboratuvarın.

## Tablo: `quote_requests`

Siteden gelen her teklif talebi buraya bir satır olarak düşer.

| Sütun | Tip | Ne tutuyor |
|---|---|---|
| `id` | bigint | Otomatik artan kayıt numarası |
| `created_at` | timestamptz | Talebin geldiği an |
| `full_name` | text | Müşteri adı (zorunlu) |
| `email` | text | E-posta (zorunlu) |
| `phone` | text | Telefon |
| `company` | text | İşletme adı |
| `package` | text | `basic` / `standard` / `premium` (zorunlu) |
| `budget_band` | text | Bütçe aralığı |
| `message` | text | Müşterinin yazdığı (zorunlu) |
| `source` | text | Talep nereden geldi |
| `status` | text | Satış hunisi durumu |
| `note` | text | Kendi notumuz, müşteri görmez |

### `status` — satış hunisi

```
new  →  contacted  →  quoted  →  won
                              ↘  lost
```

`CHECK` kısıtı sayesinde bu beş değerin dışında bir şey yazılamaz. Yanlış veri
veritabanına hiç giremez — kalite kontroldeki spesifikasyon sınırı gibi.

## Sık kullanılan sorgular

```sql
-- Bugün ne geldi?
select id, full_name, company, package, created_at
from quote_requests
where created_at >= current_date
order by created_at desc;

-- Hâlâ açık olan talepler
select id, full_name, phone, package, created_at
from quote_requests
where status in ('new', 'contacted', 'quoted')
order by created_at;

-- Hangi paket ne kadar ilgi görüyor?
select package, count(*) as adet
from quote_requests
group by package
order by adet desc;

-- Dönüşüm oranı
select
  count(*) filter (where status = 'won')  as kazanilan,
  count(*)                                as toplam,
  round(100.0 * count(*) filter (where status = 'won') / nullif(count(*), 0), 1) as yuzde
from quote_requests;

-- Bir talebi ilerlet
update quote_requests
set status = 'contacted', note = 'Telefonla arandi, fiyat konusuldu'
where id = 1;
```

## Siteyi veritabanına bağlamak

`js/04-api.js` içindeki `AYAR` bloğu:

```js
var AYAR = {
  taban: 'https://...',    // servis adresi
  anahtar: '...',          // erişim anahtarı
  taslakModu: false        // ← true iken sunucuya hiç gitmez
};
```

`taslakModu: true` olduğu sürece form çalışır ama kayıt gönderilmez — arayüzü
veritabanı olmadan test edebilmen için.

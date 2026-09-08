-- =============================================================
-- 02-indexes.sql
-- NE YAPAR : Sik yapilan sorgulari hizlandiran indeksler.
-- CALISTIR : psql demosantia -f database/02-indexes.sql
-- NEDEN    : Kayit sayisi artinca "acik talepler" sorgusu
--            tablonun tamamini taramasin.
-- =============================================================

-- "Bugun ne geldi?" — tarihe gore siralama
create index if not exists idx_quote_created
  on quote_requests (created_at desc);

-- "Hangi talepler hala acik?" — en cok kullanacagimiz sorgu
create index if not exists idx_quote_status
  on quote_requests (status);

-- "Bu musteri daha once yazmis mi?" — e-posta ile arama
create index if not exists idx_quote_email
  on quote_requests (lower(email));

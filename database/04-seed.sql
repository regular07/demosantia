-- =============================================================
-- 04-seed.sql
-- NE YAPAR : Test verisi ekler. SADECE gelistirme icin.
-- CALISTIR : psql demosantia -f database/04-seed.sql
-- DIKKAT   : Canli veritabaninda CALISTIRMA.
-- =============================================================

insert into quote_requests
  (full_name, email, phone, company, package, budget_band, message, status)
values
  ('Ayse Yilmaz', 'ayse@ornekkafe.com', '0532 111 22 33', 'Ornek Kafe',
   'standard', '5000-10000',
   'Kafemiz icin menulu bir site istiyoruz. Fotograflarimiz hazir.', 'new'),

  ('Mehmet Demir', 'mehmet@kuafor.com', '0533 444 55 66', 'Demir Kuafor',
   'basic', '0-5000',
   'Tek sayfa yeterli, randevu icin telefon butonu olsun.', 'contacted'),

  ('Zeynep Kaya', 'zeynep@klinik.com', NULL, 'Kaya Klinik',
   'premium', '10000-20000',
   'Coklu sayfa, doktor tanitimlari ve randevu formu gerekiyor.', 'quoted');

-- Kontrol sorgusu — ekledikten sonra bunu calistir:
--   select id, full_name, package, status, created_at
--   from quote_requests order by created_at desc;

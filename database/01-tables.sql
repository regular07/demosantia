-- =============================================================
-- 01-tables.sql
-- NE YAPAR : Tablolari olusturur.
-- CALISTIR : psql demosantia -f database/01-tables.sql
-- SIRA     : Bu dosya EN ONCE calistirilir.
-- =============================================================

-- Siteden gelen teklif talepleri.
-- Her form gonderimi buraya bir satir olarak duser.
create table if not exists quote_requests (
  id           bigint generated always as identity primary key,
  created_at   timestamptz  not null default now(),

  -- Musteri bilgileri
  full_name    text         not null,
  email        text         not null,
  phone        text,
  company      text,

  -- Talep detayi
  package      text         not null,   -- basic | standard | premium
  budget_band  text,                    -- 0-5000 | 5000-10000 | 10000-20000 | 20000+
  message      text         not null,

  -- Bizim takip alanlarimiz
  source       text         default 'website',
  status       text         not null default 'new',
  note         text,                    -- gorusme sonrasi kendi notumuz

  -- Gecerlilik kurallari: yanlis deger hic girilemez
  constraint chk_package check (package in ('basic', 'standard', 'premium')),
  constraint chk_status  check (status  in ('new', 'contacted', 'quoted', 'won', 'lost'))
);

-- Sutun aciklamalari: \d+ quote_requests ile gorunur
comment on table  quote_requests            is 'Web sitesinden gelen teklif talepleri';
comment on column quote_requests.status     is 'Satis hunisi: new -> contacted -> quoted -> won/lost';
comment on column quote_requests.source     is 'Talep nereden geldi: website, whatsapp, tavsiye...';
comment on column quote_requests.note       is 'Gorusme sonrasi kendi notumuz, musteri gormez';

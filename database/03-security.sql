-- =============================================================
-- 03-security.sql
-- NE YAPAR : Erisim kurallari. Siteden gelen anonim kullanici
--            SADECE kayit ekleyebilir; hicbir kaydi OKUYAMAZ.
-- CALISTIR : psql demosantia -f database/03-security.sql
-- NEDEN    : Site herkese acik. Bu kural olmadan, siteyi acan
--            herkes butun musteri taleplerini okuyabilirdi.
-- =============================================================

-- Satir seviyesinde guvenligi ac (Row Level Security)
alter table quote_requests enable row level security;

-- Kural 1: herkes YENI KAYIT EKLEYEBILIR (form calissin diye)
drop policy if exists p_insert_anon on quote_requests;
create policy p_insert_anon
  on quote_requests
  for insert
  with check (true);

-- Kural 2: kayitlari SADECE giris yapmis hesap okuyabilir
drop policy if exists p_select_auth on quote_requests;
create policy p_select_auth
  on quote_requests
  for select
  using (current_user <> 'anon');

-- NOT: Kademe 3'te (kendi sunucumuz + ASP.NET Core) bu kurallar
-- yerine API katmaninda yetkilendirme yapilacak. Tablo ayni kalir.

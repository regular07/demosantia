# Elle test listesi

Değişiklik yaptıktan sonra bu listeyi baştan geç. İşyerindeki kontrol formu gibi:
madde madde, atlamadan.

## 0 · Otomatik kontrol

- [ ] `basla.command` çift tıklandı, sunucu çalışıyor
- [ ] <http://localhost:8000/test.html> açıldı
- [ ] **Geçti** sayısı tam, **Hatalı** sayısı `0`
- [ ] Form testi butonuna basıldı, sonuç yeşil

## 1 · Her sayfada ortak

Beş sayfanın **her birinde** kontrol et:

- [ ] Sayfanın üstünde kırmızı hata şeridi **yok**
- [ ] Menü göründü, logo göründü
- [ ] Alt bilgi (footer) göründü
- [ ] Bulunduğun sayfa menüde vurgulanmış
- [ ] Menüdeki her link doğru sayfaya gidiyor
- [ ] Sayfa başlığı (tarayıcı sekmesi) doğru

## 2 · Mobil görünüm

Tarayıcıda `Cmd + Option + I` → telefon simgesi → iPhone SE seç:

- [ ] **Yatay kaydırma yok** (sağa sola kaymıyor)
- [ ] Hamburger menü göründü
- [ ] Hamburgere basınca menü açılıyor, tekrar basınca kapanıyor
- [ ] Yazılar okunabilir boyutta, taşmıyor
- [ ] Butonlar parmakla basılabilecek büyüklükte

## 3 · Ana sayfa (`index.html`)

- [ ] Hero başlığı ve iki buton görünüyor
- [ ] "Ücretsiz teklif al" → `contact.html`'e gidiyor
- [ ] "Örnek çalışmalar" → `portfolio.html`'e gidiyor
- [ ] Süreç adımları 01-02-03-04 diye numaralanmış
- [ ] SSS: bir soruya tıklayınca açılıyor/kapanıyor

## 4 · Hizmetler (`services.html`)

- [ ] Üç paket kartı yan yana (mobilde alt alta)
- [ ] Ortadaki (Standart) çerçeveli ve öne çıkıyor
- [ ] Fiyatlar doğru: 3.000₺ / 6.000₺ / 12.000₺
- [ ] Her karttaki "Teklif al" → `contact.html`

## 5 · Portfolyo (`portfolio.html`)

- [ ] Kartlar düzgün hizalı
- [ ] Canlı demo linki yeni sekmede açılıyor

## 6 · İletişim (`contact.html`) — en kritik sayfa

**Boş gönderim:**
- [ ] Hiçbir şey doldurmadan "Teklif iste" → 4 alan kırmızı oluyor
- [ ] Her kırmızı alanın altında Türkçe açıklama var
- [ ] Sayfa en üste zıplamıyor, ilk hatalı alana odaklanıyor

**Hatalı e-posta:**
- [ ] `abc` yaz → "E-posta adresi geçerli görünmüyor" çıkıyor

**Kısa mesaj:**
- [ ] Mesaja `test` yaz → "Biraz daha detay yazın" çıkıyor

**Doğru doldurma:**
- [ ] Tüm zorunlu alanları doldur → yeşil sonuç mesajı
- [ ] Form temizleniyor
- [ ] Taslak modundaysa "veritabanı henüz bağlı değil" yazıyor

## 7 · Veritabanı bağlıysa

- [ ] Formu doldur, gönder
- [ ] `psql demosantia -c "select * from quote_requests order by id desc limit 1;"`
- [ ] Az önce gönderdiğin kayıt orada

## 8 · Yayına almadan son kontrol

- [ ] Yukarıdaki her madde işaretli
- [ ] `git status` → istemediğin dosya yok
- [ ] Commit mesajı ne değiştirdiğini anlatıyor

---

**Bir madde takılırsa:** hata şeridindeki dosya adına bak, `docs/02-dosya-rehberi.md`
ile hangi dosya olduğunu bul.

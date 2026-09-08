# Sorun giderme

Karşılaşılan gerçek sorunlar ve çözümleri. Yeni bir sorun çözdüğünde buraya ekle.

---

## Form 500 hatası veriyor, `/api/health` "veritabanı kapalı" diyor

**Belirti:** Servis ilk başladığında çalışıyor. Birkaç dakika sonra form gönderimi
500 veriyor. Sunucu günlüğünde `connection timeout` veya `timeout expired`.
Ama Postgres ayakta, `psql` sorunsuz çalışıyor.

**Kök neden:** Servis **arka planda** çalışıyor. macOS, görünür penceresi olmayan
arka plan süreçlerini düşük önceliğe düşürür. Kısıtlanan sürece o kadar az işlemci
verilir ki basit bir sorgu bile zaman aşımına uğrar.

Kontrol et:

```bash
ps -o pid,nice,stat,command -p $(pgrep -f 99-sunucu.js)
```

`STAT` sütununda **`SN`** ve `NICE` değeri **0'dan büyük** görüyorsan sorun budur.
Sağlıklı hali: `STAT = S`, `NICE = 0`.

**Çözüm:** Servisi **ön planda, gerçek bir Terminal penceresinde** çalıştır —
`basla.command` dosyasına çift tıkla. Açılan Terminal penceresi ön planda olduğu
sürece süreç normal öncelikte kalır. **O pencereyi kapatma.**

Elle çalıştırıyorsan da terminali açık bırak:

```bash
cd server
npm start        # bu terminali kapatma, arka plana atma
```

**İşe yaramayanlar** (denendi, kayıt için): `keepAlive`, kısa idle timeout,
yeniden deneme, `caffeinate -dims -w PID`, `renice`, `taskpolicy`.
İlk üçü sorunun kendisiyle ilgisiz; `caffeinate` sistem uykusunu engeller ama
süreç önceliğini değiştirmez; son ikisi root izni ister.

**Nasıl doğrulanır:** `basla.command` ile başlat, pencereyi açık bırak, 10 dakika
bekle, sonra formu doldur. Kayıt düşmeli.

---

## `psql: command not found`

PATH'e eklenmemiş. `~/.zshrc` içinde şu satır olmalı:

```bash
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
```

Ekledikten sonra **yeni bir terminal penceresi aç** (mevcut pencere eski PATH'i kullanır).

---

## Sayfada menü ve alt bilgi görünmüyor

Sayfayı çift tıklayarak (`file://`) açmışsın. Tarayıcı güvenlik gereği `file://`
üzerinden `partials/` dosyalarını çekmiyor.

**Çözüm:** `basla.command` ile aç.

---

## `test.html` her şeyi kırmızı gösteriyor

Statik sunucu çalışmıyor. `basla.command` çift tıkla, sayfayı yenile.

---

## Form gönderiyorum, "Çok fazla istek" diyor

Hız sınırı: aynı IP dakikada en fazla 5 form gönderebilir (spam koruması).
Bir dakika bekle. Sınırı değiştirmek için `server/04-rotalar.js` içinde `ENFAZLA`.

---

## Veritabanını sıfırdan kurmak istiyorum

```bash
dropdb demosantia
createdb demosantia
cd ~/Projects/demosantia
for f in database/0*.sql; do psql -q demosantia -f "$f"; done
```

Canlıya hiçbir şey olmaz — bu senin yerel laboratuvarın.

---

## Servis çalışıyor mu, nasıl anlarım?

```bash
curl http://localhost:3001/api/health
```

Beklenen: `{"servis":"acik","veritabani":"acik","detay":"demosantia",...}`

---

## CSS'i değiştirdim ama tarayıcıda değişmedi

**Belirti:** CSS dosyasını düzenledin, sayfayı yeniledin, hiçbir şey değişmedi.
"Düzeltmem işe yaramadı" diye düşünüp yanlış yere bakmaya başlıyorsun.

**Sebep:** Tarayıcı CSS dosyasını önbellekten veriyor. HTML'i yenilemek yetmiyor;
`<link>` ile çekilen dosya eski kalıyor.

**Çözüm:**
- macOS'ta **Cmd + Shift + R** (sert yenileme)
- Ya da geliştirici araçlarında Network → "Disable cache" işaretle
- Ya da sunucudan gerçekten ne geldiğini gör:

```bash
curl -s http://localhost:8000/css/02-tokens.css | grep "aradığın-kural"
```

**Bu tuzağa 8 Eylül 2026'da üç kez düşüldü.** Diskteki dosya doğruydu, tarayıcı eskisini
gösteriyordu. Bir düzeltme "işe yaramadı" gibi görünüyorsa **önce sunucudan geleni kontrol et**,
koda dönüp durma.

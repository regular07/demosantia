# Sorun giderme

Karşılaşılan gerçek sorunlar ve çözümleri. Yeni bir sorun çözdüğünde buraya ekle.

---

## Form 500 hatası veriyor, `/api/health` "veritabanı kapalı" diyor

**Belirti:** Servis ilk başladığında çalışıyor. Birkaç dakika hiçbir şey yapmadan
bekleyince form gönderimi 500 hatası veriyor. Sunucu günlüğünde:

```
[veritabani] gecici hata, yeniden deneniyor (1/2): Connection terminated due to connection timeout
```

Ama Postgres ayakta (`pg_isready` → accepting connections) ve `psql` sorunsuz çalışıyor.

**Kök neden:** macOS **App Nap**. İşletim sistemi, ön planda görünür penceresi olmayan
süreçleri askıya alır. Askıdaki sürecin zamanlayıcıları çalışmadığı için veritabanı
bağlantısı kurulamaz ve zaman aşımına düşer. Kodda hata yok — süreç uyutuluyor.

**Çözüm:** `basla.command` servisi `caffeinate -i` ile başlatır. Elle başlatıyorsan:

```bash
cd server
caffeinate -i npm start
```

**Nasıl doğrulanır:** servisi başlat, 90 saniye hiçbir şey yapmadan bekle, sonra
`curl http://localhost:3001/api/health` → `"veritabani": "acik"` görmelisin.

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

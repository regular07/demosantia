# Yayınlama

## Yerelde çalıştırma

`basla.command` dosyasına çift tıkla. Bitti.

Elle yapmak istersen:

```bash
cd ~/Projects/demosantia
python3 -m http.server 8000
```

## ÖNEMLİ: GitHub Pages sadece statik dosya sunar

`server/` klasöründeki Node API servisi GitHub Pages'te **çalışmaz**. Orada sadece
HTML, CSS, JS ve görseller sunulur.

`js/04-api.js` bunu kendisi anlıyor:

| Site nerede açılıyor | Ne yapar |
|---|---|
| `localhost` | Yerel servise bağlanır, **gerçek kayıt** atar |
| `github.io` / `demosantia.com` | `CANLI_API` boşsa **demo modu** — form çalışır, doğrular, ama kayıt göndermez ve bunu kullanıcıya söyler |

Yani canlı link bir **vitrin/demo** olarak sorunsuz çalışır; form sessizce patlamaz.

### Formu canlıda gerçekten çalıştırmak

API servisini bir sunucuya koyduğunda `js/04-api.js` içindeki tek satırı doldur:

```js
var CANLI_API = 'https://api.demosantia.com';
```

Gerisi kendiliğinden çalışır — `taslakModu` otomatik kapanır.

## Canlıya alma (GitHub Pages)

### İlk kurulum — bir kez

```bash
cd ~/Projects/demosantia
git add -A
git commit -m "Demosantia sitesi ilk surum"

# GitHub'da repo olustur ve gonder
gh repo create demosantia --public --source=. --push
```

Sonra GitHub'da: **Settings → Pages → Source: `main` / root → Save**

Birkaç dakika sonra site şurada yayında olur:
`https://<kullanici-adin>.github.io/demosantia/`

### Alan adı bağlama

1. GitHub → Settings → Pages → Custom domain → `demosantia.com` → Save
2. Alan adı sağlayıcında DNS kayıtları:
   - `A` kaydı → GitHub Pages IP adresleri
   - `CNAME` (www) → `<kullanici-adin>.github.io`
3. GitHub'da **Enforce HTTPS** kutusunu işaretle

### Sonraki her güncelleme

```bash
git add -A
git commit -m "Ne degistirdigini kisaca yaz"
git push
```

Push'tan 1-2 dakika sonra canlı site güncellenir.

## Yayına almadan önce

`07-test-listesi.md` içindeki maddeleri geç. Özellikle:

- [ ] `test.html` tamamen yeşil
- [ ] Hiçbir sayfada kırmızı hata şeridi çıkmıyor
- [ ] Mobilde yatay kayma yok
- [ ] Form doğru çalışıyor

> **`test.html` canlıya çıkar mı?** Çıkar ama zararsız — sadece dosya kontrolü yapar,
> gizli bilgi göstermez. İstemezsen `.gitignore`'a ekle.

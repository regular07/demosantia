# Demosantia

Küçük işletmeler için web sitesi stüdyosu. Bu repo, demosantia.com sitesinin kaynağıdır.

## Hızlı başlangıç

1. `basla.command` dosyasına **çift tıkla** — sunucu kalkar, tarayıcıda test paneli açılır.
2. Site: <http://localhost:8000>
3. Test paneli: <http://localhost:8000/test.html>

Durdurmak için terminal penceresinde `Ctrl+C`.

## Bu repoda ne var

| Klasör | İçinde ne var |
|---|---|
| `css/` | Stiller. Numaralı — numara yükleme sırasını verir. |
| `js/` | Script'ler. `04-api.js` sunucuya giden tek kapı. |
| `partials/` | Menü ve alt bilgi. Tek yerden yönetilir. |
| `database/` | SQL şeması. Numaralı, sırayla çalıştırılır. |
| `docs/` | Türkçe dokümantasyon. **Önce `docs/00-BASLA-BURADAN.md` oku.** |
| `assets/` | Görseller, logo, ikonlar. |
| `test.html` | Sağlık kontrol paneli. |

## Teknoloji

Düz HTML5 · elle yazılmış CSS3 · vanilla JavaScript · REST · PostgreSQL

Derleme adımı yok, framework yok, paket yöneticisi yok. Dosyayı aç, düzenle, kaydet.

## Belgeler

- `docs/00-BASLA-BURADAN.md` — buradan başla
- `docs/02-dosya-rehberi.md` — "şunu değiştireceğim, hangi dosya?"
- `docs/07-test-listesi.md` — değişiklikten sonra ne kontrol edilir

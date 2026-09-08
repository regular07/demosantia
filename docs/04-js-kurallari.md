# JavaScript kuralları

## 1. Modül deseni

Her dosya kendini bir isim altında dışarı açar (IIFE deseni):

```js
window.YeniModul = (function () {
  'use strict';

  function baslat() { /* ... */ }

  return { baslat: baslat };   // sadece dışarıdan çağrılacakları döndür
})();
```

Global alana tek bir isim bırakıyoruz. Diğer her şey dosyanın içinde kalıyor.

## 2. Dosya başına yorum bloğu

Her dosya şu blokla başlar:

```js
/* ====================================
   05-quote-form.js
   NE YAPAR : ...
   BAGLI    : ...
   ==================================== */
```

## 3. Yeni script eklemek — 3 adım

1. `js/07-yeni.js` oluştur (numara sırada bir sonraki)
2. **Her HTML sayfasına** `<script src="js/07-yeni.js"></script>` ekle — `99-main.js`'ten **önce**
3. `js/99-main.js` içinde `YeniModul.baslat();` çağır
4. `test.html` içindeki `JS` listesine `'07-yeni'` ekle

## 4. Sessiz hata bırakma

Bir şey bulunamadıysa sessizce çıkma — söyle:

```js
var oge = U.$('#email');
if (!oge) {
  Hata.goster('E-posta alanı bulunamadı', '05-quote-form.js',
              'contact.html içinde id="email" var mı?');
  return;
}
```

Üçünü birden ver: **ne oldu · hangi dosya · nereye bakılacak.**

## 5. Sunucuya doğrudan gitme

`fetch` çağrısı sadece `04-api.js` içinde olur. Başka dosyadan sunucuya
gitmek gerekirse, `04-api.js` içine yeni bir fonksiyon eklenir.

Sebep: veritabanını değiştirdiğimizde tek dosya değişsin.

## 6. Sıra önemli

`99-main.js` içinde header/footer yerleştikten **sonra** menü kurulur:

```js
Parcalar.hepsiniYukle().then(function () {
  Nav.baslat();   // header gelmeden menü bulunamaz
});
```

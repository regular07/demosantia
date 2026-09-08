# CSS kuralları

## 1. Renk kodu yazma

Hiçbir dosyada `#0d7d84` gibi düz renk yazmıyoruz. Hepsi `02-tokens.css` içindeki
değişkenlerden geliyor:

```css
/* YANLIŞ */
.dugme { background: #0d7d84; }

/* DOĞRU */
.dugme { background: var(--marka); }
```

Sebep: rengi değiştirmek istediğinde 7 dosyada arama yapmayasın.

## 2. Medya sorgusu sadece 07'de

`@media` yalnızca `07-responsive.css` içinde bulunur. En son yüklendiği için
çakışmada o kazanır — mobil düzeltmesi yaparken başka dosyanın stilini
"iptal etme" derdi olmaz.

## 3. Türkçe sınıf adları

Sınıf adları Türkçe ve kısa: `.kart`, `.dugme`, `.yigin`, `.kap`.
Dosya ve klasör adları İngilizce (standart), sınıflar ve yorumlar Türkçe.

## 4. Boşluk `gap` ile

Kardeş öğeler arasındaki boşluk `margin` ile değil, kapsayıcıya `gap` ile verilir:

```css
/* YANLIŞ — margin'ler birleşir, tahmin edilemez */
.kart { margin-bottom: 16px; }

/* DOĞRU */
.izgara { display: grid; gap: var(--bo-3); }
```

## 5. Nereye yazacağım?

- Birden fazla sayfada görünüyorsa → `05-components.css`
- Sadece bir bölüme aitse → `06-sections.css`
- Yerleşimle ilgiliyse (genişlik, aralık, ızgara) → `04-layout.css`

## 6. Geniş içerik taşmasın

Tablo, kod bloğu gibi geniş şeyler kendi kutusunda kaysın:

```css
.tablo-kap { overflow-x: auto; }
```

Sayfanın gövdesi asla yana kaymamalı.

# Demosantia — Logo Prompt Seti

**Nerede kullanılır:** higgsfield.ai **web arayüzü** (tarayıcı) — sınırsız modeller, BEDAVA.
CLI'dan / skill'den ÜRETME, kredi yakar. Model: **GPT Image** (logo/tasarım/metin için en iyisi).
Alternatif denemek istersen: Seedream 4.5, FLUX.2 Pro.

**Akış:** her yön için prompt'u yapıştır → 4 varyant üret → beğendiğini indir (PNG) →
Claude'a ver → temiz SVG'ye çevirip repoya koyarız (`assets/logo/`), `favicon.svg` + header'daki
"D" karenin yerine geçer.

---

## Marka özeti (her prompt'ta geçerli)

- **İsim:** Demosantia · **iş:** küçük/yerel işletmeler için web tasarım stüdyosu (kafe,
  restoran, kuaför, klinik). Ajans değil — iki kişilik stüdyo.
- **Karakter:** temiz, modern, teknik ama sıcak, minimal, kendinden emin.
- **Renk:** birincil camgöbeği `#0E8F96`, elektrik vurgu `#22E0D0`, koyu zemin `#0B1014`,
  açık zemin `#FFFFFF`. En fazla 2 ton.
- **KAÇINILACAKLAR:** ağır degrade, 3B kabartma/bevel, gölge, fotoğraf gerçekçiliği,
  klişe "tech küre / devre kartı / dünya", başka markalara benzeme, yazı bozuklukları,
  fazla detay. Küçükte (16px favicon) okunur olmalı.

---

## YÖN 1 — Harf işareti "D" (öneri: buradan başla)

> Flat vector logo mark, a single bold letter "D" as the icon, geometric and structural,
> the counter (inside space) of the D shaped like a small browser window or a rounded panel,
> clean straight stems, generous negative space, one solid color teal #0E8F96 on pure white
> background, perfectly centered, no text, no gradient, no 3D, no shadow, crisp sharp edges,
> minimalist tech studio brand, scalable icon, high contrast. Generate 4 distinct variations.

Koyu zemin varyantı için sonuna ekle:
> Alternative version: electric teal #22E0D0 on solid dark #0B1014 background.

---

## YÖN 2 — Soyut işaret ("inşa edilen sayfa")

> Flat vector logo, a small abstract geometric symbol suggesting a web page being built:
> two or three stacked rounded rectangles of different widths, aligned left, implying a
> page layout, with an upward or forward motion, negative space forms an implied letter D.
> Single color teal #0E8F96 on white, centered, no text, no gradient, no 3D, no shadow,
> geometric, minimal, modern, crisp edges, works at 16px. Generate 4 variations.

---

## YÖN 3 — Monogram / app ikonu (kare)

> Flat vector app icon, a rounded square (squircle) tile containing a bold geometric
> letter "D", electric teal #22E0D0 mark on solid deep navy-black #0B1014 tile, subtle
> single flat color, no gradient, no bevel, no shadow, centered, generous padding,
> modern minimal tech studio, crisp, scalable. Also produce a version with the letters
> "DS". Generate 4 variations.

Bu yön mevcut placeholder'a en yakın — "D gradyan kare"nin doğrudan yerine geçer.

---

## YÖN 4 — Kelime işareti (wordmark)

> Clean custom lowercase wordmark reading "demosantia" in one line, geometric sans-serif,
> even weight, tight but readable tracking, dark ink #0B1014 on white, the letter "o"
> subtly styled as a small window/rounded square, no icon, no gradient, no 3D, no shadow,
> perfectly horizontal, high resolution, crisp vector edges, professional studio branding.
> Generate 4 variations.

İşaretli birleşik kilit için:
> Then a locked-up version: the Yön 1 "D" mark on the left, "demosantia" wordmark to the
> right, balanced spacing, same teal #0E8F96, on white.

---

## Üretim sonrası

1. Her yönden en iyi 1-2'yi indir (PNG, en yüksek çözünürlük).
2. Claude'a ver → seçileni **elle temiz SVG**'ye çeviririz (GPT Image raster verir, gerçek
   logo vektör olmalı). Gerekirse `higgsfield-brandkit` skill'inin yerel SVG üretecini
   kullanırız (o kredi yakmaz).
3. Repoya: `assets/logo/logo.svg` (yatay), `assets/logo/mark.svg` (kare işaret),
   `assets/logo/favicon.svg` (16px optimize). `partials/header.html`'deki `<span class="logo-im">D</span>`
   yerine gerçek işaret gelir.
4. OG görseli de bu kimlikle güncellenir (`assets/img/hero.jpg` yerine markalı 1200×630 kart).

#!/bin/bash
# ---------------------------------------------------------------
# basla.command — Demosantia gelistirme ortamini baslatir
#
# Iki sey birden calisir:
#   1) Statik site sunucusu   :8000
#   2) API servisi            :3001
#
# Ciftt tiklayinca ikisi de kalkar, tarayicida test paneli acilir.
# Ayni agdaki telefondan da acilabilir (asagida IP yazar).
# Durdurmak icin bu pencerede Ctrl+C (ikisi birden kapanir).
# ---------------------------------------------------------------
cd "$(dirname "$0")"

SITE_PORT=8000
API_PORT=3001
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

temizle() {
  echo ""
  echo "  kapatiliyor..."
  kill $API_PID $SITE_PID $CAFF1 $CAFF2 2>/dev/null
  exit 0
}
trap temizle INT TERM

echo ""
echo "  ┌──────────────────────────────────────────┐"
echo "  │  Demosantia — gelistirme ortami          │"
echo "  └──────────────────────────────────────────┘"

# --- API servisi ---
if [ ! -d server/node_modules ]; then
  echo "  ! server/node_modules yok -> 'cd server && npm install' calistir."
elif [ ! -f server/.env ]; then
  echo "  ! server/.env yok -> 'cp server/.env.ornek server/.env' calistir."
else
  ( cd server && node --env-file=.env 99-sunucu.js ) &
  API_PID=$!
  # macOS App Nap bu sureci uyutmasin diye caffeinate'i SURECE bagla.
  # Bagli olmazsa servis birkac dakika sonra veritabanina baglanamaz.
  caffeinate -dims -w $API_PID > /dev/null 2>&1 &
  CAFF1=$!
  sleep 2
fi

# --- Statik site (--bind 0.0.0.0: ayni agdaki telefon da gorebilsin) ---
python3 -m http.server $SITE_PORT --bind 0.0.0.0 >/dev/null 2>&1 &
SITE_PID=$!
caffeinate -dims -w $SITE_PID > /dev/null 2>&1 &
CAFF2=$!
sleep 1

echo ""
echo "  Bu bilgisayarda:"
echo "    Site        : http://localhost:$SITE_PORT"
echo "    Test paneli : http://localhost:$SITE_PORT/test.html"
if [ -n "$IP" ]; then
echo ""
echo "  Ayni agdaki telefon/tabletten:"
echo "    Site        : http://$IP:$SITE_PORT"
echo "    Test paneli : http://$IP:$SITE_PORT/test.html"
echo ""
echo "    NOT: IP degisirse (modem yeniden baslarsa) server/.env icindeki"
echo "         IZINLI_KAYNAK satirini guncelle, yoksa form CORS'a takilir."
fi
echo ""
echo "  Durdurmak icin: Ctrl+C"
echo ""

open "http://localhost:$SITE_PORT/test.html" 2>/dev/null || true
wait

#!/bin/bash
# ---------------------------------------------------------------
# basla.command — Demosantia gelistirme ortamini baslatir
#
# Iki sey birden calisir:
#   1) Statik site sunucusu   http://localhost:8000
#   2) API servisi            http://localhost:3001
#
# Ciftt tiklayinca ikisi de kalkar, tarayicida test paneli acilir.
# Durdurmak icin bu pencerede Ctrl+C  (ikisi birden kapanir).
# ---------------------------------------------------------------
cd "$(dirname "$0")"

SITE_PORT=8000
API_PORT=3001

# Ctrl+C'ye basilinca iki sureci de temizle
temizle() {
  echo ""
  echo "  kapatiliyor..."
  kill $API_PID $SITE_PID 2>/dev/null
  exit 0
}
trap temizle INT TERM

echo ""
echo "  ┌──────────────────────────────────────────┐"
echo "  │  Demosantia — gelistirme ortami          │"
echo "  └──────────────────────────────────────────┘"

# --- API servisi ---
if [ -d server/node_modules ]; then
  if [ -f server/.env ]; then
    # caffeinate -i : macOS'un bu sureci uyutmasini engeller.
    # Olmadan, servis birkac dakika bosta kalinca macOS onu askiya aliyor;
    # uyanamadigi icin veritabani baglantisi zaman asimina dusuyor ve
    # form 500 hatasi veriyor. (8 Eylul 2026'da teshis edildi.)
    (cd server && caffeinate -i npm start) &
    API_PID=$!
    sleep 2
  else
    echo "  ! server/.env yok. 'cp server/.env.ornek server/.env' calistir."
    echo "    API baslatilmadi, site taslak modunda calisacak."
  fi
else
  echo "  ! server/node_modules yok. 'cd server && npm install' calistir."
  echo "    API baslatilmadi, site taslak modunda calisacak."
fi

# --- Statik site ---
python3 -m http.server $SITE_PORT >/dev/null 2>&1 &
SITE_PID=$!
sleep 1

echo ""
echo "  Site        : http://localhost:$SITE_PORT"
echo "  Test paneli : http://localhost:$SITE_PORT/test.html"
echo "  API         : http://localhost:$API_PORT/api/health"
echo ""
echo "  Durdurmak icin: Ctrl+C"
echo ""

open "http://localhost:$SITE_PORT/test.html" 2>/dev/null || true

# Iki surec de bitene kadar bekle
wait

#!/bin/bash
# ---------------------------------------------------------------
# basla.command — Demosantia yerel sunucu baslatici
# Ciftt tiklayinca: sunucu ayaga kalkar + tarayicida test paneli acilir.
# Durdurmak icin bu pencerede Ctrl+C.
# ---------------------------------------------------------------
cd "$(dirname "$0")"
PORT=8000
echo ""
echo "  Demosantia  ->  http://localhost:$PORT"
echo "  Test paneli ->  http://localhost:$PORT/test.html"
echo "  Durdurmak icin: Ctrl+C"
echo ""
sleep 1
open "http://localhost:$PORT/test.html" 2>/dev/null || true
python3 -m http.server $PORT

@echo off
chcp 65001 >nul
cd /d "%~dp0"
title EVA 离线演示

if not exist "dist\index.html" (
  echo [EVA] 未找到 dist，请先运行: npm run build
  pause
  exit /b 1
)
if not exist "node_modules\vite" (
  echo [EVA] 未找到 node_modules，请先运行: npm install
  pause
  exit /b 1
)

echo.
echo ============================================
echo   EVA 智能座舱 · 离线演示
echo ============================================
echo   本机打开: http://127.0.0.1:4173
echo.
echo   手机体验:
echo   1. 手机连接本机热点（或同一 Wi-Fi）
echo   2. 打开下面任意一个 IPv4 地址，加 :4173
echo.
ipconfig | findstr /i "IPv4"
echo.
echo   例如: http://192.168.137.1:4173
echo   首次启动如弹出防火墙提示，请允许“专用网络”。
echo   摄像头在局域网 HTTP 下不可用，完整演示不受影响。
echo ============================================
echo.

npm run preview -- --host 0.0.0.0 --port 4173
pause

@echo off
setlocal

echo [1/3] Installing dependencies (node-fetch v3, p-limit v5)...
call npm i node-fetch@3 p-limit@5 --save-dev

echo [2/3] Fetching 5x100 GIFs from GIPHY ...
set GIPHY_API_KEY=%1
if "%GIPHY_API_KEY%"=="" (
  echo Using default key embedded in fetch_gifs.mjs (you can also pass your key like: download_gifs_windows.bat YOUR_KEY)
) else (
  echo Using provided key: %GIPHY_API_KEY%
)

node scripts\fetch_gifs.mjs

echo [3/3] Packing gifs.zip for transfer (optional)...
powershell -Command "Compress-Archive -Path public\gifs\* -DestinationPath public\gifs.zip -Force" 2>nul

echo Done. Output in public\gifs\ and public\gifs.zip
pause

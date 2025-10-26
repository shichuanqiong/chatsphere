Param(
  [string]$GIPHY_API_KEY = ""
)

Write-Host "[1/3] Installing dependencies..."
npm i node-fetch@3 p-limit@5 --save-dev | Out-Null

Write-Host "[2/3] Fetching 5x100 GIFs from GIPHY ..."
if ($GIPHY_API_KEY -ne "") {
  $env:GIPHY_API_KEY = $GIPHY_API_KEY
  Write-Host "Using provided key"
}

node scripts/fetch_gifs.mjs

Write-Host "[3/3] Packing gifs.zip (optional)..."
Try {
  Compress-Archive -Path public/gifs/* -DestinationPath public/gifs.zip -Force
} Catch {}

Write-Host "Done. See public/gifs and public/gifs.zip"

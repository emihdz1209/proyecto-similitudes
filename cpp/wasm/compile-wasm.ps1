# Script de Compilacion a WebAssembly
# Para Windows PowerShell

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Compilando C++ a WebAssembly" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Emscripten este instalado
Write-Host "[*] Verificando Emscripten..." -ForegroundColor Yellow

try {
    $emccVersion = emcc --version 2>&1 | Select-String "emcc"
    Write-Host "  [OK] Emscripten encontrado: $emccVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Emscripten no esta instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instala Emscripten desde: https://emscripten.org/docs/getting_started/downloads.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pasos rapidos:" -ForegroundColor Yellow
    Write-Host "1. git clone https://github.com/emscripten-core/emsdk.git" -ForegroundColor White
    Write-Host "2. cd emsdk" -ForegroundColor White
    Write-Host "3. .\emsdk install latest" -ForegroundColor White
    Write-Host "4. .\emsdk activate latest" -ForegroundColor White
    Write-Host "5. .\emsdk_env.ps1" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[*] Compilando text_comparison_wasm.cpp..." -ForegroundColor Yellow

# Crear carpeta de salida si no existe
New-Item -ItemType Directory -Path "wasm_output" -Force | Out-Null

# Compilar con Emscripten
$compileCommand = @"
emcc text_comparison_wasm.cpp `
    -o wasm_output/text_comparison.js `
    -s WASM=1 `
    -s MODULARIZE=1 `
    -s EXPORT_NAME='createTextComparisonModule' `
    -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' `
    -s ALLOW_MEMORY_GROWTH=1 `
    -s MAXIMUM_MEMORY=512MB `
    -O3 `
    --bind
"@

Write-Host ""
Write-Host "Comando de compilacion:" -ForegroundColor Gray
Write-Host $compileCommand -ForegroundColor Gray
Write-Host ""

# Ejecutar compilacion
Invoke-Expression $compileCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  [OK] Compilacion exitosa!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Archivos generados:" -ForegroundColor Yellow
    Write-Host "  - wasm_output/text_comparison.js" -ForegroundColor White
    Write-Host "  - wasm_output/text_comparison.wasm" -ForegroundColor White
    Write-Host ""
    Write-Host "Proximo paso:" -ForegroundColor Yellow
    Write-Host "  Copia los archivos a tu proyecto backend:" -ForegroundColor White
    Write-Host "  Copy-Item wasm_output\* -Destination ..\backend\wasm\" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "  [ERROR] Compilacion fallida" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los errores de compilacion arriba" -ForegroundColor Yellow
    exit 1
}

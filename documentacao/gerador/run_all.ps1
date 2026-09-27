# Gera o .docx, renderiza em PDF e repete até a paginação do sumário/listas estabilizar.
$S = $PSScriptRoot
Set-Location $S
$lo = "C:\Program Files\LibreOffice\program\python.exe"
Remove-Item "$S\pages.json" -ErrorAction SilentlyContinue
node build.js | Out-Null
for ($i = 1; $i -le 4; $i++) {
  & $lo lo_export.py "$S\Documentacao_Verde_Urbano.docx" "$S\lo.docx" "$S\final.pdf" | Out-Null
  $before = if (Test-Path pages.json) { Get-Content pages.json -Raw } else { '' }
  python pages.py
  $after = Get-Content pages.json -Raw
  if ($before -eq $after) { "estável na passada $i"; break }
  node build.js | Out-Null
}

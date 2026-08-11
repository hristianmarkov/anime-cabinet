$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$photosDir = Join-Path $root "Photos"
$artDir = Join-Path $root "public\art"
$csvPath = Join-Path $photosDir "Anime Cabinet 2 - Sheet1.csv"

New-Item -ItemType Directory -Force -Path $artDir | Out-Null

function Resolve-SourcePath([string]$src) {
  $simpsonAlt = $src -replace '^simpson', 'simpsons'
  $candidates = @(
    (Join-Path $photosDir "$src.png"),
    (Join-Path $photosDir "$src.jpeg"),
    (Join-Path $photosDir "$src.jpg"),
    (Join-Path $photosDir "$simpsonAlt.jpeg"),
    (Join-Path $photosDir "$simpsonAlt.jpg"),
    (Join-Path $photosDir "$simpsonAlt.png")
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { return $p }
  }
  throw "Source not found: $src"
}

function Get-StyleLabel([string]$file, [string]$style) {
  if ($style -ne "(see review style field)") { return $style }
  if ($file -match '^review-(.+?)-(?:extra-)?\d+\.jpg$') {
    $slug = $Matches[1]
    return ($slug -split '-' | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }) -join ' '
  }
  return "Custom portrait"
}

function Get-AltText([string]$file, [string]$style) {
  $label = Get-StyleLabel $file $style
  if ($file -like "hero-*") { return "Custom $label portrait featured artwork showcase" }
  if ($file -like "gallery-*") { return "Custom $label portrait gallery example" }
  if ($file -like "review-*") { return "Customer review custom $label portrait result" }
  if ($file -like "*-before.jpg") { return "Customer photo before custom $label portrait transformation" }
  if ($file -like "*-after.jpg") { return "Finished custom $label style portrait example" }
  if ($file -match "-example-(\d+)\.jpg$") { return "Custom $label portrait example $($Matches[1])" }
  return "Custom $label portrait artwork"
}

function Set-ImageFileMetadata([string]$path, [string]$title, [string]$subject, [string]$tags) {
  try {
    $shell = New-Object -ComObject Shell.Application
    $folder = $shell.Namespace((Split-Path $path))
    $item = $folder.ParseName((Split-Path $path -Leaf))
    if ($null -eq $item) { return }
    $folder.SetDetailsOf($item, $title, 21) | Out-Null
    $folder.SetDetailsOf($item, $subject, 22) | Out-Null
    $folder.SetDetailsOf($item, $tags, 18) | Out-Null
  } catch {
    Write-Warning "Could not set metadata for $path"
  }
}

$rows = Import-Csv $csvPath
$manifest = @()
$copied = 0

foreach ($row in $rows) {
  $destName = $row.'File name (suggested)'
  $src = $row.'File name'.Trim()
  $style = $row.Style
  $srcPath = Resolve-SourcePath $src
  $destPath = Join-Path $artDir $destName
  Copy-Item -Path $srcPath -Destination $destPath -Force
  $alt = Get-AltText $destName $style
  Set-ImageFileMetadata $destPath $alt "Custom portrait artwork for Anime Cabinet" "anime portrait, custom art, $style"
  $manifest += [PSCustomObject]@{ file = $destName; alt = $alt }
  $copied++
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("// Auto-generated from Photos/Anime Cabinet 2 - Sheet1.csv")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("export interface ArtAsset {")
[void]$sb.AppendLine("  src: string;")
[void]$sb.AppendLine("  alt: string;")
[void]$sb.AppendLine("}")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("function asset(file: string, alt: string): ArtAsset {")
[void]$sb.AppendLine('  return { src: `/art/${file}`, alt };')
[void]$sb.AppendLine("}")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("export const artByFile: Record<string, ArtAsset> = {")

foreach ($m in $manifest) {
  $altJson = ($m.alt | ConvertTo-Json -Compress)
  [void]$sb.AppendLine("  `"$($m.file)`": asset(`"$($m.file)`", $altJson),")
}

[void]$sb.AppendLine("};")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("export function getArt(file: string): ArtAsset | undefined {")
[void]$sb.AppendLine("  return artByFile[file];")
[void]$sb.AppendLine("}")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("export function artSrc(file: string): string {")
[void]$sb.AppendLine('  return artByFile[file]?.src ?? `/art/${file}`;')
[void]$sb.AppendLine("}")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("export function artAlt(file: string): string {")
[void]$sb.AppendLine('  return artByFile[file]?.alt ?? "Custom anime portrait artwork";')
[void]$sb.AppendLine("}")
[void]$sb.AppendLine("")

$outPath = Join-Path $root "src\data\art.ts"
[System.IO.File]::WriteAllText($outPath, $sb.ToString())

Write-Host "Copied $copied images to public/art/"
Write-Host "Generated src/data/art.ts with $($manifest.Count) entries"

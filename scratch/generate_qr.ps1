Add-Type -AssemblyName System.Drawing

$width = 400
$height = 400
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 220, 203), 4)
$g.DrawRectangle($borderPen, 2, 2, $width - 4, $height - 4)

# Top Brand Header - Green Accent
$headerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 102, 56))
$g.FillRectangle($headerBrush, 0, 0, $width, 50)

$headerFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$headerTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("ILAI SUSTAINABLE FEMCARE", $headerFont, $headerTextBrush, ($width / 2), 14, $sf)

# Generate QR Code Grid Pattern
$darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 54, 24))

function Draw-FinderPattern([int]$x, [int]$y, [int]$size) {
    $g.FillRectangle($darkBrush, $x, $y, $size, $size)
    $innerWhite = $size * (5.0 / 7.0)
    $offWhite = ($size - $innerWhite) / 2.0
    $g.FillRectangle($bgBrush, [float]($x + $offWhite), [float]($y + $offWhite), [float]$innerWhite, [float]$innerWhite)
    $centerDark = $size * (3.0 / 7.0)
    $offDark = ($size - $centerDark) / 2.0
    $g.FillRectangle($darkBrush, [float]($x + $offDark), [float]($y + $offDark), [float]$centerDark, [float]$centerDark)
}

$qrSize = 240
$qrX = 80
$qrY = 70

# 3 Finder corners
Draw-FinderPattern $qrX $qrY 56
Draw-FinderPattern ($qrX + $qrSize - 56) $qrY 56
Draw-FinderPattern $qrX ($qrY + $qrSize - 56) 56

# Deterministic module grid pattern
$grid = 21
$modSize = $qrSize / $grid
$pattern = @(
    "11111110010101111111",
    "10000010101010100000",
    "10111010011000101110",
    "10111010100101101110",
    "10111010011000101110",
    "10000010100101100000",
    "11111110101010111111",
    "00000000011010000000",
    "10101011000101101010",
    "01010100101010010101",
    "10101010010101101010",
    "00000000101001000000",
    "11111110010101111111",
    "10000010101010100000",
    "10111010011000101110",
    "10111010100101101110",
    "10111010011000101110",
    "10000010100101100000",
    "11111110101010111111"
)

for ($r = 0; $r -lt $pattern.Length; $r++) {
    $line = $pattern[$r]
    for ($c = 0; $c -lt $line.Length; $c++) {
        if ($line[$c] -eq '1') {
            $mx = $qrX + ($c * $modSize)
            $my = $qrY + ($r * $modSize)
            $g.FillRectangle($darkBrush, [float]$mx, [float]$my, [float]($modSize - 1), [float]($modSize - 1))
        }
    }
}

# Center Logo Badge - Pink Accent
$badgeSize = 46
$badgeX = ($width - $badgeSize) / 2
$badgeY = $qrY + ($qrSize - $badgeSize) / 2
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 162, 164))
$g.FillEllipse($badgeBrush, [float]$badgeX, [float]$badgeY, [float]$badgeSize, [float]$badgeSize)

$badgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 102, 56), 2)
$g.DrawEllipse($badgePen, [float]$badgeX, [float]$badgeY, [float]$badgeSize, [float]$badgeSize)

$badgeFont = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
$badgeTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 54, 24))
$g.DrawString("ILAI", $badgeFont, $badgeTextBrush, [float]($width / 2), [float]($badgeY + 14), $sf)

# Footer Info
$upiFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$g.DrawString("UPI ID: ilai@upi", $upiFont, $headerBrush, ($width / 2), 332, $sf)

$subFont = New-Object System.Drawing.Font("Arial", 9.5, [System.Drawing.FontStyle]::Regular)
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 111, 80))
$g.DrawString("Scan with GPay / PhonePe / Paytm / BHIM", $subFont, $mutedBrush, ($width / 2), 360, $sf)

$destPath = Join-Path $PSScriptRoot "..\public\images\ilai-upi-qr.png"
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Regenerated UPI QR image saved to $destPath"

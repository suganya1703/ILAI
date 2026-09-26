Add-Type -AssemblyName System.Drawing
$imagePath = Join-Path $PSScriptRoot "..\public\images\ilai-logo.png"
$bmp = New-Object System.Drawing.Bitmap($imagePath)
Write-Host "Size: $($bmp.Width) x $($bmp.Height)"

# Top-left pixel
$p0 = $bmp.GetPixel(0, 0)
$bgHex = '#{0:X2}{1:X2}{2:X2}' -f $p0.R, $p0.G, $p0.B
Write-Host "Top-left pixel (0,0): $bgHex (R=$($p0.R), G=$($p0.G), B=$($p0.B))"

# Sample across regions to identify green, blush/pink accent, background
$colors = @{}
$greens = @{}
$pinks = @{}

for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $p = $bmp.GetPixel($x, $y)
        $hex = '#{0:X2}{1:X2}{2:X2}' -f $p.R, $p.G, $p.B
        if ($colors.ContainsKey($hex)) {
            $colors[$hex]++
        } else {
            $colors[$hex] = 1
        }
        
        # Check for green shades (G > R and G > B)
        if ($p.G -gt $p.R + 15 -and $p.G -gt $p.B + 15) {
            if ($greens.ContainsKey($hex)) { $greens[$hex]++ } else { $greens[$hex] = 1 }
        }
        
        # Check for pink/blush/reddish shades (R > G + 15 and R > B)
        if ($p.R -gt $p.G + 15 -and $p.R -gt $p.B + 10) {
            if ($pinks.ContainsKey($hex)) { $pinks[$hex]++ } else { $pinks[$hex] = 1 }
        }
    }
}

Write-Host "`nTop 15 Most Frequent Colors:"
$colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15 | ForEach-Object {
    Write-Host "  $($_.Key) : $($_.Value)"
}

Write-Host "`nTop 10 Main Green Shades:"
$greens.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | ForEach-Object {
    Write-Host "  $($_.Key) : $($_.Value)"
}

Write-Host "`nTop 10 Pink/Blush/Accent Shades (if any):"
$pinks.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | ForEach-Object {
    Write-Host "  $($_.Key) : $($_.Value)"
}

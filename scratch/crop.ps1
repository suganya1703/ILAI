Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\public\images\ilai-logo.png"
$destPath = Join-Path $PSScriptRoot "..\public\images\ilai-icon.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image dimensions: $($src.Width) x $($src.Height)"

# The girl face illustration is centered in the upper portion of the logo image.
# Let's crop a square region surrounding the illustration.
# Top illustration occupies around y: 14% to 54%, x: 23% to 75% roughly.
$cropX = [int]($src.Width * 0.27)
$cropY = [int]($src.Height * 0.15)
$cropWidth = [int]($src.Width * 0.46)
$cropHeight = [int]($src.Width * 0.38)

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropWidth, $cropHeight)
$target = New-Object System.Drawing.Bitmap($cropWidth, $cropHeight)
$g = [System.Drawing.Graphics]::FromImage($target)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$target.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$target.Dispose()
$src.Dispose()
Write-Host "Successfully saved cropped icon to $destPath"

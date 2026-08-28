param([string]$OutputDirectory = (Join-Path $PSScriptRoot '..\static'))

Add-Type -AssemblyName System.Drawing

foreach ($size in @(192, 512)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(51, 54, 58))

  $font = [System.Drawing.Font]::new('Segoe UI Semibold', [single]($size * 0.48), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $graphics.DrawString('A', $font, $brush, [System.Drawing.RectangleF]::new(0, -$size * 0.04, $size, $size), $format)

  $accent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 153, 51))
  $graphics.FillRectangle($accent, [single]($size * 0.29), [single]($size * 0.76), [single]($size * 0.42), [single]($size * 0.035))

  $path = Join-Path $OutputDirectory "pwa-$size.png"
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $accent.Dispose()
  $brush.Dispose()
  $font.Dispose()
  $format.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

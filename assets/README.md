Place your Windows icon here as `icon.ico`.

Instructions to convert the attached image to a Windows .ico file (recommended sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16):

1) Using ImageMagick (PowerShell, if ImageMagick is installed):

```powershell
magick convert input.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico
```

2) Using the `png-to-ico` npm package (if you prefer Node):

```powershell
npm install -g png-to-ico
png-to-ico input.png > assets/icon.ico
```

3) Or use any online PNG -> ICO converter and save the file as `assets/icon.ico`.

After placing `assets/icon.ico`, rebuild the installer:

```powershell
npm run electron:build
```

If you'd like, upload the PNG here (or drag it into the repository) and I can convert it and place `assets/icon.ico` for you.